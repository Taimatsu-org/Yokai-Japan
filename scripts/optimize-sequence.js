const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const INPUT_DIR = process.argv[2] || path.join(require('os').homedir(), 'Downloads', 'sequence Yokai 01');
const OUT_DIR = path.join(__dirname, '..', 'sequence');
const DESKTOP_DIR = path.join(OUT_DIR, 'desktop');
const MOBILE_DIR = path.join(OUT_DIR, 'mobile');

const DESKTOP_WIDTH = 1920;
const DESKTOP_HEIGHT = 1080;
const MOBILE_WIDTH = 960;
const MOBILE_HEIGHT = 540;
const WEBP_QUALITY = 82;

async function run() {
  [DESKTOP_DIR, MOBILE_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

  const files = fs.readdirSync(INPUT_DIR)
    .filter(f => /^Frame_\d{4}\.png$/i.test(f))
    .sort();

  console.log(`Found ${files.length} frames in ${INPUT_DIR}`);

  let totalDesktop = 0, totalMobile = 0;

  for (let i = 0; i < files.length; i++) {
    const src = path.join(INPUT_DIR, files[i]);
    const num = files[i].match(/\d{4}/)[0];
    const outName = `frame_${num}.webp`;

    // Desktop
    const dBuf = await sharp(src)
      .resize(DESKTOP_WIDTH, DESKTOP_HEIGHT, { fit: 'fill' })
      .webp({ quality: WEBP_QUALITY, effort: 6 })
      .toBuffer();
    fs.writeFileSync(path.join(DESKTOP_DIR, outName), dBuf);
    totalDesktop += dBuf.length;

    // Mobile
    const mBuf = await sharp(src)
      .resize(MOBILE_WIDTH, MOBILE_HEIGHT, { fit: 'fill' })
      .webp({ quality: WEBP_QUALITY, effort: 6 })
      .toBuffer();
    fs.writeFileSync(path.join(MOBILE_DIR, outName), mBuf);
    totalMobile += mBuf.length;

    if ((i + 1) % 10 === 0 || i === files.length - 1) {
      console.log(`  ${i + 1}/${files.length} — desktop: ${(dBuf.length / 1024).toFixed(0)}KB, mobile: ${(mBuf.length / 1024).toFixed(0)}KB`);
    }
  }

  console.log(`\nDone!`);
  console.log(`Desktop total: ${(totalDesktop / 1024 / 1024).toFixed(1)} MB (avg ${(totalDesktop / files.length / 1024).toFixed(0)} KB/frame)`);
  console.log(`Mobile total:  ${(totalMobile / 1024 / 1024).toFixed(1)} MB (avg ${(totalMobile / files.length / 1024).toFixed(0)} KB/frame)`);
}

run().catch(err => { console.error(err); process.exit(1); });
