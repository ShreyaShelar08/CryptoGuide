import React from 'react';
import { useReveal } from '../hooks/useReveal';


export function CTA({ onGetStarted}) {
  const [ref, visible] = useReveal();

  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '80px 60px 120px' }}>
      <div ref={ref} style={{
        maxWidth: '900px', margin: '0 auto',
        background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.12))',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: '28px', padding: '70px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>
        {/* Top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        }} />

        <div style={{
          display: 'inline-block', background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc',
          fontSize: '12px', fontWeight: 700, padding: '5px 14px',
          borderRadius: '999px', letterSpacing: '1px',
          textTransform: 'uppercase', marginBottom: '20px',
        }}>Get Started Today</div>

        <h2 style={{
          fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '46px',
          fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px', color: '#f0f0ff',
        }}>Ready to enter Web3<br />the right way?</h2>

        <p style={{
          fontSize: '16px', color: '#a8b4d8', maxWidth: '480px',
          margin: '0 auto 40px', lineHeight: 1.7,
        }}>
          Join thousands of learners who started their Web3 journey with CryptoGuide. Free to start, powered by ASI-1.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onGetStarted}
            style={{
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none',
              color: 'white', padding: '16px 36px', borderRadius: '14px',
              fontSize: '16px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 0 30px rgba(99,102,241,0.4)', transition: 'all 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 36px rgba(99,102,241,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 0 30px rgba(99,102,241,0.4)'; }}>
            🚀 Start Learning Free
          </button>
            </div>
      </div>
    </section>
  );
}
export function Footer() {
  return (
    <footer style={{
      position: 'relative', zIndex: 1,
      borderTop: '1px solid rgba(99,102,241,0.08)',
      padding: '40px 60px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(7,9,43,0.8)',
    }}>
    </footer>
  );
}