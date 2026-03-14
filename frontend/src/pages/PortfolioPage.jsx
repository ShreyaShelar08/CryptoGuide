import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { STARTING_BALANCE, GOAL_LABELS } from '../constants';
import { saveUserProfile } from '../firebase/authService';
import { useLivePrices } from '../hooks/useLivePrices';

// ── tiny sparkline rendered on <canvas> ──────────────────────────────────────
function Sparkline({ data, color, width = 120, height = 40 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !data || data.length < 2) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 4;

    const pts = data.map((v, i) => ({
      x: pad + (i / (data.length - 1)) * (width - pad * 2),
      y: pad + (1 - (v - min) / range) * (height - pad * 2),
    }));

    // gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, color + '40');
    grad.addColorStop(1, color + '00');
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, height);
    ctx.lineTo(pts[0].x, height);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }, [data, color, width, height]);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
}

// ── donut chart using SVG ─────────────────────────────────────────────────────
function DonutChart({ segments, size = 120 }) {
  const r = 46;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let cumulative = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0f1340" strokeWidth="16" />
      {segments.map((seg, i) => {
        const len = (seg.value / total) * circumference;
        const offset = cumulative;
        cumulative += len;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="16"
            strokeDasharray={`${len} ${circumference - len}`}
            strokeDashoffset={-offset + circumference * 0.25}
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        );
      })}
      {/* center text */}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#f0f0ff" fontSize="13" fontWeight="800">
        {segments.length}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#6270a0" fontSize="9">
        Assets
      </text>
    </svg>
  );
}

