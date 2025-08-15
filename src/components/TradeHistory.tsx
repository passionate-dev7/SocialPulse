import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { Trade } from '../types';

interface TradeHistoryProps {
  trades: Trade[];
  traderId?: string;
  showTraderColumn?: boolean;
  onExport?: () => void;
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
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
`;

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #374151;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ExportButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e5e7eb;
  
  &:hover {
    background: #f9fafb;
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  border-bottom: 2px solid #e5e7eb;
`;

const TableCell = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: #374151;
  white-space: nowrap;
`;

const StatusBadge = styled.span<{ status: 'open' | 'closed' }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  
  ${props => props.status === 'open' ? css`
    background: #dbeafe;
    color: #1d4ed8;
  ` : css`
    background: #d1fae5;
    color: #065f46;
  `}
`;

const SideBadge = styled.span<{ side: 'long' | 'short' }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  
  ${props => props.side === 'long' ? css`
    background: #d1fae5;
    color: #065f46;
  ` : css`
    background: #fecaca;
    color: #991b1b;
  `}
`;

const PnLValue = styled.span<{ value: number }>`
  font-weight: 500;
  color: ${props => props.value > 0 ? '#059669' : props.value < 0 ? '#dc2626' : '#6b7280'};
`;

const AssetIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
`;

const LoadingState = styled.div`
  padding: 40px;
  text-align: center;
  color: #6b7280;
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #6b7280;
`;

const Summary = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
`;

const SummaryItem = styled.div`
  text-align: center;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const SummaryValue = styled.div<{ positive?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => 
    props.positive === false ? '#dc2626' : 
    props.positive ? '#059669' : 
    '#111827'
  };
`;

const POPULAR_ASSETS = ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC', 'LINK', 'UNI', 'AAVE', 'DOT', 'ADA'];

// Mock data generator for demonstration
const generateMockTrades = (count: number): Trade[] => {
  const trades: Trade[] = [];
  
  for (let i = 0; i < count; i++) {
    const asset = POPULAR_ASSETS[Math.floor(Math.random() * POPULAR_ASSETS.length)];
    const side = Math.random() > 0.5 ? 'long' : 'short';
    const size = Math.random() * 1000 + 100;
    const entryPrice = Math.random() * 50000 + 1000;
    const isOpen = Math.random() > 0.7;
    const exitPrice = isOpen ? undefined : entryPrice * (0.8 + Math.random() * 0.4);
    const pnl = isOpen ? undefined : side === 'long' 
      ? (exitPrice! - entryPrice) * size 
      : (entryPrice - exitPrice!) * size;
    
    trades.push({
      id: `trade-${i}`,
      traderId: 'trader-1',
      asset,
      side,
      size,
      entryPrice,
      exitPrice,
      pnl,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: isOpen ? 'open' : 'closed'
    });
  }
  
  return trades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const formatCurrency = (value: number, compact = false) => {
  if (compact && Math.abs(value) >= 1000) {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const TradeHistory: React.FC<TradeHistoryProps> = ({
  trades: propTrades,
  traderId,
  showTraderColumn = false,
  onExport
}) => {
  // Use mock data if no trades provided
  const allTrades = useMemo(() => 
    propTrades.length > 0 ? propTrades : generateMockTrades(50),
    [propTrades]
  );

  const [filters, setFilters] = useState({
    asset: 'all',
    side: 'all',
    status: 'all',
    pnl: 'all', // all, profit, loss
    search: ''
  });

  const filteredTrades = useMemo(() => {
    return allTrades.filter(trade => {
      if (traderId && trade.traderId !== traderId) return false;
      if (filters.asset !== 'all' && trade.asset !== filters.asset) return false;
      if (filters.side !== 'all' && trade.side !== filters.side) return false;
      if (filters.status !== 'all' && trade.status !== filters.status) return false;
      if (filters.pnl !== 'all') {
        if (filters.pnl === 'profit' && (trade.pnl || 0) <= 0) return false;
        if (filters.pnl === 'loss' && (trade.pnl || 0) >= 0) return false;
      }
      if (filters.search && !trade.asset.toLowerCase().includes(filters.search.toLowerCase())) return false;
      
      return true;
    });
  }, [allTrades, traderId, filters]);

  const summary = useMemo(() => {
    const closedTrades = filteredTrades.filter(t => t.status === 'closed' && t.pnl !== undefined);
    const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    const totalVolume = filteredTrades.reduce((sum, trade) => sum + trade.size * trade.entryPrice, 0);
    
    return {
      totalTrades: filteredTrades.length,
      totalPnL,
      winRate,
      totalVolume
    };
  }, [filteredTrades]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Asset', 'Side', 'Size', 'Entry Price', 'Exit Price', 'PnL', 'Status'].join(','),
      ...filteredTrades.map(trade => [
        formatDate(trade.timestamp),
        trade.asset,
        trade.side,
        trade.size.toFixed(2),
        trade.entryPrice.toFixed(2),
        trade.exitPrice?.toFixed(2) || '',
        trade.pnl?.toFixed(2) || '',
        trade.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trades_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    onExport?.();
  };

  const uniqueAssets = useMemo(() => {
    return Array.from(new Set(allTrades.map(t => t.asset))).sort();
  }, [allTrades]);

  return (
    <Container>
      <Header>
        <Title>Trade History</Title>
        <Controls>
          <Filters>
            <FilterGroup>
              <FilterLabel>Asset:</FilterLabel>
              <Select
                value={filters.asset}
                onChange={(e) => handleFilterChange('asset', e.target.value)}
                aria-label="Filter by asset"
              >
                <option value="all">All Assets</option>
                {uniqueAssets.map(asset => (
                  <option key={asset} value={asset}>{asset}</option>
                ))}
              </Select>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Side:</FilterLabel>
              <Select
                value={filters.side}
                onChange={(e) => handleFilterChange('side', e.target.value)}
                aria-label="Filter by side"
              >
                <option value="all">All Sides</option>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </Select>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Status:</FilterLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </Select>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>PnL:</FilterLabel>
              <Select
                value={filters.pnl}
                onChange={(e) => handleFilterChange('pnl', e.target.value)}
                aria-label="Filter by PnL"
              >
                <option value="all">All</option>
                <option value="profit">Profit</option>
                <option value="loss">Loss</option>
              </Select>
            </FilterGroup>
            
            <SearchInput
              type="text"
              placeholder="Search assets..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              aria-label="Search trades"
            />
          </Filters>
          
          <ExportButton onClick={handleExport} aria-label="Export trades to CSV">
            Export CSV
          </ExportButton>
        </Controls>
      </Header>

      <TableContainer>
        {filteredTrades.length === 0 ? (
          <EmptyState>
            No trades found matching your criteria.
          </EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Asset</TableHeaderCell>
                <TableHeaderCell>Side</TableHeaderCell>
                <TableHeaderCell>Size</TableHeaderCell>
                <TableHeaderCell>Entry Price</TableHeaderCell>
                <TableHeaderCell>Exit Price</TableHeaderCell>
                <TableHeaderCell>PnL</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredTrades.map(trade => (
                <TableRow key={trade.id}>
                  <TableCell>{formatDate(trade.timestamp)}</TableCell>
                  <TableCell>
                    <AssetIcon>
                      {trade.asset}
                    </AssetIcon>
                  </TableCell>
                  <TableCell>
                    <SideBadge side={trade.side}>
                      {trade.side}
                    </SideBadge>
                  </TableCell>
                  <TableCell>{trade.size.toFixed(2)}</TableCell>
                  <TableCell>{formatCurrency(trade.entryPrice)}</TableCell>
                  <TableCell>
                    {trade.exitPrice ? formatCurrency(trade.exitPrice) : '-'}
                  </TableCell>
                  <TableCell>
                    {trade.pnl !== undefined ? (
                      <PnLValue value={trade.pnl}>
                        {trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                      </PnLValue>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={trade.status}>
                      {trade.status}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </TableContainer>

      <Summary>
        <SummaryItem>
          <SummaryLabel>Total Trades</SummaryLabel>
          <SummaryValue>{summary.totalTrades}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Total PnL</SummaryLabel>
          <SummaryValue positive={summary.totalPnL > 0}>
            {summary.totalPnL > 0 ? '+' : ''}{formatCurrency(summary.totalPnL, true)}
          </SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Win Rate</SummaryLabel>
          <SummaryValue>{summary.winRate.toFixed(1)}%</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Total Volume</SummaryLabel>
          <SummaryValue>{formatCurrency(summary.totalVolume, true)}</SummaryValue>
        </SummaryItem>
      </Summary>
    </Container>
  );
};