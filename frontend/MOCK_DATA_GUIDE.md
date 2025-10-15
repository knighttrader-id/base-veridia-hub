# VeridiaHub Mock Data System Guide

## Overview

VeridiaHub implements a comprehensive hybrid mock data system that allows seamless switching between mock data and blockchain data sources. This system is designed for development, demo, and production environments.

## Environment Configuration

### Environment Variables

Create the following environment files:

#### `.env.development`
```bash
VITE_USE_MOCK_DATA=true
VITE_MOCK_FALLBACK=true
VITE_SHOW_DEMO_BADGE=true
VITE_NETWORK=testnet
```

#### `.env.demo`
```bash
VITE_USE_MOCK_DATA=true
VITE_MOCK_FALLBACK=true
VITE_SHOW_DEMO_BADGE=true
VITE_NETWORK=testnet
```

#### `.env.production`
```bash
VITE_USE_MOCK_DATA=false
VITE_MOCK_FALLBACK=false
VITE_SHOW_DEMO_BADGE=false
VITE_NETWORK=mainnet
```

### Environment Modes

| Mode | USE_MOCK_DATA | MOCK_FALLBACK | Use Case |
|------|---------------|---------------|----------|
| **Development** | `true` | `true` | Local development with mock data |
| **Demo** | `true` | `true` | Base Batches demo with consistent data |
| **Testnet** | `false` | `true` | Testing with blockchain + fallback |
| **Production** | `false` | `false` | Live blockchain data only |

## Mock Data Structure

### Artworks (100 items)
- **Categories**: Digital Art (30), Photography (25), 3D Art (20), Illustration (15), Music (10)
- **Real Images**: Unsplash URLs for realistic previews
- **Multi-token Pricing**: ETH, USDC, USDT, DAI, IDRX
- **Realistic Stats**: Views, likes, sales, creation dates
- **File Info**: Size, format, dimensions

### Users (30 profiles)
- **Complete Profiles**: Names, bios, avatars, social links
- **Stats**: Artworks, sales, followers, total volume
- **Specialties**: Digital art, photography, 3D modeling, etc.
- **Verification**: 60% verified users

### Transactions (200 items)
- **Types**: Purchase, License, Transfer, Mint, Sale, Bid, Offer
- **Multi-token Support**: All supported tokens
- **Realistic Data**: Transaction hashes, gas fees, timestamps
- **Status**: 90% confirmed, 10% pending

### Listings (100 items)
- **License Types**: Commercial, Non-commercial, Limited, Exclusive
- **Auction Support**: 30% auction listings
- **Multi-currency**: All supported tokens
- **Realistic Terms**: Usage rights, restrictions, royalties

## Usage Examples

### Basic Data Fetching

```typescript
import { getArtworks, getMarketplaceArtworks } from '../services/artworkService';

// Get all artworks (automatically routes to mock or blockchain)
const artworks = await getArtworks();

// Get marketplace listings
const listings = await getMarketplaceArtworks();

// Search artworks
const searchResults = await searchArtworks('cyberpunk');

// Get by category
const digitalArt = await getArtworksByCategory('digital-art');
```

### Environment Detection

```typescript
import { env, shouldUseMockData, getDataSource } from '../config/environment';

// Check current mode
const isMockMode = shouldUseMockData();
const dataSource = getDataSource(); // 'mock', 'blockchain', or 'hybrid'

// Get environment info
console.log('Network:', env.network);
console.log('Mock Data:', env.useMockData);
console.log('Fallback:', env.mockFallback);
```

### Demo Mode Badge

```typescript
import DemoModeBadge from '../components/DemoModeBadge';

// Add to any page
<DemoModeBadge />

// Or use compact version
<CompactDemoBadge />
```

## Data Manipulation

### Filtering and Sorting

```typescript
import { 
  getArtworksByCategory, 
  getFeaturedArtworks, 
  searchArtworks, 
  sortArtworks 
} from '../services/artworkService';

// Filter by category
const photography = await getArtworksByCategory('photography');

// Get featured items
const featured = await getFeaturedArtworks();

// Search with query
const results = await searchArtworks('abstract art');

// Sort results
const sorted = await sortArtworks(artworks, 'newest');
```

### Mock Data Helpers

