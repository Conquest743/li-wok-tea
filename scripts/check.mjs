import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const html = await readFile('site/index.html', 'utf8');
const menu = JSON.parse(await readFile('site/menu.json', 'utf8'));
assert.equal(menu.length, 30);
assert.equal(new Set(menu.map(item => item.id)).size, menu.length);
for (const item of menu) assert.ok(Number.isInteger(item.price) && item.price > 0);
assert.doesNotMatch(html, /демоверси|демо-верси|\bdemo\b/i);
assert.match(html, /seed 0e9e64db/);
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const value = match[1];
  if (value.startsWith('#')) assert.ok(ids.has(value.slice(1)), `Missing anchor ${value}`);
  if (value.startsWith('./')) await access(resolve('site', value.split(/[?#]/)[0]));
}
console.log('30 unique menu items, local assets, anchors and published copy validated.');
