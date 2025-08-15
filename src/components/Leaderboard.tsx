import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { Trader, LeaderboardFilters } from '../types';
import { useTraders } from '../hooks/useTraders';

interface LeaderboardProps {
  onTraderClick?: (trader: Trader) => void;
  onCopyTrade?: (trader: Trader) => void;
}

const Container = styled.div`
  background: #ffffff;
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

const Title = styled.h2`
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
`;

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
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
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f9fafb;
`;

const TableRow = styled.tr<{ clickable?: boolean }>`
  border-bottom: 1px solid #e5e7eb;
  
  ${props => props.clickable && css`
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background: #f9fafb;
    }
  `}
`;

const TableHeaderCell = styled.th<{ sortable?: boolean }>`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  
  ${props => props.sortable && css`
    cursor: pointer;
    user-select: none;
    
    &:hover {
      background: #f3f4f6;
    }
  `}
`;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #374151;
  white-space: nowrap;
`;

const TraderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const TraderDetails = styled.div`
  min-width: 0;
`;

const TraderName = styled.div`
  font-weight: 500;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const VerificationBadge = styled.span`
  color: #059669;
  font-size: 12px;
`;

const TraderStrategy = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const MetricValue = styled.div<{ positive?: boolean }>`
  font-weight: 500;
  color: ${props => props.positive === false ? '#dc2626' : props.positive ? '#059669' : '#111827'};
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`;

const LoadingState = styled.div`
  padding: 40px;
  text-align: center;
  color: #6b7280;
`;

