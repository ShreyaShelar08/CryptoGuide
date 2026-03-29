import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthChange, loadUserProfile, logOut as firebaseLogOut } from '../firebase/authService';
import { listChatSessions } from '../firebase/authService';

const AppContext = createContext(null);

// ─────────────────────────────────────────────────────────────────────────────
// Helper: make a welcome message for a user
// ─────────────────────────────────────────────────────────────────────────────
function makeWelcomeMsg(displayName, goal) {
  const goalMap = { investing: 'crypto investing', nft: 'NFTs & digital art', defi: 'DeFi & yield', general: 'Web3 basics' };
  const goalLabel = goalMap[goal] || 'Web3';
  return {
    id: Date.now(),
    role: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    content: `Hey **${displayName}**! 👋 ASI-1 here. Ready to dive into **${goalLabel}**?\n\nI can help you build your roadmap or explain complex topics. What's on your mind?`,
    quickReplies: ['Generate roadmap', 'Explain Bitcoin', 'How to invest?'],
  };
}

export function AppProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(() => localStorage.getItem('onboardingDone') === 'true');
  const [userProfile, setUserProfile] = useState({ name: '', goal: null, level: null });
  const [currentPage, setCurrentPage] = useState('chat');
  const [portfolio, setPortfolioState] = useState({ balance: 10000, holdings: {}, txLog: [] });
  const [messages, setMessages] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('main');
  const [roadmap, setRoadmap] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [history, setHistory] = useState([]);

  // ── Wrap setPortfolio so it also persists to localStorage ──────────────────
  const setPortfolio = useCallback((newPortfolioOrUpdater) => {
    setPortfolioState(prev => {
      const next = typeof newPortfolioOrUpdater === 'function'
        ? newPortfolioOrUpdater(prev)
        : newPortfolioOrUpdater;
      return next;
    });
  }, []);

  // ── Persist portfolio to localStorage whenever it changes (scoped per user) ──
  useEffect(() => {
    if (authUser?.uid && portfolio) {
      try {
        localStorage.setItem(`portfolio_${authUser.uid}`, JSON.stringify(portfolio));
      } catch (e) {
        console.warn('Failed to cache portfolio to localStorage:', e);
      }
    }
  }, [portfolio, authUser?.uid]);

  // ── Persist sessions to localStorage whenever they change (scoped per user) ──
  useEffect(() => {
    if (authUser?.uid && sessions.length > 0) {
      localStorage.setItem(`sessions_${authUser.uid}`, JSON.stringify(sessions));
    }
  }, [sessions, authUser?.uid]);

  // ── Persist activeSessionId (scoped per user) ────────────────────────────────
  useEffect(() => {
    if (authUser?.uid) {
      localStorage.setItem(`activeSessionId_${authUser.uid}`, activeSessionId);
    }
  }, [activeSessionId, authUser?.uid]);

  // ── Core: loadUserHistory — called on every login ─────────────────────────
  const loadUserHistory = useCallback(async (uid, displayName, goal) => {
    console.log('[loadUserHistory] START — uid:', uid);

    // Step 1: Fetch sessions from Firestore to populate the sidebar history
    try {
      console.log('[loadUserHistory] Fetching from Firestore...');
      const firestoreSessions = await listChatSessions(uid);
      console.log('[loadUserHistory] Firestore returned', firestoreSessions.length, 'sessions');

      if (firestoreSessions.length > 0) {
        // Load all past sessions into sidebar
        setSessions(firestoreSessions);
        console.log('[loadUserHistory] ✅ Loaded', firestoreSessions.length, 'sessions into sidebar');
      }
    } catch (err) {
      console.error('[loadUserHistory] ❌ Firestore error:', err);
      // Fallback: try localStorage cache for sidebar
      const cached = localStorage.getItem(`sessions_${uid}`);
      if (cached) {
        try {
          const cachedSessions = JSON.parse(cached);
          if (cachedSessions && cachedSessions.length > 0) {
            setSessions(cachedSessions);
          }
        } catch (e) { console.warn('[loadUserHistory] localStorage parse error:', e); }
      }
    }

    // Step 2: Always start a fresh new chat with a greeting on login
    const newSessionId = 'session_' + Date.now();
    console.log('[loadUserHistory] ✅ Starting fresh chat session:', newSessionId);
    setMessages([makeWelcomeMsg(displayName, goal)]);
    setHistory([]);
    setActiveSessionId(newSessionId);
    setHistoryLoaded(true);
    console.log('[loadUserHistory] DONE');
  }, []);

  // ── Auth state listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // ─── INSTANT: set auth & seed from localStorage BEFORE any await ───────
        setAuthUser(firebaseUser);

        // Name from auth token — no network needed
        const initialName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Explorer';
        setUserProfile(prev => ({ ...prev, name: initialName }));

        // Seed portfolio from localStorage RIGHT NOW (zero delay)
        const cachedPortfolio = localStorage.getItem(`portfolio_${firebaseUser.uid}`);
        if (cachedPortfolio) {
          try {
            const parsed = JSON.parse(cachedPortfolio);
            if (parsed && parsed.balance !== undefined) {
              setPortfolioState(parsed);
            }
          } catch (e) { /* ignore malformed cache */ }
        }

        // ─── INSTANT: Load sidebar sessions from localStorage (zero delay) ───
        const cachedSessions = localStorage.getItem(`sessions_${firebaseUser.uid}`);
        if (cachedSessions) {
          try {
            const parsed = JSON.parse(cachedSessions);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSessions(parsed);
            }
          } catch (e) { /* ignore malformed cache */ }
        }

        // ─── INSTANT: Show greeting message RIGHT NOW (zero delay) ───────
        // Read cached goal from localStorage for instant personalization
        const cachedGoal = localStorage.getItem(`userGoal_${firebaseUser.uid}`) || null;
        const newSessionId = 'session_' + Date.now();
        setMessages([makeWelcomeMsg(initialName, cachedGoal)]);
        setHistory([]);
        setActiveSessionId(newSessionId);
        setHistoryLoaded(true);

        // ─── BACKGROUND: Load profile & sidebar sessions (non-blocking) ──
        (async () => {
          try {
            const profile = await loadUserProfile(firebaseUser.uid);

            const displayName = profile?.name || initialName;
            const goal = profile?.goal || null;

            if (profile) {
              setUserProfile({
                ...profile,
                name: displayName,
              });
              // Cache goal for instant use on next login
              if (goal) localStorage.setItem(`userGoal_${firebaseUser.uid}`, goal);

              if (profile.portfolio) {
                setPortfolioState(profile.portfolio);
              }

              const isFinished = profile.onboardingDone === true || (profile.goal && profile.level);
              if (isFinished) {
                setOnboardingDone(true);
                localStorage.setItem('onboardingDone', 'true');
              } else {
                setOnboardingDone(false);
                localStorage.removeItem('onboardingDone');
              }

              // Update greeting with accurate name/goal if different from initial
              if (displayName !== initialName || goal !== cachedGoal) {
                setMessages([makeWelcomeMsg(displayName, goal)]);
              }
            } else {
              setUserProfile({ name: initialName, goal: null, level: null });
              setOnboardingDone(false);
              localStorage.removeItem('onboardingDone');
            }

            // Load sidebar chat history from Firestore (background)
            try {
              const firestoreSessions = await listChatSessions(firebaseUser.uid);
              if (firestoreSessions.length > 0) {
                setSessions(firestoreSessions);
              }
            } catch (e) {
              console.error('[loadSessions] Firestore error:', e);
              // Fallback: try localStorage
              const cached = localStorage.getItem(`sessions_${firebaseUser.uid}`);
              if (cached) {
                try { setSessions(JSON.parse(cached)); } catch (_) { }
              }
            }
          } catch (err) {
            console.error('Error during login setup:', err);
          }
        })();
      } else {
        // ── Logout: wipe all in-memory state ──
        setAuthUser(null);
        setUserProfile({ name: '', goal: null, level: null });
        setPortfolioState({ balance: 10000, holdings: {}, txLog: [] });
        setMessages([]);
        setSessions([]);
        setHistory([]);
        setActiveSessionId('main');
        setHistoryLoaded(false);
        setOnboardingDone(false);
        localStorage.removeItem('onboardingDone');
      }
      setAuthLoaded(true);
    });
    return () => unsub();
  }, [loadUserHistory]);

  const logout = async () => { await firebaseLogOut(); };

  const updateProfile = (key, value) => setUserProfile(prev => ({ ...prev, [key]: value }));

  const saveProfile = (profile) => {
    setUserProfile(profile);
    setOnboardingDone(true);
    localStorage.setItem('onboardingDone', 'true');
  };

  return (
    <AppContext.Provider value={{
      authUser, authLoaded, onboardingDone, setOnboardingDone,
      userProfile, setUserProfile, updateProfile, saveProfile,
      logout,
      currentPage, setCurrentPage,
      portfolio, setPortfolio,
      messages, setMessages,
      activeSessionId, setActiveSessionId,
      roadmap, setRoadmap,
      sessions, setSessions,
      historyLoaded, setHistoryLoaded,
      history, setHistory,
      loadUserHistory,   // exposed so ChatPage can refresh on session switch
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}