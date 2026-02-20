import { spawn } from 'child_process';

const serverCmd = 'notebooklm-mcp';

const askQuestionCall = {
    jsonrpc: "2.0",
    id: "analyze-moltbot-v2",
    method: "tools/call",
    params: {
        name: "ask_question",
        arguments: {
            notebook_id: "moltbot",
            question: "What is the core logic, primary purpose, and key instructions of Moltbot? Summarize its features and tell me how it expects to interact with the environment.",
            browser_options: {
                show: true,
                headless: false,
                stealth: {
                    enabled: true
                }
            }
        }
    }
};

const server = spawn(serverCmd, ['server'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: true
});

server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
});

setTimeout(() => {
    server.stdin.write(JSON.stringify(askQuestionCall) + '\n');
}, 5000);

setTimeout(() => {
    server.kill();
    process.exit();
}, 90000); // 1.5 minutes
