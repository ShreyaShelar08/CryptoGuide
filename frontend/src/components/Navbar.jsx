import React, { useState, useEffect } from 'react';

export default function Navbar({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [hoverLink, setHoverLink] = useState(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const navLinks = [
    ['features',     'Features'],
    ['how',          'How it Works'],
    ['features-new', 'AI Tools'],
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 60px', height: '70px',
      background: scrolled ? 'rgba(7,9,43,0.98)' : 'rgba(7,9,43,0.75)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(99,102,241,0.08)',
      transition: 'background 0.3s',
    }}>
      <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>⬡</div>
        <span style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800, fontSize: '20px', color: '#f0f0ff', letterSpacing: '-0.5px' }}>CryptoGuide</span>
      </a>

      <ul style={{ display: 'flex', alignItems: 'center', gap: '36px', listStyle: 'none', margin: 0, padding: 0 }}>
        {navLinks.map(([id, label]) => (
          <li key={id}>
            <span onClick={() => scrollTo(id)} onMouseEnter={() => setHoverLink(id)} onMouseLeave={() => setHoverLink(null)}
              style={{ color: hoverLink === id ? '#f0f0ff' : '#a8b4d8', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }}>
              {label}
            </span>
          </li>
        ))}
      </ul>

      <button onClick={onGetStarted}
        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: 'white', padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(99,102,241,0.35)', transition: 'all 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
        Get Started →
      </button>
    </nav>
  );
}