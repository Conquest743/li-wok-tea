export const CART_KEY = 'li-cart-v1';
export const MAX_QUANTITY = 20;

export function sanitizeCart(value, menu) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const allowed = new Set(menu.map(item => item.id));
  return Object.fromEntries(Object.entries(value).filter(([id, quantity]) => allowed.has(id) && Number.isInteger(quantity) && quantity > 0).map(([id, quantity]) => [id, Math.min(quantity, MAX_QUANTITY)]));
}

export function changeQuantity(cart, id, delta, menu) {
  if (!menu.some(item => item.id === id) || !Number.isInteger(delta)) return { ...cart };
  const next = { ...cart };
  const value = Math.min(MAX_QUANTITY, Math.max(0, (next[id] || 0) + delta));
  if (value) next[id] = value;
  else delete next[id];
  return next;
}

export function cartSummary(cart, menu) {
  const items = menu.filter(item => cart[item.id]).map(item => ({ ...item, quantity: cart[item.id], subtotal: item.price * cart[item.id] }));
  return { items, total: items.reduce((sum, item) => sum + item.subtotal, 0), count: items.reduce((sum, item) => sum + item.quantity, 0) };
}

export function orderText(cart, menu, { method = 'pickup', address = '', name = '', comment = '' } = {}) {
  const { items, total } = cartSummary(sanitizeCart(cart, menu), menu);
  if (!items.length) return '';
  return [
    'Здравствуйте! Хочу заказать в Ли:',
    '',
    ...items.map(item => `${item.name} × ${item.quantity} = ${item.subtotal} ₽`),
    '',
    `Блюда на сумму: ${total} ₽ (по меню доставки Яндекс Еды).`,
    method === 'delivery' ? `Доставка. Адрес: ${address.trim() || 'уточню в переписке'}` : 'Самовывоз: Советская, 17Б.',
    name.trim() && `Имя: ${name.trim()}`,
    comment.trim() && `Комментарий: ${comment.trim()}`,
    'Подтвердите, пожалуйста, наличие, итоговую стоимость и время готовности.'
  ].filter(line => line !== false).join('\n');
}
