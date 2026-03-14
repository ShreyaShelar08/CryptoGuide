import React from 'react';

function HeroMockup() {
  return (
    <div style={{ position: 'relative', width: '380px' }}>

      {/* Float card top-right — Portfolio gain */}
      <div style={{
        position: 'absolute', top: '-30px', right: '-40px',
        background: '#13174e', border: '1px solid rgba(52,211,153,0.25)',
        borderRadius: '16px', padding: '14px 18px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
        animation: 'floatY 4s ease-in-out infinite', zIndex: 2,
      }}>
        <div style={{ fontSize: '11px', color: '#6270a0', marginBottom: '4px' }}>Paper Portfolio</div>
        <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '20px', fontWeight: 800, color: '#f0f0ff' }}>$10,847</div>
        <div style={{ fontSize: '11px', color: '#34d399', marginTop: '2px' }}>↑ +$847 (+9.3%)</div>
      </div>

      {/* Main card */}
      <div style={{
        background: '#0f1340', border: '1px solid rgba(99,102,241,0.18)',
        borderRadius: '24px', padding: '24px',
        boxShadow: '0 8px 40px rgba(99,102,241,0.18)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <span style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '15px', fontWeight: 700 }}>⬡ CryptoGuide</span>
          <span style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.25)', color: '#22d3ee', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>● Live</span>
        </div>

        {/* Roadmap progress strip */}
        <div style={{ background: '#0b0e38', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', border: '1px solid rgba(99,102,241,0.08)' }}>
          <div style={{ fontSize: '10px', color: '#6270a0', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 700 }}>AI Roadmap · Week 3 of 5</div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            {['✓','✓','→','·','·'].map((s, i) => (
              <div key={i} style={{ flex: 1, height: '4px', borderRadius: '999px', background: i < 2 ? '#34d399' : i === 2 ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.1)', boxShadow: i === 2 ? '0 0 6px rgba(99,102,241,0.6)' : 'none' }} />
            ))}
          </div>
          <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>Currently: Your First Crypto Purchase</div>
        </div>

        {/* Chat messages */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>⬡</div>
          <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.08)', borderRadius: '12px', borderTopLeftRadius: '4px', padding: '10px 14px', fontSize: '12px', color: '#a8b4d8', lineHeight: 1.6 }}>
            <span style={{ color: '#a5b4fc', fontWeight: 600 }}>Roadmap tip:</span> Before buying, always use a <span style={{ color: '#a5b4fc', fontWeight: 600 }}>hardware wallet</span> for amounts over $500 🔐
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexDirection: 'row-reverse' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#151960', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>👤</div>
          <div style={{ background: 'rgba(30,27,128,0.5)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', borderTopRightRadius: '4px', padding: '10px 14px', fontSize: '12px', color: '#a8b4d8' }}>
            Can I practice with my portfolio first?
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>⬡</div>
          <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.08)', borderRadius: '12px', borderTopLeftRadius: '4px', padding: '10px 14px', fontSize: '12px', color: '#a8b4d8', lineHeight: 1.6 }}>
            Yes! Use the <span style={{ color: '#f59e0b', fontWeight: 600 }}>Portfolio Simulator</span> — $10k virtual cash, real prices, zero risk 📊
          </div>
        </div>

        {/* Quick reply chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['Open Simulator →', 'Next on roadmap', 'Tell me more'].map(chip => (
            <span key={chip} style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: '10px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>{chip}</span>
          ))}
        </div>
      </div>

      {/* Float card bottom-left — Roadmap progress */}
      <div style={{
        position: 'absolute', bottom: '-20px', left: '-50px',
        background: '#13174e', border: '1px solid rgba(99,102,241,0.18)',
        borderRadius: '16px', padding: '14px 18px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
        animation: 'floatY 4s ease-in-out 1.5s infinite', zIndex: 2,
      }}>
        <div style={{ fontSize: '11px', color: '#6270a0', marginBottom: '4px' }}>Roadmap</div>
        <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '20px', fontWeight: 800, color: '#f0f0ff' }}>2/5</div>
        <div style={{ fontSize: '11px', color: '#a5b4fc', marginTop: '2px' }}>Weeks done</div>
      </div>
    </div>
  );
}

export default function Hero({ onGetStarted }) {
  const stats = [
    { val: 'ASI-1', label: 'AI POWERED' },
    { val: '100%',  label: 'FREE TO START' },
    { val: '$10K',  label: 'VIRTUAL CASH' },
  ];

  return (
    <section style={{
      position: 'relative', zIndex: 1, minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      padding: '120px 60px 80px', gap: '60px',
    }}>
      {/* Left */}
      <div style={{ flex: 1, maxWidth: '560px', animation: 'fadeUp 0.8s ease both' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '999px', padding: '6px 16px', fontSize: '12px', fontWeight: 600, color: '#a5b4fc', letterSpacing: '0.5px', marginBottom: '28px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a5b4fc', animation: 'pulse 2s infinite' }} />
          Powered by ASI-1 Agentic AI
        </div>

        <h1 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '58px', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', marginBottom: '24px', color: '#f0f0ff' }}>
          Start Your<br />
          <span style={{ background: 'linear-gradient(90deg,#818cf8,#c4b5fd,#67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Web3 Journey</span><br />
          Today
        </h1>

        <p style={{ fontSize: '17px', color: '#a8b4d8', lineHeight: 1.7, marginBottom: '40px', maxWidth: '460px' }}>
          Your personal AI guide that walks you through blockchain, wallets, DeFi, and NFTs — with a personalized roadmap and a risk-free portfolio simulator.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button onClick={onGetStarted}
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: 'white', padding: '16px 36px', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 30px rgba(99,102,241,0.4)', transition: 'all 0.25s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(99,102,241,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(99,102,241,0.4)'; }}>
            🚀 Start Learning Free
          </button>
          </div>

        <div style={{ display: 'flex', gap: '32px', marginTop: '48px', paddingTop: '40px', borderTop: '1px solid rgba(99,102,241,0.08)' }}>
          {stats.map(({ val, label }) => (
            <div key={label}>
              <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '28px', fontWeight: 900, color: '#f0f0ff' }}>{val}</div>
              <div style={{ fontSize: '12px', color: '#6270a0', marginTop: '2px', letterSpacing: '0.5px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — mockup */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', animation: 'fadeUp 0.8s 0.2s ease both' }}>
        <HeroMockup />
      </div>
    </section>
  );
}