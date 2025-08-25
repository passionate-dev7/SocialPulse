import React, { useState, useEffect, useRef } from 'react';
import { 
  BellIcon, 
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  CogIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { notificationService, Notification, NotificationType, NotificationPriority } from '@/services/hyperliquid-notifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  userAddress?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userAddress }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications on mount and listen for new ones
  useEffect(() => {
    const loadNotifications = () => {
      const allNotifications = notificationService.getNotifications();
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    };

    // Initial load
    loadNotifications();

    // Listen for new notifications
    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if enabled
      if (notificationService['notificationSettings'].desktopNotifications) {
        showDesktopNotification(notification);
      }
      
      // Play sound if enabled
      if (notificationService['notificationSettings'].soundEnabled) {
        playNotificationSound(notification.priority);
      }
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

    notificationService.on('notification', handleNewNotification);
    notificationService.on('notification-read', handleNotificationRead);
    notificationService.on('all-notifications-read', handleAllRead);
    notificationService.on('notifications-cleared', handleCleared);

    return () => {
      notificationService.off('notification', handleNewNotification);
      notificationService.off('notification-read', handleNotificationRead);
      notificationService.off('all-notifications-read', handleAllRead);
      notificationService.off('notifications-cleared', handleCleared);
    };
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDesktopNotification = async (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    }
  };

  const playNotificationSound = (priority: NotificationPriority) => {
    // Create and play a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different priorities
    const frequencies = {
      [NotificationPriority.LOW]: 300,
      [NotificationPriority.MEDIUM]: 400,
      [NotificationPriority.HIGH]: 500,
      [NotificationPriority.CRITICAL]: 600,
    };
    
    oscillator.frequency.value = frequencies[priority];
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        notificationService.updateSettings({ desktopNotifications: true });
      }
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleClearAll = () => {
    notificationService.clearNotifications();
    setNotifications([]);
  };

  const getPriorityIcon = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.LOW:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      case NotificationPriority.MEDIUM:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case NotificationPriority.HIGH:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case NotificationPriority.CRITICAL:
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ORDER_FILLED:
        return 'bg-green-100 text-green-800';
      case NotificationType.ORDER_CANCELED:
      case NotificationType.ORDER_REJECTED:
        return 'bg-red-100 text-red-800';
      case NotificationType.POSITION_OPENED:
        return 'bg-blue-100 text-blue-800';
      case NotificationType.POSITION_CLOSED:
        return 'bg-gray-100 text-gray-800';
      case NotificationType.POSITION_LIQUIDATED:
        return 'bg-red-100 text-red-800';
      case NotificationType.PNL_UPDATE:
        return 'bg-purple-100 text-purple-800';
      case NotificationType.MARGIN_ALERT:
        return 'bg-orange-100 text-orange-800';
      case NotificationType.PRICE_ALERT:
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowSettings(false);
        }}
        className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="h-6 w-6 text-blue-600" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Settings"
                >
                  <CogIcon className="h-5 w-5 text-gray-500" />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Mark all as read"
                  >
                    <CheckIcon className="h-5 w-5 text-gray-500" />
                  </button>
                )}
                <button
                  onClick={handleClearAll}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Clear all"
                >
                  <TrashIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'unread' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Desktop Notifications</span>
                  <button
                    onClick={requestNotificationPermission}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    {Notification.permission === 'granted' ? 'Enabled' : 'Enable'}
                  </button>
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Sound</span>
                  <input
                    type="checkbox"
                    checked={notificationService['notificationSettings'].soundEnabled}
                    onChange={(e) => notificationService.updateSettings({ soundEnabled: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {getPriorityIcon(notification.priority)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(notification.type)}`}>
                          {notification.type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Details →
                        </a>
                      )}
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No {filter === 'unread' ? 'unread ' : ''}notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;