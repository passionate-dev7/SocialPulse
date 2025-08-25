/**
 * Hyperliquid Notification Service
 * Real-time monitoring and notifications for trading activity
 */

import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';

// Hyperliquid API Configuration
const HYPERLIQUID_API_URL = 'https://api.hyperliquid.xyz';

// Notification Types
export enum NotificationType {
  ORDER_FILLED = 'order_filled',
  ORDER_CANCELED = 'order_canceled',
  ORDER_REJECTED = 'order_rejected',
  POSITION_OPENED = 'position_opened',
  POSITION_CLOSED = 'position_closed',
  POSITION_LIQUIDATED = 'position_liquidated',
  PNL_UPDATE = 'pnl_update',
  MARGIN_ALERT = 'margin_alert',
  RATE_LIMIT_WARNING = 'rate_limit_warning',
  VAULT_UPDATE = 'vault_update',
  REFERRAL_REWARD = 'referral_reward',
  STAKING_REWARD = 'staking_reward',
  PRICE_ALERT = 'price_alert',
  VOLUME_MILESTONE = 'volume_milestone',
  FEE_DISCOUNT = 'fee_discount',
}

// Notification Priority Levels
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Interfaces
export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: number;
  data?: any;
  read: boolean;
  actionUrl?: string;
}

export interface UserFill {
  coin: string;
  px: string;
  sz: string;
  side: 'B' | 'A';
  time: number;
  fee: string;
  closedPnl?: string;
  dir: string;
  hash: string;
  oid: number;
  tid: number;
}

export interface UserOrder {
  coin: string;
  limitPx: string;
  oid: number;
  side: 'A' | 'B';
  sz: string;
  timestamp: number;
  orderType?: string;
  status?: string;
}

export interface OrderStatus {
  status: string;
  order?: {
    order: UserOrder;
    status: string;
    statusTimestamp: number;
  };
}

export interface PortfolioData {
  accountValueHistory: Array<[number, string]>;
  pnlHistory: Array<[number, string]>;
  vlm: string;
}

export interface NotificationSettings {
  enableOrderNotifications: boolean;
  enablePositionNotifications: boolean;
  enablePnlNotifications: boolean;
  enableMarginAlerts: boolean;
  enablePriceAlerts: boolean;
  enableSystemNotifications: boolean;
  pnlThreshold: number; // Percentage change to trigger notification
  marginThreshold: number; // Margin ratio threshold for alerts
  soundEnabled: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
}

export interface PriceAlert {
  coin: string;
  targetPrice: number;
  condition: 'above' | 'below';
  enabled: boolean;
}

export interface MonitoringConfig {
  userAddress: string;
  pollingInterval: number; // milliseconds
  notificationSettings: NotificationSettings;
  priceAlerts: PriceAlert[];
}

class HyperliquidNotificationService extends EventEmitter {
  private api: AxiosInstance;
  private notifications: Map<string, Notification> = new Map();
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private lastCheckedData: Map<string, any> = new Map();
  private notificationSettings: NotificationSettings;

