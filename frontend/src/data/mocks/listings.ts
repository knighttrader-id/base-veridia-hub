// Mock marketplace listings data
export interface MockListing {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artworkImage: string;
  creator: string;
  creatorName: string;
  licenseType: 'commercial' | 'non-commercial' | 'limited' | 'exclusive';
  price: string;
  priceUSDC: string;
  priceUSDT: string;
  priceDAI: string;
  priceIDRX: string;
  currency: 'ETH' | 'USDC' | 'USDT' | 'DAI' | 'IDRX';
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

// License types with realistic distribution
const licenseTypes = [
  'commercial', 'commercial', 'commercial', // 30% commercial
  'non-commercial', 'non-commercial', 'non-commercial', // 30% non-commercial
  'limited', 'limited', // 20% limited
  'exclusive' // 20% exclusive
];

// Currencies with realistic distribution
const currencies = [
  'ETH', 'ETH', 'ETH', // 30% ETH
  'USDC', 'USDC', 'USDC', 'USDC', // 40% USDC
  'USDT', 'USDT', // 20% USDT
  'DAI', 'IDRX' // 10% others
];

// Realistic license terms
const licenseTerms = [
  'Full commercial rights included',
  'Personal use only, no commercial use',
  'Limited commercial use with attribution',
  'Exclusive rights for specified duration',
  'Commercial use with royalty sharing',
  'Educational and non-profit use allowed',
  'Full rights transfer upon purchase',
  'Limited distribution rights included',
  'Commercial use with usage restrictions',
  'Full licensing rights with attribution'
];

// Usage rights
const usageRights = [
  'Print and digital reproduction',
  'Social media sharing',
  'Website and marketing use',
  'Merchandise production',
  'Advertising and promotion',
  'Editorial use',
  'Educational materials',
  'Gaming and entertainment',
  'Streaming and broadcasting',
  'Virtual and augmented reality'
];

// Restrictions
const restrictions = [
  'No resale or redistribution',
  'Attribution required',
  'No modification allowed',
  'Limited geographic distribution',
  'Time-limited usage',
  'No AI training use',
  'No commercial derivatives',
  'No adult content use',
  'No political use',
  'No hate speech use'
];

// Generate realistic prices
const generatePrice = (currency: string): string => {
  const priceRanges = {
    'ETH': [0.01, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0],
    'USDC': [10, 25, 50, 100, 250, 500, 1000, 2500],
    'USDT': [10, 25, 50, 100, 250, 500, 1000, 2500],
    'DAI': [10, 25, 50, 100, 250, 500, 1000, 2500],
    'IDRX': [150000, 375000, 750000, 1500000, 3750000, 7500000, 15000000, 37500000]
  };
  
  const amounts = priceRanges[currency];
  return amounts[Math.floor(Math.random() * amounts.length)].toString();
};

// Generate stablecoin prices
const generateStablecoinPrices = (ethPrice: string) => {
  const eth = parseFloat(ethPrice);
  const usdPrice = eth * 3000; // Assume 1 ETH = $3000
  return {
    USDC: Math.round(usdPrice).toString(),
    USDT: Math.round(usdPrice).toString(),
    DAI: Math.round(usdPrice).toString(),
    IDRX: Math.round(usdPrice * 15000).toString() // Assume 1 USD = 15000 IDRX
  };
};

// Generate auction data
const generateAuctionData = () => {
  const isAuction = Math.random() > 0.7; // 30% auctions
  if (!isAuction) return {
    isAuction: false,
    auctionEndTime: '',
    currentBid: '',
    reservePrice: '',
    buyNowPrice: ''
  };
  
  const now = new Date();
  const endTime = new Date(now.getTime() + (Math.random() * 7 * 24 * 60 * 60 * 1000)); // 1-7 days
  const reservePrice = (Math.random() * 2 + 0.1).toFixed(2); // 0.1-2.1 ETH
  const currentBid = (Math.random() * parseFloat(reservePrice)).toFixed(2);
  const buyNowPrice = (parseFloat(reservePrice) * (1.5 + Math.random())).toFixed(2);
  
  return {
    isAuction: true,
    auctionEndTime: endTime.toISOString(),
    currentBid,
    reservePrice,
    buyNowPrice
  };
};

// Generate creation date (last 6 months)
const generateCreatedAt = (): string => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime).toISOString();
};

