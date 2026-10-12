from django.shortcuts import render, get_object_or_404, redirect
from django.db.models import Q, F, Case, When, DecimalField, Min, Max
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import Category, Product, Order, OrderItem, UserProfile

def home(request, category_slug=None):
    category = None
    categories = Category.objects.all()
    
    # Baza bo'yicha hisoblangan narx (chegirma bo'lsa chegirma narxi, aks holda oddiy narx)
    effective_price_expr = Case(
        When(discount_price__isnull=False, discount_price__lt=F('price'), then=F('discount_price')),
        default=F('price'),
        output_field=DecimalField(max_digits=12, decimal_places=2)
    )
    
    products = Product.objects.filter(is_available=True).annotate(
        effective_price=effective_price_expr
    )

    # 1. Qidiruv tizimi
    query = request.GET.get('q', '').strip()
    if query:
        products = products.filter(
            Q(name__icontains=query) |
            Q(brand__icontains=query) |
            Q(description__icontains=query) |
            Q(specs__icontains=query)
        )

    # 2. Kategoriya filtri
    cat_param = request.GET.get('cat', '')
    active_slug = category_slug or cat_param
    if active_slug:
        category = get_object_or_404(Category, slug=active_slug)
        products = products.filter(category=category)

    # 3. Brendlar filtri
    selected_brands = request.GET.getlist('brand')
    if selected_brands:
        products = products.filter(brand__in=selected_brands)

    # 4. Narx filtri (Min va Max)
    min_price = request.GET.get('min_price', '').strip()
    max_price = request.GET.get('max_price', '').strip()
    if min_price and min_price.isdigit():
        products = products.filter(effective_price__gte=float(min_price))
    if max_price and max_price.isdigit():
        products = products.filter(effective_price__lte=float(max_price))

    # 5. Faqat mavjudlar va chegirmadagilar
    in_stock = request.GET.get('in_stock') == '1'
    if in_stock:
        products = products.filter(stock__gt=0)

    discount_only = request.GET.get('discount') == '1'
    if discount_only:
        products = products.filter(discount_price__isnull=False, discount_price__lt=F('price'))

    # 6. Saralash (Sorting)
    sort = request.GET.get('sort', 'newest')
    if sort == 'price_asc':
        products = products.order_by('effective_price')
    elif sort == 'price_desc':
        products = products.order_by('-effective_price')
    elif sort == 'name_asc':
        products = products.order_by('name')
    elif sort == 'popular':
        products = products.order_by('-reviews_count', '-created_at')
    else:  # newest
        products = products.order_by('-created_at')

    # Mavjud barcha brendlar
    available_brands = Product.objects.filter(is_available=True)\
        .exclude(brand__isnull=True)\
        .exclude(brand='')\
        .values_list('brand', flat=True)\
        .distinct()

    # Narx chegaralari
    price_stats = Product.objects.filter(is_available=True).aggregate(
        min_p=Min('price'),
        max_p=Max('price')
    )

    context = {
        'category': category,
        'categories': categories,
        'products': products,
        'query': query,
        'selected_brands': selected_brands,
        'available_brands': available_brands,
        'min_price': min_price,
        'max_price': max_price,
        'in_stock': in_stock,
        'discount_only': discount_only,
        'sort': sort,
        'price_stats': price_stats,
    }
    return render(request, 'home.html', context)


def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug, is_available=True)
    related_products = Product.objects.filter(category=product.category).exclude(id=product.id)[:4]
    
    context = {
        'product': product,
        'related_products': related_products,
    }
    return render(request, 'detail.html', context)


def cart_add(request, product_id):
    """Savatga mahsulot qo'shish yoki miqdorini 1 taga oshirish"""
    product = get_object_or_404(Product, id=product_id, is_available=True)
    cart = request.session.get('cart', {})
    key = str(product_id)

    current_qty = cart.get(key, 0)
    if product.stock <= 0:
        messages.error(request, f"Kechirasiz, '{product.name}' omborda mavjud emas.")
    elif current_qty >= product.stock:
        messages.warning(request, f"Kechirasiz, omborda faqat {product.stock} dona '{product.name}' mavjud.")
    else:
        cart[key] = current_qty + 1
        request.session['cart'] = cart
        request.session.modified = True
        messages.success(request, f"'{product.name}' savatchaga muvaffaqiyatli qo'shildi!")

    referer = request.META.get('HTTP_REFERER')
    if referer and 'cart' not in referer and 'checkout' not in referer:
        return redirect(referer)
    return redirect('store:cart_detail')


