import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { Trader, CopyTradeSettings } from '../types';

interface CopyTradeModalProps {
  trader: Trader;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (settings: CopyTradeSettings) => void;
  portfolioBalance?: number;
}

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 18px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const TraderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 24px;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
`;

const TraderDetails = styled.div`
  flex: 1;
`;

const TraderName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VerificationBadge = styled.span`
  color: #059669;
  font-size: 14px;
`;

const TraderStats = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`;

const SliderContainer = styled.div`
  margin: 12px 0;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #d1d5db;
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const SliderValue = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const AssetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  margin-top: 8px;
`;

const AssetCheckbox = styled.label<{ checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid ${props => props.checked ? '#3b82f6' : '#d1d5db'};
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.checked ? '#eff6ff' : 'white'};
  
  &:hover {
    border-color: #3b82f6;
  }
  
  input {
    margin: 0;
  }
`;

const RiskWarning = styled.div`
  padding: 12px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  font-size: 14px;
  color: #92400e;
  margin-bottom: 16px;
`;

const CostBreakdown = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const CostItem = styled.div`
  display: flex;
  justify-content: between;
  margin-bottom: 8px;
  font-size: 14px;
  
  &:last-child {
    margin-bottom: 0;
    font-weight: 600;
    color: #111827;
  }
`;

const CostLabel = styled.span`
  color: #6b7280;
`;

const CostValue = styled.span`
  color: #111827;
  font-weight: 500;
`;

const Checkbox = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  line-height: 1.4;
  
  input {
    margin-top: 2px;
  }
`;

