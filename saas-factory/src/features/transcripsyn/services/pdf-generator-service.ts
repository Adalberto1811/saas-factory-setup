import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface PDFData {
    title: string;
    author: string;
    url: string;
    content: string;
}

export class PDFGeneratorService {
    async generateTranscriptionPDF(data: PDFData): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const fileName = `${Date.now()}-${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
                const outputPath = path.join(process.cwd(), 'downloads', 'transcripts', fileName);

                const doc = new PDFDocument({ margin: 50 });
                const stream = fs.createWriteStream(outputPath);

                doc.pipe(stream);

                // Header Premium
                doc.fillColor('#059669').fontSize(24).text('TranscripSyn V3', { align: 'center' });
                doc.moveDown();
                doc.fillColor('#333').fontSize(10).text('Powered by Synergos Factory', { align: 'center' });
                doc.moveDown(2);

                // Metadatos
                doc.fillColor('#000').fontSize(18).text(data.title, { underline: true });
                doc.moveDown();
                doc.fontSize(12).text(`Autor: ${data.author}`);
                doc.text(`Fuente: ${data.url}`);
                doc.moveDown();
                doc.path('M 50 200 L 550 200').strokeColor('#ccc').stroke();
                doc.moveDown();

                // Contenido
                doc.fontSize(11).text(data.content, {
                    align: 'justify',
                    columns: 1,
                    lineGap: 5
                });

                doc.end();

                stream.on('finish', () => resolve(outputPath));
                stream.on('error', (err) => reject(err));
            } catch (error) {
                reject(error);
            }
        });
    }
}
