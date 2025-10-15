// Mock artworks data with 100 realistic items
export interface MockArtwork {
  tokenId: string;
  title: string;
  description: string;
  tokenURI: string;
  creator: string;
  creatorName: string;
  price: string;
  priceUSDC: string;
  priceUSDT: string;
  priceDAI: string;
  priceIDRX: string;
  category: 'digital-art' | 'photography' | '3d-art' | 'illustration' | 'music';
  tags: string[];
  views: number;
  likes: number;
  sales: number;
  createdAt: string;
  isVerified: boolean;
  isFeatured: boolean;
  isNew: boolean;
  licenseType: 'commercial' | 'non-commercial' | 'limited';
  fileSize: string;
  dimensions: string;
  format: string;
  royalty: number;
  licenseExpiration?: string;
  usageRights: string[];
  restrictions: string[];
  licenseTermsURI?: string;
}

// Realistic artwork categories with proper distribution
const categories = [
  'digital-art', 'digital-art', 'digital-art', // 30 items
  'photography', 'photography', // 25 items  
  '3d-art', '3d-art', // 20 items
  'illustration', // 15 items
  'music' // 10 items
];

// Realistic titles for each category
const digitalArtTitles = [
  'Cyberpunk Neon Dreams', 'Abstract Digital Waves', 'Neon Cityscape', 'Digital Sunset Over Mountains',
  'Futuristic Architecture', 'Holographic Portraits', 'Digital Forest', 'Neon Geometry',
  'Cyberpunk Street Art', 'Digital Mandala', 'Abstract Data Visualization', 'Neon Typography',
  'Digital Galaxy', 'Cyberpunk Aesthetic', 'Abstract Digital Art', 'Neon Light Show',
  'Digital Surrealism', 'Cyberpunk Landscape', 'Abstract Digital Patterns', 'Neon Abstract',
  'Digital Minimalism', 'Cyberpunk Portraits', 'Abstract Digital Composition', 'Neon Digital Art',
  'Digital Expressionism', 'Cyberpunk Abstract', 'Abstract Digital Design', 'Neon Digital Patterns',
  'Digital Cubism', 'Cyberpunk Minimalism'
];

const photographyTitles = [
  'Urban Street Photography', 'Nature Landscape', 'Portrait Study', 'Architectural Details',
  'Street Life Moments', 'Mountain Vista', 'City Skyline', 'Abstract Photography',
  'Black & White Portrait', 'Urban Decay', 'Nature Macro', 'Street Art Photography',
  'Architectural Symmetry', 'Urban Geometry', 'Portrait Lighting', 'Nature Abstracts',
  'Street Fashion', 'Urban Night', 'Nature Wildlife', 'Architectural Lines',
  'Street Culture', 'Urban Patterns', 'Portrait Emotions', 'Nature Textures',
  'Street Moments'
];

const threeDArtTitles = [
  '3D Character Design', 'Architectural Visualization', 'Product Rendering', '3D Abstract Sculpture',
  'Character Animation', 'Interior Design 3D', 'Vehicle Design', '3D Environment',
  'Character Modeling', 'Architectural Walkthrough', 'Product Visualization', '3D Abstract Art',
  'Character Rigging', 'Architectural Details', 'Vehicle Rendering', '3D Landscape',
  'Character Texturing', 'Architectural Lighting', 'Product Animation', '3D Abstract Design'
];

const illustrationTitles = [
  'Book Cover Illustration', 'Editorial Illustration', 'Character Design', 'Concept Art',
  'Children Book Art', 'Magazine Illustration', 'Character Development', 'Fantasy Art',
  'Book Illustration', 'Editorial Design', 'Character Concept', 'Sci-Fi Art',
  'Children Illustration', 'Magazine Design', 'Character Study', 'Fantasy Design'
];

const musicTitles = [
  'Ambient Soundscape', 'Electronic Beats', 'Jazz Fusion', 'Classical Remix',
  'Ambient Meditation', 'Electronic Ambient', 'Jazz Improvisation', 'Classical Modern',
  'Ambient Nature', 'Electronic Chill', 'Jazz Contemporary', 'Classical Electronic',
  'Ambient Space', 'Electronic Downtempo', 'Jazz Experimental', 'Classical Ambient'
];

