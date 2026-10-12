from django.urls import path
from . import views

app_name = 'store'

urlpatterns = [
    path('', views.home, name='home'),
    path('category/<slug:category_slug>/', views.home, name='category_products'),
    path('product/<slug:slug>/', views.product_detail, name='product_detail'),
    
    # Savat va buyurtma yo'llari
    path('cart/', views.cart_detail, name='cart_detail'),
    path('cart/add/<int:product_id>/', views.cart_add, name='cart_add'),
    path('cart/remove/<int:product_id>/', views.cart_remove, name='cart_remove'),
    path('cart/delete/<int:product_id>/', views.cart_delete, name='cart_delete'),
    path('checkout/', views.checkout, name='checkout'),
    path('order/pay/<int:order_id>/', views.order_pay, name='order_pay'),
    path('order/success/<int:order_id>/', views.order_success, name='order_success'),

    # Foydalanuvchi hisobi (Auth & Profile)
    path('register/', views.user_register, name='register'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('profile/', views.user_profile, name='profile'),

    # Yordamchi va SEO
    path('setup-images/', views.setup_images, name='setup_images'),
    path('robots.txt', views.robots_txt, name='robots_txt'),
    path('sitemap.xml', views.sitemap_xml, name='sitemap_xml'),
]