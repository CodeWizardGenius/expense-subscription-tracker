const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const writeIfMissing = (filename, base64) => {
  const filePath = path.join(assetsDir, filename);
  if (fs.existsSync(filePath)) return;
  fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
  console.log(`Created ${filePath}`);
};

// 1x1 transparent PNG
writeIfMissing('icon.png', 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Hw8AAgMBgQ1O9Z4AAAAASUVORK5CYII=');
writeIfMissing('splash.png', 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Hw8AAgMBgQ1O9Z4AAAAASUVORK5CYII=');
