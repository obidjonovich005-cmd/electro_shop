"""
Telegram Bot integratsiyasi xizmati.
Yangi buyurtmalar haqida Telegram admin guruhiga/kanaliga tezkor bildirishnoma yuborish
va inline tugmalar orqali buyurtma holatini Telegramdan turib boshqarish.

Sozlash:
  settings.py ga qo'shing:
    TELEGRAM_BOT_TOKEN = "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
    TELEGRAM_ADMIN_CHAT_ID = "-1001234567890"  # Admin chat_id yoki guruh IDsi
"""

import json
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

STATUS_TRANSLATIONS = {
    'new': '🟡 Yangi',
    'confirmed': '🟢 Tasdiqlangan',
    'delivered': '🚚 Yetkazib berildi',
    'canceled': '🔴 Bekor qilingan',
}

PAYMENT_TRANSLATIONS = {
    'click': 'Click Up',
    'payme': 'Payme',
    'uzum': 'Uzum Bank',
    'cash': 'Naqd / Karta (qabulda)',
}

PAYMENT_STATUS_TRANSLATIONS = {
    'pending': '⏳ Kutilmoqda',
    'paid': '✅ To\'langan',
    'failed': '❌ Bekor qilingan',
}


def _get_bot_url(method: str) -> str:
    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '')
    return f"https://api.telegram.org/bot{token}/{method}"


def build_order_message(order, extra_title=None) -> tuple[str, dict]:
    """Buyurtma ma'lumotlaridan Telegram xabari va tugmalarini tayyorlaydi."""
    title = extra_title or f"🛍 <b>YANGI BUYURTMA #{order.id}</b>"
    
    pay_method = PAYMENT_TRANSLATIONS.get(order.payment_method, order.payment_method)
    pay_status = PAYMENT_STATUS_TRANSLATIONS.get(order.payment_status, order.payment_status)
    status_display = STATUS_TRANSLATIONS.get(order.status, order.status)
    
    # Mahsulotlar ro'yxati
    items_lines = []
    items = order.items.select_related('product').all()
    for idx, item in enumerate(items, 1):
        price_formatted = f"{int(item.price):,}".replace(",", " ")
        items_lines.append(f"  {idx}. <b>{item.product.name}</b> — {item.quantity} dona × {price_formatted} so'm")
    
    items_text = "\n".join(items_lines) if items_lines else "  (Mahsulot topilmadi)"
    total_formatted = f"{int(order.total_price):,}".replace(",", " ")
    
    created_str = order.created_at.strftime("%d.%m.%Y %H:%M") if order.created_at else ""

    text = (
        f"{title}\n"
        f"━━━━━━━━━━━━━━━━━━\n"
        f"👤 <b>Mijoz:</b> {order.full_name}\n"
        f"📞 <b>Telefon:</b> <code>{order.phone}</code>\n"
        f"📍 <b>Manzil:</b> {order.address}\n"
        f"💳 <b>To'lov turi:</b> {pay_method}\n"
        f"📊 <b>To'lov holati:</b> {pay_status}\n"
        f"📦 <b>Buyurtma holati:</b> {status_display}\n"
    )

    if order.comment:
        text += f"📝 <b>Izoh:</b> {order.comment}\n"

    text += (
        f"━━━━━━━━━━━━━━━━━━\n"
        f"🛒 <b>Mahsulotlar:</b>\n"
        f"{items_text}\n"
        f"━━━━━━━━━━━━━━━━━━\n"
        f"💰 <b>Jami summa:</b> <b>{total_formatted} so'm</b>\n"
        f"⏰ <b>Vaqt:</b> {created_str}"
    )

    # Inline boshqaruv tugmalari
    buttons = [
        [
            {"text": "✅ Tasdiqlash", "callback_data": f"status_{order.id}_confirmed"},
            {"text": "🚚 Yetkazildi", "callback_data": f"status_{order.id}_delivered"},
        ],
        [
            {"text": "🔴 Bekor qilish", "callback_data": f"status_{order.id}_canceled"},
            {"text": "🔄 Yangilash", "callback_data": f"status_{order.id}_refresh"},
        ]
    ]

    reply_markup = {"inline_keyboard": buttons}
    return text, reply_markup


