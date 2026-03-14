import React from 'react';
import { useReveal } from '../hooks/useReveal';

 const testimonials = [
  { name: 'Priya Sharma', role: 'First-time crypto investor', avatar: '👩', grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)', text: 'Finally an AI that doesn\'t assume I know what a gas fee is. CryptoGuide explained everything through conversation — I never felt dumb asking basic questions.' },
  { name: 'Marcus Webb', role: 'Software developer, DeFi curious', avatar: '👨', grad: 'linear-gradient(135deg,#0891b2,#22d3ee)', text: 'The personalization is real. I said I wanted to learn DeFi and the agent built my entire journey around that. Finished all 7 modules in a week.' },
  { name: 'Aisha Okonkwo', role: 'NFT collector, Lagos', avatar: '👩', grad: 'linear-gradient(135deg,#059669,#34d399)', text: 'The safety module alone is worth it. I almost fell for a fake NFT project — CryptoGuide had literally just taught me the red flags. It saved me real money.' },
];

function TestiCard({ name, role, avatar, grad, text, delay }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{
      background: '#0f1340', border: '1px solid rgba(99,102,241,0.08)',
      borderRadius: '20px', padding: '28px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ${delay}s ease, transform 0.6s ${delay}s ease`,
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.2)'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 40px rgba(99,102,241,0.18)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.08)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>

      <div style={{ color: '#f5a623', fontSize: '12px', marginBottom: '14px' }}>★★★★★</div>
      <div style={{
        fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '32px',
        fontWeight: 900, color: '#6366f1', opacity: 0.4, lineHeight: 1, marginBottom: '14px',
      }}>"</div>
      <p style={{ fontSize: '14px', color: '#a8b4d8', lineHeight: 1.75, marginBottom: '24px' }}>{text}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: grad, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '18px', flexShrink: 0,
        }}>{avatar}</div>
        <div>
          <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '15px', fontWeight: 800, color: '#f0f0ff' }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#6270a0' }}>{role}</div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [headerRef, headerVisible] = useReveal();

}