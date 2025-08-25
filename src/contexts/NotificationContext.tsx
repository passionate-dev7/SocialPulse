import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { notificationService, MonitoringConfig } from '@/services/hyperliquid-notifications';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationContextValue {
  notifications: ReturnType<typeof useNotifications>['notifications'];
  unreadCount: number;
  isMonitoring: boolean;
  startMonitoring: (config: MonitoringConfig) => void;
  stopMonitoring: (userAddress: string) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: (olderThan?: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
  userAddress?: string;
  autoStart?: boolean;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  userAddress,
  autoStart = false 
}) => {
  const {
    notifications,
    unreadCount,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications();

  useEffect(() => {
    // Auto-start monitoring if user address is provided and autoStart is true
    if (userAddress && autoStart) {
      const config: MonitoringConfig = {
        userAddress,
        pollingInterval: 5000, // 5 seconds
        notificationSettings: {
          enableOrderNotifications: true,
          enablePositionNotifications: true,
          enablePnlNotifications: true,
          enableMarginAlerts: true,
          enablePriceAlerts: true,
          enableSystemNotifications: true,
          pnlThreshold: 5,
          marginThreshold: 1.5,
          soundEnabled: true,
          desktopNotifications: false,
          emailNotifications: false,
        },
        priceAlerts: [],
      };
      
      startMonitoring(config);
      
      return () => {
        stopMonitoring(userAddress);
      };
    }
  }, [userAddress, autoStart, startMonitoring, stopMonitoring]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // We'll ask for permission when the user interacts with notifications
      console.log('Desktop notifications available. Permission will be requested on first interaction.');
    }
  }, []);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};