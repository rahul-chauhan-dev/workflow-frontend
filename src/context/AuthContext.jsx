import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/authApi";
import { setUnauthorizedHandler } from "../api/http";
import { clearToken, getToken, setToken } from "../auth/tokenStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "loading" only if a stored token still has to be checked with the server
  const [status, setStatus] = useState(() => (getToken() ? "loading" : "anonymous"));

  // Any 401 on an authenticated request means the session is over
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken();
      setUser(null);
      setStatus("anonymous");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  // On startup, ask the server who the stored token belongs to
  useEffect(() => {
    if (!getToken()) return;
    let ignore = false;

    authApi
      .fetchMe()
      .then((me) => {
        if (!ignore) {
          setUser(me);
          setStatus("authenticated");
        }
      })
      .catch(() => {
        if (!ignore) {
          setUser(null);
          setStatus("anonymous");
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await authApi.login(email, password);
    setToken(result.token);
    setUser(result.user);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (data) => {
    const result = await authApi.register(data);
    setToken(result.token);
    setUser(result.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}