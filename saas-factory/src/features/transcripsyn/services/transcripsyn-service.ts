import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export interface TranscriptionResult {
    title: string;
    transcript: string;
    author: string;
    url: string;
}

export class TranscripSynService {
    private ytDlpPath: string;

    constructor() {
        // Apunta al ejecutable local descargado en Windows
        this.ytDlpPath = path.join(process.cwd(), 'src', 'features', 'transcripsyn', 'services', 'yt-dlp.exe');
    }

    async getTranscription(url: string): Promise<TranscriptionResult> {
        try {
            // 1. Obtener metadatos y transcripción
            // --get-title --get-filename --print metadata
            // Usamos --skip-download --write-auto-subs --sub-lang es,en --convert-subs srt
            const { stdout } = await execAsync(`"${this.ytDlpPath}" --skip-download --get-title --print uploader "${url}"`);
            const [title, author] = stdout.trim().split('\n');

            // 2. Extraer los subtítulos directamente a stdout si es posible
            // Note: yt-dlp prefiere escribir a archivo. Vamos a usar un enfoque de --print para el texto si es posible o leer el temp
            const { stdout: transcript } = await execAsync(`"${this.ytDlpPath}" --skip-download --write-auto-subs --sub-lang es,en --convert-subs srt --stdout "${url}"`);

            return {
                title: title || 'Video sin título',
                transcript: transcript || 'No se pudo extraer la transcripción automática.',
                author: author || 'Autor desconocido',
                url
            };
        } catch (error: any) {
            console.error('Error en TranscripSyn:', error.message);
            throw new Error(`Fallo en la extracción de TranscripSyn: ${error.message}`);
        }
    }
}
