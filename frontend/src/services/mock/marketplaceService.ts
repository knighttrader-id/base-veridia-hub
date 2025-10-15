// Mock marketplace service with API simulation
import { MOCK_LISTINGS, getActiveListings, getFeaturedListings, getVerifiedListings, getListingsByCategory, getListingsByCurrency, getAuctionListings, getListingStats } from '../../data/mocks/listings';
import { MOCK_ARTWORKS } from '../../data/mocks/artworks';

export interface MockMarketplaceListing {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artworkImage: string;
  creator: string;
  creatorName: string;
  licenseType: string;
  price: string;
  priceUSDC: string;
  priceUSDT: string;
  priceDAI: string;
  priceIDRX: string;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  createdAt: string;
  expiresAt: string;
  views: number;
  likes: number;
  offers: number;
  description: string;
  tags: string[];
  category: string;
  fileSize: string;
  format: string;
  dimensions: string;
  licenseTerms: string;
  usageRights: string[];
  restrictions: string[];
  royalties: string;
  isAuction: boolean;
  auctionEndTime: string;
  currentBid: string;
  reservePrice: string;
  buyNowPrice: string;
}

export interface MockPurchaseParams {
  tokenId: string;
  paymentToken: string;
  price: string;
  buyer: string;
}

export interface MockMarketplaceStats {
  totalListings: number;
  activeListings: number;
  featuredListings: number;
  verifiedListings: number;
  auctionListings: number;
  totalVolume: string;
  averagePrice: string;
  byCategory: Record<string, number>;
  byCurrency: Record<string, number>;
}

export class MockMarketplaceService {
  private static instance: MockMarketplaceService;
  private cache: Map<string, any> = new Map();
  private apiDelay: number = 500; // Simulate API delay

  private constructor() {}

