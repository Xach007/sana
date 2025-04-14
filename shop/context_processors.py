from .models import CartItem

def cart_counter(request):
    """Подсчитывает количество товаров в корзине пользователя"""
    if request.user.is_authenticated:
        cart_count = CartItem.objects.filter(user=request.user).count()
        return {'cart_items_count': cart_count}
    return {'cart_items_count': 0}