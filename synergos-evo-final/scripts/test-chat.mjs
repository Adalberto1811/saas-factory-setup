
async function testChat() {
    console.log("🚀 Testing Chat API...");
    try {
        const fetch = (await import('node-fetch')).default; // Ensure we use node-fetch if in older node, or native if new. 
        // Applying native fetch for Node 18+

        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'Say hello!' }]
            })
        });

        console.log(`📡 Status: ${response.status}`);

        if (!response.ok) {
            const text = await response.text();
            console.error("❌ Error Body:", text);
            return;
        }

        console.log("✅ Response OK, reading stream...");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            console.log("📦 Chunk:", chunk);
        }
        console.log("🏁 Stream Finished");

    } catch (e) {
        console.error("💥 Crashed:", e);
    }
}

// Check if fetch available (Node 18+)
if (!globalThis.fetch) {
    console.log("⚠️ Old Node detected, this test requires Node 18+");
} else {
    testChat();
}
