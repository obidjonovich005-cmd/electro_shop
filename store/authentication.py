from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    CSRF tekshiruvini o'chirib, session autentifikatsiyasini saqlaydigan class.
    REST API endpointlari uchun ishlatiladi.
    """
    def enforce_csrf(self, request):
        return  # CSRF tekshiruvini o'tkazib yuborish
