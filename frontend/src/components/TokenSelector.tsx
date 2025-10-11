import { useState, useEffect } from 'react';
import { ChevronDown, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { getActiveTokens, TokenInfo, isETH } from '../config/tokens';
import { TokenService, TokenBalance } from '../services/tokenService';

interface TokenSelectorProps {
  selectedToken: string;
  onTokenSelect: (tokenAddress: string) => void;
  userAddress?: string;
  className?: string;
}

export default function TokenSelector({
  selectedToken,
  onTokenSelect,
  userAddress,
  className = ''
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<Record<string, TokenBalance>>({});
  const [loading, setLoading] = useState(false);

  const activeTokens = getActiveTokens();
  const selectedTokenInfo = Object.values(activeTokens).find(t => t.address === selectedToken);

  useEffect(() => {
    if (userAddress) {
      loadTokenBalances();
    }
  }, [userAddress]);

  const loadTokenBalances = async () => {
    if (!userAddress) return;
    
    setLoading(true);
    try {
      const balances: Record<string, TokenBalance> = {};
      
      for (const [symbol, tokenInfo] of Object.entries(activeTokens)) {
        const balance = await TokenService.getTokenBalance(tokenInfo.address, userAddress);
        if (balance) {
          balances[tokenInfo.address] = balance;
        }
      }
      
      setTokenBalances(balances);
    } catch (error) {
      console.error('Error loading token balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTokenBalance = (tokenAddress: string): string => {
    const balance = tokenBalances[tokenAddress];
    return balance ? balance.formatted : '0';
  };

  const getTokenIcon = (tokenInfo: TokenInfo): string => {
    return tokenInfo.icon || 'https://cryptologos.cc/logos/ethereum-eth-logo.png';
  };

  const formatBalance = (balance: string, decimals: number): string => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.000001) return '< 0.000001';
    return num.toFixed(6);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
      >
        <div className="flex items-center space-x-3">
          {selectedTokenInfo && (
            <>
              <img
                src={getTokenIcon(selectedTokenInfo)}
                alt={selectedTokenInfo.symbol}
                className="w-6 h-6 rounded-full"
              />
              <div className="text-left">
                <div className="font-semibold text-white">{selectedTokenInfo.symbol}</div>
                <div className="text-sm text-gray-300">
                  {userAddress ? formatBalance(getTokenBalance(selectedToken), selectedTokenInfo.decimals) : '0'} {selectedTokenInfo.symbol}
                </div>
              </div>
            </>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
          {Object.entries(activeTokens).map(([symbol, tokenInfo]) => {
            const balance = getTokenBalance(tokenInfo.address);
            const isSelected = tokenInfo.address === selectedToken;
            
            return (
              <button
                key={tokenInfo.address}
                onClick={() => {
                  onTokenSelect(tokenInfo.address);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-4 hover:bg-white/20 transition-colors ${
                  isSelected ? 'bg-blue-500/20' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={getTokenIcon(tokenInfo)}
                    alt={tokenInfo.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                  <div className="text-left">
                    <div className="font-semibold text-white">{tokenInfo.symbol}</div>
                    <div className="text-sm text-gray-300">{tokenInfo.name}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-300">
                    {userAddress ? formatBalance(balance, tokenInfo.decimals) : '0'} {tokenInfo.symbol}
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-4 h-4 text-green-400 mt-1" />
                  )}
                </div>
              </button>
            );
          })}
          
          {loading && (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Loading balances...
            </div>
          )}
        </div>
      )}

      {/* Balance warning */}
      {selectedTokenInfo && userAddress && (
        <div className="mt-2 text-sm">
          {(() => {
            const balance = getTokenBalance(selectedToken);
            const balanceNum = parseFloat(balance);
            
            if (balanceNum === 0) {
              return (
                <div className="flex items-center text-red-400">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  No {selectedTokenInfo.symbol} balance
                </div>
              );
            } else if (balanceNum < 0.01) {
              return (
                <div className="flex items-center text-yellow-400">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Low {selectedTokenInfo.symbol} balance
                </div>
              );
            }
            
            return null;
          })()}
        </div>
      )}
    </div>
  );
}
