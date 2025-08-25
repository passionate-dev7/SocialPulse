import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification, NotificationSettings, MonitoringConfig } from '@/services/hyperliquid-notifications';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    const loadNotifications = () => {
      const allNotifications = notificationService.getNotifications();
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    };

    // Initial load
    loadNotifications();

    // Set up event listeners
    const handleNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    const handleNotificationRead = () => {
      loadNotifications();
    };

    const handleAllRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    };

    const handleCleared = () => {
      loadNotifications();
    };

    notificationService.on('notification', handleNotification);
    notificationService.on('notification-read', handleNotificationRead);
    notificationService.on('all-notifications-read', handleAllRead);
    notificationService.on('notifications-cleared', handleCleared);

    return () => {
      notificationService.off('notification', handleNotification);
      notificationService.off('notification-read', handleNotificationRead);
      notificationService.off('all-notifications-read', handleAllRead);
      notificationService.off('notifications-cleared', handleCleared);
    };
  }, []);

  const startMonitoring = useCallback((config: MonitoringConfig) => {
    notificationService.startMonitoring(config);
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback((userAddress: string) => {
    notificationService.stopMonitoring(userAddress);
    setIsMonitoring(false);
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    notificationService.markAsRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead();
  }, []);

  const clearNotifications = useCallback((olderThan?: number) => {
    notificationService.clearNotifications(olderThan);
  }, []);

  const updateSettings = useCallback((settings: Partial<NotificationSettings>) => {
    notificationService.updateSettings(settings);
  }, []);

  const getStatistics = useCallback(() => {
    return notificationService.getStatistics();
  }, []);

  return {
    notifications,
    unreadCount,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updateSettings,
    getStatistics,
  };
};

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings>(
    notificationService['notificationSettings']
  );

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    notificationService.updateSettings(newSettings);
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return {
    settings,
    updateSettings,
  };
};