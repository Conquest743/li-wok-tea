import sharp from 'sharp';
const source = process.argv[2];
if (!source) throw new Error('Provide a current desktop-hero.png screenshot path.');
await sharp(source).extract({left:0,top:0,width:1440,height:810}).resize(1200,630,{fit:'contain',background:'#080808'}).jpeg({quality:92,mozjpeg:true}).toFile('site/assets/social-cover-v2.jpg');
console.log('Created 1200 × 630 social cover from the real homepage screenshot.');
