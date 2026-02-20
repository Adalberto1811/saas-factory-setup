import { spawn } from 'child_process';

const listToolsCall = {
    jsonrpc: "2.0",
    id: "list-tools",
    method: "tools/list",
    params: {}
};

const fetchDocsCall = {
    jsonrpc: "2.0",
    id: "fetch-docs",
    method: "tools/call",
    params: {
        name: "fetch-docs",
        arguments: {
            docType: "instructions"
        }
    }
};

const server = spawn('npx', ['-y', '@insforge/mcp'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: true,
    env: {
        ...process.env,
        API_KEY: "ik_f6c01cd3bd7cf495eac9df2e1e58b2ee",
        API_BASE_URL: "https://ai69pd2n.us-west.insforge.app"
    }
});

let accumulatedOutput = '';
server.stdout.on('data', (data) => {
    const output = data.toString();
    accumulatedOutput += output;

    if (output.includes('list-tools')) {
        console.log('\n🛠️ LISTANDO HERRAMIENTAS...');
        setTimeout(() => {
            server.stdin.write(JSON.stringify(fetchDocsCall) + '\n');
        }, 1000);
    }

    if (accumulatedOutput.includes('"id":"fetch-docs"') && accumulatedOutput.includes('"result"')) {
        console.log('\n✅ INSTRUCCIONES RECUPERADAS Y GUARDADAS EN insforge-docs.json');
        import('fs').then(fs => {
            fs.writeFileSync('insforge-docs.json', accumulatedOutput);
            server.kill();
            process.exit();
        });
    }
});

setTimeout(() => {
    server.stdin.write(JSON.stringify(listToolsCall) + '\n');
}, 5000);

setTimeout(() => {
    console.log('\n❌ TIMEOUT: El servidor no respondió a tiempo.');
    server.kill();
    process.exit();
}, 60000);
