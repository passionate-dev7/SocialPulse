import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface RiskManagementSettings {
  maxPositionSize: number; // Percentage of portfolio
  maxLeverage: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  maxDailyLoss: number; // Percentage of portfolio
  maxDrawdown: number; // Percentage of portfolio
  riskPerTrade: number; // Percentage of portfolio
  autoStopLoss: boolean;
  autoTakeProfit: boolean;
  emergencyStop: boolean;
  emergencyStopTrigger: number; // Percentage loss
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    tradeAlerts: boolean;
    priceAlerts: boolean;
    socialActivity: boolean;
    systemUpdates: boolean;
    marketNews: boolean;
  };
  push: {
    enabled: boolean;
    tradeAlerts: boolean;
    priceAlerts: boolean;
    socialActivity: boolean;
    systemUpdates: boolean;
    marketNews: boolean;
  };
  sms: {
    enabled: boolean;
    emergencyOnly: boolean;
    phoneNumber?: string;
  };
  discord: {
    enabled: boolean;
    webhookUrl?: string;
    tradeAlerts: boolean;
    priceAlerts: boolean;
  };
  telegram: {
    enabled: boolean;
    chatId?: string;
    botToken?: string;
    tradeAlerts: boolean;
    priceAlerts: boolean;
  };
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'BTC' | 'ETH';
  numberFormat: 'decimal' | 'scientific' | 'percentage';
  chartStyle: 'candlestick' | 'line' | 'area' | 'heikin_ashi';
  priceDisplayFormat: 'full' | 'abbreviated' | 'scientific';
  showPnlInCurrency: boolean;
  showPnlInPercentage: boolean;
  compactMode: boolean;
  animationsEnabled: boolean;
  soundsEnabled: boolean;
}

export interface ApiConfiguration {
  hyperliquid: {
    enabled: boolean;
    apiKey?: string;
    secretKey?: string;
    testnet: boolean;
  };
  binance: {
    enabled: boolean;
    apiKey?: string;
    secretKey?: string;
    testnet: boolean;
  };
  coinbase: {
    enabled: boolean;
    apiKey?: string;
    secretKey?: string;
    passphrase?: string;
    sandbox: boolean;
  };
  ftx: {
    enabled: boolean;
    apiKey?: string;
    secretKey?: string;
    subaccount?: string;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'followers' | 'private';
  showTradingStats: boolean;
  showPortfolioValue: boolean;
  allowCopyTrading: boolean;
  shareTradesAutomatically: boolean;
  allowDirectMessages: boolean;
  showOnlineStatus: boolean;
}

export interface AdvancedSettings {
  enableBetaFeatures: boolean;
  enableDebugMode: boolean;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  dataRetentionPeriod: number; // days
  performanceMode: boolean;
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
}

export interface SettingsState {
  // Settings
  riskManagement: RiskManagementSettings;
  notifications: NotificationSettings;
  display: DisplaySettings;
  apiConfiguration: ApiConfiguration;
  privacy: PrivacySettings;
  advanced: AdvancedSettings;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastSaved: string | null;
  isDirty: boolean;
  
