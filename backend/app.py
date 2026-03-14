import os
import time
import requests
from collections import defaultdict
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# ── Load env ──────────────────────────────────────────────────────────────────
load_dotenv()

app = Flask(__name__)
# Allow CORS for common development ports
CORS(app, origins=[
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
])

# ── Config ────────────────────────────────────────────────────────────────────
ASI1_API_KEY    = os.getenv("ASI1_API_KEY", "")
ASI1_ENDPOINT   = "https://api.asi1.ai/v1/chat/completions"
ASI1_MODEL      = "asi1-mini"
MAX_TOKENS      = 500
TEMPERATURE     = 0.75

# ── Rate Limiter ──────────────────────────────────────────────────────────────
# Allows max 20 requests per IP per minute
RATE_LIMIT      = 20
RATE_WINDOW     = 60  # seconds
_rate_store     = defaultdict(list)  # { ip: [timestamp, ...] }

def is_rate_limited(ip):
    now = time.time()
    window_start = now - RATE_WINDOW
    # Remove timestamps outside the window
    _rate_store[ip] = [t for t in _rate_store[ip] if t > window_start]
    if len(_rate_store[ip]) >= RATE_LIMIT:
        return True
    _rate_store[ip].append(now)
    return False

# ── System prompt builder ─────────────────────────────────────────────────────
def build_system_prompt(profile, portfolio=None):
    goal_map = {
        "investing": "crypto investing — buying, holding, and growing crypto assets safely",
        "nft":       "NFTs and digital art — ownership, collections, and the NFT market",
        "defi":      "DeFi and yield — decentralized finance, staking, and liquidity pools",
        "general":   "a full foundational understanding of Web3 and blockchain technology",
    }
    level_map = {
        "beginner":     "a complete beginner who needs simple analogies and zero jargon",
        "intermediate": "someone with some knowledge who wants to go deeper",
        "advanced":     "a fairly experienced user who wants to sharpen and fill gaps",
    }

    name  = profile.get("name") or "Explorer"
    goal  = goal_map.get(profile.get("goal"), "general Web3 learning")
    level = level_map.get(profile.get("level"), "a complete beginner")

    portfolio_info = ""
    if portfolio and isinstance(portfolio, dict):
        balance = portfolio.get("balance", 10000)
        try:
            balance = float(balance)
        except (TypeError, ValueError):
            balance = 10000.0
            
        holdings = portfolio.get("holdings") or {}
        if isinstance(holdings, dict):
            h_items = []
            for asset, qty in holdings.items():
                try:
                    if float(qty) > 0:
                        h_items.append(f"{qty} {asset}")
                except (TypeError, ValueError):
                    continue
            holdings_str = ", ".join(h_items) or "No holdings yet"
            portfolio_info = f"\nUser Portfolio Status:\n- Current Balance: ${balance:,.2f}\n- Holdings: {holdings_str}"

    return f"""You are CryptoGuide, an expert Web3 onboarding agent powered by ASI-1 by Fetch.ai.

User profile:
- Name: {name}
- Goal: {goal}
- Level: {level}{portfolio_info}

Your personality:
- Warm, encouraging, and patient — never condescending
- Use simple language and explain jargon when necessary
- Use emojis occasionally to stay engaging (not excessively)
- Keep answers concise — 3 to 5 sentences max unless asked for more
- Always end with a follow-up question, tip, or next step suggestion
- Personalize responses using the user's name occasionally

Key analogies to use:
- Blockchain → a Google Sheet everyone can see but no one can secretly edit
- Wallet → email address + password for your crypto
- Gas fees → a tip to the post office for delivering a letter
- NFT → a digital certificate of ownership
- DeFi → a bank run by code, not people
- Seed phrase → master backup key (12 magic words)

Remember the user's goal ({goal}) and tailor every response toward it.
Always demonstrate multi-step agentic reasoning — plan, explain, then suggest next action.
{f'If the user mentions their portfolio, balance, or buying/selling, use their actual portfolio data provided above to give specific advice.' if portfolio_info else ''}"""

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "CryptoGuide API",
        "version": "1.0.0",
        "asi1_configured": bool(ASI1_API_KEY),
    })


