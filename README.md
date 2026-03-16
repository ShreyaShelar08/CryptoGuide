<div align="center">

# ⬡ CryptoGuide

### Your Personal Web3 Onboarding Agent — Powered by ASI-1

**Learn Web3 your way. Guided by AI, practiced risk-free.**

[![ASI-1](https://img.shields.io/badge/ASI--1-Powered-6366f1?style=flat-square)](https://asi1.ai)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=flat-square&logo=flask)](https://flask.palletsprojects.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)

[🚀 Live Demo](https://crypto-guide-six.vercel.app)

</div>

---

## What is CryptoGuide?

CryptoGuide is an AI-powered Web3 onboarding platform that helps complete beginners learn blockchain, crypto, DeFi and NFTs through a personalized AI agent, a custom learning roadmap, and a risk-free portfolio simulator powered by **ASI-1** by Fetch.ai.

---

## Features

- 🤖 **ASI-1 Chat Agent** — Personalized Web3 guide that adapts to your goal and experience level
- 🗺️ **AI Roadmap Generator** — ASI-1 builds a custom 6-step learning path based on your goal
- 📊 **Portfolio Simulator** — Practice with $10,000 virtual cash at real market prices, zero risk
- 💬 **Chat History** — All conversations saved to Firestore and restored on every login
- 🔐 **Firebase Auth** — Email and password login with persistent sessions

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI | ASI-1 Mini by Fetch.ai |
| Frontend | React 18 (Create React App) |
| Backend | Python + Flask |
| Auth + Database | Firebase Authentication + Firestore |
| Frontend Deploy | Vercel |
| Backend Deploy | Railway |

---

## Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/ShreyaShelar08/CryptoGuide.git
cd CryptoGuide
```

### 2. Set up Firebase
1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password
3. Enable **Firestore** → Start in test mode
4. Copy your config into `frontend/src/firebase/config.js`

### 3. Set up backend
```bash
cd backend
python -m venv venv
source venv/bin/activate    # Mac/Linux
venv\Scripts\activate       # Windows
pip install -r requirements.txt
cp .env.example .env
# Add your ASI1_API_KEY in .env
python app.py
```

### 4. Set up frontend
```bash
cd frontend
npm install
npm start
```

Open **http://localhost:3000** ✅

---

## Environment Variables

### `backend/.env`
```
ASI1_API_KEY=your_asi1_api_key
FLASK_ENV=development
PORT=5000
```

### `frontend/.env`
```
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_BACKEND_URL=https://your-railway-url.up.railway.app
```
---

## Future Improvements

- 🔴 **Live crypto prices** — connect to real-time price API for the portfolio simulator
- 🌐 **Multi-language support** — explain Web3 concepts in regional languages
- 🏆 **XP and badges** — gamification system to reward learning progress
- 📱 **Mobile app** — React Native version for Android and iOS
- 🤝 **Community features** — share your roadmap and portfolio with other learners
