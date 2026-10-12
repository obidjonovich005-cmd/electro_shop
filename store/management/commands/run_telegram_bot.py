import time
import requests
import logging
from django.core.management.base import BaseCommand
from django.conf import settings
from store.telegram_service import handle_telegram_callback

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Telegram botni polling rejimida ishga tushirish (tugmalar va xabarlarni qabul qilish uchun)"

    def handle(self, *args, **options):
        token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '').strip()
        if not token:
            self.stderr.write(self.style.ERROR("TELEGRAM_BOT_TOKEN settings.py da topilmadi!"))
            return

        self.stdout.write(self.style.SUCCESS("[OK] ElectroShop Telegram boti muvaffaqiyatli ishga tushdi!"))
        self.stdout.write("Buyurtma tugmalari kutilmoqda...")

        # Polling to'g'ri ishlashi uchun eski webhookni o'chiramiz
        try:
            requests.get(f"https://api.telegram.org/bot{token}/deleteWebhook", timeout=10)
        except Exception:
            pass

        offset = 0
        while True:
            try:
                url = f"https://api.telegram.org/bot{token}/getUpdates?offset={offset}&timeout=20"
                resp = requests.get(url, timeout=25)
                if resp.status_code != 200:
                    time.sleep(2)
                    continue

                data = resp.json()
                if not data.get("ok"):
                    time.sleep(2)
                    continue

                for update in data.get("result", []):
                    update_id = update["update_id"]
                    offset = update_id + 1

                    # 1. Inline tugma bosilganda (Tasdiqlash, Yetkazildi, Bekor qilish)
                    if "callback_query" in update:
                        cb = update["callback_query"]
                        callback_data = cb.get("data", "")
                        callback_id = cb.get("id", "")
                        msg = cb.get("message", {})
                        message_id = msg.get("message_id")
                        chat_id = msg.get("chat", {}).get("id")

                        self.stdout.write(self.style.SUCCESS(f">> Tugma bosildi: {callback_data}"))
                        res = handle_telegram_callback(callback_data, callback_id, message_id, chat_id)
                        self.stdout.write(f"Yangilanish holati: {res}")

                    # 2. Xabar kelganda (/start, tugmalar, buyruqlar)
                    elif "message" in update:
                        msg = update["message"]
                        chat_id = msg.get("chat", {}).get("id")
                        text = (msg.get("text") or "").strip()
                        text_lower = text.lower()

                        if not chat_id:
                            continue

                        from store.telegram_service import (
                            ADMIN_REPLY_KEYBOARD,
                            get_orders_statistics_text,
                            get_recent_orders_text,
                            get_orders_by_status_text,
                        )

                        if text_lower.startswith("/start") or text_lower.startswith("/help"):
                            welcome_text = (
                                "👋 <b>Assalomu alaykum!</b>\n\n"
                                "Bu <b>ElectroShop</b> do'konining rasmiy admin boti.\n\n"
                                "Quyidagi tugmalar orqali buyurtmalarni bemalol ko'rishingiz mumkin 👇"
                            )
                            requests.post(f"https://api.telegram.org/bot{token}/sendMessage", json={
                                "chat_id": chat_id,
                                "text": welcome_text,
                                "parse_mode": "HTML",
                                "reply_markup": ADMIN_REPLY_KEYBOARD,
                            }, timeout=10)

                        elif "savdo statistikasi" in text_lower or text_lower.startswith("/stat"):
                            stat_text = get_orders_statistics_text()
                            requests.post(f"https://api.telegram.org/bot{token}/sendMessage", json={
                                "chat_id": chat_id,
                                "text": stat_text,
                                "parse_mode": "HTML",
                                "reply_markup": ADMIN_REPLY_KEYBOARD,
                            }, timeout=10)

                        elif "oxirgi buyurtmalar" in text_lower or text_lower.startswith("/orders"):
                            orders_text = get_recent_orders_text()
                            requests.post(f"https://api.telegram.org/bot{token}/sendMessage", json={
                                "chat_id": chat_id,
                                "text": orders_text,
                                "parse_mode": "HTML",
                                "reply_markup": ADMIN_REPLY_KEYBOARD,
                            }, timeout=10)

                        elif "yangi" in text_lower:
                            out_text = get_orders_by_status_text('new')
                            requests.post(f"https://api.telegram.org/bot{token}/sendMessage", json={
                                "chat_id": chat_id,
                                "text": out_text,
                                "parse_mode": "HTML",
                                "reply_markup": ADMIN_REPLY_KEYBOARD,
                            }, timeout=10)

                        elif "tasdiqlangan" in text_lower:
                            out_text = get_orders_by_status_text('confirmed')
                            requests.post(f"https://api.telegram.org/bot{token}/sendMessage", json={
                                "chat_id": chat_id,
                                "text": out_text,
                                "parse_mode": "HTML",
                                "reply_markup": ADMIN_REPLY_KEYBOARD,
                            }, timeout=10)

                        elif "yetkazilgan" in text_lower:
                            out_text = get_orders_by_status_text('delivered')
                            requests.post(f"https://api.telegram.org/bot{token}/sendMessage", json={
                                "chat_id": chat_id,
                                "text": out_text,
                                "parse_mode": "HTML",
                                "reply_markup": ADMIN_REPLY_KEYBOARD,
                            }, timeout=10)

                        elif "bekor qilingan" in text_lower:
                            out_text = get_orders_by_status_text('canceled')
                            requests.post(f"https://api.telegram.org/bot{token}/sendMessage", json={
                                "chat_id": chat_id,
                                "text": out_text,
                                "parse_mode": "HTML",
                                "reply_markup": ADMIN_REPLY_KEYBOARD,
                            }, timeout=10)

                        else:
                            # Noma'lum xabarga ham tugmalarni qaytaramiz
                            requests.post(f"https://api.telegram.org/bot{token}/sendMessage", json={
                                "chat_id": chat_id,
                                "text": "Menyudan kerakli bo'limni tanlang 👇",
                                "reply_markup": ADMIN_REPLY_KEYBOARD,
                            }, timeout=10)

            except requests.exceptions.RequestException:
                time.sleep(2)
            except Exception as e:
                self.stderr.write(f"Kutilmagan xatolik: {e}")
                time.sleep(2)
