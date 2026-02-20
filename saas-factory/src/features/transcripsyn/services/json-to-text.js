const fs = require('fs');
const path = require('path');

const jsonPath = path.join(process.cwd(), 'downloads', 'transcripts', 'intercepted_transcript.json');
const textPath = path.join(process.cwd(), 'downloads', 'transcripts', 'final_transcript.txt');

try {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(rawData);

    let fullText = '';

    // YouTube timedtext format (WireMagic or similar)
    if (data.events) {
        fullText = data.events
            .map(event => event.segs ? event.segs.map(s => s.utf8).join('') : '')
            .filter(text => text.trim().length > 0)
            .join(' ');
    } else if (data.body && data.body.p) {
        // XML to JSON flattened format
        fullText = data.body.p
            .map(p => p['#text'] || p._ || '')
            .join(' ');
    } else {
        // Fallback for other JSON formats
        fullText = rawData;
    }

    // Limpieza básica
    fullText = fullText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    fs.writeFileSync(textPath, fullText);
    console.log(`✅ Transcripción convertida y guardada en: ${textPath}`);
    console.log(`📏 Longitud: ${fullText.length} caracteres.`);

} catch (e) {
    console.error('❌ Error convirtiendo JSON:', e.message);
}
