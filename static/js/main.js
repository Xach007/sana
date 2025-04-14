// ...existing code...// Получение CSRF токена





























// ...existing code...}    });        });            }                showNotification(errorMessage, 'error');                const errorMessage = xhr.responseJSON?.message || 'Произошла ошибка при удалении товара';            error: function(xhr) {            },                }                    showNotification(response.message || 'Ошибка при удалении товара', 'error');                } else {                    showNotification('Товар успешно удален из корзины', 'success');                    updateCartCounter(response.cart_count);                    }                        updateCartTotal();                        cartItem.closest('tr').remove();                    if (cartItem) {                    const cartItem = document.getElementById(`cart-item-${itemId}`);                if (response.status === 'success') {            success: function(response) {            },                'X-CSRFToken': getCookie('csrftoken')            headers: {            method: 'POST',            url: `/shop/remove-from-cart/${itemId}/`,        $.ajax({    showConfirmDialog('Вы уверены, что хотите удалить товар из корзины?', () => {function removeFromCart(itemId) {function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Функции для работы с корзиной
    function updateCartCounter(count) {
    const counter = document.querySelector('.cart-count');
    if (counter) {
        counter.textContent = count;
        if (count > 0) {
            counter.style.display = 'inline';
        } else {
            counter.style.display = 'none';
        }
    }
}

function addToCart(productId, quantity = 1) {
    $.ajax({
        url: `/shop/add-to-cart/${productId}/`,
        method: 'POST',
        data: { quantity: quantity },
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        success: function(response) {
            if (response.status === 'success') {
                showNotification('Товар добавлен в корзину', 'success');
                updateCartCounter(response.cart_count);
            }
        },
        error: function() {
            showNotification('Произошла ошибка при добавлении товара', 'error');
        }
    });
}

// Функция для показа модального окна подтверждения
function showConfirmDialog(message, callback) {
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    document.getElementById('confirmMessage').textContent = message;
    
    const confirmButton = document.getElementById('confirmAction');
    const handleConfirm = () => {
        modal.hide();
        callback();
        confirmButton.removeEventListener('click', handleConfirm);
    };
    
    confirmButton.addEventListener('click', handleConfirm);
    modal.show();
}

// Обновленная функция удаления из корзины
function removeFromCart(itemId) {
    showConfirmDialog('Вы уверены, что хотите удалить товар из корзины?', () => {
        $.ajax({
            url: `/shop/remove-from-cart/${itemId}/`,
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            success: function(response) {
                if (response.status === 'success') {
                    const cartItem = document.getElementById(`cart-item-${itemId}`);
                    if (cartItem) {
                        cartItem.closest('tr').remove();
                        updateCartTotal();
                    }
                    updateCartCounter(response.cart_count);
                    showNotification('Товар успешно удален из корзины', 'success');
                } else {
                    showNotification('Ошибка: ' + (response.message || 'Не удалось удалить товар'), 'error');
                }
            },
            error: function(xhr, status, error) {
                const errorMessage = xhr.responseJSON?.message || error || 'Произошла ошибка при удалении товара из корзины';
                console.error('Ошибка:', errorMessage);
                showNotification(errorMessage, 'error');
            }
        });
    });
}

function updateCartItemQuantity(itemId, quantity) {
    if (quantity < 1) return;
    
    $.ajax({
        url: `/shop/update-cart/${itemId}/`,
        method: 'POST',
        data: { quantity: quantity },
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        success: function(response) {
            if (response.status === 'success') {
                updateCartTotal();
                showNotification('Количество товара обновлено', 'success');
            }
        },
        error: function() {
            showNotification('Произошла ошибка при обновлении количества', 'error');
        }
    });
}

// Обновленная функция для работы с избранным
function toggleFavorite(productId, button) {
    if (!isAuthenticated) {
        showNotification('Пожалуйста, войдите в систему, чтобы добавить товар в избранное', 'warning');
        return;
    }

    const isInFavorites = button.classList.contains('active');
    
    if (isInFavorites) {
        showConfirmDialog('Вы уверены, что хотите удалить товар из избранного?', () => {
            sendFavoriteRequest(productId, button);
        });
    } else {
        sendFavoriteRequest(productId, button);
    }
}

function sendFavoriteRequest(productId, button) {
    $.ajax({
        url: `/shop/toggle-favorite/${productId}/`,
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        success: function(response) {
            if (response.status === 'success') {
                const icon = button.querySelector('i');
                const tooltip = bootstrap.Tooltip.getInstance(button);
                
                if (response.is_favorite) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    button.classList.add('active');
                    if (tooltip) tooltip.setContent({ '.tooltip-inner': 'Убрать из избранного' });
                    showNotification('Товар добавлен в избранное', 'success');
                } else {
                    // Если мы на странице избранного, удаляем карточку товара
                    if (window.location.pathname === '/favorites/') {
                        const productCard = button.closest('.col');
                        if (productCard) {
                            productCard.remove();
                            // Если больше нет товаров, перезагружаем страницу
                            if (document.querySelectorAll('.product-card').length === 0) {
                                location.reload();
                            }
                        }
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                        button.classList.remove('active');
                        if (tooltip) tooltip.setContent({ '.tooltip-inner': 'Добавить в избранное' });
                    }
                    showNotification('Товар удален из избранного', 'success');
                }
                
                updateFavoritesCounter(response.favorites_count);
            }
        },
        error: function() {
            showNotification('Произошла ошибка. Попробуйте позже.', 'error');
        }
    });
}

