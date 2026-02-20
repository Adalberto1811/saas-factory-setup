const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractInitialData(url) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    console.log(`🤖 Navegando a: ${url}`);

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Extraer ytInitialData de los scripts
        const initialData = await page.evaluate(() => {
            return window.ytInitialData;
        });

        if (initialData) {
            const outputPath = path.join(process.cwd(), 'downloads', 'transcripts', 'ytInitialData.json');
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, JSON.stringify(initialData, null, 2));
            console.log(`✅ ytInitialData capturado en: ${outputPath}`);

            // Intentar encontrar la transcripción dentro del objeto complejo
            // YouTube suele guardarla en engagementPanels
            const panels = initialData.engagementPanels || [];
            const transcriptPanel = panels.find(p =>
                JSON.stringify(p).includes('transcript')
            );

            if (transcriptPanel) {
                console.log('✨ ¡Panel de transcripción encontrado en los datos iniciales!');
                fs.writeFileSync(
                    path.join(process.cwd(), 'downloads', 'transcripts', 'transcript_panel_data.json'),
                    JSON.stringify(transcriptPanel, null, 2)
                );
            } else {
                console.warn('⚠️ No se encontró el panel de transcripción en ytInitialData.');
            }
        } else {
            console.error('❌ No se pudo encontrar ytInitialData en la página.');
        }

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await browser.close();
    }
}

const targetUrl = process.argv[2] || 'https://www.youtube.com/watch?v=epwq26HsLBo';
extractInitialData(targetUrl);
