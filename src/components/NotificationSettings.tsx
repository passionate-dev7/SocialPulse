import React, { useState, useEffect } from 'react';
import { 
  BellIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  SpeakerWaveIcon,
  ComputerDesktopIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { notificationService, NotificationSettings as Settings, PriceAlert } from '@/services/hyperliquid-notifications';

interface NotificationSettingsProps {
  userAddress?: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ userAddress }) => {
  const [settings, setSettings] = useState<Settings>(notificationService['notificationSettings']);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [newAlert, setNewAlert] = useState<Partial<PriceAlert>>({
    coin: '',
    targetPrice: 0,
    condition: 'above',
    enabled: true
  });
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load current settings
    setSettings(notificationService['notificationSettings']);
  }, []);

  const handleSettingChange = (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateSettings({ [key]: value });
  };

  const handleSaveSettings = () => {
    notificationService.updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddPriceAlert = () => {
    if (newAlert.coin && newAlert.targetPrice && newAlert.targetPrice > 0) {
      const alert: PriceAlert = {
        coin: newAlert.coin,
        targetPrice: newAlert.targetPrice,
        condition: newAlert.condition as 'above' | 'below',
        enabled: true
      };
      setPriceAlerts([...priceAlerts, alert]);
      setNewAlert({ coin: '', targetPrice: 0, condition: 'above', enabled: true });
      setShowAddAlert(false);
    }
  };

  const handleDeleteAlert = (index: number) => {
    setPriceAlerts(priceAlerts.filter((_, i) => i !== index));
  };

  const handleToggleAlert = (index: number) => {
    const updated = [...priceAlerts];
    updated[index].enabled = !updated[index].enabled;
    setPriceAlerts(updated);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        handleSettingChange('desktopNotifications', true);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Configure how you receive alerts and updates</p>
        </div>

        {/* Notification Types */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <BellIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Order Notifications</p>
                    <p className="text-sm text-gray-600">Alerts for filled, canceled, and rejected orders</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableOrderNotifications}
                  onChange={(e) => handleSettingChange('enableOrderNotifications', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <ChartBarIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Position Notifications</p>
                    <p className="text-sm text-gray-600">Updates when positions are opened, closed, or liquidated</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enablePositionNotifications}
                  onChange={(e) => handleSettingChange('enablePositionNotifications', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">PnL Notifications</p>
                    <p className="text-sm text-gray-600">Alerts for significant profit/loss changes</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enablePnlNotifications}
                  onChange={(e) => handleSettingChange('enablePnlNotifications', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Margin Alerts</p>
                    <p className="text-sm text-gray-600">Warnings when margin levels are critical</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableMarginAlerts}
                  onChange={(e) => handleSettingChange('enableMarginAlerts', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <ChartBarIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Price Alerts</p>
                    <p className="text-sm text-gray-600">Custom price level notifications</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enablePriceAlerts}
                  onChange={(e) => handleSettingChange('enablePriceAlerts', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Thresholds */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Thresholds</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PnL Change Threshold
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={settings.pnlThreshold}
                    onChange={(e) => handleSettingChange('pnlThreshold', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={settings.pnlThreshold}
                      onChange={(e) => handleSettingChange('pnlThreshold', parseFloat(e.target.value))}
                      className="w-16 px-2 py-1 border rounded text-sm"
                      min="1"
                      max="50"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Alert when PnL changes by this percentage</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margin Alert Threshold
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={settings.marginThreshold}
                    onChange={(e) => handleSettingChange('marginThreshold', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={settings.marginThreshold}
                      onChange={(e) => handleSettingChange('marginThreshold', parseFloat(e.target.value))}
                      className="w-16 px-2 py-1 border rounded text-sm"
                      min="1"
                      max="5"
                      step="0.1"
                    />
                    <span className="text-sm text-gray-500">x</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Alert when margin ratio falls below this level</p>
              </div>
            </div>
          </div>

          {/* Delivery Methods */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Methods</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <SpeakerWaveIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Sound Notifications</p>
                    <p className="text-sm text-gray-600">Play sound for new notifications</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <ComputerDesktopIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Desktop Notifications</p>
                    <p className="text-sm text-gray-600">Show browser notifications</p>
                  </div>
                </div>
                {Notification.permission === 'granted' ? (
                  <input
                    type="checkbox"
                    checked={settings.desktopNotifications}
                    onChange={(e) => handleSettingChange('desktopNotifications', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                ) : (
                  <button
                    onClick={requestNotificationPermission}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Enable
                  </button>
                )}
              </div>

              <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Send important alerts to email</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                  disabled
                />
              </label>
            </div>
          </div>

          {/* Price Alerts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Price Alerts</h3>
              <button
                onClick={() => setShowAddAlert(true)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                Add Alert
              </button>
            </div>

            {showAddAlert && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Coin symbol"
                    value={newAlert.coin}
                    onChange={(e) => setNewAlert({ ...newAlert, coin: e.target.value.toUpperCase() })}
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Target price"
                    value={newAlert.targetPrice || ''}
                    onChange={(e) => setNewAlert({ ...newAlert, targetPrice: parseFloat(e.target.value) })}
                    className="px-3 py-2 border rounded"
                    step="0.01"
                  />
                  <select
                    value={newAlert.condition}
                    onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as 'above' | 'below' })}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddPriceAlert}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddAlert(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {priceAlerts.length > 0 ? (
              <div className="space-y-2">
                {priceAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      alert.enabled ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={alert.enabled}
                        onChange={() => handleToggleAlert(index)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {alert.coin} {alert.condition} ${alert.targetPrice}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAlert(index)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No price alerts configured</p>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saved ? 'Settings Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;