import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import TraderCard from '../../../src/components/TraderCard';
import { TraderStats } from '../../../src/services/hyperliquid';

// Mock the copy trading modal
jest.mock('../../../src/components/CopyTradeModal', () => {
  return function MockCopyTradeModal({ trader, isOpen, onClose, onCopy }: any) {
    return isOpen ? (
      <div data-testid="copy-trade-modal">
        <h3>Copy Trade Modal</h3>
        <p>Trader: {trader.address}</p>
        <button onClick={() => onCopy(25)}>Copy 25%</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});

// Mock the chart component
jest.mock('../../../src/components/PerformanceChart', () => {
  return function MockPerformanceChart({ data }: any) {
    return <div data-testid="performance-chart">Chart with {data.length} points</div>;
  };
});

const mockTrader: TraderStats = {
  address: '0x1234567890123456789012345678901234567890',
  pnl: 15420.50,
  volume: 2500000.75,
  winRate: 68.5,
  sharpeRatio: 2.34,
  maxDrawdown: 12.8,
  totalTrades: 156,
  avgHoldTime: 4.2,
  roi: 24.8
};

const mockTraderNegativePnl: TraderStats = {
  ...mockTrader,
  address: '0x9876543210987654321098765432109876543210',
  pnl: -3250.25,
  roi: -8.4,
  winRate: 42.1
};

describe('TraderCard Component', () => {
  const mockOnFollow = jest.fn();
  const mockOnCopyTrade = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render trader information correctly', () => {
      render(
        <TraderCard 
          trader={mockTrader}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      // Check trader address display
      expect(screen.getByText(/0x1234...7890/)).toBeInTheDocument();
      
      // Check PnL display with positive styling
      expect(screen.getByText('$15,420.50')).toBeInTheDocument();
      expect(screen.getByText('$15,420.50')).toHaveClass('text-green-500');
      
      // Check ROI display
      expect(screen.getByText('24.8%')).toBeInTheDocument();
      
      // Check win rate
      expect(screen.getByText('68.5%')).toBeInTheDocument();
      
      // Check volume formatting
      expect(screen.getByText('$2.5M')).toBeInTheDocument();
      
      // Check Sharpe ratio
      expect(screen.getByText('2.34')).toBeInTheDocument();
      
      // Check max drawdown
      expect(screen.getByText('12.8%')).toBeInTheDocument();
      
      // Check total trades
      expect(screen.getByText('156')).toBeInTheDocument();
      
      // Check average hold time
      expect(screen.getByText('4.2h')).toBeInTheDocument();
    });

    it('should render negative PnL with red styling', () => {
      render(
        <TraderCard 
          trader={mockTraderNegativePnl}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      const pnlElement = screen.getByText('-$3,250.25');
      expect(pnlElement).toBeInTheDocument();
      expect(pnlElement).toHaveClass('text-red-500');
    });

    it('should display performance chart', () => {
      render(
        <TraderCard 
          trader={mockTrader}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      expect(screen.getByTestId('performance-chart')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <TraderCard 
          trader={mockTrader}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      expect(screen.getByText('Follow')).toBeInTheDocument();
      expect(screen.getByText('Copy Trade')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onFollow when Follow button is clicked', () => {
      render(
        <TraderCard 
          trader={mockTrader}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      fireEvent.click(screen.getByText('Follow'));
      
      expect(mockOnFollow).toHaveBeenCalledWith(mockTrader.address);
      expect(mockOnFollow).toHaveBeenCalledTimes(1);
    });

    it('should open copy trade modal when Copy Trade button is clicked', () => {
      render(
        <TraderCard 
          trader={mockTrader}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      fireEvent.click(screen.getByText('Copy Trade'));
      
      expect(screen.getByTestId('copy-trade-modal')).toBeInTheDocument();
      expect(screen.getByText(`Trader: ${mockTrader.address}`)).toBeInTheDocument();
    });

    it('should close copy trade modal when Close button is clicked', () => {
      render(
        <TraderCard 
          trader={mockTrader}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      // Open modal
      fireEvent.click(screen.getByText('Copy Trade'));
      expect(screen.getByTestId('copy-trade-modal')).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('copy-trade-modal')).not.toBeInTheDocument();
    });

    it('should call onCopyTrade when copy trade is confirmed', async () => {
      render(
        <TraderCard 
          trader={mockTrader}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      // Open modal
      fireEvent.click(screen.getByText('Copy Trade'));
      
      // Confirm copy trade
      fireEvent.click(screen.getByText('Copy 25%'));
      
      await waitFor(() => {
        expect(mockOnCopyTrade).toHaveBeenCalledWith(mockTrader, 25);
        expect(mockOnCopyTrade).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Data Formatting', () => {
    it('should format large volumes correctly', () => {
      const traderWithLargeVolume: TraderStats = {
        ...mockTrader,
        volume: 15750000000 // 15.75B
      };

      render(
        <TraderCard 
          trader={traderWithLargeVolume}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      expect(screen.getByText('$15.8B')).toBeInTheDocument();
    });

    it('should format small volumes correctly', () => {
      const traderWithSmallVolume: TraderStats = {
        ...mockTrader,
        volume: 750500 // 750K
      };

      render(
        <TraderCard 
          trader={traderWithSmallVolume}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      expect(screen.getByText('$750.5K')).toBeInTheDocument();
    });

    it('should truncate address display properly', () => {
      const longAddress = '0x1234567890123456789012345678901234567890';
      const traderWithLongAddress: TraderStats = {
        ...mockTrader,
        address: longAddress
      };

      render(
        <TraderCard 
          trader={traderWithLongAddress}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
      expect(screen.queryByText(longAddress)).not.toBeInTheDocument();
    });

    it('should handle zero values gracefully', () => {
      const traderWithZeros: TraderStats = {
        ...mockTrader,
        pnl: 0,
        roi: 0,
        winRate: 0,
        totalTrades: 0
      };

      render(
        <TraderCard 
          trader={traderWithZeros}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      expect(screen.getByText('$0.00')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should show different badge styles based on performance', () => {
      const highPerformerTrader: TraderStats = {
        ...mockTrader,
        roi: 45.2,
        winRate: 85.5,
        sharpeRatio: 3.8
      };

      render(
        <TraderCard 
          trader={highPerformerTrader}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      // Should show high performer indicators
      expect(screen.getByText('45.2%')).toHaveClass('text-green-600');
    });

    it('should show warning indicators for poor performance', () => {
      const poorPerformerTrader: TraderStats = {
        ...mockTrader,
        roi: -15.3,
        winRate: 25.8,
        maxDrawdown: 45.2
      };

      render(
        <TraderCard 
          trader={poorPerformerTrader}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      // Should show warning indicators
      expect(screen.getByText('-15.3%')).toHaveClass('text-red-500');
    });

    it('should disable copy trade button for traders with very poor performance', () => {
      const veryPoorTrader: TraderStats = {
        ...mockTrader,
        roi: -50.5,
        winRate: 15.2,
        maxDrawdown: 75.8
      };

      render(
        <TraderCard 
          trader={veryPoorTrader}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      const copyButton = screen.getByText('Copy Trade');
      expect(copyButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TraderCard 
          trader={mockTrader}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      expect(screen.getByLabelText(`Follow trader ${mockTrader.address}`)).toBeInTheDocument();
      expect(screen.getByLabelText(`Copy trades from ${mockTrader.address}`)).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(
        <TraderCard 
          trader={mockTrader}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      const followButton = screen.getByText('Follow');
      const copyButton = screen.getByText('Copy Trade');

      // Should be focusable
      followButton.focus();
      expect(followButton).toHaveFocus();

      copyButton.focus();
      expect(copyButton).toHaveFocus();
    });

    it('should support keyboard activation', () => {
      render(
        <TraderCard 
          trader={mockTrader}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      const followButton = screen.getByText('Follow');
      followButton.focus();

      // Simulate Enter key press
      fireEvent.keyDown(followButton, { key: 'Enter', code: 'Enter' });
      
      expect(mockOnFollow).toHaveBeenCalledWith(mockTrader.address);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing trader data gracefully', () => {
      const incompleteTrader = {
        address: '0x1234567890123456789012345678901234567890'
      } as TraderStats;

      render(
        <TraderCard 
          trader={incompleteTrader}
          onFollow={mockOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      // Should still render without crashing
      expect(screen.getByText(/0x1234...7890/)).toBeInTheDocument();
    });

    it('should handle callback errors gracefully', () => {
      const errorOnFollow = jest.fn().mockImplementation(() => {
        throw new Error('Follow failed');
      });

      render(
        <TraderCard 
          trader={mockTrader}
          onFollow={errorOnFollow}
          onCopyTrade={mockOnCopyTrade}
        />
      );

      // Should not crash when callback throws
      expect(() => {
        fireEvent.click(screen.getByText('Follow'));
      }).not.toThrow();
    });
  });
});