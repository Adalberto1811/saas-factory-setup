import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testOpenRouter() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log('Testing OpenRouter connectivity...');

    if (!apiKey) {
        console.error('❌ OPENROUTER_API_KEY is missing from .env.local');
        process.exit(1);
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'SaaS Factory Health Check',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp:free',
                messages: [{ role: 'user', content: 'Connection test. Respond with OK.' }]
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ OpenRouter is responding!');
            console.log('Response:', data.choices[0].message.content);
            process.exit(0);
        } else {
            console.error('❌ OpenRouter Error:', JSON.stringify(data, null, 2));
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Connectivity Error:', error);
        process.exit(1);
    }
}

testOpenRouter();
