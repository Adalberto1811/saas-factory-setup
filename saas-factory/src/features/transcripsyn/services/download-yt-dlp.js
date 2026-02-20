const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
const dest = path.join(__dirname, 'yt-dlp.exe');

function downloadFile(targetUrl) {
    console.log(`📡 Solicitando: ${targetUrl}`);
    https.get(targetUrl, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
            return downloadFile(res.headers.location);
        }

        if (res.statusCode !== 200) {
            console.error(`❌ Error HTTP: ${res.statusCode}`);
            return;
        }

        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log('✅ Descarga completada: yt-dlp.exe');
        });
    }).on('error', (err) => {
        console.error(`❌ Error de red: ${err.message}`);
    });
}

console.log(`📥 Iniciando descarga de yt-dlp.exe...`);
downloadFile(url);
