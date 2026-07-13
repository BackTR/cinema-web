import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '../public/icons');

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG icon Cinema App
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#1a1a2e"/>
  <rect x="40" y="40" width="432" height="432" rx="60" fill="#dc2626"/>
  <!-- Film strip -->
  <rect x="80" y="160" width="352" height="192" rx="16" fill="#1a1a2e"/>
  <!-- Play button -->
  <polygon points="200,200 200,312 340,256" fill="white"/>
  <!-- Film holes top -->
  <rect x="80" y="120" width="40" height="30" rx="6" fill="#dc2626"/>
  <rect x="160" y="120" width="40" height="30" rx="6" fill="#dc2626"/>
  <rect x="240" y="120" width="40" height="30" rx="6" fill="#dc2626"/>
  <rect x="320" y="120" width="40" height="30" rx="6" fill="#dc2626"/>
  <!-- Film holes bottom -->
  <rect x="80" y="362" width="40" height="30" rx="6" fill="#dc2626"/>
  <rect x="160" y="362" width="40" height="30" rx="6" fill="#dc2626"/>
  <rect x="240" y="362" width="40" height="30" rx="6" fill="#dc2626"/>
  <rect x="320" y="362" width="40" height="30" rx="6" fill="#dc2626"/>
</svg>
`;

const svgBuffer = Buffer.from(svgIcon);

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(outputDir, `icon-${size}x${size}.png`));
  console.log(`✅ Generated icon-${size}x${size}.png`);
}

console.log('🎬 All PWA icons generated!');