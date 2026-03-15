import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { callASI1 } from '../services/api';
import { GOAL_LABELS } from '../constants';
import { saveChatSession, listChatSessions, deleteChatSession } from '../firebase/authService';

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', padding: '4px 0' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>⬡</div>
      <div style={{ background: '#0f1340', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '16px', borderBottomLeftRadius: '4px', padding: '14px 18px', display: 'flex', gap: '5px' }}>
        {[0, 1, 2].map(i => <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#6366f1', animation: `typingDot 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
      </div>
      <style>{`@keyframes typingDot{0%,100%{transform:translateY(0);opacity:0.4;}50%{transform:translateY(-5px);opacity:1;}}`}</style>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ role, content, timestamp }) {
  const isAgent = role === 'assistant';
  const renderContent = (text) =>
    text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i} style={{ color: '#a5b4fc', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
        : part.split('\n').map((line, j, arr) => <React.Fragment key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</React.Fragment>)
    );
  return (
    <div style={{ display: 'flex', gap: '12px', flexDirection: isAgent ? 'row' : 'row-reverse', alignItems: 'flex-end', animation: 'fadeUp 0.3s ease both' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0, background: isAgent ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.15)', border: isAgent ? 'none' : '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
        {isAgent ? '⬡' : '👤'}
      </div>
      <div style={{ maxWidth: '72%' }}>
        <div style={{ background: isAgent ? '#0f1340' : 'rgba(99,102,241,0.12)', border: isAgent ? '1px solid rgba(99,102,241,0.1)' : '1px solid rgba(99,102,241,0.25)', borderRadius: '16px', borderBottomLeftRadius: isAgent ? '4px' : '16px', borderBottomRightRadius: isAgent ? '16px' : '4px', padding: '14px 18px', fontSize: '14px', lineHeight: 1.75, color: '#e2e8f0' }}>
          {renderContent(content)}
        </div>
        <div style={{ fontSize: '10px', color: '#6270a0', marginTop: '5px', textAlign: isAgent ? 'left' : 'right', paddingLeft: isAgent ? '4px' : 0 }}>{timestamp}</div>
      </div>
    </div>
  );
}

// ── Quick Replies ─────────────────────────────────────────────────────────────
function QuickReplies({ replies, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px', paddingLeft: '44px' }}>
      {replies.map(r => (
        <button key={r} onClick={() => onSelect(r)}
          style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.07)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}>
          {r}
        </button>
      ))}
    </div>
  );
}

