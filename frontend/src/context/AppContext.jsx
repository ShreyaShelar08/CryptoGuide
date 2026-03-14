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

  // ── Core: loadUserHistory — called on every login (like your reference code) ─
  const loadUserHistory = useCallback(async (uid, displayName, goal) => {
    // Step 1: Instantly load from localStorage cache (zero network delay)
    // localStorage was already seeded in onAuthChange before any await.
    // Here we load the active session's messages from cache instantly,
    // then revalidate everything from Firestore in the background.

    const lastActiveId = localStorage.getItem(`activeSessionId_${uid}`) || 'main';
    const cached = localStorage.getItem(`sessions_${uid}`);
    if (cached) {
      try {
        const cachedSessions = JSON.parse(cached);
        const lastSession = cachedSessions.find(s => s.id === lastActiveId);
        if (lastSession?.messages?.length > 0) {
          setMessages(lastSession.messages);
          setHistory(lastSession.messages.map(m => ({ role: m.role, content: m.content })));
          setHistoryLoaded(true); // sidebar & chat are ready — Firestore revalidates in background
        }
      } catch (e) { /* ignore */ }
    }

    // Firestore revalidation (background — user already sees data from cache above)
    try {
      const firestoreSessions = await listChatSessions(uid);

      // Smart merge: Firestore wins, but keep local-only pending sessions
      setSessions(prev => {
        const firestoreIds = new Set(firestoreSessions.map(s => s.id));
        const localOnly = prev.filter(s => !firestoreIds.has(s.id));
        return [...firestoreSessions, ...localOnly];
      });

      // Silently update active session messages if Firestore has fresher data
      const activeInFirestore = firestoreSessions.find(s => s.id === lastActiveId);
      if (activeInFirestore?.messages?.length > 0) {
        setMessages(prev => {
          const prevStr = JSON.stringify(prev.map(m => ({ role: m.role, content: m.content })));
          const newStr = JSON.stringify(activeInFirestore.messages.map(m => ({ role: m.role, content: m.content })));
          return prevStr === newStr ? prev : activeInFirestore.messages;
        });
        setHistory(activeInFirestore.messages.map(m => ({ role: m.role, content: m.content })));
      } else if (firestoreSessions.length === 0 && !cached) {
        // Brand new user with no history anywhere — show welcome
        setMessages([makeWelcomeMsg(displayName, goal)]);
        setHistory([]);
      }
    } catch (err) {
      console.error('loadUserHistory Firestore error:', err);
    } finally {
      setHistoryLoaded(true);
    }
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

        // Seed sessions & active session from localStorage RIGHT NOW (zero delay)
        const cachedSessions = localStorage.getItem(`sessions_${firebaseUser.uid}`);
        if (cachedSessions) {
          try {
            const parsed = JSON.parse(cachedSessions);
            if (parsed.length > 0) {
              setSessions(parsed);
              const cachedActiveId = localStorage.getItem(`activeSessionId_${firebaseUser.uid}`);
              if (cachedActiveId) setActiveSessionId(cachedActiveId);
            }
          } catch (e) { /* ignore malformed cache */ }
        }
        // ─────────────────────────────────────────────────────────────────────

        try {
          const profile = await loadUserProfile(firebaseUser.uid);


          const displayName = profile?.name || initialName;
          const goal = profile?.goal || null;

          if (profile) {
            setUserProfile({
              ...profile,
              name: displayName,
            });
            if (profile.portfolio) {
              // Firestore data is authoritative — overwrite localStorage cache
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
          } else {
            setUserProfile({ name: initialName, goal: null, level: null });
            setOnboardingDone(false);
            localStorage.removeItem('onboardingDone');
          }

          // 🔑 Load this user's full chat history (mirrors your reference code pattern)
          await loadUserHistory(firebaseUser.uid, displayName, goal);

        } catch (err) {
          console.error('Error during login setup:', err);
        }
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