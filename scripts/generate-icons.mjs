import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Keep browser, home-screen and header icons derived from one vector logo.
const logo = await fs.readFile(new URL('../public/logo.svg', import.meta.url));
await fs.writeFile(new URL('../app/icon.svg', import.meta.url), logo);
for (const [path, size] of [['../app/apple-icon.png', 180], ['../public/icon-192.png', 192], ['../public/icon-512.png', 512]]) {
  await sharp(logo).resize(size, size).png().toFile(fileURLToPath(new URL(path, import.meta.url)));
}
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(size => sharp(logo).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
images.forEach((image, index) => {
  const entry = 6 + index * 16;
  header[entry] = sizes[index];
  header[entry + 1] = sizes[index];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(image.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});
await fs.writeFile(new URL('../app/favicon.ico', import.meta.url), Buffer.concat([header, ...images]));
console.log('Generated Roadly favicon and app icons from public/logo.svg.');
