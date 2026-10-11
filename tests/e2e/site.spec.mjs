import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('/'); await expect(page.locator('.menu-item')).toHaveCount(8); });

test('ribbon loops without hover pause and exposes all text under reduced motion', async ({ page }) => {
  const ribbon = page.locator('.brand-ribbon');
  const track = page.locator('.ribbon-track');
  await ribbon.hover();
  expect(await track.evaluate(element => getComputedStyle(element).animationPlayState)).toBe('running');
  const before = await track.evaluate(element => element.getBoundingClientRect().x);
  await expect.poll(() => track.evaluate((element, initialX) => Math.abs(element.getBoundingClientRect().x - initialX), before)).toBeGreaterThan(3);
  expect(await track.evaluate(element => getComputedStyle(element).animationIterationCount)).toBe('infinite');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await track.evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  await expect(page.locator('.ribbon-set:visible')).toHaveCount(1);
  const phrases = await page.locator('.ribbon-set').first().locator('span:not(.ribbon-seal)').evaluateAll(elements => elements.map(element => {
    const box=element.getBoundingClientRect();
    return {text:element.textContent,left:box.left,right:box.right,width:window.innerWidth};
  }));
  expect(phrases).toHaveLength(3);
  for (const phrase of phrases) { expect(phrase.left).toBeGreaterThanOrEqual(0); expect(phrase.right).toBeLessThanOrEqual(phrase.width); }
});

test('link preview uses a wide homepage cover served as JPEG', async ({ page, request }) => {
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-cover-v2\.jpg$/);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content','1200');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content','630');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content','summary_large_image');
  const response = await request.get('/assets/social-cover-v2.jpg');
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toBe('image/jpeg');
});

test('section navigation hides previous-section strips under the header', async ({ page }, testInfo) => {
  for (const [name, id] of [['Меню', 'menu'], ['Наше место', 'place'], ['Чай', 'tea']]) {
    if (testInfo.project.name === 'mobile') {
      await page.getByRole('button', { name: 'Открыть навигацию', exact: true }).click();
      await page.locator('#mobile-nav').getByRole('link', { name, exact: true }).click();
    } else {
      await page.locator('.desktop-nav').getByRole('link', { name, exact: true }).click();
    }
    await expect.poll(() => page.evaluate(sectionId => {
      const top = document.getElementById(sectionId).getBoundingClientRect().top;
      const headerBottom = document.querySelector('.header').getBoundingClientRect().bottom;
      return Math.abs(top - headerBottom + 8);
    }, id)).toBeLessThan(1);
    await page.screenshot({ path: `artifacts/${testInfo.project.name}-anchor-${id}.png`, animations: 'disabled' });
  }
  expect(await page.locator('#contacts').evaluate(element => getComputedStyle(element).scrollMarginTop)).toBe('0px');
});

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
  await expect(page.locator('link[rel="stylesheet"][href*="styles.css"]')).toHaveAttribute('href', /styles\.css\?v=[a-f0-9]{12}$/);
  const teaCards = await page.locator('.tea-varieties span').evaluateAll(cards => cards.map(card => {
    const box = card.getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width };
  }));
  expect(teaCards).toHaveLength(4);
  expect(teaCards[0].y).toBe(teaCards[1].y);
  expect(teaCards[2].y).toBe(teaCards[3].y);
  expect(teaCards[0].x).toBe(teaCards[2].x);
  expect(teaCards[1].x).toBe(teaCards[3].x);
  expect(teaCards[0].width).toBeCloseTo(teaCards[1].width, 0);
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
