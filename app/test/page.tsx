export default function TestPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '3rem', color: '#10b981' }}>✅ Deployment Successful!</h1>
      <p style={{ fontSize: '1.5rem', marginTop: '20px' }}>
        Max's Learning Rocket is deployed on Vercel
      </p>
      <div style={{ marginTop: '40px' }}>
        <p>Environment Check:</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>✅ Next.js App Running</li>
          <li>{process.env.ANTHROPIC_API_KEY ? '✅' : '❌'} Anthropic API Key</li>
          <li>{process.env.NODE_ENV === 'production' ? '✅' : '⚠️'} Production Mode</li>
        </ul>
      </div>
      <div style={{ marginTop: '40px' }}>
        <a href="/" style={{ 
          backgroundColor: '#3b82f6', 
          color: 'white', 
          padding: '12px 24px', 
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '1.2rem'
        }}>
          Go to Main App →
        </a>
      </div>
    </div>
  );
}