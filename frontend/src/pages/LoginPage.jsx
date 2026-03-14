import React, { useState } from 'react';
import { signUp, logIn, getAuthError } from '../firebase/authService';

function TextField({ id, label, type, value, onChange, onKeyDown, placeholder, error, focused, onFocus, onBlur }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ background: focused ? 'rgba(99,102,241,0.06)' : '#0f1340', border: error ? '1.5px solid rgba(239,68,68,0.5)' : focused ? '1.5px solid rgba(99,102,241,0.5)' : '1.5px solid rgba(99,102,241,0.12)', borderRadius: '14px', padding: '4px 18px', boxShadow: focused && !error ? '0 0 0 4px rgba(99,102,241,0.07)' : 'none', transition: 'all 0.25s' }}>
        <label htmlFor={id} style={{ display: 'block', fontSize: '10px', color: error ? '#fca5a5' : '#6270a0', letterSpacing: '1px', textTransform: 'uppercase', paddingTop: '11px', marginBottom: '2px', cursor: 'text' }}>{label}</label>
        <input id={id} type={type || 'text'} value={value} onChange={e => onChange(e.target.value)} onFocus={onFocus} onBlur={onBlur} onKeyDown={onKeyDown} placeholder={placeholder} autoComplete="off"
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#f0f0ff', fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '17px', fontWeight: 700, paddingBottom: '11px', letterSpacing: '-0.3px', cursor: 'text', caretColor: '#a5b4fc' }} />
      </div>
      {error && <p style={{ fontSize: '11px', color: '#fca5a5', marginTop: '5px', paddingLeft: '4px' }}>⚠️ {error}</p>}
    </div>
  );
}

function PasswordField({ id, label, value, onChange, onKeyDown, error, focused, onFocus, onBlur }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ background: focused ? 'rgba(99,102,241,0.06)' : '#0f1340', border: error ? '1.5px solid rgba(239,68,68,0.5)' : focused ? '1.5px solid rgba(99,102,241,0.5)' : '1.5px solid rgba(99,102,241,0.12)', borderRadius: '14px', padding: '4px 18px', boxShadow: focused && !error ? '0 0 0 4px rgba(99,102,241,0.07)' : 'none', transition: 'all 0.25s' }}>
        <label htmlFor={id} style={{ display: 'block', fontSize: '10px', color: error ? '#fca5a5' : '#6270a0', letterSpacing: '1px', textTransform: 'uppercase', paddingTop: '11px', marginBottom: '2px', cursor: 'text' }}>{label}</label>
        <input id={id} type="password" value={value} onChange={e => onChange(e.target.value)} onFocus={onFocus} onBlur={onBlur} onKeyDown={onKeyDown} placeholder="••••••••" autoComplete="off"
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#f0f0ff', fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '17px', fontWeight: 700, paddingBottom: '11px', cursor: 'text', caretColor: '#a5b4fc' }} />
      </div>
      {error && <p style={{ fontSize: '11px', color: '#fca5a5', marginTop: '5px', paddingLeft: '4px' }}>⚠️ {error}</p>}
    </div>
  );
}

export default function LoginPage({ onLogin, onBack }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const validate = () => {
    const errs = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({}); setGlobalError(''); setLoading(true);
    try {
      if (mode === 'signup') await signUp(email.trim(), password);
      else await logIn(email.trim(), password);
      // Firebase onAuthChange in AppContext handles page transition
      if (onLogin) onLogin();
    } catch (err) {
      setGlobalError(getAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !loading) handleSubmit(); };
  const switchMode = (m) => { setMode(m); setErrors({}); setGlobalError(''); setPassword(''); };
  const focus = (f) => setFocusedField(f);
  const blur = () => setFocusedField(null);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="bg-orb bg-orb-1" /><div className="bg-orb bg-orb-2" /><div className="bg-orb bg-orb-3" />
      <div className="bg-grid" />
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}`}</style>

      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            position: 'absolute', top: '24px', left: '24px', zIndex: 10,
            display: 'flex', alignItems: 'center', gap: '7px',
            background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.22)',
            borderRadius: '12px', padding: '9px 16px',
            color: '#a5b4fc', fontFamily: "'Cabinet Grotesk', sans-serif",
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            backdropFilter: 'blur(8px)', transition: 'all 0.22s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.20)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.10)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          ← Back
        </button>
      )}

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1, padding: '24px', animation: 'fadeUp 0.5s ease both' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px', justifyContent: 'center' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 0 24px rgba(99,102,241,0.45)' }}>⬡</div>
          <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: '22px', color: '#f0f0ff', letterSpacing: '-0.5px' }}>CryptoGuide</span>
        </div>

        <div style={{ background: '#0f1340', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 40px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }} />

          {/* Toggle */}
          <div style={{ display: 'flex', background: 'rgba(99,102,241,0.08)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => switchMode(m)}
                style={{ flex: 1, padding: '10px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '14px', fontWeight: 800, transition: 'all 0.25s', background: mode === m ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent', color: mode === m ? 'white' : '#6270a0', boxShadow: mode === m ? '0 2px 12px rgba(99,102,241,0.35)' : 'none' }}>
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '24px', fontWeight: 900, letterSpacing: '-0.8px', color: '#f0f0ff', marginBottom: '4px' }}>
            {mode === 'login' ? 'Welcome back 👋' : 'Create your account'}
          </h2>
          <p style={{ fontSize: '13px', color: '#6270a0', marginBottom: '24px', lineHeight: 1.5 }}>
            {mode === 'login' ? 'Log in to continue your Web3 learning journey.' : 'Sign up to start your personalized Web3 journey.'}
          </p>

          {globalError && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: '#fca5a5' }}>
              ⚠️ {globalError}
            </div>
          )}

          <TextField id="f-email" label="Email Address" type="email" value={email}
            onChange={v => { setEmail(v); setErrors(e => ({ ...e, email: '' })); setGlobalError(''); }}
            onKeyDown={handleKey} placeholder="you@example.com"
            error={errors.email} focused={focusedField === 'email'}
            onFocus={() => focus('email')} onBlur={blur} />

          <PasswordField id="f-password" label="Password" value={password}
            onChange={v => { setPassword(v); setErrors(e => ({ ...e, password: '' })); setGlobalError(''); }}
            onKeyDown={handleKey} error={errors.password}
            focused={focusedField === 'password'}
            onFocus={() => focus('password')} onBlur={blur} />

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', marginTop: '8px', background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: 'white', padding: '15px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Cabinet Grotesk', sans-serif", boxShadow: loading ? 'none' : '0 0 28px rgba(99,102,241,0.4)', transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.55)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 0 28px rgba(99,102,241,0.4)'; }}>
            {loading ? (
              <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />{mode === 'login' ? 'Logging in...' : 'Creating account...'}</>
            ) : (
              mode === 'login' ? '→ Continue Learning' : '🚀 Create Account'
            )}
          </button>
          <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#6270a0', marginTop: '18px' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} style={{ color: '#a5b4fc', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </span>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#6270a0', marginTop: '18px', lineHeight: 1.6 }}>
          🔒 Secured by Firebase Authentication.<br />Your password is never stored by CryptoGuide.
        </p>
      </div>
    </div>
  );
}