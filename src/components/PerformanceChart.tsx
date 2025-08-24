import React, { useState, useMemo, useRef } from 'react';
import { BarChart3, Download, Eye, EyeOff } from 'lucide-react';
import { Trader, PerformanceData } from '../types';

interface PerformanceChartProps {
  traders: Trader[];
  timeframe?: '7d' | '30d' | '90d' | '1y';
  height?: number;
  showComparison?: boolean;
  onTimeframeChange?: (timeframe: string) => void;
}

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
];

const TIMEFRAMES = [
  { key: '7d', label: '7D', days: 7 },
  { key: '30d', label: '30D', days: 30 },
  { key: '90d', label: '90D', days: 90 },
  { key: '1y', label: '1Y', days: 365 }
];

const formatCurrency = (value: number, compact = true) => {
  if (compact) {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const generatePath = (points: [number, number][]): string => {
  if (points.length === 0) return '';
  
  return points.reduce((path, point, index) => {
    const [x, y] = point;
    if (index === 0) {
      return `M ${x} ${y}`;
    } else {
      const prevPoint = points[index - 1];
      const cpx1 = prevPoint[0] + (x - prevPoint[0]) * 0.4;
      const cpx2 = x - (x - prevPoint[0]) * 0.4;
      return `${path} C ${cpx1} ${prevPoint[1]}, ${cpx2} ${y}, ${x} ${y}`;
    }
  }, '');
};

const generateAreaPath = (points: [number, number][], height: number): string => {
  if (points.length === 0) return '';
  
  const linePath = generatePath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  
  return `${linePath} L ${lastPoint[0]} ${height} L ${firstPoint[0]} ${height} Z`;
};

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  traders,
  timeframe = '30d',
  height = 400,
  showComparison = true,
  onTimeframeChange
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [activeTraders, setActiveTraders] = useState<string[]>(
    traders.slice(0, 3).map(t => t.id) // Show first 3 by default
  );
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: ''
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const chartData = useMemo(() => {
    const days = TIMEFRAMES.find(tf => tf.key === selectedTimeframe)?.days || 30;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    return traders.map(trader => {
      // Filter performance data for the selected timeframe
      const filteredData = trader.performance.filter(p => {
        const date = new Date(p.date);
        return date >= startDate && date <= endDate;
      });

      // Generate synthetic data if not enough historical data
      if (filteredData.length < days) {
        const syntheticData: PerformanceData[] = [];
        const dailyReturn = trader.roi / (365 / days); // Assume annual ROI spread over timeframe
        let currentValue = 100000; // Starting value

        for (let i = 0; i < days; i++) {
          const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          const randomFactor = 0.8 + Math.random() * 0.4; // ±20% variation
          const dailyChange = (dailyReturn / 100) * currentValue * randomFactor;
          currentValue += dailyChange;
          
          syntheticData.push({
            date: date.toISOString(),
            value: currentValue,
            pnl: currentValue - 100000,
            cumulativeReturn: ((currentValue - 100000) / 100000) * 100
          });
        }
        return { ...trader, data: syntheticData };
      }

      return { ...trader, data: filteredData };
    });
  }, [traders, selectedTimeframe]);

  const chartBounds = useMemo(() => {
    const allValues = chartData.flatMap(trader => trader.data.map(d => d.pnl));
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const padding = (maxValue - minValue) * 0.1;

    return {
      minX: 0,
      maxX: chartData[0]?.data.length - 1 || 0,
      minY: minValue - padding,
      maxY: maxValue + padding
    };
  }, [chartData]);

  const handleTimeframeChange = (newTimeframe: string) => {
    setSelectedTimeframe(newTimeframe as '7d' | '30d' | '90d' | '1y');
    onTimeframeChange?.(newTimeframe);
  };

  const toggleTrader = (traderId: string) => {
    setActiveTraders(prev =>
      prev.includes(traderId)
        ? prev.filter(id => id !== traderId)
        : [...prev, traderId]
    );
  };

  const handleMouseMove = (event: React.MouseEvent<SVGElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const chartRect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - chartRect.left;
    const y = event.clientY - chartRect.top;
    
    // Calculate which data point we're hovering over
    const chartWidth = chartRect.width - 80; // Account for padding
    const dataIndex = Math.round((x - 40) / chartWidth * (chartBounds.maxX));
    
    if (dataIndex >= 0 && dataIndex < chartData[0]?.data.length) {
      const activeTraderData = chartData
        .filter(trader => activeTraders.includes(trader.id))
        .map(trader => ({
          name: trader.name,
          value: trader.data[dataIndex]?.pnl || 0,
          color: CHART_COLORS[chartData.indexOf(trader) % CHART_COLORS.length]
        }));

      if (activeTraderData.length > 0) {
        const date = new Date(chartData[0].data[dataIndex]?.date || Date.now());
        const tooltipContent = `
          ${date.toLocaleDateString()}
          ${activeTraderData.map(item => 
            `${item.name}: ${formatCurrency(item.value)}`
          ).join('\n')}
        `;

        setTooltip({
          visible: true,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          content: tooltipContent
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const chartWidth = 600;
  const chartHeight = height - 100;
  const padding = 40;

  return (
    <div ref={containerRef} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="m-0 text-lg font-semibold text-gray-900">Performance Chart</h3>
        </div>
        <div className="flex flex-wrap justify-between items-center gap-3">
          {/* Timeframe Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.key}
                onClick={() => handleTimeframeChange(tf.key)}
                aria-label={`Show ${tf.label} timeframe`}
                className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ${
                  selectedTimeframe === tf.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
          
          {/* Trader Legend */}
          {showComparison && (
            <div className="flex flex-wrap gap-4 items-center">
              {chartData.map((trader, index) => {
                const isActive = activeTraders.includes(trader.id);
                return (
                  <div
                    key={trader.id}
                    onClick={() => toggleTrader(trader.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Toggle ${trader.name} on chart`}
                    className={`flex items-center gap-2 cursor-pointer transition-opacity duration-200 ${
                      isActive ? 'opacity-100' : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-gray-700">{trader.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-5 relative" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          role="img"
          aria-label="Performance chart showing trader returns over time"
          className="overflow-visible"
        >
          {/* Grid lines */}
          {Array.from({ length: 6 }, (_, i) => (
            <line
              key={`grid-y-${i}`}
              x1={padding}
              y1={padding + (i * (chartHeight - 2 * padding)) / 5}
              x2={chartWidth - padding}
              y2={padding + (i * (chartHeight - 2 * padding)) / 5}
              stroke="#f3f4f6"
              strokeWidth={1}
            />
          ))}
          
          {Array.from({ length: 6 }, (_, i) => (
            <line
              key={`grid-x-${i}`}
              x1={padding + (i * (chartWidth - 2 * padding)) / 5}
              y1={padding}
              x2={padding + (i * (chartWidth - 2 * padding)) / 5}
              y2={chartHeight - padding}
              stroke="#f3f4f6"
              strokeWidth={1}
            />
          ))}

          {/* Y-axis labels */}
          {Array.from({ length: 6 }, (_, i) => {
            const value = chartBounds.maxY - (i * (chartBounds.maxY - chartBounds.minY)) / 5;
            return (
              <text
                key={`y-label-${i}`}
                x={padding - 10}
                y={padding + (i * (chartHeight - 2 * padding)) / 5}
                fontSize={10}
                fill="#6b7280"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {formatCurrency(value)}
              </text>
            );
          })}

          {/* Chart lines and areas */}
          {chartData.map((trader, traderIndex) => {
            const color = CHART_COLORS[traderIndex % CHART_COLORS.length];
            const isActive = activeTraders.includes(trader.id);
            
            if (!isActive && showComparison) return null;

            const points: [number, number][] = trader.data.map((point, index) => {
              const x = padding + (index / (chartBounds.maxX || 1)) * (chartWidth - 2 * padding);
              const y = padding + (1 - (point.pnl - chartBounds.minY) / (chartBounds.maxY - chartBounds.minY)) * (chartHeight - 2 * padding);
              return [x, y];
            });

            const linePath = generatePath(points);
            const areaPath = generateAreaPath(points, chartHeight - padding);

            return (
              <g key={trader.id}>
                <path
                  d={areaPath}
                  fill={color}
                  fillOpacity={isActive ? 0.1 : 0.05}
                  className="transition-all duration-200"
                />
                <path
                  d={linePath}
                  fill="none"
                  stroke={color}
                  strokeWidth={isActive ? 3 : 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isActive ? 1 : 0.3}
                  className="transition-all duration-200 hover:stroke-[3] hover:opacity-100"
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip.visible && (
          <div 
            className="absolute bg-gray-900 text-white px-3 py-2 rounded-md text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full z-10 opacity-100 transition-opacity duration-200"
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          >
            {tooltip.content.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
            <div className="absolute top-full left-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 transform -translate-x-1/2" />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="p-5 border-t border-gray-200 bg-gray-50 grid grid-cols-2 md:grid-cols-4 gap-4">
        {chartData
          .filter(trader => activeTraders.includes(trader.id))
          .map(trader => {
            const startValue = trader.data[0]?.pnl || 0;
            const endValue = trader.data[trader.data.length - 1]?.pnl || 0;
            const totalReturn = endValue - startValue;
            const returnPct = startValue !== 0 ? (totalReturn / Math.abs(startValue)) * 100 : 0;

            return (
              <div key={trader.id} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{trader.name} - Return</div>
                <div className={`text-base font-semibold ${
                  totalReturn > 0 ? 'text-emerald-600' : totalReturn < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatPercentage(returnPct)}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};