@app.route("/api/chat", methods=["POST"])
def chat():
    # ── Rate limit check ──────────────────────────────────────────────────────
    ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    if is_rate_limited(ip):
        return jsonify({
            "error": "Rate limit exceeded. Please wait a moment before sending another message.",
            "retry_after": RATE_WINDOW,
        }), 429

    # ── Validate request ──────────────────────────────────────────────────────
    data = request.get_json(silent=True) or {}
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    messages = data.get("messages", [])
    profile  = data.get("profile")
    if not isinstance(profile, dict):
        profile = {}
        
    portfolio = data.get("portfolio")
    if not isinstance(portfolio, dict):
        portfolio = {}

    if not messages or not isinstance(messages, list):
        return jsonify({"error": "messages array is required"}), 400

    if not ASI1_API_KEY:
        return jsonify({"error": "ASI1_API_KEY not configured on server"}), 500

    # Only keep role + content, strip any injected fields
    clean_messages = []
    for m in messages:
        if isinstance(m, dict) and m.get("role") in ("user", "assistant") and m.get("content"):
            clean_messages.append({
                "role": m["role"], 
                "content": str(m["content"])[:2000]
            })

    # Limit conversation history to last 20 messages (saves tokens)
    if len(clean_messages) > 20:
        clean_messages = clean_messages[-20:]

    if not any(m["role"] == "user" for m in clean_messages):
        return jsonify({"error": "No valid user messages found in history"}), 400

    # ── Call ASI-1 ────────────────────────────────────────────────────────────
    try:
        response = requests.post(
            ASI1_ENDPOINT,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {ASI1_API_KEY}",
            },
            json={
                "model": ASI1_MODEL,
                "max_tokens": MAX_TOKENS,
                "temperature": TEMPERATURE,
                "messages": [
                    {"role": "system", "content": build_system_prompt(profile, portfolio)},
                    *clean_messages,
                ],
            },
            timeout=30,
        )
        response.raise_for_status()
        result = response.json()
        
        choices = result.get("choices", [])
        if not choices:
            return jsonify({"error": "No response generated from ASI-1"}), 502
            
        reply = choices[0].get("message", {}).get("content")
        if not reply:
            return jsonify({"error": "Empty response from ASI-1"}), 502

        return jsonify({
            "reply": reply,
            "model": ASI1_MODEL,
            "usage": result.get("usage", {}),
        })

    except requests.exceptions.Timeout:
        return jsonify({"error": "ASI-1 request timed out. Please try again."}), 504
    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code if e.response else 500
        return jsonify({"error": f"ASI-1 API error: {status_code}"}), 502
    except (KeyError, IndexError):
        return jsonify({"error": "Unexpected response from ASI-1 API"}), 502
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route("/api/profile", methods=["POST"])
def save_profile():
    """Save user profile — stored in memory for session (extend with DB later)"""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    required = ["name", "goal", "level"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    # Validate values
    valid_goals  = ["investing", "nft", "defi", "general"]
    valid_levels = ["beginner", "intermediate", "advanced"]

    if data["goal"] not in valid_goals:
        return jsonify({"error": f"Invalid goal. Must be one of: {valid_goals}"}), 400
    if data["level"] not in valid_levels:
        return jsonify({"error": f"Invalid level. Must be one of: {valid_levels}"}), 400

    return jsonify({
        "success": True,
        "profile": {
            "name":  str(data.get("name", "Explorer"))[:50],   # cap name length
            "goal":  data.get("goal"),
            "level": data.get("level"),
        },
        "message": f"Profile saved for {data['name']}!",
    })


@app.route("/api/rate-status", methods=["GET"])
def rate_status():
    """Check how many requests remain for this IP"""
    ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    now = time.time()
    window_start = now - RATE_WINDOW
    recent = [t for t in _rate_store.get(ip, []) if t > window_start]
    remaining = max(0, RATE_LIMIT - len(recent))

    return jsonify({
        "ip": ip,
        "requests_made": len(recent),
        "requests_remaining": remaining,
        "limit": RATE_LIMIT,
        "window_seconds": RATE_WINDOW,
    })


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") == "development"
    print(f"\n🚀 CryptoGuide API running on http://localhost:{port}")
    print(f"   ASI-1 Key: {'✅ configured' if ASI1_API_KEY else '❌ missing — set ASI1_API_KEY in .env'}")
    print(f"   Mode: {'development' if debug else 'production'}\n")
    app.run(host="0.0.0.0", port=port, debug=debug)