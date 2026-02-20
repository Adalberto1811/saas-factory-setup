const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runScraping(url) {
    console.log(`🤖 Iniciando Scraper Playwright para: ${url}`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('📡 Navegando a YouTube...');

        // Iniciamos la captura de la respuesta en paralelo
        const transcriptPromise = page.waitForResponse(response =>
            response.url().includes('youtube.com/api/timedtext') && response.status() === 200,
            { timeout: 60000 }
        ).then(async response => {
            const body = await response.text();
            if (body && body.length > 100) {
                const outputPath = path.join(process.cwd(), 'downloads', 'transcripts', 'intercepted_transcript.json');
                fs.mkdirSync(path.dirname(outputPath), { recursive: true });
                fs.writeFileSync(outputPath, body);
                console.log(`🎯 ¡ÉXITO! Transcripción capturada vía RED en: ${outputPath}`);
                return true;
            }
            return false;
        }).catch(e => {
            console.warn('⚠️ No se interceptó la petición timedtext dentro del tiempo límite.');
            return false;
        });

        await page.goto(url, { waitUntil: 'networkidle' });

        // Metadata básica
        const title = await page.title();
        console.log(`✅ Título: ${title}`);

        // Forzar la aparición de subtítulos para disparar la red
        console.log('📡 Intentando disparar CC para captura de red...');
        const ccButton = page.locator('.ytp-subtitles-button');
        if (await ccButton.isVisible()) {
            await ccButton.click();
        }

        const success = await transcriptPromise;

        if (success) {
            console.log('🎯 Proceso completado vía RED.');
            return;
        }

        // Fallback manual si la red falla
        console.log('🔍 Falló red. Intentando Panel Visual...');
        const moreButton = page.locator('tp-yt-paper-button#expand').first();
        if (await moreButton.isVisible()) {
            await moreButton.click();
        }
        await page.waitForTimeout(2000);

        const transcriptButton = page.locator('button:has-text("Show transcript")').first();
        if (await transcriptButton.isVisible()) {
            await transcriptButton.click();
            await page.waitForSelector('ytd-transcript-segment-renderer', { timeout: 20000 });
            const segments = await page.locator('ytd-transcript-segment-renderer .segment-text').allTextContents();
            if (segments.length > 0) {
                const fullText = segments.join('\n');
                fs.writeFileSync(path.join(process.cwd(), 'downloads', 'transcripts', 'scraped_transcript.txt'), fullText);
                console.log('✅ Éxito vía Panel Visual.');
            }
        }

    } catch (e) {
        console.error('❌ Error en proceso:', e.message);
    } finally {
        await browser.close();
    }
}

const targetUrl = process.argv[2] || 'https://www.youtube.com/watch?v=epwq26HsLBo';
runScraping(targetUrl);