// Realistic descriptions
const descriptions = [
  'A stunning digital creation that captures the essence of modern art through innovative techniques and vibrant colors.',
  'This artwork represents a unique blend of traditional and digital mediums, creating a mesmerizing visual experience.',
  'An exploration of light, shadow, and form that pushes the boundaries of digital artistic expression.',
  'A carefully crafted piece that combines technical precision with creative vision to produce something truly extraordinary.',
  'This work demonstrates mastery of digital tools while maintaining the human touch that makes art meaningful.',
  'A vibrant composition that showcases the artist\'s ability to translate complex emotions into visual form.',
  'An innovative approach to digital art that challenges conventional boundaries and opens new possibilities.',
  'This piece represents hours of careful work and creative vision, resulting in a truly unique artistic statement.',
  'A masterful blend of technique and creativity that demonstrates the artist\'s deep understanding of digital media.',
  'An evocative work that speaks to the viewer through its careful composition and thoughtful execution.'
];

// Realistic tags for each category
const digitalArtTags = ['digital-art', 'abstract', 'cyberpunk', 'neon', 'futuristic', 'geometric', 'minimalist', 'surreal'];
const photographyTags = ['photography', 'street', 'portrait', 'landscape', 'architecture', 'black-white', 'urban', 'nature'];
const threeDArtTags = ['3d-art', 'modeling', 'rendering', 'animation', 'character', 'architecture', 'product', 'visualization'];
const illustrationTags = ['illustration', 'character', 'concept', 'editorial', 'book', 'fantasy', 'sci-fi', 'design'];
const musicTags = ['music', 'ambient', 'electronic', 'jazz', 'classical', 'experimental', 'chill', 'meditation'];

// Generate realistic USDT prices (50 - 5000 USDT)
const generatePrice = (): string => {
  const prices = [50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000];
  return prices[Math.floor(Math.random() * prices.length)].toString();
};

// Generate ETH equivalent prices (for display purposes)
const generateETHPrice = (usdtPrice: string): string => {
  const usdt = parseFloat(usdtPrice);
  const ethPrice = usdt / 3000; // Assume 1 ETH = $3000
  return ethPrice.toFixed(4);
};

// Generate other stablecoin prices (1:1 conversion for demo)
const generateStablecoinPrice = (usdtPrice: string): string => {
  return usdtPrice; // 1:1 conversion for USDC, DAI, etc.
};

// Generate realistic stats
const generateStats = () => ({
  views: Math.floor(Math.random() * 5000) + 100,
  likes: Math.floor(Math.random() * 500) + 10,
  sales: Math.floor(Math.random() * 100) + 1
});

// Generate creation dates (last 6 months)
const generateCreatedAt = (): string => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
};

// Generate usage rights
const generateUsageRights = (): string[] => {
  const allRights = [
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
  
  const numRights = Math.floor(Math.random() * 4) + 2; // 2-5 rights
  const shuffled = allRights.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numRights);
};

// Generate restrictions
const generateRestrictions = (): string[] => {
  const allRestrictions = [
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
  
  const numRestrictions = Math.floor(Math.random() * 3) + 1; // 1-3 restrictions
  const shuffled = allRestrictions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numRestrictions);
};

// Generate realistic file info
const generateFileInfo = (category: string) => {
  const formats = {
    'digital-art': ['PNG', 'JPG', 'PSD'],
    'photography': ['JPG', 'RAW', 'TIFF'],
    '3d-art': ['OBJ', 'FBX', 'BLEND'],
    'illustration': ['AI', 'SVG', 'PNG'],
    'music': ['MP3', 'WAV', 'FLAC']
  };
  
  const sizes = ['2.5MB', '5.1MB', '8.3MB', '12.7MB', '15.2MB', '22.8MB', '31.5MB', '45.2MB'];
  const dimensions = {
    'digital-art': ['1920x1080', '2560x1440', '3840x2160', '2048x2048'],
    'photography': ['4032x3024', '6000x4000', '5472x3648', '8256x5504'],
    '3d-art': ['1920x1080', '2560x1440', '3840x2160'],
    'illustration': ['2048x2048', '3000x3000', '4096x4096'],
    'music': ['3:45', '4:12', '5:30', '2:58', '6:15']
  };
  
  return {
    format: formats[category][Math.floor(Math.random() * formats[category].length)],
    size: sizes[Math.floor(Math.random() * sizes.length)],
    dimensions: dimensions[category][Math.floor(Math.random() * dimensions[category].length)]
  };
};

