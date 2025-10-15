// Central export for mock services
export * from './artworkService';
export * from './marketplaceService';
export * from './transactionService';

// Re-export classes for easy access
export { MockArtworkService } from './artworkService';
export { MockMarketplaceService } from './marketplaceService';
export { MockTransactionService } from './transactionService';

// Re-export types
export type { MockArtworkItem, MockMarketplaceArtwork } from './artworkService';
export type { MockMarketplaceListing, MockPurchaseParams, MockMarketplaceStats } from './marketplaceService';
export type { MockTransaction, MockTransactionFilter, MockTransactionStats } from './transactionService';
