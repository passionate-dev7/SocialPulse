// Central store exports for the SocialPulse platform
export { default as useAuthStore } from './authStore';
export { default as useTradingStore } from './tradingStore';
export { default as useSocialStore } from './socialStore';
export { default as useSettingsStore } from './settingsStore';

// Re-export types for convenience
export type { User, WalletConnection, AuthState } from './authStore';
export type { 
  Position, 
  Order, 
  Trade, 
  Portfolio, 
  TradingState 
} from './tradingStore';
export type { 
  Trader, 
  CopyTradingSettings, 
  SocialFeedPost, 
  TraderRecommendation, 
  SocialState 
} from './socialStore';
export type { 
  RiskManagementSettings, 
  NotificationSettings, 
  DisplaySettings, 
  ApiConfiguration, 
  PrivacySettings, 
  AdvancedSettings, 
  SettingsState 
} from './settingsStore';

// Store utilities
// export const clearAllStores = () => {
//   useAuthStore.getState().logout();
//   useTradingStore.getState().reset();
//   useSocialStore.getState().reset();
// };

// TODO: Implement store initialization and selectors when stores are created
// export const initializeStores = async () => {
//   // Load settings first
//   await useSettingsStore.getState().loadSettings();
//   
//   // Check authentication state
//   const { isAuthenticated, refreshSession } = useAuthStore.getState();
//   if (isAuthenticated) {
//     try {
//       await refreshSession();
//       
//       // Initialize other stores if authenticated
//       await useTradingStore.getState().fetchPositions();
//       await useTradingStore.getState().fetchPortfolio();
//       await useSocialStore.getState().fetchFollowedTraders();
//       await useSocialStore.getState().fetchSocialFeed();
//     } catch (error) {
//       console.error('Failed to initialize stores:', error);
//     }
//   }
// };

// Store selectors for common use cases
// export const createAuthSelector = () => useAuthStore((state) => ({
//   user: state.user,
//   isAuthenticated: state.isAuthenticated,
//   isLoading: state.isLoading,
// }));

// export const createTradingSelector = () => useTradingStore((state) => ({
//   positions: state.positions,
//   portfolio: state.portfolio,
//   isLoading: state.isLoading,
// }));

// export const createSocialSelector = () => useSocialStore((state) => ({
//   followedTraders: state.followedTraders,
//   socialFeed: state.socialFeed,
//   isLoading: state.isLoading,
// }));

// export const createSettingsSelector = () => useSettingsStore((state) => ({
//   display: state.display,
//   riskManagement: state.riskManagement,
//   isDirty: state.isDirty,
// }));