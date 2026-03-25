import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens, User, LoginCredentials, RegisterData, AuthResponse } from '../types/auth';

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@kovariya_access_token',
  REFRESH_TOKEN: '@kovariya_refresh_token',
  USER_DATA: '@kovariya_user_data',
  TOKEN_EXPIRES_AT: '@kovariya_token_expires_at',
} as const;

/** Set `EXPO_PUBLIC_AUTH_API_URL` (e.g. https://api.example.com) to use real email/password login. */
function getAuthApiBase(): string {
  const raw =
    (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process
      ?.env?.EXPO_PUBLIC_AUTH_API_URL ?? '';
  return String(raw).trim().replace(/\/$/, '');
}

type LoginApiJson = {
  user?: {
    id?: string;
    email?: string;
    name?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  };
  message?: string;
  error?: string;
};

function parseErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const d = data as LoginApiJson;
    if (typeof d.message === 'string' && d.message.trim()) {
      return d.message.trim();
    }
    if (typeof d.error === 'string' && d.error.trim()) {
      return d.error.trim();
    }
  }
  if (status === 401 || status === 403) {
    return 'Invalid email or password';
  }
  if (status === 422) {
    return 'Check your email and password format';
  }
  if (status >= 500) {
    return 'Server is unavailable. Try again shortly';
  }
  return 'Could not sign you in. Please try again';
}

async function loginViaHttp(credentials: LoginCredentials): Promise<AuthResponse> {
  const base = getAuthApiBase();
  const url = `${base}/auth/login`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as LoginApiJson;

  if (!res.ok) {
    throw new Error(parseErrorMessage(data, res.status));
  }

  const u = data.user;
  const t = data.tokens;
  if (!u?.email || !t?.accessToken || !t?.refreshToken || t.expiresAt == null) {
    throw new Error('Unexpected response from server');
  }

  const user: User = {
    id: u.id ?? '1',
    email: u.email,
    name: u.name ?? u.email.split('@')[0] ?? 'Parent',
    createdAt: u.createdAt ?? new Date().toISOString(),
    updatedAt: u.updatedAt ?? new Date().toISOString(),
  };

  const tokens: AuthTokens = {
    accessToken: t.accessToken,
    refreshToken: t.refreshToken,
    expiresAt: typeof t.expiresAt === 'number' ? t.expiresAt : Date.now() + 3600_000,
  };

  return { user, tokens };
}

const mockApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await new Promise<void>((resolve) => setTimeout(resolve, 800));

    if (credentials.email === 'user@kovariya.com' && credentials.password === 'password') {
      const user: User = {
        id: '1',
        email: credentials.email.trim().toLowerCase(),
        name: 'Sarah',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const tokens: AuthTokens = {
        accessToken: `mock-access-${Date.now()}`,
        refreshToken: `mock-refresh-${Date.now()}`,
        expiresAt: Date.now() + 60 * 60 * 1000,
      };

      return { user, tokens };
    }

    throw new Error('Invalid email or password');
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    await new Promise<void>((resolve) => setTimeout(resolve, 800));

    const user: User = {
      id: String(Date.now()),
      email: data.email.trim().toLowerCase(),
      name: data.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const tokens: AuthTokens = {
      accessToken: `mock-access-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
      expiresAt: Date.now() + 60 * 60 * 1000,
    };

    return { user, tokens };
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    await new Promise<void>((resolve) => setTimeout(resolve, 400));

    if (refreshToken.startsWith('mock-refresh')) {
      return {
        accessToken: `mock-access-${Date.now()}`,
        refreshToken: `mock-refresh-${Date.now()}`,
        expiresAt: Date.now() + 60 * 60 * 1000,
      };
    }

    throw new Error('Session expired. Please sign in again');
  },

  async validateToken(token: string): Promise<boolean> {
    await new Promise<void>((resolve) => setTimeout(resolve, 80));
    return token.startsWith('mock-access');
  },
};

class AuthService {
  private static instance: AuthService;
  private tokenRefreshTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async storeTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
      AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, tokens.expiresAt.toString()),
    ]);
  }

  private async storeUser(user: User): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  private async getStoredTokens(): Promise<AuthTokens | null> {
    try {
      const [accessToken, refreshToken, expiresAt] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT),
      ]);

      if (!accessToken || !refreshToken || !expiresAt) {
        return null;
      }

      return {
        accessToken,
        refreshToken,
        expiresAt: parseInt(expiresAt, 10),
      };
    } catch {
      return null;
    }
  }

  private async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? (JSON.parse(userData) as User) : null;
    } catch {
      return null;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const base = getAuthApiBase();
    const response = base
      ? await loginViaHttp(credentials)
      : await mockApi.login(credentials);

    await Promise.all([this.storeTokens(response.tokens), this.storeUser(response.user)]);
    this.setupTokenRefresh(response.tokens.expiresAt);
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await mockApi.register(data);
    await Promise.all([this.storeTokens(response.tokens), this.storeUser(response.user)]);
    this.setupTokenRefresh(response.tokens.expiresAt);
    return response;
  }

  async logout(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT),
    ]);

    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  async getInitialAuthState(): Promise<{ user: User | null; tokens: AuthTokens | null }> {
    try {
      const [user, tokens] = await Promise.all([this.getStoredUser(), this.getStoredTokens()]);

      if (getAuthApiBase()) {
        if (user && tokens && tokens.expiresAt > Date.now()) {
          this.setupTokenRefresh(tokens.expiresAt);
          return { user, tokens };
        }
        if (tokens && tokens.expiresAt <= Date.now()) {
          await this.logout();
          return { user: null, tokens: null };
        }
        return { user, tokens: null };
      }

      if (tokens && tokens.expiresAt > Date.now()) {
        try {
          const isValid = await mockApi.validateToken(tokens.accessToken);
          if (!isValid) {
            await this.refreshTokens();
            return this.getInitialAuthState();
          }
        } catch {
          await this.logout();
          return { user: null, tokens: null };
        }
      } else if (tokens) {
        try {
          await this.refreshTokens();
          return this.getInitialAuthState();
        } catch {
          await this.logout();
          return { user: null, tokens: null };
        }
      }

      return { user, tokens: tokens && tokens.expiresAt > Date.now() ? tokens : null };
    } catch {
      return { user: null, tokens: null };
    }
  }

  private async refreshTokens(): Promise<void> {
    const tokens = await this.getStoredTokens();
    if (!tokens) {
      throw new Error('No refresh token');
    }
    const newTokens = await mockApi.refreshToken(tokens.refreshToken);
    await this.storeTokens(newTokens);
    this.setupTokenRefresh(newTokens.expiresAt);
  }

  private setupTokenRefresh(expiresAt: number): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }
    const refreshTime = expiresAt - Date.now() - 5 * 60 * 1000;
    if (refreshTime > 0) {
      this.tokenRefreshTimer = setTimeout(async () => {
        try {
          await this.refreshTokens();
        } catch {
          await this.logout();
        }
      }, refreshTime);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return this.getStoredUser();
  }

  async getAccessToken(): Promise<string | null> {
    const tokens = await this.getStoredTokens();
    return tokens?.accessToken ?? null;
  }

  async isAuthenticated(): Promise<boolean> {
    const tokens = await this.getStoredTokens();
    return !!tokens && tokens.expiresAt > Date.now();
  }
}

export const authService = AuthService.getInstance();
