import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatCurrency, formatPercentage } from '../utils/format';
import type { UserSettings } from '../types';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'risk' | 'notifications' | 'copy-trading' | 'api' | 'billing'>('account');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockSettings: UserSettings = {
          riskManagement: {
            maxPositionSize: 10000,
            maxDailyLoss: 5000,
            stopLossPercentage: 15,
            takeProfitPercentage: 25,
          },
          notifications: {
            newTrades: true,
            profitLoss: true,
            riskAlerts: true,
            email: true,
            push: false,
          },
          copyTrading: {
            autoFollow: false,
            maxTraders: 5,
            minTraderRank: 10,
            diversificationRatio: 20,
          },
        };
        
        setSettings(mockSettings);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingsChange = (section: keyof UserSettings, field: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setHasChanges(false);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings. Please try again.');
      console.error('Save settings error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Failed to load settings</h1>
          <p className="text-gray-600 mb-6">Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Head>
        <title>Settings - SocialPulse</title>
        <meta 
          name="description" 
          content="Manage your account settings, risk management, notifications, and copy trading preferences."
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://socialpulse.com/settings" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">Manage your account and trading preferences</p>
              </div>
              
              {hasChanges && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  {saving && <LoadingSpinner size="sm" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <nav className="bg-white rounded-lg shadow-sm border p-2 space-y-1">
                {[
                  { key: 'account', label: 'Account', icon: '👤' },
                  { key: 'risk', label: 'Risk Management', icon: '⚠️' },
                  { key: 'notifications', label: 'Notifications', icon: '🔔' },
                  { key: 'copy-trading', label: 'Copy Trading', icon: '👥' },
                  { key: 'api', label: 'API Keys', icon: '🔑' },
                  { key: 'billing', label: 'Billing', icon: '💳' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.key
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm border">
                
                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                    
                    <div className="space-y-8">
                      {/* Profile Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Display Name
                            </label>
                            <input
                              type="text"
                              defaultValue="Anonymous Trader"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address
                            </label>
                            <input
                              type="email"
                              defaultValue="user@example.com"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Connected Wallet */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Wallet</h3>
                        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">0x742d35...2E943BB4</div>
                            <div className="text-sm text-gray-600">Hyperliquid Wallet</div>
                          </div>
                          <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm">
                            Disconnect
                          </button>
                        </div>
                      </div>

                      {/* Security */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                              <div className="text-sm text-gray-600">Add an extra layer of security to your account</div>
                            </div>
                            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm">
                              Enable
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">Login History</div>
                              <div className="text-sm text-gray-600">View your recent login activity</div>
                            </div>
                            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg text-sm">
                              View History
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Risk Management Tab */}
                {activeTab === 'risk' && (
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Management</h2>
                    
                    <div className="space-y-8">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="text-yellow-600 text-xl mr-3">⚠️</div>
                          <div>
                            <h3 className="font-medium text-yellow-800 mb-1">Important</h3>
                            <p className="text-sm text-yellow-700">
                              These settings help protect your capital. Changes will apply to new trades only.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Limits</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Position Size
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                  type="number"
                                  value={settings.riskManagement.maxPositionSize}
                                  onChange={(e) => handleSettingsChange('riskManagement', 'maxPositionSize', parseFloat(e.target.value))}
                                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <p className="text-xs text-gray-600 mt-1">Maximum amount per single position</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Daily Loss
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                  type="number"
                                  value={settings.riskManagement.maxDailyLoss}
                                  onChange={(e) => handleSettingsChange('riskManagement', 'maxDailyLoss', parseFloat(e.target.value))}
                                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <p className="text-xs text-gray-600 mt-1">Stop all trading when daily loss reaches this amount</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stop Loss & Take Profit</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Default Stop Loss (%)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={settings.riskManagement.stopLossPercentage}
                                onChange={(e) => handleSettingsChange('riskManagement', 'stopLossPercentage', parseFloat(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <p className="text-xs text-gray-600 mt-1">Automatic stop loss for copy trades</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Default Take Profit (%)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={settings.riskManagement.takeProfitPercentage}
                                onChange={(e) => handleSettingsChange('riskManagement', 'takeProfitPercentage', parseFloat(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <p className="text-xs text-gray-600 mt-1">Automatic take profit for copy trades</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Current Risk Exposure</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-blue-700">Open Positions</div>
                            <div className="font-medium">{formatCurrency(28000)}</div>
                          </div>
                          <div>
                            <div className="text-blue-700">Daily P&L</div>
                            <div className="font-medium text-green-600">+{formatCurrency(340)}</div>
                          </div>
                          <div>
                            <div className="text-blue-700">Risk Utilization</div>
                            <div className="font-medium">68%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Settings</h2>
                    
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading Alerts</h3>
                        <div className="space-y-4">
                          {[
                            { key: 'newTrades', label: 'New Trades', desc: 'Get notified when traders you follow open new positions' },
                            { key: 'profitLoss', label: 'Profit & Loss Updates', desc: 'Notifications for significant P&L changes' },
                            { key: 'riskAlerts', label: 'Risk Alerts', desc: 'Warning when approaching risk limits' },
                          ].map(({ key, label, desc }) => (
                            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">{label}</div>
                                <div className="text-sm text-gray-600">{desc}</div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.notifications[key as keyof typeof settings.notifications]}
                                  onChange={(e) => handleSettingsChange('notifications', key, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Methods</h3>
                        <div className="space-y-4">
                          {[
                            { key: 'email', label: 'Email Notifications', desc: 'Receive alerts via email' },
                            { key: 'push', label: 'Push Notifications', desc: 'Browser and mobile push notifications' },
                          ].map(({ key, label, desc }) => (
                            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">{label}</div>
                                <div className="text-sm text-gray-600">{desc}</div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.notifications[key as keyof typeof settings.notifications]}
                                  onChange={(e) => handleSettingsChange('notifications', key, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Copy Trading Tab */}
                {activeTab === 'copy-trading' && (
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Copy Trading Settings</h2>
                    
                    <div className="space-y-8">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="text-green-600 text-xl mr-3">💡</div>
                          <div>
                            <h3 className="font-medium text-green-800 mb-1">Pro Tip</h3>
                            <p className="text-sm text-green-700">
                              Diversify your copy trading by following multiple traders with different strategies.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Follow Settings</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">Auto-Follow New Traders</div>
                                <div className="text-sm text-gray-600">Automatically follow top-ranked traders</div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.copyTrading.autoFollow}
                                  onChange={(e) => handleSettingsChange('copyTrading', 'autoFollow', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Trader Rank
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={settings.copyTrading.minTraderRank}
                                onChange={(e) => handleSettingsChange('copyTrading', 'minTraderRank', parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <p className="text-xs text-gray-600 mt-1">Only auto-follow traders ranked this high or better</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Allocation</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Followed Traders
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="20"
                                value={settings.copyTrading.maxTraders}
                                onChange={(e) => handleSettingsChange('copyTrading', 'maxTraders', parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <p className="text-xs text-gray-600 mt-1">Maximum number of traders to follow simultaneously</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Diversification Ratio (%)
                              </label>
                              <input
                                type="number"
                                min="5"
                                max="50"
                                value={settings.copyTrading.diversificationRatio}
                                onChange={(e) => handleSettingsChange('copyTrading', 'diversificationRatio', parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <p className="text-xs text-gray-600 mt-1">Maximum allocation per single trader</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Current Copy Trading Status</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-blue-700">Active Traders</div>
                            <div className="font-medium">2 of {settings.copyTrading.maxTraders}</div>
                          </div>
                          <div>
                            <div className="text-blue-700">Total Allocated</div>
                            <div className="font-medium">{formatCurrency(15000)}</div>
                          </div>
                          <div>
                            <div className="text-blue-700">Copy Trading P&L</div>
                            <div className="font-medium text-green-600">+{formatCurrency(1430)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* API Keys Tab */}
                {activeTab === 'api' && (
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">API Key Management</h2>
                    
                    <div className="space-y-8">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="text-red-600 text-xl mr-3">🔒</div>
                          <div>
                            <h3 className="font-medium text-red-800 mb-1">Security Warning</h3>
                            <p className="text-sm text-red-700">
                              Never share your API keys with anyone. Store them securely and rotate them regularly.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Your API Keys</h3>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm">
                            Generate New Key
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="font-medium text-gray-900">Trading API Key</div>
                                <div className="text-sm text-gray-600">Created on March 15, 2024</div>
                              </div>
                              <div className="flex gap-2">
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                  View
                                </button>
                                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                                  Revoke
                                </button>
                              </div>
                            </div>
                            <div className="bg-white rounded border p-3 font-mono text-sm text-gray-600">
                              sk_test_************************a8b2
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Active
                              </span>
                              <span>Last used: 2 hours ago</span>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="font-medium text-gray-900">Webhook API Key</div>
                                <div className="text-sm text-gray-600">Created on February 28, 2024</div>
                              </div>
                              <div className="flex gap-2">
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                  View
                                </button>
                                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                                  Revoke
                                </button>
                              </div>
                            </div>
                            <div className="bg-white rounded border p-3 font-mono text-sm text-gray-600">
                              wh_test_************************c9d4
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                Unused
                              </span>
                              <span>Never used</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Usage</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-gray-900">1,247</div>
                              <div className="text-sm text-gray-600">Requests Today</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-gray-900">98.9%</div>
                              <div className="text-sm text-gray-600">Success Rate</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-gray-900">4,750</div>
                              <div className="text-sm text-gray-600">Monthly Limit</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing Tab */}
                {activeTab === 'billing' && (
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing & Subscription</h2>
                    
                    <div className="space-y-8">
                      {/* Current Plan */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">Pro Plan</h4>
                              <p className="text-gray-600">Full access to copy trading features</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">$29</div>
                              <div className="text-sm text-gray-600">per month</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {[
                              'Follow up to 10 traders',
                              'Real-time notifications',
                              'Advanced risk management',
                              'Priority support',
                            ].map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {feature}
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex gap-3">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm">
                              Manage Plan
                            </button>
                            <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm">
                              Cancel Subscription
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">•••• •••• •••• 4242</div>
                                <div className="text-sm text-gray-600">Expires 12/27</div>
                              </div>
                            </div>
                            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                              Update
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Billing History */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Invoice
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {[
                                { date: '2024-03-01', desc: 'Pro Plan - March 2024', amount: '$29.00', status: 'Paid' },
                                { date: '2024-02-01', desc: 'Pro Plan - February 2024', amount: '$29.00', status: 'Paid' },
                                { date: '2024-01-01', desc: 'Pro Plan - January 2024', amount: '$29.00', status: 'Paid' },
                              ].map((invoice, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {invoice.date}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {invoice.desc}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {invoice.amount}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                      {invoice.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                                      Download
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SettingsPage;