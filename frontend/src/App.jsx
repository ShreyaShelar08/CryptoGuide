import React, { useState } from 'react';
import './styles/globals.css';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import ChatPage from './pages/ChatPage';
import PortfolioPage from './pages/PortfolioPage';

function InnerApp() {
  const { authUser, authLoaded, onboardingDone, currentPage } = useApp();
  // Only used for landing → login navigation (not auth routing)
  const [showLogin, setShowLogin] = useState(false);

  // Show spinner while Firebase + Firestore are loading
  if (!authLoaded) {
    return (
      <div style={{ height: '100vh', background: '#07092b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 0 24px rgba(99,102,241,0.45)' }}>⬡</div>
          <div style={{ width: '20px', height: '20px', border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
        </div>
      </div>
    );
  }

  // ── Routing: derived directly from state, no useEffect needed ──────────────

  // Not logged in
  if (!authUser) {
    if (showLogin) return <LoginPage onLogin={() => setShowLogin(false)} onBack={() => setShowLogin(false)} />;
    return <LandingPage onGetStarted={() => setShowLogin(true)} />;
  }

  // Logged in but onboarding not done
  if (!onboardingDone) {
    return <OnboardingPage onComplete={() => {/* context handles state */ }} />;
  }

  // Logged in + onboarding done → chat or portfolio
  if (currentPage === 'portfolio') {
    return <PortfolioPage onLogout={() => setShowLogin(false)} />;
  }
  return <ChatPage onLogout={() => setShowLogin(false)} />;
}

export default function App() {
  return (
    <AppProvider>
      <InnerApp />
    </AppProvider>
  );
}