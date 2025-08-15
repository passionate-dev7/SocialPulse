import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Trader {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  verified: boolean;
  tradingLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  stats: {
    totalPnl: number;
    winRate: number;
    avgReturn: number;
    totalTrades: number;
    followersCount: number;
    copiers: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  recentPerformance: {
    period: '1d' | '7d' | '30d' | '90d' | '1y';
    return: number;
    trades: number;
  }[];
  isFollowing: boolean;
  isCopying: boolean;
  lastActive: string;
}

export interface CopyTradingSettings {
  traderId: string;
  enabled: boolean;
  copyRatio: number; // 0-1 (percentage of portfolio to allocate)
  maxPositionSize: number;
  stopLossEnabled: boolean;
  stopLossPercentage?: number;
  takeProfitEnabled: boolean;
  takeProfitPercentage?: number;
  allowedSymbols: string[];
  blockedSymbols: string[];
  maxLeverage: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface SocialFeedPost {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  verified: boolean;
  content: string;
  images?: string[];
  tradingData?: {
    symbol: string;
    side: 'buy' | 'sell';
    price: number;
    size: number;
    pnl?: number;
  };
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface TraderRecommendation {
  trader: Trader;
  reason: string;
  score: number;
  matchingCriteria: string[];
}

export interface SocialState {
  // State
  followedTraders: Trader[];
  copyTradingSettings: CopyTradingSettings[];
  socialFeed: SocialFeedPost[];
  recommendations: TraderRecommendation[];
  searchResults: Trader[];
  isLoading: boolean;
  error: string | null;
  feedCursor: string | null;
  hasMorePosts: boolean;
  
  // Actions
  searchTraders: (query: string) => Promise<void>;
  followTrader: (traderId: string) => Promise<void>;
  unfollowTrader: (traderId: string) => Promise<void>;
  setupCopyTrading: (settings: Omit<CopyTradingSettings, 'enabled'>) => Promise<void>;
  updateCopyTradingSettings: (traderId: string, updates: Partial<CopyTradingSettings>) => Promise<void>;
  stopCopyTrading: (traderId: string) => Promise<void>;
  fetchSocialFeed: (refresh?: boolean) => Promise<void>;
  fetchRecommendations: () => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  bookmarkPost: (postId: string) => Promise<void>;
  unbookmarkPost: (postId: string) => Promise<void>;
  sharePost: (postId: string) => Promise<void>;
  createPost: (content: string, tradingData?: SocialFeedPost['tradingData'], images?: string[]) => Promise<void>;
  fetchFollowedTraders: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  followedTraders: [],
  copyTradingSettings: [],
  socialFeed: [],
  recommendations: [],
  searchResults: [],
  isLoading: false,
  error: null,
  feedCursor: null,
  hasMorePosts: true,
};

const useSocialStore = create<SocialState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          ...initialState,

          searchTraders: async (query) => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              const response = await fetch(`/api/social/traders/search?q=${encodeURIComponent(query)}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to search traders');
              }

              const results = await response.json();

              set((state) => {
                state.searchResults = results;
                state.isLoading = false;
              });
            } catch (error) {
              set((state) => {
                state.isLoading = false;
                state.error = error instanceof Error ? error.message : 'Failed to search traders';
              });
            }
          },

          followTrader: async (traderId) => {
            // Optimistic update
            set((state) => {
              const trader = state.searchResults.find(t => t.id === traderId);
              if (trader) {
                trader.isFollowing = true;
                trader.stats.followersCount += 1;
              }
            });

            try {
              const response = await fetch(`/api/social/traders/${traderId}/follow`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to follow trader');
              }

              // Refresh followed traders list
              await get().fetchFollowedTraders();
            } catch (error) {
              // Revert optimistic update
              set((state) => {
                const trader = state.searchResults.find(t => t.id === traderId);
                if (trader) {
                  trader.isFollowing = false;
                  trader.stats.followersCount -= 1;
                }
                state.error = error instanceof Error ? error.message : 'Failed to follow trader';
              });
            }
          },

          unfollowTrader: async (traderId) => {
            // Optimistic update
            set((state) => {
              state.followedTraders = state.followedTraders.filter(t => t.id !== traderId);
              const trader = state.searchResults.find(t => t.id === traderId);
              if (trader) {
                trader.isFollowing = false;
                trader.stats.followersCount -= 1;
              }
            });

            try {
              const response = await fetch(`/api/social/traders/${traderId}/unfollow`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to unfollow trader');
              }

              // Remove copy trading settings if exists
              set((state) => {
                state.copyTradingSettings = state.copyTradingSettings.filter(
                  settings => settings.traderId !== traderId
                );
              });
            } catch (error) {
              // Revert optimistic update
              await get().fetchFollowedTraders();
              set((state) => {
                const trader = state.searchResults.find(t => t.id === traderId);
                if (trader) {
                  trader.isFollowing = true;
                  trader.stats.followersCount += 1;
                }
                state.error = error instanceof Error ? error.message : 'Failed to unfollow trader';
              });
            }
          },

          setupCopyTrading: async (settings) => {
            const newSettings: CopyTradingSettings = {
              ...settings,
              enabled: true,
            };

            // Optimistic update
            set((state) => {
              const existingIndex = state.copyTradingSettings.findIndex(s => s.traderId === settings.traderId);
              if (existingIndex >= 0) {
                state.copyTradingSettings[existingIndex] = newSettings;
              } else {
                state.copyTradingSettings.push(newSettings);
              }
              
              const trader = state.followedTraders.find(t => t.id === settings.traderId);
              if (trader) {
                trader.isCopying = true;
                trader.stats.copiers += 1;
              }
            });

            try {
              const response = await fetch('/api/social/copy-trading', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                },
                body: JSON.stringify(newSettings),
              });

              if (!response.ok) {
                throw new Error('Failed to setup copy trading');
              }

              const savedSettings = await response.json();
              
              set((state) => {
                const index = state.copyTradingSettings.findIndex(s => s.traderId === settings.traderId);
                if (index >= 0) {
                  state.copyTradingSettings[index] = savedSettings;
                }
              });
            } catch (error) {
              // Revert optimistic update
              set((state) => {
                state.copyTradingSettings = state.copyTradingSettings.filter(
                  s => s.traderId !== settings.traderId
                );
                const trader = state.followedTraders.find(t => t.id === settings.traderId);
                if (trader) {
                  trader.isCopying = false;
                  trader.stats.copiers -= 1;
                }
                state.error = error instanceof Error ? error.message : 'Failed to setup copy trading';
              });
            }
          },

          updateCopyTradingSettings: async (traderId, updates) => {
            const currentSettings = get().copyTradingSettings.find(s => s.traderId === traderId);
            if (!currentSettings) return;

            // Optimistic update
            set((state) => {
              const index = state.copyTradingSettings.findIndex(s => s.traderId === traderId);
              if (index >= 0) {
                Object.assign(state.copyTradingSettings[index], updates);
              }
            });

            try {
              const response = await fetch(`/api/social/copy-trading/${traderId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                },
                body: JSON.stringify(updates),
              });

              if (!response.ok) {
                throw new Error('Failed to update copy trading settings');
              }

              const updatedSettings = await response.json();
              
              set((state) => {
                const index = state.copyTradingSettings.findIndex(s => s.traderId === traderId);
                if (index >= 0) {
                  state.copyTradingSettings[index] = updatedSettings;
                }
              });
            } catch (error) {
              // Revert optimistic update
              set((state) => {
                const index = state.copyTradingSettings.findIndex(s => s.traderId === traderId);
                if (index >= 0) {
                  Object.assign(state.copyTradingSettings[index], currentSettings);
                }
                state.error = error instanceof Error ? error.message : 'Failed to update copy trading settings';
              });
            }
          },

          stopCopyTrading: async (traderId) => {
            // Optimistic update
            const existingSettings = get().copyTradingSettings.find(s => s.traderId === traderId);
            set((state) => {
              state.copyTradingSettings = state.copyTradingSettings.filter(s => s.traderId !== traderId);
              const trader = state.followedTraders.find(t => t.id === traderId);
              if (trader) {
                trader.isCopying = false;
                trader.stats.copiers -= 1;
              }
            });

            try {
              const response = await fetch(`/api/social/copy-trading/${traderId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to stop copy trading');
              }
            } catch (error) {
              // Revert optimistic update
              if (existingSettings) {
                set((state) => {
                  state.copyTradingSettings.push(existingSettings);
                  const trader = state.followedTraders.find(t => t.id === traderId);
                  if (trader) {
                    trader.isCopying = true;
                    trader.stats.copiers += 1;
                  }
                });
              }
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to stop copy trading';
              });
            }
          },

          fetchSocialFeed: async (refresh = false) => {
            const { feedCursor, hasMorePosts } = get();
            
            if (!refresh && !hasMorePosts) return;

            set((state) => {
              state.isLoading = true;
              if (refresh) {
                state.feedCursor = null;
                state.hasMorePosts = true;
              }
            });

            try {
              const cursor = refresh ? null : feedCursor;
              const url = `/api/social/feed${cursor ? `?cursor=${cursor}` : ''}`;
              
              const response = await fetch(url, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to fetch social feed');
              }

              const { posts, nextCursor, hasMore } = await response.json();

              set((state) => {
                if (refresh) {
                  state.socialFeed = posts;
                } else {
                  state.socialFeed.push(...posts);
                }
                state.feedCursor = nextCursor;
                state.hasMorePosts = hasMore;
                state.isLoading = false;
              });
            } catch (error) {
              set((state) => {
                state.isLoading = false;
                state.error = error instanceof Error ? error.message : 'Failed to fetch social feed';
              });
            }
          },

          fetchRecommendations: async () => {
            try {
              const response = await fetch('/api/social/recommendations', {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to fetch recommendations');
              }

              const recommendations = await response.json();

              set((state) => {
                state.recommendations = recommendations;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to fetch recommendations';
              });
            }
          },

          likePost: async (postId) => {
            // Optimistic update
            set((state) => {
              const post = state.socialFeed.find(p => p.id === postId);
              if (post && !post.isLiked) {
                post.isLiked = true;
                post.likes += 1;
              }
            });

            try {
              const response = await fetch(`/api/social/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to like post');
              }
            } catch (error) {
              // Revert optimistic update
              set((state) => {
                const post = state.socialFeed.find(p => p.id === postId);
                if (post) {
                  post.isLiked = false;
                  post.likes -= 1;
                }
                state.error = error instanceof Error ? error.message : 'Failed to like post';
              });
            }
          },

          unlikePost: async (postId) => {
            // Optimistic update
            set((state) => {
              const post = state.socialFeed.find(p => p.id === postId);
              if (post && post.isLiked) {
                post.isLiked = false;
                post.likes -= 1;
              }
            });

            try {
              const response = await fetch(`/api/social/posts/${postId}/like`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to unlike post');
              }
            } catch (error) {
              // Revert optimistic update
              set((state) => {
                const post = state.socialFeed.find(p => p.id === postId);
                if (post) {
                  post.isLiked = true;
                  post.likes += 1;
                }
                state.error = error instanceof Error ? error.message : 'Failed to unlike post';
              });
            }
          },

          bookmarkPost: async (postId) => {
            set((state) => {
              const post = state.socialFeed.find(p => p.id === postId);
              if (post) {
                post.isBookmarked = true;
              }
            });

            try {
              const response = await fetch(`/api/social/posts/${postId}/bookmark`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to bookmark post');
              }
            } catch (error) {
              set((state) => {
                const post = state.socialFeed.find(p => p.id === postId);
                if (post) {
                  post.isBookmarked = false;
                }
                state.error = error instanceof Error ? error.message : 'Failed to bookmark post';
              });
            }
          },

          unbookmarkPost: async (postId) => {
            set((state) => {
              const post = state.socialFeed.find(p => p.id === postId);
              if (post) {
                post.isBookmarked = false;
              }
            });

            try {
              const response = await fetch(`/api/social/posts/${postId}/bookmark`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to remove bookmark');
              }
            } catch (error) {
              set((state) => {
                const post = state.socialFeed.find(p => p.id === postId);
                if (post) {
                  post.isBookmarked = true;
                }
                state.error = error instanceof Error ? error.message : 'Failed to remove bookmark';
              });
            }
          },

          sharePost: async (postId) => {
            set((state) => {
              const post = state.socialFeed.find(p => p.id === postId);
              if (post) {
                post.shares += 1;
              }
            });

            try {
              const response = await fetch(`/api/social/posts/${postId}/share`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to share post');
              }
            } catch (error) {
              set((state) => {
                const post = state.socialFeed.find(p => p.id === postId);
                if (post) {
                  post.shares -= 1;
                }
                state.error = error instanceof Error ? error.message : 'Failed to share post';
              });
            }
          },

          createPost: async (content, tradingData, images) => {
            const postData = {
              content,
              tradingData,
              images,
            };

            try {
              const response = await fetch('/api/social/posts', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                },
                body: JSON.stringify(postData),
              });

              if (!response.ok) {
                throw new Error('Failed to create post');
              }

              const newPost = await response.json();

              // Add to top of feed
              set((state) => {
                state.socialFeed.unshift(newPost);
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to create post';
              });
            }
          },

          fetchFollowedTraders: async () => {
            try {
              const response = await fetch('/api/social/followed-traders', {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to fetch followed traders');
              }

              const traders = await response.json();

              set((state) => {
                state.followedTraders = traders;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to fetch followed traders';
              });
            }
          },

          clearError: () => {
            set((state) => {
              state.error = null;
            });
          },

          reset: () => {
            set((state) => {
              Object.assign(state, initialState);
            });
          },
        }))
      ),
      {
        name: 'social-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          followedTraders: state.followedTraders,
          copyTradingSettings: state.copyTradingSettings,
        }),
      }
    ),
    { name: 'social-store' }
  )
);

export default useSocialStore;