  // Actions
  updateRiskManagement: (updates: Partial<RiskManagementSettings>) => void;
  updateNotifications: (updates: Partial<NotificationSettings>) => void;
  updateDisplay: (updates: Partial<DisplaySettings>) => void;
  updateApiConfiguration: (updates: Partial<ApiConfiguration>) => Promise<void>;
  updatePrivacy: (updates: Partial<PrivacySettings>) => Promise<void>;
  updateAdvanced: (updates: Partial<AdvancedSettings>) => void;
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  resetToDefaults: (section?: keyof Pick<SettingsState, 'riskManagement' | 'notifications' | 'display' | 'privacy' | 'advanced'>) => void;
  testApiConnection: (exchange: keyof ApiConfiguration) => Promise<boolean>;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => Promise<void>;
  clearError: () => void;
}

const defaultRiskManagement: RiskManagementSettings = {
  maxPositionSize: 10, // 10% of portfolio
  maxLeverage: 5,
  stopLossPercentage: 5,
  takeProfitPercentage: 15,
  maxDailyLoss: 5,
  maxDrawdown: 20,
  riskPerTrade: 2,
  autoStopLoss: false,
  autoTakeProfit: false,
  emergencyStop: true,
  emergencyStopTrigger: 15,
};

const defaultNotifications: NotificationSettings = {
  email: {
    enabled: true,
    tradeAlerts: true,
    priceAlerts: true,
    socialActivity: false,
    systemUpdates: true,
    marketNews: false,
  },
  push: {
    enabled: true,
    tradeAlerts: true,
    priceAlerts: true,
    socialActivity: true,
    systemUpdates: true,
    marketNews: false,
  },
  sms: {
    enabled: false,
    emergencyOnly: true,
  },
  discord: {
    enabled: false,
    tradeAlerts: false,
    priceAlerts: false,
  },
  telegram: {
    enabled: false,
    tradeAlerts: false,
    priceAlerts: false,
  },
};

const defaultDisplay: DisplaySettings = {
  theme: 'auto',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  currency: 'USD',
  numberFormat: 'decimal',
  chartStyle: 'candlestick',
  priceDisplayFormat: 'full',
  showPnlInCurrency: true,
  showPnlInPercentage: true,
  compactMode: false,
  animationsEnabled: true,
  soundsEnabled: true,
};

const defaultApiConfiguration: ApiConfiguration = {
  hyperliquid: {
    enabled: false,
    testnet: true,
  },
  binance: {
    enabled: false,
    testnet: true,
  },
  coinbase: {
    enabled: false,
    sandbox: true,
  },
  ftx: {
    enabled: false,
  },
};

const defaultPrivacy: PrivacySettings = {
  profileVisibility: 'public',
  showTradingStats: true,
  showPortfolioValue: false,
  allowCopyTrading: true,
  shareTradesAutomatically: false,
  allowDirectMessages: true,
  showOnlineStatus: true,
};

const defaultAdvanced: AdvancedSettings = {
  enableBetaFeatures: false,
  enableDebugMode: false,
  autoBackup: true,
  backupFrequency: 'weekly',
  dataRetentionPeriod: 90,
  performanceMode: false,
  enableAnalytics: true,
  enableCrashReporting: true,
};

const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        riskManagement: defaultRiskManagement,
        notifications: defaultNotifications,
        display: defaultDisplay,
        apiConfiguration: defaultApiConfiguration,
        privacy: defaultPrivacy,
        advanced: defaultAdvanced,
        isLoading: false,
        error: null,
        lastSaved: null,
        isDirty: false,

        // Actions
        updateRiskManagement: (updates) => {
          set((state) => {
            Object.assign(state.riskManagement, updates);
            state.isDirty = true;
          });
        },

        updateNotifications: (updates) => {
          set((state) => {
            Object.assign(state.notifications, updates);
            state.isDirty = true;
          });
        },

        updateDisplay: (updates) => {
          set((state) => {
            Object.assign(state.display, updates);
            state.isDirty = true;
          });
          
          // Apply theme change immediately
          if (updates.theme) {
            if (updates.theme === 'auto') {
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            } else {
              document.documentElement.setAttribute('data-theme', updates.theme);
            }
          }
        },

        updateApiConfiguration: async (updates) => {
          set((state) => {
            Object.assign(state.apiConfiguration, updates);
            state.isDirty = true;
          });

          // Auto-save API configuration for security
          await get().saveSettings();
        },

