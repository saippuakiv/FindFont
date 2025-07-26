const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [16, 48, 128];
const svgPath = path.join(__dirname, '../src/static/icon.svg');
const outputDir = path.join(__dirname, '../src/static');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate PNG icons for each size
sizes.forEach((size) => {
  sharp(svgPath)
    .resize(size, size)
    .png()
    .toFile(path.join(outputDir, `icon${size}.png`))
    .then(() => console.log(`Generated ${size}x${size} icon`))
    .catch((err) =>
      console.error(`Error generating ${size}x${size} icon:`, err)
    );
});
