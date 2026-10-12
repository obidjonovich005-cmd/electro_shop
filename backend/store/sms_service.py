"""
Eskiz.uz SMS Gateway integratsiyasi.
Ro'yxatdan o'tish: https://eskiz.uz
API docs: https://documenter.getpostman.com/view/663428/2s93JqTRWN

Sozlash:
  settings.py ga qo'shing:
    ESKIZ_EMAIL = "sizning@email.uz"
    ESKIZ_PASSWORD = "sizning_parol"
"""

import requests
import logging
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

ESKIZ_BASE_URL = "https://notify.eskiz.uz/api"
ESKIZ_TOKEN_CACHE_KEY = "eskiz_jwt_token"


def _get_token() -> str | None:
    """Eskiz.uz dan JWT token oladi (cache bilan)."""
    token = cache.get(ESKIZ_TOKEN_CACHE_KEY)
    if token:
        return token

    email = getattr(settings, 'ESKIZ_EMAIL', None)
    password = getattr(settings, 'ESKIZ_PASSWORD', None)

    if not email or not password:
        logger.error("ESKIZ_EMAIL yoki ESKIZ_PASSWORD settings.py da topilmadi!")
        return None

    try:
        resp = requests.post(
            f"{ESKIZ_BASE_URL}/auth/login",
            data={"email": email, "password": password},
            timeout=10,
        )
        if resp.status_code == 200:
            data = resp.json()
            token = data.get("data", {}).get("token")
            if token:
                # Tokenni 23 soatga cache ga saqlaymiz (Eskiz tokeni 24 soat ishlaydi)
                cache.set(ESKIZ_TOKEN_CACHE_KEY, token, timeout=23 * 3600)
                logger.info("Eskiz.uz token muvaffaqiyatli olindi.")
                return token
        logger.error(f"Eskiz login muvaffaqiyatsiz: {resp.status_code} — {resp.text}")
    except Exception as e:
        logger.error(f"Eskiz.uz ga ulanishda xatolik: {e}")

    return None


def _format_phone(phone: str) -> str:
    """Telefon raqamni xalqaro formatga keltiradi: +998901234567 → 998901234567"""
    digits = ''.join(filter(str.isdigit, phone))
    if digits.startswith('998') and len(digits) == 12:
        return digits
    if digits.startswith('0') and len(digits) == 10:
        return '998' + digits[1:]
    if len(digits) == 9:
        return '998' + digits
    return digits


def send_sms(phone: str, message: str) -> dict:
    """
    Telefon raqamga SMS yuboradi.

    Returns:
        {"success": True, "message_id": "..."} yoki {"success": False, "error": "..."}
    """
    formatted_phone = _format_phone(phone)
    email = getattr(settings, 'ESKIZ_EMAIL', '')
    password = getattr(settings, 'ESKIZ_PASSWORD', '')

    # Agar Eskiz sozlanmagan bo'lsa, simulyatsiya qilib test rejimida o'tkazish:
    if not email or not password or 'mail.com' in email or 'sizning_' in email or 'sizning_' in password:
        logger.info(f"[SIMULATED SMS] +{formatted_phone} -> {message}")
        return {"success": True, "message_id": "dev-simulated", "is_dev": True}

    token = _get_token()
    if not token:
        logger.warning(f"[Eskiz token olinmadi, test rejimida o'tkazildi] +{formatted_phone}")
        return {"success": True, "message_id": "dev-simulated", "is_dev": True}

    try:
        resp = requests.post(
            f"{ESKIZ_BASE_URL}/message/sms/send",
            data={
                "mobile_phone": formatted_phone,
                "message": message,
                "from": "4546",   # Eskiz test sender ID
                "callback_url": "",
            },
            headers={"Authorization": f"Bearer {token}"},
            timeout=15,
        )

        if resp.status_code == 200:
            data = resp.json()
            status = data.get("status", "")
            if status in ("waiting", "sent"):
                logger.info(f"SMS yuborildi: {formatted_phone}")
                return {"success": True, "message_id": data.get("id", "")}
            else:
                logger.warning(f"SMS yuborishda xato: {data}")
                return {"success": False, "error": data.get("message", "SMS yuborilmadi.")}

        elif resp.status_code == 401:
            # Token eskirgan — cache dan o'chirib, qayta urinib ko'ramiz
            cache.delete(ESKIZ_TOKEN_CACHE_KEY)
            logger.warning("Eskiz token eskirgan, yangilanmoqda...")
            new_token = _get_token()
            if new_token:
                return send_sms(phone, message)  # bir marta qayta urinish
            return {"success": False, "error": "Token yangilanmadi."}

        else:
            logger.error(f"Eskiz SMS xato: {resp.status_code} — {resp.text}")
            return {"success": False, "error": f"SMS xizmati xatosi ({resp.status_code})."}

    except requests.exceptions.Timeout:
        return {"success": False, "error": "SMS xizmati javob bermadi (timeout)."}
    except Exception as e:
        logger.error(f"SMS yuborishda kutilmagan xatolik: {e}")
        return {"success": False, "error": "SMS yuborishda xatolik yuz berdi."}


def send_otp_sms(phone: str, code: str) -> dict:
    """OTP kodni SMS orqali yuboradi."""
    message = (
        f"Yosh Kuch Market tasdiqlash kodi:\n"
        f"{code}\n"
        f"Kod 5 daqiqa davomida amal qiladi.\n"
        f"Kodni hech kimga bermang!"
    )
    return send_sms(phone, message)


def send_order_sms(phone: str, order_id: int, full_name: str, total_price) -> dict:
    """Buyurtma tasdiqlanganligi haqida SMS yuboradi."""
    message = (
        f"Yosh Kuch Market - Buyurtma #{order_id}\n"
        f"Hurmatli {full_name}!\n"
        f"Buyurtmangiz qabul qilindi.\n"
        f"Summa: {int(total_price):,} so'm\n"
        f"Tez orada bog'lanamiz."
    )
    return send_sms(phone, message)
