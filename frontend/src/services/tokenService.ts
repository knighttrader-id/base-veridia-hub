import { ethers } from 'ethers';
import { getContract, getProvider, getSigner } from '../lib/web3';
import { getActiveTokens, isETH, formatTokenAmount } from '../config/tokens';

// ERC20 ABI for token operations
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function totalSupply() view returns (uint256)"
];

export interface TokenBalance {
  token: string;
  symbol: string;
  balance: string;
  decimals: number;
  formatted: string;
}

export interface TokenAllowance {
  token: string;
  symbol: string;
  allowance: string;
  decimals: number;
  formatted: string;
  isApproved: boolean;
}

export class TokenService {
  /**
   * Get user's balance for a specific token
   */
  static async getTokenBalance(tokenAddress: string, userAddress: string): Promise<TokenBalance | null> {
    try {
      if (isETH(tokenAddress)) {
        // ETH balance
        const provider = getProvider();
        if (!provider) return null;
        
        const balance = await provider.getBalance(userAddress);
        const formatted = ethers.formatEther(balance);
        
        return {
          token: tokenAddress,
          symbol: 'ETH',
          balance: balance.toString(),
          decimals: 18,
          formatted
        };
      } else {
        // ERC20 token balance
        const provider = getProvider();
        if (!provider) return null;
        
        const tokenContract = getContract(tokenAddress, ERC20_ABI, provider);
        const [balance, decimals, symbol] = await Promise.all([
          tokenContract.balanceOf(userAddress),
          tokenContract.decimals(),
          tokenContract.symbol()
        ]);
        
        const formatted = formatTokenAmount(balance.toString(), decimals);
        
        return {
          token: tokenAddress,
          symbol,
          balance: balance.toString(),
          decimals,
          formatted
        };
      }
    } catch (error) {
      console.error('Error getting token balance:', error);
      return null;
    }
  }

  /**
   * Get user's balances for all active tokens
   */
  static async getAllTokenBalances(userAddress: string): Promise<TokenBalance[]> {
    const activeTokens = getActiveTokens();
    const balances: TokenBalance[] = [];

    for (const [, tokenInfo] of Object.entries(activeTokens)) {
      const balance = await this.getTokenBalance(tokenInfo.address, userAddress);
      if (balance) {
        balances.push(balance);
      }
    }

    return balances;
  }

  /**
   * Check token allowance for marketplace
   */
  static async getTokenAllowance(
    tokenAddress: string, 
    userAddress: string, 
    spenderAddress: string
  ): Promise<TokenAllowance | null> {
    try {
      if (isETH(tokenAddress)) {
        // ETH doesn't need allowance
        return {
          token: tokenAddress,
          symbol: 'ETH',
          allowance: '0',
          decimals: 18,
          formatted: '0',
          isApproved: true
        };
      }

      const provider = getProvider();
      if (!provider) return null;

      const tokenContract = getContract(tokenAddress, ERC20_ABI, provider);
      const [allowance, decimals, symbol] = await Promise.all([
        tokenContract.allowance(userAddress, spenderAddress),
        tokenContract.decimals(),
        tokenContract.symbol()
      ]);

      const formatted = formatTokenAmount(allowance.toString(), decimals);
      const isApproved = allowance > 0;

      return {
        token: tokenAddress,
        symbol,
        allowance: allowance.toString(),
        decimals,
        formatted,
        isApproved
      };
    } catch (error) {
      console.error('Error getting token allowance:', error);
      return null;
    }
  }

  /**
   * Approve token spending for marketplace
   */
  static async approveToken(
    tokenAddress: string,
    spenderAddress: string,
    amount: string
  ): Promise<{ txHash: string }> {
    try {
      if (isETH(tokenAddress)) {
        throw new Error('ETH does not require approval');
      }

      const signer = await getSigner();
      if (!signer) throw new Error('Wallet not connected');

      const tokenContract = getContract(tokenAddress, ERC20_ABI, signer);
      const tx = await tokenContract.approve(spenderAddress, amount);
      const receipt = await tx.wait();

      return { txHash: receipt.hash };
    } catch (error) {
      console.error('Error approving token:', error);
      throw error;
    }
  }

  /**
   * Get token info by address
   */
  static async getTokenInfo(tokenAddress: string): Promise<{
    symbol: string;
    name: string;
    decimals: number;
  } | null> {
    try {
      if (isETH(tokenAddress)) {
        return {
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18
        };
      }

      const provider = getProvider();
      if (!provider) return null;

      const tokenContract = getContract(tokenAddress, ERC20_ABI, provider);
      const [symbol, name, decimals] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.name(),
        tokenContract.decimals()
      ]);

      return { symbol, name, decimals };
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  }

  /**
   * Convert price between tokens (simplified - use price oracle in production)
   */
  static convertPrice(
    price: string,
    fromToken: string,
    toToken: string
  ): string {
    const activeTokens = getActiveTokens();
    const fromTokenInfo = Object.values(activeTokens).find(t => t.address === fromToken);
    const toTokenInfo = Object.values(activeTokens).find(t => t.address === toToken);

    if (!fromTokenInfo || !toTokenInfo) {
      return price; // Return original if tokens not found
    }

    // Simplified conversion (1:1 for stablecoins, use oracle in production)
    const priceNum = parseFloat(price);
    const divisor = Math.pow(10, fromTokenInfo.decimals - toTokenInfo.decimals);
    const converted = priceNum / divisor;

    return converted.toString();
  }

  /**
   * Format token amount for display
   */
  static formatAmount(amount: string, decimals: number, maxDecimals: number = 6): string {
    const num = parseFloat(amount);
    const divisor = Math.pow(10, decimals);
    const formatted = (num / divisor).toFixed(maxDecimals);
    return parseFloat(formatted).toString();
  }

  /**
   * Check if user has sufficient balance
   */
  static async hasSufficientBalance(
    tokenAddress: string,
    userAddress: string,
    requiredAmount: string
  ): Promise<boolean> {
    try {
      const balance = await this.getTokenBalance(tokenAddress, userAddress);
      if (!balance) return false;

      const balanceNum = parseFloat(balance.balance);
      const requiredNum = parseFloat(requiredAmount);
      
      return balanceNum >= requiredNum;
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  }

  /**
   * Check if token is approved for spending
   */
  static async isTokenApproved(
    tokenAddress: string,
    userAddress: string,
    spenderAddress: string,
    requiredAmount: string
  ): Promise<boolean> {
    try {
      if (isETH(tokenAddress)) return true;

      const allowance = await this.getTokenAllowance(tokenAddress, userAddress, spenderAddress);
      if (!allowance) return false;

      const allowanceNum = parseFloat(allowance.allowance);
      const requiredNum = parseFloat(requiredAmount);
      
      return allowanceNum >= requiredNum;
    } catch (error) {
      console.error('Error checking approval:', error);
      return false;
    }
  }

  /**
   * Get recommended gas limit for token approval
   */
  static getApprovalGasLimit(): number {
    return 100000; // Standard gas limit for ERC20 approval
  }

  /**
   * Get recommended gas limit for token transfer
   */
  static getTransferGasLimit(): number {
    return 150000; // Standard gas limit for ERC20 transfer
  }
}
