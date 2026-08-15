import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { AuthUser, LoginRequest, LoginResponse, RegisterRequest } from '../types/auth';
import { authService } from '../services/authService';

// ============================================================
// AuthContext — Uygulamanın kimlik doğrulama yöneticisi.
//
// - Access token (15 dk) + refresh token (7 gün) rotation
// - Token süresi dolunca otomatik yenileme
// - Mobilde expo-secure-store, web'de localStorage
// ============================================================

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    const SecureStore = await import('expo-secure-store');
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    const SecureStore = await import('expo-secure-store');
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    const SecureStore = await import('expo-secure-store');
    await SecureStore.deleteItemAsync(key);
  },
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await storage.getItem(TOKEN_KEY);
      const storedRefreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
      const storedUser = await storage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        try {
          const freshUser = await authService.getMe(storedToken);
          setToken(storedToken);
          setUser(freshUser);
        } catch (err: any) {
          // Access token süresi dolmuş — refresh dene
          if (err?.status === 401 && storedRefreshToken) {
            try {
              const response = await authService.refresh(storedRefreshToken);
              setToken(response.token);
              setUser(response.user);
              await saveTokens(response.token, response.refreshToken, response.user);
            } catch {
              await clearStoredAuth();
            }
          } else {
            await clearStoredAuth();
          }
        }
      }
    } catch {
      // Storage hatası
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Access token'ı refresh token ile yeniler.
   * Eşzamanlı çağrıları birleştirir (race condition koruması).
   */
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    // Zaten bir refresh çalışıyorsa aynı promise'i döndür
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const doRefresh = async (): Promise<string | null> => {
      try {
        const storedRefreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
        if (!storedRefreshToken) {
          await handleLogout();
          return null;
        }

        const response = await authService.refresh(storedRefreshToken);
        setToken(response.token);
        setUser(response.user);
        await saveTokens(response.token, response.refreshToken, response.user);
        return response.token;
      } catch {
        await handleLogout();
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    };

    refreshPromiseRef.current = doRefresh();
    return refreshPromiseRef.current;
  }, []);

  async function login(request: LoginRequest): Promise<void> {
    const response: LoginResponse = await authService.login(request);
    setToken(response.token);
    setUser(response.user);
    await saveTokens(response.token, response.refreshToken, response.user);
  }

  async function register(request: RegisterRequest): Promise<void> {
    const response: LoginResponse = await authService.register(request);
    setToken(response.token);
    setUser(response.user);
    await saveTokens(response.token, response.refreshToken, response.user);
  }

  async function logout(): Promise<void> {
    try {
      const storedToken = await storage.getItem(TOKEN_KEY);
      if (storedToken) {
        await authService.logout(storedToken);
      }
    } catch {
      // Backend'e ulaşılamasa bile local'i temizle
    }
    await handleLogout();
  }

  async function handleLogout() {
    setToken(null);
    setUser(null);
    await clearStoredAuth();
  }

  async function saveTokens(accessToken: string, refreshToken: string, userData: AuthUser) {
    await storage.setItem(TOKEN_KEY, accessToken);
    await storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    await storage.setItem(USER_KEY, JSON.stringify(userData));
  }

  async function clearStoredAuth() {
    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(REFRESH_TOKEN_KEY);
    await storage.removeItem(USER_KEY);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth, AuthProvider içinde kullanılmalıdır');
  }
  return context;
}
