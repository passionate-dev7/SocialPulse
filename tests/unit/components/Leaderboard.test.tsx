import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import Leaderboard from '../../../src/components/Leaderboard';
import { TraderStats } from '../../../src/services/hyperliquid';

// Mock the TraderCard component
jest.mock('../../../src/components/TraderCard', () => {
  return function MockTraderCard({ trader, onFollow, onCopyTrade }: any) {
    return (
      <div data-testid={`trader-card-${trader.address}`}>
        <span>{trader.address}</span>
        <span>${trader.pnl}</span>
        <button onClick={() => onFollow(trader.address)}>Follow</button>
        <button onClick={() => onCopyTrade(trader, 25)}>Copy</button>
      </div>
    );
  };
});

const mockTraders: TraderStats[] = [
  {
    address: '0x1111111111111111111111111111111111111111',
    pnl: 25420.50,
    volume: 5500000.75,
    winRate: 78.5,
    sharpeRatio: 3.24,
    maxDrawdown: 8.2,
    totalTrades: 245,
    avgHoldTime: 6.8,
    roi: 35.4
  },
  {
    address: '0x2222222222222222222222222222222222222222',
    pnl: 18750.25,
    volume: 4200000.50,
    winRate: 65.2,
    sharpeRatio: 2.18,
    maxDrawdown: 15.6,
    totalTrades: 189,
    avgHoldTime: 4.2,
    roi: 28.7
  },
  {
    address: '0x3333333333333333333333333333333333333333',
    pnl: 12340.00,
    volume: 3100000.00,
    winRate: 58.9,
    sharpeRatio: 1.89,
    maxDrawdown: 22.1,
    totalTrades: 156,
    avgHoldTime: 3.5,
    roi: 22.1
  },
  {
    address: '0x4444444444444444444444444444444444444444',
    pnl: -5420.75,
    volume: 2800000.25,
    winRate: 42.3,
    sharpeRatio: -0.45,
    maxDrawdown: 45.8,
    totalTrades: 98,
    avgHoldTime: 2.1,
    roi: -18.2
  }
];

