import React, { useState, useEffect } from 'react';
import { 
  ArrowDownIcon, 
  CogIcon,
  ArrowsUpDownIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { gluexService, PriceQuoteResponse, TokenInfo } from '@/services/gluex';
import { useDebounce } from '@/hooks/useDebounce';

interface SwapInterfaceProps {
  userAddress?: string;
  chainId?: number;
}

const SwapInterface: React.FC<SwapInterfaceProps> = ({ 
  userAddress,
  chainId = 1 // Default to Ethereum mainnet
}) => {
  // State management
  const [inputToken, setInputToken] = useState<TokenInfo | null>(null);
  const [outputToken, setOutputToken] = useState<TokenInfo | null>(null);
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [orderType, setOrderType] = useState<'SELL' | 'BUY'>('SELL');
  const [slippageTolerance, setSlippageTolerance] = useState(50); // 0.5%
  const [surgeProtection, setSurgeProtection] = useState(true);
  const [isPartialFill, setIsPartialFill] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Loading and error states
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [priceQuote, setPriceQuote] = useState<PriceQuoteResponse | null>(null);
  
  // Token lists
  const [availableTokens, setAvailableTokens] = useState<TokenInfo[]>([]);
  const [showTokenSelect, setShowTokenSelect] = useState<'input' | 'output' | null>(null);

  // Debounced input amount for quote fetching
  const debouncedInputAmount = useDebounce(inputAmount, 500);
  const debouncedOutputAmount = useDebounce(outputAmount, 500);

  // Load available tokens on mount
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const tokens = await gluexService.getSupportedTokens(chainId);
        setAvailableTokens(tokens);
        
        // Set default tokens (ETH and USDC for example)
        if (tokens.length > 0) {
          const eth = tokens.find(t => t.symbol === 'ETH') || tokens[0];
          const usdc = tokens.find(t => t.symbol === 'USDC') || tokens[1];
          setInputToken(eth);
          setOutputToken(usdc);
        }
      } catch (error) {
        console.error('Failed to load tokens:', error);
      }
    };
    
    loadTokens();
  }, [chainId]);

  // Fetch price quote when inputs change
  useEffect(() => {
    if (!inputToken || !outputToken) return;
    
    const amount = orderType === 'SELL' ? debouncedInputAmount : debouncedOutputAmount;
    if (!amount || parseFloat(amount) === 0) {
      setPriceQuote(null);
      if (orderType === 'SELL') {
        setOutputAmount('');
      } else {
        setInputAmount('');
      }
      return;
    }

    const fetchQuote = async () => {
      setIsLoadingQuote(true);
      setQuoteError(null);
      
      try {
        const params = {
          chainId,
          inputToken: inputToken.address,
          outputToken: outputToken.address,
          ...(orderType === 'SELL' 
            ? { inputAmount: gluexService.parseTokenAmount(amount, inputToken.decimals) }
            : { outputAmount: gluexService.parseTokenAmount(amount, outputToken.decimals), orderType: 'BUY' as const }
          ),
          slippageTolerance,
          surgeProtection,
          isPartialFill,
          userAddress,
        };

        const quote = await gluexService.getPriceQuote(params);
        setPriceQuote(quote);
        
        // Update the calculated amount
        if (orderType === 'SELL') {
          setOutputAmount(gluexService.formatTokenAmount(quote.effectiveOutputAmount, outputToken.decimals));
        } else {
          setInputAmount(gluexService.formatTokenAmount(quote.inputAmount, inputToken.decimals));
        }
        
        // Check for revert
        if (quote.revert) {
          setQuoteError(quote.revertReason || 'Trade would fail due to market conditions');
        }
      } catch (error: any) {
        setQuoteError(error.message || 'Failed to fetch quote');
        setPriceQuote(null);
      } finally {
        setIsLoadingQuote(false);
      }
    };

    fetchQuote();
  }, [debouncedInputAmount, debouncedOutputAmount, inputToken, outputToken, orderType, slippageTolerance, surgeProtection, isPartialFill, chainId, userAddress]);

  // Swap tokens
  const handleSwapTokens = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
    
    const tempAmount = inputAmount;
    setInputAmount(outputAmount);
    setOutputAmount(tempAmount);
    
    setOrderType(orderType === 'SELL' ? 'BUY' : 'SELL');
  };

  // Execute swap
  const handleSwap = async () => {
    if (!inputToken || !outputToken || !priceQuote || !userAddress) return;
    
    try {
      // In a real implementation, this would call the smart contract
      // For now, we'll just get the swap quote with calldata
      const swapQuote = await gluexService.getSwapQuote({
        chainId,
        inputToken: inputToken.address,
        outputToken: outputToken.address,
        inputAmount: gluexService.parseTokenAmount(inputAmount, inputToken.decimals),
        slippageTolerance,
        surgeProtection,
        isPartialFill,
        userAddress,
        recipient: userAddress,
        deadline: Math.floor(Date.now() / 1000) + 300, // 5 minutes from now
      });
      
      console.log('Swap quote with calldata:', swapQuote);
      // Here you would use web3/ethers to send the transaction
      
    } catch (error: any) {
      console.error('Swap failed:', error);
      setQuoteError(error.message || 'Swap failed');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Swap</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <CogIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <div>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Slippage Tolerance</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={slippageTolerance / 100}
                  onChange={(e) => setSlippageTolerance(parseFloat(e.target.value) * 100)}
                  className="w-16 px-2 py-1 text-sm border rounded"
                  step="0.1"
                  min="0.1"
                  max="50"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </label>
          </div>
          
          <div>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Surge Protection</span>
              <input
                type="checkbox"
                checked={surgeProtection}
                onChange={(e) => setSurgeProtection(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
          
          <div>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Partial Fill</span>
              <input
                type="checkbox"
                checked={isPartialFill}
                onChange={(e) => setIsPartialFill(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      )}

      {/* Input Token */}
      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>You {orderType === 'SELL' ? 'pay' : 'receive'}</span>
          {inputToken && <span>Balance: -</span>}
        </div>
        <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => {
              setInputAmount(e.target.value);
              setOrderType('SELL');
            }}
            placeholder="0.0"
            className="flex-1 bg-transparent text-2xl font-semibold outline-none"
            disabled={orderType === 'BUY'}
          />
          <button
            onClick={() => setShowTokenSelect('input')}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
          >
            {inputToken ? (
              <>
                <span className="font-medium">{inputToken.symbol}</span>
                <ArrowDownIcon className="h-4 w-4" />
              </>
            ) : (
              <span>Select token</span>
            )}
          </button>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center my-2">
        <button
          onClick={handleSwapTokens}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowsUpDownIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Output Token */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>You {orderType === 'BUY' ? 'pay' : 'receive'}</span>
          {outputToken && <span>Balance: -</span>}
        </div>
        <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
          <input
            type="number"
            value={outputAmount}
            onChange={(e) => {
              setOutputAmount(e.target.value);
              setOrderType('BUY');
            }}
            placeholder="0.0"
            className="flex-1 bg-transparent text-2xl font-semibold outline-none"
            disabled={orderType === 'SELL'}
          />
          <button
            onClick={() => setShowTokenSelect('output')}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
          >
            {outputToken ? (
              <>
                <span className="font-medium">{outputToken.symbol}</span>
                <ArrowDownIcon className="h-4 w-4" />
              </>
            ) : (
              <span>Select token</span>
            )}
          </button>
        </div>
      </div>

      {/* Price Info */}
      {priceQuote && !quoteError && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Rate</span>
            <span className="font-medium">
              1 {inputToken?.symbol} = {(parseFloat(priceQuote.outputAmount) / parseFloat(priceQuote.inputAmount)).toFixed(4)} {outputToken?.symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Price Impact</span>
            <span className={`font-medium ${priceQuote.priceImpact > 3 ? 'text-red-600' : 'text-gray-900'}`}>
              {priceQuote.priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Min. Received</span>
            <span className="font-medium">
              {outputToken && gluexService.formatTokenAmount(priceQuote.minOutputAmount, outputToken.decimals)} {outputToken?.symbol}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {quoteError && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-start gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{quoteError}</p>
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={!priceQuote || !!quoteError || isLoadingQuote || !userAddress}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
          !priceQuote || !!quoteError || isLoadingQuote || !userAddress
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoadingQuote ? 'Getting quote...' : 
         !userAddress ? 'Connect Wallet' :
         !priceQuote ? 'Enter amount' :
         quoteError ? 'Cannot swap' :
         'Swap'}
      </button>

      {/* Token Selection Modal */}
      {showTokenSelect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Token</h3>
              <button
                onClick={() => setShowTokenSelect(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {availableTokens.map((token) => (
                <button
                  key={token.address}
                  onClick={() => {
                    if (showTokenSelect === 'input') {
                      setInputToken(token);
                    } else {
                      setOutputToken(token);
                    }
                    setShowTokenSelect(null);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="text-left">
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-gray-500">{token.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapInterface;