const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: false }); // Usar headless: false para depurar si fuera necesario, pero aquí lo dejamos true para el agente
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    const url = "https://www.youtube.com/api/timedtext?v=72voj6uefLY&ei=gfKVabKUIvLwut0P7fGhoAc&caps=asr&opi=112496729&xoaf=5&xowf=1&xospf=1&hl=en&ip=0.0.0.0&ipbits=0&expire=1771459825&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=B4C4D297A13416E49BE955D3333091918E29EC1E.BB76063090BE0BF9B6F0D3F1FF17FBEEC855F307&key=yt8&kind=asr&lang=en&fmt=srv3&tlang=es";

    try {
        console.log('🕵️‍♂️ Iniciando Simulación Humana (Bypass Nivel 3)...');
        // Primero ir a YouTube home para establecer cookies básicas
        await page.goto('https://www.youtube.com', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        console.log('🚀 Navegando a la URL del transcript...');
        await page.goto(url, { waitUntil: 'load' });

        // Esperar un tiempo aleatorio humano
        await page.waitForTimeout(8000);

        const bodyContent = await page.evaluate(() => document.body.innerText);

        if (bodyContent.includes('GoogleSorry')) {
            console.error('❌ Google sigue bloqueando la IP. Intentando captura de emergencia...');
        }

        fs.writeFileSync('C:/Keys/transcript_v3.txt', bodyContent);
        console.log('✅ Archivo guardado físicamente en C:/Keys/transcript_v3.txt');
    } catch (e) {
        console.error('❌ Error en Bypass V3:', e.message);
    } finally {
        await browser.close();
    }
})();
