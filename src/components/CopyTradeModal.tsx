import React, { useState, useMemo } from 'react';
import { Trader, CopyTradeSettings } from '../types';
import { X, AlertCircle, TrendingUp, DollarSign, Shield } from 'lucide-react';

interface CopyTradeModalProps {
  trader: Trader;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (settings: CopyTradeSettings) => void;
  portfolioBalance?: number;
}

export const CopyTradeModal: React.FC<CopyTradeModalProps> = ({
  trader,
  isOpen,
  onClose,
  onConfirm,
  portfolioBalance = 10000
}) => {
  const [settings, setSettings] = useState<CopyTradeSettings>({
    traderId: trader.address,
    amount: 1000,
    maxDrawdown: 10,
    copyPercentage: 100,
    takeProfitPercentage: 50,
    stopLossPercentage: 10,
    maxPositions: 5,
    autoCopyNewTrades: true,
    copyExistingPositions: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateSettings = () => {
    const newErrors: Record<string, string> = {};

    if (settings.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (settings.amount > portfolioBalance) {
      newErrors.amount = 'Amount exceeds available balance';
    }
    if (settings.maxDrawdown <= 0 || settings.maxDrawdown > 100) {
      newErrors.maxDrawdown = 'Max drawdown must be between 1-100%';
    }
    if (settings.copyPercentage <= 0 || settings.copyPercentage > 100) {
      newErrors.copyPercentage = 'Copy percentage must be between 1-100%';
    }
    if (settings.maxPositions < 1 || settings.maxPositions > 20) {
      newErrors.maxPositions = 'Max positions must be between 1-20';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateSettings()) {
      onConfirm(settings);
      onClose();
    }
  };

  const estimatedMonthlyProfit = useMemo(() => {
    return (settings.amount * (trader.monthlyReturn / 100)).toFixed(2);
  }, [settings.amount, trader.monthlyReturn]);

  const maxPotentialLoss = useMemo(() => {
    return (settings.amount * (settings.maxDrawdown / 100)).toFixed(2);
  }, [settings.amount, settings.maxDrawdown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Copy Trading Setup</h2>
            <p className="text-sm text-gray-600 mt-1">Configure your copy trading parameters for {trader.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Trader Info */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{trader.name}</h3>
              <p className="text-sm text-gray-600">{trader.address}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">+{trader.totalReturn.toFixed(2)}%</div>
              <div className="text-sm text-gray-600">Total Return</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600">Win Rate</div>
              <div className="font-semibold text-gray-900">{trader.winRate.toFixed(1)}%</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600">Monthly</div>
              <div className={`font-semibold ${trader.monthlyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trader.monthlyReturn >= 0 ? '+' : ''}{trader.monthlyReturn.toFixed(2)}%
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600">Trades</div>
              <div className="font-semibold text-gray-900">{trader.totalTrades}</div>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="p-6 space-y-6">
          {/* Investment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Investment Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={settings.amount}
                onChange={(e) => setSettings({ ...settings, amount: Number(e.target.value) })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter amount to invest"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                USDC
              </span>
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Available balance: ${portfolioBalance.toLocaleString()}
            </p>
          </div>

          {/* Copy Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TrendingUp className="inline w-4 h-4 mr-1" />
              Position Size Ratio
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={settings.copyPercentage}
                onChange={(e) => setSettings({ ...settings, copyPercentage: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="w-16 text-center font-semibold text-gray-900">
                {settings.copyPercentage}%
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Percentage of trader's position size to copy
            </p>
          </div>

          {/* Risk Management */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Risk Management
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Drawdown (%)
                </label>
                <input
                  type="number"
                  value={settings.maxDrawdown}
                  onChange={(e) => setSettings({ ...settings, maxDrawdown: Number(e.target.value) })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.maxDrawdown ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="1"
                  max="100"
                />
                {errors.maxDrawdown && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxDrawdown}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Positions
                </label>
                <input
                  type="number"
                  value={settings.maxPositions}
                  onChange={(e) => setSettings({ ...settings, maxPositions: Number(e.target.value) })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.maxPositions ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="1"
                  max="20"
                />
                {errors.maxPositions && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxPositions}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Take Profit (%)
                </label>
                <input
                  type="number"
                  value={settings.takeProfitPercentage}
                  onChange={(e) => setSettings({ ...settings, takeProfitPercentage: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stop Loss (%)
                </label>
                <input
                  type="number"
                  value={settings.stopLossPercentage}
                  onChange={(e) => setSettings({ ...settings, stopLossPercentage: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.autoCopyNewTrades}
                onChange={(e) => setSettings({ ...settings, autoCopyNewTrades: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Automatically copy new trades</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.copyExistingPositions}
                onChange={(e) => setSettings({ ...settings, copyExistingPositions: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Copy existing open positions</span>
            </label>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
              Investment Summary
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Monthly Profit:</span>
                <span className="font-semibold text-green-600">+${estimatedMonthlyProfit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Maximum Risk:</span>
                <span className="font-semibold text-red-600">-${maxPotentialLoss}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Copy Trading
          </button>
        </div>
      </div>
    </div>
  );
};