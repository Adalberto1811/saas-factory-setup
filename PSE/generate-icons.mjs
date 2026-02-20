import sharp from 'sharp';
import path from 'path';

const SOURCE = path.join(process.cwd(), 'public/pse_metallic_logo_v2.png');
const ICONS_DIR = path.join(process.cwd(), 'public/icons');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function generateIcons() {
    console.log('🎨 Generando iconos PWA desde pse_metallic_logo_v2.png...');

    // Icon 192x192
    await sharp(SOURCE)
        .resize(192, 192, { fit: 'contain', background: { r: 5, g: 5, b: 5, alpha: 1 } })
        .png()
        .toFile(path.join(ICONS_DIR, 'icon-192.png'));
    console.log('✅ icon-192.png generado');

    // Icon 512x512
    await sharp(SOURCE)
        .resize(512, 512, { fit: 'contain', background: { r: 5, g: 5, b: 5, alpha: 1 } })
        .png()
        .toFile(path.join(ICONS_DIR, 'icon-512.png'));
    console.log('✅ icon-512.png generado');

    // Favicon 32x32
    await sharp(SOURCE)
        .resize(32, 32, { fit: 'contain', background: { r: 5, g: 5, b: 5, alpha: 1 } })
        .png()
        .toFile(path.join(PUBLIC_DIR, 'favicon.png'));
    console.log('✅ favicon.png generado');

    // Apple touch icon 180x180
    await sharp(SOURCE)
        .resize(180, 180, { fit: 'contain', background: { r: 5, g: 5, b: 5, alpha: 1 } })
        .png()
        .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
    console.log('✅ apple-touch-icon.png generado');

    console.log('🏁 Todos los iconos generados correctamente!');
}

generateIcons().catch(console.error);
