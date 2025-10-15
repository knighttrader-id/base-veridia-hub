// Mock transaction service with API simulation
import { MOCK_TRANSACTIONS, getTransactionsByType, getTransactionsByToken, getTransactionsByStatus, getSuccessfulTransactions, getFailedTransactions, getRecentTransactions, getTotalVolume, getTotalVolumeUSD, getAverageGasFee, getTransactionStats } from '../../data/mocks/transactions';

export interface MockTransaction {
  id: string;
  hash: string;
  type: string;
  status: string;
  from: string;
  to: string;
  tokenId: string;
  tokenSymbol: string;
  amount: string;
  amountUSD: string;
  gasUsed: string;
  gasPrice: string;
  gasFee: string;
  gasFeeUSD: string;
  blockNumber: string;
  timestamp: string;
  createdAt: string;
  description: string;
  artworkTitle: string;
  artworkImage: string;
  isSuccessful: boolean;
  network: string;
  explorerUrl: string;
}

export interface MockTransactionFilter {
  type?: string;
  tokenSymbol?: string;
  status?: string;
  from?: string;
  to?: string;
  startDate?: string;
  endDate?: string;
}

export interface MockTransactionStats {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  successRate: string;
  totalVolumeUSD: string;
  averageGasFee: string;
  byToken: Record<string, number>;
  byType: Record<string, number>;
}

export class MockTransactionService {
  private static instance: MockTransactionService;
  private cache: Map<string, any> = new Map();
  private apiDelay: number = 500; // Simulate API delay

  private constructor() {}

  static getInstance(): MockTransactionService {
    if (!MockTransactionService.instance) {
      MockTransactionService.instance = new MockTransactionService();
    }
    return MockTransactionService.instance;
  }

  /**
   * Simulate API delay
   */
  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * this.apiDelay + 200; // 200-700ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Simulate API error (5% chance)
   */
  private async simulateError(): Promise<void> {
    if (Math.random() < 0.05) { // 5% error rate
      throw new Error('Mock API error: Transaction service temporarily unavailable');
    }
  }

  /**
   * Get all transactions
   */
  async getAllTransactions(): Promise<MockTransaction[]> {
    const cacheKey = 'all_transactions';
    
    if (this.cache.has(cacheKey)) {
      await this.simulateDelay();
      return this.cache.get(cacheKey);
    }

    await this.simulateDelay();
    await this.simulateError();

    const transactions = MOCK_TRANSACTIONS.map(tx => ({
      id: tx.id,
      hash: tx.hash,
      type: tx.type,
      status: tx.status,
      from: tx.from,
      to: tx.to,
      tokenId: tx.tokenId,
      tokenSymbol: tx.tokenSymbol,
      amount: tx.amount,
      amountUSD: tx.amountUSD,
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
      gasFee: tx.gasFee,
      gasFeeUSD: tx.gasFeeUSD,
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp,
      createdAt: tx.createdAt,
      description: tx.description,
      artworkTitle: tx.artworkTitle,
      artworkImage: tx.artworkImage,
      isSuccessful: tx.isSuccessful,
      network: tx.network,
      explorerUrl: tx.explorerUrl
    }));

    this.cache.set(cacheKey, transactions);
    return transactions;
  }

  /**
   * Get transactions by type
   */
  async getTransactionsByType(type: string): Promise<MockTransaction[]> {
    await this.simulateDelay();
    await this.simulateError();

    const transactions = getTransactionsByType(type);
    return transactions.map(tx => ({
      id: tx.id,
      hash: tx.hash,
      type: tx.type,
      status: tx.status,
      from: tx.from,
      to: tx.to,
      tokenId: tx.tokenId,
      tokenSymbol: tx.tokenSymbol,
      amount: tx.amount,
      amountUSD: tx.amountUSD,
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
      gasFee: tx.gasFee,
      gasFeeUSD: tx.gasFeeUSD,
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp,
      createdAt: tx.createdAt,
      description: tx.description,
      artworkTitle: tx.artworkTitle,
      artworkImage: tx.artworkImage,
      isSuccessful: tx.isSuccessful,
      network: tx.network,
      explorerUrl: tx.explorerUrl
    }));
  }

