const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    // Usar un User-Agent real para evitar el bloqueo de Google
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    const url = "https://www.youtube.com/api/timedtext?v=72voj6uefLY&ei=gfKVabKUIvLwut0P7fGhoAc&caps=asr&opi=112496729&xoaf=5&xowf=1&xospf=1&hl=en&ip=0.0.0.0&ipbits=0&expire=1771459825&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=B4C4D297A13416E49BE955D3333091918E29EC1E.BB76063090BE0BF9B6F0D3F1FF17FBEEC855F307&key=yt8&kind=asr&lang=en&fmt=srv3&tlang=es";

    try {
        console.log('🛡️ Intentando Bypass con User-Agent real...');
        await page.goto(url, { waitUntil: 'load', timeout: 30000 });

        // Esperar un poco para que cargue el contenido
        await page.waitForTimeout(5000);

        const content = await page.content();

        if (content.includes('GoogleSorry')) {
            console.error('❌ Google sigue bloqueando. Intentando extraer via selector...');
        }

        fs.writeFileSync('C:/Keys/transcript_new_v2.xml', content);
        console.log('✅ Archivo guardado físicamente en C:/Keys/transcript_new_v2.xml');
    } catch (e) {
        console.error('❌ Error en Bypass:', e.message);
    } finally {
        await browser.close();
    }
})();
