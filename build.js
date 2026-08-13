const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const srcDir = path.join(__dirname, "src");
const distDir = path.join(__dirname, "dist");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Files to concatenate (order matters)
const mainFiles = [
  "00-shopify.js",
  "01-shimmer-utility.js",
  "02-shimmer-init.js",
  "03-nav.js",
  "04-button-line.js",
  "05-concept-scroll.js",
  "06-accordion.js",
  "07-loader.js",
  "08-mask-reveal.js",
  "09-sound-toggle.js",
  "10-nav-scrollto.js",
  "11-lightbox.js",
  "12-store-tabs.js",
  "14-mob-nav.js",
  "15-store-map.js",
  "16-locale-switch.js",
];

// 1. Build main.min.js
const concatenated = mainFiles
  .map((file) => fs.readFileSync(path.join(srcDir, file), "utf8"))
  .join("\n;\n");

esbuild
  .transform(concatenated, { minify: true, target: "es2020" })
  .then((result) => {
    fs.writeFileSync(path.join(distDir, "main.min.js"), result.code);
    const size = (Buffer.byteLength(result.code) / 1024).toFixed(1);
    console.log(`✓ dist/main.min.js (${size} KB)`);
  })
  .catch((err) => {
    console.error("Error building main.min.js:", err);
    process.exit(1);
  });

// 2. Build bottle-sequence.min.js (ES module)
const seqSrc = fs.readFileSync(
  path.join(srcDir, "13-bottle-sequence.js"),
  "utf8",
);

esbuild
  .transform(seqSrc, { minify: true, target: "es2020", format: "esm" })
  .then((result) => {
    fs.writeFileSync(path.join(distDir, "bottle-sequence.min.js"), result.code);
    const size = (Buffer.byteLength(result.code) / 1024).toFixed(1);
    console.log(`✓ dist/bottle-sequence.min.js (${size} KB)`);
  })
  .catch((err) => {
    console.error("Error building bottle-sequence.min.js:", err);
    process.exit(1);
  });