  /**
   * Get transactions by token
   */
  async getTransactionsByToken(tokenSymbol: string): Promise<MockTransaction[]> {
    await this.simulateDelay();
    await this.simulateError();

    const transactions = getTransactionsByToken(tokenSymbol);
    return transactions.map(tx => ({
      id: tx.id,
      hash: tx.hash,
      type: tx.type,
      status: tx.status,
      from: tx.from,
      to: tx.to,
      tokenId: tx.tokenId,
      tokenSymbol: tx.tokenSymbol,
      amount: tx.amount,
      amountUSD: tx.amountUSD,
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
      gasFee: tx.gasFee,
      gasFeeUSD: tx.gasFeeUSD,
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp,
      createdAt: tx.createdAt,
      description: tx.description,
      artworkTitle: tx.artworkTitle,
      artworkImage: tx.artworkImage,
      isSuccessful: tx.isSuccessful,
      network: tx.network,
      explorerUrl: tx.explorerUrl
    }));
  }

  /**
   * Get transactions by status
   */
  async getTransactionsByStatus(status: string): Promise<MockTransaction[]> {
    await this.simulateDelay();
    await this.simulateError();

    const transactions = getTransactionsByStatus(status);
    return transactions.map(tx => ({
      id: tx.id,
      hash: tx.hash,
      type: tx.type,
      status: tx.status,
      from: tx.from,
      to: tx.to,
      tokenId: tx.tokenId,
      tokenSymbol: tx.tokenSymbol,
      amount: tx.amount,
      amountUSD: tx.amountUSD,
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
      gasFee: tx.gasFee,
      gasFeeUSD: tx.gasFeeUSD,
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp,
      createdAt: tx.createdAt,
      description: tx.description,
      artworkTitle: tx.artworkTitle,
      artworkImage: tx.artworkImage,
      isSuccessful: tx.isSuccessful,
      network: tx.network,
      explorerUrl: tx.explorerUrl
    }));
  }

  /**
   * Get transactions by user
   */
  async getTransactionsByUser(userAddress: string): Promise<MockTransaction[]> {
    await this.simulateDelay();
    await this.simulateError();

    const transactions = MOCK_TRANSACTIONS.filter(tx => 
      tx.from.toLowerCase() === userAddress.toLowerCase() || 
      tx.to.toLowerCase() === userAddress.toLowerCase()
    );

    return transactions.map(tx => ({
      id: tx.id,
      hash: tx.hash,
      type: tx.type,
      status: tx.status,
      from: tx.from,
      to: tx.to,
      tokenId: tx.tokenId,
      tokenSymbol: tx.tokenSymbol,
      amount: tx.amount,
      amountUSD: tx.amountUSD,
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
      gasFee: tx.gasFee,
      gasFeeUSD: tx.gasFeeUSD,
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp,
      createdAt: tx.createdAt,
      description: tx.description,
      artworkTitle: tx.artworkTitle,
      artworkImage: tx.artworkImage,
      isSuccessful: tx.isSuccessful,
      network: tx.network,
      explorerUrl: tx.explorerUrl
    }));
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit: number = 20): Promise<MockTransaction[]> {
    await this.simulateDelay();
    await this.simulateError();

    const transactions = getRecentTransactions(limit);
    return transactions.map(tx => ({
      id: tx.id,
      hash: tx.hash,
      type: tx.type,
      status: tx.status,
      from: tx.from,
      to: tx.to,
      tokenId: tx.tokenId,
      tokenSymbol: tx.tokenSymbol,
      amount: tx.amount,
      amountUSD: tx.amountUSD,
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
      gasFee: tx.gasFee,
      gasFeeUSD: tx.gasFeeUSD,
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp,
      createdAt: tx.createdAt,
      description: tx.description,
      artworkTitle: tx.artworkTitle,
      artworkImage: tx.artworkImage,
      isSuccessful: tx.isSuccessful,
      network: tx.network,
      explorerUrl: tx.explorerUrl
    }));
  }

  /**
   * Get transaction by hash
   */
  async getTransactionByHash(txHash: string): Promise<MockTransaction | null> {
    await this.simulateDelay();
    await this.simulateError();

    const transaction = MOCK_TRANSACTIONS.find(tx => tx.hash === txHash);
    if (!transaction) return null;

    return {
      id: transaction.id,
      hash: transaction.hash,
      type: transaction.type,
      status: transaction.status,
      from: transaction.from,
      to: transaction.to,
      tokenId: transaction.tokenId,
      tokenSymbol: transaction.tokenSymbol,
      amount: transaction.amount,
      amountUSD: transaction.amountUSD,
      gasUsed: transaction.gasUsed,
      gasPrice: transaction.gasPrice,
      gasFee: transaction.gasFee,
      gasFeeUSD: transaction.gasFeeUSD,
      blockNumber: transaction.blockNumber,
      timestamp: transaction.timestamp,
      createdAt: transaction.createdAt,
      description: transaction.description,
      artworkTitle: transaction.artworkTitle,
      artworkImage: transaction.artworkImage,
      isSuccessful: transaction.isSuccessful,
      network: transaction.network,
      explorerUrl: transaction.explorerUrl
    };
  }

