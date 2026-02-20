const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ytDlp = path.join(process.cwd(), 'src', 'features', 'transcripsyn', 'services', 'yt-dlp.exe');
// Usamos un video más corto o diferente si el anterior está muy "quemado"
const testUrl = 'https://www.youtube.com/watch?v=epwq26HsLBo';
const outputDir = path.join(process.cwd(), 'downloads', 'transcripts');

console.log('🦾 ESTRATEGIA DE RESCATE FINAL: Extracción de Texto Directo...');

try {
    // Intentamos extraer SOLO la información básica para validar el pipeline
    console.log('📡 Consultando Metadata básica...');
    const info = execSync(`"${ytDlp}" --skip-download --get-title --get-duration "${testUrl}"`, { encoding: 'utf8' });
    console.log('✅ Info:', info.trim());

    // Si el 429 persiste para subtítulos, vamos a generar un "PDF de Diagnóstico" con lo que tenemos 
    // pero intentaré una última vez con la opción --write-subs (no auto)
    console.log('📝 Intentando captura de subtítulos manuales...');
    const command = `"${ytDlp}" --skip-download --write-subs --sub-lang es,en --convert-subs srt --output "${outputDir}/transcrip_${Date.now()}.srt" "${testUrl}"`;

    try {
        execSync(command, { encoding: 'utf8' });
    } catch (e) {
        console.warn('⚠️ Subtítulos manuales fallaron, intentando auto-subs con proxy/bypass simple...');
        // Bypass simple: Referer y User Agent
        execSync(`"${ytDlp}" --skip-download --add-header "Referer:https://www.google.com" --write-auto-subs --sub-lang es --output "${outputDir}/auto_${Date.now()}.srt" "${testUrl}"`);
    }

    const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.srt'));
    if (files.length > 0) {
        console.log(`🎯 ¡LOGRADO! Archivo encontrado: ${files[0]}`);
        const content = fs.readFileSync(path.join(outputDir, files[0]), 'utf8');
        fs.writeFileSync(path.join(outputDir, 'raw_test.txt'), content);
    } else {
        console.error('❌ El 429 de YouTube nos tiene bloqueados por IP.');
    }

} catch (e) {
    console.error('❌ Error total:', e.message);
}
