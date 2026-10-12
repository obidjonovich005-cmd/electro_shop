from django.contrib import admin
from .models import Category, Product, Order, OrderItem, UserProfile, OTPCode

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'brand', 'price', 'discount_price', 'stock', 'rating', 'is_available')
    list_filter = ('category', 'brand', 'is_available')
    list_editable = ('price', 'discount_price', 'stock', 'is_available')
    search_fields = ('name', 'brand', 'description')
    prepopulated_fields = {'slug': ('name',)}


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'price', 'quantity')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'phone', 'total_price', 'payment_method', 'payment_status', 'status', 'created_at')
    list_filter = ('payment_method', 'payment_status', 'status', 'created_at')
    list_editable = ('payment_status', 'status')
    search_fields = ('full_name', 'phone', 'address')
    inlines = [OrderItemInline]


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'address')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'phone')


@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    list_display = ('phone', 'code', 'is_used', 'attempts', 'expires_at', 'created_at')
    list_filter = ('is_used', 'created_at')
    search_fields = ('phone', 'code')
    readonly_fields = ('created_at',)


    