// ── format large numbers ──────────────────────────────────────────────────────
function fmtLarge(n) {
  if (!n) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

function fmtPrice(p) {
  if (p === undefined || p === null) return '—';
  if (p < 0.01) return `$${p.toFixed(6)}`;
  if (p < 1)    return `$${p.toFixed(4)}`;
  return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── asset colours / metadata (stable, not price-dependent) ───────────────────
const ASSET_META = {
  BTC:  { name: 'Bitcoin',   icon: '₿', color: '#f7931a', symbol: 'BTC' },
  ETH:  { name: 'Ethereum',  icon: 'Ξ', color: '#627eea', symbol: 'ETH' },
  SOL:  { name: 'Solana',    icon: '◎', color: '#9945ff', symbol: 'SOL' },
  BNB:  { name: 'BNB',       icon: '⬡', color: '#f0b90b', symbol: 'BNB' },
  MATIC:{ name: 'Polygon',   icon: '⬟', color: '#8247e5', symbol: 'MATIC' },
  LINK: { name: 'Chainlink', icon: '⬡', color: '#2a5ada', symbol: 'LINK' },
};

// ── compute average buy price from txLog ──────────────────────────────────────
function computeAvgBuy(txLog, assetId) {
  let totalQty = 0, totalCost = 0;
  txLog.forEach(tx => {
    if (tx.asset !== assetId) return;
    if (tx.type === 'BUY') { totalQty += tx.qty; totalCost += tx.qty * tx.price; }
    if (tx.type === 'SELL') { totalQty -= tx.qty; }
  });
  return totalQty > 0 ? totalCost / totalQty : null;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── clean holdings: strip 0-qty entries and floating point dust ──────────────
function cleanHoldings(holdings) {
  if (!holdings || typeof holdings !== 'object') return {};
  const cleaned = {};
  Object.entries(holdings).forEach(([id, qty]) => {
    if (qty > 0.00000001) cleaned[id] = qty;
  });
  return cleaned;
}

export default function PortfolioPage({ onLogout }) {
  const { userProfile, authUser, setCurrentPage, logout, portfolio, setPortfolio } = useApp();
  // Ensure holdings is always an object and txLog is always an array (guards against corrupt data)
  const balance = portfolio?.balance ?? 10000;
  const holdings = portfolio?.holdings && typeof portfolio.holdings === 'object' ? portfolio.holdings : {};
  const txLog = Array.isArray(portfolio?.txLog) ? portfolio.txLog : [];
  const { prices, sparklines, lastUpdated, loading, error, refetch } = useLivePrices();

  const [selected, setSelected] = useState('BTC');
  const [amount, setAmount]     = useState('');
  const [activeTab, setActiveTab] = useState('trade');   // 'trade' | 'holdings' | 'activity'
  const [orderType, setOrderType] = useState('market');  // 'market' | 'limit'
  const [limitPrice, setLimitPrice] = useState('');
  const [notification, setNotification] = useState(null);
  const [tickerDir, setTickerDir] = useState({});        // flash green/red on price change
  const prevPricesRef = useRef({});
  const notifyTimer = useRef(null);

  const displayName = authUser?.displayName || userProfile?.name || 'Explorer';
  const goalInfo    = GOAL_LABELS[userProfile?.goal] || GOAL_LABELS.general;
  const assetMeta   = ASSET_META[selected];
  const livePrice   = prices[selected]?.price ?? 0;

  // ── flash direction on price change ──────────────────────────────────────────
  useEffect(() => {
    const dirs = {};
    Object.keys(prices).forEach(id => {
      const prev = prevPricesRef.current[id];
      const curr = prices[id]?.price;
      if (prev && curr) dirs[id] = curr > prev ? 'up' : curr < prev ? 'down' : null;
    });
    setTickerDir(dirs);
    prevPricesRef.current = Object.fromEntries(
      Object.keys(prices).map(id => [id, prices[id]?.price])
    );
    const t = setTimeout(() => setTickerDir({}), 800);
    return () => clearTimeout(t);
  }, [prices]);

  // ── portfolio totals ──────────────────────────────────────────────────────────
  const portfolioValue = Object.entries(holdings).reduce((sum, [id, qty]) => {
    return sum + qty * (prices[id]?.price || 0);
  }, 0);
  const totalValue = balance + portfolioValue;
  const pnl        = totalValue - STARTING_BALANCE;
  const pnlPct     = ((pnl / STARTING_BALANCE) * 100).toFixed(2);

  // ── estimated cost ────────────────────────────────────────────────────────────
  const qty    = parseFloat(amount) || 0;
  const estCost = qty * livePrice;

  // ── notify helper ──────────────────────────────────────────────────────────────
  const notify = useCallback((msg, type = 'success') => {
    clearTimeout(notifyTimer.current);
    setNotification({ msg, type });
    notifyTimer.current = setTimeout(() => setNotification(null), 3200);
  }, []);

  // ── buy / sell ────────────────────────────────────────────────────────────────
  const doBuy = () => {
    if (!qty || qty <= 0) { notify('Enter a valid amount', 'error'); return; }
    const price = orderType === 'limit' ? parseFloat(limitPrice) : livePrice;
    if (!price || price <= 0) { notify('Enter a valid limit price', 'error'); return; }
    const cost = qty * price;
    if (cost > balance) { notify('Insufficient cash balance!', 'error'); return; }

    const newHoldings = cleanHoldings({ ...holdings, [selected]: +((holdings[selected] || 0) + qty).toFixed(8) });
    const newPortfolio = {
      ...portfolio,
      balance: +(balance - cost).toFixed(2),
      holdings: newHoldings,
      txLog: [
        { type: 'BUY', asset: selected, qty, price, timestamp: Date.now() },
        ...(Array.isArray(txLog) ? txLog : []).slice(0, 49),
      ],
    };
    setPortfolio(newPortfolio);
    if (authUser?.uid) {
      saveUserProfile(authUser.uid, { ...userProfile, portfolio: newPortfolio })
        .catch(err => console.error('Failed to save portfolio to Firestore:', err));
    }
    setAmount('');
    notify(`Bought ${qty} ${selected} @ ${fmtPrice(price)} ✓`, 'success');
  };

  const doSell = () => {
    if (!qty || qty <= 0) { notify('Enter a valid amount', 'error'); return; }
    if ((holdings[selected] || 0) < qty) { notify(`Not enough ${selected}!`, 'error'); return; }
    const price = orderType === 'limit' ? parseFloat(limitPrice) : livePrice;
    if (!price || price <= 0) { notify('Enter a valid limit price', 'error'); return; }
    const proceeds = qty * price;

    const newHoldings = cleanHoldings({ ...holdings, [selected]: +((holdings[selected] || 0) - qty).toFixed(8) });
    const newPortfolio = {
      ...portfolio,
      balance: +(balance + proceeds).toFixed(2),
      holdings: newHoldings,
      txLog: [
        { type: 'SELL', asset: selected, qty, price, timestamp: Date.now() },
        ...(Array.isArray(txLog) ? txLog : []).slice(0, 49),
      ],
    };
    setPortfolio(newPortfolio);
    if (authUser?.uid) {
      saveUserProfile(authUser.uid, { ...userProfile, portfolio: newPortfolio })
        .catch(err => console.error('Failed to save portfolio to Firestore:', err));
    }
    setAmount('');
    notify(`Sold ${qty} ${selected} @ ${fmtPrice(price)} ✓`, 'success');
  };

  // ── quick fill ────────────────────────────────────────────────────────────────
  const setMaxBuy = () => {
    if (livePrice <= 0) return;
    setAmount(parseFloat((balance / livePrice).toFixed(8)).toString());
  };

  const setMaxSell = () => {
    const h = holdings[selected] || 0;
    setAmount(parseFloat(h.toFixed(8)).toString());
  };

  const handleLogout = () => { logout(); if (onLogout) onLogout(); };

  // ── donut segments ────────────────────────────────────────────────────────────
  const donutSegments = Object.entries(holdings)
    .filter(([, q]) => q > 0)
    .map(([id, qty]) => ({
      color: ASSET_META[id]?.color || '#6366f1',
      value: qty * (prices[id]?.price || 0),
      label: id,
    }));

  // ── styles ────────────────────────────────────────────────────────────────────
  const S = {
    page:     { height: '100vh', display: 'flex', flexDirection: 'column', background: '#07092b', position: 'relative', overflow: 'hidden' },
    header:   { position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '60px', flexShrink: 0, background: 'rgba(7,9,43,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(99,102,241,0.1)' },
    main:     { flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 1 },
    sidebar:  { width: '280px', flexShrink: 0, borderRight: '1px solid rgba(99,102,241,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    content:  { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    panel:    { flex: 1, overflowY: 'auto', padding: '24px' },
  };

  return (
    <div style={S.page}>
      <div className="bg-orb bg-orb-1" style={{ opacity: 0.12 }} />
      <div className="bg-orb bg-orb-2" style={{ opacity: 0.08 }} />
      <div className="bg-grid" />

      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
        @keyframes slideIn  { from{opacity:0;transform:translateX(-8px);}to{opacity:1;transform:translateX(0);} }
        @keyframes notifyIn { from{opacity:0;transform:translateY(-12px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes flashGreen { 0%,100%{background:transparent;}50%{background:rgba(52,211,153,0.12);} }
        @keyframes flashRed   { 0%,100%{background:transparent;}50%{background:rgba(239,68,68,0.12);} }
        @keyframes spin { to{transform:rotate(360deg);} }
        .asset-row:hover { background: rgba(99,102,241,0.08) !important; }
        .tab-btn:hover   { color: #a5b4fc !important; }
        .trade-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .quick-btn:hover { background: rgba(99,102,241,0.2) !important; color: #f0f0ff !important; }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }
      `}</style>

      {/* ── Toast Notification ── */}
      {notification && (
        <div style={{
          position: 'fixed', top: '76px', left: '50%', transform: 'translateX(-50%)',
          background: notification.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${notification.type === 'success' ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: notification.type === 'success' ? '#34d399' : '#f87171',
          padding: '12px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '14px',
          zIndex: 1000, backdropFilter: 'blur(20px)', animation: 'notifyIn 0.3s ease',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {notification.msg}
        </div>
      )}

      {/* ═══ HEADER ═══ */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⬡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#f0f0ff' }}>Portfolio Simulator</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              {loading
                ? <><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24', display: 'inline-block', animation: 'spin 1s linear infinite' }} /><span style={{ color: '#fbbf24' }}>Updating…</span></>
                : error
                  ? <><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', display: 'inline-block' }} /><span style={{ color: '#f87171' }}>Using cached prices</span></>
                  : <><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} /><span style={{ color: '#34d399' }}>Live {lastUpdated ? `· ${lastUpdated.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}` : ''}</span></>
              }
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setCurrentPage('chat')} style={{ background: 'transparent', border: 'none', color: '#a8b4d8', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '6px 12px', borderRadius: 8 }}>Chat</button>
            <button style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#f0f0ff', padding: '6px 16px', borderRadius: 8, fontSize: 14, fontWeight: 700 }}>Portfolio</button>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f0f0ff' }}>{displayName}</div>
            <div style={{ fontSize: 11, color: '#6270a0' }}>{userProfile?.level} · {goalInfo.label}</div>
          </div>
          <button onClick={refetch} title="Refresh prices" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#a5b4fc', width: 34, height: 34, borderRadius: 8, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↻</button>
          <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#ef4444', padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>Logout</button>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div style={S.main}>

        {/* ─── LEFT SIDEBAR: Assets Watchlist ─── */}
        <div style={S.sidebar}>
          <div style={{ padding: '16px 16px 8px', flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6270a0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Watchlist</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {Object.entries(ASSET_META).map(([id, meta]) => {
              const p = prices[id] || {};
              const isSelected = selected === id;
              const held = holdings[id] || 0;
              const flash = tickerDir[id];
              return (
                <div key={id} className="asset-row" onClick={() => setSelected(id)}
                  style={{
                    padding: '12px 16px', cursor: 'pointer', borderLeft: isSelected ? `3px solid ${meta.color}` : '3px solid transparent',
                    background: isSelected ? `${meta.color}12` : (flash === 'up' ? 'rgba(52,211,153,0.04)' : flash === 'down' ? 'rgba(239,68,68,0.04)' : 'transparent'),
                    transition: 'all 0.15s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${meta.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: meta.color }}>{meta.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#f0f0ff' }}>{id}</div>
                        <div style={{ fontSize: 11, color: '#6270a0' }}>{meta.name}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: flash === 'up' ? '#34d399' : flash === 'down' ? '#f87171' : '#f0f0ff', transition: 'color 0.3s' }}>
                        {fmtPrice(p.price)}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: (p.change || 0) >= 0 ? '#34d399' : '#f87171' }}>
                        {(p.change || 0) >= 0 ? '+' : ''}{(p.change || 0).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  {held > 0 && (
                    <div style={{ marginTop: 6, fontSize: 10, color: '#6270a0', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Held: {held.toFixed(4)} {id}</span>
                      <span style={{ color: '#a5b4fc' }}>{fmtPrice(held * (p.price || 0))}</span>
                    </div>
                  )}
                  {sparklines[id]?.length >= 2 && (
                    <div style={{ marginTop: 6 }}>
                      <Sparkline data={sparklines[id].slice(-48)} color={meta.color} width={220} height={28} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── CENTER: Trade Panel ─── */}
        <div style={S.content}>
          {/* Asset Info Bar */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(99,102,241,0.1)', background: 'rgba(7,9,43,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${assetMeta.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: assetMeta.color }}>{assetMeta.icon}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontWeight: 900, fontSize: 24, color: '#f0f0ff' }}>{fmtPrice(livePrice)}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: (prices[selected]?.change || 0) >= 0 ? '#34d399' : '#f87171' }}>
                    {(prices[selected]?.change || 0) >= 0 ? '+' : ''}{(prices[selected]?.change || 0).toFixed(2)}% (24h)
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#6270a0' }}>{assetMeta.name} / USD</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 32 }}>
              {[
                { label: '24h High', val: fmtPrice(prices[selected]?.high24h) },
                { label: '24h Low',  val: fmtPrice(prices[selected]?.low24h) },
                { label: 'Mkt Cap',  val: fmtLarge(prices[selected]?.marketCap) },
                { label: '24h Vol',  val: fmtLarge(prices[selected]?.volume) },
              ].map(({ label, val }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#6270a0', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#a5b4fc' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sparkline chart area */}
          {sparklines[selected] && (
            <div style={{ padding: '0 24px', paddingTop: 16, paddingBottom: 8 }}>
              <div style={{ fontSize: 10, color: '#6270a0', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>7-day price</div>
              <Sparkline data={sparklines[selected]} color={assetMeta.color} width={700} height={80} />
            </div>
          )}

          {/* Trade Section */}
          <div style={S.panel}>
            {/* Order type tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {['market', 'limit'].map(t => (
                <button key={t} onClick={() => setOrderType(t)} style={{
                  padding: '8px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.15s',
                  background: orderType === t ? (t === 'market' ? 'rgba(99,102,241,0.2)' : 'rgba(251,191,36,0.15)') : 'rgba(99,102,241,0.05)',
                  color: orderType === t ? (t === 'market' ? '#a5b4fc' : '#fbbf24') : '#6270a0',
                  border: orderType === t ? `1px solid ${t === 'market' ? 'rgba(99,102,241,0.35)' : 'rgba(251,191,36,0.3)'}` : '1px solid transparent',
                }}>
                  {t === 'market' ? '⚡ Market Order' : '🎯 Limit Order'}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 12, color: '#6270a0', alignSelf: 'center' }}>
                Cash: <span style={{ color: '#a5b4fc', fontWeight: 800 }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                &nbsp;·&nbsp;
                Held: <span style={{ color: '#a5b4fc', fontWeight: 800 }}>{(holdings[selected] || 0).toFixed(6)} {selected}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {/* Amount input */}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#6270a0', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Amount ({selected})</label>
                <input
                  type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0.00000000"
                  style={{ width: '100%', background: '#0a0d30', border: '2px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: '14px 16px', color: '#f0f0ff', fontSize: 18, fontWeight: 700, outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
                />
                {/* Quick fill */}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {['25%', '50%', '75%', 'MAX↑', 'MAX↓'].map((label, i) => (
                    <button key={label} className="quick-btn" onClick={() => {
                      if (label === 'MAX↑') setMaxBuy();
                      else if (label === 'MAX↓') setMaxSell();
                      else {
                        const frac = [0.25, 0.5, 0.75][i];
                        const held = holdings[selected] || 0;
                        if (held > 0) setAmount(parseFloat((held * frac).toFixed(8)).toString());
                        else setAmount(parseFloat((balance / livePrice * frac).toFixed(8)).toString());
                      }
                    }} style={{
                      flex: 1, padding: '5px 0', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
                      borderRadius: 8, color: '#6270a0', fontSize: 10, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                      {label === 'MAX↑' ? '🟢MAX' : label === 'MAX↓' ? '🔴MAX' : label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated cost / limit price */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {orderType === 'limit' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#fbbf24', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Limit Price (USD)</label>
                    <input
                      type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value)}
                      placeholder={fmtPrice(livePrice).replace('$', '')}
                      style={{ width: '100%', background: '#0a0d30', border: '2px solid rgba(251,191,36,0.25)', borderRadius: 14, padding: '14px 16px', color: '#fbbf24', fontSize: 16, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#6270a0', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Value (USD)</label>
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', fontSize: 22, fontWeight: 900, color: '#a5b4fc', background: '#0a0d30', borderRadius: 14, padding: '0 16px', border: '2px solid rgba(99,102,241,0.1)' }}>
                    ${qty > 0 ? estCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </div>
                </div>
              </div>
            </div>

            {/* Buy / Sell Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="trade-btn" onClick={doBuy} style={{
                flex: 1, height: 54, background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', color: 'white',
                fontSize: 16, fontWeight: 800, borderRadius: 14, cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
              }}>
                ▲ Buy {selected}
              </button>
              <button className="trade-btn" onClick={doSell} style={{
                flex: 1, height: 54, background: 'linear-gradient(135deg,#ef4444,#dc2626)', border: 'none', color: 'white',
                fontSize: 16, fontWeight: 800, borderRadius: 14, cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
              }}>
                ▼ Sell {selected}
              </button>
            </div>

            {/* Order info */}
            <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(99,102,241,0.04)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.08)', fontSize: 12, color: '#6270a0', display: 'flex', gap: 24 }}>
              <span>Order type: <b style={{ color: '#a5b4fc' }}>{orderType === 'market' ? 'Market (instant)' : 'Limit (at price)'}</b></span>
              <span>Fee: <b style={{ color: '#a5b4fc' }}>0%</b> (simulated)</span>
              {holdings[selected] > 0 && (() => {
                const avg = computeAvgBuy(txLog, selected);
                if (!avg) return null;
                const unrealPnl = (livePrice - avg) * holdings[selected];
                return (
                  <span>Avg buy: <b style={{ color: '#a5b4fc' }}>{fmtPrice(avg)}</b> &nbsp;|&nbsp; Unrealized P&L: <b style={{ color: unrealPnl >= 0 ? '#34d399' : '#f87171' }}>{unrealPnl >= 0 ? '+' : ''}${unrealPnl.toFixed(2)}</b></span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR: Portfolio Overview ─── */}
        <div style={{ width: 300, flexShrink: 0, borderLeft: '1px solid rgba(99,102,241,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Balance card */}
          <div style={{ margin: 16, padding: '20px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: 20, boxShadow: '0 8px 24px rgba(99,102,241,0.3)', flexShrink: 0, animation: 'fadeUp 0.4s ease' }}>
            <div style={{ fontSize: 10, opacity: 0.75, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Total Portfolio Value</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 12 }}>
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Cash</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: 'white' }}>${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Invested</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: 'white' }}>${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 10px', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 9, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total P&L</div>
                <div style={{ fontWeight: 900, fontSize: 15, color: pnl >= 0 ? '#34d399' : '#f87171' }}>
                  {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnl >= 0 ? '+' : ''}{pnlPct}%)
                </div>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', margin: '0 16px 12px', background: 'rgba(99,102,241,0.07)', borderRadius: 10, padding: 3, flexShrink: 0 }}>
            {[['holdings', 'Holdings'], ['activity', 'Activity']].map(([t, label]) => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, transition: 'all 0.15s',
                background: activeTab === t ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: activeTab === t ? '#a5b4fc' : '#6270a0',
              }}>{label}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>

            {/* ── HOLDINGS TAB ── */}
            {activeTab === 'holdings' && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                {/* Donut chart */}
                {donutSegments.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 16, background: 'rgba(99,102,241,0.05)', borderRadius: 16, border: '1px solid rgba(99,102,241,0.1)' }}>
                    <DonutChart segments={donutSegments} size={100} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {donutSegments.map(s => (
                        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                          <div style={{ fontSize: 11, color: '#a8b4d8', flex: 1 }}>{s.label}</div>
                          <div style={{ fontSize: 11, color: '#6270a0' }}>
                            {((s.value / portfolioValue) * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Holdings list */}
                {Object.entries(holdings).filter(([, q]) => q > 0).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#6270a0' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>No holdings yet</div>
                    <div style={{ fontSize: 12 }}>Buy your first crypto to get started</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(holdings).filter(([, q]) => q > 0).map(([id, qty]) => {
                      const meta = ASSET_META[id];
                      const p = prices[id] || {};
                      const val = qty * (p.price || 0);
                      const avg = computeAvgBuy(txLog, id);
                      const unrealPnl = avg ? (p.price - avg) * qty : null;
                      return (
                        <div key={id} onClick={() => setSelected(id)} style={{
                          background: selected === id ? `${meta.color}10` : 'rgba(99,102,241,0.04)',
                          border: `1px solid ${selected === id ? `${meta.color}30` : 'rgba(99,102,241,0.08)'}`,
                          borderRadius: 14, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.2s',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 7, background: `${meta.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: meta.color }}>{meta.icon}</div>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: 13, color: '#f0f0ff' }}>{id}</div>
                                <div style={{ fontSize: 10, color: '#6270a0' }}>{qty.toFixed(6)} coins</div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 800, fontSize: 13, color: '#a5b4fc' }}>${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                              <div style={{ fontSize: 10, color: (p.change || 0) >= 0 ? '#34d399' : '#f87171' }}>{(p.change || 0) >= 0 ? '+' : ''}{(p.change || 0).toFixed(2)}%</div>
                            </div>
                          </div>
                          {avg && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(99,102,241,0.08)' }}>
                              <span style={{ color: '#6270a0' }}>Avg buy: <b style={{ color: '#a5b4fc' }}>{fmtPrice(avg)}</b></span>
                              <span style={{ color: unrealPnl >= 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                                {unrealPnl >= 0 ? '+' : ''}${unrealPnl.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── ACTIVITY TAB ── */}
            {activeTab === 'activity' && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                {txLog.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#6270a0' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>No transactions yet</div>
                    <div style={{ fontSize: 12 }}>Your trade history will appear here</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {txLog.map((tx, i) => {
                      const date = tx.timestamp ? new Date(tx.timestamp) : null;
                      return (
                        <div key={i} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(99,102,241,0.04)', border: `1px solid ${tx.type === 'BUY' ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)'}`, animation: 'slideIn 0.2s ease' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 24, height: 24, borderRadius: 6, background: tx.type === 'BUY' ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: tx.type === 'BUY' ? '#34d399' : '#f87171', fontWeight: 900 }}>
                                {tx.type === 'BUY' ? '▲' : '▼'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: 12, color: tx.type === 'BUY' ? '#34d399' : '#f87171' }}>
                                  {tx.type} {tx.qty.toFixed(6)} {tx.asset}
                                </div>
                                <div style={{ fontSize: 10, color: '#6270a0' }}>@ {fmtPrice(tx.price)}</div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc' }}>
                                ${(tx.qty * tx.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </div>
                              {date && (
                                <div style={{ fontSize: 9, color: '#6270a0', marginTop: 2 }}>
                                  {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
