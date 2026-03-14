import React, { useState } from 'react';

// ── AI Roadmap Preview ────────────────────────────────────────────────────────
function RoadmapPreview() {
  const steps = [
    { week: 'Week 1', title: 'Blockchain Foundations',     desc: 'How blocks, nodes & consensus work', color: '#6366f1', done: true },
    { week: 'Week 2', title: 'Wallets & Security',         desc: 'Keys, seed phrases, staying safe',   color: '#8b5cf6', done: true },
    { week: 'Week 3', title: 'Your First Crypto Purchase', desc: 'Exchanges, fees & best practices',   color: '#a78bfa', done: false, active: true },
    { week: 'Week 4', title: 'DeFi & Yield Strategies',    desc: 'Pools, staking & passive income',    color: '#c4b5fd', done: false },
    { week: 'Week 5', title: 'Portfolio Management',       desc: 'Diversification & risk management',  color: '#ddd6fe', done: false },
  ];
  return (
    <div style={{ background: '#0a0d38', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '20px', padding: '24px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🗺️</div>
        <div>
          <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '13px', fontWeight: 800, color: '#f0f0ff' }}>Your AI Roadmap</div>
          <div style={{ fontSize: '10px', color: '#6270a0' }}>Crypto Investing · Beginner</div>
        </div>
        <div style={{ marginLeft: 'auto', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '999px', padding: '3px 10px', fontSize: '10px', color: '#34d399', fontWeight: 700 }}>2/5 Complete</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, background: s.done ? '#34d399' : s.active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.1)', border: s.active ? 'none' : s.done ? 'none' : '1.5px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'white', fontWeight: 700, boxShadow: s.active ? '0 0 12px rgba(99,102,241,0.5)' : 'none' }}>
                {s.done ? '✓' : s.active ? '→' : i + 1}
              </div>
              {i < steps.length - 1 && <div style={{ width: '1px', height: '16px', background: s.done ? 'rgba(52,211,153,0.4)' : 'rgba(99,102,241,0.1)', marginTop: '4px' }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: i < steps.length - 1 ? '4px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '12px', fontWeight: 800, color: s.done ? '#34d399' : s.active ? '#a5b4fc' : '#6270a0' }}>{s.title}</span>
                {s.active && <span style={{ fontSize: '9px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>CURRENT</span>}
              </div>
              <div style={{ fontSize: '11px', color: '#6270a0', marginTop: '1px' }}>{s.desc}</div>
            </div>
            <div style={{ fontSize: '10px', color: '#6270a0', flexShrink: 0, paddingTop: '2px' }}>{s.week}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Portfolio Simulator Preview ───────────────────────────────────────────────
function PortfolioPreview() {
  const holdings = [
    { coin: 'Bitcoin',  symbol: 'BTC', icon: '₿', amount: '$5,000', change: '+12.4%', pos: true, pct: 50 },
    { coin: 'Ethereum', symbol: 'ETH', icon: 'Ξ', amount: '$3,200', change: '+8.1%',  pos: true, pct: 32 },
    { coin: 'Solana',   symbol: 'SOL', icon: '◎', amount: '$1,100', change: '-2.3%',  pos: false, pct: 11 },
    { coin: 'Chainlink',symbol: 'LINK',icon: '⬡', amount: '$700',   change: '+5.6%',  pos: true,  pct: 7  },
  ];
  return (
    <div style={{ background: '#0a0d38', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '20px', padding: '24px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#f59e0b,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>📊</div>
          <div>
            <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '13px', fontWeight: 800, color: '#f0f0ff' }}>Paper Portfolio</div>
            <div style={{ fontSize: '10px', color: '#6270a0' }}>Practice with $10,000 virtual cash</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '18px', fontWeight: 900, color: '#f0f0ff' }}>$10,000</div>
          <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700 }}>+$847 (+9.3%)</div>
        </div>
      </div>
      {/* Bar chart */}
      <div style={{ display: 'flex', gap: '3px', height: '8px', borderRadius: '999px', overflow: 'hidden', marginBottom: '16px' }}>
        {[['#f59e0b', 50], ['#6366f1', 32], ['#8b5cf6', 11], ['#34d399', 7]].map(([c, w], i) => (
          <div key={i} style={{ width: `${w}%`, background: c, transition: 'width 0.5s ease' }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {holdings.map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'rgba(99,102,241,0.04)', borderRadius: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#a5b4fc', flexShrink: 0 }}>{h.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '12px', fontWeight: 800, color: '#f0f0ff' }}>{h.coin}</div>
              <div style={{ fontSize: '10px', color: '#6270a0' }}>{h.symbol} · {h.pct}%</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#f0f0ff' }}>{h.amount}</div>
              <div style={{ fontSize: '11px', color: h.pos ? '#34d399' : '#f87171', fontWeight: 600 }}>{h.change}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main NewFeatures Section ──────────────────────────────────────────────────
export default function NewFeatures({ onGetStarted }) {
  const [activeFeature, setActiveFeature] = useState(0);
  const features = [
    {
      id: 0,
      icon: '🗺️',
      tag: 'AI-Powered',
      title: 'Personalized AI Roadmap',
      subtitle: 'Your learning path, built by ASI-1',
      desc: 'After answering 2 quick questions, ASI-1 generates a custom week-by-week learning roadmap tailored to your goal and experience level. No generic courses — just what you actually need.',
      bullets: [
        '🎯 Built around your specific goal (investing, DeFi, NFTs)',
        '📅 Week-by-week milestones you can actually follow',
        '🔄 Updates as you learn and your interests evolve',
        '⚡ Powered by ASI-1 multi-step reasoning',
      ],
      color: '#6366f1',
      gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      preview: <RoadmapPreview />,
    },
    {
      id: 1,
      icon: '📊',
      tag: 'Risk-Free',
      title: 'Portfolio Simulator',
      subtitle: 'Practice investing without real money',
      desc: 'Start with $10,000 in virtual cash and build a paper portfolio. Buy and sell real crypto at live prices, track your performance, and learn from mistakes — completely risk-free.',
      bullets: [
        '💵 $10,000 virtual cash to start with immediately',
        '📈 Real crypto prices updated in real-time',
        '🧠 AI analysis of your portfolio decisions',
        '🏆 Learn what works before using real money',
      ],
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg,#f59e0b,#f97316)',
      preview: <PortfolioPreview />,
    },
  ];

  const active = features[activeFeature];

  return (
    <section id="features-new" style={{ padding: '120px 0', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 60px' }}>

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '999px', padding: '6px 16px', fontSize: '12px', fontWeight: 700, color: '#a5b4fc', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>
            ✦ Exclusive Features
          </div>
          <h2 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '52px', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.05, color: '#f0f0ff', marginBottom: '16px' }}>
            Tools that actually<br />
            <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>teach you Web3</span>
          </h2>
          <p style={{ fontSize: '18px', color: '#a8b4d8', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
            Not another course. CryptoGuide gives you interactive tools that make learning by doing possible.
          </p>
        </div>

        {/* Feature tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', justifyContent: 'center' }}>
          {features.map((f, i) => (
            <button key={f.id} onClick={() => setActiveFeature(i)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', borderRadius: '14px', border: activeFeature === i ? `1.5px solid ${f.color}` : '1.5px solid rgba(99,102,241,0.15)', background: activeFeature === i ? `rgba(${f.id === 0 ? '99,102,241' : '245,158,11'},0.1)` : 'rgba(15,19,64,0.6)', cursor: 'pointer', transition: 'all 0.25s', fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800, fontSize: '15px', color: activeFeature === i ? '#f0f0ff' : '#6270a0', boxShadow: activeFeature === i ? `0 0 24px rgba(${f.id === 0 ? '99,102,241' : '245,158,11'},0.2)` : 'none' }}
              onMouseEnter={e => { if (activeFeature !== i) { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.color = '#a8b4d8'; } }}
              onMouseLeave={e => { if (activeFeature !== i) { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#6270a0'; } }}>
              <span style={{ fontSize: '20px' }}>{f.icon}</span>
              {f.title}
            </button>
          ))}
        </div>

        {/* Feature detail */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center', animation: 'fadeUp 0.4s ease both' }} key={activeFeature}>

          {/* Left — description */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `rgba(${active.id === 0 ? '99,102,241' : '245,158,11'},0.1)`, border: `1px solid rgba(${active.id === 0 ? '99,102,241' : '245,158,11'},0.25)`, borderRadius: '999px', padding: '4px 12px', fontSize: '11px', fontWeight: 700, color: active.color, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
              {active.icon} {active.tag}
            </div>
            <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '38px', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.1, color: '#f0f0ff', marginBottom: '8px' }}>
              {active.title}
            </h3>
            <p style={{ fontSize: '15px', color: active.color, fontWeight: 600, marginBottom: '20px' }}>{active.subtitle}</p>
            <p style={{ fontSize: '16px', color: '#a8b4d8', lineHeight: 1.75, marginBottom: '32px' }}>{active.desc}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
              {active.bullets.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.08)', borderRadius: '12px', fontSize: '14px', color: '#a8b4d8', lineHeight: 1.5 }}>
                  {b}
                </div>
              ))}
            </div>

            <button onClick={onGetStarted}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: active.gradient, border: 'none', color: 'white', padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cabinet Grotesk',sans-serif", boxShadow: `0 0 28px rgba(${active.id === 0 ? '99,102,241' : '245,158,11'},0.4)`, transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 32px rgba(${active.id === 0 ? '99,102,241' : '245,158,11'},0.5)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              Try {active.title} →
            </button>
          </div>

          {/* Right — preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeUp 0.5s ease both' }}>
            {active.preview}
          </div>
        </div>

        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}`}</style>
      </div>
    </section>
  );
}