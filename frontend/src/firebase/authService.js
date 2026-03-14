import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc,
  collection, getDocs, query, orderBy,
  deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function signUp(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', cred.user.uid), {
    email,
    createdAt: new Date().toISOString(),
    onboardingDone: false,
  });
  return cred.user;
}

export async function logIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logOut() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getAuthError(code) {
  const map = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

// ── User Profile ──────────────────────────────────────────────────────────────
export async function saveUserProfile(uid, profile) {
  await setDoc(doc(db, 'users', uid), { ...profile, onboardingDone: true }, { merge: true });
}

export async function loadUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// ── Chat Sessions ─────────────────────────────────────────────────────────────
// Firestore path: users/{uid}/chats/{sessionId}
// Each document stores: { title, messages: [...], updatedAt }

/**
 * Sanitize messages before saving to Firestore.
 * Removes unstable/non-serializable fields and trims large data.
 */
function sanitizeMessages(messages) {
  return messages.map(m => ({
    id: m.id ?? Date.now(),
    role: m.role,
    content: m.content,
    timestamp: m.timestamp || '',
    // quickReplies: intentionally dropped — re-generated dynamically on load
  }));
}

/**
 * Derive a human-readable title from the first user message in the session.
 */
function deriveTitle(messages) {
  const firstUser = messages.find(m => m.role === 'user');
  if (firstUser) return firstUser.content.slice(0, 50);
  const firstMsg = messages[0];
  return firstMsg ? firstMsg.content.slice(0, 50) : 'New Chat';
}

/**
 * Save a chat session to Firestore.
 * Only writes if there is at least one non-welcome message.
 */
export const saveChatSession = async (uid, sessionId, messages) => {
  if (!uid || !sessionId) return;
  // Don't save sessions that only have the welcome message
  const hasUserMessage = messages.some(m => m.role === 'user');
  if (!hasUserMessage) return;

  try {
    const clean = sanitizeMessages(messages);
    await setDoc(doc(db, 'users', uid, 'chats', sessionId), {
      title: deriveTitle(messages),
      messages: clean,
      updatedAt: serverTimestamp(),
    }, { merge: false }); // full overwrite to keep data clean
  } catch (err) {
    console.error('saveChatSession error:', err);
    throw err;
  }
};

/**
 * List all chat sessions for a user, sorted by most recently updated.
 * Returns the full session objects including messages.
 */
export const listChatSessions = async (uid) => {
  if (!uid) return [];
  try {
    const q = query(
      collection(db, 'users', uid, 'chats'),
      orderBy('updatedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    // Fallback: if the index isn't ready yet, sort in JS
    console.warn('listChatSessions orderBy failed, falling back to JS sort:', err.message);
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'chats'));
      const chats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const getTime = (t) => {
        if (!t) return 0;
        if (t.seconds) return t.seconds;
        if (t.toDate) return Math.floor(t.toDate().getTime() / 1000);
        return Math.floor(new Date(t).getTime() / 1000) || 0;
      };
      return chats.sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt));
    } catch (fallbackErr) {
      console.error('listChatSessions fallback error:', fallbackErr);
      return [];
    }
  }
};

/**
 * Delete a specific chat session from Firestore.
 */
export const deleteChatSession = async (uid, sessionId) => {
  if (!uid || !sessionId) return;
  try {
    await deleteDoc(doc(db, 'users', uid, 'chats', sessionId));
  } catch (err) {
    console.error('deleteChatSession error:', err);
  }
};

/**
 * Load a single chat session by ID from Firestore.
 * Used when a session is not in the local cache.
 */
export const loadChatSession = async (uid, sessionId) => {
  if (!uid || !sessionId) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'chats', sessionId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error('loadChatSession error:', err);
    return null;
  }
};

// ── Legacy helpers (kept for backward compatibility) ──────────────────────────
// These map the old "main" session to the new sessions system.
export const saveChatHistory = (uid, messages) => saveChatSession(uid, 'main', messages);
export const loadChatHistory = async (uid) => {
  const session = await loadChatSession(uid, 'main');
  return session ? session.messages : null;
};