// Blockchain-specific transaction service
import { ethers } from 'ethers';
import { getProvider, getSigner } from '../../lib/web3';
import { getActiveTokens } from '../../config/tokens';

export interface BlockchainTransaction {
  hash: string;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  gasFee: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  receipt?: ethers.TransactionReceipt;
}

export interface TransactionFilter {
  from?: string;
  to?: string;
  blockNumber?: number;
  startBlock?: number;
  endBlock?: number;
  status?: 'pending' | 'confirmed' | 'failed';
}

export class BlockchainTransactionService {
  private provider: ethers.Provider | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    try {
      this.provider = getProvider();
      if (!this.provider) {
        throw new Error('Provider not available');
      }
    } catch (error) {
      console.error('Failed to initialize transaction service:', error);
      throw error;
    }
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(txHash: string): Promise<BlockchainTransaction | null> {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      const [tx, receipt] = await Promise.all([
        this.provider!.getTransaction(txHash),
        this.provider!.getTransactionReceipt(txHash)
      ]);

      if (!tx) {
        return null;
      }

      const gasFee = receipt ? 
        (receipt.gasUsed * tx.gasPrice).toString() : 
        '0';

      return {
        hash: tx.hash,
        blockNumber: tx.blockNumber || 0,
        blockHash: tx.blockHash || '',
        transactionIndex: tx.index || 0,
        from: tx.from,
        to: tx.to || '',
        value: ethers.formatEther(tx.value),
        gasUsed: receipt ? receipt.gasUsed.toString() : '0',
        gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei'),
        gasFee,
        status: receipt ? (receipt.status === 1 ? 'confirmed' : 'failed') : 'pending',
        timestamp: new Date().toISOString(), // You'd get this from block timestamp
        receipt
      };
    } catch (error) {
      console.error(`Error fetching transaction ${txHash}:`, error);
      return null;
    }
  }

  /**
   * Get transactions by address
   */
  async getTransactionsByAddress(
    address: string,
    limit: number = 50
  ): Promise<BlockchainTransaction[]> {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      // This is a simplified implementation
      // In a real app, you'd use a service like Alchemy or Infura
      // that provides transaction history APIs
      
      const currentBlock = await this.provider!.getBlockNumber();
      const transactions: BlockchainTransaction[] = [];

      // Search recent blocks for transactions involving this address
      const searchBlocks = Math.min(1000, limit * 10); // Search more blocks than needed
      
      for (let i = 0; i < searchBlocks && transactions.length < limit; i++) {
        try {
          const blockNumber = currentBlock - i;
          const block = await this.provider!.getBlock(blockNumber, true);
          
          if (!block || !block.transactions) continue;

          for (const tx of block.transactions) {
            if (transactions.length >= limit) break;
            
            if (typeof tx === 'object' && (tx.from === address || tx.to === address)) {
              const transaction = await this.getTransaction(tx.hash);
              if (transaction) {
                transactions.push(transaction);
              }
            }
          }
        } catch (error) {
          console.warn(`Error searching block ${currentBlock - i}:`, error);
          continue;
        }
      }

      return transactions.sort((a, b) => b.blockNumber - a.blockNumber);
    } catch (error) {
      console.error('Error fetching transactions by address:', error);
      throw error;
    }
  }

  /**
   * Get transactions by filter
   */
  async getTransactionsByFilter(filter: TransactionFilter): Promise<BlockchainTransaction[]> {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      const currentBlock = await this.provider!.getBlockNumber();
      const transactions: BlockchainTransaction[] = [];

      const startBlock = filter.startBlock || Math.max(0, currentBlock - 1000);
      const endBlock = filter.endBlock || currentBlock;

      for (let blockNumber = endBlock; blockNumber >= startBlock; blockNumber--) {
        try {
          const block = await this.provider!.getBlock(blockNumber, true);
          
          if (!block || !block.transactions) continue;

          for (const tx of block.transactions) {
            if (typeof tx !== 'object') continue;

            // Apply filters
            if (filter.from && tx.from !== filter.from) continue;
            if (filter.to && tx.to !== filter.to) continue;
            if (filter.blockNumber && tx.blockNumber !== filter.blockNumber) continue;

            const transaction = await this.getTransaction(tx.hash);
            if (transaction) {
              if (filter.status && transaction.status !== filter.status) continue;
              
              transactions.push(transaction);
            }
          }
        } catch (error) {
          console.warn(`Error searching block ${blockNumber}:`, error);
          continue;
        }
      }

      return transactions;
    } catch (error) {
      console.error('Error fetching transactions by filter:', error);
      throw error;
    }
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit: number = 20): Promise<BlockchainTransaction[]> {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      const currentBlock = await this.provider!.getBlockNumber();
      const transactions: BlockchainTransaction[] = [];

      // Search last 100 blocks for recent transactions
      for (let i = 0; i < 100 && transactions.length < limit; i++) {
        try {
          const blockNumber = currentBlock - i;
          const block = await this.provider!.getBlock(blockNumber, true);
          
          if (!block || !block.transactions) continue;

          for (const tx of block.transactions) {
            if (transactions.length >= limit) break;
            
            if (typeof tx === 'object') {
              const transaction = await this.getTransaction(tx.hash);
              if (transaction) {
                transactions.push(transaction);
              }
            }
          }
        } catch (error) {
          console.warn(`Error searching block ${currentBlock - i}:`, error);
          continue;
        }
      }

      return transactions.sort((a, b) => b.blockNumber - a.blockNumber);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    txHash: string,
    confirmations: number = 1
  ): Promise<BlockchainTransaction> {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      const receipt = await this.provider!.waitForTransaction(txHash, confirmations);
      
      if (!receipt) {
        throw new Error('Transaction not found');
      }

      const tx = await this.provider!.getTransaction(txHash);
      if (!tx) {
        throw new Error('Transaction details not found');
      }

      const gasFee = (receipt.gasUsed * tx.gasPrice).toString();

      return {
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        transactionIndex: receipt.index,
        from: tx.from,
        to: tx.to || '',
        value: ethers.formatEther(tx.value),
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei'),
        gasFee,
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        timestamp: new Date().toISOString(),
        receipt
      };
    } catch (error) {
      console.error(`Error waiting for transaction ${txHash}:`, error);
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      const receipt = await this.provider!.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return 'pending';
      }

      return receipt.status === 1 ? 'confirmed' : 'failed';
    } catch (error) {
      console.error(`Error getting transaction status ${txHash}:`, error);
      return 'pending';
    }
  }

  /**
   * Get gas price
   */
  async getGasPrice(): Promise<string> {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      const gasPrice = await this.provider!.getFeeData();
      return ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei');
    } catch (error) {
      console.error('Error getting gas price:', error);
      return '20'; // Default gas price
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(
    to: string,
    data: string,
    value?: string
  ): Promise<string> {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      const gasEstimate = await this.provider!.estimateGas({
        to,
        data,
        value: value ? ethers.parseEther(value) : undefined
      });

      return gasEstimate.toString();
    } catch (error) {
      console.error('Error estimating gas:', error);
      return '21000'; // Default gas limit
    }
  }

  /**
   * Get current block number
   */
  async getCurrentBlockNumber(): Promise<number> {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      return await this.provider!.getBlockNumber();
    } catch (error) {
      console.error('Error getting current block number:', error);
      return 0;
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<{
    chainId: number;
    name: string;
    blockNumber: number;
    gasPrice: string;
  }> {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      const [network, blockNumber, gasPrice] = await Promise.all([
        this.provider!.getNetwork(),
        this.provider!.getBlockNumber(),
        this.getGasPrice()
      ]);

      return {
        chainId: Number(network.chainId),
        name: network.name,
        blockNumber,
        gasPrice
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      throw error;
    }
  }
}