  static getInstance(): MockMarketplaceService {
    if (!MockMarketplaceService.instance) {
      MockMarketplaceService.instance = new MockMarketplaceService();
    }
    return MockMarketplaceService.instance;
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
      throw new Error('Mock API error: Marketplace service temporarily unavailable');
    }
  }

  /**
   * Get all listings
   */
  async getAllListings(): Promise<MockMarketplaceListing[]> {
    const cacheKey = 'all_listings';
    
    if (this.cache.has(cacheKey)) {
      await this.simulateDelay();
      return this.cache.get(cacheKey);
    }

    await this.simulateDelay();
    await this.simulateError();

    const listings = MOCK_LISTINGS.map(listing => ({
      id: listing.id,
      artworkId: listing.artworkId,
      artworkTitle: listing.artworkTitle,
      artworkImage: listing.artworkImage,
      creator: listing.creator,
      creatorName: listing.creatorName,
      licenseType: listing.licenseType,
      price: listing.price,
      priceUSDC: listing.priceUSDC,
      priceUSDT: listing.priceUSDT,
      priceDAI: listing.priceDAI,
      priceIDRX: listing.priceIDRX,
      currency: listing.currency,
      isActive: listing.isActive,
      isFeatured: listing.isFeatured,
      isVerified: listing.isVerified,
      createdAt: listing.createdAt,
      expiresAt: listing.expiresAt,
      views: listing.views,
      likes: listing.likes,
      offers: listing.offers,
      description: listing.description,
      tags: listing.tags,
      category: listing.category,
      fileSize: listing.fileSize,
      format: listing.format,
      dimensions: listing.dimensions,
      licenseTerms: listing.licenseTerms,
      usageRights: listing.usageRights,
      restrictions: listing.restrictions,
      royalties: listing.royalties,
      isAuction: listing.isAuction,
      auctionEndTime: listing.auctionEndTime,
      currentBid: listing.currentBid,
      reservePrice: listing.reservePrice,
      buyNowPrice: listing.buyNowPrice
    }));

    this.cache.set(cacheKey, listings);
    return listings;
  }

  /**
   * Get active listings
   */
  async getActiveListings(): Promise<MockMarketplaceListing[]> {
    await this.simulateDelay();
    await this.simulateError();

    const listings = getActiveListings();
    return listings.map(listing => ({
      id: listing.id,
      artworkId: listing.artworkId,
      artworkTitle: listing.artworkTitle,
      artworkImage: listing.artworkImage,
      creator: listing.creator,
      creatorName: listing.creatorName,
      licenseType: listing.licenseType,
      price: listing.price,
      priceUSDC: listing.priceUSDC,
      priceUSDT: listing.priceUSDT,
      priceDAI: listing.priceDAI,
      priceIDRX: listing.priceIDRX,
      currency: listing.currency,
      isActive: listing.isActive,
      isFeatured: listing.isFeatured,
      isVerified: listing.isVerified,
      createdAt: listing.createdAt,
      expiresAt: listing.expiresAt,
      views: listing.views,
      likes: listing.likes,
      offers: listing.offers,
      description: listing.description,
      tags: listing.tags,
      category: listing.category,
      fileSize: listing.fileSize,
      format: listing.format,
      dimensions: listing.dimensions,
      licenseTerms: listing.licenseTerms,
      usageRights: listing.usageRights,
      restrictions: listing.restrictions,
      royalties: listing.royalties,
      isAuction: listing.isAuction,
      auctionEndTime: listing.auctionEndTime,
      currentBid: listing.currentBid,
      reservePrice: listing.reservePrice,
      buyNowPrice: listing.buyNowPrice
    }));
  }

  /**
   * Get featured listings
   */
  async getFeaturedListings(): Promise<MockMarketplaceListing[]> {
    await this.simulateDelay();
    await this.simulateError();

    const listings = getFeaturedListings();
    return listings.map(listing => ({
      id: listing.id,
      artworkId: listing.artworkId,
      artworkTitle: listing.artworkTitle,
      artworkImage: listing.artworkImage,
      creator: listing.creator,
      creatorName: listing.creatorName,
      licenseType: listing.licenseType,
      price: listing.price,
      priceUSDC: listing.priceUSDC,
      priceUSDT: listing.priceUSDT,
      priceDAI: listing.priceDAI,
      priceIDRX: listing.priceIDRX,
      currency: listing.currency,
      isActive: listing.isActive,
      isFeatured: listing.isFeatured,
      isVerified: listing.isVerified,
      createdAt: listing.createdAt,
      expiresAt: listing.expiresAt,
      views: listing.views,
      likes: listing.likes,
      offers: listing.offers,
      description: listing.description,
      tags: listing.tags,
      category: listing.category,
      fileSize: listing.fileSize,
      format: listing.format,
      dimensions: listing.dimensions,
      licenseTerms: listing.licenseTerms,
      usageRights: listing.usageRights,
      restrictions: listing.restrictions,
      royalties: listing.royalties,
      isAuction: listing.isAuction,
      auctionEndTime: listing.auctionEndTime,
      currentBid: listing.currentBid,
      reservePrice: listing.reservePrice,
      buyNowPrice: listing.buyNowPrice
    }));
  }

  /**
   * Get listings by category
   */
  async getListingsByCategory(category: string): Promise<MockMarketplaceListing[]> {
    await this.simulateDelay();
    await this.simulateError();

    const listings = getListingsByCategory(category);
    return listings.map(listing => ({
      id: listing.id,
      artworkId: listing.artworkId,
      artworkTitle: listing.artworkTitle,
      artworkImage: listing.artworkImage,
      creator: listing.creator,
      creatorName: listing.creatorName,
      licenseType: listing.licenseType,
      price: listing.price,
      priceUSDC: listing.priceUSDC,
      priceUSDT: listing.priceUSDT,
      priceDAI: listing.priceDAI,
      priceIDRX: listing.priceIDRX,
      currency: listing.currency,
      isActive: listing.isActive,
      isFeatured: listing.isFeatured,
      isVerified: listing.isVerified,
      createdAt: listing.createdAt,
      expiresAt: listing.expiresAt,
      views: listing.views,
      likes: listing.likes,
      offers: listing.offers,
      description: listing.description,
      tags: listing.tags,
      category: listing.category,
      fileSize: listing.fileSize,
      format: listing.format,
      dimensions: listing.dimensions,
      licenseTerms: listing.licenseTerms,
      usageRights: listing.usageRights,
      restrictions: listing.restrictions,
      royalties: listing.royalties,
      isAuction: listing.isAuction,
      auctionEndTime: listing.auctionEndTime,
      currentBid: listing.currentBid,
      reservePrice: listing.reservePrice,
      buyNowPrice: listing.buyNowPrice
    }));
  }

  /**
   * Get listings by currency
   */
  async getListingsByCurrency(currency: string): Promise<MockMarketplaceListing[]> {
    await this.simulateDelay();
    await this.simulateError();

    const listings = getListingsByCurrency(currency);
    return listings.map(listing => ({
      id: listing.id,
      artworkId: listing.artworkId,
      artworkTitle: listing.artworkTitle,
      artworkImage: listing.artworkImage,
      creator: listing.creator,
      creatorName: listing.creatorName,
      licenseType: listing.licenseType,
      price: listing.price,
      priceUSDC: listing.priceUSDC,
      priceUSDT: listing.priceUSDT,
      priceDAI: listing.priceDAI,
      priceIDRX: listing.priceIDRX,
      currency: listing.currency,
      isActive: listing.isActive,
      isFeatured: listing.isFeatured,
      isVerified: listing.isVerified,
      createdAt: listing.createdAt,
      expiresAt: listing.expiresAt,
      views: listing.views,
      likes: listing.likes,
      offers: listing.offers,
      description: listing.description,
      tags: listing.tags,
      category: listing.category,
      fileSize: listing.fileSize,
      format: listing.format,
      dimensions: listing.dimensions,
      licenseTerms: listing.licenseTerms,
      usageRights: listing.usageRights,
      restrictions: listing.restrictions,
      royalties: listing.royalties,
      isAuction: listing.isAuction,
      auctionEndTime: listing.auctionEndTime,
      currentBid: listing.currentBid,
      reservePrice: listing.reservePrice,
      buyNowPrice: listing.buyNowPrice
    }));
  }

  /**
   * Get auction listings
   */
  async getAuctionListings(): Promise<MockMarketplaceListing[]> {
    await this.simulateDelay();
    await this.simulateError();

    const listings = getAuctionListings();
    return listings.map(listing => ({
      id: listing.id,
      artworkId: listing.artworkId,
      artworkTitle: listing.artworkTitle,
      artworkImage: listing.artworkImage,
      creator: listing.creator,
      creatorName: listing.creatorName,
      licenseType: listing.licenseType,
      price: listing.price,
      priceUSDC: listing.priceUSDC,
      priceUSDT: listing.priceUSDT,
      priceDAI: listing.priceDAI,
      priceIDRX: listing.priceIDRX,
      currency: listing.currency,
      isActive: listing.isActive,
      isFeatured: listing.isFeatured,
      isVerified: listing.isVerified,
      createdAt: listing.createdAt,
      expiresAt: listing.expiresAt,
      views: listing.views,
      likes: listing.likes,
      offers: listing.offers,
      description: listing.description,
      tags: listing.tags,
      category: listing.category,
      fileSize: listing.fileSize,
      format: listing.format,
      dimensions: listing.dimensions,
      licenseTerms: listing.licenseTerms,
      usageRights: listing.usageRights,
      restrictions: listing.restrictions,
      royalties: listing.royalties,
      isAuction: listing.isAuction,
      auctionEndTime: listing.auctionEndTime,
      currentBid: listing.currentBid,
      reservePrice: listing.reservePrice,
      buyNowPrice: listing.buyNowPrice
    }));
  }

  /**
   * Get listing by ID
   */
  async getListingById(listingId: string): Promise<MockMarketplaceListing | null> {
    await this.simulateDelay();
    await this.simulateError();

    const listing = MOCK_LISTINGS.find(l => l.id === listingId);
    if (!listing) return null;

    return {
      id: listing.id,
      artworkId: listing.artworkId,
      artworkTitle: listing.artworkTitle,
      artworkImage: listing.artworkImage,
      creator: listing.creator,
      creatorName: listing.creatorName,
      licenseType: listing.licenseType,
      price: listing.price,
      priceUSDC: listing.priceUSDC,
      priceUSDT: listing.priceUSDT,
      priceDAI: listing.priceDAI,
      priceIDRX: listing.priceIDRX,
      currency: listing.currency,
      isActive: listing.isActive,
      isFeatured: listing.isFeatured,
      isVerified: listing.isVerified,
      createdAt: listing.createdAt,
      expiresAt: listing.expiresAt,
      views: listing.views,
      likes: listing.likes,
      offers: listing.offers,
      description: listing.description,
      tags: listing.tags,
      category: listing.category,
      fileSize: listing.fileSize,
      format: listing.format,
      dimensions: listing.dimensions,
      licenseTerms: listing.licenseTerms,
      usageRights: listing.usageRights,
      restrictions: listing.restrictions,
      royalties: listing.royalties,
      isAuction: listing.isAuction,
      auctionEndTime: listing.auctionEndTime,
      currentBid: listing.currentBid,
      reservePrice: listing.reservePrice,
      buyNowPrice: listing.buyNowPrice
    };
  }

  /**
   * Purchase item (mock)
   */
  async purchaseItem(params: MockPurchaseParams): Promise<{ txHash: string; success: boolean }> {
    await this.simulateDelay();
    await this.simulateError();

    // Simulate purchase process
    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1;

    if (success) {
      // Simulate updating listing status
      console.log(`Mock purchase: ${params.buyer} bought item ${params.tokenId} for ${params.price} ${params.paymentToken}`);
    }

    return {
      txHash: mockTxHash,
      success
    };
  }

  /**
   * List item for sale (mock)
   */
  async listItem(
    tokenId: string,
    price: string,
    currency: string,
    licenseType: string = 'commercial'
  ): Promise<{ txHash: string; listingId: string }> {
    await this.simulateDelay();
    await this.simulateError();

    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const listingId = (MOCK_LISTINGS.length + 1).toString();

    console.log(`Mock listing: Item ${tokenId} listed for ${price} ${currency}`);

    return {
      txHash: mockTxHash,
      listingId
    };
  }

  /**
   * Cancel listing (mock)
   */
  async cancelListing(listingId: string): Promise<{ txHash: string; success: boolean }> {
    await this.simulateDelay();
    await this.simulateError();

    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const success = Math.random() > 0.05; // 95% success rate

    console.log(`Mock cancellation: Listing ${listingId} ${success ? 'cancelled' : 'failed to cancel'}`);

    return {
      txHash: mockTxHash,
      success
    };
  }

  /**
   * Place bid on auction (mock)
   */
  async placeBid(
    listingId: string,
    bidAmount: string,
    bidder: string
  ): Promise<{ txHash: string; success: boolean; isHighestBid: boolean }> {
    await this.simulateDelay();
    await this.simulateError();

    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const success = Math.random() > 0.1; // 90% success rate
    const isHighestBid = success && Math.random() > 0.3; // 70% chance of being highest bid

    console.log(`Mock bid: ${bidder} bid ${bidAmount} on listing ${listingId}`);

    return {
      txHash: mockTxHash,
      success,
      isHighestBid
    };
  }

  /**
   * Get marketplace statistics
   */
  async getMarketplaceStats(): Promise<MockMarketplaceStats> {
    await this.simulateDelay();
    await this.simulateError();

    const stats = getListingStats();
    const totalVolume = MOCK_LISTINGS.reduce((sum, listing) => {
      return sum + parseFloat(listing.price);
    }, 0);
    const averagePrice = totalVolume / MOCK_LISTINGS.length;

    const byCategory = MOCK_LISTINGS.reduce((acc, listing) => {
      acc[listing.category] = (acc[listing.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCurrency = MOCK_LISTINGS.reduce((acc, listing) => {
      acc[listing.currency] = (acc[listing.currency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalListings: stats.total,
      activeListings: stats.active,
      featuredListings: stats.featured,
      verifiedListings: stats.verified,
      auctionListings: stats.auctions,
      totalVolume: totalVolume.toFixed(2),
      averagePrice: averagePrice.toFixed(2),
      byCategory,
      byCurrency
    };
  }

  /**
   * Search listings
   */
  async searchListings(query: string): Promise<MockMarketplaceListing[]> {
    await this.simulateDelay();
    await this.simulateError();

    const listings = MOCK_LISTINGS.filter(listing => 
      listing.artworkTitle.toLowerCase().includes(query.toLowerCase()) ||
      listing.description.toLowerCase().includes(query.toLowerCase()) ||
      listing.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    return listings.map(listing => ({
      id: listing.id,
      artworkId: listing.artworkId,
      artworkTitle: listing.artworkTitle,
      artworkImage: listing.artworkImage,
      creator: listing.creator,
      creatorName: listing.creatorName,
      licenseType: listing.licenseType,
      price: listing.price,
      priceUSDC: listing.priceUSDC,
      priceUSDT: listing.priceUSDT,
      priceDAI: listing.priceDAI,
      priceIDRX: listing.priceIDRX,
      currency: listing.currency,
      isActive: listing.isActive,
      isFeatured: listing.isFeatured,
      isVerified: listing.isVerified,
      createdAt: listing.createdAt,
      expiresAt: listing.expiresAt,
      views: listing.views,
      likes: listing.likes,
      offers: listing.offers,
      description: listing.description,
      tags: listing.tags,
      category: listing.category,
      fileSize: listing.fileSize,
      format: listing.format,
      dimensions: listing.dimensions,
      licenseTerms: listing.licenseTerms,
      usageRights: listing.usageRights,
      restrictions: listing.restrictions,
      royalties: listing.royalties,
      isAuction: listing.isAuction,
      auctionEndTime: listing.auctionEndTime,
      currentBid: listing.currentBid,
      reservePrice: listing.reservePrice,
      buyNowPrice: listing.buyNowPrice
    }));
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