```typescript
import { 
  getMockDataStats, 
  validateMockData, 
  searchAllData 
} from '../data/mocks';

// Get comprehensive stats
const stats = getMockDataStats();

// Validate data integrity
const validation = validateMockData();

// Search across all data types
const searchResults = searchAllData('digital art');
```

## Service Architecture

### Smart Routing

The service layer automatically routes between mock and blockchain data:

```typescript
// Priority 1: Force mock mode (if USE_MOCK_DATA=true)
if (shouldUseMockData()) {
  return mockData();
}

// Priority 2: Try blockchain
try {
  const result = await blockchainData();
  return result;
} catch (error) {
  // Priority 3: Fallback to mock (if MOCK_FALLBACK=true)
  if (shouldFallbackToMock()) {
    return mockData();
  }
  throw error;
}
```

### Data Source Detection

```typescript
import { getDataSourceInfo } from '../services/artworkService';

const info = getDataSourceInfo();
console.log('Current mode:', info.currentMode);
console.log('Fallback enabled:', info.fallbackEnabled);
console.log('Mock data available:', info.mockDataAvailable);
```

## Development Workflow

### 1. Development Mode
```bash
# Use mock data for fast iteration
npm run dev
# VITE_USE_MOCK_DATA=true (default)
```

### 2. Demo Mode
```bash
# Use mock data with demo badge
npm run build:demo
# VITE_USE_MOCK_DATA=true, VITE_SHOW_DEMO_BADGE=true
```

### 3. Testnet Mode
```bash
# Use blockchain with fallback
npm run build:testnet
# VITE_USE_MOCK_DATA=false, VITE_MOCK_FALLBACK=true
```

### 4. Production Mode
```bash
# Use blockchain only
npm run build:production
# VITE_USE_MOCK_DATA=false, VITE_MOCK_FALLBACK=false
```

## Best Practices

### 1. Environment Setup
- Always create environment files for different modes
- Use appropriate settings for each environment
- Test all modes before deployment

### 2. Data Consistency
- Mock data should reflect real-world scenarios
- Keep mock data updated with new features
- Validate data integrity regularly

### 3. Error Handling
- Implement graceful fallbacks
- Log data source switches
- Monitor blockchain connectivity

### 4. Performance
- Mock data loads instantly
- Blockchain data may have delays
- Implement loading states appropriately

## Troubleshooting

### Common Issues

1. **Mock data not loading**
   - Check environment variables
   - Verify `VITE_USE_MOCK_DATA=true`
   - Check console for errors

2. **Demo badge not showing**
   - Ensure `VITE_SHOW_DEMO_BADGE=true`
   - Check component import
   - Verify environment mode

3. **Blockchain fallback not working**
   - Check `VITE_MOCK_FALLBACK=true`
   - Verify error handling
   - Check network connectivity

### Debug Information

```typescript
// Get comprehensive debug info
import { getDataSourceInfo } from '../services/artworkService';
import { validateMockData } from '../data/mocks';

const dataSource = getDataSourceInfo();
const validation = validateMockData();

console.log('Data Source:', dataSource);
console.log('Validation:', validation);
```

## File Structure

```
frontend/src/
├── config/
│   └── environment.ts          # Environment configuration
├── data/
│   └── mocks/
│       ├── artworks.ts         # 100 mock artworks
│       ├── users.ts           # 30 mock users
│       ├── transactions.ts    # 200 mock transactions
│       ├── listings.ts        # 100 mock listings
│       └── index.ts           # Central exports
├── services/
│   └── artworkService.ts      # Smart routing service
├── components/
│   └── DemoModeBadge.tsx      # Demo mode indicator
└── MOCK_DATA_GUIDE.md         # This guide
```

## Success Metrics

✅ **100+ realistic artworks** with real images  
✅ **30+ user profiles** with complete data  
✅ **200+ transaction records** with multi-token support  
✅ **Environment-based routing** working  
✅ **Smooth fallback mechanism** implemented  
✅ **Demo mode badge** functional  
✅ **All pages working** with mock data  
✅ **Ready for Base Batches demo**  

## Next Steps

1. **Test all modes** in different environments
2. **Validate data integrity** across all data types
3. **Performance testing** with large datasets
4. **User acceptance testing** with demo data
5. **Production deployment** with blockchain integration

---

*This guide covers the complete mock data system implementation for VeridiaHub. For additional support, refer to the code comments and inline documentation.*
