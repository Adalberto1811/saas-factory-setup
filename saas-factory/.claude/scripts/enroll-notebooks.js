import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';
const notebookUrls = [
    "https://notebooklm.google.com/notebook/bec8d84b-59be-47bf-aeb0-ac2933e8bad1",
    "https://notebooklm.google.com/notebook/27bf2ea6-2284-444f-8b29-81202728ac59",
    "https://notebooklm.google.com/notebook/e21b62dd-291e-4c1a-b396-37b0b6e8f2d5",
    "https://notebooklm.google.com/notebook/64445eeb-a4a9-47ef-ab10-0f52afc589c3",
    "https://notebooklm.google.com/notebook/a4593bc7-5c61-4bea-9bdd-d10b432ff918",
    "https://notebooklm.google.com/notebook/27942e4a-71f4-47f2-97d4-a5eaceeaba11",
    "https://notebooklm.google.com/notebook/adc3dad8-aee4-4fe6-bdf8-42b6dd2c722c"
];

async function enrollNotebook(url, index) {
    return new Promise((resolve) => {
        const addNotebookCall = {
            jsonrpc: "2.0",
            id: `enroll-${index}`,
            method: "tools/call",
            params: {
                name: "add_notebook",
                arguments: {
                    url: url,
                    name: `Notebook_${index}`
                }
            }
        };

        const server = spawn(serverCmd, ['server'], {
            stdio: ['pipe', 'pipe', 'inherit'],
            shell: true
        });

        server.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes(`enroll-${index}`)) {
                console.log(`\n✅ Notebook ${index} enrolled:`, output);
                server.kill();
                resolve();
            }
        });

        setTimeout(() => {
            server.stdin.write(JSON.stringify(addNotebookCall) + '\n');
        }, 5000);

        setTimeout(() => {
            server.kill();
            resolve();
        }, 30000);
    });
}

async function main() {
    for (let i = 0; i < notebookUrls.length; i++) {
        console.log(`🚀 Matrículando cuaderno ${i + 1}/${notebookUrls.length}...`);
        await enrollNotebook(notebookUrls[i], i);
    }
}

main();
