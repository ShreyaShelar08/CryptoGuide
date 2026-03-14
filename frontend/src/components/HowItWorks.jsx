import React from 'react';
import { useReveal } from '../hooks/useReveal';

const steps = [
  { num: '01', icon: '🎯', title: 'Tell Us Your Goal', desc: 'Answer 2 quick questions — your Web3 goal and experience level. The ASI-1 agent instantly builds your personalized learning path.' },
  { num: '02', icon: '💬', title: 'Learn by Chatting', desc: 'Ask anything, anytime. The agent explains complex concepts with real-world analogies, remembers your context, and never makes you feel lost.' },
  { num: '03', icon: '🚀', title: 'Enter Web3 Confidently', desc: 'Complete all 7 modules and you\'ll know exactly how to set up a wallet, buy crypto safely, explore DeFi, and avoid scams.' },
];

function StepCard({ num, icon, title, desc, delay }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{
      background: '#0f1340', border: '1px solid rgba(99,102,241,0.08)',
      borderRadius: '20px', padding: '32px 28px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ${delay}s ease, transform 0.6s ${delay}s ease`,
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.2)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 8px 40px rgba(99,102,241,0.18)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.08)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
      <div style={{
        fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '48px',
        fontWeight: 900, color: 'rgba(99,102,241,0.12)', lineHeight: 1, marginBottom: '16px',
      }}>{num}</div>
      <span style={{ fontSize: '28px', marginBottom: '14px', display: 'block' }}>{icon}</span>
      <h3 style={{
        fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '18px',
        fontWeight: 800, marginBottom: '10px', color: '#f0f0ff',
      }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#a8b4d8', lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}

export default function HowItWorks() {
  const [headerRef, headerVisible] = useReveal();

  return (
    <section id="how" style={{
      position: 'relative', zIndex: 1,
      padding: '100px 60px',
      background: 'rgba(11,14,56,0.3)',
    }}>
      <div ref={headerRef} style={{
        marginBottom: '60px',
        opacity: headerVisible ? 1 : 0,
        transform: headerVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
             }}>
        <div style={{
          display: 'inline-block', background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc',
          fontSize: '12px', fontWeight: 700, padding: '5px 14px',
          borderRadius: '999px', letterSpacing: '1px',
          textTransform: 'uppercase', marginBottom: '16px',
        }}>How It Works</div>
        <h2 style={{
          fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '42px',
          fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1,
          marginBottom: '16px', color: '#f0f0ff',
        }}>Three steps to Web3<br />clarity</h2>
        <p style={{ fontSize: '16px', color: '#a8b4d8', lineHeight: 1.7, maxWidth: '520px' }}>
          No setup required. No wallet needed to start. Just open CryptoGuide and your AI agent is ready.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px', maxWidth: '900px' }}>
        {steps.map((step, i) => (
          <StepCard key={step.num} {...step} delay={i * 0.15} />
        ))}
      </div>
    </section>
  );
}