def cart_remove(request, product_id):
    """Savatdagi mahsulot miqdorini 1 taga kamaytirish"""
    cart = request.session.get('cart', {})
    key = str(product_id)

    if key in cart:
        if cart[key] > 1:
            cart[key] -= 1
        else:
            del cart[key]
        request.session['cart'] = cart
        request.session.modified = True

    referer = request.META.get('HTTP_REFERER')
    if referer:
        return redirect(referer)
    return redirect('store:cart_detail')


def cart_delete(request, product_id):
    """Mahsulotni savatdan butunlay olib tashlash"""
    product = get_object_or_404(Product, id=product_id)
    cart = request.session.get('cart', {})
    key = str(product_id)

    if key in cart:
        del cart[key]
        request.session['cart'] = cart
        request.session.modified = True
        messages.info(request, f"'{product.name}' savatchadan o'chirildi.")

    return redirect('store:cart_detail')


def cart_detail(request):
    """Savat sahifasi va undagi tovarlar ro'yxati"""
    cart = request.session.get('cart', {})
    cart_items = []
    total_price = 0

    if cart:
        product_ids = [int(pid) for pid in cart.keys() if pid.isdigit()]
        products = Product.objects.filter(id__in=product_ids)
        product_map = {product.id: product for product in products}

        cleaned_cart = {}
        for pid_str, qty in cart.items():
            if not pid_str.isdigit():
                continue
            pid = int(pid_str)
            product = product_map.get(pid)
            if product and product.is_available:
                valid_qty = min(qty, product.stock) if product.stock > 0 else 0
                if valid_qty > 0:
                    cleaned_cart[str(pid)] = valid_qty
                    item_total = product.current_price * valid_qty
                    total_price += item_total
                    cart_items.append({
                        'product': product,
                        'quantity': valid_qty,
                        'total_price': item_total,
                    })

        if cleaned_cart != cart:
            request.session['cart'] = cleaned_cart
            request.session.modified = True

    # Agar foydalanuvchi tizimga kirgan bo'lsa, uning ma'lumotlarini oldindan to'ldirish
    user_data = {}
    if request.user.is_authenticated:
        user_data['full_name'] = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username
        profile = getattr(request.user, 'profile', None)
        if profile:
            user_data['phone'] = profile.phone or ''
            user_data['address'] = profile.address or ''

    context = {
        'cart_items': cart_items,
        'total_price': total_price,
        'user_data': user_data,
    }
    return render(request, 'cart.html', context)


def checkout(request):
    """Buyurtma rasmiylashtirish va to'lov tizimiga yo'naltirish"""
    cart = request.session.get('cart', {})
    if not cart:
        messages.warning(request, "Savatchangiz bo'sh. Iltimos, avval tovar tanlang.")
        return redirect('store:home')

    if request.method == 'POST':
        full_name = request.POST.get('full_name', '').strip()
        phone = request.POST.get('phone', '').strip()
        address = request.POST.get('address', '').strip()
        comment = request.POST.get('comment', '').strip()
        payment_method = request.POST.get('payment_method', 'cash').strip()

        if not full_name or not phone or not address:
            messages.error(request, "Iltimos, barcha majburiy maydonlarni to'ldiring!")
            return redirect('store:cart_detail')

        product_ids = [int(pid) for pid in cart.keys() if pid.isdigit()]
        products = Product.objects.filter(id__in=product_ids, is_available=True)
        product_map = {product.id: product for product in products}

        if not product_map:
            messages.error(request, "Savatchangizdagi mahsulotlar hozirda mavjud emas.")
            request.session['cart'] = {}
            request.session.modified = True
            return redirect('store:home')

        # Jami summa va buyurtma elementlarini tayyorlash
        total_price = 0
        order_items_data = []
        for pid_str, qty in cart.items():
            if not pid_str.isdigit():
                continue
            pid = int(pid_str)
            product = product_map.get(pid)
            if product:
                item_qty = min(qty, product.stock) if product.stock > 0 else qty
                total_price += product.current_price * item_qty
                order_items_data.append((product, product.current_price, item_qty))

        # Foydalanuvchini bog'lash
        user = request.user if request.user.is_authenticated else None

        # Yangi buyurtma yaratish
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

        # Agar foydalanuvchi tizimga kirgan bo'lsa va profilida ma'lumotlar yo'q bo'lsa, to'ldirib qo'yish
        if user:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            if not profile.phone:
                profile.phone = phone
            if not profile.address:
                profile.address = address
            profile.save()

        # Buyurtma tovarlarini saqlash va ombordagi sonini kamaytirish
        for product, price, qty in order_items_data:
            OrderItem.objects.create(
                order=order,
                product=product,
                price=price,
                quantity=qty
            )
            if product.stock >= qty:
                product.stock -= qty
                product.save()

        # Savatni tozalash
        request.session['cart'] = {}
        request.session.modified = True

        # Onlayn to'lov tanlangan bo'lsa (Click, Payme, Uzum Bank), to'lov oynasiga o'tkazish
        if payment_method in ['click', 'payme', 'uzum']:
            return redirect('store:order_pay', order_id=order.id)

        messages.success(request, f"Buyurtmangiz #{order.id} muvaffaqiyatli qabul qilindi!")
        return redirect('store:order_success', order_id=order.id)

    return redirect('store:cart_detail')


