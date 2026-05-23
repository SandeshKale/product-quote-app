import { useState, useCallback } from 'react';

const SESSION_KEY = 'pq_authed';

function readSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function useAuth() {
  const [isAuthed, setIsAuthed] = useState(() => readSession());
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (username, password) => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        setIsAuthed(true);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /**/
    }
    setIsAuthed(false);
    setError('');
  }, []);

  return { isAuthed, login, logout, error, isLoading };
}
