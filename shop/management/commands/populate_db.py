import random
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from shop.models import Category, Product
import urllib.request

class Command(BaseCommand):
    help = 'Заполняет базу данных тестовыми данными'

    def download_image(self, url, product_name):
        """Загружает изображение по URL и создает файл"""
        try:
            response = urllib.request.urlopen(url)
            return ContentFile(response.read(), name=f"{product_name.lower().replace(' ', '_')}.jpg")
        except:
            return None

    def handle(self, *args, **kwargs):
        # Очистка существующих данных
        Category.objects.all().delete()
        Product.objects.all().delete()

        # Создаем категории
        categories = [
            'Беговые кроссовки',
            'Кроссовки для баскетбола',
            'Повседневные кроссовки',
            'Кроссовки для тенниса',
            'Футбольные кроссовки'
        ]

        for cat_name in categories:
            Category.objects.create(
                name=cat_name,
                slug=cat_name.lower().replace(' ', '-')
            )

        # Список тестовых изображений (используем реальные URL-адреса изображений кроссовок)
        test_images = [
            'https://example.com/sneaker1.jpg',  # Замените на реальные URL
            'https://example.com/sneaker2.jpg',
            'https://example.com/sneaker3.jpg',
            'https://example.com/sneaker4.jpg',
            'https://example.com/sneaker5.jpg'
        ]

        # Расширенный список тестовых товаров с изображениями
        products = [
            {
                'name': 'Nike Air Max 270',
                'description': 'Легендарные кроссовки с технологией Air для максимального комфорта. Идеальны для повседневной носки.',
                'price': 12999.99,
                'is_featured': True,
                'category': 'Повседневные кроссовки',
                'image_url': test_images[0]
            },
            {
                'name': 'Adidas Ultraboost 21',
                'description': 'Революционная технология Boost для энергичного бега. Адаптивная поддержка стопы.',
                'price': 14999.99,
                'is_featured': True,
                'category': 'Беговые кроссовки'
            },
            {
                'name': 'Jordan XXXVI',
                'description': 'Баскетбольные кроссовки с улучшенной амортизацией и поддержкой голеностопа.',
                'price': 16999.99,
                'is_featured': True,
                'category': 'Кроссовки для баскетбола'
            },
            {
                'name': 'Nike Court Vapor',
                'description': 'Теннисные кроссовки с отличным сцеплением и боковой поддержкой.',
                'price': 11999.99,
                'is_featured': False,
                'category': 'Кроссовки для тенниса'
            },
            {
                'name': 'Adidas Predator Edge',
                'description': 'Футбольные кроссовки с инновационной подошвой для лучшего контроля мяча.',
                'price': 13999.99,
                'is_featured': True,
                'category': 'Футбольные кроссовки'
            },
            {
                'name': 'Nike Zoom Pegasus',
                'description': 'Универсальные беговые кроссовки для ежедневных тренировок.',
                'price': 9999.99,
                'is_featured': False,
                'category': 'Беговые кроссовки'
            },
            {
                'name': 'Adidas Forum Low',
                'description': 'Классические кроссовки в ретро-стиле для повседневной носки.',
                'price': 8999.99,
                'is_featured': True,
                'category': 'Повседневные кроссовки'
            },
            {
                'name': 'Under Armour Curry 8',
                'description': 'Профессиональные баскетбольные кроссовки с отличной амортизацией.',
                'price': 15999.99,
                'is_featured': True,
                'category': 'Кроссовки для баскетбола'
            },
            {
                'name': 'Nike React Infinity',
                'description': 'Беговые кроссовки с технологией React для максимального комфорта.',
                'price': 13499.99,
                'is_featured': False,
                'category': 'Беговые кроссовки'
            },
            {
                'name': 'Adidas NMD R1',
                'description': 'Стильные городские кроссовки с современными технологиями.',
                'price': 11999.99,
                'is_featured': True,
                'category': 'Повседневные кроссовки'
            }
        ]

        for product_data in products:
            category = Category.objects.get(name=product_data['category'])
            product = Product.objects.create(
                name=product_data['name'],
                slug=product_data['name'].lower().replace(' ', '-'),
                description=product_data['description'],
                price=product_data['price'],
                category=category,
                is_featured=product_data['is_featured']
            )

            # Загружаем изображение
            if 'image_url' in product_data:
                image = self.download_image(product_data['image_url'], product_data['name'])
                if image:
                    product.image.save(f"{product.slug}.jpg", image, save=True)

            # Для некоторых товаров устанавливаем скидку
            if random.random() > 0.7:  # 30% шанс на скидку
                product.is_on_sale = True
                discount = random.choice([10, 15, 20, 25, 30])  # Случайная скидка
                product.sale_price = round(product.price * (1 - discount/100), 2)
                product.save()

        self.stdout.write(self.style.SUCCESS('База данных успешно заполнена тестовыми данными'))