import { TranscripSynService } from './src/features/transcripsyn/services/transcripsyn-service';
import { PDFGeneratorService } from './src/features/transcripsyn/services/pdf-generator-service';

async function testTranscripSyn(url: string) {
    const extractor = new TranscripSynService();
    const generator = new PDFGeneratorService();

    console.log('🚀 Iniciando TranscripSyn V3 Test...');
    try {
        const result = await extractor.getTranscription(url);
        console.log(`📝 Transcripción obtenida: ${result.title}`);

        const pdfPath = await generator.generateTranscriptionPDF({
            title: result.title,
            author: result.author,
            url: result.url,
            content: result.transcript
        });

        console.log(`✅ PDF Generado con éxito: ${pdfPath}`);
    } catch (error: any) {
        console.error('❌ Error en el test:', error.message);
    }
}

// URL de prueba (Socio, puedes cambiarla)
const testUrl = process.argv[2] || 'https://www.youtube.com/watch?v=epwq26HsLBo';
testTranscripSyn(testUrl);