def send_order_telegram_notification(order) -> dict:
    """Yangi buyurtma haqida Telegram adminga xabar yuboradi."""
    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '').strip()
    chat_id = getattr(settings, 'TELEGRAM_ADMIN_CHAT_ID', '').strip()

    text, reply_markup = build_order_message(order)

    # Agar token yoki chat_id berilmagan bo'lsa dev rejimida konsolga chiqarish
    if not token or not chat_id or 'your_' in token or 'sizning_' in token:
        try:
            print(f"\n{'='*60}\n[DEV TELEGRAM BILDIRISHNOMA]\nBuyurtma #{order.id} tushdi!\n{text}\n{'='*60}\n")
        except UnicodeEncodeError:
            print(f"\n[DEV TELEGRAM BILDIRISHNOMA] Buyurtma #{order.id} tushdi! (Jami: {order.total_price} so'm)")
        logger.info(f"[DEV TELEGRAM] Buyurtma #{order.id} bildirishnomasi simulyatsiya qilindi.")
        return {"success": True, "is_dev": True}

    try:
        url = _get_bot_url("sendMessage")
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML",
            "reply_markup": reply_markup,
        }
        resp = requests.post(url, json=payload, timeout=10)
        data = resp.json()

        if resp.status_code == 200 and data.get("ok"):
            logger.info(f"Telegram bildirishnoma yuborildi: Buyurtma #{order.id}")
            return {"success": True, "message_id": data["result"]["message_id"]}
        else:
            logger.error(f"Telegram API xatosi: {data}")
            return {"success": False, "error": data.get("description", "Noma'lum xato")}

    except Exception as e:
        logger.error(f"Telegramga xabar yuborishda xatolik: {e}")
        return {"success": False, "error": str(e)}


def send_order_status_update_telegram(order, note="") -> dict:
    """Buyurtma holati o'zgarganda (masalan, to'lov amalga oshirilganda) xabar yuboradi."""
    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '').strip()
    chat_id = getattr(settings, 'TELEGRAM_ADMIN_CHAT_ID', '').strip()

    title = f"💳 <b>BUYURTMA #{order.id} TO'LOVI QABUL QILINDI!</b>" if order.payment_status == 'paid' else f"🔄 <b>BUYURTMA #{order.id} YANGILANDI</b>"
    text, reply_markup = build_order_message(order, extra_title=title)

    if not token or not chat_id or 'your_' in token or 'sizning_' in token:
        try:
            print(f"\n{'='*60}\n[DEV TELEGRAM UPDATE]\n{text}\n{'='*60}\n")
        except UnicodeEncodeError:
            print(f"\n[DEV TELEGRAM UPDATE] Buyurtma #{order.id} yangilandi.")
        return {"success": True, "is_dev": True}

    try:
        url = _get_bot_url("sendMessage")
        resp = requests.post(url, json={
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML",
            "reply_markup": reply_markup,
        }, timeout=10)
        return {"success": resp.status_code == 200}
    except Exception as e:
        logger.error(f"Telegram update xatosi: {e}")
        return {"success": False, "error": str(e)}


def handle_telegram_callback(callback_data: str, callback_id: str, message_id: int, chat_id: int) -> dict:
    """
    Telegram inline tugmasi bosilganda buyurtma holatini yangilaydi
    va xabarni o'zgartiradi (editMessageText).
    """
    from .models import Order

    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '').strip()
    if not token:
        return {"success": False, "error": "Bot token yo'q"}

    # Format: status_<order_id>_<new_status>
    parts = callback_data.split("_")
    if len(parts) < 3 or parts[0] != "status":
        return {"success": False, "error": "Noto'g'ri callback"}

    try:
        order_id = int(parts[1])
        action = parts[2]
    except ValueError:
        return {"success": False, "error": "Noto'g'ri format"}

    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        # Callback query ga javob berish
        _answer_callback(callback_id, "Buyurtma topilmadi!", show_alert=True)
        return {"success": False, "error": "Order topilmadi"}

    alert_text = "Ma'lumot yangilandi!"
    if action in ['confirmed', 'delivered', 'canceled']:
        order.status = action
        order.save()
        status_name = STATUS_TRANSLATIONS.get(action, action)
        alert_text = f"Buyurtma #{order.id} holati o'zgartirildi: {status_name}"

    _answer_callback(callback_id, alert_text)

    # Telegramdagi mavjud xabarni tahrirlash
    new_text, new_markup = build_order_message(order)
    try:
        edit_url = _get_bot_url("editMessageText")
        requests.post(edit_url, json={
            "chat_id": chat_id,
            "message_id": message_id,
            "text": new_text,
            "parse_mode": "HTML",
            "reply_markup": new_markup,
        }, timeout=10)
    except Exception as e:
        logger.error(f"Xabarni tahrirlashda xato: {e}")

    return {"success": True, "order_id": order_id, "status": order.status}


