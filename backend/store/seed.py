import os
import sys
from pathlib import Path

# Asosiy papkani Python yo'liga qo'shish
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.core.files.base import ContentFile
from store.models import Category, Product
from PIL import Image, ImageDraw, ImageFont
import io

def create_placeholder_image(text, bg_color=(30, 41, 59), text_color=(255, 255, 255)):
    """Mahsulot uchun avtomatik chiroyli rasm hosil qiladi"""
    img = Image.new('RGB', (600, 600), color=bg_color)
    draw = ImageDraw.Draw(img)
    draw.ellipse([120, 120, 480, 480], outline=(100, 116, 139), width=4)
    font = ImageFont.load_default()
    draw.text((300, 300), text, fill=text_color, font=font, anchor="mm")
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    return buffer.getvalue()

def populate():
    print("⏳ Mahsulotlar va toifalar yuklanmoqda, kuting...")

    # 1. Kategoriyalar
    categories_data = [
        {"name": "Smartfonlar", "slug": "smartfonlar"},
        {"name": "Noutbuklar", "slug": "noutbuklar"},
        {"name": "Quloqchinlar va Audio", "slug": "quloqchinlar"},
        {"name": "Aqlli soatlar", "slug": "aqlli-soatlar"},
    ]

    categories = {}
    for cat_data in categories_data:
        cat, created = Category.objects.get_or_create(
            slug=cat_data["slug"],
            defaults={"name": cat_data["name"]}
        )
        categories[cat_data["slug"]] = cat

    # 2. Mahsulotlar ro'yxati
    products_data = [
        # SMARTFONLAR
        {
            "category": "smartfonlar",
            "name": "Apple iPhone 15 Pro Max 256GB Titanium",
            "slug": "iphone-15-pro-max-256gb",
            "brand": "Apple",
            "price": 14500000,
            "discount_price": 13800000,
            "description": "Eng kuchli A17 Pro protsessori, titan korpus va 5x optik zumli professional kameralar tizimi.",
            "specs": "Ekran: 6.7 Super Retina XDR OLED 120Hz\nProtsessor: Apple A17 Pro\nRAM: 8GB | Xotira: 256GB\nKamera: 48MP + 12MP + 12MP\nBatareya: 4422 mAh",
            "stock": 15,
            "color": (15, 23, 42)
        },
        {
            "category": "smartfonlar",
            "name": "Samsung Galaxy S24 Ultra 512GB Titanium Gray",
            "slug": "samsung-galaxy-s24-ultra-512gb",
            "brand": "Samsung",
            "price": 15200000,
            "discount_price": 14400000,
            "description": "Galaxy AI sun'iy intellekt xususiyatlari, o'rnatilgan S-Pen ruchkasi va 200MP ultra aniq kamera.",
            "specs": "Ekran: 6.8 Dynamic AMOLED 2X 120Hz\nProtsessor: Snapdragon 8 Gen 3\nRAM: 12GB | Xotira: 512GB\nKamera: 200MP + 50MP + 12MP + 10MP\nBatareya: 5000 mAh",
            "stock": 10,
            "color": (30, 41, 59)
        },
        {
            "category": "smartfonlar",
            "name": "Xiaomi 14 Ultra 512GB Black Leica",
            "slug": "xiaomi-14-ultra-512gb",
            "brand": "Xiaomi",
            "price": 11500000,
            "discount_price": 10800000,
            "description": "Leica professional linzalari bilan jihozlangan eng ilg'or fotosuratchi flagman smartfon.",
            "specs": "Ekran: 6.73 LTPO AMOLED 120Hz\nProtsessor: Snapdragon 8 Gen 3\nRAM: 16GB | Xotira: 512GB\nKamera: 50MP Leica Quad kamera\nBatareya: 5000 mAh (90W tezkor zaryad)",
            "stock": 12,
            "color": (24, 24, 27)
        },

        # NOUTBUKLAR
        {
            "category": "noutbuklar",
            "name": "Apple MacBook Air 15 M3 16GB / 512GB Space Gray",
            "slug": "macbook-air-15-m3-16gb-512gb",
            "brand": "Apple",
            "price": 17200000,
            "discount_price": 16400000,
            "description": "Yupqa va yengil alyuminiy korpus, Apple M3 chipining mislsiz tezligi va 18 soatgacha batareya quvvati.",
            "specs": "Ekran: 15.3 Liquid Retina\nProtsessor: Apple M3 8-core CPU\nRAM: 16GB Unified\nXotira: 512GB SSD\nVazni: 1.51 kg",
            "stock": 8,
            "color": (51, 65, 85)
        },
        {
            "category": "noutbuklar",
            "name": "ASUS ROG Zephyrus G16 OLED Gaming Laptop",
            "slug": "asus-rog-zephyrus-g16-oled",
            "brand": "ASUS",
            "price": 24000000,
            "discount_price": 22500000,
            "description": "Geymerlar va dasturchilar uchun: Intel Core Ultra 9 va RTX 4070 grafik kartasi, 240Hz OLED ekran.",
            "specs": "Ekran: 16.0 2.5K OLED 240Hz\nProtsessor: Intel Core Ultra 9 185H\nVideokarta: NVIDIA RTX 4070 8GB\nRAM: 32GB LPDDR5X | Xotira: 1TB SSD",
            "stock": 5,
            "color": (15, 23, 42)
        },
        {
            "category": "noutbuklar",
            "name": "Lenovo Legion Pro 5 16 1TB SSD",
            "slug": "lenovo-legion-pro-5-16",
            "brand": "Lenovo",
            "price": 18500000,
            "discount_price": 17200000,
            "description": "AMD Ryzen 7 va RTX 4060 kuchiga ega yuqori samaradorlikdagi o'yin va dizayn noutbuki.",
            "specs": "Ekran: 16 WQXGA 165Hz\nProtsessor: AMD Ryzen 7 7745HX\nVideokarta: RTX 4060 8GB\nRAM: 16GB DDR5 | Xotira: 1TB SSD",
            "stock": 7,
            "color": (39, 39, 42)
        },

        # QULOQCHINLAR VA AUDIO
        {
            "category": "quloqchinlar",
            "name": "Apple AirPods Pro (2nd Generation) USB-C",
            "slug": "airpods-pro-2-usb-c",
            "brand": "Apple",
            "price": 2900000,
            "discount_price": 2650000,
            "description": "2 baravar kuchaytirilgan shovqinni so'ndirish (ANC), Shaffof rejim va Type-C quvvatlash keysi.",
            "specs": "Chip: Apple H2\nShovqinni so'ndirish: Faol (ANC)\nIshlash vaqti: 30 soatgacha keys bilan\nUlanish: Bluetooth 5.3, MagSafe",
            "stock": 25,
            "color": (248, 250, 252)
        },
        {
            "category": "quloqchinlar",
            "name": "Sony WH-1000XM5 Wireless Noise-Canceling",
            "slug": "sony-wh-1000xm5-black",
            "brand": "Sony",
            "price": 4400000,
            "discount_price": 3950000,
            "description": "Dunyoda yetakchi shovqinni so'ndirish texnologiyasi, LDAC Hi-Res Audio va 30 soat batareya.",
            "specs": "Drayver: 30mm\nShovqin so'ndirish: 8 mikrofonli ANC\nIshlash vaqti: 30 soat\nOg'irligi: 250g",
            "stock": 14,
            "color": (15, 23, 42)
        },
        {
            "category": "quloqchinlar",
            "name": "Marshall Major IV Bluetooth Black",
            "slug": "marshall-major-iv-black",
            "brand": "Marshall",
            "price": 1750000,
            "discount_price": 1550000,
            "description": "Klassik retro rok uslubidagi afsonaviy simsiz quloqchin. Bir quvvat bilan 80+ soat musiqa.",
            "specs": "Ishlash vaqti: 80+ soat\nSimsiz zaryad: Mavjud\nDrayver: 40mm dinamik",
            "stock": 20,
            "color": (24, 24, 27)
        },

        # AQLLI SOATLAR
        {
            "category": "aqlli-soatlar",
            "name": "Apple Watch Series 9 GPS 45mm Midnight",
            "slug": "apple-watch-series-9-45mm",
            "brand": "Apple",
            "price": 5100000,
            "discount_price": 4700000,
            "description": "Yangi S9 chipi, Double Tap barmoq bilan boshqarish, yurak urishi va EKG datchiklari.",
            "specs": "Ekran: Always-On Retina 2000 nit\nSensorlar: EKG, Qon kislorodi, Harorat\nSuvga chidamlilik: 50 metr",
            "stock": 18,
            "color": (15, 23, 42)
        },
        {
            "category": "aqlli-soatlar",
            "name": "Samsung Galaxy Watch 6 Classic 47mm Black",
            "slug": "samsung-galaxy-watch-6-classic-47mm",
            "brand": "Samsung",
            "price": 3900000,
            "discount_price": 3400000,
            "description": "Klassik aylanuvchi mexanik bezel xalqasi, tana tarkibini tahlil qilish (BIA) va uyqu monitoringi.",
            "specs": "Ekran: 1.5 Super AMOLED Sapphire\nKorpus: Zanglamas po'lat\nFunksiyalar: BIA, EKG, Qon bosimi",
            "stock": 11,
            "color": (30, 41, 59)
        }
    ]

    for item in products_data:
        cat = categories[item["category"]]
        img_bytes = create_placeholder_image(f"{item['brand']}\n{item['name'][:20]}...", bg_color=item.get("color", (30, 41, 59)))
        
        product, created = Product.objects.get_or_create(
            slug=item["slug"],
            defaults={
                "category": cat,
                "name": item["name"],
                "brand": item["brand"],
                "price": item["price"],
                "discount_price": item.get("discount_price"),
                "description": item["description"],
                "specs": item["specs"],
                "stock": item["stock"],
                "is_available": True,
            }
        )
        if created or not product.image:
            product.image.save(f"{item['slug']}.png", ContentFile(img_bytes), save=True)
        
        print(f"✅ {product.name} ({product.brand}) qo'shildi")

    print("\n🎉 BARCHA BRENDLAR MAHSULOTLARI BAZAGA MUVAFFAQIYATLI QO'SHILDI!")

if __name__ == '__main__':
    populate()