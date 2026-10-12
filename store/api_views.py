import random
import string
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Q, F, Case, When, DecimalField, Min, Max
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Category, Product, Order, OrderItem, UserProfile, OTPCode
from .serializers import (
    CategorySerializer, ProductSerializer, OrderSerializer, UserSerializer
)
from .sms_service import send_otp_sms, send_order_sms
from .telegram_service import (
    send_order_telegram_notification,
    send_order_status_update_telegram,
    handle_telegram_callback,
    _get_bot_url,
)

class CategoryListAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True, context={'request': request})
        return Response(serializer.data)


class ProductListAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        effective_price_expr = Case(
            When(discount_price__isnull=False, discount_price__lt=F('price'), then=F('discount_price')),
            default=F('price'),
            output_field=DecimalField(max_digits=12, decimal_places=2)
        )
        products = Product.objects.filter(is_available=True).annotate(
            effective_price=effective_price_expr
        )

        # 1. Qidiruv (q)
        query = request.GET.get('q', '').strip()
        if query:
            products = products.filter(
                Q(name__icontains=query) |
                Q(brand__icontains=query) |
                Q(description__icontains=query) |
                Q(specs__icontains=query)
            )

        # 2. Kategoriya (category_slug yoki cat)
        category_slug = request.GET.get('category') or request.GET.get('cat')
        if category_slug:
            products = products.filter(category__slug=category_slug)

        # 3. Brend filtri
        brands = request.GET.getlist('brand')
        if not brands and request.GET.get('brand'):
            brands = request.GET.get('brand').split(',')
        if brands:
            products = products.filter(brand__in=brands)

        # 4. Narx filtri
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        if min_price and min_price.isdigit():
            products = products.filter(effective_price__gte=float(min_price))
        if max_price and max_price.isdigit():
            products = products.filter(effective_price__lte=float(max_price))

        # 5. Mavjudlar va chegirmalar
        if request.GET.get('in_stock') in ['1', 'true']:
            products = products.filter(stock__gt=0)
        if request.GET.get('discount') in ['1', 'true']:
            products = products.filter(discount_price__isnull=False, discount_price__lt=F('price'))

        # 6. Saralash (sort)
        sort = request.GET.get('sort', 'newest')
        if sort == 'price_asc':
            products = products.order_by('effective_price')
        elif sort == 'price_desc':
            products = products.order_by('-effective_price')
        elif sort == 'name_asc':
            products = products.order_by('name')
        elif sort == 'popular':
            products = products.order_by('-reviews_count', '-created_at')
        else:
            products = products.order_by('-created_at')

        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)


class ProductDetailAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        product = get_object_or_404(Product, slug=slug, is_available=True)
        related = Product.objects.filter(category=product.category).exclude(id=product.id)[:4]
        
        serializer = ProductSerializer(product, context={'request': request})
        related_serializer = ProductSerializer(related, many=True, context={'request': request})
        
        return Response({
            'product': serializer.data,
            'related': related_serializer.data,
        })


