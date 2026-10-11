import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';
const exec = promisify(execFile);
async function download(url, path) {
  await exec('powershell', ['-NoProfile', '-File', 'scripts/download.ps1', '-Url', url, '-Destination', path]);
  return readFile(path);
}
const assets = [
  ['entrance', 'https://avatars.mds.yandex.net/get-altay/16899665/2a0000019ab60067fb24db6ea6e6d2004ada/XXXL'],
  ['interior', 'https://avatars.mds.yandex.net/get-altay/16323929/2a0000019a9c7d1b19bd426aad643df7cf09/XXXL'],
  ['food-table', 'https://avatars.mds.yandex.net/get-altay/16418365/2a0000019aa04ec5fd220290577422a074b5/XXXL'],
  ['tea', 'https://cdn4.telesco.pe/file/hO5jSiwpO7sZbQv1jERhbN5erJDU2yeaRD7OxlBLDSoDYv4lqzIr1SV3_i8q41rDYLrxi0H3x6p6qQ4kaMoL4hYXo3WZ0nx9DZwtYV0xSunoSZEGWl8xrDbGpEHFjpr0yPqpG0dTsiwPqwPqHyeqnebGy5KKcjym8GQ5I3vnReCklgcVMJWywLbeiwKRh6izS96BwOhS1xTd5BGxhpCMFhVdKuHW3cRvrHoemoRooxRX_A91EiNaSXCRNEd2RF_W14P7zfzSBsTK2Og6wa17op4ZT-lx05cPcC_PBaxH4RK7641tdtapoHY8yxg7k7IVRcm26xWEmoriwEwvA9QaJg.jpg'],
  ['tea-ritual', 'https://cdn4.telesco.pe/file/fjD7pGPIytbqzwQRCCdWU5sHo4P-dRrN7rBFWwIahwrDefCgFRIsStwyz2cSDfG_PE9J_4MRG33SVDyQ5MjLeLTzbyaKvqMjzruZQSrJyNNy4tqiV8ceoDkg4QOZaBmiqTeb48kzHwQUKyHz5ijv4ThF23WKkRV6FmxgNllp4z3p2BKZpspOkKEpSPJNdT1N72tepXK0osJDxwJ1l4nITjkDUFORiCv0sL62vcZRHP-R0iUR45WZVbESAD9m4Q60-srEAQs51q-l_N1r5htA9AprqcXlkeH-VFsAjjHwtCg9DzIGKG0jGp-ipKlkZM_lZHBTh28thqPPAlqddYP7eA.jpg'],
  ['udon', 'https://cdn4.telesco.pe/file/o1lHtBZ6q4R_F04TSpemkfV5jbTB45U-8ZXPNJqvTL3ePvGPtp2RM0XTLVut69nBzipic7DPHb1Egh8xHV3a4858OUiWvxYRdBruJ_W8dBM3IDRu1K1z2AJ7JXK19Dya6rKnIHoTm25017nRU6RowKmUdc8gTFXsxjS4fCGGmx4Zxuy_yGwkk8jJxj4LfXEVOOvbnR3exmGMQ_UriM1rOy4vRKK5BMDB-Krsr_d97t31GOEmoT95honAwXAKjDULVZwBG0VZFiujq7RCs2bltR1-3y-bNqt_BinDnBoIZfCK3JGjNCafAgT5K8rSYPadkCrP6OD5CAnLYLwsps-uuw.jpg'],
  ['udon-alt', 'https://cdn4.telesco.pe/file/P4yn5yctTY27VYIc-KjianeapzUSnkCAtGURv1P6nom28nakKBKBecS39mkEV-NaHdrlNXWRxI1YWc_Dz2HrPI4ws9f1Z7YAf47Uw4SecgsW5NKF2GPNRLsn9Ra3RY-xNJ4mioJkPe7qiweCD0USu3_pG9qaceWvX5hOjq2vyfUlL1ugaV2ylg2h3CeFPATRhFqaVeqSfVSheqnYr2V-_LQKZcRQvIDyFVPV1viRJJlmukUiQgvdd22LDystgeWzhKDWzU4kul5VK0dEQqdeHbOGaJjtmcXTRZXr21o5mtw1UoZVqZAFpbUsuv425_rTI9y28dFrEXZTfIBnOV4QvQ.jpg'],
  ['strips', 'https://cdn4.telesco.pe/file/HGmNWT608jxXgwB6q74zZjYDkYU-WAu4SbiN9jHqCk57qpf1N8TiFm7CCdx2jXX3y2xpNDBgDRULyKTZfbiK7A_MKNHrVCb1pQABl6lzVjf3YscqvY8jvEOUV9rx8HsAuFNOHatbgM6iVCeLMGGJ4ZBxI0siia9S4gQX0AgSOLuVeIVzDhMDmiQbQYZDNpXOqk9joM7kqpKT-PuwTQmBzsY1vsK5vtiBmv7gMj_WBs6zDtjn7pT5adkoPHTIGZhpPGzhzIfBGO3M3j7C3E0wWV9aOjkSZJfR-TWTyRCFomPfwuBZwugW3RnGZgtyGq9nIR_KZiyi_Y1uJFnQUGqBPw.jpg']
];
await mkdir('site/assets', { recursive: true });
await mkdir('artifacts', { recursive: true });
const thumbs = [];
for (const [name, url] of assets) {
  const bytes = await download(url, `artifacts/${name}.jpg`);
  await sharp(bytes).rotate().resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 86 }).toFile(`site/assets/${name}.webp`);
  const thumb = await sharp(bytes).rotate().resize(270, 320, { fit: 'contain', background: '#161616' }).png().toBuffer();
  const label = Buffer.from(`<svg width="270" height="35"><rect width="270" height="35" fill="white"/><text x="8" y="24" font-size="18">${name}</text></svg>`);
  thumbs.push({ input: await sharp(thumb).extend({ bottom: 35, background: 'white' }).composite([{ input: label, top: 320, left: 0 }]).png().toBuffer(), top: Math.floor(thumbs.length / 4) * 355, left: (thumbs.length % 4) * 270 });
}
await sharp({ create: { width: 1080, height: 710, channels: 3, background: 'white' } }).composite(thumbs).png().toFile('artifacts/source-contact-sheet.png');
await writeFile('artifacts/asset-sources.json', JSON.stringify(assets, null, 2));
for (const [name, family] of [['oswald', 'Oswald:wght@500;600;700'], ['golos', 'Golos+Text:wght@400;500;600;700']]) {
  const css = (await download(`https://fonts.googleapis.com/css2?family=${family}&display=swap`, `artifacts/${name}.css`)).toString('utf8');
  let localCss = css;
  const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]))];
  for (let i = 0; i < urls.length; i++) {
    const ext = urls[i].endsWith('.woff2') ? 'woff2' : 'ttf';
    const path = `${name}-${i}.${ext}`;
    await download(urls[i], `site/assets/${path}`);
    localCss = localCss.replaceAll(urls[i], `./${path}`);
  }
  await writeFile(`site/assets/${name}.css`, localCss);
}
console.log(`Downloaded ${assets.length} original photos and local font files.`);
