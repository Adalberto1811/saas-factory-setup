import { spawn } from 'child_process';

const N8N_MCP_ENDPOINT = 'http://3.148.170.122:5678/mcp-server/http';
const N8N_MCP_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjgxNTUzOC03ZTc1LTQ5MDktODgwOC0xZWI4MGQyMmJmMTQiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6IjY0OGI1NzY3LTE2ODUtNGZkZi04OTE1LTgwZjdlNTAyZDg4YiIsImlhdCI6MTc2ODgyODkwOH0.DngIn2OpHIEi9rsEWDNBBKboT5V7D7JPXBshlpx-j0E';

async function verify() {
    console.log(`Verifying N8N MCP connectivity to: ${N8N_MCP_ENDPOINT}`);

    const args = [
        '-y', 'supergateway',
        '--streamableHttp', N8N_MCP_ENDPOINT,
        '--header', `authorization:${N8N_MCP_TOKEN}`
    ];

    const child = spawn('npx', args, {
        stdio: ['pipe', 'pipe', 'inherit'],
        shell: true
    });

    child.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('N8N MCP Output:', output);
        if (output.includes('resources/list') || output.includes('tools/list')) {
            console.log('✅ N8N MCP server is responding!');
            process.exit(0);
        }
    });

    // Send a list resources request
    const request = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'resources/list',
        params: {}
    }) + '\n';

    setTimeout(() => {
        console.log('Sending resources/list request...');
        child.stdin.write(request);
    }, 2000);

    setTimeout(() => {
        console.error('❌ Verification timed out after 15 seconds.');
        child.kill();
        process.exit(1);
    }, 15000);
}

verify().catch(console.error);