class StoreMetaAPIView(APIView):
    """Kategoriyalar, brendlar va narx oraliqlari statistikasi"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        brands = (
            Product.objects.filter(is_available=True)
            .exclude(brand__isnull=True)
            .exclude(brand='')
            .values_list('brand', flat=True)
            .distinct()
        )
        price_stats = Product.objects.filter(is_available=True).aggregate(
            min_price=Min('price'),
            max_price=Max('price')
        )
        categories = Category.objects.all()
        cat_serializer = CategorySerializer(categories, many=True, context={'request': request})

        return Response({
            'brands': sorted(list(set(b for b in brands if b))),
            'price_stats': price_stats,
            'categories': cat_serializer.data
        })


class CheckoutAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        full_name = data.get('full_name', '').strip()
        phone = data.get('phone', '').strip()
        address = data.get('address', '').strip()
        comment = data.get('comment', '').strip()
        payment_method = data.get('payment_method', 'cash')
        items_input = data.get('items', [])

        if not full_name or not phone or not address:
            return Response({'error': "Ism, telefon va yetkazib berish manzili to'ldirilishi shart!"}, status=status.HTTP_400_BAD_REQUEST)

        if not items_input:
            return Response({'error': "Savatchangiz bo'sh!"}, status=status.HTTP_400_BAD_REQUEST)

        # IDlar bo'yicha tovarlarni yig'ish
        product_ids = [item.get('id') for item in items_input if item.get('id')]
        products = Product.objects.filter(id__in=product_ids, is_available=True)
        product_map = {p.id: p for p in products}

        if not product_map:
            return Response({'error': "Tanlangan mahsulotlar hozirda mavjud emas!"}, status=status.HTTP_400_BAD_REQUEST)

        total_price = 0
        order_items_to_create = []

        for item in items_input:
            pid = item.get('id')
            qty = max(1, int(item.get('quantity', 1)))
            product = product_map.get(pid)
            if product:
                item_qty = min(qty, product.stock) if product.stock > 0 else qty
                item_total = product.current_price * item_qty
                total_price += item_total
                order_items_to_create.append((product, product.current_price, item_qty))

        try:
            delivery_fee = Decimal(str(request.data.get('delivery_fee', 0)))
        except Exception:
            delivery_fee = Decimal(0)
        total_price += max(Decimal(0), delivery_fee)

        user = request.user if request.user.is_authenticated else None

        order = Order.objects.create(
            user=user,
            full_name=full_name,
            phone=phone,
            address=address,
            comment=comment,
            total_price=total_price,
            payment_method=payment_method,
            payment_status='pending',
            status='new'
        )

        if user:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            if not profile.phone:
                profile.phone = phone
            if not profile.address:
                profile.address = address
            profile.save()

        for product, price, qty in order_items_to_create:
            OrderItem.objects.create(
                order=order,
                product=product,
                price=price,
                quantity=qty
            )
            if product.stock >= qty:
                product.stock -= qty
                product.save()

        serializer = OrderSerializer(order, context={'request': request})

        # Buyurtma tasdiqlash SMSini yuborish (background)
        try:
            send_order_sms(phone, order.id, full_name, order.total_price)
        except Exception:
            pass  # SMS xatoligi buyurtmani to'xtatmasin

        # Telegram admin guruhiga yangi buyurtma bildirishnomasi
        try:
            send_order_telegram_notification(order)
        except Exception:
            pass

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderDetailAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        order = get_object_or_404(Order, id=pk)
        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data)


class OrderPayAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        order = get_object_or_404(Order, id=pk)
        action = request.data.get('action', 'confirm_payment')

        if action == 'confirm_payment':
            card_number = str(request.data.get('card_number', '')).replace(' ', '').strip()
            if len(card_number) >= 16:
                order.card_pan = f"{card_number[:4]} **** **** {card_number[-4:]}"
            elif card_number:
                order.card_pan = f"{card_number[:4]} **** {card_number[-4:]}"
            else:
                order.card_pan = "8600 **** **** 8888"

            order.payment_status = 'paid'
            order.status = 'confirmed'
            order.save()

            # Telegram guruhga to'lov qabul qilinganligi haqida xabar
            try:
                send_order_status_update_telegram(order)
            except Exception:
                pass

            return Response({
                'message': f"To'lov muvaffaqiyatli qabul qilindi!",
                'order': OrderSerializer(order, context={'request': request}).data
            })
        elif action == 'switch_to_cash':
            order.payment_method = 'cash'
            order.save()

            # Telegram guruhga holat yangilangani haqida xabar
            try:
                send_order_status_update_telegram(order)
            except Exception:
                pass

            return Response({
                'message': "To'lov usuli naqdga o'zgartirildi.",
                'order': OrderSerializer(order, context={'request': request}).data
            })

        return Response({'error': "Noto'g'ri amal!"}, status=status.HTTP_400_BAD_REQUEST)


class AuthMeAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user)
            return Response({
                'authenticated': True,
                'user': serializer.data
            })
        return Response({'authenticated': False, 'user': None})

    def put(self, request):
        if not request.user.is_authenticated:
            return Response({'error': "Avtorizatsiyadan o'tilmagan"}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = request.user
        data = request.data
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if 'phone' in data:
            profile.phone = data['phone']
        if 'address' in data:
            profile.address = data['address']
        profile.save()

        return Response({
            'message': "Profil muvaffaqiyatli yangilandi",
            'user': UserSerializer(user).data
        })


class AuthRegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        username = data.get('username', '').strip()
        password = data.get('password', '')
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        phone = data.get('phone', '').strip()
        email = data.get('email', '').strip()

        if not username or not password:
            return Response({'error': "Login va parol kiritilishi shart!"}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 4:
            return Response({'error': "Parol kamida 4 ta belgidan iborat bo'lishi kerak!"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': f"'{username}' foydalanuvchisi allaqachon mavjud!"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        UserProfile.objects.create(user=user, phone=phone)
        login(request, user)

        return Response({
            'message': "Ro'yxatdan o'tish muvaffaqiyatli yakunlandi!",
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class AuthLoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        login_input = data.get('username', '').strip()
        password = data.get('password', '')

        user = authenticate(request, username=login_input, password=password)
        if user is None:
            profile = UserProfile.objects.filter(phone=login_input).first()
            if profile:
                user = authenticate(request, username=profile.user.username, password=password)

        if user is not None:
            login(request, user)
            return Response({
                'message': "Tizimga muvaffaqiyatli kirildi!",
                'user': UserSerializer(user).data
            })
        return Response({'error': "Login yoki parol noto'g'ri!"}, status=status.HTTP_401_UNAUTHORIZED)


class AuthLogoutAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logout(request)
        return Response({'message': "Tizimdan chiqildi."})


class UserOrdersAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response([], status=status.HTTP_200_OK)
        orders = Order.objects.filter(user=request.user).prefetch_related('items__product').order_by('-created_at')
        serializer = OrderSerializer(orders, many=True, context={'request': request})
        return Response(serializer.data)


# ══════════════════════════════════════════════════════════════════
# SMS OTP TIZIMI
# ══════════════════════════════════════════════════════════════════

class OTPSendAPIView(APIView):
    """POST /api/otp/send/ → { "phone": "+998901234567" }"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get('phone', '').strip()
        if not phone:
            return Response({'error': "Telefon raqam kiritilmagan!"}, status=400)

        # Spam himoya: 1 daqiqa ichida qayta yuborish mumkin emas
        recent = OTPCode.objects.filter(
            phone=phone,
            created_at__gte=timezone.now() - timedelta(minutes=1),
            is_used=False,
        ).exists()
        if recent:
            return Response({
                'error': "OTP kodi allaqachon yuborilgan. 1 daqiqa kuting.",
                'wait_seconds': 60,
            }, status=429)

        # Eski OTPlarni o'chirish
        OTPCode.objects.filter(phone=phone, is_used=False).delete()

        # Yangi 6 xonali kod generatsiya
        code = ''.join(random.choices(string.digits, k=6))
        expires_at = timezone.now() + timedelta(minutes=5)
        otp = OTPCode.objects.create(phone=phone, code=code, expires_at=expires_at)

        # SMS yuborish
        result = send_otp_sms(phone, code)

        if result['success']:
            resp_payload = {
                'success': True,
                'message': f"OTP kodi {phone} raqamiga yuborildi.",
                'expires_in': 300,
            }
            if result.get('is_dev'):
                resp_payload['dev_code'] = code
                resp_payload['message'] = f"Test rejimi: Tasdiqlash kodi terminalda yoki quyida: {code}"
            return Response(resp_payload)
        else:
            otp.delete()
            return Response({
                'success': False,
                'error': result.get('error', "SMS yuborishda xatolik."),
            }, status=503)


