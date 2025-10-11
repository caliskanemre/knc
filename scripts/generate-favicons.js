const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../public/ksLogo.jpeg');
const outputDir = path.join(__dirname, '../public');

// Favicon boyutları ve formatları
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 }, // Apple devices için
  { name: 'android-chrome-192x192.png', size: 192 }, // Android için
  { name: 'android-chrome-512x512.png', size: 512 }, // Android için
];

async function generateFavicons() {
  try {
    console.log('Favicon dosyaları oluşturuluyor...\n');

    // Her boyut için favicon oluştur
    for (const config of sizes) {
      await sharp(inputFile)
        .resize(config.size, config.size, {
          fit: 'cover',
          position: 'center'
        })
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(path.join(outputDir, config.name));

      const stats = fs.statSync(path.join(outputDir, config.name));
      console.log(`✓ ${config.name} oluşturuldu (${Math.round(stats.size / 1024)} KB)`);
    }

    // favicon.ico dosyası oluştur (16x16)
    await sharp(inputFile)
      .resize(32, 32, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(path.join(outputDir, 'favicon.ico'));

    const icoStats = fs.statSync(path.join(outputDir, 'favicon.ico'));
    console.log(`✓ favicon.ico oluşturuldu (${Math.round(icoStats.size / 1024)} KB)`);

    console.log('\n✅ Tüm favicon dosyaları başarıyla oluşturuldu!');
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

generateFavicons();

