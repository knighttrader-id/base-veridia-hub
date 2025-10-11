import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Copy, Check, Loader } from 'lucide-react';
import TokenIcon from './TokenIcon';
import { SUPPORTED_TOKENS, getTokenByAddress, getNativeToken } from '../config/tokens';
import { TokenService } from '../services/tokenService';

interface TokenConverterProps {
  fromToken?: string; // Token address or symbol
  toToken?: string; // Token address or symbol
  amount?: string;
  onConvert?: (fromToken: string, toToken: string, amount: string, convertedAmount: string) => void;
  className?: string;
}

export default function TokenConverter({ 
  fromToken: initialFromToken,
  toToken: initialToToken,
  amount: initialAmount = '',
  onConvert,
  className = ''
}: TokenConverterProps) {
  const [fromToken, setFromToken] = useState(initialFromToken || getNativeToken().address);
  const [toToken, setToToken] = useState(initialToToken || SUPPORTED_TOKENS[1]?.address || getNativeToken().address);
  const [amount, setAmount] = useState(initialAmount);
  const [convertedAmount, setConvertedAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const nativeToken = getNativeToken();
  const fromTokenInfo = getTokenByAddress(fromToken) || nativeToken;
  const toTokenInfo = getTokenByAddress(toToken) || nativeToken;

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      convertAmount();
    } else {
      setConvertedAmount('');
    }
  }, [fromToken, toToken, amount]);

  const convertAmount = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setConvertedAmount('');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const converted = await TokenService.convertPrice(fromTokenInfo, toTokenInfo, amount);
      setConvertedAmount(converted);
      
      if (onConvert) {
        onConvert(fromToken, toToken, amount, converted);
      }
    } catch (err) {
      console.error('Conversion error:', err);
      setError('Failed to convert amount');
      setConvertedAmount('');
    } finally {
      setLoading(false);
    }
  };

  const swapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(convertedAmount);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-xl p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Token Converter</h3>
          <div className="text-sm text-gray-400">
            Convert between different tokens
          </div>
        </div>

        {/* From Token */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">From</label>
          <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
            <TokenIcon token={fromTokenInfo.symbol} size="md" />
            <div className="flex-1">
              <div className="text-white font-medium">{fromTokenInfo.name}</div>
              <div className="text-sm text-gray-400">{fromTokenInfo.symbol}</div>
            </div>
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-white text-right font-mono text-lg focus:outline-none w-32"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapTokens}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
          >
            <ArrowUpDown className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">To</label>
          <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
            <TokenIcon token={toTokenInfo.symbol} size="md" />
            <div className="flex-1">
              <div className="text-white font-medium">{toTokenInfo.name}</div>
              <div className="text-sm text-gray-400">{toTokenInfo.symbol}</div>
            </div>
            <div className="text-right">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-gray-400">Converting...</span>
                </div>
              ) : error ? (
                <div className="text-red-400 text-sm">{error}</div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-white font-mono text-lg">
                    {convertedAmount || '0.00'}
                  </span>
                  {convertedAmount && (
                    <button
                      onClick={copyToClipboard}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Token Selector */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">From Token</label>
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SUPPORTED_TOKENS.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">To Token</label>
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SUPPORTED_TOKENS.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conversion Rate */}
        {convertedAmount && amount && parseFloat(amount) > 0 && (
          <div className="text-center text-sm text-gray-400">
            1 {fromTokenInfo.symbol} = {(parseFloat(convertedAmount) / parseFloat(amount)).toFixed(6)} {toTokenInfo.symbol}
          </div>
        )}
      </div>
    </div>
  );
}
