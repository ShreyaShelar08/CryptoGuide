import React from 'react';
import { useReveal } from '../hooks/useReveal';

const modules = [
  { num: '1', name: 'What is Blockchain?', desc: 'Understand the foundational technology behind all of Web3 — without the technical headaches.', topics: ['How distributed ledgers work', 'Why blockchain is trustless', 'Real-world analogies'] },
  { num: '2', name: 'Wallets & Keys', desc: 'The single most important skill in Web3. Get this right and you\'ll never lose your crypto.', topics: ['Public vs private keys', 'Seed phrase safety', 'Hot vs cold wallets'], featured: true },
  { num: '3', name: 'Buying Crypto', desc: 'Which exchanges to trust, how to buy your first Bitcoin or ETH, and what to watch out for.', topics: ['Choosing an exchange', 'KYC and verification', 'Safe transfer steps'] },
  { num: '4', name: 'Gas Fees & Txns', desc: 'Understand why fees exist, how to minimize them, and how blockchain transactions actually work.', topics: ['What gas fees are', 'How to save on fees', 'Reading a transaction'] },
  { num: '5', name: 'NFTs & DAOs', desc: 'Beyond the hype — what NFTs and DAOs actually are, and how they create real value.', topics: ['NFT ownership explained', 'How DAOs make decisions', 'Spotting NFT scams'] },
  { num: '6', name: 'DeFi Basics', desc: 'Lending, borrowing, liquidity pools — the decentralized financial system explained simply.', topics: ['How DeFi protocols work', 'Yield and liquidity', 'DeFi risks & safety'] },
];

const securityTags = [
  { label: '⚠️ Rug Pulls', color: '#fca5a5', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  { label: '🎣 Phishing', color: '#fca5a5', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  { label: '🤡 Fake Projects', color: '#fca5a5', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  { label: '✓ How to verify', color: '#6ee7b7', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)' },
];

function ModuleCard({ num, name, desc, topics, featured, delay }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{
      background: featured ? '#10144a' : '#0f1340',
      border: featured ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(99,102,241,0.08)',
      borderRadius: '20px', padding: '28px', position: 'relative', overflow: 'hidden',
      boxShadow: featured ? '0 0 40px rgba(99,102,241,0.12)' : 'none',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ${delay}s ease, transform 0.6s ${delay}s ease`,
    }}
    onMouseEnter={e => { if (!featured) { e.currentTarget.style.borderColor='rgba(99,102,241,0.2)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 8px 40px rgba(99,102,241,0.18)'; }}}
    onMouseLeave={e => { if (!featured) { e.currentTarget.style.borderColor='rgba(99,102,241,0.08)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}}>

      {featured && (
        <div style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white',
          fontSize: '10px', fontWeight: 700, padding: '3px 10px',
          borderRadius: '999px', letterSpacing: '1px',
        }}>POPULAR</div>
      )}

      <div style={{
        width: '36px', height: '36px', borderRadius: '10px', marginBottom: '16px',
        background: featured ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '16px',
        fontWeight: 900, color: featured ? 'white' : '#a5b4fc',
      }}>{num}</div>

      <h3 style={{
        fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '18px',
        fontWeight: 800, marginBottom: '8px',
        color: featured ? '#f0f0ff' : '#f0f0ff',
      }}>{name}</h3>
      <p style={{ fontSize: '13px', color: '#a8b4d8', lineHeight: 1.6, marginBottom: '20px' }}>{desc}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {topics.map(t => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: featured ? '#f0f0ff' : '#a8b4d8' }}>
            <div style={{
              width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
              background: 'rgba(52,211,153,0.12)', color: '#34d399',
              fontSize: '10px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✓</div>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Modules() {
  const [headerRef, headerVisible] = useReveal();
  const [lastRef, lastVisible] = useReveal();

  return (
    <section id="modules" style={{
      position: 'relative', zIndex: 1,
      padding: '100px 60px',
      background: 'rgba(11,14,56,0.3)',
    }}>
      <div ref={headerRef} style={{
        textAlign: 'center', maxWidth: '600px', margin: '0 auto 60px',
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
        }}>Learning Path</div>
        <h2 style={{
          fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '42px',
          fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1,
          marginBottom: '16px', color: '#f0f0ff',
        }}>7 modules. One complete<br />Web3 education.</h2>
        <p style={{ fontSize: '16px', color: '#a8b4d8', lineHeight: 1.7 }}>
          Each module is a focused, interactive conversation with your AI agent. Short enough to finish in one sitting.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
        {modules.map((mod, i) => (
          <ModuleCard key={mod.num} {...mod} delay={i * 0.1} />
        ))}

        {/* Module 7 — full width */}
        <div ref={lastRef} style={{
          background: '#0f1340', border: '1px solid rgba(99,102,241,0.08)',
          borderRadius: '20px', padding: '28px', gridColumn: 'span 3',
          display: 'flex', alignItems: 'center', gap: '32px',
          opacity: lastVisible ? 1 : 0,
          transform: lastVisible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.6s 0.6s ease, transform 0.6s 0.6s ease',
        }}>
          <div>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px', marginBottom: '16px',
              background: 'rgba(99,102,241,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '16px', fontWeight: 900, color: '#a5b4fc',
            }}>7</div>
            <h3 style={{
              fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '18px',
              fontWeight: 800, marginBottom: '8px', color: '#f0f0ff',
            }}>Stay Safe in Web3 🔒</h3>
            <p style={{ fontSize: '13px', color: '#a8b4d8', lineHeight: 1.6, maxWidth: '480px' }}>
              The most important module. Learn to identify scams, protect your assets, and navigate Web3 without getting exploited. Covers rug pulls, phishing, fake projects, and social engineering attacks.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginLeft: 'auto' }}>
            {securityTags.map(({ label, color, bg, border }) => (
              <div key={label} style={{
                background: bg, border: `1px solid ${border}`,
                borderRadius: '10px', padding: '12px 16px',
                fontSize: '12px', color,
              }}>{label}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}