import React, { useState, useEffect } from 'react';
import { ChevronDown, Loader } from 'lucide-react';
import TokenIcon from './TokenIcon';
import TokenBalance from './TokenBalance';
import { SUPPORTED_TOKENS, getTokenByAddress, getNativeToken } from '../config/tokens';
import { TokenService } from '../services/tokenService';

interface TokenPriceDisplayProps {
  basePrice: string; // Price in ETH (base currency)
  selectedToken?: string; // Token address or symbol
  showAllTokens?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onTokenSelect?: (tokenAddress: string) => void;
}

const SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export default function TokenPriceDisplay({ 
  basePrice, 
  selectedToken, 
  showAllTokens = false,
  size = 'md',
  className = '',
  onTokenSelect
}: TokenPriceDisplayProps) {
  const [convertedPrices, setConvertedPrices] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const nativeToken = getNativeToken();
  const currentToken = selectedToken ? getTokenByAddress(selectedToken) || nativeToken : nativeToken;

  useEffect(() => {
    if (showAllTokens) {
      convertAllPrices();
    } else if (selectedToken && selectedToken !== nativeToken.address) {
      convertToToken(selectedToken);
    }
  }, [basePrice, selectedToken, showAllTokens]);

  const convertAllPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const prices: { [key: string]: string } = {};
      
      // ETH price (base)
      prices[nativeToken.address] = basePrice;
      
      // Convert to other tokens
      for (const token of SUPPORTED_TOKENS) {
        if (token.address !== nativeToken.address) {
          try {
            const convertedPrice = await TokenService.convertPrice(nativeToken, token, basePrice);
            prices[token.address] = convertedPrice;
          } catch (err) {
            console.warn(`Failed to convert to ${token.symbol}:`, err);
            prices[token.address] = '0';
          }
        }
      }
      
      setConvertedPrices(prices);
    } catch (err) {
      console.error('Error converting prices:', err);
      setError('Failed to load prices');
    } finally {
      setLoading(false);
    }
  };

  const convertToToken = async (tokenAddress: string) => {
    if (tokenAddress === nativeToken.address) {
      setConvertedPrices({ [tokenAddress]: basePrice });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = getTokenByAddress(tokenAddress);
      if (!token) throw new Error('Token not found');
      
      const convertedPrice = await TokenService.convertPrice(nativeToken, token, basePrice);
      setConvertedPrices({ [tokenAddress]: convertedPrice });
    } catch (err) {
      console.error('Error converting price:', err);
      setError('Failed to convert price');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSelect = (tokenAddress: string) => {
    if (onTokenSelect) {
      onTokenSelect(tokenAddress);
    }
    setIsOpen(false);
  };

  const getCurrentPrice = (): string => {
    if (loading) return '0';
    if (error) return basePrice;
    return convertedPrices[currentToken.address] || basePrice;
  };

  if (showAllTokens) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="text-gray-400 text-sm">Price in all tokens:</div>
        {loading ? (
          <div className="flex items-center space-x-2">
            <Loader className="w-4 h-4 animate-spin text-blue-400" />
            <span className="text-gray-400">Loading prices...</span>
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {SUPPORTED_TOKENS.map((token) => (
              <div key={token.address} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TokenIcon token={token.symbol} size="sm" />
                  <span className="text-sm font-medium">{token.symbol}</span>
                </div>
                <span className="text-sm font-mono">
                  {convertedPrices[token.address] || '0'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        <TokenIcon token={currentToken.symbol} size="sm" />
        <span className={`font-mono ${SIZE_CLASSES[size]} ${loading ? 'text-gray-400' : 'text-white'}`}>
          {loading ? '...' : getCurrentPrice()}
        </span>
        <span className="text-gray-400 text-sm">{currentToken.symbol}</span>
        
        {onTokenSelect && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && onTokenSelect && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
          <div className="py-2">
            {SUPPORTED_TOKENS.map((token) => (
              <button
                key={token.address}
                onClick={() => handleTokenSelect(token.address)}
                className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-700 text-left"
              >
                <TokenIcon token={token.symbol} size="sm" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{token.name}</div>
                  <div className="text-xs text-gray-400">{token.symbol}</div>
                </div>
                {convertedPrices[token.address] && (
                  <div className="text-sm font-mono text-gray-300">
                    {convertedPrices[token.address]}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-1 text-red-400 text-xs">{error}</div>
      )}
    </div>
  );
}