class OTPVerifyAPIView(APIView):
    """POST /api/otp/verify/ → { "phone": "+998901234567", "code": "123456" }"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get('phone', '').strip()
        code = request.data.get('code', '').strip()

        if not phone or not code:
            return Response({'error': "Telefon va kod kiritilmagan!"}, status=400)

        otp = OTPCode.objects.filter(
            phone=phone, is_used=False
        ).order_by('-created_at').first()

        if not otp:
            return Response({'error': "Bu raqam uchun OTP kodi topilmadi. Qayta yuboring."}, status=404)

        if otp.expires_at <= timezone.now():
            otp.delete()
            return Response({'error': "OTP kodining muddati tugagan. Qayta yuboring."}, status=400)

        if otp.attempts >= 3:
            otp.delete()
            return Response({'error': "Juda ko'p noto'g'ri urinish. Qayta yuboring."}, status=429)

        otp.attempts += 1
        if otp.code != code:
            otp.save()
            remaining = 3 - otp.attempts
            return Response({
                'error': f"Noto'g'ri kod. Yana {remaining} ta urinish qoldi.",
                'remaining_attempts': remaining,
            }, status=400)

        # ✅ Tasdiqlandi
        otp.is_used = True
        otp.save()

        return Response({
            'success': True,
            'message': "Telefon raqam muvaffaqiyatli tasdiqlandi!",
            'verified_phone': phone,
        })


class TelegramWebhookAPIView(APIView):
    """
    Telegram bot webhook endpoint.
    Telegramdan kelgan callback_query va xabarlarni qabul qilib ishlaydi.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        if not data or not isinstance(data, dict):
            return Response({'ok': True})

        # 1. Inline tugma bosilganda (callback_query)
        if 'callback_query' in data:
            cb = data['callback_query']
            callback_data = cb.get('data', '')
            callback_id = cb.get('id', '')
            msg = cb.get('message', {})
            message_id = msg.get('message_id')
            chat_id = msg.get('chat', {}).get('id')

            if callback_data and callback_id and message_id and chat_id:
                handle_telegram_callback(callback_data, callback_id, message_id, chat_id)
            return Response({'ok': True})

        # 2. Xabar yoki buyruq kelganda (/start)
        if 'message' in data:
            msg = data['message']
            chat = msg.get('chat', {})
            chat_id = chat.get('id')
            text = (msg.get('text') or '').strip()

            if text.startswith('/start') and chat_id:
                welcome_text = (
                    "👋 <b>Assalomu alaykum!</b>\n\n"
                    "Bu <b>ElectroShop</b> do'konining rasmiy admin boti.\n\n"
                    "🛍 Yangi buyurtmalar tushishi bilan shu yerga to'liq ma'lumotlar yuboriladi.\n"
                    "Siz inline tugmalar orqali buyurtmalarni tasdiqlashingiz yoki bekor qilishingiz mumkin.\n\n"
                    f"🆔 Sizning Chat ID: <code>{chat_id}</code>\n\n"
                    "<i>(Ushbu Chat ID ni loyihaning settings.py faylidagi TELEGRAM_ADMIN_CHAT_ID ga yozing)</i>"
                )
                try:
                    import requests
                    requests.post(_get_bot_url("sendMessage"), json={
                        "chat_id": chat_id,
                        "text": welcome_text,
                        "parse_mode": "HTML"
                    }, timeout=10)
                except Exception:
                    pass

        return Response({'ok': True})

