import React, { useState, useMemo, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { Trader, PerformanceData } from '../types';

interface PerformanceChartProps {
  traders: Trader[];
  timeframe?: '7d' | '30d' | '90d' | '1y';
  height?: number;
  showComparison?: boolean;
  onTimeframeChange?: (timeframe: string) => void;
}

const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const Title = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const Controls = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

const TimeframeButtons = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
`;

const TimeframeButton = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#3b82f6' : '#6b7280'};
  box-shadow: ${props => props.active ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'};
  
  &:hover {
    color: #3b82f6;
  }
`;

const TraderLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
`;

const LegendItem = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  opacity: ${props => props.active ? 1 : 0.5};
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

const ColorDot = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const LegendLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const ChartContainer = styled.div<{ height: number }>`
  padding: 20px;
  height: ${props => props.height}px;
  position: relative;
`;

const SVGChart = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

const GridLine = styled.line`
  stroke: #f3f4f6;
  stroke-width: 1;
`;

const ChartLine = styled.path<{ color: string; active: boolean }>`
  fill: none;
  stroke: ${props => props.color};
  stroke-width: ${props => props.active ? '3' : '2'};
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: ${props => props.active ? 1 : 0.3};
  transition: all 0.2s;
  
  &:hover {
    stroke-width: 3;
    opacity: 1;
  }
`;

const ChartArea = styled.path<{ color: string; active: boolean }>`
  fill: ${props => props.color};
  fill-opacity: ${props => props.active ? 0.1 : 0.05};
  transition: all 0.2s;
`;

const Tooltip = styled.div<{ x: number; y: number; visible: boolean }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background: #111827;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  pointer-events: none;
  transform: translate(-50%, -100%);
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.2s;
  z-index: 10;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    border: 4px solid transparent;
    border-top-color: #111827;
    transform: translateX(-50%);
  }
`;

const AxisLabel = styled.text`
  font-size: 10px;
  fill: #6b7280;
  text-anchor: middle;
  dominant-baseline: central;
`;

const StatsGrid = styled.div`
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const StatValue = styled.div<{ positive?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => 
    props.positive === false ? '#dc2626' : 
    props.positive ? '#059669' : 
    '#111827'
  };
`;

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
    <Container ref={containerRef}>
      <Header>
        <Title>Performance Chart</Title>
        <Controls>
          <TimeframeButtons>
            {TIMEFRAMES.map(tf => (
              <TimeframeButton
                key={tf.key}
                active={selectedTimeframe === tf.key}
                onClick={() => handleTimeframeChange(tf.key)}
                aria-label={`Show ${tf.label} timeframe`}
              >
                {tf.label}
              </TimeframeButton>
            ))}
          </TimeframeButtons>
          
          {showComparison && (
            <TraderLegend>
              {chartData.map((trader, index) => (
                <LegendItem
                  key={trader.id}
                  active={activeTraders.includes(trader.id)}
                  onClick={() => toggleTrader(trader.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Toggle ${trader.name} on chart`}
                >
                  <ColorDot color={CHART_COLORS[index % CHART_COLORS.length]} />
                  <LegendLabel>{trader.name}</LegendLabel>
                </LegendItem>
              ))}
            </TraderLegend>
          )}
        </Controls>
      </Header>

      <ChartContainer height={height}>
        <SVGChart
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          role="img"
          aria-label="Performance chart showing trader returns over time"
        >
          {/* Grid lines */}
          {Array.from({ length: 6 }, (_, i) => (
            <GridLine
              key={`grid-y-${i}`}
              x1={padding}
              y1={padding + (i * (chartHeight - 2 * padding)) / 5}
              x2={chartWidth - padding}
              y2={padding + (i * (chartHeight - 2 * padding)) / 5}
            />
          ))}
          
          {Array.from({ length: 6 }, (_, i) => (
            <GridLine
              key={`grid-x-${i}`}
              x1={padding + (i * (chartWidth - 2 * padding)) / 5}
              y1={padding}
              x2={padding + (i * (chartWidth - 2 * padding)) / 5}
              y2={chartHeight - padding}
            />
          ))}

          {/* Y-axis labels */}
          {Array.from({ length: 6 }, (_, i) => {
            const value = chartBounds.maxY - (i * (chartBounds.maxY - chartBounds.minY)) / 5;
            return (
              <AxisLabel
                key={`y-label-${i}`}
                x={padding - 10}
                y={padding + (i * (chartHeight - 2 * padding)) / 5}
              >
                {formatCurrency(value)}
              </AxisLabel>
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
                <ChartArea
                  d={areaPath}
                  color={color}
                  active={isActive}
                />
                <ChartLine
                  d={linePath}
                  color={color}
                  active={isActive}
                />
              </g>
            );
          })}
        </SVGChart>

        <Tooltip
          x={tooltip.x}
          y={tooltip.y}
          visible={tooltip.visible}
        >
          {tooltip.content.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </Tooltip>
      </ChartContainer>

      <StatsGrid>
        {chartData
          .filter(trader => activeTraders.includes(trader.id))
          .map(trader => {
            const startValue = trader.data[0]?.pnl || 0;
            const endValue = trader.data[trader.data.length - 1]?.pnl || 0;
            const totalReturn = endValue - startValue;
            const returnPct = startValue !== 0 ? (totalReturn / Math.abs(startValue)) * 100 : 0;

            return (
              <React.Fragment key={trader.id}>
                <StatItem>
                  <StatLabel>{trader.name} - Return</StatLabel>
                  <StatValue positive={totalReturn > 0}>
                    {formatPercentage(returnPct)}
                  </StatValue>
                </StatItem>
              </React.Fragment>
            );
          })}
      </StatsGrid>
    </Container>
  );
};