// Функция для удаления товара из избранного
function removeFromFavorites(productId) {
    showConfirmDialog('Вы уверены, что хотите удалить товар из избранного?', () => {
        $.ajax({
            url: `/shop/remove-from-favorites/${productId}/`,
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            success: function(response) {
                if (response.status === 'success') {
                    const favoriteItem = document.getElementById(`favorite-item-${productId}`);
                    if (favoriteItem) {
                        favoriteItem.closest('.col').remove();
                        // Если больше нет товаров, перезагружаем страницу
                        if (document.querySelectorAll('.favorite-item').length === 0) {
                            location.reload();
                        }
                    }
                    updateFavoritesCounter(response.favorites_count);
                    showNotification('Товар успешно удален из избранного', 'success');
                } else {
                    showNotification('Ошибка: ' + (response.message || 'Не удалось удалить товар'), 'error');
                }
            },
            error: function(xhr, status, error) {
                const errorMessage = xhr.responseJSON?.message || error || 'Произошла ошибка при удалении товара из избранного';
                console.error('Ошибка:', errorMessage);
                showNotification(errorMessage, 'error');
            }
        });
    });
}

// Функция для обновления счетчика избранных товаров
function updateFavoritesCounter(count) {
    const counter = document.querySelector('.favorites-counter');
    if (counter) {
        counter.textContent = count || '0';
        counter.style.display = count > 0 ? 'block' : 'none';
    }
}

// Функция для отображения уведомлений
function showNotification(message, type = 'info') {
    let notificationsContainer = document.getElementById('notifications');
    if (!notificationsContainer) {
        notificationsContainer = document.createElement('div');
        notificationsContainer.id = 'notifications';
        notificationsContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1060;
        `;
        document.body.appendChild(notificationsContainer);
    }

    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show notification-toast`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    notificationsContainer.appendChild(notification);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 150);
    }, 3000);
}

// Функция для обновления общей суммы корзины
function updateCartTotal() {
    let total = 0;
    document.querySelectorAll('.cart-item').forEach(item => {
        const price = parseFloat(item.dataset.price);
        const quantity = parseInt(item.querySelector('.quantity-input').value);
        if (!isNaN(price) && !isNaN(quantity)) {
            total += price * quantity;
        }
    });
    
    const totalElement = document.getElementById('cart-total');
    if (totalElement) {
        totalElement.textContent = `${total.toFixed(2)} ₽`;
    }
}

// Глобальная переменная для хранения состояния аутентификации
const isAuthenticated = document.body.hasAttribute('data-authenticated');

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всплывающих подсказок
    const tooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltips.forEach(el => new bootstrap.Tooltip(el));

    // Анимация для карточек товаров при прокрутке
    function showProductCards() {
        document.querySelectorAll('.animate-on-scroll').forEach(card => {
            if (isElementInViewport(card) && !card.classList.contains('animate__animated')) {
                card.classList.add('animate__animated', 'animate__fadeIn');
            }
        });
    }

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Обработчики событий
    window.addEventListener('scroll', showProductCards);
    window.addEventListener('resize', showProductCards);
    showProductCards();

    // Автоматическая отправка формы фильтров при изменении
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', () => filterForm.submit());
        });
    }

    // Инициализация счетчиков
    updateCartCounter(document.querySelector('.cart-count')?.textContent || 0);
    updateFavoritesCounter(document.querySelector('.favorites-counter')?.textContent || 0);
});

// Функция для живого поиска и асинхронного поиска
let searchTimeout;
const searchInput = document.querySelector('input[name="q"]');
const searchResults = document.createElement('div');
searchResults.className = 'search-results dropdown-menu w-100';

function liveSearch(input) {
    clearTimeout(searchTimeout);
    const query = input.value.trim();
    const resultsContainer = document.getElementById('searchResults');

    if (query.length < 2) {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
        return;
    }

    searchTimeout = setTimeout(() => {
        $.get(`/search/?q=${encodeURIComponent(query)}&format=json`, function(response) {
            if (response.products && response.products.length > 0) {
                let html = '<div class="list-group">';
                response.products.forEach(product => {
                    html += `
                        <a href="/product/${product.slug}/" class="list-group-item list-group-item-action">
                            <div class="d-flex align-items-center">
                                ${product.image ? `<img src="${product.image}" class="me-3" style="width: 50px; height: 50px; object-fit: contain;">` : ''}
                                <div>
                                    <h6 class="mb-1">${product.name}</h6>
                                    <small class="text-muted">
                                        ${product.is_on_sale ? 
                                            `<del>${product.price} ₽</del> <span class="text-danger">${product.sale_price} ₽</span>` : 
                                            `${product.price} ₽`}
                                    </small>
                                </div>
                            </div>
                        </a>
                    `;
                });
                html += '</div>';
                resultsContainer.innerHTML = html;
                resultsContainer.style.display = 'block';
            } else {
                resultsContainer.innerHTML = '<div class="p-3 text-center text-muted">Ничего не найдено</div>';
                resultsContainer.style.display = 'block';
            }
        });
    }, 300);
}

