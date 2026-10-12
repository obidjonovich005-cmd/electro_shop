from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=200, unique=True, verbose_name="Kategoriya nomi")
    slug = models.SlugField(max_length=200, unique=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True, verbose_name="Rasm")

    class Meta:
        verbose_name = "Kategoriya"
        verbose_name_plural = "Kategoriyalar"
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products', verbose_name="Kategoriya")
    name = models.CharField(max_length=255, verbose_name="Mahsulot nomi")
    slug = models.SlugField(max_length=255, unique=True)
    brand = models.CharField(max_length=100, blank=True, null=True, verbose_name="Brend (Apple, Samsung va h.k.)")
    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Narxi (so'm)")
    discount_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, verbose_name="Chegirma narxi")
    description = models.TextField(verbose_name="Mahsulot tavsifi")
    specs = models.TextField(blank=True, null=True, verbose_name="Texnik xususiyatlari (RAM, Xotira, Protsessor)")
    image = models.ImageField(upload_to='products/', verbose_name="Asosiy rasm")
    stock = models.PositiveIntegerField(default=1, verbose_name="Ombordagi soni")
    is_available = models.BooleanField(default=True, verbose_name="Sotuvda mavjud")
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=4.9, verbose_name="Reyting")
    reviews_count = models.PositiveIntegerField(default=18, verbose_name="Sharhlar soni")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Qo'shilgan vaqti")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Yangilangan vaqti")

    class Meta:
        verbose_name = "Mahsulot"
        verbose_name_plural = "Mahsulotlar"
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def current_price(self):
        if self.discount_price and self.discount_price < self.price:
            return self.discount_price
        return self.price

    @property
    def discount_percent(self):
        if self.discount_price and self.discount_price < self.price and self.price > 0:
            return int(((self.price - self.discount_price) / self.price) * 100)
        return 0


# --- FOYDALANUVCHI PROFILI ---

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', verbose_name="Foydalanuvchi")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Telefon raqami")
    address = models.TextField(blank=True, null=True, verbose_name="Yetkazib berish manzili")

    def __str__(self):
        return f"{self.user.username} profili"


# --- BUYURTMALAR TIZIMI ---

class Order(models.Model):
    STATUS_CHOICES = (
        ('new', 'Yangi'),
        ('confirmed', 'Tasdiqlangan'),
        ('delivered', 'Yetkazib berildi'),
        ('canceled', 'Bekor qilingan'),
    )

    PAYMENT_CHOICES = (
        ('click', 'Click Up'),
        ('payme', 'Payme'),
        ('uzum', 'Uzum Bank'),
        ('cash', 'Yetkazilganda naqd / karta'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('pending', "Kutilmoqda"),
        ('paid', "To'langan"),
        ('failed', "Bekor qilingan"),
    )

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders', verbose_name="Foydalanuvchi")
    full_name = models.CharField(max_length=150, verbose_name="Mijoz F.I.Sh.")
    phone = models.CharField(max_length=20, verbose_name="Telefon raqami")
    address = models.TextField(verbose_name="Yetkazib berish manzili")
    comment = models.TextField(blank=True, null=True, verbose_name="Qo'shimcha izoh")
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="Jami summa")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='cash', verbose_name="To'lov turi")
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending', verbose_name="To'lov holati")
    card_pan = models.CharField(max_length=30, blank=True, null=True, verbose_name="To'lov kartasi")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', verbose_name="Holati")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Buyurtma vaqti")

    class Meta:
        verbose_name = "Buyurtma"
        verbose_name_plural = "Buyurtmalar"
        ordering = ['-created_at']

    def __str__(self):
        return f"Buyurtma #{self.id} — {self.full_name} ({self.phone})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name="Buyurtma")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Mahsulot")
    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Narxi")
    quantity = models.PositiveIntegerField(default=1, verbose_name="Soni")

    def __str__(self):
        return f"{self.product.name} (x{self.quantity})"


# --- SMS OTP TIZIMI ---

class OTPCode(models.Model):
    """Telefon raqamga yuborilgan bir martalik SMS kod."""
    phone = models.CharField(max_length=20, verbose_name="Telefon raqami")
    code = models.CharField(max_length=6, verbose_name="OTP kodi")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Yaratilgan vaqt")
    expires_at = models.DateTimeField(verbose_name="Amal qilish muddati")
    is_used = models.BooleanField(default=False, verbose_name="Ishlatilgan")
    attempts = models.PositiveSmallIntegerField(default=0, verbose_name="Urinishlar soni")

    class Meta:
        verbose_name = "OTP kodi"
        verbose_name_plural = "OTP kodlar"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.phone} → {self.code} ({'ishlatilgan' if self.is_used else 'faol'})"

    def is_valid(self):
        from django.utils import timezone
        return not self.is_used and self.expires_at > timezone.now() and self.attempts < 3