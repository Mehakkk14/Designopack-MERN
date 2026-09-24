// JWT & LocalStorage based Authentication Service
// Drop-in compatible with previous auth flow, communicating with Express backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'designopack_jwt_token';
const USER_KEY = 'designopack_admin_user';

import type { AdminUser } from '@/types';
export type { AdminUser };

type AuthCallback = (user: AdminUser | null) => void;
const authListeners: Set<AuthCallback> = new Set();

const notifyListeners = (user: AdminUser | null) => {
  authListeners.forEach((callback) => {
    try {
      callback(user);
    } catch (err) {
      console.error('Error in auth listener:', err);
    }
  });
};

const getStoredUser = (): AdminUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const auth = {
  get currentUser(): AdminUser | null {
    const token = getAuthToken();
    if (!token) return null;
    return getStoredUser();
  },
};

export const onAuthStateChanged = (
  _authInstance: typeof auth,
  callback: AuthCallback
): (() => void) => {
  authListeners.add(callback);

  // Immediately report current stored status
  const currentUser = auth.currentUser;
  callback(currentUser);

  // Optional background verification if token exists
  const token = getAuthToken();
  if (token) {
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          // Token expired or invalid
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          notifyListeners(null);
        } else if (data.user) {
          const verifiedUser: AdminUser = {
            uid: data.user.id,
            email: data.user.email,
            displayName: data.user.name,
            role: data.user.role,
          };
          localStorage.setItem(USER_KEY, JSON.stringify(verifiedUser));
          notifyListeners(verifiedUser);
        }
      })
      .catch((err) => {
        console.warn('Auth verification network error:', err.message);
      });
  }

  return () => {
    authListeners.delete(callback);
  };
};

export const signInWithEmailAndPassword = async (
  _authInstance: typeof auth,
  email: string,
  password: string
): Promise<{ user: AdminUser; token: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const error = new Error(data.error || 'Invalid email or password');
    (error as any).code = 'auth/wrong-password';
    throw error;
  }

  const user: AdminUser = {
    uid: data.user.id,
    email: data.user.email,
    displayName: data.user.name,
    role: data.user.role,
  };

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyListeners(user);

  return { user, token: data.token };
};

export const signOut = async (_authInstance: typeof auth): Promise<void> => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyListeners(null);
};

export const sendPasswordResetEmail = async (
  _authInstance: typeof auth,
  email: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const error = new Error(data.error || 'Failed to send password reset');
    (error as any).code = 'auth/user-not-found';
    throw error;
  }
};
