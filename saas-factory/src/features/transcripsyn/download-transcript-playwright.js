const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const url = "https://www.youtube.com/api/timedtext?v=72voj6uefLY&ei=gfKVabKUIvLwut0P7fGhoAc&caps=asr&opi=112496729&xoaf=5&xowf=1&xospf=1&hl=en&ip=0.0.0.0&ipbits=0&expire=1771459825&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=B4C4D297A13416E49BE955D3333091918E29EC1E.BB76063090BE0BF9B6F0D3F1FF17FBEEC855F307&key=yt8&kind=asr&lang=en&fmt=srv3&tlang=es";

    try {
        console.log('🌐 Navegando a la URL de transcripción con Playwright...');
        await page.goto(url, { waitUntil: 'networkidle' });
        const content = await page.content();
        // Extraer solo el contenido XML del pre si es necesario (a veces Playwright envuelve en HTML)
        const cleanContent = content.match(/<timedtext[\s\S]*<\/timedtext>/) ? content.match(/<timedtext[\s\S]*<\/timedtext>/)[0] : content;

        fs.writeFileSync('c:/Keys/saas-factory-setup/saas-factory/downloads/transcripts/transcript_new.xml', cleanContent);
        console.log('✅ Transcripción descargada con éxito via Playwright.');
    } catch (e) {
        console.error('❌ Error fatal en Playwright:', e.message);
    } finally {
        await browser.close();
    }
})();