// ── History Panel (left sidebar) ─────────────────────────────────────────────
function HistoryPanel({ sessions, onSelectSession, activeSessionId, onDeleteSession, profile, onLogout }) {
  const goalInfo = GOAL_LABELS[profile?.goal] || GOAL_LABELS.general;
  return (
    <div style={{ width: '270px', minWidth: '270px', height: '100%', background: 'rgba(11,14,56,0.7)', backdropFilter: 'blur(12px)', borderRight: '1px solid rgba(99,102,241,0.08)', display: 'flex', flexDirection: 'column', padding: '20px 14px', overflowY: 'auto' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', boxShadow: '0 0 12px rgba(99,102,241,0.35)' }}>⬡</div>
        <span style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800, fontSize: '17px', color: '#f0f0ff' }}>CryptoGuide</span>
      </div>

      {/* User pill */}
      <div style={{ background: goalInfo.bg, border: `1px solid ${goalInfo.border}`, borderRadius: '10px', padding: '10px 12px', marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', color: '#6270a0', marginBottom: '2px' }}>Learning as</div>
        <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800, fontSize: '15px', color: '#f0f0ff' }}>{profile?.name || 'Explorer'}</div>
        <div style={{ fontSize: '11px', color: goalInfo.color, fontWeight: 600, marginTop: '2px' }}>{goalInfo.label}</div>
      </div>

      {/* Logout */}
      <button onClick={onLogout}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid rgba(239,68,68,0.15)', color: 'rgba(239,68,68,0.6)', padding: '7px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all 0.2s', marginBottom: '24px' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = 'rgba(239,68,68,0.6)'; e.currentTarget.style.background = 'transparent'; }}>
        ↩ Log out
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '10px', color: '#6270a0', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 4px', marginBottom: '10px' }}>💬 Chat History</div>
        {sessions.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', background: '#0f1340', borderRadius: '14px', border: '1px solid rgba(99,102,241,0.1)' }}>
            <div style={{ fontSize: '12px', color: '#6270a0' }}>No history yet.</div>
          </div>
        ) : (
          sessions.map(s => (
            <div key={s.id} onClick={() => onSelectSession(s.id)}
              style={{ position: 'relative', background: activeSessionId === s.id ? 'rgba(99,102,241,0.15)' : '#0f1340', border: activeSessionId === s.id ? '1.5px solid rgba(99,102,241,0.4)' : '1px solid rgba(99,102,241,0.12)', borderRadius: '12px', padding: '12px 40px 12px 14px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: activeSessionId === s.id ? '#f0f0ff' : '#a8b4d8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', pointerEvents: 'none' }}>
                {s.messages?.find(m => m.role === 'user')?.content.slice(0, 40) || s.messages?.[0]?.content.slice(0, 40) || 'Previous Chat'}
              </div>

              <button onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this chat?')) onDeleteSession(s.id); }}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#6270a0', fontSize: '14px', cursor: 'pointer', zIndex: 5 }}>×</button>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid rgba(99,102,241,0.08)' }}>
        <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#6270a0', letterSpacing: '1px', marginBottom: '4px' }}>POWERED BY</div>
          <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '13px', fontWeight: 800, color: '#a5b4fc' }}>ASI-1 · Fetch.ai</div>
        </div>
      </div>
    </div>
  );
}

// ── Roadmap Panel (right sidebar) ────────────────────────────────────────────
function RoadmapPanel({ roadmap, loading, onGenerate }) {
  return (
    <div style={{ width: '270px', minWidth: '270px', height: '100%', background: 'rgba(11,14,56,0.7)', backdropFilter: 'blur(12px)', borderLeft: '1px solid rgba(99,102,241,0.08)', display: 'flex', flexDirection: 'column', padding: '20px 14px', overflowY: 'auto' }}>
      <div style={{ fontSize: '10px', color: '#6270a0', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 4px', marginBottom: '16px' }}>🗺️ AI Roadmap</div>

      {!roadmap && !loading && (
        <div style={{ background: '#0f1340', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '14px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', color: '#a8b4d8', lineHeight: 1.6, marginBottom: '14px' }}>
            Get a personalized step-by-step Web3 learning roadmap built by ASI-1 just for you.
          </div>
          <button onClick={onGenerate}
            style={{ width: '100%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: 'white', padding: '11px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cabinet Grotesk',sans-serif", boxShadow: '0 0 16px rgba(99,102,241,0.35)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(99,102,241,0.35)'; }}>
            ✨ Generate My Roadmap
          </button>
        </div>
      )}

      {loading && (
        <div style={{ background: '#0f1340', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '14px', padding: '20px', marginBottom: '12px', textAlign: 'center' }}>
          <div style={{ width: '28px', height: '28px', border: '2.5px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '12px', color: '#6270a0' }}>ASI-1 is building your roadmap...</div>
          <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
        </div>
      )}

      {roadmap && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {roadmap.map((step, i) => (
            <div key={i} style={{ background: step.done ? 'rgba(52,211,153,0.06)' : '#0f1340', border: step.done ? '1px solid rgba(52,211,153,0.15)' : '1px solid rgba(99,102,241,0.1)', borderRadius: '12px', padding: '12px 14px', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0, background: step.done ? 'rgba(52,211,153,0.2)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: step.done ? '#34d399' : 'white', marginTop: '1px' }}>{step.done ? '✓' : i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: step.done ? '#34d399' : '#f0f0ff', marginBottom: '3px', fontFamily: "'Cabinet Grotesk',sans-serif" }}>{step.title}</div>
                  <div style={{ fontSize: '11px', color: '#6270a0', lineHeight: 1.5 }}>{step.desc}</div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={onGenerate}
            style={{ marginTop: '6px', background: 'transparent', border: '1px solid rgba(99,102,241,0.2)', color: '#6270a0', padding: '8px', borderRadius: '10px', fontSize: '11px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#a5b4fc'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; e.currentTarget.style.color = '#6270a0'; }}>
            ↺ Regenerate Roadmap
          </button>
        </div>
      )}
    </div>
  );
}
// ── Input Bar ─────────────────────────────────────────────────────────────────
function InputBar({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const ref = useRef(null);
  const send = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim()); setValue('');
    if (ref.current) ref.current.style.height = 'auto';
  };
  const resize = (e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; setValue(e.target.value); };
  return (
    <div style={{ padding: '14px 20px 18px', borderTop: '1px solid rgba(99,102,241,0.08)', background: 'rgba(7,9,43,0.95)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', background: '#0f1340', border: '1.5px solid rgba(99,102,241,0.12)', borderRadius: '14px', padding: '10px 14px', transition: 'all 0.2s' }}
        onFocusCapture={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.07)'; }}
        onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}>
        <textarea ref={ref} value={value} onChange={resize}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask anything about Web3..." rows={1} disabled={disabled}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f0ff', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '14px', resize: 'none', maxHeight: '120px', lineHeight: 1.6, paddingTop: '2px', cursor: 'text', caretColor: '#a5b4fc' }} />
        <button onClick={send} disabled={disabled || !value.trim()}
          style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: value.trim() && !disabled ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.1)', border: 'none', cursor: value.trim() && !disabled ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'white', transition: 'all 0.2s' }}
          onMouseEnter={e => { if (value.trim() && !disabled) e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>↑</button>
      </div>
      <div style={{ textAlign: 'center', fontSize: '10px', color: '#6270a0', marginTop: '8px' }}>Powered by ASI-1 · Enter to send · Shift+Enter for new line</div>
    </div>
  );
}

// ── Main ChatPage ─────────────────────────────────────────────────────────────
export default function ChatPage({ onLogout }) {
  const { userProfile, logout, authUser, setCurrentPage, messages, setMessages, activeSessionId, setActiveSessionId, roadmap, setRoadmap, sessions, setSessions, historyLoaded, setHistoryLoaded, history, setHistory, portfolio } = useApp();
  const [isTyping, setIsTyping] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const now = useCallback(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), []);

  // Use Firebase display name first, then profile name, then fallback
  const displayName = authUser?.displayName || userProfile?.name || 'Explorer';

  // ── Session switch: load messages from cache when activeSessionId changes ─────────
  useEffect(() => {
    // Only run once history is loaded (AppContext has seeded data)
    if (!authUser?.uid || !historyLoaded) return;

    // Try cache first — instant, no network
    const cached = sessions.find(s => s.id === activeSessionId);
    if (cached?.messages?.length > 0) {
      setMessages(cached.messages);
      setHistory(cached.messages.map(m => ({ role: m.role, content: m.content })));
      return;
    }

    // If it's a brand-new session_XXX not yet in cache, do nothing —
    // handleNewChat already set the welcome message synchronously.
    // For 'main' or other known IDs not in cache, messages are already
    // loaded by AppContext's loadUserHistory on login.
    // We only need to handle the edge case of switching to a session that
    // was deleted from cache but still exists in Firestore (rare).
    // In that case, messages will just be empty and user can start fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.uid, activeSessionId]); // intentionally omit historyLoaded to avoid re-runs
  // ── Session selection ──
  const handleSelectSession = (id) => {
    if (id === activeSessionId) return;

    // Instantly load from cache (zero Firestore wait)
    const session = sessions.find(s => s.id === id);
    if (session?.messages?.length > 0) {
      setMessages(session.messages);
      setHistory(session.messages.map(m => ({ role: m.role, content: m.content })));
      setHistoryLoaded(true); // mark loaded so auto-save works
    } else {
      // No cache hit — clear and let the effect fetch from Firestore
      setMessages([]);
      setHistory([]);
      setHistoryLoaded(false);
    }

    setActiveSessionId(id); // triggers re-validation in background
  };

  const handleDeleteSession = async (id) => {
    // Optimistic delete
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) handleNewChat();

    try {
      await deleteChatSession(authUser.uid, id);
    } catch (err) {
      console.error("Delete failed, refreshing list", err);
      const hist = await listChatSessions(authUser.uid);
      setSessions(hist);
    }
  };

  // ── Auto-save chat history whenever messages change (debounced) ───────────────
  useEffect(() => {
    if (!historyLoaded) return;
    if (!authUser?.uid) return;
    if (messages.length === 0) return;
    // Only save sessions that have at least one user message
    if (!messages.some(m => m.role === 'user')) return;

    // 1. Debounced Firestore write (waits 1.5s of inactivity before saving)
    const timer = setTimeout(() => {
      saveChatSession(authUser.uid, activeSessionId, messages)
        .catch(err => console.error('Auto-save error:', err));
    }, 1500);

    // 2. Eagerly update local sessions cache (instant, no debounce needed)
    setSessions(prev => {
      const idx = prev.findIndex(s => s.id === activeSessionId);
      const updated = {
        id: activeSessionId,
        title: messages.find(m => m.role === 'user')?.content.slice(0, 50) || 'New Chat',
        messages: messages,
        updatedAt: { seconds: Math.floor(Date.now() / 1000) }
      };
      if (idx === -1) return [updated, ...prev];
      const next = [...prev];
      next[idx] = updated;
      if (idx !== 0) return [next[idx], ...next.filter((_, i) => i !== idx)];
      return next;
    });

    return () => clearTimeout(timer); // cancel save if messages change again quickly
  }, [messages, historyLoaded, authUser?.uid, activeSessionId, setSessions]);

  // ── New Chat: clear messages & Firestore ──────────────────────────────────────
  const handleNewChat = useCallback(() => {
    if (!authUser?.uid) return;

    // 1. Save current chat immediately if it has user messages
    if (messages.some(m => m.role === 'user')) {
      saveChatSession(authUser.uid, activeSessionId, messages).catch(() => { });
    }

    // 2. Build welcome message to show INSTANTLY (no Firestore wait)
    const goalMap = { investing: 'crypto investing', nft: 'NFTs & digital art', defi: 'DeFi & yield', general: 'Web3 basics' };
    const goal = goalMap[userProfile?.goal] || 'Web3';
    const newSessionId = 'session_' + Date.now();
    const welcomeMsg = {
      id: Date.now() + 1, role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `Hey **${displayName}**! 👋 ASI-1 here. Ready to dive into **${goal}**?\n\nI can help you build your roadmap or explain complex topics. What's on your mind?`,
      quickReplies: ['Generate roadmap', 'Explain Bitcoin', 'How to invest?'],
    };

    // 3. Set all state at once — welcome shows immediately, no delay
    setMessages([welcomeMsg]);
    setHistory([]);
    setHistoryLoaded(true);  // mark loaded so auto-save is armed
    setActiveSessionId(newSessionId);

  }, [messages, authUser?.uid, activeSessionId, userProfile?.goal, displayName,
    setActiveSessionId, setHistoryLoaded, setMessages, setHistory]);

  // ── Generate AI Roadmap ──────────────────────────────────────────────────────
  const generateRoadmap = useCallback(async () => {
    setRoadmapLoading(true);
    setRoadmap(null);
    const prompt = `You are a Web3 education expert. Create a personalized learning roadmap for someone interested in "${userProfile?.goal || 'general Web3'}" who is a "${userProfile?.level || 'beginner'}". 

Return ONLY a valid JSON array with exactly 6 steps, no extra text, no markdown. Format:
[{"title":"Step title","desc":"One sentence description","done":false},...]

Make the steps specific, practical and ordered from beginner to advanced for their goal.`;

    try {
      const response = await callASI1([{ role: 'user', content: prompt }], userProfile);
      const cleaned = response.replace(/```json|```/g, '').trim();
      const steps = JSON.parse(cleaned);
      setRoadmap(steps);
      setMessages(prev => [...prev, {
        id: Date.now(), role: 'assistant', timestamp: now(),
        content: `🗺️ I've built your personalized **${userProfile?.goal || 'Web3'} roadmap** — check the sidebar! It has 6 steps tailored to your experience level. Which step would you like to start with?`,
        quickReplies: ['Start with Step 1', 'Tell me more about the roadmap', 'What should I learn first?'],
      }]);
    } catch {
      setRoadmap([
        { title: 'Understand Blockchain', desc: 'Learn how blocks, chains and consensus work', done: false },
        { title: 'Set Up a Wallet', desc: 'Create and secure your first crypto wallet', done: false },
        { title: 'Buy Your First Crypto', desc: 'Use an exchange to buy a small amount safely', done: false },
        { title: 'Explore DeFi Basics', desc: 'Learn swapping, liquidity pools and yield farming', done: false },
        { title: 'Understand NFTs & DAOs', desc: 'Discover digital ownership and decentralized orgs', done: false },
        { title: 'Web3 Security', desc: 'Protect yourself from scams, phishing and hacks', done: false },
      ]);
    } finally {
      setRoadmapLoading(false);
    }
  }, [now, setMessages, setRoadmap, userProfile]);

  // ── Send message ──────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isTyping) return;
    if (text.toLowerCase().includes('generate') && text.toLowerCase().includes('roadmap')) {
      generateRoadmap(); return;
    }
    const userMsg = { id: Date.now(), role: 'user', content: text, timestamp: now() };
    setMessages(prev => [...prev, userMsg]);
    const newHistory = [...history, { role: 'user', content: text }];
    setHistory(newHistory);
    setIsTyping(true);
    try {
      const reply = await callASI1(newHistory, userProfile, portfolio);
      setHistory(prev => [...prev, { role: 'assistant', content: reply }]);
      const m = (text + reply).toLowerCase();
      let qr = ['Tell me more', 'Give me an example', 'What should I learn next?'];
      if (m.includes('blockchain')) qr = ['How does mining work?', 'What is a smart contract?', 'Next: Wallets →'];
      if (m.includes('wallet')) qr = ['How do I create one?', "What's a seed phrase?", 'How do I stay safe?'];
      if (m.includes('defi')) qr = ['What is yield farming?', 'What are liquidity pools?', 'Is DeFi risky?'];
      if (m.includes('nft')) qr = ['How do I buy an NFT?', 'What makes NFTs valuable?', 'What is a DAO?'];
      if (m.includes('invest')) qr = ['Which coins are best for beginners?', 'How do I manage risk?', 'What is dollar-cost averaging?'];
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: reply, timestamp: now(), quickReplies: qr }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'assistant', timestamp: now(),
        content: err.message?.includes('rate_limited') ? "⏳ Too fast! Please wait a moment." : "I'm having a moment — please try again! 🙏",
        quickReplies: ['Try again', 'Ask something else'],
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [history, isTyping, userProfile, generateRoadmap, now, portfolio, setHistory, setMessages]);

  const handleLogout = () => { logout(); if (onLogout) onLogout(); };
  const lastAgentIndex = messages.map(m => m.role).lastIndexOf('assistant');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="bg-orb bg-orb-1" style={{ opacity: 0.15 }} />
      <div className="bg-orb bg-orb-2" style={{ opacity: 0.12 }} />
      <div className="bg-grid" />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.8);}}
        .chat-scroll::-webkit-scrollbar{width:4px;}
        .chat-scroll::-webkit-scrollbar-track{background:transparent;}
        .chat-scroll::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:2px;}
      `}</style>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '58px', flexShrink: 0, background: 'rgba(7,9,43,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>⬡</div>
          <div>
            <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800, fontSize: '15px', color: '#f0f0ff' }}>CryptoGuide Agent</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '11px', color: '#34d399' }}>ASI-1 Online </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#f0f0ff', padding: '6px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 700 }}>Chat</button>
            <button onClick={() => setCurrentPage('portfolio')} style={{ background: 'transparent', border: 'none', color: '#a8b4d8', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Portfolio</button>
          </div>
          <button onClick={handleNewChat}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '7px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.16)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}>
            ➕ New Chat

          </button>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '13px', fontWeight: 800, color: '#f0f0ff' }}>{displayName}</div>
            <div style={{ fontSize: '11px', color: '#6270a0' }}>{userProfile?.level || 'Beginner'} · {GOAL_LABELS[userProfile?.goal]?.label || 'Web3 Explorer'}</div>
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👤</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <HistoryPanel
          sessions={sessions}
          onSelectSession={handleSelectSession}
          activeSessionId={activeSessionId}
          onDeleteSession={handleDeleteSession}
          profile={{ ...userProfile, name: displayName }}
          onLogout={handleLogout}
        />

        {/* Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {messages.map((msg, i) => (
              <div key={msg.id}>
                <MessageBubble role={msg.role} content={msg.content} timestamp={msg.timestamp} />
                {msg.role === 'assistant' && msg.quickReplies && i === lastAgentIndex && !isTyping && (
                  <QuickReplies replies={msg.quickReplies} onSelect={sendMessage} />
                )}
              </div>
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
          <InputBar onSend={sendMessage} disabled={isTyping} />
        </div>

        <RoadmapPanel
          roadmap={roadmap}
          loading={roadmapLoading}
          onGenerate={generateRoadmap}
        />
      </div>
    </div>
  );
}