  constructor() {
    super();
    this.api = axios.create({
      baseURL: `${HYPERLIQUID_API_URL}/info`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Default notification settings
    this.notificationSettings = {
      enableOrderNotifications: true,
      enablePositionNotifications: true,
      enablePnlNotifications: true,
      enableMarginAlerts: true,
      enablePriceAlerts: true,
      enableSystemNotifications: true,
      pnlThreshold: 5, // 5% change
      marginThreshold: 1.5, // 150% margin ratio
      soundEnabled: true,
      desktopNotifications: false,
      emailNotifications: false,
    };
  }

  /**
   * Update notification settings
   */
  updateSettings(settings: Partial<NotificationSettings>) {
    this.notificationSettings = { ...this.notificationSettings, ...settings };
  }

  /**
   * Start monitoring a user's activity
   */
  async startMonitoring(config: MonitoringConfig) {
    const { userAddress, pollingInterval, notificationSettings, priceAlerts } = config;
    
    if (notificationSettings) {
      this.updateSettings(notificationSettings);
    }

    // Clear existing monitoring for this user
    this.stopMonitoring(userAddress);

    // Set up monitoring intervals
    const intervals = {
      fills: setInterval(() => this.checkUserFills(userAddress), pollingInterval),
      orders: setInterval(() => this.checkOpenOrders(userAddress), pollingInterval),
      portfolio: setInterval(() => this.checkPortfolio(userAddress), pollingInterval * 2),
      prices: setInterval(() => this.checkPriceAlerts(priceAlerts), pollingInterval),
      rateLimit: setInterval(() => this.checkRateLimit(userAddress), pollingInterval * 10),
    };

    // Store intervals for cleanup
    Object.entries(intervals).forEach(([key, interval]) => {
      this.monitoringIntervals.set(`${userAddress}-${key}`, interval);
    });

    console.log(`Started monitoring for user: ${userAddress}`);
  }

  /**
   * Stop monitoring a user's activity
   */
  stopMonitoring(userAddress: string) {
    // Clear all intervals for this user
    const keysToDelete: string[] = [];
    this.monitoringIntervals.forEach((interval, key) => {
      if (key.startsWith(userAddress)) {
        clearInterval(interval);
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.monitoringIntervals.delete(key));
    console.log(`Stopped monitoring for user: ${userAddress}`);
  }

  /**
   * Check user fills for new trades
   */
  private async checkUserFills(userAddress: string) {
    if (!this.notificationSettings.enableOrderNotifications) return;

    try {
      const response = await this.api.post('', {
        type: 'userFills',
        user: userAddress,
      });

      const fills: UserFill[] = response.data;
      const lastCheckedTime = this.lastCheckedData.get(`${userAddress}-fills-time`) || 0;
      
      // Check for new fills
      fills.forEach(fill => {
        if (fill.time > lastCheckedTime) {
          this.createFillNotification(fill, userAddress);
        }
      });

      // Update last checked time
      if (fills.length > 0) {
        const maxTime = Math.max(...fills.map(f => f.time));
        this.lastCheckedData.set(`${userAddress}-fills-time`, maxTime);
      }
    } catch (error) {
      console.error('Error checking user fills:', error);
    }
  }

  /**
   * Check open orders for changes
   */
  private async checkOpenOrders(userAddress: string) {
    if (!this.notificationSettings.enableOrderNotifications) return;

    try {
      const response = await this.api.post('', {
        type: 'openOrders',
        user: userAddress,
      });

      const currentOrders: UserOrder[] = response.data;
      const previousOrders = this.lastCheckedData.get(`${userAddress}-orders`) || [];
      
      // Check for canceled orders
      previousOrders.forEach((prevOrder: UserOrder) => {
        const stillExists = currentOrders.find(o => o.oid === prevOrder.oid);
        if (!stillExists) {
          this.createNotification({
            type: NotificationType.ORDER_CANCELED,
            priority: NotificationPriority.MEDIUM,
            title: 'Order Canceled',
            message: `Your ${prevOrder.side === 'B' ? 'buy' : 'sell'} order for ${prevOrder.sz} ${prevOrder.coin} at ${prevOrder.limitPx} has been canceled`,
            data: prevOrder,
          });
        }
      });

      // Check for new orders
      currentOrders.forEach(order => {
        const existedBefore = previousOrders.find((o: UserOrder) => o.oid === order.oid);
        if (!existedBefore) {
          // This is a new order - we might not need to notify for this
        }
      });

      this.lastCheckedData.set(`${userAddress}-orders`, currentOrders);
    } catch (error) {
      console.error('Error checking open orders:', error);
    }
  }

  /**
   * Check portfolio for PnL changes
   */
  private async checkPortfolio(userAddress: string) {
    if (!this.notificationSettings.enablePnlNotifications) return;

    try {
      const response = await this.api.post('', {
        type: 'portfolio',
        user: userAddress,
      });

      const portfolio = response.data;
      const dayData = portfolio.find((p: any) => p[0] === 'day')?.[1] as PortfolioData;
      
      if (dayData && dayData.pnlHistory.length > 0) {
        const latestPnl = parseFloat(dayData.pnlHistory[dayData.pnlHistory.length - 1][1]);
        const previousPnl = this.lastCheckedData.get(`${userAddress}-pnl`) || 0;
        
        const pnlChange = latestPnl - previousPnl;
        const pnlChangePercent = previousPnl !== 0 ? (pnlChange / Math.abs(previousPnl)) * 100 : 0;
        
        // Check if PnL change exceeds threshold
        if (Math.abs(pnlChangePercent) >= this.notificationSettings.pnlThreshold) {
          this.createNotification({
            type: NotificationType.PNL_UPDATE,
            priority: pnlChange > 0 ? NotificationPriority.MEDIUM : NotificationPriority.HIGH,
            title: pnlChange > 0 ? 'Profit Alert' : 'Loss Alert',
            message: `Your daily PnL ${pnlChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(pnlChangePercent).toFixed(2)}% ($${Math.abs(pnlChange).toFixed(2)})`,
            data: { pnl: latestPnl, change: pnlChange, changePercent: pnlChangePercent },
          });
        }
        
        this.lastCheckedData.set(`${userAddress}-pnl`, latestPnl);
      }
    } catch (error) {
      console.error('Error checking portfolio:', error);
    }
  }

  /**
   * Check price alerts
   */
  private async checkPriceAlerts(priceAlerts: PriceAlert[]) {
    if (!this.notificationSettings.enablePriceAlerts || !priceAlerts.length) return;

    try {
      const response = await this.api.post('', {
        type: 'allMids',
      });

      const prices = response.data;
      
      priceAlerts.forEach(alert => {
        if (!alert.enabled) return;
        
        const currentPrice = parseFloat(prices[alert.coin]);
        if (!currentPrice) return;
        
        const triggered = alert.condition === 'above' 
          ? currentPrice >= alert.targetPrice
          : currentPrice <= alert.targetPrice;
        
        if (triggered) {
          this.createNotification({
            type: NotificationType.PRICE_ALERT,
            priority: NotificationPriority.HIGH,
            title: 'Price Alert Triggered',
            message: `${alert.coin} is now ${alert.condition} ${alert.targetPrice} at ${currentPrice}`,
            data: { coin: alert.coin, price: currentPrice, alert },
          });
          
          // Disable alert after triggering
          alert.enabled = false;
        }
      });
    } catch (error) {
      console.error('Error checking price alerts:', error);
    }
  }

  /**
   * Check rate limits
   */
  private async checkRateLimit(userAddress: string) {
    if (!this.notificationSettings.enableSystemNotifications) return;

    try {
      const response = await this.api.post('', {
        type: 'userRateLimit',
        user: userAddress,
      });

      const { nRequestsUsed, nRequestsCap } = response.data;
      const usagePercent = (nRequestsUsed / nRequestsCap) * 100;
      
      if (usagePercent > 80) {
        this.createNotification({
          type: NotificationType.RATE_LIMIT_WARNING,
          priority: usagePercent > 90 ? NotificationPriority.CRITICAL : NotificationPriority.HIGH,
          title: 'Rate Limit Warning',
          message: `You've used ${usagePercent.toFixed(1)}% of your API rate limit (${nRequestsUsed}/${nRequestsCap} requests)`,
          data: { used: nRequestsUsed, cap: nRequestsCap },
        });
      }
    } catch (error) {
      console.error('Error checking rate limit:', error);
    }
  }

  /**
   * Create a fill notification
   */
  private createFillNotification(fill: UserFill, userAddress: string) {
    const isBuy = fill.side === 'B';
    const pnl = fill.closedPnl ? parseFloat(fill.closedPnl) : null;
    
    this.createNotification({
      type: NotificationType.ORDER_FILLED,
      priority: pnl && pnl < 0 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
      title: 'Order Filled',
      message: `${isBuy ? 'Bought' : 'Sold'} ${fill.sz} ${fill.coin} at ${fill.px}${
        pnl ? ` (PnL: ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)})` : ''
      }`,
      data: fill,
      actionUrl: `/trader/${userAddress}`,
    });
  }

  /**
   * Create a notification
   */
  private createNotification(params: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const notification: Notification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
      ...params,
    };
    
    this.notifications.set(notification.id, notification);
    this.emit('notification', notification);
    
    // Play sound if enabled
    if (this.notificationSettings.soundEnabled) {
      this.playNotificationSound(notification.priority);
    }
    
    // Show desktop notification if enabled
    if (this.notificationSettings.desktopNotifications) {
      this.showDesktopNotification(notification);
    }
    
    return notification;
  }

  /**
   * Play notification sound based on priority
   */
  private playNotificationSound(priority: NotificationPriority) {
    // This would be implemented in the frontend
    this.emit('play-sound', priority);
  }

  /**
   * Show desktop notification
   */
  private showDesktopNotification(notification: Notification) {
    // This would be implemented in the frontend using the Notification API
    this.emit('desktop-notification', notification);
  }

  /**
   * Get all notifications
   */
  getNotifications(unreadOnly = false): Notification[] {
    const notifications = Array.from(this.notifications.values());
    if (unreadOnly) {
      return notifications.filter(n => !n.read);
    }
    return notifications.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string) {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      this.emit('notification-read', notificationId);
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.emit('all-notifications-read');
  }

  /**
   * Clear notifications
   */
  clearNotifications(olderThan?: number) {
    if (olderThan) {
      const cutoff = Date.now() - olderThan;
      const toDelete: string[] = [];
      this.notifications.forEach((notification, id) => {
        if (notification.timestamp < cutoff) {
          toDelete.push(id);
        }
      });
      toDelete.forEach(id => this.notifications.delete(id));
    } else {
      this.notifications.clear();
    }
    this.emit('notifications-cleared');
  }

  /**
   * Get notification statistics
   */
  getStatistics() {
    const notifications = Array.from(this.notifications.values());
    const unread = notifications.filter(n => !n.read).length;
    const byType = new Map<NotificationType, number>();
    const byPriority = new Map<NotificationPriority, number>();
    
    notifications.forEach(n => {
      byType.set(n.type, (byType.get(n.type) || 0) + 1);
      byPriority.set(n.priority, (byPriority.get(n.priority) || 0) + 1);
    });
    
    return {
      total: notifications.length,
      unread,
      byType: Object.fromEntries(byType),
      byPriority: Object.fromEntries(byPriority),
    };
  }
}

// Export singleton instance
export const notificationService = new HyperliquidNotificationService();

// Export types
export type { HyperliquidNotificationService };