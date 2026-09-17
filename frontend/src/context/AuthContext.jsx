import { createContext, useContext, useMemo, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);
const USER_KEY = 'vectra_user';
const TOKEN_KEY = 'vectra_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });

  const signIn = async (credentials, remember) => {
    const response = await authService.login(credentials);
    const profile = { fullName: response.fullName, role: response.role, email: credentials.email };
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    if (remember) localStorage.setItem('vectra_email', credentials.email);
    else localStorage.removeItem('vectra_email');
    setUser(profile);
    return profile;
  };

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({
    user, signIn, signOut, isAuthenticated: Boolean(user && localStorage.getItem(TOKEN_KEY)),
  }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
