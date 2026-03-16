// ── CryptoGuide API Service ───────────────────────────────────────────────────
// Routes all ASI-1 calls through the Flask backend for security & rate limiting

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// ── Main chat function ────────────────────────────────────────────────────────
export async function callASI1(messages, profile, portfolio = {}) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, profile, portfolio }),
    });

    // Handle rate limiting
    if (response.status === 429) {
      const data = await response.json();
      throw new Error(`rate_limited:${data.retry_after || 60}`);
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.reply;

  } catch (err) {
    // If backend is not running, fall back to demo mode
    if (err.message.includes("fetch") || err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
      console.warn("Backend not reachable — running in demo mode");
      await new Promise(r => setTimeout(r, 1200 + Math.random() * 600));
      return getDemoResponse(messages[messages.length - 1]?.content || "", profile);
    }
    throw err;
  }
}

// ── Save profile to backend ───────────────────────────────────────────────────
export async function saveProfile(profile) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    return await response.json();
  } catch {
    // Silently fail — profile is still saved in React state
    return { success: false };
  }
}

// ── Check rate limit status ───────────────────────────────────────────────────
export async function getRateStatus() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/rate-status`);
    return await response.json();
  } catch {
    return null;
  }
}

// ── Demo responses (fallback when backend is offline) ─────────────────────────
function getDemoResponse(msg, profile) {
  const m = msg.toLowerCase();
  const name = profile?.name ? ` ${profile.name}` : "";

  if (m.includes("blockchain"))
    return `Great question${name}! ⛓️ Think of **blockchain** as a Google Sheet that millions of people can see — but no one can secretly edit or delete any entry. Every transaction is permanently recorded across thousands of computers worldwide.\n\nThe magic is that no single person or company controls it — the code enforces the rules, not a bank.\n\n💡 **Next step:** Want to learn how wallets connect you to the blockchain?`;

  if (m.includes("wallet"))
    return `👛 A **crypto wallet** is like your email address + password — but for money.\n\n• **Public key** = your address (share freely to receive crypto)\n• **Private key** = your password (NEVER share this)\n• **Seed phrase** = master backup (12 words, store offline only)\n\nWallets don't actually store crypto — they store the *keys* that prove you own it.\n\n🔐 **Rule #1:** Anyone who asks for your seed phrase is trying to steal from you.`;

  if (m.includes("gas") || m.includes("fee"))
    return `⛽ **Gas fees** are like a tip to the post office for delivering your letter — except the "post office" is thousands of computers processing your transaction.\n\nFees spike when the network is busy (like Uber surge pricing). They vary by network, time of day, and transaction complexity.\n\n💡 **Pro tip:** Early morning UTC usually has lower Ethereum fees. Always check before sending!`;

  if (m.includes("nft"))
    return `🖼️ **NFT** stands for Non-Fungible Token — a digital certificate of ownership stored on the blockchain.\n\n"Non-fungible" just means *unique*. Unlike Bitcoin where every coin is identical, each NFT is one-of-a-kind.\n\nCommon uses: digital art, gaming items, event tickets, proof of membership.\n\n🤔 "Can't I just screenshot it?" Yes — but the certificate of ownership stays with the NFT holder, just like photos of the Mona Lisa don't make you the owner.`;

  if (m.includes("defi"))
    return `⚡ **DeFi (Decentralized Finance)** is a bank run by code instead of people.\n\nWith DeFi you can:\n• Earn interest on crypto\n• Borrow without a credit check\n• Trade tokens directly without an exchange\n• Provide liquidity and earn fees\n\n⚠️ **Heads up:** DeFi is powerful but risky for beginners. Always research before committing real money.`;

  if (m.includes("seed") || m.includes("phrase"))
    return `🌱 Your **seed phrase** is 12–24 random words that act as the master key to ALL your crypto.\n\n✅ Store it written on paper in a safe, or on a metal plate.\n❌ Never screenshot it, type it into any website, or share it with anyone — ever.\n\n⚠️ If someone has your seed phrase, they have ALL your crypto. No support can help you recover it.`;

  if (m.includes("safe") || m.includes("scam"))
    return `🛡️ Great that you're thinking about security!\n\n**Top 5 rules:**\n1. Never share your seed phrase or private key\n2. Double-check wallet addresses before sending\n3. Be suspicious of anything "too good to be true"\n4. Use a hardware wallet for large amounts\n5. Verify every project on official channels\n\n🚩 **Red flags:** Unsolicited DMs, urgent deadlines, "guaranteed returns", requests to connect your wallet to unknown sites.`;

  if (m.includes("hello") || m.includes("hi") || m.includes("start") || m.includes("module 1"))
    return `Hey${name}! 👋 Great to have you here — I'm your personal Web3 guide powered by **ASI-1**.\n\nNo matter where you're starting from, we'll go step by step. There are no dumb questions here.\n\n🚀 **Ready to begin?** Let's start with blockchain — the foundation of everything in Web3. Want me to explain it?`;

  return `That's a great question${name}! 🤔 Web3 can feel overwhelming at first, but once you understand the 3 core concepts — blockchain, wallets, and keys — everything else clicks into place.\n\n💡 Try clicking any topic in the **Quick Learn** panel on the right, or follow the modules in the sidebar for a structured path.\n\nWhat would you like to explore?`;
}