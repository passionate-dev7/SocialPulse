import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import NotificationSettings from '@/components/NotificationSettings';
import { notificationService, MonitoringConfig } from '@/services/hyperliquid-notifications';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { 
  BellIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  CheckIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface NotificationsPageProps {
  // Props can be added here if needed
}

const NotificationsPage: React.FC<NotificationsPageProps> = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [testAddress, setTestAddress] = useState('0x0000000000000000000000000000000000000000');
  
  const {
    notifications,
    unreadCount,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    getStatistics,
  } = useNotifications();

  const stats = getStatistics();

  const handleStartMonitoring = () => {
    const config: MonitoringConfig = {
      userAddress: testAddress,
      pollingInterval: 5000, // 5 seconds for demo
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
      priceAlerts: [
        { coin: 'BTC', targetPrice: 50000, condition: 'above', enabled: true },
        { coin: 'ETH', targetPrice: 3000, condition: 'below', enabled: true },
      ],
    };
    
    startMonitoring(config);
  };

  const handleStopMonitoring = () => {
    stopMonitoring(testAddress);
  };

  // Simulate test notification
  const createTestNotification = () => {
    const types = [
      'order_filled',
      'position_opened',
      'pnl_update',
      'price_alert',
      'margin_alert'
    ];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    // This would normally come from the service, but for testing:
    notificationService['createNotification']({
      type: randomType as any,
      priority: Math.random() > 0.5 ? 'high' : 'medium' as any,
      title: `Test ${randomType.replace(/_/g, ' ')}`,
      message: `This is a test notification for ${randomType}`,
      data: { test: true },
    });
  };

  return (
    <>
      <Head>
        <title>Notifications | SocialPulse</title>
        <meta name="description" content="Real-time trading notifications and alerts" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Notifications Center</h1>
            <p className="text-gray-600">
              Real-time alerts and updates for your trading activity
            </p>
          </div>

          {/* Monitoring Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Monitoring Status</h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isMonitoring 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {isMonitoring ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="User address to monitor"
                value={testAddress}
                onChange={(e) => setTestAddress(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg"
                disabled={isMonitoring}
              />
              {!isMonitoring ? (
                <button
                  onClick={handleStartMonitoring}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlayIcon className="h-4 w-4" />
                  Start Monitoring
                </button>
              ) : (
                <button
                  onClick={handleStopMonitoring}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <PauseIcon className="h-4 w-4" />
                  Stop Monitoring
                </button>
              )}
              <button
                onClick={createTestNotification}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Test Notification
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">Unread</p>
              <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">High Priority</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.byPriority?.high || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">Critical</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.byPriority?.critical || 0}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === 'notifications'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BellIcon className="h-5 w-5" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === 'settings'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CogIcon className="h-5 w-5" />
                    Settings
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'notifications' ? (
                <div>
                  {/* Actions Bar */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Recent Notifications</h3>
                    <div className="flex gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                          <CheckIcon className="h-4 w-4" />
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={() => clearNotifications()}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notifications List */}
                  {notifications.length > 0 ? (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            !notification.read 
                              ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  notification.type.includes('filled') ? 'bg-green-100 text-green-800' :
                                  notification.type.includes('alert') ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {notification.type.replace(/_/g, ' ').toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                </span>
                              </div>
                              <p className="font-medium text-gray-900">{notification.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No notifications yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Start monitoring to receive real-time alerts
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <NotificationSettings userAddress={testAddress} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<NotificationsPageProps> = async () => {
  return {
    props: {},
  };
};

export default NotificationsPage;