        updatePrivacy: async (updates) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
            Object.assign(state.privacy, updates);
          });

          try {
            const response = await fetch('/api/user/privacy', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
              },
              body: JSON.stringify(updates),
            });

            if (!response.ok) {
              throw new Error('Failed to update privacy settings');
            }

            set((state) => {
              state.isLoading = false;
              state.lastSaved = new Date().toISOString();
            });
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to update privacy settings';
            });
          }
        },

        updateAdvanced: (updates) => {
          set((state) => {
            Object.assign(state.advanced, updates);
            state.isDirty = true;
          });
        },

        saveSettings: async () => {
          const { riskManagement, notifications, display, privacy, advanced } = get();

          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const response = await fetch('/api/user/settings', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
              },
              body: JSON.stringify({
                riskManagement,
                notifications,
                display,
                privacy,
                advanced,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to save settings');
            }

            set((state) => {
              state.isLoading = false;
              state.isDirty = false;
              state.lastSaved = new Date().toISOString();
            });
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to save settings';
            });
          }
        },

        loadSettings: async () => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const response = await fetch('/api/user/settings', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to load settings');
            }

            const settings = await response.json();

            set((state) => {
              if (settings.riskManagement) {
                state.riskManagement = { ...defaultRiskManagement, ...settings.riskManagement };
              }
              if (settings.notifications) {
                state.notifications = { ...defaultNotifications, ...settings.notifications };
              }
              if (settings.display) {
                state.display = { ...defaultDisplay, ...settings.display };
              }
              if (settings.privacy) {
                state.privacy = { ...defaultPrivacy, ...settings.privacy };
              }
              if (settings.advanced) {
                state.advanced = { ...defaultAdvanced, ...settings.advanced };
              }
              
              state.isLoading = false;
              state.isDirty = false;
            });

            // Apply theme
            const { theme } = get().display;
            if (theme === 'auto') {
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            } else {
              document.documentElement.setAttribute('data-theme', theme);
            }
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to load settings';
            });
          }
        },

        resetToDefaults: (section) => {
          set((state) => {
            if (!section) {
              // Reset all sections
              state.riskManagement = { ...defaultRiskManagement };
              state.notifications = { ...defaultNotifications };
              state.display = { ...defaultDisplay };
              state.privacy = { ...defaultPrivacy };
              state.advanced = { ...defaultAdvanced };
            } else {
              // Reset specific section
              switch (section) {
                case 'riskManagement':
                  state.riskManagement = { ...defaultRiskManagement };
                  break;
                case 'notifications':
                  state.notifications = { ...defaultNotifications };
                  break;
                case 'display':
                  state.display = { ...defaultDisplay };
                  break;
                case 'privacy':
                  state.privacy = { ...defaultPrivacy };
                  break;
                case 'advanced':
                  state.advanced = { ...defaultAdvanced };
                  break;
              }
            }
            state.isDirty = true;
          });
        },

        testApiConnection: async (exchange) => {
          const config = get().apiConfiguration[exchange];
          if (!config.enabled || !config.apiKey) {
            return false;
          }

          try {
            const response = await fetch(`/api/exchanges/${exchange}/test`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
              },
              body: JSON.stringify(config),
            });

            return response.ok;
          } catch (error) {
            return false;
          }
        },

        exportSettings: () => {
          const { riskManagement, notifications, display, privacy, advanced } = get();
          return JSON.stringify({
            riskManagement,
            notifications,
            display,
            privacy,
            advanced,
            exportedAt: new Date().toISOString(),
            version: '1.0',
          }, null, 2);
        },

        importSettings: async (settingsJson) => {
          try {
            const importedSettings = JSON.parse(settingsJson);
            
            // Validate structure
            if (!importedSettings.version) {
              throw new Error('Invalid settings file format');
            }

            set((state) => {
              if (importedSettings.riskManagement) {
                state.riskManagement = { ...defaultRiskManagement, ...importedSettings.riskManagement };
              }
              if (importedSettings.notifications) {
                state.notifications = { ...defaultNotifications, ...importedSettings.notifications };
              }
              if (importedSettings.display) {
                state.display = { ...defaultDisplay, ...importedSettings.display };
              }
              if (importedSettings.privacy) {
                state.privacy = { ...defaultPrivacy, ...importedSettings.privacy };
              }
              if (importedSettings.advanced) {
                state.advanced = { ...defaultAdvanced, ...importedSettings.advanced };
              }
              
              state.isDirty = true;
            });

            // Auto-save after import
            await get().saveSettings();
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to import settings';
            });
            throw error;
          }
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },
      })),
      {
        name: 'settings-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          riskManagement: state.riskManagement,
          notifications: state.notifications,
          display: state.display,
          privacy: state.privacy,
          advanced: state.advanced,
        }),
      }
    ),
    { name: 'settings-store' }
  )
);

// Auto-save settings when marked as dirty
let saveTimeout: NodeJS.Timeout;
useSettingsStore.subscribe((state) => {
  if (state.isDirty) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      state.saveSettings();
    }, 2000); // Auto-save after 2 seconds of inactivity
  }
});

// Apply theme on system preference change
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const { display } = useSettingsStore.getState();
    if (display.theme === 'auto') {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}

export default useSettingsStore;