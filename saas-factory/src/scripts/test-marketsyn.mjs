import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testMarketSyn() {
    console.log('🚀 Testing MarketSyn API...');

    try {
        const response = await fetch('http://localhost:3000/api/market-syn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productName: 'Software de Gestión para Talleres Mecánicos',
                price: '197',
                painPoint: 'Caos en la gestión de citas y falta de control en inventario de repuestos',
                companyInfo: { name: 'Synergos Test', industry: 'Automotive' }
            })
        });

        const data = await response.json();
        console.log('Response Status:', response.status);

        if (response.ok && (data.plan || data.days)) {
            console.log('✅ Strategy generated successfully!');
            console.log('Strategy:', data.strategy);
            const plan = data.plan || data.days;
            console.log('Days in plan:', plan.length);
            console.log('Sample day 1 script:', plan[0].script);
            process.exit(0);
        } else {
            console.error('❌ Generation Failed:', JSON.stringify(data, null, 2));
            process.exit(1);
        }
    } catch (e) {
        console.error('❌ Connection error:', e.message);
        process.exit(1);
    }
}

testMarketSyn();
