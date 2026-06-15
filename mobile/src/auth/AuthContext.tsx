import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { tokenStorage, type StoredUser } from "./tokenStorage";
import { nestApi } from "../api/nestApi";

interface MyProfile {
  firstName: string;
  firstLastName: string;
  cellphone: string;
  address: string;
  gender: string;
  avatarUrl: string | null;
}

interface AuthState {
  user: StoredUser | null;
  token: string | null;
  profile: MyProfile | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const decodeJwt = (token: string): any => {
  try {
    const payload = token.split(".")[1];
    const padded = payload + "===".slice((payload.length + 3) % 4);
    const decoded = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch { return null; }
};

const ROLE_MAP: Record<number, string> = {
  1: "Administrador",
  2: "Usuario",
  3: "Domiciliario",
  4: "Negocio",
  5: "SuperAdmin",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({ user: null, token: null, profile: null, loading: true });

  useEffect(() => {
    (async () => {
      const [token, user] = await Promise.all([tokenStorage.getToken(), tokenStorage.getUser()]);
      setState({ token, user, profile: null, loading: false });
    })();
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await nestApi.get("/people/me");
      setState((prev) => ({ ...prev, profile: res.data }));
    } catch { /* silent */ }
  }, []);

  useEffect(() => { if (state.token) refreshProfile(); }, [state.token, refreshProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await nestApi.post("/auth/login", { user_email: email, user_password: password });
    const token: string = res.data.access_token;
    if (!token) throw new Error("Sin token");
    const payload = decodeJwt(token);
    const user: StoredUser = {
      id: payload?.user_id ?? 0,
      email: payload?.user_email ?? email,
      role: ROLE_MAP[payload?.rolIds?.[0] ?? 2] ?? "Usuario",
    };
    await tokenStorage.save(token, user);
    setState({ token, user, profile: null, loading: false });
  }, []);

  const register = useCallback(async (data: any) => {
    const res = await nestApi.post("/auth/register", data);
    const token: string = res.data.token || res.data.access_token || "";
    if (token) {
      const payload = decodeJwt(token);
      const user: StoredUser = {
        id: payload?.user_id ?? 0,
        email: data.user_email,
        role: ROLE_MAP[payload?.rolIds?.[0] ?? 2] ?? "Usuario",
      };
      await tokenStorage.save(token, user);
      setState({ token, user, profile: null, loading: false });
    }
  }, []);

  const logout = useCallback(async () => {
    await tokenStorage.clear();
    setState({ token: null, user: null, profile: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