if (searchInput) {
    searchInput.parentElement.style.position = 'relative';
    searchInput.after(searchResults);

    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length >= 2) {
            searchTimeout = setTimeout(() => {
                fetch(`/search/?q=${encodeURIComponent(query)}&format=json`)
                    .then(response => response.json())
                    .then(data => {
                        searchResults.innerHTML = '';
                        if (data.products && data.products.length > 0) {
                            searchResults.classList.add('show');
                            data.products.slice(0, 5).forEach(product => {
                                const item = document.createElement('a');
                                item.className = 'dropdown-item d-flex align-items-center';
                                item.href = `/product/${product.slug}/`;
                                
                                const img = document.createElement('img');
                                img.src = product.image;
                                img.alt = product.name;
                                img.className = 'me-2';
                                img.style.width = '40px';
                                img.style.height = '40px';
                                img.style.objectFit = 'contain';
                                
                                const textDiv = document.createElement('div');
                                textDiv.className = 'flex-grow-1';
                                textDiv.innerHTML = `
                                    <div>${product.name}</div>
                                    <small class="text-muted">${product.price} ₽</small>
                                `;
                                
                                item.appendChild(img);
                                item.appendChild(textDiv);
                                searchResults.appendChild(item);
                            });
                            
                            if (data.products.length > 5) {
                                const moreLink = document.createElement('a');
                                moreLink.className = 'dropdown-item text-primary text-center';
                                moreLink.href = `/search/?q=${encodeURIComponent(query)}`;
                                moreLink.textContent = 'Показать все результаты';
                                searchResults.appendChild(moreLink);
                            }
                        } else {
                            searchResults.innerHTML = '<span class="dropdown-item">Ничего не найдено</span>';
                            searchResults.classList.add('show');
                        }
                    });
            }, 300);
        } else {
            searchResults.classList.remove('show');
        }
    });
}

// Закрытие результатов поиска при клике вне
document.addEventListener('click', function(e) {
    const searchResults = document.getElementById('searchResults');
    const searchInput = document.querySelector('.search-input');
    
    if (searchResults && !searchResults.contains(e.target) && e.target !== searchInput) {
        searchResults.style.display = 'none';
    }
});

// Добавляем стили для выпадающего меню поиска
const style = document.createElement('style');
style.textContent = `
    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 1000;
        max-height: 400px;
        overflow-y: auto;
    }
    .search-results .dropdown-item {
        padding: 0.5rem 1rem;
        white-space: normal;
    }
    .search-results .dropdown-item:hover {
        background-color: #f8f9fa;
    }
`;
document.head.appendChild(style);

// Инициализация всплывающих подсказок
$(document).ready(function() {
    $('[data-bs-toggle="tooltip"]').tooltip();
    
    // Обработка изменения количества товаров в корзине
    $('.quantity-input').on('change', function() {
        updateCartTotal();
    });
    
    // Фильтрация товаров
    $('#filter-form').on('change', function() {
        $(this).submit();
    });
    
    // Анимация для элементов при прокрутке
    $(window).scroll(function() {
        $('.animate-on-scroll').each(function() {
            const elementTop = $(this).offset().top;
            const elementVisible = 150;
            const windowBottom = $(window).scrollTop() + $(window).height();
            
            if (elementTop < windowBottom - elementVisible) {
                $(this).addClass('animate__animated animate__fadeInUp');
            }
        });
    });
});

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Показываем уведомление
    setTimeout(() => notification.classList.add('show'), 100);

    // Скрываем и удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Функция для обновления счетчика избранных товаров
function updateFavoritesCounter() {
    const counter = document.querySelector('.favorites-counter');
    if (counter) {
        fetch('/shop/favorites/count/')
            .then(response => response.json())
            .then(data => {
                counter.textContent = data.count;
                counter.style.display = data.count > 0 ? 'block' : 'none';
            });
    }
}

// Обработчик для кнопок избранного
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.dataset.productId;
            
            fetch(`/shop/toggle-favorite/${productId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    this.classList.toggle('active');
                    showNotification(data.message, 'success');
                    updateFavoritesCounter();
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                showNotification('Произошла ошибка. Попробуйте позже.', 'error');
            });
        });
    });

    // Инициализация счетчика избранных товаров при загрузке страницы
    updateFavoritesCounter();
});

// Функция для показа диалога подтверждения
function showConfirmation(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Функция для подтверждения продолжения итерации
function confirmContinue(callback) {
    if (confirm('Продолжить итерацию?')) {
        callback();
    }
}

function confirmLogout() {
    if (confirm('Продолжить итерацию?')) {
        document.getElementById('logoutForm').submit();
    }
}