def order_pay(request, order_id):
    """Click, Payme va Uzum orqali interaktiv to'lov amalga oshirish sahifasi"""
    order = get_object_or_404(Order, id=order_id)

    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'confirm_payment':
            card_number = request.POST.get('card_number', '').replace(' ', '').strip()
            if len(card_number) >= 16:
                order.card_pan = f"{card_number[:4]} **** **** {card_number[-4:]}"
            elif card_number:
                order.card_pan = f"{card_number[:4]} **** {card_number[-4:]}" if len(card_number) > 8 else card_number
            else:
                order.card_pan = "8600 **** **** 8888"

            order.payment_status = 'paid'
            order.status = 'confirmed'
            order.save()
            messages.success(request, f"To'lov muvaffaqiyatli qabul qilindi! Buyurtma #{order.id} to'landi va tasdiqlandi.")
            return redirect('store:order_success', order_id=order.id)
        elif action == 'switch_to_cash':
            order.payment_method = 'cash'
            order.save()
            messages.info(request, f"Buyurtma #{order.id} uchun to'lov usuli 'Yetkazilganda naqd' ga o'zgartirildi.")
            return redirect('store:order_success', order_id=order.id)

    context = {
        'order': order,
    }
    return render(request, 'order_pay.html', context)



def order_success(request, order_id):
    """Buyurtma muvaffaqiyatli yakunlangani sahifasi"""
    order = get_object_or_404(Order, id=order_id)
    return render(request, 'order_success.html', {'order': order})


# --- FOYDALANUVCHILAR TIZIMI (AUTH & PROFILE) ---

