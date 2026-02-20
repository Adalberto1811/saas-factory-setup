import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAssets() {
    console.log('🖼️  Testing Image Generation...');
    try {
        const imgRes = await fetch('http://localhost:3000/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'A futuristic marketing robot high quality', productName: 'Synergos Test' })
        });
        const imgData = await imgRes.json();
        if (imgRes.ok && imgData.imageUrl) {
            console.log('✅ Image success:', imgData.imageUrl);
        } else {
            console.error('❌ Image failed:', imgData);
        }
    } catch (e) {
        console.error('❌ Image error:', e.message);
    }

    console.log('\n🎬 Testing Video Generation (Trigger)...');
    try {
        const vidRes = await fetch('http://localhost:3000/api/video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'Futuristic marketing high speed video' })
        });
        const vidData = await vidRes.json();
        if (vidRes.ok && (vidData.taskId || vidData.fallback)) {
            console.log('✅ Video trigger success:', vidData);
        } else {
            console.error('❌ Video trigger failed:', vidData);
        }
    } catch (e) {
        console.error('❌ Video error:', e.message);
    }
}

testAssets();
