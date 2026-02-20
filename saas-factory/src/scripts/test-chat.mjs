import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testChat(retries = 5) {
    console.log(`🚀 Testing Synergos Chat API (Attempts remaining: ${retries})...`);

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'user', content: 'Hola Synergos, ¿quién eres y qué módulos tienes?' }
                ]
            })
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('AI Response:', JSON.stringify(data, null, 2));

        if (response.ok && data.content) {
            console.log('✅ Test Passed!');
            process.exit(0);
        } else {
            console.error('❌ Test Failed!');
            process.exit(1);
        }
    } catch (e) {
        if (retries > 0) {
            console.log('Waiting for server...');
            await new Promise(r => setTimeout(r, 5000));
            return testChat(retries - 1);
        }
        console.error('❌ Connection failed:', e.message);
        process.exit(1);
    }
}

testChat();
