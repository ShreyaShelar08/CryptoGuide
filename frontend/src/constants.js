// ── Shared assets for simulator ──
export const CRYPTO_ASSETS = [
    { id: 'BTC', name: 'Bitcoin', icon: '₿', price: 67000, change: 2.4, color: '#f7931a' },
    { id: 'ETH', name: 'Ethereum', icon: 'Ξ', price: 3500, change: -1.2, color: '#627eea' },
    { id: 'SOL', name: 'Solana', icon: '◎', price: 180, change: 5.1, color: '#9945ff' },
    { id: 'BNB', name: 'BNB', icon: '⬡', price: 590, change: 0.8, color: '#f0b90b' },
    { id: 'MATIC', name: 'Polygon', icon: '⬟', price: 0.9, change: -3.2, color: '#8247e5' },
    { id: 'LINK', name: 'Chainlink', icon: '⬡', price: 18, change: 1.9, color: '#2a5ada' },
];

export const STARTING_BALANCE = 10000;

export const GOAL_LABELS = {
    investing: { label: 'Crypto Investor', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)' },
    nft: { label: 'NFT Explorer', color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.25)' },
    defi: { label: 'DeFi Learner', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
    general: { label: 'Web3 Explorer', color: '#a5b4fc', bg: 'rgba(165,180,252,0.1)', border: 'rgba(165,180,252,0.25)' },
};
