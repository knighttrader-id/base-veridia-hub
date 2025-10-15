// Smart routing service for artwork data
import { env, shouldUseMockData, shouldFallbackToMock } from '../config/environment';
import { MOCK_ARTWORKS } from '../data/mocks/artworks';
import IPRegistryService from './ipRegistryService';

// Import blockchain services (will be created)
// import { getBlockchainArtworks } from './blockchain/artworkService';
// import { getBlockchainMarketplaceArtworks } from './blockchain/marketplaceService';

// Import mock services (will be created)
// import { getMockArtworks, getMockMarketplaceArtworks } from './mock/artworkService';

export interface ArtworkItem {
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

export interface MarketplaceArtwork extends ArtworkItem {
  isListed: boolean;
  licenseId: string;
  licensePrice: string;
  licenseAmount: string;
}

// Smart routing function
const routeToDataSource = async <T>(
  mockData: () => T,
  blockchainData: () => Promise<T>,
  fallbackToMock: boolean = true
): Promise<T> => {
  try {
    // Priority 1: Force mock mode
    if (shouldUseMockData()) {
      console.log('🎨 Using mock data (forced mode)');
      return mockData();
    }
    
    // Priority 2: Try blockchain
    console.log('🔗 Attempting blockchain data fetch...');
    const result = await blockchainData();
    
    // Priority 3: Check if we got data
    if (Array.isArray(result) && result.length === 0 && fallbackToMock) {
      console.warn('⚠️ No blockchain data, falling back to mock');
      return mockData();
    }
    
    console.log('✅ Using blockchain data');
    return result;
    
  } catch (error) {
    console.error('❌ Blockchain error:', error);
    
    // Priority 4: Fallback to mock on error
    if (fallbackToMock) {
      console.warn('🔄 Falling back to mock data due to error');
      return mockData();
    }
    
    throw error;
  }
};

// Mock data functions
const getMockArtworks = (): ArtworkItem[] => {
  return MOCK_ARTWORKS.map(artwork => ({
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
};

const getMockMarketplaceArtworks = (): MarketplaceArtwork[] => {
  return MOCK_ARTWORKS.map(artwork => ({
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
};

// Blockchain data functions (placeholder - will be implemented)
const getBlockchainArtworks = async (): Promise<ArtworkItem[]> => {
  // Simulate blockchain call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For now, return empty array to trigger fallback
  return [];
};

const getBlockchainMarketplaceArtworks = async (): Promise<MarketplaceArtwork[]> => {
  // Simulate blockchain call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For now, return empty array to trigger fallback
  return [];
};

// Public API functions
export async function getArtworks(): Promise<ArtworkItem[]> {
  return routeToDataSource(
    getMockArtworks,
    getBlockchainArtworks,
    shouldFallbackToMock()
  );
}

export async function getMarketplaceArtworks(): Promise<MarketplaceArtwork[]> {
  // Use IP Registry service to get verified items for marketplace
  try {
    const verifiedArtworks = await IPRegistryService.getMarketplaceArtworks();
    return verifiedArtworks;
  } catch (error) {
    console.error('Error getting marketplace artworks from IP Registry:', error);
    // Fallback to mock data if IP Registry fails
    return routeToDataSource(
      getMockMarketplaceArtworks,
      getBlockchainMarketplaceArtworks,
      shouldFallbackToMock()
    );
  }
}

export async function getArtworksByCategory(category: string): Promise<ArtworkItem[]> {
  const allArtworks = await getArtworks();
  return allArtworks.filter(artwork => artwork.category === category);
}

export async function getFeaturedArtworks(): Promise<ArtworkItem[]> {
  const allArtworks = await getArtworks();
  return allArtworks.filter(artwork => artwork.isFeatured);
}

export async function getNewArtworks(): Promise<ArtworkItem[]> {
  const allArtworks = await getArtworks();
  return allArtworks.filter(artwork => artwork.isNew);
}

export async function getVerifiedArtworks(): Promise<ArtworkItem[]> {
  const allArtworks = await getArtworks();
  return allArtworks.filter(artwork => artwork.isVerified);
}

export async function searchArtworks(query: string): Promise<ArtworkItem[]> {
  const allArtworks = await getArtworks();
  return allArtworks.filter(artwork => 
    artwork.title.toLowerCase().includes(query.toLowerCase()) ||
    artwork.description.toLowerCase().includes(query.toLowerCase()) ||
    artwork.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );
}

export async function sortArtworks(artworks: ArtworkItem[], sortBy: 'newest' | 'oldest' | 'price' | 'views' | 'likes'): Promise<ArtworkItem[]> {
  return [...artworks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'price':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'views':
        return b.views - a.views;
      case 'likes':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });
}

// Register artwork function (placeholder)
export async function registerArtwork(_params: { 
  contentHashHex: string; 
  title: string; 
  description: string; 
  metadataURI: string; 
}): Promise<{ txHash: string; tokenId: string }> {
  // This would normally interact with blockchain
  // For now, return mock response
  const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  const mockTokenId = (MOCK_ARTWORKS.length + 1).toString();
  
  return {
    txHash: mockTxHash,
    tokenId: mockTokenId
  };
}

// Get current data source info
export const getDataSourceInfo = () => {
  return {
    currentMode: shouldUseMockData() ? 'mock' : 'blockchain',
    fallbackEnabled: shouldFallbackToMock(),
    environment: env.network,
    mockDataAvailable: MOCK_ARTWORKS.length,
    timestamp: new Date().toISOString()
  };
};