def user_register(request):
    """Yangi foydalanuvchini ro'yxatdan o'tkazish"""
    if request.user.is_authenticated:
        return redirect('store:profile')

    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        first_name = request.POST.get('first_name', '').strip()
        last_name = request.POST.get('last_name', '').strip()
        phone = request.POST.get('phone', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirm_password', '')

        if not username or not password:
            messages.error(request, "Foydalanuvchi nomi va parol kiritilishi shart!")
            return render(request, 'auth/register.html')

        if password != confirm_password:
            messages.error(request, "Parollar bir xil emas, tekshirib qayta kiriting!")
            return render(request, 'auth/register.html', {
                'username': username, 'first_name': first_name, 'last_name': last_name, 'phone': phone, 'email': email
            })

        if len(password) < 4:
            messages.error(request, "Parol kamida 4 ta belgidan iborat bo'lishi kerak!")
            return render(request, 'auth/register.html', {
                'username': username, 'first_name': first_name, 'last_name': last_name, 'phone': phone, 'email': email
            })

        if User.objects.filter(username=username).exists():
            messages.error(request, f"'{username}' nomli foydalanuvchi allaqachon mavjud! Boshqa nom tanlang.")
            return render(request, 'auth/register.html', {
                'first_name': first_name, 'last_name': last_name, 'phone': phone, 'email': email
            })

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        UserProfile.objects.create(user=user, phone=phone)

        login(request, user)
        messages.success(request, f"Xush kelibsiz, {user.first_name or user.username}! Profilingiz yaratildi.")
        return redirect('store:profile')

    return render(request, 'auth/register.html')


def user_login(request):
    """Tizimga kirish (username yoki telefon orqali)"""
    if request.user.is_authenticated:
        return redirect('store:profile')

    if request.method == 'POST':
        login_input = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')

        user = authenticate(request, username=login_input, password=password)
        if user is None:
            # Telefon raqami orqali ham tekshirib ko'rish
            profile = UserProfile.objects.filter(phone=login_input).first()
            if profile:
                user = authenticate(request, username=profile.user.username, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, f"Xush kelibsiz, {user.first_name or user.username}!")
            next_url = request.GET.get('next') or request.POST.get('next')
            if next_url:
                return redirect(next_url)
            return redirect('store:profile')
        else:
            messages.error(request, "Login yoki parol noto'g'ri!")

    return render(request, 'auth/login.html')


def user_logout(request):
    """Tizimdan chiqish"""
    logout(request)
    messages.info(request, "Tizimdan muvaffaqiyatli chiqdingiz.")
    return redirect('store:home')


@login_required(login_url='store:login')
def user_profile(request):
    """Foydalanuvchi shaxsiy kabineti va buyurtmalar tarixi"""
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        first_name = request.POST.get('first_name', '').strip()
        last_name = request.POST.get('last_name', '').strip()
        email = request.POST.get('email', '').strip()
        phone = request.POST.get('phone', '').strip()
        address = request.POST.get('address', '').strip()

        request.user.first_name = first_name
        request.user.last_name = last_name
        request.user.email = email
        request.user.save()

        profile.phone = phone
        profile.address = address
        profile.save()

        messages.success(request, "Ma'lumotlaringiz muvaffaqiyatli yangilandi!")
        return redirect('store:profile')

    user_orders = Order.objects.filter(user=request.user).prefetch_related('items__product').order_by('-created_at')

    context = {
        'profile': profile,
        'orders': user_orders,
    }
    return render(request, 'auth/profile.html', context)



def setup_images(request):
    """Mahsulotlar va toifalarga chiroyli sifatli haqiqiy rasmlarni o'rnatish"""
    import os
    import urllib.request
    from django.http import JsonResponse
    from django.core.files.base import ContentFile

    brain_dir = r"C:\Users\Victus\.gemini\antigravity-ide\brain\bf7fab8c-4db3-4aec-8916-37cf39b0ca2c"
    
    # Sun'iy intellekt tomonidan maxsus generatsiya qilingan fotorealistik rasmlar
    generated = {
        'iphone-15-pro-max-256gb': os.path.join(brain_dir, "iphone_15_pro_1791393835295.jpg"),
        'samsung-galaxy-s24-ultra-512gb': os.path.join(brain_dir, "samsung_s24_ultra_1791393862100.jpg"),
        'macbook-air-15-m3-16gb-512gb': os.path.join(brain_dir, "macbook_air_m3_1791393892201.jpg"),
    }
    
    # Yuqori sifatli rasmiy/studiyaviy gadjetlar rasmlari
    online_images = {
        'xiaomi-14-ultra-512gb': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
        'asus-rog-zephyrus-g16-oled': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
        'lenovo-legion-pro-5-16': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
        'airpods-pro-2-usb-c': 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
        'sony-wh-1000xm5-black': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        'marshall-major-iv-black': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
        'apple-watch-series-9-45mm': 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
        'samsung-galaxy-watch-6-classic-47mm': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    }

    # Toifalar rasmlari
    category_images = {
        'smartfonlar': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
        'noutbuklar': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
        'quloqchinlar': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        'aqlli-soatlar': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    }

    updated = []

    # 1. AI generatsiya qilgan fayllarni yuklash
    for slug, path in generated.items():
        if os.path.exists(path):
            product = Product.objects.filter(slug=slug).first()
            if product:
                with open(path, 'rb') as f:
                    product.image.save(f"{slug}.jpg", ContentFile(f.read()), save=True)
                updated.append(slug)

    # 2. Onlayn haqiqiy fotolarni yuklash
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    for slug, url in online_images.items():
        product = Product.objects.filter(slug=slug).first()
        if product:
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=12) as response:
                    content = response.read()
                    product.image.save(f"{slug}.jpg", ContentFile(content), save=True)
                    updated.append(slug)
            except Exception:
                pass

    # 3. Kategoriya rasmlarini o'rnatish
    for slug, url in category_images.items():
        cat = Category.objects.filter(slug=slug).first()
        if cat:
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=12) as response:
                    content = response.read()
                    cat.image.save(f"{slug}.jpg", ContentFile(content), save=True)
            except Exception:
                pass

    return JsonResponse({'status': 'ok', 'updated': updated})


def robots_txt(request):
    """Qidiruv robotlari (Googlebot, Yandex) uchun robots.txt fayli"""
    from django.http import HttpResponse
    lines = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin/",
        "Disallow: /cart/",
        "Disallow: /checkout/",
        "Disallow: /order/pay/",
        f"Sitemap: {request.build_absolute_uri('/sitemap.xml')}",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")


def sitemap_xml(request):
    """Google qidiruv tizimi barcha sahifalarni tez topishi uchun dinamik sitemap.xml"""
    from django.http import HttpResponse
    base_url = request.build_absolute_uri('/')[:-1]
    products = Product.objects.filter(is_available=True)
    categories = Category.objects.all()

    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        f'  <url><loc>{base_url}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>',
    ]

    for cat in categories:
        xml_lines.append(f'  <url><loc>{base_url}/category/{cat.slug}/</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>')

    for prod in products:
        xml_lines.append(f'  <url><loc>{base_url}/product/{prod.slug}/</loc><changefreq>daily</changefreq><priority>0.9</priority></url>')

    xml_lines.append('</urlset>')
    return HttpResponse("\n".join(xml_lines), content_type="application/xml")