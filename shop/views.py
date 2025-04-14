from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.db.models import Q
from .models import Product, Category, CartItem, FavoriteProduct
from django.contrib import messages
from .models import Review
from django.db.models import Avg

def home(request):
    featured_products = Product.objects.filter(is_featured=True)[:8]
    sale_products = Product.objects.filter(is_on_sale=True)[:8]
    
    # Получаем список ID избранных товаров для текущего пользователя
    favorite_products = []
    if request.user.is_authenticated:
        favorite_products = FavoriteProduct.objects.filter(
            user=request.user
        ).values_list('product_id', flat=True)
    
    return render(request, 'shop/home.html', {
        'featured_products': featured_products,
        'sale_products': sale_products,
        'favorite_products': favorite_products
    })

def products(request):
    products_list = Product.objects.all()
    categories = Category.objects.all()

    # Фильтрация
    category_ids = request.GET.getlist('category')
    if category_ids:
        products_list = products_list.filter(category_id__in=category_ids)

    min_price = request.GET.get('min_price')
    if min_price:
        products_list = products_list.filter(price__gte=min_price)

    max_price = request.GET.get('max_price')
    if max_price:
        products_list = products_list.filter(price__lte=max_price)

    if request.GET.get('on_sale'):
        products_list = products_list.filter(is_on_sale=True)

    # Сортировка
    sort = request.GET.get('sort', 'name')
    if sort == 'price':
        products_list = products_list.order_by('price')
    elif sort == '-price':
        products_list = products_list.order_by('-price')
    elif sort == 'newest':
        products_list = products_list.order_by('-created_at')
    else:
        products_list = products_list.order_by('name')

    # Пагинация
    paginator = Paginator(products_list, 12)
    page = request.GET.get('page')
    products = paginator.get_page(page)

    return render(request, 'shop/products.html', {
        'products': products,
        'categories': categories,
    })

def about(request):
    return render(request, 'shop/about.html')

@login_required
def cart(request):
    cart_items = CartItem.objects.filter(user=request.user)
    total_sum = sum(
        item.product.sale_price * item.quantity if item.product.is_on_sale 
        else item.product.price * item.quantity 
        for item in cart_items
    )
    return render(request, 'shop/cart.html', {
        'cart_items': cart_items,
        'total_sum': total_sum
    })

def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug)
    similar_products = Product.objects.filter(
        category=product.category
    ).exclude(id=product.id)[:4]
    
    # Проверяем, находится ли товар в избранном у пользователя
    is_favorite = False
    if request.user.is_authenticated:
        is_favorite = FavoriteProduct.objects.filter(
            user=request.user,
            product=product
        ).exists()
    
    return render(request, 'shop/product_detail.html', {
        'product': product,
        'similar_products': similar_products,
        'is_favorite': is_favorite
    })

@login_required
def add_to_cart(request, product_id):
    if request.method == 'POST':
        product = get_object_or_404(Product, id=product_id)
        quantity = int(request.POST.get('quantity', 1))
        
        cart_item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
            
        cart_count = CartItem.objects.filter(user=request.user).count()
        return JsonResponse({
            'status': 'success',
            'cart_count': cart_count
        })
    return JsonResponse({'status': 'error'}, status=400)

@login_required
def remove_from_cart(request, item_id):
    if request.method == 'POST':
        try:
            cart_item = CartItem.objects.get(id=item_id, user=request.user)
            cart_item.delete()
            cart_count = CartItem.objects.filter(user=request.user).count()
            return JsonResponse({
                'status': 'success',
                'cart_count': cart_count
            })
        except CartItem.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Товар не найден'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Неверный метод запроса'}, status=400)

@login_required
def update_cart(request, item_id):
    if request.method == 'POST':
        quantity = int(request.POST.get('quantity', 0))
        if quantity > 0:
            CartItem.objects.filter(id=item_id, user=request.user).update(quantity=quantity)
            cart_count = CartItem.objects.filter(user=request.user).count()
            return JsonResponse({
                'status': 'success',
                'cart_count': cart_count
            })
    return JsonResponse({'status': 'error'}, status=400)

def search(request):
    query = request.GET.get('q', '')
    if query:
        products_list = Product.objects.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |  # Исправлено: добавлена закрывающая скобка
            Q(category__name__icontains=query)
        ).distinct()
    else:
        products_list = Product.objects.none()

    # Проверяем, запрашивается ли JSON-формат
    if request.GET.get('format') == 'json':
        products_data = [{
            'id': product.id,
            'name': product.name,
            'slug': product.slug,
            'price': float(product.sale_price if product.is_on_sale else product.price),
            'image': product.image.url if product.image else None,
            'is_on_sale': product.is_on_sale,
        } for product in products_list[:10]]  # Ограничиваем до 10 результатов для JSON
        return JsonResponse({'products': products_data})

    # Пагинация для HTML-ответа
    paginator = Paginator(products_list, 12)
    page = request.GET.get('page')
    products = paginator.get_page(page)
    
    return render(request, 'shop/search_results.html', {
        'products': products,
        'query': query
    })

@login_required
def toggle_favorite(request, product_id):
    """Добавляет/удаляет товар из избранного"""
    if request.method == 'POST':
        product = get_object_or_404(Product, id=product_id)
        favorite, created = FavoriteProduct.objects.get_or_create(
            user=request.user,
            product=product
        )
        
        if not created:
            favorite.delete()
            is_favorite = False
        else:
            is_favorite = True
            
        return JsonResponse({
            'status': 'success',
            'is_favorite': is_favorite
        })
    return JsonResponse({'status': 'error'}, status=400)

@login_required
def favorites(request):
    """Отображает список избранных товаров"""
    favorite_items = FavoriteProduct.objects.filter(user=request.user)
    return render(request, 'shop/favorites.html', {
        'favorites': favorite_items
    })

@login_required
def add_review(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    if request.method == 'POST':
        rating = int(request.POST.get('rating'))
        text = request.POST.get('text')
        
        # Проверяем, не оставлял ли пользователь уже отзыв
        existing_review = Review.objects.filter(product=product, user=request.user).first()
        if existing_review:
            existing_review.rating = rating
            existing_review.text = text
            existing_review.save()
        else:
            Review.objects.create(
                product=product,
                user=request.user,
                rating=rating,
                text=text
            )
        
        return redirect('shop:product_detail', slug=product.slug)
    return redirect('shop:product_detail', slug=product.slug)
