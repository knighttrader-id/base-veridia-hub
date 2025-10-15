// Central export for all mock data
export * from './artworks';
export * from './users';
export * from './transactions';
export * from './listings';

// Re-export with organized structure
export { MOCK_ARTWORKS } from './artworks';
export { MOCK_USERS } from './users';
export { MOCK_TRANSACTIONS } from './transactions';
export { MOCK_LISTINGS } from './listings';

// Helper functions for data manipulation
export const getMockDataStats = () => {
  return {
    artworks: {
      total: MOCK_ARTWORKS.length,
      categories: {
        'digital-art': MOCK_ARTWORKS.filter(a => a.category === 'digital-art').length,
        'photography': MOCK_ARTWORKS.filter(a => a.category === 'photography').length,
        '3d-art': MOCK_ARTWORKS.filter(a => a.category === '3d-art').length,
        'illustration': MOCK_ARTWORKS.filter(a => a.category === 'illustration').length,
        'music': MOCK_ARTWORKS.filter(a => a.category === 'music').length
      },
      verified: MOCK_ARTWORKS.filter(a => a.isVerified).length,
      featured: MOCK_ARTWORKS.filter(a => a.isFeatured).length,
      new: MOCK_ARTWORKS.filter(a => a.isNew).length
    },
    users: {
      total: MOCK_USERS.length,
      verified: MOCK_USERS.filter(u => u.isVerified).length,
      featured: MOCK_USERS.filter(u => u.isFeatured).length,
      online: MOCK_USERS.filter(u => u.isOnline).length
    },
    transactions: {
      total: MOCK_TRANSACTIONS.length,
      successful: MOCK_TRANSACTIONS.filter(t => t.isSuccessful).length,
      pending: MOCK_TRANSACTIONS.filter(t => t.status === 'pending').length,
      failed: MOCK_TRANSACTIONS.filter(t => !t.isSuccessful).length,
      byToken: {
        ETH: MOCK_TRANSACTIONS.filter(t => t.tokenSymbol === 'ETH').length,
        USDC: MOCK_TRANSACTIONS.filter(t => t.tokenSymbol === 'USDC').length,
        USDT: MOCK_TRANSACTIONS.filter(t => t.tokenSymbol === 'USDT').length,
        DAI: MOCK_TRANSACTIONS.filter(t => t.tokenSymbol === 'DAI').length,
        IDRX: MOCK_TRANSACTIONS.filter(t => t.tokenSymbol === 'IDRX').length
      }
    },
    listings: {
      total: MOCK_LISTINGS.length,
      active: MOCK_LISTINGS.filter(l => l.isActive).length,
      featured: MOCK_LISTINGS.filter(l => l.isFeatured).length,
      verified: MOCK_LISTINGS.filter(l => l.isVerified).length,
      auctions: MOCK_LISTINGS.filter(l => l.isAuction).length
    }
  };
};

// Data validation helpers
export const validateMockData = () => {
  const errors: string[] = [];
  
  // Validate artworks
  if (MOCK_ARTWORKS.length !== 100) {
    errors.push(`Expected 100 artworks, got ${MOCK_ARTWORKS.length}`);
  }
  
  // Validate users
  if (MOCK_USERS.length !== 30) {
    errors.push(`Expected 30 users, got ${MOCK_USERS.length}`);
  }
  
  // Validate transactions
  if (MOCK_TRANSACTIONS.length !== 200) {
    errors.push(`Expected 200 transactions, got ${MOCK_TRANSACTIONS.length}`);
  }
  
  // Validate listings
  if (MOCK_LISTINGS.length !== 100) {
    errors.push(`Expected 100 listings, got ${MOCK_LISTINGS.length}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Data generation helpers
export const generateRandomArtwork = () => {
  return MOCK_ARTWORKS[Math.floor(Math.random() * MOCK_ARTWORKS.length)];
};

export const generateRandomUser = () => {
  return MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
};

export const generateRandomTransaction = () => {
  return MOCK_TRANSACTIONS[Math.floor(Math.random() * MOCK_TRANSACTIONS.length)];
};

export const generateRandomListing = () => {
  return MOCK_LISTINGS[Math.floor(Math.random() * MOCK_LISTINGS.length)];
};

// Search across all data
export const searchAllData = (query: string) => {
  const results = {
    artworks: MOCK_ARTWORKS.filter(artwork => 
      artwork.title.toLowerCase().includes(query.toLowerCase()) ||
      artwork.description.toLowerCase().includes(query.toLowerCase()) ||
      artwork.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    ),
    users: MOCK_USERS.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.bio.toLowerCase().includes(query.toLowerCase())
    ),
    listings: MOCK_LISTINGS.filter(listing => 
      listing.artworkTitle.toLowerCase().includes(query.toLowerCase()) ||
      listing.description.toLowerCase().includes(query.toLowerCase())
    )
  };
  
  return {
    ...results,
    total: results.artworks.length + results.users.length + results.listings.length
  };
};

// Data export for external use
export const exportMockData = () => {
  return {
    artworks: MOCK_ARTWORKS,
    users: MOCK_USERS,
    transactions: MOCK_TRANSACTIONS,
    listings: MOCK_LISTINGS,
    stats: getMockDataStats(),
    generatedAt: new Date().toISOString(),
    version: '1.0.0'
  };
};
