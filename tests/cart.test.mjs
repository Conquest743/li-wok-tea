import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sanitizeCart, changeQuantity, cartSummary, orderText } from '../site/cart.js';
const menu = JSON.parse(await readFile(new URL('../site/menu.json', import.meta.url), 'utf8'));
test('damaged persisted cart cannot inject prices, unknown dishes or invalid quantities', () => {
  assert.deepEqual(sanitizeCart({ 'udon-chicken': 99, 'soba': -1, 'cheese': 2.5, 'cola': '3', 'invented': 1, '__proto__': 2 }, menu), { 'udon-chicken': 20 });
  assert.deepEqual(sanitizeCart(null, menu), {});
  assert.deepEqual(sanitizeCart([], menu), {});
});
test('quantities, removal and totals reflect the verified menu', () => {
  let cart = changeQuantity({}, 'udon-chicken', 2, menu);
  cart = changeQuantity(cart, 'cola', 1, menu);
  assert.equal(cartSummary(cart, menu).total, 1350);
  assert.equal(cartSummary(cart, menu).count, 3);
  cart = changeQuantity(cart, 'udon-chicken', -2, menu);
  assert.deepEqual(cart, { cola: 1 });
  assert.deepEqual(changeQuantity(cart, 'fake', 1, menu), cart);
});
test('handoff distinguishes pickup, delivery and estimated menu subtotal', () => {
  const cart = { 'udon-chicken': 2, cola: 1 };
  const pickup = orderText(cart, menu);
  assert.match(pickup, /Самовывоз: Советская, 17Б/);
  assert.match(pickup, /1350 ₽/);
  assert.match(pickup, /Подтвердите/);
  const delivery = orderText(cart, menu, { method: 'delivery', address: ' Советская 20 ', name: ' Анна ', comment: ' Без лука ' });
  assert.match(delivery, /Доставка. Адрес: Советская 20/);
  assert.match(delivery, /Имя: Анна/);
  assert.match(delivery, /Комментарий: Без лука/);
  assert.doesNotMatch(delivery, /Самовывоз/);
  assert.equal(orderText({}, menu), '');
});