// Generate mock artworks
export const MOCK_ARTWORKS: MockArtwork[] = [];

// Generate 100 artworks
for (let i = 1; i <= 100; i++) {
  const category = categories[Math.floor(Math.random() * categories.length)] as 'digital-art' | 'photography' | '3d-art' | 'illustration' | 'music';
  const stats = generateStats();
  const usdtPrice = generatePrice();
  const stablecoinPrice = generateStablecoinPrice(usdtPrice);
  const fileInfo = generateFileInfo(category);
  
  let title: string;
  let tags: string[];
  
  switch (category) {
    case 'digital-art':
      title = digitalArtTitles[Math.floor(Math.random() * digitalArtTitles.length)];
      tags = digitalArtTags.slice(0, Math.floor(Math.random() * 4) + 3);
      break;
    case 'photography':
      title = photographyTitles[Math.floor(Math.random() * photographyTitles.length)];
      tags = photographyTags.slice(0, Math.floor(Math.random() * 4) + 3);
      break;
    case '3d-art':
      title = threeDArtTitles[Math.floor(Math.random() * threeDArtTitles.length)];
      tags = threeDArtTags.slice(0, Math.floor(Math.random() * 4) + 3);
      break;
    case 'illustration':
      title = illustrationTitles[Math.floor(Math.random() * illustrationTitles.length)];
      tags = illustrationTags.slice(0, Math.floor(Math.random() * 4) + 3);
      break;
    case 'music':
      title = musicTitles[Math.floor(Math.random() * musicTitles.length)];
      tags = musicTags.slice(0, Math.floor(Math.random() * 4) + 3);
      break;
    default:
      title = 'Digital Artwork';
      tags = ['art', 'digital'];
  }
  
  const artwork: MockArtwork = {
    tokenId: i.toString(),
    title: `${title} #${i}`,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    tokenURI: `https://dummyimage.com/800x600/6366f1/ffffff&text=Artwork+${i}`,
    creator: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
    creatorName: `Artist${i}`,
    price: usdtPrice, // USDT as default price
    priceUSDC: stablecoinPrice,
    priceUSDT: usdtPrice, // Primary USDT price
    priceDAI: stablecoinPrice,
    priceIDRX: (parseFloat(usdtPrice) * 15000).toString(), // IDRX conversion from USDT
    category,
    tags,
    views: stats.views,
    likes: stats.likes,
    sales: stats.sales,
    createdAt: generateCreatedAt(),
    isVerified: Math.random() > 0.3, // 70% verified
    isFeatured: Math.random() > 0.8, // 20% featured
    isNew: Math.random() > 0.9, // 10% new
    licenseType: (['commercial', 'non-commercial', 'limited'] as const)[Math.floor(Math.random() * 3)],
    fileSize: fileInfo.size,
    dimensions: fileInfo.dimensions,
    format: fileInfo.format,
    royalty: Math.floor(Math.random() * 20) + 5, // 5-25% royalty
    licenseExpiration: Math.random() > 0.7 ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    usageRights: generateUsageRights(),
    restrictions: generateRestrictions(),
    licenseTermsURI: `ipfs://Qm${Math.random().toString(36).substr(2, 44)}`
  };
  
  MOCK_ARTWORKS.push(artwork);
}

// Helper functions
export const getArtworksByCategory = (category: string) => 
  MOCK_ARTWORKS.filter(artwork => artwork.category === category);

export const getFeaturedArtworks = () => 
  MOCK_ARTWORKS.filter(artwork => artwork.isFeatured);

export const getNewArtworks = () => 
  MOCK_ARTWORKS.filter(artwork => artwork.isNew);

export const getVerifiedArtworks = () => 
  MOCK_ARTWORKS.filter(artwork => artwork.isVerified);

export const searchArtworks = (query: string) => 
  MOCK_ARTWORKS.filter(artwork => 
    artwork.title.toLowerCase().includes(query.toLowerCase()) ||
    artwork.description.toLowerCase().includes(query.toLowerCase()) ||
    artwork.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );
  
export const sortArtworks = (artworks: MockArtwork[], sortBy: 'newest' | 'oldest' | 'price' | 'views' | 'likes') => {
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
};
