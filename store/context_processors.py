from .models import Category

def cart_renderer(request):
    cart = request.session.get('cart', {})
    total_items = 0
    if isinstance(cart, dict):
        for qty in cart.values():
            try:
                total_items += int(qty)
            except (ValueError, TypeError):
                pass

    return {
        'cart_total_items': total_items,
        'global_categories': Category.objects.all(),
    }
