import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function diagnose() {
    console.log('🔍 Diagnosing OpenRouter...');
    console.log('Key:', OPENROUTER_API_KEY ? 'Present (ending in ...' + OPENROUTER_API_KEY.slice(-5) + ')' : 'MISSING');

    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`
            }
        });

        console.log('Response Status:', response.status);
        const data = await response.json();

        if (response.ok) {
            console.log('✅ Key is valid!');
            const freeModels = data.data.filter(m => m.id.includes(':free')).map(m => m.id);
            console.log('Free Models available:', freeModels.slice(0, 10));

            const geminiModels = data.data.filter(m => m.id.toLowerCase().includes('gemini')).map(m => m.id);
            console.log('Gemini Models available:', geminiModels.slice(0, 10));
        } else {
            console.error('❌ Error response:', data);
        }
    } catch (e) {
        console.error('❌ Connection error:', e.message);
    }
}

diagnose();
