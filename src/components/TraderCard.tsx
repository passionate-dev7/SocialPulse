import React from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Trader } from '../types';
import { useFollowTrader, useUnfollowTrader } from '../hooks/useTraders';

interface TraderCardProps {
  trader: Trader;
  onCopyTrade?: (trader: Trader) => void;
}

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

const TraderInfo = styled.div`
  flex: 1;
`;

const TraderName = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VerificationBadge = styled.span`
  color: #059669;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
`;

const FollowerCount = styled.p`
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #6b7280;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const MetricItem = styled.div`
  text-align: center;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  font-weight: 500;
`;

const MetricValue = styled.div<{ positive?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.positive === false ? '#dc2626' : props.positive ? '#059669' : '#111827'};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.variant === 'primary' ? css`
    background: #3b82f6;
    color: white;
    
    &:hover:not(:disabled) {
      background: #2563eb;
    }
  ` : css`
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover:not(:disabled) {
      background: #e5e7eb;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const MiniChart = styled.div`
  height: 60px;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  border-radius: 8px;
  margin: 16px 0;
  display: flex;
  align-items: end;
  padding: 8px;
  position: relative;
  overflow: hidden;
`;

const ChartBar = styled.div<{ height: number }>`
  flex: 1;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 1px;
  border-radius: 1px;
  height: ${props => props.height}%;
  transition: height 0.3s ease;
`;

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatPercentage = (value: number) => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const TraderCard: React.FC<TraderCardProps> = ({ trader, onCopyTrade }) => {
  const { followTrader } = useFollowTrader();
  const { unfollowTrader } = useUnfollowTrader();

  const handleFollowClick = () => {
    if (trader.isFollowing) {
      unfollowTrader(trader.id);
    } else {
      followTrader(trader.id);
    }
  };

  const handleCopyTradeClick = () => {
    onCopyTrade?.(trader);
  };

  // Generate mini chart data from performance
  const chartData = trader.performance.slice(-7).map(p => p.pnl);
  const maxPnl = Math.max(...chartData);
  const minPnl = Math.min(...chartData);
  const range = maxPnl - minPnl;

  return (
    <Card role="article" aria-label={`Trader card for ${trader.name}`}>
      <Header>
        <Avatar 
          src={trader.avatar} 
          alt={`${trader.name}'s avatar`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/default-avatar.png';
          }}
        />
        <TraderInfo>
          <TraderName>
            {trader.name}
            {trader.isVerified && (
              <VerificationBadge title="Verified trader">
                ✓
              </VerificationBadge>
            )}
          </TraderName>
          <FollowerCount>{trader.followers.toLocaleString()} followers</FollowerCount>
        </TraderInfo>
      </Header>

      <MetricsGrid>
        <MetricItem>
          <MetricLabel>PnL</MetricLabel>
          <MetricValue positive={trader.pnl > 0}>
            {formatCurrency(trader.pnl)}
          </MetricValue>
        </MetricItem>
        <MetricItem>
          <MetricLabel>ROI</MetricLabel>
          <MetricValue positive={trader.roi > 0}>
            {formatPercentage(trader.roi)}
          </MetricValue>
        </MetricItem>
        <MetricItem>
          <MetricLabel>Win Rate</MetricLabel>
          <MetricValue>{trader.winRate.toFixed(1)}%</MetricValue>
        </MetricItem>
        <MetricItem>
          <MetricLabel>Sharpe Ratio</MetricLabel>
          <MetricValue>{trader.sharpeRatio.toFixed(2)}</MetricValue>
        </MetricItem>
      </MetricsGrid>

      <MiniChart aria-label="Performance chart">
        {chartData.map((value, index) => (
          <ChartBar
            key={index}
            height={range > 0 ? ((value - minPnl) / range) * 100 : 50}
            title={`Day ${index + 1}: ${formatCurrency(value)}`}
          />
        ))}
      </MiniChart>

      <div>
        <MetricLabel>AUM: {formatCurrency(trader.aum)} • Strategy: {trader.strategy}</MetricLabel>
      </div>

      <ButtonGroup>
        <Button
          variant="secondary"
          onClick={handleFollowClick}
          disabled={false}
          aria-label={trader.isFollowing ? 'Unfollow trader' : 'Follow trader'}
        >
          {trader.isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
        <Button
          variant="primary"
          onClick={handleCopyTradeClick}
          aria-label="Copy trade this trader"
        >
          Copy Trade
        </Button>
      </ButtonGroup>
    </Card>
  );
};