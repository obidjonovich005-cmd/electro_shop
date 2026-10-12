from django.urls import path
from . import api_views

urlpatterns = [
    # Metadata & Kategoriyalar
    path('meta/', api_views.StoreMetaAPIView.as_view(), name='api_meta'),
    path('categories/', api_views.CategoryListAPIView.as_view(), name='api_categories'),

    # Mahsulotlar
    path('products/', api_views.ProductListAPIView.as_view(), name='api_products'),
    path('products/<slug:slug>/', api_views.ProductDetailAPIView.as_view(), name='api_product_detail'),

    # Buyurtmalar va To'lov
    path('checkout/', api_views.CheckoutAPIView.as_view(), name='api_checkout'),
    path('orders/<int:pk>/', api_views.OrderDetailAPIView.as_view(), name='api_order_detail'),
    path('orders/<int:pk>/pay/', api_views.OrderPayAPIView.as_view(), name='api_order_pay'),
    path('orders/my/', api_views.UserOrdersAPIView.as_view(), name='api_user_orders'),

    # Auth
    path('auth/me/', api_views.AuthMeAPIView.as_view(), name='api_auth_me'),
    path('auth/register/', api_views.AuthRegisterAPIView.as_view(), name='api_auth_register'),
    path('auth/login/', api_views.AuthLoginAPIView.as_view(), name='api_auth_login'),
    path('auth/logout/', api_views.AuthLogoutAPIView.as_view(), name='api_auth_logout'),

    # SMS OTP
    path('otp/send/', api_views.OTPSendAPIView.as_view(), name='api_otp_send'),
    path('otp/verify/', api_views.OTPVerifyAPIView.as_view(), name='api_otp_verify'),

    # Telegram Bot Webhook
    path('telegram/webhook/', api_views.TelegramWebhookAPIView.as_view(), name='api_telegram_webhook'),
]

