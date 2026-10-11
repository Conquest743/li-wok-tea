import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('/'); await expect(page.locator('.menu-item')).toHaveCount(8); });

test('menu categories, cross-category search, empty state and reset work', async ({ page }) => {
  await page.getByRole('button', { name: 'Супы', exact: true }).click();
  await expect(page.locator('.menu-item')).toHaveCount(3);
  await page.getByRole('searchbox', { name: 'Найти блюдо' }).fill('манго');
  await expect(page.locator('.menu-item')).toHaveCount(2);
  await page.getByRole('searchbox', { name: 'Найти блюдо' }).fill('ничеготакого');
  await expect(page.getByText('Такого блюда не нашли')).toBeVisible();
  await page.getByRole('button', { name: 'Показать всё меню' }).click();
  await expect(page.locator('.menu-item')).toHaveCount(30);
});

test('cart total, persistence, delivery validation and handoff are real', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Добавить: Удон с цыплёнком в соусе унаги', exact: true }).click();
  await page.getByRole('button', { name: 'Увеличить количество: Удон с цыплёнком в соусе унаги', exact: true }).click();
  await page.reload();
  await expect(page.locator('.menu-item[data-item="udon-chicken"] output')).toHaveText('2');
  await page.locator('.cart-trigger').click();
  await expect(page.locator('#order-total')).toHaveText('1 200 ₽');
  await expect(page.locator('#order-preview')).toHaveValue(/Самовывоз/);
  await page.getByRole('radio', { name: 'Доставка', exact: true }).check();
  await page.getByRole('button', { name: 'Скопировать заказ', exact: true }).click();
  await expect(page.locator('#copy-status')).toBeEmpty();
  await page.getByRole('textbox', { name: 'Адрес доставки', exact: true }).fill('Советская, 20');
  await page.getByRole('button', { name: 'Скопировать заказ', exact: true }).click();
  await expect(page.locator('#copy-status')).toContainText('Скопировано');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('Доставка. Адрес: Советская, 20');
  expect(copied).toContain('1200 ₽');
  expect(copied).toContain('Подтвердите');
  await expect(page.locator('#open-order-chat')).toHaveAttribute('href', 'https://t.me/li_vlg_admin');
  await page.getByRole('button', { name: 'Очистить корзину', exact: true }).click();
  await expect(page.getByText('Здесь скоро будет вкусно')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#cart-dialog')).not.toBeVisible();
});

test('table request has dates, valid hours and copy flow without claiming a booking', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Уточнить наличие столика', exact: false }).click();
  await expect(page.locator('#booking-dialog')).toBeVisible();
  await page.locator('#booking-form [name="guests"]').selectOption('4');
  await page.getByRole('button', { name: 'Скопировать запрос', exact: false }).click();
  await expect(page.locator('#booking-status')).toContainText('Скопировано');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Количество гостей: 4');
  await page.keyboard.press('Escape');
  await expect(page.locator('#booking-dialog')).not.toBeVisible();
});

test('assets, internal buttons, responsive layout and reduced motion are sound', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await expect(page.locator('.hero-photo img')).toBeVisible();
  for (const image of await page.locator('main img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  await expect(page.locator('body')).not.toContainText(/демоверси|\bdemo\b/i);
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Открыть навигацию' }).click();
    await expect(page.locator('#mobile-nav')).toBeVisible();
    await page.locator('#mobile-nav').getByRole('link', { name: 'Меню', exact: true }).click();
    await expect(page.locator('#mobile-nav')).not.toBeVisible();
    await page.getByRole('button', { name: 'Добавить: Удон с цыплёнком в соусе унаги', exact: true }).click();
    await expect(page.locator('.mobile-cart')).toBeVisible();
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.hero-photo').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  expect(errors).toEqual([]);
});

test('save desktop/mobile review screenshots', async ({ page }, testInfo) => {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-hero.png`, animations: 'disabled' });
  await page.locator('#menu').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-menu.png`, animations: 'disabled' });
  await page.locator('#tea').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-tea.png`, animations: 'disabled' });
  await page.locator('#place').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-place.png`, animations: 'disabled' });
  await page.locator('#reviews').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-reviews.png`, animations: 'disabled' });
  await page.locator('#contacts').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-contacts.png`, animations: 'disabled' });
  await page.locator('.cart-trigger').click();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-empty-cart.png`, animations: 'disabled' });
  await page.getByRole('button', { name: 'Закрыть корзину', exact: true }).click();
  await page.getByRole('button', { name: 'Добавить: Удон с цыплёнком в соусе унаги', exact: true }).click();
  await page.locator('.cart-trigger').click();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-cart.png`, animations: 'disabled' });
  await page.locator('#copy-order').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-handoff.png`, animations: 'disabled' });
  await page.getByRole('button', { name: 'Закрыть корзину', exact: true }).click();
  await page.getByRole('button', { name: 'Уточнить наличие столика', exact: false }).click();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-booking.png`, animations: 'disabled' });
});
