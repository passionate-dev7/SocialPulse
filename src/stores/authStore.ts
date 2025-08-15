import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  tradingLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
  createdAt: string;
  followersCount: number;
  followingCount: number;
}

export interface WalletConnection {
  address: string;
  chainId: number;
  balance: string;
  connected: boolean;
  provider: string;
}

export interface AuthState {
  // State
  user: User | null;
  wallet: WalletConnection | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionToken: string | null;
  refreshToken: string | null;
  
  // Actions
  login: (credentials: { email: string; password: string }) => Promise<void>;
  loginWithWallet: (walletData: Omit<WalletConnection, 'connected'>) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  connectWallet: (walletData: Omit<WalletConnection, 'connected'>) => void;
  disconnectWallet: () => void;
  clearError: () => void;
}

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        wallet: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        sessionToken: null,
        refreshToken: null,

        // Actions
        login: async (credentials) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Simulate API call
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(credentials),
            });

            if (!response.ok) {
              throw new Error('Invalid credentials');
            }

            const data = await response.json();

            set((state) => {
              state.user = data.user;
              state.sessionToken = data.sessionToken;
              state.refreshToken = data.refreshToken;
              state.isAuthenticated = true;
              state.isLoading = false;
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Login failed';
            });
          }
        },

        loginWithWallet: async (walletData) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Simulate wallet authentication
            const response = await fetch('/api/auth/wallet', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(walletData),
            });

            if (!response.ok) {
              throw new Error('Wallet authentication failed');
            }

            const data = await response.json();

            set((state) => {
              state.user = data.user;
              state.wallet = { ...walletData, connected: true };
              state.sessionToken = data.sessionToken;
              state.refreshToken = data.refreshToken;
              state.isAuthenticated = true;
              state.isLoading = false;
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Wallet login failed';
            });
          }
        },

        logout: () => {
          set((state) => {
            state.user = null;
            state.wallet = null;
            state.isAuthenticated = false;
            state.sessionToken = null;
            state.refreshToken = null;
            state.error = null;
          });
        },

        refreshSession: async () => {
          const { refreshToken } = get();
          if (!refreshToken) return;

          try {
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
              throw new Error('Session refresh failed');
            }

            const data = await response.json();

            set((state) => {
              state.sessionToken = data.sessionToken;
              state.user = data.user;
            });
          } catch (error) {
            // If refresh fails, logout user
            get().logout();
          }
        },

        updateProfile: async (updates) => {
          const { user, sessionToken } = get();
          if (!user || !sessionToken) return;

          // Optimistic update
          set((state) => {
            if (state.user) {
              Object.assign(state.user, updates);
            }
          });

          try {
            const response = await fetch('/api/user/profile', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
              },
              body: JSON.stringify(updates),
            });

            if (!response.ok) {
              throw new Error('Profile update failed');
            }

            const updatedUser = await response.json();

            set((state) => {
              state.user = updatedUser;
            });
          } catch (error) {
            // Revert optimistic update on failure
            set((state) => {
              if (state.user) {
                Object.keys(updates).forEach((key) => {
                  if (user[key as keyof User] !== undefined) {
                    (state.user as any)[key] = user[key as keyof User];
                  }
                });
              }
              state.error = error instanceof Error ? error.message : 'Profile update failed';
            });
          }
        },

        connectWallet: (walletData) => {
          set((state) => {
            state.wallet = { ...walletData, connected: true };
          });
        },

        disconnectWallet: () => {
          set((state) => {
            state.wallet = null;
          });
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },
      })),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          wallet: state.wallet,
          isAuthenticated: state.isAuthenticated,
          sessionToken: state.sessionToken,
          refreshToken: state.refreshToken,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);

export default useAuthStore;