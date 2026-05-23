import { useState, useCallback } from 'react';

const SESSION_KEY = 'pq_session_token';

function readSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function writeSession(token) {
  try {
    sessionStorage.setItem(SESSION_KEY, token);
  } catch {
    /**/
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /**/
  }
}

/**
 * Manages auth state for the app.
 *
 * - isAuthed: true if a session token exists in sessionStorage
 * - login(passphrase): calls POST /api/auth, stores token on success
 * - logout(): clears token, returns to login screen
 * - error: last login error message
 * - isLoading: true while /api/auth request is in flight
 */
export function useAuth() {
  const [token, setToken] = useState(() => readSession());
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (passphrase) => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase }),
      });
      const data = await res.json();
      if (data.ok && data.token) {
        writeSession(data.token);
        setToken(data.token);
      } else {
        setError(data.error || 'Invalid passphrase');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setError('');
  }, []);

  return {
    isAuthed: Boolean(token),
    login,
    logout,
    error,
    isLoading,
  };
}
