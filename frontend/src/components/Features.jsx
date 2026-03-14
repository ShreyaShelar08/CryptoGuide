import React from 'react';
import { useReveal } from '../hooks/useReveal';

// Mini AI Roadmap preview for the feature card
function MiniRoadmap() {
  const steps = [
    { label: 'Blockchain Foundations', done: true },
    { label: 'Wallets & Security',     done: true },
    { label: 'Your First Purchase',    active: true },
    { label: 'DeFi & Yield',          done: false },
    { label: 'Portfolio Management',  done: false },
  ];
  return (
    <div style={{ flex: 1, background: '#0b0e38', borderRadius: '14px', padding: '16px', border: '1px solid rgba(99,102,241,0.08)' }}>
      <div style={{ fontSize: '10px', color: '#6270a0', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 700 }}>Your AI Roadmap — Week by Week</div>
      {steps.map(({ label, done, active }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', marginBottom: '6px', background: active ? 'rgba(99,102,241,0.08)' : 'transparent', border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent' }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: 'white', background: done ? '#34d399' : active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.1)', boxShadow: active ? '0 0 8px rgba(99,102,241,0.5)' : 'none' }}>
            {done ? '✓' : active ? '→' : ''}
          </div>
          <span style={{ fontSize: '12px', color: done ? '#34d399' : active ? '#a5b4fc' : '#6270a0', fontWeight: active ? 700 : 500 }}>{label}</span>
          {active && <span style={{ marginLeft: 'auto', fontSize: '9px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>NOW</span>}
        </div>
      ))}
    </div>
  );
}

function FeatureCard({ icon, iconBg, title, desc, delay = 0, big = false, children }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{
      background: '#0f1340', border: '1px solid rgba(99,102,241,0.08)',
      borderRadius: '20px', padding: '32px',
      gridColumn: big ? 'span 2' : 'span 1',
      display: big ? 'flex' : 'block', gap: big ? '40px' : 0,
      alignItems: big ? 'center' : 'flex-start',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ${delay}s ease, transform 0.6s ${delay}s ease`,
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(99,102,241,0.18)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ flex: big ? 1 : 'unset' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '14px', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: iconBg, marginBottom: '20px' }}>{icon}</div>
        <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '20px', fontWeight: 800, marginBottom: '10px', color: '#f0f0ff' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: '#a8b4d8', lineHeight: 1.7 }}>{desc}</p>
      </div>
      {children}
    </div>
  );
}

export default function Features() {
  const [headerRef, headerVisible] = useReveal();

  return (
    <section id="features" style={{ position: 'relative', zIndex: 1, padding: '100px 60px' }}>
      <div ref={headerRef} style={{ marginBottom: '60px', opacity: headerVisible ? 1 : 0, transform: headerVisible ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
        <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: '12px', fontWeight: 700, padding: '5px 14px', borderRadius: '999px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Features</div>
        <h2 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '42px', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '16px', color: '#f0f0ff' }}>
          Everything you need to<br />enter Web3 with confidence
        </h2>
        <p style={{ fontSize: '16px', color: '#a8b4d8', lineHeight: 1.7, maxWidth: '520px' }}>
          No textbooks. No YouTube rabbit holes. A smart AI agent + real tools that make learning by doing possible.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '20px' }}>
        <FeatureCard icon="🤖" iconBg="rgba(99,102,241,0.15)" title="ASI-1 Agentic AI" desc="Powered by Fetch.ai's ASI-1 — a multi-step agentic LLM that adapts to your pace, remembers context, and gives you real answers — not generic responses." delay={0} />

        <FeatureCard icon="⚡" iconBg="rgba(34,211,238,0.12)" title="Instant Personalization" desc="Answer 2 quick questions about your goal and experience level. That's it — your AI agent is instantly calibrated to teach you exactly what you need." delay={0.1} />

        <FeatureCard icon="🗺️" iconBg="rgba(167,139,250,0.12)" title="AI Roadmap Generator" desc="ASI-1 generates a personalized week-by-week learning roadmap based on your goal. No generic courses — a path built specifically for you, updated as you grow." delay={0.2} big>
          <MiniRoadmap />
        </FeatureCard>

        <FeatureCard icon="📊" iconBg="rgba(245,158,11,0.12)" title="Portfolio Simulator" desc="Practice with $10,000 virtual cash. Buy and sell real crypto at live prices, track P&L, and learn from mistakes completely risk-free before touching real money." delay={0.3} />

        <FeatureCard icon="🛡️" iconBg="rgba(52,211,153,0.12)" title="Security First" desc="Learn to spot scams, protect your seed phrase, and avoid the most common Web3 mistakes. Safety is built into every part of the learning experience." delay={0.4} />
      </div>
    </section>
  );
}