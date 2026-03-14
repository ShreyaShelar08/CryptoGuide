import React, { useState } from 'react';
import { saveUserProfile } from '../firebase/authService';
import { useApp } from '../context/AppContext';

const GOALS = [
  { id: 'investing', icon: '💰', title: 'Crypto Investing', desc: 'Learn to buy, hold and grow crypto assets safely', color: '#34d399', glow: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)' },
  { id: 'nft', icon: '🖼️', title: 'NFTs & Digital Art', desc: 'Understand ownership, collections and the NFT market', color: '#f472b6', glow: 'rgba(244,114,182,0.15)', border: 'rgba(244,114,182,0.3)' },
  { id: 'defi', icon: '⚡', title: 'DeFi & Yield', desc: 'Explore DeFi, staking and liquidity pools', color: '#fbbf24', glow: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)' },
  { id: 'general', icon: '🌍', title: 'General Web3', desc: 'Get a full foundational understanding of Web3', color: '#a5b4fc', glow: 'rgba(165,180,252,0.15)', border: 'rgba(165,180,252,0.3)' },
];

const LEVELS = [
  { id: 'beginner', icon: '🌱', title: 'Complete Beginner', desc: "I've heard of crypto but don't really understand it yet", tag: 'Start from zero' },
  { id: 'intermediate', icon: '⚙️', title: 'Some Knowledge', desc: "I know the basics — wallets, Bitcoin — but want to go deeper", tag: 'Fill the gaps' },
  { id: 'advanced', icon: '🔥', title: 'Fairly Experienced', desc: "I've used DeFi or NFTs but want to sharpen my knowledge", tag: 'Level up' },
];

