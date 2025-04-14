from django import template
from django.template.defaultfilters import floatformat

register = template.Library()

@register.filter
def currency(value):
    """Форматирует число как цену в рублях"""
    try:
        formatted = floatformat(value, 2)
        return f"{formatted} ₽"
    except:
        return value

@register.filter
def multiply(value, arg):
    """Умножает значение на аргумент"""
    try:
        return float(value) * float(arg)
    except (ValueError, TypeError):
        return value

@register.simple_tag
def discount_percent(original_price, sale_price):
    """Вычисляет процент скидки"""
    try:
        discount = ((float(original_price) - float(sale_price)) / float(original_price)) * 100
        return int(discount)
    except (ValueError, TypeError, ZeroDivisionError):
        return 0

@register.inclusion_tag('shop/tags/price_display.html')
def show_price(product):
    """Отображает цену товара с учетом скидок и акций"""
    return {
        'product': product,
        'has_discount': product.is_on_sale and product.sale_price,
        'discount_percent': product.discount_percentage if product.is_on_sale else 0
    }