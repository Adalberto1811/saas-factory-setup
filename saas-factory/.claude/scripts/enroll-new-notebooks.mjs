import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';
const notebookUrls = [
    "https://notebooklm.google.com/notebook/0ff2dbe0-0010-4057-9ea1-f342d171a732"
];

async function enrollNotebook(url, index) {
    return new Promise((resolve) => {
        const addNotebookCall = {
            jsonrpc: "2.0",
            id: `enroll-new-${index}`,
            method: "tools/call",
            params: {
                name: "add_notebook",
                arguments: {
                    url: url,
                    name: `Notebook_New_${index}`
                }
            }
        };

        console.log(`🔗 Intentando matricular: ${url}`);

        const server = spawn(serverCmd, ['server'], {
            stdio: ['pipe', 'pipe', 'inherit'],
            shell: true
        });

        server.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes(`enroll-new-${index}`)) {
                console.log(`✅ Success for ${url}`);
                server.kill();
                resolve();
            }
        });

        setTimeout(() => {
            server.stdin.write(JSON.stringify(addNotebookCall) + '\n');
        }, 5000);

        setTimeout(() => {
            console.log(`⚠️ Timeout alcanzado para ${url}`);
            server.kill();
            resolve();
        }, 30000);
    });
}

async function main() {
    for (let i = 0; i < notebookUrls.length; i++) {
        console.log(`🚀 [${i + 1}/${notebookUrls.length}] Procesando nuevo cuaderno...`);
        await enrollNotebook(notebookUrls[i], i);
    }
    console.log("🏁 Proceso de matriculación finalizado.");
}

main();
