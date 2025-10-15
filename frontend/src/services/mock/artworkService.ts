// Mock artwork service with API simulation
import { MOCK_ARTWORKS, getArtworksByCategory, getFeaturedArtworks, getNewArtworks, getVerifiedArtworks, searchArtworks, sortArtworks } from '../../data/mocks/artworks';

export interface MockArtworkItem {
  tokenId: string;
  title: string;
  description: string;
  tokenURI: string;
  creator: string;
  creatorName: string;
  price: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  sales: number;
  createdAt: string;
  isVerified: boolean;
  isFeatured: boolean;
  isNew: boolean;
  licenseType: string;
  fileSize: string;
  dimensions: string;
  format: string;
}

export interface MockMarketplaceArtwork extends MockArtworkItem {
  isListed: boolean;
  licenseId: string;
  licensePrice: string;
  licenseAmount: string;
}

export class MockArtworkService {
  private static instance: MockArtworkService;
  private cache: Map<string, any> = new Map();
  private apiDelay: number = 500; // Simulate API delay

  private constructor() {}

  static getInstance(): MockArtworkService {
    if (!MockArtworkService.instance) {
      MockArtworkService.instance = new MockArtworkService();
    }
    return MockArtworkService.instance;
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
      throw new Error('Mock API error: Service temporarily unavailable');
    }
  }

  /**
   * Get all artworks with caching
   */
  async getAllArtworks(): Promise<MockArtworkItem[]> {
    const cacheKey = 'all_artworks';
    
    if (this.cache.has(cacheKey)) {
      await this.simulateDelay();
      return this.cache.get(cacheKey);
    }

    await this.simulateDelay();
    await this.simulateError();

    const artworks = MOCK_ARTWORKS.map(artwork => ({
      tokenId: artwork.tokenId,
      title: artwork.title,
      description: artwork.description,
      tokenURI: artwork.tokenURI,
      creator: artwork.creator,
      creatorName: artwork.creatorName,
      price: artwork.price,
      category: artwork.category,
      tags: artwork.tags,
      views: artwork.views,
      likes: artwork.likes,
      sales: artwork.sales,
      createdAt: artwork.createdAt,
      isVerified: artwork.isVerified,
      isFeatured: artwork.isFeatured,
      isNew: artwork.isNew,
      licenseType: artwork.licenseType,
      fileSize: artwork.fileSize,
      dimensions: artwork.dimensions,
      format: artwork.format
    }));

    this.cache.set(cacheKey, artworks);
    return artworks;
  }

  /**
   * Get marketplace artworks with listings
   */
  async getMarketplaceArtworks(): Promise<MockMarketplaceArtwork[]> {
    const cacheKey = 'marketplace_artworks';
    
    if (this.cache.has(cacheKey)) {
      await this.simulateDelay();
      return this.cache.get(cacheKey);
    }

    await this.simulateDelay();
    await this.simulateError();

    const artworks = MOCK_ARTWORKS.map(artwork => ({
      tokenId: artwork.tokenId,
      title: artwork.title,
      description: artwork.description,
      tokenURI: artwork.tokenURI,
      creator: artwork.creator,
      creatorName: artwork.creatorName,
      price: artwork.price,
      category: artwork.category,
      tags: artwork.tags,
      views: artwork.views,
      likes: artwork.likes,
      sales: artwork.sales,
      createdAt: artwork.createdAt,
      isVerified: artwork.isVerified,
      isFeatured: artwork.isFeatured,
      isNew: artwork.isNew,
      licenseType: artwork.licenseType,
      fileSize: artwork.fileSize,
      dimensions: artwork.dimensions,
      format: artwork.format,
      isListed: Math.random() > 0.2, // 80% listed
      licenseId: artwork.tokenId,
      licensePrice: artwork.price,
      licenseAmount: '1'
    }));

    this.cache.set(cacheKey, artworks);
    return artworks;
  }

  /**
   * Get artwork by ID
   */
  async getArtworkById(tokenId: string): Promise<MockArtworkItem | null> {
    await this.simulateDelay();
    await this.simulateError();

    const artwork = MOCK_ARTWORKS.find(a => a.tokenId === tokenId);
    if (!artwork) return null;

    return {
      tokenId: artwork.tokenId,
      title: artwork.title,
      description: artwork.description,
      tokenURI: artwork.tokenURI,
      creator: artwork.creator,
      creatorName: artwork.creatorName,
      price: artwork.price,
      category: artwork.category,
      tags: artwork.tags,
      views: artwork.views,
      likes: artwork.likes,
      sales: artwork.sales,
      createdAt: artwork.createdAt,
      isVerified: artwork.isVerified,
      isFeatured: artwork.isFeatured,
      isNew: artwork.isNew,
      licenseType: artwork.licenseType,
      fileSize: artwork.fileSize,
      dimensions: artwork.dimensions,
      format: artwork.format
    };
  }

  /**
   * Get artworks by category
   */
  async getArtworksByCategory(category: string): Promise<MockArtworkItem[]> {
    await this.simulateDelay();
    await this.simulateError();

    const artworks = getArtworksByCategory(category);
    return artworks.map(artwork => ({
      tokenId: artwork.tokenId,
      title: artwork.title,
      description: artwork.description,
      tokenURI: artwork.tokenURI,
      creator: artwork.creator,
      creatorName: artwork.creatorName,
      price: artwork.price,
      category: artwork.category,
      tags: artwork.tags,
      views: artwork.views,
      likes: artwork.likes,
      sales: artwork.sales,
      createdAt: artwork.createdAt,
      isVerified: artwork.isVerified,
      isFeatured: artwork.isFeatured,
      isNew: artwork.isNew,
      licenseType: artwork.licenseType,
      fileSize: artwork.fileSize,
      dimensions: artwork.dimensions,
      format: artwork.format
    }));
  }

  /**
   * Get featured artworks
   */
  async getFeaturedArtworks(): Promise<MockArtworkItem[]> {
    await this.simulateDelay();
    await this.simulateError();

    const artworks = getFeaturedArtworks();
    return artworks.map(artwork => ({
      tokenId: artwork.tokenId,
      title: artwork.title,
      description: artwork.description,
      tokenURI: artwork.tokenURI,
      creator: artwork.creator,
      creatorName: artwork.creatorName,
      price: artwork.price,
      category: artwork.category,
      tags: artwork.tags,
      views: artwork.views,
      likes: artwork.likes,
      sales: artwork.sales,
      createdAt: artwork.createdAt,
      isVerified: artwork.isVerified,
      isFeatured: artwork.isFeatured,
      isNew: artwork.isNew,
      licenseType: artwork.licenseType,
      fileSize: artwork.fileSize,
      dimensions: artwork.dimensions,
      format: artwork.format
    }));
  }

  /**
   * Get new artworks
   */
  async getNewArtworks(): Promise<MockArtworkItem[]> {
    await this.simulateDelay();
    await this.simulateError();

    const artworks = getNewArtworks();
    return artworks.map(artwork => ({
      tokenId: artwork.tokenId,
      title: artwork.title,
      description: artwork.description,
      tokenURI: artwork.tokenURI,
      creator: artwork.creator,
      creatorName: artwork.creatorName,
      price: artwork.price,
      category: artwork.category,
      tags: artwork.tags,
      views: artwork.views,
      likes: artwork.likes,
      sales: artwork.sales,
      createdAt: artwork.createdAt,
      isVerified: artwork.isVerified,
      isFeatured: artwork.isFeatured,
      isNew: artwork.isNew,
      licenseType: artwork.licenseType,
      fileSize: artwork.fileSize,
      dimensions: artwork.dimensions,
      format: artwork.format
    }));
  }

  /**
   * Get verified artworks
   */
  async getVerifiedArtworks(): Promise<MockArtworkItem[]> {
    await this.simulateDelay();
    await this.simulateError();

    const artworks = getVerifiedArtworks();
    return artworks.map(artwork => ({
      tokenId: artwork.tokenId,
      title: artwork.title,
      description: artwork.description,
      tokenURI: artwork.tokenURI,
      creator: artwork.creator,
      creatorName: artwork.creatorName,
      price: artwork.price,
      category: artwork.category,
      tags: artwork.tags,
      views: artwork.views,
      likes: artwork.likes,
      sales: artwork.sales,
      createdAt: artwork.createdAt,
      isVerified: artwork.isVerified,
      isFeatured: artwork.isFeatured,
      isNew: artwork.isNew,
      licenseType: artwork.licenseType,
      fileSize: artwork.fileSize,
      dimensions: artwork.dimensions,
      format: artwork.format
    }));
  }

  /**
   * Search artworks
   */
  async searchArtworks(query: string): Promise<MockArtworkItem[]> {
    await this.simulateDelay();
    await this.simulateError();

    const artworks = searchArtworks(query);
    return artworks.map(artwork => ({
      tokenId: artwork.tokenId,
      title: artwork.title,
      description: artwork.description,
      tokenURI: artwork.tokenURI,
      creator: artwork.creator,
      creatorName: artwork.creatorName,
      price: artwork.price,
      category: artwork.category,
      tags: artwork.tags,
      views: artwork.views,
      likes: artwork.likes,
      sales: artwork.sales,
      createdAt: artwork.createdAt,
      isVerified: artwork.isVerified,
      isFeatured: artwork.isFeatured,
      isNew: artwork.isNew,
      licenseType: artwork.licenseType,
      fileSize: artwork.fileSize,
      dimensions: artwork.dimensions,
      format: artwork.format
    }));
  }

  /**
   * Sort artworks
   */
  async sortArtworks(
    artworks: MockArtworkItem[],
    sortBy: 'newest' | 'oldest' | 'price' | 'views' | 'likes'
  ): Promise<MockArtworkItem[]> {
    await this.simulateDelay();
    await this.simulateError();

    return sortArtworks(artworks, sortBy);
  }

  /**
   * Register new artwork (mock)
   */
  async registerArtwork(params: {
    contentHashHex: string;
    title: string;
    description: string;
    metadataURI: string;
  }): Promise<{ txHash: string; tokenId: string }> {
    await this.simulateDelay();
    await this.simulateError();

    // Simulate blockchain transaction
    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const mockTokenId = (MOCK_ARTWORKS.length + 1).toString();

    // Simulate adding to cache (in real app, this would be handled by blockchain)
    const newArtwork = {
      tokenId: mockTokenId,
      title: params.title,
      description: params.description,
      tokenURI: params.metadataURI,
      creator: '0x' + Math.random().toString(16).substr(2, 40),
      creatorName: 'New Artist',
      price: '0.1',
      category: 'digital-art',
      tags: ['new', 'artwork'],
      views: 0,
      likes: 0,
      sales: 0,
      createdAt: new Date().toISOString(),
      isVerified: false,
      isFeatured: false,
      isNew: true,
      licenseType: 'commercial',
      fileSize: '2.5MB',
      dimensions: '1920x1080',
      format: 'PNG'
    };

    // Clear cache to force refresh
    this.cache.clear();

    return {
      txHash: mockTxHash,
      tokenId: mockTokenId
    };
  }

  /**
   * Get artwork statistics
   */
  async getArtworkStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    verified: number;
    featured: number;
    new: number;
  }> {
    await this.simulateDelay();
    await this.simulateError();

    const total = MOCK_ARTWORKS.length;
    const byCategory = MOCK_ARTWORKS.reduce((acc, artwork) => {
      acc[artwork.category] = (acc[artwork.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const verified = MOCK_ARTWORKS.filter(a => a.isVerified).length;
    const featured = MOCK_ARTWORKS.filter(a => a.isFeatured).length;
    const new_ = MOCK_ARTWORKS.filter(a => a.isNew).length;

    return {
      total,
      byCategory,
      verified,
      featured,
      new: new_
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