const ErrorState = styled.div`
  padding: 40px;
  text-align: center;
  color: #dc2626;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const PaginationInfo = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationButton = styled.button<{ active?: boolean }>`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: ${props => props.active ? '#3b82f6' : 'white'};
  color: ${props => props.active ? 'white' : '#374151'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? '#2563eb' : '#f3f4f6'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SortIcon = styled.span<{ direction: 'asc' | 'desc' | null }>`
  margin-left: 4px;
  font-size: 10px;
  color: #6b7280;
  
  &::after {
    content: ${props => 
      props.direction === 'asc' ? '"▲"' :
      props.direction === 'desc' ? '"▼"' : '"↕"'
    };
  }
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

export const Leaderboard: React.FC<LeaderboardProps> = ({ onTraderClick, onCopyTrade }) => {
  const [filters, setFilters] = useState<LeaderboardFilters>({
    timeframe: '30d',
    strategy: 'all',
    search: '',
    sortBy: 'pnl',
    sortOrder: 'desc'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: traders, isLoading, error } = useTraders(filters);

  const paginatedTraders = useMemo(() => {
    if (!traders) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return traders.slice(startIndex, startIndex + itemsPerPage);
  }, [traders, currentPage]);

  const totalPages = Math.ceil((traders?.length || 0) / itemsPerPage);

  const handleFilterChange = (key: keyof LeaderboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSort = (column: keyof Trader) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortDirection = (column: keyof Trader) => {
    if (filters.sortBy !== column) return null;
    return filters.sortOrder;
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingState>Loading traders...</LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState>Failed to load traders. Please try again.</ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Trader Leaderboard</Title>
        <Filters>
          <FilterGroup>
            <FilterLabel>Timeframe:</FilterLabel>
            <Select
              value={filters.timeframe}
              onChange={(e) => handleFilterChange('timeframe', e.target.value)}
              aria-label="Filter by timeframe"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="all">All Time</option>
            </Select>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Strategy:</FilterLabel>
            <Select
              value={filters.strategy}
              onChange={(e) => handleFilterChange('strategy', e.target.value)}
              aria-label="Filter by strategy"
            >
              <option value="all">All Strategies</option>
              <option value="Momentum">Momentum</option>
              <option value="Arbitrage">Arbitrage</option>
              <option value="DeFi">DeFi</option>
              <option value="Swing">Swing Trading</option>
            </Select>
          </FilterGroup>
          
          <SearchInput
            type="text"
            placeholder="Search traders..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            aria-label="Search traders"
          />
        </Filters>
      </Header>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Rank</TableHeaderCell>
              <TableHeaderCell>Trader</TableHeaderCell>
              <TableHeaderCell 
                sortable 
                onClick={() => handleSort('pnl')}
                role="button"
                tabIndex={0}
                aria-label="Sort by PnL"
              >
                PnL
                <SortIcon direction={getSortDirection('pnl')} />
              </TableHeaderCell>
              <TableHeaderCell 
                sortable 
                onClick={() => handleSort('roi')}
                role="button"
                tabIndex={0}
                aria-label="Sort by ROI"
              >
                ROI
                <SortIcon direction={getSortDirection('roi')} />
              </TableHeaderCell>
              <TableHeaderCell 
                sortable 
                onClick={() => handleSort('winRate')}
                role="button"
                tabIndex={0}
                aria-label="Sort by Win Rate"
              >
                Win Rate
                <SortIcon direction={getSortDirection('winRate')} />
              </TableHeaderCell>
              <TableHeaderCell 
                sortable 
                onClick={() => handleSort('sharpeRatio')}
                role="button"
                tabIndex={0}
                aria-label="Sort by Sharpe Ratio"
              >
                Sharpe Ratio
                <SortIcon direction={getSortDirection('sharpeRatio')} />
              </TableHeaderCell>
              <TableHeaderCell 
                sortable 
                onClick={() => handleSort('followers')}
                role="button"
                tabIndex={0}
                aria-label="Sort by Followers"
              >
                Followers
                <SortIcon direction={getSortDirection('followers')} />
              </TableHeaderCell>
              <TableHeaderCell 
                sortable 
                onClick={() => handleSort('aum')}
                role="button"
                tabIndex={0}
                aria-label="Sort by AUM"
              >
                AUM
                <SortIcon direction={getSortDirection('aum')} />
              </TableHeaderCell>
              <TableHeaderCell>Action</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {paginatedTraders.map((trader, index) => (
              <TableRow
                key={trader.id}
                clickable={!!onTraderClick}
                onClick={() => onTraderClick?.(trader)}
                role={onTraderClick ? "button" : undefined}
                tabIndex={onTraderClick ? 0 : undefined}
                aria-label={onTraderClick ? `View ${trader.name}'s profile` : undefined}
              >
                <TableCell>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell>
                  <TraderInfo>
                    <Avatar 
                      src={trader.avatar} 
                      alt={`${trader.name}'s avatar`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                      }}
                    />
                    <TraderDetails>
                      <TraderName>
                        {trader.name}
                        {trader.isVerified && (
                          <VerificationBadge title="Verified trader">✓</VerificationBadge>
                        )}
                      </TraderName>
                      <TraderStrategy>{trader.strategy}</TraderStrategy>
                    </TraderDetails>
                  </TraderInfo>
                </TableCell>
                <TableCell>
                  <MetricValue positive={trader.pnl > 0}>
                    {formatCurrency(trader.pnl)}
                  </MetricValue>
                </TableCell>
                <TableCell>
                  <MetricValue positive={trader.roi > 0}>
                    {formatPercentage(trader.roi)}
                  </MetricValue>
                </TableCell>
                <TableCell>
                  <MetricValue>{trader.winRate.toFixed(1)}%</MetricValue>
                </TableCell>
                <TableCell>
                  <MetricValue>{trader.sharpeRatio.toFixed(2)}</MetricValue>
                </TableCell>
                <TableCell>
                  <MetricValue>{trader.followers.toLocaleString()}</MetricValue>
                </TableCell>
                <TableCell>
                  <MetricValue>{formatCurrency(trader.aum)}</MetricValue>
                </TableCell>
                <TableCell>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyTrade?.(trader);
                    }}
                    aria-label={`Copy trade ${trader.name}`}
                  >
                    Copy
                  </ActionButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      <Pagination>
        <PaginationInfo>
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, traders?.length || 0)} of {traders?.length || 0} traders
        </PaginationInfo>
        <PaginationControls>
          <PaginationButton
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            Previous
          </PaginationButton>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <PaginationButton
              key={page}
              active={page === currentPage}
              onClick={() => setCurrentPage(page)}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </PaginationButton>
          ))}
          <PaginationButton
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next
          </PaginationButton>
        </PaginationControls>
      </Pagination>
    </Container>
  );
};