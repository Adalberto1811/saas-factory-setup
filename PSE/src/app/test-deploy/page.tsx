export default function TestPage() {
    return (
        <div style={{ background: 'black', color: '#39FF14', padding: '100px', fontFamily: 'monospace' }}>
            <h1>PSE DEPLOY VERIFIED: V4.0.2</h1>
            <p>If you see this, the main branch IS deployed correctly.</p>
            <p>Timestamp: {new Date().toISOString()}</p>
        </div>
    );
}