// Generate expiration date
const generateExpiresAt = (createdAt: string): string => {
  const created = new Date(createdAt);
  const expirationDays = Math.floor(Math.random() * 90) + 30; // 30-120 days
  const expiration = new Date(created.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
  return expiration.toISOString();
};

// Generate mock listings
export const MOCK_LISTINGS: MockListing[] = [];

for (let i = 1; i <= 100; i++) {
  const licenseType = licenseTypes[Math.floor(Math.random() * licenseTypes.length)];
  const currency = currencies[Math.floor(Math.random() * currencies.length)];
  const price = generatePrice(currency);
  const stablecoinPrices = generateStablecoinPrices(currency === 'ETH' ? price : '0.1');
  const auctionData = generateAuctionData();
  const createdAt = generateCreatedAt();
  const expiresAt = generateExpiresAt(createdAt);
  
  const listing: MockListing = {
    id: i.toString(),
    artworkId: i.toString(),
    artworkTitle: `Artwork #${i}`,
    artworkImage: `https://dummyimage.com/400x400/8b5cf6/ffffff&text=Artwork+${i}`,
    creator: `0x${Math.random().toString(16).substr(2, 8)}${Math.random().toString(16).substr(2, 8)}${Math.random().toString(16).substr(2, 8)}`,
    creatorName: `Artist${i}`,
    licenseType,
    price,
    priceUSDC: stablecoinPrices.USDC,
    priceUSDT: stablecoinPrices.USDT,
    priceDAI: stablecoinPrices.DAI,
    priceIDRX: stablecoinPrices.IDRX,
    currency,
    isActive: Math.random() > 0.1, // 90% active
    isFeatured: Math.random() > 0.8, // 20% featured
    isVerified: Math.random() > 0.3, // 70% verified
    createdAt,
    expiresAt,
    views: Math.floor(Math.random() * 5000) + 100,
    likes: Math.floor(Math.random() * 500) + 10,
    offers: Math.floor(Math.random() * 20),
    description: `High-quality digital artwork perfect for ${licenseType} use. Created with attention to detail and professional standards.`,
    tags: ['digital-art', 'nft', 'blockchain', 'creative'],
    category: ['digital-art', 'photography', '3d-art', 'illustration', 'music'][Math.floor(Math.random() * 5)],
    fileSize: `${(Math.random() * 50 + 1).toFixed(1)}MB`,
    format: ['PNG', 'JPG', 'MP4', 'MP3', 'OBJ'][Math.floor(Math.random() * 5)],
    dimensions: `${Math.floor(Math.random() * 2000) + 1000}x${Math.floor(Math.random() * 2000) + 1000}`,
    licenseTerms: licenseTerms[Math.floor(Math.random() * licenseTerms.length)],
    usageRights: usageRights.slice(0, Math.floor(Math.random() * 5) + 1),
    restrictions: restrictions.slice(0, Math.floor(Math.random() * 3)),
    royalties: (Math.random() * 10 + 2.5).toFixed(1), // 2.5-12.5%
    ...auctionData
  };
  
  MOCK_LISTINGS.push(listing);
}

// Helper functions
export const getActiveListings = () => 
  MOCK_LISTINGS.filter(listing => listing.isActive);

export const getFeaturedListings = () => 
  MOCK_LISTINGS.filter(listing => listing.isFeatured);

export const getVerifiedListings = () => 
  MOCK_LISTINGS.filter(listing => listing.isVerified);

export const getListingsByCategory = (category: string) => 
  MOCK_LISTINGS.filter(listing => listing.category === category);

export const getListingsByLicenseType = (licenseType: string) => 
  MOCK_LISTINGS.filter(listing => listing.licenseType === licenseType);

export const getListingsByCurrency = (currency: string) => 
  MOCK_LISTINGS.filter(listing => listing.currency === currency);

export const getAuctionListings = () => 
  MOCK_LISTINGS.filter(listing => listing.isAuction);

export const getListingsByCreator = (creatorAddress: string) => 
  MOCK_LISTINGS.filter(listing => 
    listing.creator.toLowerCase() === creatorAddress.toLowerCase()
  );

export const searchListings = (query: string) => 
  MOCK_LISTINGS.filter(listing => 
    listing.artworkTitle.toLowerCase().includes(query.toLowerCase()) ||
    listing.description.toLowerCase().includes(query.toLowerCase()) ||
    listing.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

export const getListingsByPriceRange = (minPrice: number, maxPrice: number, currency: string) => 
  MOCK_LISTINGS.filter(listing => {
    if (listing.currency !== currency) return false;
    const price = parseFloat(listing.price);
    return price >= minPrice && price <= maxPrice;
  });

export const getExpiringListings = (days: number = 7) => 
  MOCK_LISTINGS.filter(listing => {
    const expiration = new Date(listing.expiresAt);
    const now = new Date();
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days && diffDays > 0;
  });

export const getListingStats = () => {
  const total = MOCK_LISTINGS.length;
  const active = getActiveListings().length;
  const featured = getFeaturedListings().length;
  const verified = getVerifiedListings().length;
  const auctions = getAuctionListings().length;
  
  return {
    total,
    active,
    featured,
    verified,
    auctions,
    activeRate: ((active / total) * 100).toFixed(1),
    featuredRate: ((featured / total) * 100).toFixed(1),
    verifiedRate: ((verified / total) * 100).toFixed(1)
  };
};
