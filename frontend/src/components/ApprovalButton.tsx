import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Loader, Shield } from 'lucide-react';
import { TokenService } from '../services/tokenService';
import { isETH } from '../config/tokens';

interface ApprovalButtonProps {
  tokenAddress: string;
  spenderAddress: string;
  requiredAmount: string;
  userAddress?: string;
  onApprovalComplete?: () => void;
  className?: string;
}

export default function ApprovalButton({
  tokenAddress,
  spenderAddress,
  requiredAmount,
  userAddress,
  onApprovalComplete,
  className = ''
}: ApprovalButtonProps) {
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [allowance, setAllowance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkApproval = useCallback(async () => {
    if (!userAddress || isETH(tokenAddress)) {
      setIsApproved(true);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const allowanceInfo = await TokenService.getTokenAllowance(
        tokenAddress,
        userAddress,
        spenderAddress
      );

      if (allowanceInfo) {
        setAllowance(allowanceInfo.allowance);
        setIsApproved(allowanceInfo.isApproved);
      }
    } catch (err) {
      console.error('Error checking approval:', err);
      setError('Failed to check approval status');
    } finally {
      setLoading(false);
    }
  }, [userAddress, tokenAddress, spenderAddress]);

  useEffect(() => {
    if (userAddress && tokenAddress && spenderAddress) {
      checkApproval();
    }
  }, [userAddress, tokenAddress, spenderAddress, checkApproval]);

  const handleApprove = async () => {
    if (!userAddress || isETH(tokenAddress)) return;

    setIsApproving(true);
    setError(null);

    try {
      // Approve with a slightly higher amount to avoid frequent approvals
      const approvalAmount = (parseFloat(requiredAmount) * 1.1).toString();
      
      const result = await TokenService.approveToken(
        tokenAddress,
        spenderAddress,
        approvalAmount
      );

      console.log('Approval successful:', result.txHash);
      
      // Refresh approval status
      await checkApproval();
      
      if (onApprovalComplete) {
        onApprovalComplete();
      }
    } catch (err: unknown) {
      console.error('Error approving token:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve token';
      setError(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  const formatAmount = (amount: string): string => {
    const num = parseFloat(amount);
    if (num === 0) return '0';
    if (num < 0.000001) return '< 0.000001';
    return num.toFixed(6);
  };

  const getButtonText = (): string => {
    if (loading) return 'Checking...';
    if (isApproving) return 'Approving...';
    if (isApproved) return 'Approved';
    return 'Approve Token';
  };

  const getButtonIcon = () => {
    if (loading || isApproving) {
      return <Loader className="w-4 h-4 animate-spin" />;
    }
    if (isApproved) {
      return <CheckCircle className="w-4 h-4" />;
    }
    return <Shield className="w-4 h-4" />;
  };

  const getButtonVariant = (): string => {
    if (isApproved) {
      return 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30';
    }
    if (isApproving) {
      return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
    }
    return 'bg-orange-500/20 border-orange-500/50 text-orange-400 hover:bg-orange-500/30';
  };

  // Don't show for ETH
  if (isETH(tokenAddress)) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Approval Status */}
      <div className="p-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Token Approval</span>
          </div>
          {isApproved && (
            <div className="flex items-center space-x-1 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Approved</span>
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-300 space-y-1">
          <div>Required: {formatAmount(requiredAmount)}</div>
          <div>Current Allowance: {formatAmount(allowance)}</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* Approval Button */}
      {!isApproved && (
        <button
          onClick={handleApprove}
          disabled={isApproving || loading}
          className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl border transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${getButtonVariant()}`}
        >
          {getButtonIcon()}
          <span className="font-medium">{getButtonText()}</span>
        </button>
      )}

      {/* Success Message */}
      {isApproved && (
        <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">
            Token approved! You can now proceed with the purchase.
          </span>
        </div>
      )}

      {/* Info Text */}
      <div className="text-xs text-gray-400 text-center">
        This allows the marketplace to spend your tokens for this purchase.
        You can revoke this permission anytime.
      </div>
    </div>
  );
}