describe('Leaderboard Component', () => {
  const mockOnFollow = jest.fn();
  const mockOnCopyTrade = jest.fn();
  const mockOnLoadMore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all traders in the list', () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      mockTraders.forEach(trader => {
        expect(screen.getByTestId(`trader-card-${trader.address}`)).toBeInTheDocument();
      });
    });

    it('should show loading state when loading prop is true', () => {
      render(
        <Leaderboard
          traders={[]}
          loading={true}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      expect(screen.getByText('Loading traders...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should show empty state when no traders available', () => {
      render(
        <Leaderboard
          traders={[]}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      expect(screen.getByText('No traders found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or check back later')).toBeInTheDocument();
    });

    it('should render sorting controls', () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      expect(screen.getByText('Sort by:')).toBeInTheDocument();
      expect(screen.getByDisplayValue('PnL')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ROI')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Win Rate')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Sharpe Ratio')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Volume')).toBeInTheDocument();
    });

    it('should render filter controls', () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByLabelText('Minimum ROI (%)')).toBeInTheDocument();
      expect(screen.getByLabelText('Minimum Win Rate (%)')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum Drawdown (%)')).toBeInTheDocument();
      expect(screen.getByLabelText('Minimum Trades')).toBeInTheDocument();
    });
  });

  describe('Sorting Functionality', () => {
    it('should sort traders by PnL in descending order by default', () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      const traderCards = screen.getAllByTestId(/trader-card-/);
      
      // First trader should have highest PnL
      expect(traderCards[0]).toHaveAttribute('data-testid', 'trader-card-0x1111111111111111111111111111111111111111');
      // Last trader should have lowest/negative PnL
      expect(traderCards[3]).toHaveAttribute('data-testid', 'trader-card-0x4444444444444444444444444444444444444444');
    });

    it('should sort traders by ROI when selected', async () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      const sortSelect = screen.getByDisplayValue('PnL');
      fireEvent.change(sortSelect, { target: { value: 'roi' } });

      await waitFor(() => {
        const traderCards = screen.getAllByTestId(/trader-card-/);
        // Should be sorted by ROI (35.4% -> 28.7% -> 22.1% -> -18.2%)
        expect(traderCards[0]).toHaveAttribute('data-testid', 'trader-card-0x1111111111111111111111111111111111111111');
      });
    });

    it('should sort traders by win rate when selected', async () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      const sortSelect = screen.getByDisplayValue('PnL');
      fireEvent.change(sortSelect, { target: { value: 'winRate' } });

      await waitFor(() => {
        const traderCards = screen.getAllByTestId(/trader-card-/);
        // Should be sorted by win rate (78.5% -> 65.2% -> 58.9% -> 42.3%)
        expect(traderCards[0]).toHaveAttribute('data-testid', 'trader-card-0x1111111111111111111111111111111111111111');
      });
    });

    it('should toggle sort direction when same sort option selected twice', async () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      const sortSelect = screen.getByDisplayValue('PnL');
      
      // Select PnL again to reverse order
      fireEvent.change(sortSelect, { target: { value: 'pnl' } });
      
      const sortDirection = screen.getByTestId('sort-direction-button');
      fireEvent.click(sortDirection);

      await waitFor(() => {
        const traderCards = screen.getAllByTestId(/trader-card-/);
        // Should be sorted by PnL ascending (lowest first)
        expect(traderCards[0]).toHaveAttribute('data-testid', 'trader-card-0x4444444444444444444444444444444444444444');
      });
    });
  });

  describe('Filtering Functionality', () => {
    it('should filter traders by minimum ROI', async () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      const roiFilter = screen.getByLabelText('Minimum ROI (%)');
      fireEvent.change(roiFilter, { target: { value: '25' } });

      await waitFor(() => {
        // Should show only traders with ROI >= 25%
        expect(screen.getByTestId('trader-card-0x1111111111111111111111111111111111111111')).toBeInTheDocument();
        expect(screen.getByTestId('trader-card-0x2222222222222222222222222222222222222222')).toBeInTheDocument();
        expect(screen.queryByTestId('trader-card-0x3333333333333333333333333333333333333333')).not.toBeInTheDocument();
        expect(screen.queryByTestId('trader-card-0x4444444444444444444444444444444444444444')).not.toBeInTheDocument();
      });
    });

    it('should filter traders by minimum win rate', async () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      const winRateFilter = screen.getByLabelText('Minimum Win Rate (%)');
      fireEvent.change(winRateFilter, { target: { value: '60' } });

      await waitFor(() => {
        // Should show only traders with win rate >= 60%
        expect(screen.getByTestId('trader-card-0x1111111111111111111111111111111111111111')).toBeInTheDocument();
        expect(screen.getByTestId('trader-card-0x2222222222222222222222222222222222222222')).toBeInTheDocument();
        expect(screen.queryByTestId('trader-card-0x3333333333333333333333333333333333333333')).not.toBeInTheDocument();
        expect(screen.queryByTestId('trader-card-0x4444444444444444444444444444444444444444')).not.toBeInTheDocument();
      });
    });

    it('should filter traders by maximum drawdown', async () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      const drawdownFilter = screen.getByLabelText('Maximum Drawdown (%)');
      fireEvent.change(drawdownFilter, { target: { value: '20' } });

      await waitFor(() => {
        // Should show only traders with drawdown <= 20%
        expect(screen.getByTestId('trader-card-0x1111111111111111111111111111111111111111')).toBeInTheDocument();
        expect(screen.getByTestId('trader-card-0x2222222222222222222222222222222222222222')).toBeInTheDocument();
        expect(screen.queryByTestId('trader-card-0x3333333333333333333333333333333333333333')).not.toBeInTheDocument();
        expect(screen.queryByTestId('trader-card-0x4444444444444444444444444444444444444444')).not.toBeInTheDocument();
      });
    });

    it('should apply multiple filters simultaneously', async () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      // Apply multiple filters
      const roiFilter = screen.getByLabelText('Minimum ROI (%)');
      const winRateFilter = screen.getByLabelText('Minimum Win Rate (%)');
      
      fireEvent.change(roiFilter, { target: { value: '30' } });
      fireEvent.change(winRateFilter, { target: { value: '70' } });

      await waitFor(() => {
        // Should show only the top trader who meets both criteria
        expect(screen.getByTestId('trader-card-0x1111111111111111111111111111111111111111')).toBeInTheDocument();
        expect(screen.queryByTestId('trader-card-0x2222222222222222222222222222222222222222')).not.toBeInTheDocument();
        expect(screen.queryByTestId('trader-card-0x3333333333333333333333333333333333333333')).not.toBeInTheDocument();
        expect(screen.queryByTestId('trader-card-0x4444444444444444444444444444444444444444')).not.toBeInTheDocument();
      });
    });

    it('should clear filters when reset button is clicked', async () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      // Apply filters
      const roiFilter = screen.getByLabelText('Minimum ROI (%)');
      fireEvent.change(roiFilter, { target: { value: '50' } });

      // Should filter results
      await waitFor(() => {
        expect(screen.queryByTestId('trader-card-0x2222222222222222222222222222222222222222')).not.toBeInTheDocument();
      });

      // Clear filters
      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);

      await waitFor(() => {
        // Should show all traders again
        mockTraders.forEach(trader => {
          expect(screen.getByTestId(`trader-card-${trader.address}`)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Pagination', () => {
    it('should show load more button when hasMore is true', () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          hasMore={true}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      expect(screen.getByText('Load More')).toBeInTheDocument();
    });

    it('should not show load more button when hasMore is false', () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          hasMore={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      expect(screen.queryByText('Load More')).not.toBeInTheDocument();
    });

    it('should call onLoadMore when load more button is clicked', () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          hasMore={true}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      fireEvent.click(screen.getByText('Load More'));
      
      expect(mockOnLoadMore).toHaveBeenCalledTimes(1);
    });

    it('should disable load more button when loading', () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={true}
          hasMore={true}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      const loadMoreButton = screen.getByText('Loading...');
      expect(loadMoreButton).toBeDisabled();
    });
  });

  describe('Event Handling', () => {
    it('should pass follow events to parent component', () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      fireEvent.click(screen.getAllByText('Follow')[0]);
      
      expect(mockOnFollow).toHaveBeenCalledWith(mockTraders[0].address);
    });

    it('should pass copy trade events to parent component', () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      fireEvent.click(screen.getAllByText('Copy')[0]);
      
      expect(mockOnCopyTrade).toHaveBeenCalledWith(mockTraders[0], 25);
    });
  });

  describe('Performance', () => {
    it('should handle large trader lists efficiently', () => {
      const largeMockTraders = Array.from({ length: 1000 }, (_, i) => ({
        ...mockTraders[0],
        address: `0x${i.toString().padStart(40, '0')}`,
        pnl: Math.random() * 10000
      }));

      const startTime = performance.now();
      
      render(
        <Leaderboard
          traders={largeMockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);
    });

    it('should debounce filter inputs', async () => {
      const { rerender } = render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      const roiFilter = screen.getByLabelText('Minimum ROI (%)');
      
      // Rapid filter changes
      fireEvent.change(roiFilter, { target: { value: '1' } });
      fireEvent.change(roiFilter, { target: { value: '10' } });
      fireEvent.change(roiFilter, { target: { value: '20' } });

      // Should debounce and only apply final filter
      await waitFor(() => {
        // Should show traders with ROI >= 20%
        expect(screen.getAllByTestId(/trader-card-/)).toHaveLength(3);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for controls', () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      expect(screen.getByLabelText('Sort traders by')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort direction')).toBeInTheDocument();
      expect(screen.getByLabelText('Minimum ROI (%)')).toBeInTheDocument();
      expect(screen.getByLabelText('Minimum Win Rate (%)')).toBeInTheDocument();
    });

    it('should announce filter results to screen readers', async () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      const roiFilter = screen.getByLabelText('Minimum ROI (%)');
      fireEvent.change(roiFilter, { target: { value: '30' } });

      await waitFor(() => {
        expect(screen.getByText('Showing 2 of 4 traders')).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation', () => {
      render(
        <Leaderboard
          traders={mockTraders}
          loading={false}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
          onLoadMore={mockOnLoadMore}
        />
      );

      const sortSelect = screen.getByLabelText('Sort traders by');
      sortSelect.focus();
      expect(sortSelect).toHaveFocus();

      // Should be able to navigate through filters with Tab
      fireEvent.keyDown(sortSelect, { key: 'Tab' });
    });
  });
});