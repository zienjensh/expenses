// Simple script to create placeholder icons using SVG
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create SVG icon
function createSVGIcon(size) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#E50914;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#c00812;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.5}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">💰</text>
</svg>`;
}

// Create placeholder icons directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');

// For now, create SVG icons - these can be converted to PNG later
const sizes = [192, 512];

sizes.forEach(size => {
  const svg = createSVGIcon(size);
  const svgPath = path.join(publicDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`Created ${svgPath}`);
});

console.log('\n✅ SVG icons created!');
console.log('Note: You need to convert these to PNG format.');
console.log('You can use:');
console.log('  - Online converter: https://cloudconvert.com/svg-to-png');
console.log('  - Or use the generate-icons.html file in public/ folder');

