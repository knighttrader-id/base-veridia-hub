// Central export for blockchain services
export * from './artworkService';
export * from './marketplaceService';
export * from './transactionService';

// Re-export classes for easy access
export { BlockchainArtworkService } from './artworkService';
export { BlockchainMarketplaceService } from './marketplaceService';
export { BlockchainTransactionService } from './transactionService';

// Re-export types
export type { BlockchainArtwork, ArtworkMetadata } from './artworkService';
export type { MarketplaceListing, MarketplaceStats, PurchaseParams } from './marketplaceService';
export type { BlockchainTransaction, TransactionFilter } from './transactionService';
