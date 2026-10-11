import { CART_KEY, MAX_QUANTITY, sanitizeCart, changeQuantity, cartSummary, orderText } from './cart.js';

const $ = selector => document.querySelector(selector);
const menuGrid = $('#menu-grid');
const orderForm = $('#order-form');
const cartDialog = $('#cart-dialog');
const bookingDialog = $('#booking-dialog');
const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
const icons = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
let menu = [];
let cart = {};
let category = 'wok';
let toastTimer;
let lastDialogTrigger;

function announce(text) {
  const toast = $('#toast');
  clearTimeout(toastTimer);
  toast.textContent = text;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
  catch { /* A blocked storage area leaves a fully usable in-memory cart. */ }
}

function quantityMarkup(item) {
  const quantity = cart[item.id] || 0;
  if (!quantity) return `<button class="add-button" data-add="${item.id}" aria-label="Добавить: ${escapeHtml(item.name)}">${icons('plus')}</button>`;
  return `<div class="quantity-control"><button data-change="${item.id}" data-delta="-1" aria-label="Уменьшить количество: ${escapeHtml(item.name)}">${icons('minus')}</button><output aria-label="Количество: ${escapeHtml(item.name)}">${quantity}</output><button data-change="${item.id}" data-delta="1" ${quantity >= MAX_QUANTITY ? 'disabled' : ''} aria-label="Увеличить количество: ${escapeHtml(item.name)}">${icons('plus')}</button></div>`;
}

function renderMenu() {
  const query = $('#menu-search').value.trim().toLocaleLowerCase('ru');
  // Search runs across the entire menu; category buttons select a category when search is cleared.
  const visible = menu.filter(item => query ? `${item.name} ${item.description}`.toLocaleLowerCase('ru').includes(query) : category === 'all' || item.category === category);
  $('#clear-search').hidden = !query;
  document.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(!query && button.dataset.category === category)));
  $('#menu-status').textContent = `Найдено блюд: ${visible.length}`;
  if (!visible.length) {
    menuGrid.innerHTML = `<div class="empty-menu"><h3>Такого блюда не нашли</h3><p>Попробуйте другое название или посмотрите всё меню.</p><button class="button outline" data-reset-menu>Показать всё меню</button></div>`;
    return;
  }
  menuGrid.innerHTML = visible.map(item => `<article class="menu-item" data-item="${item.id}"><div class="menu-item-text"><h3>${escapeHtml(item.name)}</h3><span class="menu-item-weight">${escapeHtml(item.weight)}</span><p>${escapeHtml(item.description)}</p></div><div class="menu-item-action"><strong class="menu-item-price">${money(item.price)}</strong>${quantityMarkup(item)}</div></article>`).join('');
}

function renderCart() {
  const { count, total, items } = cartSummary(cart, menu);
  document.querySelectorAll('.cart-count').forEach(element => { element.textContent = String(count); });
  document.querySelectorAll('.cart-total').forEach(element => { element.textContent = money(total); });
  $('.mobile-cart').hidden = count === 0;
  document.querySelectorAll('.cart-trigger').forEach(button => button.setAttribute('aria-label', `Открыть корзину, блюд: ${count}`));
  orderForm.hidden = count === 0;
  $('#order-total').textContent = money(total);
  if (!count) {
    $('#cart-items').innerHTML = `<div class="empty-cart">${icons('bag')}<h3>Здесь скоро будет вкусно</h3><p>Добавьте блюда из меню, а мы поможем собрать заказ.</p><button class="button primary" data-back-menu>Выбрать блюда ${icons('arrow')}</button></div>`;
  } else {
    $('#cart-items').innerHTML = items.map(item => `<article class="cart-item"><h3>${escapeHtml(item.name)}</h3><strong>${money(item.subtotal)}</strong>${quantityMarkup(item)}<button class="cart-item-remove" data-remove="${item.id}" aria-label="Удалить: ${escapeHtml(item.name)}">Удалить</button></article>`).join('');
  }
  updateOrderPreview();
}

function updateOrderPreview() {
  const values = Object.fromEntries(new FormData(orderForm));
  const delivery = values.method === 'delivery';
  $('#address-field').hidden = !delivery;
  orderForm.elements.address.required = delivery;
  orderForm.elements.address.disabled = !delivery;
  $('#pickup-address').hidden = delivery;
  $('#order-preview').value = orderText(cart, menu, values);
  $('#copy-status').textContent = '';
}

function updateQuantity(id, delta, origin) {
  const previous = cart[id] || 0;
  cart = changeQuantity(cart, id, delta, menu);
  saveCart();
  const inCart = Boolean(origin?.closest('#cart-dialog'));
  renderMenu();
  renderCart();
  // Rerendered controls retain keyboard focus at the same logical action.
  const host = inCart ? $('#cart-items') : menuGrid;
  const next = host.querySelector(`[data-change="${id}"][data-delta="${delta}"]`) || host.querySelector(`[data-add="${id}"]`) || (inCart ? cartDialog.querySelector('[data-close-dialog]') : null);
  next?.focus({ preventScroll: true });
  if (!previous && delta > 0) announce('Добавлено в заказ');
}

function openDialog(dialog, trigger) {
  lastDialogTrigger = trigger;
  dialog.showModal();
}
function closeDialog(dialog) { dialog.close(); }

