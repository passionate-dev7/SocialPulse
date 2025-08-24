// React Query client configuration for SocialPulse platform

import { QueryClient, DefaultOptions } from '@tanstack/react-query';
// Default options for all queries
const defaultOptions: DefaultOptions = {
  queries: {
    // Global defaults
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors except 429 (rate limit)
      if (error?.response?.status) {
        const status = error.response.status;
        if (status && status >= 400 && status < 500 && status !== 429) {
          return false;
        }
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    retry: false,
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  },
};

// Create the query client
export const queryClient = new QueryClient({
  defaultOptions,
});

// Error handler for global error boundary
export const handleQueryError = (error: unknown) => {
  console.error('React Query Error:', error);
  
  if ((error as any)?.response?.status) {
    // Handle specific API errors
    switch ((error as any).response.status) {
      case 401:
        // Redirect to login
        window.location.href = '/login';
        break;
      case 403:
        // Show permission denied message
        console.error('Permission denied');
        break;
      case 429:
        // Rate limit exceeded
        console.error('Rate limit exceeded. Please try again later.');
        break;
      case 500:
        // Server error
        console.error('Server error. Please try again.');
        break;
      default:
        console.error('An unexpected error occurred');
    }
  }
};

// Persist cache to localStorage for important data
export const persistQueryClient = () => {
  // Get important cached data
  const cache = queryClient.getQueryCache();
  const persistentData: Record<string, any> = {};

  // Only persist specific query types
  const persistentQueryKeys = [
    'markets',
    'auth',
    'traders',
  ];

  cache.findAll().forEach((query) => {
    const queryKey = query.queryKey as string[];
    const shouldPersist = persistentQueryKeys.some(key => 
      queryKey.some(k => typeof k === 'string' && k.includes(key))
    );

    if (shouldPersist && query.state.data) {
      persistentData[queryKey.join('|')] = {
        data: query.state.data,
        dataUpdatedAt: query.state.dataUpdatedAt,
      };
    }
  });

  try {
    localStorage.setItem('react_query_cache', JSON.stringify(persistentData));
  } catch (error) {
    console.warn('Failed to persist query cache:', error);
  }
};

// Restore cache from localStorage
export const restoreQueryClient = () => {
  try {
    const cached = localStorage.getItem('react_query_cache');
    if (!cached) return;

    const persistedData = JSON.parse(cached);
    const now = Date.now();

    Object.entries(persistedData).forEach(([keyString, cachedQuery]: [string, any]) => {
      const queryKey = keyString.split('|');
      const age = now - cachedQuery.dataUpdatedAt;
      
      // Only restore data that's less than 10 minutes old
      if (age < 10 * 60 * 1000) {
        queryClient.setQueryData(queryKey, cachedQuery.data);
      }
    });
  } catch (error) {
    console.warn('Failed to restore query cache:', error);
  }
};

// Clear persisted cache
export const clearPersistedCache = () => {
  try {
    localStorage.removeItem('react_query_cache');
  } catch (error) {
    console.warn('Failed to clear persisted cache:', error);
  }
};

// DevTools configuration
export const reactQueryDevtools = {
  initialIsOpen: false,
  position: 'bottom-right' as const,
};

// Prefetch commonly used data
export const prefetchCommonData = async () => {
  // Prefetch markets data
  await queryClient.prefetchQuery({
    queryKey: ['markets', 'list'],
    queryFn: () => import('./api').then(({ apiClient }) => 
      apiClient.get('/markets')
    ),
    staleTime: 60 * 1000, // 1 minute
  });

  // Prefetch top traders
  await queryClient.prefetchQuery({
    queryKey: ['traders', 'list', {}],
    queryFn: () => import('./api').then(({ apiClient }) => 
      apiClient.get('/traders/leaderboard?limit=10')
    ),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Invalidate all user-specific data on logout
export const invalidateUserData = () => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const queryKey = query.queryKey as string[];
      const userSpecificKeys = [
        'portfolio',
        'copyTrading',
        'auth',
        'balance',
        'positions',
        'trades',
      ];
      
      return userSpecificKeys.some(key => 
        queryKey.some(k => typeof k === 'string' && k.includes(key))
      );
    },
  });
};

// Background sync for important real-time data
export const enableBackgroundSync = () => {
  const syncInterval = 30 * 1000; // 30 seconds

  setInterval(() => {
    // Only sync if user is authenticated and tab is visible
    if (document.visibilityState === 'visible') {
      // Invalidate real-time sensitive data
      queryClient.invalidateQueries({
        queryKey: ['portfolio', 'positions'],
      });
      
      queryClient.invalidateQueries({
        queryKey: ['portfolio', 'balance'],
      });
      
      queryClient.invalidateQueries({
        queryKey: ['markets'],
      });
    }
  }, syncInterval);
};