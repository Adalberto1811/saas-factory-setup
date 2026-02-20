
import { spawn } from 'child_process';
import fs from 'fs';

const API_KEY = "ik_f6c01cd3bd7cf495eac9df2e1e58b2ee"; // Fallback key from project files
const API_BASE_URL = "https://ai69pd2n.us-west.insforge.app";

async function runTool(toolName, args = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn('npx', ['-y', '@insforge/mcp', '--api_key', API_KEY, '--api_base_url', API_BASE_URL], {
            shell: true
        });

        let output = '';
        const call = {
            jsonrpc: '2.0',
            id: toolName,
            method: 'tools/call',
            params: {
                name: toolName,
                arguments: args
            }
        };

        child.stdin.write(JSON.stringify(call) + '\n');

        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        child.stderr.on('data', (data) => {
            console.error(`Error: ${data}`);
        });

        child.on('close', (code) => {
            try {
                const response = JSON.parse(output.split('\n').filter(line => line.trim().startsWith('{')).pop());
                resolve(response);
            } catch (e) {
                resolve(output);
            }
        });

        // Set a timeout to close the process
        setTimeout(() => {
            child.stdin.end();
        }, 5000);
    });
}

async function verify() {
    console.log("Checking Backend Metadata...");
    const metadata = await runTool('get-backend-metadata');
    fs.writeFileSync('insforge-full-metadata.json', JSON.stringify(metadata, null, 2));
    console.log("Metadata saved to insforge-full-metadata.json");

    console.log("Checking Google OAuth Provider status...");
    const docs = await runTool('fetch-docs', { docType: 'instructions' });
    fs.writeFileSync('insforge-instructions.json', JSON.stringify(docs, null, 2));
}

verify();
