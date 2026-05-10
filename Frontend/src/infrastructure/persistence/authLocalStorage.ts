/**
 * INFRASTRUCTURE LAYER - PERSISTENCE
 * Manejo de localStorage
 * Detalle de implementación - podría ser IndexedDB, sessionStorage, etc
 */

import type { AuthResponse, User } from "../../domain/types/auth.types";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const authLocalStorage = {
  saveToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  saveUser: (user: User | null | undefined): void => {
    if (user === undefined) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr || userStr === "undefined") {
      localStorage.removeItem(USER_KEY);
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch (e) {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  saveAuthResponse: (response: AuthResponse): void => {
    authLocalStorage.saveToken(response.access_token);
    authLocalStorage.saveUser(response.user);
  },
};