  /**
   * Filter transactions
   */
  async filterTransactions(filter: MockTransactionFilter): Promise<MockTransaction[]> {
    await this.simulateDelay();
    await this.simulateError();

    let transactions = MOCK_TRANSACTIONS;

    if (filter.type) {
      transactions = transactions.filter(tx => tx.type === filter.type);
    }

    if (filter.tokenSymbol) {
      transactions = transactions.filter(tx => tx.tokenSymbol === filter.tokenSymbol);
    }

    if (filter.status) {
      transactions = transactions.filter(tx => tx.status === filter.status);
    }

    if (filter.from) {
      transactions = transactions.filter(tx => tx.from.toLowerCase() === filter.from!.toLowerCase());
    }

    if (filter.to) {
      transactions = transactions.filter(tx => tx.to.toLowerCase() === filter.to!.toLowerCase());
    }

    if (filter.startDate && filter.endDate) {
      const startDate = new Date(filter.startDate);
      const endDate = new Date(filter.endDate);
      transactions = transactions.filter(tx => {
        const txDate = new Date(tx.timestamp);
        return txDate >= startDate && txDate <= endDate;
      });
    }

    return transactions.map(tx => ({
      id: tx.id,
      hash: tx.hash,
      type: tx.type,
      status: tx.status,
      from: tx.from,
      to: tx.to,
      tokenId: tx.tokenId,
      tokenSymbol: tx.tokenSymbol,
      amount: tx.amount,
      amountUSD: tx.amountUSD,
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
      gasFee: tx.gasFee,
      gasFeeUSD: tx.gasFeeUSD,
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp,
      createdAt: tx.createdAt,
      description: tx.description,
      artworkTitle: tx.artworkTitle,
      artworkImage: tx.artworkImage,
      isSuccessful: tx.isSuccessful,
      network: tx.network,
      explorerUrl: tx.explorerUrl
    }));
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(): Promise<MockTransactionStats> {
    await this.simulateDelay();
    await this.simulateError();

    const stats = getTransactionStats();
    const byToken = MOCK_TRANSACTIONS.reduce((acc, tx) => {
      acc[tx.tokenSymbol] = (acc[tx.tokenSymbol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = MOCK_TRANSACTIONS.reduce((acc, tx) => {
      acc[tx.type] = (acc[tx.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: stats.total,
      successful: stats.successful,
      failed: stats.failed,
      pending: stats.pending,
      successRate: stats.successRate,
      totalVolumeUSD: stats.totalVolumeUSD,
      averageGasFee: stats.averageGasFee,
      byToken,
      byType
    };
  }

  /**
   * Get total volume
   */
  async getTotalVolume(tokenSymbol?: string): Promise<string> {
    await this.simulateDelay();
    await this.simulateError();

    const volume = getTotalVolume(tokenSymbol);
    return volume.toString();
  }

  /**
   * Get total volume in USD
   */
  async getTotalVolumeUSD(): Promise<string> {
    await this.simulateDelay();
    await this.simulateError();

    const volume = getTotalVolumeUSD();
    return volume.toFixed(2);
  }

  /**
   * Get average gas fee
   */
  async getAverageGasFee(): Promise<string> {
    await this.simulateDelay();
    await this.simulateError();

    return getAverageGasFee();
  }

  /**
   * Simulate new transaction
   */
  async simulateTransaction(
    type: string,
    from: string,
    to: string,
    amount: string,
    tokenSymbol: string
  ): Promise<{ txHash: string; success: boolean }> {
    await this.simulateDelay();
    await this.simulateError();

    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const success = Math.random() > 0.1; // 90% success rate

    console.log(`Mock transaction: ${type} from ${from} to ${to} for ${amount} ${tokenSymbol}`);

    return {
      txHash: mockTxHash,
      success
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Set API delay for testing
   */
  setApiDelay(delay: number): void {
    this.apiDelay = delay;
  }
}