document.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-open-cart')) { renderCart(); openDialog(cartDialog, button); }
  if (button.hasAttribute('data-open-booking')) { updateBookingPreview(); openDialog(bookingDialog, button); }
  if (button.hasAttribute('data-close-dialog')) closeDialog(button.closest('dialog'));
  if (button.dataset.add) updateQuantity(button.dataset.add, 1, button);
  if (button.dataset.change) updateQuantity(button.dataset.change, Number(button.dataset.delta), button);
  if (button.dataset.remove) {
    delete cart[button.dataset.remove]; saveCart(); renderCart(); renderMenu();
    cartDialog.querySelector('[data-close-dialog]')?.focus({ preventScroll: true });
    announce('Блюдо удалено из заказа');
  }
  if (button.hasAttribute('data-category')) { category = button.dataset.category; $('#menu-search').value = ''; renderMenu(); }
  if (button.hasAttribute('data-reset-menu')) { category = 'all'; $('#menu-search').value = ''; renderMenu(); $('#menu-search').focus({ preventScroll: true }); }
  if (button.hasAttribute('data-back-menu')) { closeDialog(cartDialog); $('#menu').scrollIntoView(); }
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeDialog(dialog);
  });
  dialog.addEventListener('close', () => lastDialogTrigger?.focus({ preventScroll: true }));
});

$('#menu-search').addEventListener('input', renderMenu);
$('#clear-search').addEventListener('click', () => { $('#menu-search').value = ''; renderMenu(); $('#menu-search').focus(); });
$('#clear-cart').addEventListener('click', () => { cart = {}; saveCart(); renderMenu(); renderCart(); announce('Корзина очищена'); });
orderForm.addEventListener('input', updateOrderPreview);
orderForm.addEventListener('change', updateOrderPreview);

async function copyText(text, textarea, status) {
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = 'Скопировано. Откройте чат и вставьте сообщение.';
  } catch {
    textarea.focus(); textarea.select();
    status.textContent = 'Выделили текст. Скопируйте его вручную и вставьте в чат.';
  }
}

orderForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!orderForm.reportValidity() || !cartSummary(cart, menu).count) return;
  const address = orderForm.elements.address;
  if (!address.disabled && !address.value.trim()) { address.setCustomValidity('Укажите адрес доставки.'); address.reportValidity(); return; }
  await copyText($('#order-preview').value, $('#order-preview'), $('#copy-status'));
});
orderForm.elements.address.addEventListener('input', () => orderForm.elements.address.setCustomValidity(''));

const bookingForm = $('#booking-form');
function localDate() { return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Moscow' }).format(new Date()); }
bookingForm.elements.date.min = localDate();
bookingForm.elements.date.value = localDate();
function updateBookingPreview() {
  const { date, time, guests } = Object.fromEntries(new FormData(bookingForm));
  const formatted = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date.split('-').reverse().join('.') : 'уточню дату';
  $('#booking-preview').value = `Здравствуйте! Есть ли свободный столик в Ли на ${formatted} в ${time || 'удобное время'}? ${guests === '7' ? 'Нас больше 6 человек.' : `Количество гостей: ${guests}.`} Подтвердите, пожалуйста, возможность визита.`;
  $('#booking-status').textContent = '';
}
bookingForm.addEventListener('input', updateBookingPreview);
bookingForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;
  await copyText($('#booking-preview').value, $('#booking-preview'), $('#booking-status'));
});

const navToggle = $('.nav-toggle');
function closeMobileNav() { $('#mobile-nav').hidden = true; navToggle.setAttribute('aria-expanded', 'false'); navToggle.setAttribute('aria-label', 'Открыть навигацию'); }
navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(expanded));
  navToggle.setAttribute('aria-label', expanded ? 'Закрыть навигацию' : 'Открыть навигацию');
  $('#mobile-nav').hidden = !expanded;
});
$('#mobile-nav').addEventListener('click', event => { if (event.target.closest('a')) closeMobileNav(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMobileNav(); });
matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeMobileNav(); });
window.addEventListener('storage', event => {
  if (event.key !== CART_KEY || !menu.length) return;
  try { cart = sanitizeCart(JSON.parse(event.newValue || '{}'), menu); }
  catch { cart = {}; }
  renderMenu(); renderCart();
});

async function loadMenu() {
  try {
    const response = await fetch(new URL('./menu.json', import.meta.url));
    if (!response.ok) throw new Error('Menu unavailable');
    const data = await response.json();
    if (!Array.isArray(data) || data.some(item => !item || typeof item.id !== 'string' || typeof item.name !== 'string' || typeof item.category !== 'string' || typeof item.description !== 'string' || typeof item.weight !== 'string' || !Number.isInteger(item.price) || item.price <= 0)) throw new Error('Invalid menu');
    menu = data;
    try { cart = sanitizeCart(JSON.parse(localStorage.getItem(CART_KEY) || '{}'), menu); } catch { cart = {}; }
    renderMenu(); renderCart();
  } catch {
    menuGrid.innerHTML = `<div class="empty-menu"><h3>Меню пока не загрузилось</h3><p>Попробуйте ещё раз или свяжитесь с нами по телефону.</p><button class="button outline" id="retry-menu">Загрузить меню ${icons('arrow')}</button><p><a href="tel:+79377393737">+7 937 739-37-37</a></p></div>`;
    $('#retry-menu').addEventListener('click', loadMenu, { once: true });
    $('#menu-status').textContent = 'Не удалось загрузить меню';
    renderCart();
  }
}
loadMenu();
