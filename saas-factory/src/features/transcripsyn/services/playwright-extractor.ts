import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

export interface TranscriptionResult {
    title: string;
    transcript: string;
    author: string;
    url: string;
}

export class PlaywrightExtractor {
    async extract(url: string): Promise<TranscriptionResult> {
        console.log(`👁️ Iniciando extracción visual para: ${url}`);
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        const page = await context.newPage();

        try {
            await page.goto(url, { waitUntil: 'networkidle' });

            // 1. Extraer Metadata
            const title = await page.title();
            const author = await page.locator('#upload-info #channel-name a').getAttribute('href').then(h => h?.split('/').pop() || 'Desconocido').catch(() => 'Desconocido');

            console.log(`📊 Video detectado: ${title}`);

            // 2. Activar Subtítulos si es necesario
            // Intentamos hacer clic en el botón de subtítulos (CC)
            const ccButton = page.locator('.ytp-subtitles-button');
            if (await ccButton.isVisible()) {
                console.log('📡 Activando subtítulos...');
                const isPressed = await ccButton.getAttribute('aria-pressed');
                if (isPressed === 'false') {
                    await ccButton.click();
                }
            }

            // 3. Abrir la transcripción oficial si está disponible
            // Haz clic en "More" (...) y luego "Show transcript"
            console.log('📝 Intentando abrir panel de transcripción...');
            const expandedButton = page.locator('#expand');
            if (await expandedButton.isVisible()) {
                await expandedButton.click();
            }

            const showTranscriptButton = page.locator('button[aria-label="Show transcript"]');
            if (await showTranscriptButton.isVisible()) {
                await showTranscriptButton.click();
                await page.waitForSelector('ytd-transcript-segment-renderer', { timeout: 10000 });

                const segments = await page.locator('ytd-transcript-segment-renderer .segment-text').allTextContents();
                const transcript = segments.join('\n');

                return { title, author, url, transcript };
            }

            // Fallback: Captura básica si el panel no se abre
            return {
                title,
                author,
                url,
                transcript: "No se pudo abrir el panel de transcripción. YouTube podría estar usando un layout diferente o el video no tiene transcripción habilitada."
            };

        } catch (error: any) {
            console.error('❌ Error en PlaywrightExtractor:', error.message);
            throw error;
        } finally {
            await browser.close();
        }
    }
}