function StepGoal({ value, onChange }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ animation: 'fadeUp 0.5s ease both' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '999px', padding: '5px 14px', fontSize: '11px', fontWeight: 700, color: '#a5b4fc', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>Step 1 of 2</div>
      <h2 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '36px', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '12px', color: '#f0f0ff' }}>
        What's your main<br /><span style={{ background: 'linear-gradient(90deg,#818cf8,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Web3 goal?</span>
      </h2>
      <p style={{ fontSize: '15px', color: '#a8b4d8', marginBottom: '36px', lineHeight: 1.6 }}>Your agent builds a personalized AI roadmap based on this.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {GOALS.map(g => {
          const sel = value === g.id, hov = hovered === g.id;
          return (
            <div key={g.id} onClick={() => onChange(g.id)} onMouseEnter={() => setHovered(g.id)} onMouseLeave={() => setHovered(null)}
              style={{ background: sel ? g.glow : hov ? 'rgba(99,102,241,0.05)' : '#0f1340', border: sel ? `1.5px solid ${g.border}` : hov ? '1.5px solid rgba(99,102,241,0.2)' : '1.5px solid rgba(99,102,241,0.08)', borderRadius: '16px', padding: '22px 20px', cursor: 'pointer', transform: sel || hov ? 'translateY(-2px)' : 'none', boxShadow: sel ? `0 8px 24px ${g.glow}` : 'none', transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden' }}>
              {sel && <div style={{ position: 'absolute', top: '12px', right: '12px', width: '20px', height: '20px', borderRadius: '50%', background: g.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#07092b', fontWeight: 700 }}>✓</div>}
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{g.icon}</div>
              <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '16px', fontWeight: 800, color: sel ? g.color : '#f0f0ff', marginBottom: '6px', transition: 'color 0.2s' }}>{g.title}</div>
              <div style={{ fontSize: '12px', color: '#a8b4d8', lineHeight: 1.5 }}>{g.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepLevel({ value, onChange }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ animation: 'fadeUp 0.5s ease both' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '999px', padding: '5px 14px', fontSize: '11px', fontWeight: 700, color: '#a5b4fc', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>Step 2 of 2</div>
      <h2 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '36px', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '12px', color: '#f0f0ff' }}>
        What's your<br /><span style={{ background: 'linear-gradient(90deg,#818cf8,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>experience level?</span>
      </h2>
      <p style={{ fontSize: '15px', color: '#a8b4d8', marginBottom: '36px', lineHeight: 1.6 }}>Your agent adapts explanations to exactly where you are.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {LEVELS.map(l => {
          const sel = value === l.id, hov = hovered === l.id;
          return (
            <div key={l.id} onClick={() => onChange(l.id)} onMouseEnter={() => setHovered(l.id)} onMouseLeave={() => setHovered(null)}
              style={{ background: sel ? 'rgba(99,102,241,0.1)' : hov ? 'rgba(99,102,241,0.04)' : '#0f1340', border: sel ? '1.5px solid rgba(99,102,241,0.4)' : hov ? '1.5px solid rgba(99,102,241,0.2)' : '1.5px solid rgba(99,102,241,0.08)', borderRadius: '16px', padding: '20px 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '18px', transform: sel || hov ? 'translateY(-2px)' : 'none', boxShadow: sel ? '0 8px 24px rgba(99,102,241,0.15)' : 'none', transition: 'all 0.25s ease' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0, background: sel ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', transition: 'all 0.25s', boxShadow: sel ? '0 0 20px rgba(99,102,241,0.3)' : 'none' }}>{l.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '17px', fontWeight: 800, color: sel ? '#a5b4fc' : '#f0f0ff', transition: 'color 0.2s' }}>{l.title}</span>
                  <span style={{ background: sel ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', color: sel ? '#a5b4fc' : '#6270a0', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>{l.tag}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#a8b4d8', lineHeight: 1.5 }}>{l.desc}</div>
              </div>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, border: sel ? '2px solid #6366f1' : '2px solid rgba(99,102,241,0.2)', background: sel ? '#6366f1' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white', fontWeight: 700, transition: 'all 0.25s' }}>{sel ? '✓' : ''}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OnboardingPage({ onComplete }) {
  const { userProfile, updateProfile, saveProfile, authUser, portfolio } = useApp();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const canProceed = () => step === 0 ? !!userProfile.goal : !!userProfile.level;

  const handleNext = async () => {
    if (!canProceed()) {
      setError(step === 0 ? 'Please select your Web3 goal.' : 'Please select your experience level.');
      return;
    }
    setError('');
    if (step === 0) { setStep(1); return; }

    // Step 2 done — save everything and go to chat
    setSaving(true);
    const finalProfile = {
      ...userProfile,
      portfolio, // Preserve current portfolio (e.g. starting balance changes)
      name: authUser?.displayName || authUser?.email?.split('@')[0] || 'Explorer',
      onboardingDone: true,
    };
    saveProfile(finalProfile);
    try { await saveUserProfile(authUser?.uid, finalProfile); } catch { }
    setSaving(false);
    onComplete();
  };

  const sidebarSteps = [
    { label: 'Your Goal', sub: 'What brings you to Web3?', icon: '🎯' },
    { label: 'Experience Level', sub: 'Where are you starting from?', icon: '📊' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      <div className="bg-orb bg-orb-1" /><div className="bg-orb bg-orb-2" /><div className="bg-orb bg-orb-3" />
      <div className="bg-grid" />
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}`}</style>

      {/* Left sidebar */}
      <div style={{ width: '320px', minWidth: '320px', background: 'rgba(11,14,56,0.6)', borderRight: '1px solid rgba(99,102,241,0.08)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 28px', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
            <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>⬡</div>
            <span style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800, fontSize: '20px', color: '#f0f0ff', letterSpacing: '-0.5px' }}>CryptoGuide</span>
          </div>
          {sidebarSteps.map((s, i) => {
            const done = i < step, active = i === step;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px', marginBottom: '8px', background: active ? 'rgba(99,102,241,0.1)' : done ? 'rgba(52,211,153,0.06)' : 'transparent', border: active ? '1px solid rgba(99,102,241,0.25)' : done ? '1px solid rgba(52,211,153,0.15)' : '1px solid transparent', transition: 'all 0.3s' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '11px', flexShrink: 0, background: done ? 'rgba(52,211,153,0.15)' : active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: done ? '16px' : '18px', boxShadow: active ? '0 0 16px rgba(99,102,241,0.3)' : 'none', transition: 'all 0.3s' }}>{done ? '✓' : s.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '14px', fontWeight: 800, color: active ? '#a5b4fc' : done ? '#34d399' : '#6270a0', transition: 'color 0.3s' }}>{s.label}</div>
                  <div style={{ fontSize: '12px', color: active ? '#a8b4d8' : '#6270a0' }}>{s.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#6270a0', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Powered by</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>⬡</div>
            <div>
              <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '14px', fontWeight: 800, color: '#f0f0ff' }}>ASI-1 by Fetch.ai</div>
              <div style={{ fontSize: '11px', color: '#6270a0' }}>Agentic AI · Multi-step reasoning</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>
          {/* Step dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '48px' }}>
            {[0, 1].map(i => {
              const done = i < step, active = i === step;
              return (
                <React.Fragment key={i}>
                  <div style={{ width: active ? '32px' : '8px', height: '8px', borderRadius: '999px', background: done ? '#34d399' : active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.15)', boxShadow: active ? '0 0 12px rgba(99,102,241,0.5)' : done ? '0 0 8px rgba(52,211,153,0.4)' : 'none', transition: 'all 0.4s ease', flexShrink: 0 }} />
                  {i < 1 && <div style={{ flex: 1, height: '1px', background: done ? 'rgba(52,211,153,0.4)' : 'rgba(99,102,241,0.1)', transition: 'background 0.4s ease', maxWidth: '40px' }} />}
                </React.Fragment>
              );
            })}
            <span style={{ fontSize: '12px', color: '#6270a0', marginLeft: '8px' }}>{step + 1} / 2</span>
          </div>

          <div key={step}>
            {step === 0 && <StepGoal value={userProfile.goal} onChange={v => { updateProfile('goal', v); setError(''); }} />}
            {step === 1 && <StepLevel value={userProfile.level} onChange={v => { updateProfile('level', v); setError(''); }} />}
          </div>

          {error && <div style={{ marginTop: '16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#fca5a5' }}>⚠️ {error}</div>}

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: step > 0 ? 'space-between' : 'flex-end' }}>
            {step > 0 && (
              <button onClick={() => { setError(''); setStep(0); }}
                style={{ background: 'transparent', border: '1.5px solid rgba(99,102,241,0.2)', color: '#a8b4d8', padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#f0f0ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; e.currentTarget.style.color = '#a8b4d8'; }}>
                ← Back
              </button>
            )}
            <button onClick={handleNext} disabled={saving}
              style={{ background: canProceed() && !saving ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.15)', border: 'none', color: canProceed() && !saving ? 'white' : '#6270a0', padding: '14px 36px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: canProceed() && !saving ? '0 0 24px rgba(99,102,241,0.35)' : 'none', transition: 'all 0.3s', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
              onMouseEnter={e => { if (canProceed() && !saving) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,0.5)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              {saving ? <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Saving...</> : step === 1 ? '🚀 Start My Journey' : 'Continue →'}
            </button>
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
        </div>
      </div>
    </div>
  );
}