import React from 'react';
import { Loader } from 'lucide-react';
import TokenIcon from './TokenIcon';
import { getTokenByAddress, getNativeToken } from '../config/tokens';

interface TokenBalanceProps {
  amount: string;
  token: string; // token address or symbol
  showIcon?: boolean;
  showSymbol?: boolean;
  decimals?: number;
  className?: string;
  loading?: boolean;
}

export default function TokenBalance({ 
  amount, 
  token, 
  showIcon = true, 
  showSymbol = true, 
  decimals,
  className = '',
  loading = false
}: TokenBalanceProps) {
  const formatAmount = (amount: string, tokenDecimals: number): string => {
    const num = parseFloat(amount);
    if (isNaN(num) || num === 0) return '0';
    
    // Handle large numbers with K, M, B notation
    if (num >= 1e9) {
      return (num / 1e9).toFixed(1) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + 'K';
    } else if (num < 0.000001) {
      return '< 0.000001';
    } else {
      return num.toFixed(6);
    }
  };

  const getTokenInfo = (token: string) => {
    // Try to find by address first
    if (token.startsWith('0x')) {
      const tokenInfo = getTokenByAddress(token);
      if (tokenInfo) return tokenInfo;
    }
    
    // Try to find by symbol
    const nativeToken = getNativeToken();
    if (token.toUpperCase() === 'ETH' || token === nativeToken.address) {
      return nativeToken;
    }
    
    // Default fallback
    return {
      symbol: token.toUpperCase(),
      decimals: decimals || 18,
      name: token.toUpperCase()
    };
  };

  const tokenInfo = getTokenInfo(token);
  const displayAmount = formatAmount(amount, tokenInfo.decimals);
  
  // Color coding based on amount
  const getAmountColor = (amount: string): string => {
    const num = parseFloat(amount);
    if (num === 0) return 'text-gray-400';
    if (num < 0.001) return 'text-yellow-400';
    if (num < 1) return 'text-orange-400';
    return 'text-green-400';
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader className="w-4 h-4 animate-spin text-blue-400" />
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showIcon && (
        <TokenIcon 
          token={tokenInfo.symbol} 
          size="sm" 
          className="flex-shrink-0"
        />
      )}
      <span className={`font-mono ${getAmountColor(amount)}`}>
        {displayAmount}
      </span>
      {showSymbol && (
        <span className="text-gray-400 text-sm">
          {tokenInfo.symbol}
        </span>
      )}
    </div>
  );
}