const Footer = styled.div`
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: end;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
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

const POPULAR_ASSETS = ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC', 'LINK', 'UNI', 'AAVE'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const CopyTradeModal: React.FC<CopyTradeModalProps> = ({
  trader,
  isOpen,
  onClose,
  onConfirm,
  portfolioBalance = 10000
}) => {
  const [settings, setSettings] = useState<CopyTradeSettings>({
    allocation: 10, // 10% default
    maxPositionSize: 25, // 25% max position size
    stopLoss: 10, // 10% stop loss
    selectedAssets: ['BTC', 'ETH'],
    monthlyCost: 0
  });

  const [acceptTerms, setAcceptTerms] = useState(false);

  const allocationAmount = useMemo(() => {
    return (portfolioBalance * settings.allocation) / 100;
  }, [portfolioBalance, settings.allocation]);

  const estimatedMonthlyCost = useMemo(() => {
    // Estimate based on 2% management fee + 20% performance fee
    const managementFee = (allocationAmount * 0.02) / 12;
    const performanceFee = (allocationAmount * trader.roi * 0.2) / 100 / 12;
    return managementFee + performanceFee;
  }, [allocationAmount, trader.roi]);

  const handleSettingChange = <K extends keyof CopyTradeSettings>(
    key: K,
    value: CopyTradeSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
      monthlyCost: key === 'allocation' ? 0 : prev.monthlyCost // Will be recalculated by useMemo
    }));
  };

  const handleAssetToggle = (asset: string) => {
    setSettings(prev => ({
      ...prev,
      selectedAssets: prev.selectedAssets.includes(asset)
        ? prev.selectedAssets.filter(a => a !== asset)
        : [...prev.selectedAssets, asset]
    }));
  };

  const handleConfirm = () => {
    onConfirm({
      ...settings,
      monthlyCost: estimatedMonthlyCost
    });
  };

  const isValid = settings.selectedAssets.length > 0 && acceptTerms && settings.allocation > 0;

  if (!isOpen) return null;

  return (
    <Overlay isOpen={isOpen} onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="modal-title">
        <Header>
          <Title id="modal-title">Copy Trade Setup</Title>
          <CloseButton onClick={onClose} aria-label="Close modal">
            ×
          </CloseButton>
        </Header>

        <Content>
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
                  <VerificationBadge>✓</VerificationBadge>
                )}
              </TraderName>
              <TraderStats>
                ROI: +{trader.roi.toFixed(1)}% • Win Rate: {trader.winRate.toFixed(1)}% • 
                Sharpe: {trader.sharpeRatio.toFixed(2)}
              </TraderStats>
            </TraderDetails>
          </TraderInfo>

          <Section>
            <SectionTitle>Allocation Settings</SectionTitle>
            <FormGroup>
              <Label htmlFor="allocation">Portfolio Allocation: {settings.allocation}%</Label>
              <SliderContainer>
                <Slider
                  id="allocation"
                  type="range"
                  min="1"
                  max="50"
                  value={settings.allocation}
                  onChange={(e) => handleSettingChange('allocation', Number(e.target.value))}
                  aria-describedby="allocation-description"
                />
                <SliderValue>
                  <span>1%</span>
                  <span>{formatCurrency(allocationAmount)}</span>
                  <span>50%</span>
                </SliderValue>
              </SliderContainer>
              <div id="allocation-description" style={{ fontSize: '12px', color: '#6b7280' }}>
                Amount allocated: {formatCurrency(allocationAmount)} of {formatCurrency(portfolioBalance)}
              </div>
            </FormGroup>
          </Section>

          <Section>
            <SectionTitle>Risk Management</SectionTitle>
            <FormGroup>
              <Label htmlFor="maxPosition">Max Position Size: {settings.maxPositionSize}%</Label>
              <SliderContainer>
                <Slider
                  id="maxPosition"
                  type="range"
                  min="5"
                  max="100"
                  value={settings.maxPositionSize}
                  onChange={(e) => handleSettingChange('maxPositionSize', Number(e.target.value))}
                  aria-describedby="position-description"
                />
                <SliderValue>
                  <span>5%</span>
                  <span>Max per trade: {formatCurrency((allocationAmount * settings.maxPositionSize) / 100)}</span>
                  <span>100%</span>
                </SliderValue>
              </SliderContainer>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="stopLoss">Stop Loss: {settings.stopLoss}%</Label>
              <SliderContainer>
                <Slider
                  id="stopLoss"
                  type="range"
                  min="1"
                  max="50"
                  value={settings.stopLoss}
                  onChange={(e) => handleSettingChange('stopLoss', Number(e.target.value))}
                  aria-describedby="stoploss-description"
                />
                <SliderValue>
                  <span>1%</span>
                  <span>Max loss per trade: {formatCurrency((allocationAmount * settings.stopLoss) / 100)}</span>
                  <span>50%</span>
                </SliderValue>
              </SliderContainer>
            </FormGroup>
          </Section>

          <Section>
            <SectionTitle>Asset Selection</SectionTitle>
            <AssetGrid>
              {POPULAR_ASSETS.map(asset => (
                <AssetCheckbox
                  key={asset}
                  checked={settings.selectedAssets.includes(asset)}
                >
                  <input
                    type="checkbox"
                    checked={settings.selectedAssets.includes(asset)}
                    onChange={() => handleAssetToggle(asset)}
                    aria-label={`Toggle ${asset}`}
                  />
                  {asset}
                </AssetCheckbox>
              ))}
            </AssetGrid>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
              Select which assets to copy ({settings.selectedAssets.length} selected)
            </div>
          </Section>

          <Section>
            <SectionTitle>Cost Breakdown</SectionTitle>
            <CostBreakdown>
              <CostItem>
                <CostLabel>Management Fee (2% annually):</CostLabel>
                <CostValue>{formatCurrency((allocationAmount * 0.02) / 12)}/month</CostValue>
              </CostItem>
              <CostItem>
                <CostLabel>Performance Fee (20% of profits):</CostLabel>
                <CostValue>{formatCurrency((allocationAmount * trader.roi * 0.2) / 100 / 12)}/month*</CostValue>
              </CostItem>
              <CostItem>
                <CostLabel>Estimated Monthly Cost:</CostLabel>
                <CostValue>{formatCurrency(estimatedMonthlyCost)}</CostValue>
              </CostItem>
            </CostBreakdown>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              *Performance fee is based on historical returns and may vary
            </div>
          </Section>

          <RiskWarning>
            <strong>Risk Warning:</strong> Copy trading involves significant risk. Past performance 
            does not guarantee future results. You may lose some or all of your allocated funds.
          </RiskWarning>

          <Checkbox>
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              aria-describedby="terms-text"
            />
            <span id="terms-text">
              I understand the risks involved and agree to the{' '}
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                Copy Trading Agreement
              </a>
            </span>
          </Checkbox>
        </Content>

        <Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm} 
            disabled={!isValid}
            aria-label="Confirm copy trade setup"
          >
            Start Copy Trading
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};