def _answer_callback(callback_id: str, text: str, show_alert: bool = False):
    """Callback query ga javob berish (yuklanish to'xtashi uchun)."""
    try:
        url = _get_bot_url("answerCallbackQuery")
        requests.post(url, json={
            "callback_query_id": callback_id,
            "text": text,
            "show_alert": show_alert,
        }, timeout=5)
    except Exception:
        pass


def get_orders_statistics_text() -> str:
    """Buyurtmalar holati bo'yicha statistikani shakllantiradi."""
    from .models import Order
    from django.db.models import Sum

    total_orders = Order.objects.count()
    new_orders = Order.objects.filter(status='new').count()
    confirmed_orders = Order.objects.filter(status='confirmed').count()
    delivered_orders = Order.objects.filter(status='delivered').count()
    canceled_orders = Order.objects.filter(status='canceled').count()

    total_income = Order.objects.filter(payment_status='paid').aggregate(total=Sum('total_price'))['total'] or 0
    income_formatted = f"{int(total_income):,}".replace(",", " ")

    return (
        "📊 <b>BUYURTMALAR VA SAVDO STATISTIKASI</b>\n"
        "━━━━━━━━━━━━━━━━━━\n"
        f"📦 Jami buyurtmalar: <b>{total_orders} ta</b>\n"
        f"🟡 Yangi: <b>{new_orders} ta</b>\n"
        f"🟢 Tasdiqlangan: <b>{confirmed_orders} ta</b>\n"
        f"🚚 Yetkazib berilgan: <b>{delivered_orders} ta</b>\n"
        f"🔴 Bekor qilingan: <b>{canceled_orders} ta</b>\n"
        "━━━━━━━━━━━━━━━━━━\n"
        f"💰 To'langan umumiy tushum: <b>{income_formatted} so'm</b>"
    )


def get_recent_orders_text(limit=8) -> str:
    """Oxirgi buyurtmalar ro'yxatini shakllantiradi."""
    from .models import Order
    orders = Order.objects.all().order_by('-created_at')[:limit]
    if not orders:
        return "Hozircha do'konda buyurtmalar yo'q."

    lines = ["📋 <b>OXIRGI BUYURTMALAR:</b>\n━━━━━━━━━━━━━━━━━━"]
    for o in orders:
        status_name = STATUS_TRANSLATIONS.get(o.status, o.status)
        total = f"{int(o.total_price):,}".replace(",", " ")
        lines.append(f"• <b>Buyurtma #{o.id}</b> — {o.full_name}\n  Holati: {status_name}\n  Summa: <b>{total} so'm</b> | 📞 {o.phone}")

    return "\n\n".join(lines)


def get_orders_by_status_text(status_key: str, limit=10) -> str:
    """Belgilangan holatdagi buyurtmalar ro'yxatini shakllantiradi."""
    from .models import Order
    status_label = STATUS_TRANSLATIONS.get(status_key, status_key)
    orders = Order.objects.filter(status=status_key).order_by('-created_at')[:limit]
    if not orders:
        return f"Hozirda <b>{status_label}</b> holatidagi buyurtmalar mavjud emas."

    lines = [f"📂 <b>{status_label.upper()} BUYURTMALAR ({orders.count()} ta):</b>\n━━━━━━━━━━━━━━━━━━"]
    for o in orders:
        total = f"{int(o.total_price):,}".replace(",", " ")
        pay_status = PAYMENT_STATUS_TRANSLATIONS.get(o.payment_status, o.payment_status)
        date_str = o.created_at.strftime("%d.%m %H:%M") if o.created_at else ""
        lines.append(
            f"• <b>Buyurtma #{o.id}</b> — {o.full_name}\n"
            f"  💰 <b>{total} so'm</b> ({pay_status})\n"
            f"  📞 <code>{o.phone}</code> | 📍 {o.address[:40]}\n"
            f"  ⏰ {date_str}"
        )
    return "\n\n".join(lines)


ADMIN_REPLY_KEYBOARD = {
    "keyboard": [
        [{"text": "📊 Savdo statistikasi"}, {"text": "📋 Oxirgi buyurtmalar"}],
        [{"text": "🟡 Yangi buyurtmalar"}, {"text": "🟢 Tasdiqlanganlar"}],
        [{"text": "🚚 Yetkazilganlar"}, {"text": "🔴 Bekor qilinganlar"}],
    ],
    "resize_keyboard": True,
    "persistent": True,
}
