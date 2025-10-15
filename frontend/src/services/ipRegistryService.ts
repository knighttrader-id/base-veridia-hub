// IP Registry Service - Manages data synchronization between IP Registry and Marketplace
import { MarketplaceArtwork } from './artworkService';

export interface RegistryItem {
  id: string;
  title: string;
  type: 'artwork' | 'music' | 'video' | 'document' | 'code';
  hash: string;
  creator: string;
  createdAt: string;
  status: 'verified' | 'pending' | 'rejected';
  views: number;
  downloads: number;
  price: string;
  description: string;
  tags: string[];
}

class IPRegistryService {
  private static registryItems: RegistryItem[] = [];
  private static isInitialized = false;

  // Initialize with 100 mock NFT data
  private static initializeData() {
    if (this.isInitialized) return;

    this.registryItems = this.generateMockNFTData(100);

    this.isInitialized = true;
  }

  // Generate 100 mock NFT data
  private static generateMockNFTData(count: number): RegistryItem[] {
    const items: RegistryItem[] = [];
    
    // NFT Categories with distribution
    const categories = [
      { type: 'artwork' as const, count: 40, titles: [
        'Digital Sunset', 'Cyberpunk Neon Dreams', 'Abstract Digital Waves', 'Neon Cityscape',
        'Digital Forest', 'Futuristic Architecture', 'Holographic Portraits', 'Digital Galaxy',
        'Neon Geometry', 'Abstract Data Visualization', 'Digital Mandala', 'Cyberpunk Street Art',
        'Neon Typography', 'Digital Surrealism', 'Abstract Digital Patterns', 'Neon Abstract',
        'Digital Minimalism', 'Cyberpunk Portraits', 'Abstract Digital Composition', 'Neon Digital Art',
        'Digital Landscapes', 'Cyberpunk Aesthetics', 'Abstract Digital Forms', 'Neon Light Show',
        'Digital Portraits', 'Cyberpunk Landscapes', 'Abstract Digital Structures', 'Neon Artwork',
        'Digital Compositions', 'Cyberpunk Designs', 'Abstract Digital Elements', 'Neon Graphics',
        'Digital Illustrations', 'Cyberpunk Concepts', 'Abstract Digital Shapes', 'Neon Visuals',
        'Digital Paintings', 'Cyberpunk Themes', 'Abstract Digital Lines', 'Neon Creations'
      ]},
      { type: 'music' as const, count: 20, titles: [
        'Ambient Soundscape', 'Electronic Dreams', 'Neon Beats', 'Digital Symphony',
        'Cyberpunk Soundtrack', 'Abstract Melodies', 'Neon Rhythms', 'Digital Harmonies',
        'Futuristic Tunes', 'Ambient Waves', 'Electronic Vibes', 'Neon Frequencies',
        'Digital Soundscapes', 'Cyberpunk Beats', 'Abstract Sounds', 'Neon Melodies',
        'Electronic Dreams', 'Ambient Frequencies', 'Digital Rhythms', 'Neon Harmonies'
      ]},
      { type: 'video' as const, count: 15, titles: [
        '3D Animation Short', 'Cyberpunk Visual', 'Digital Motion Graphics', 'Neon Animation',
        'Abstract Video Art', 'Futuristic Cinematic', 'Digital Storytelling', 'Neon Motion',
        '3D Character Animation', 'Cyberpunk Film', 'Digital Visual Effects', 'Neon Cinematic',
        'Abstract Motion', 'Futuristic Animation', 'Digital Film'
      ]},
      { type: 'document' as const, count: 15, titles: [
        'Digital Art Guide', 'NFT Creation Manual', 'Blockchain Whitepaper', 'Crypto Art Tutorial',
        'Digital Design Principles', 'NFT Marketing Guide', 'Blockchain Documentation', 'Crypto Art History',
        'Digital Creation Process', 'NFT Legal Framework', 'Blockchain Technology', 'Crypto Art Analysis',
        'Digital Asset Management', 'NFT Business Model', 'Blockchain Innovation'
      ]},
      { type: 'code' as const, count: 10, titles: [
        'Smart Contract Template', 'NFT Marketplace Code', 'Blockchain Integration', 'Crypto Art Algorithm',
        'Digital Asset Protocol', 'NFT Minting Script', 'Blockchain API', 'Crypto Art Generator',
        'Digital Token Standard', 'NFT Verification Code'
      ]}
    ];

    let itemId = 1;
    
    for (const category of categories) {
      for (let i = 0; i < category.count; i++) {
        const title = category.titles[i] || `${category.type} ${i + 1}`;
        const status = this.getRandomStatus();
        const views = Math.floor(Math.random() * 5000) + 100;
        const downloads = Math.floor(Math.random() * 200) + 10;
        const price = this.generateUSDTPrice(category.type);
        
        items.push({
          id: itemId.toString(),
          title: title,
          type: category.type,
          hash: this.generateHash(),
          creator: this.generateCreatorAddress(),
          createdAt: this.generateRandomDate(),
          status: status,
          views: views,
          downloads: downloads,
          price: price,
          description: this.generateDescription(category.type, title),
          tags: this.generateTags(category.type)
        });
        
        itemId++;
      }
    }

    return items;
  }

  // Helper methods for generating mock data
  private static getRandomStatus(): 'verified' | 'pending' | 'rejected' {
    const rand = Math.random();
    if (rand < 0.7) return 'verified';  // 70% verified
    if (rand < 0.9) return 'pending';   // 20% pending
    return 'rejected';                  // 10% rejected
  }

  private static generateUSDTPrice(type: string): string {
    // Realistic USDT price ranges by category
    const priceRanges = {
      artwork: { min: 50, max: 5000 },    // $50 - $5,000 USDT
      music: { min: 20, max: 1000 },      // $20 - $1,000 USDT
      video: { min: 100, max: 3000 },     // $100 - $3,000 USDT
      document: { min: 10, max: 500 },    // $10 - $500 USDT
      code: { min: 30, max: 2000 }        // $30 - $2,000 USDT
    };

    const range = priceRanges[type as keyof typeof priceRanges] || priceRanges.artwork;
    const price = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    return price.toString();
  }

  private static generateHash(): string {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 16; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash + '...';
  }

  private static generateCreatorAddress(): string {
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 8; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address + '...' + chars[Math.floor(Math.random() * chars.length)] + chars[Math.floor(Math.random() * chars.length)];
  }

  private static generateRandomDate(): string {
    const start = new Date('2023-01-01');
    const end = new Date();
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString().split('T')[0];
  }

  private static generateDescription(type: string, title: string): string {
    const descriptions = {
      artwork: [
        'A stunning digital artwork that showcases modern artistic techniques',
        'Beautiful digital creation with vibrant colors and intricate details',
        'Contemporary digital art piece with unique visual elements',
        'Innovative digital artwork combining traditional and modern techniques',
        'Striking digital composition with bold artistic expression'
      ],
      music: [
        'Original musical composition with innovative sound design',
        'Creative audio piece featuring unique musical arrangements',
        'Experimental music with cutting-edge production techniques',
        'Original soundtrack with atmospheric and immersive qualities',
        'Innovative musical work with distinctive audio characteristics'
      ],
      video: [
        'Creative video content with professional production quality',
        'Innovative motion graphics with stunning visual effects',
        'Original video content featuring unique creative concepts',
        'Professional video production with high-quality cinematography',
        'Creative video piece with distinctive visual storytelling'
      ],
      document: [
        'Comprehensive documentation with detailed technical information',
        'Professional document with thorough research and analysis',
        'Detailed guide with step-by-step instructions and examples',
        'Technical documentation with comprehensive coverage of topics',
        'Educational resource with valuable insights and information'
      ],
      code: [
        'Open-source code with clean architecture and best practices',
        'Professional code implementation with comprehensive documentation',
        'Innovative software solution with robust functionality',
        'Well-structured codebase with modular design principles',
        'High-quality code with extensive testing and optimization'
      ]
    };
    
    const typeDescriptions = descriptions[type as keyof typeof descriptions] || descriptions.artwork;
    return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
  }

  private static generateTags(type: string): string[] {
    const tagSets = {
      artwork: [
        ['digital-art', 'creative', 'visual'],
        ['abstract', 'modern', 'contemporary'],
        ['cyberpunk', 'neon', 'futuristic'],
        ['portrait', 'landscape', 'nature'],
        ['geometric', 'minimalist', 'design']
      ],
      music: [
        ['electronic', 'ambient', 'experimental'],
        ['cyberpunk', 'synthwave', 'futuristic'],
        ['ambient', 'meditation', 'relaxing'],
        ['electronic', 'dance', 'energetic'],
        ['soundscape', 'atmospheric', 'immersive']
      ],
      video: [
        ['animation', 'motion-graphics', 'visual-effects'],
        ['cyberpunk', 'futuristic', 'sci-fi'],
        ['abstract', 'experimental', 'artistic'],
        ['cinematic', 'storytelling', 'narrative'],
        ['3d', 'animation', 'character']
      ],
      document: [
        ['documentation', 'technical', 'guide'],
        ['research', 'analysis', 'study'],
        ['tutorial', 'educational', 'learning'],
        ['whitepaper', 'academic', 'scholarly'],
        ['manual', 'instruction', 'how-to']
      ],
      code: [
        ['smart-contract', 'blockchain', 'solidity'],
        ['javascript', 'typescript', 'web3'],
        ['react', 'frontend', 'ui'],
        ['api', 'backend', 'server'],
        ['nft', 'crypto', 'defi']
      ]
    };
    
    const typeTags = tagSets[type as keyof typeof tagSets] || tagSets.artwork;
    return typeTags[Math.floor(Math.random() * typeTags.length)];
  }

  // Get all registry items
  static async getRegistryItems(): Promise<RegistryItem[]> {
    this.initializeData();
    return [...this.registryItems];
  }

  // Get only verified items
  static async getVerifiedItems(): Promise<RegistryItem[]> {
    this.initializeData();
    return this.registryItems.filter(item => item.status === 'verified');
  }

  // Convert registry item to marketplace artwork
  static convertToMarketplaceArtwork(registryItem: RegistryItem): MarketplaceArtwork {
    // Map type to category
    const typeToCategory = {
      'artwork': 'digital-art' as const,
      'music': 'music' as const,
      'video': '3d-art' as const,
      'document': 'illustration' as const,
      'code': 'digital-art' as const
    };

    // Generate additional marketplace-specific data
    const generateCreatorName = (creator: string) => {
      const names = ['Alex Chen', 'Sarah Johnson', 'Mike Rodriguez', 'Emma Wilson', 'David Kim', 'Lisa Zhang', 'Tom Brown', 'Anna Lee'];
      return names[Math.floor(Math.random() * names.length)];
    };

    const generateFileInfo = (type: string) => {
      const fileInfo = {
        artwork: { size: '2.5 MB', dimensions: '1920x1080', format: 'PNG' },
        music: { size: '8.2 MB', dimensions: 'N/A', format: 'MP3' },
        video: { size: '45.6 MB', dimensions: '1920x1080', format: 'MP4' },
        document: { size: '1.8 MB', dimensions: 'A4', format: 'PDF' },
        code: { size: '0.5 MB', dimensions: 'N/A', format: 'SOL' }
      };
      return fileInfo[type as keyof typeof fileInfo] || fileInfo.artwork;
    };

    const fileInfo = generateFileInfo(registryItem.type);

    return {
      tokenId: registryItem.id,
      title: registryItem.title,
      description: registryItem.description,
      tokenURI: `https://dummyimage.com/800x600/6366f1/ffffff&text=${encodeURIComponent(registryItem.title)}`,
      creator: registryItem.creator,
      creatorName: generateCreatorName(registryItem.creator),
      price: registryItem.price, // USDT as primary price
      priceUSDC: registryItem.price, // 1:1 conversion for USDC
      priceUSDT: registryItem.price, // Primary USDT price
      priceDAI: registryItem.price, // 1:1 conversion for DAI
      priceIDRX: (parseFloat(registryItem.price) * 15000).toString(), // IDRX conversion from USDT
      category: typeToCategory[registryItem.type],
      tags: registryItem.tags,
      views: registryItem.views,
      likes: Math.floor(Math.random() * 100) + 10,
      sales: Math.floor(Math.random() * 50) + 5,
      createdAt: registryItem.createdAt,
      isVerified: true, // All items from registry are verified
      isFeatured: Math.random() > 0.8, // 20% chance to be featured
      isNew: Math.random() > 0.9, // 10% chance to be new
      licenseType: (['commercial', 'non-commercial', 'limited'] as const)[Math.floor(Math.random() * 3)],
      fileSize: fileInfo.size,
      dimensions: fileInfo.dimensions,
      format: fileInfo.format,
      royalty: Math.floor(Math.random() * 20) + 5, // 5-25% royalty
      licenseExpiration: Math.random() > 0.7 ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      usageRights: [
        'Print and digital reproduction',
        'Social media sharing',
        'Website and marketing use'
      ],
      restrictions: [
        'Attribution required',
        'No resale or redistribution'
      ],
      licenseTermsURI: `ipfs://Qm${Math.random().toString(36).substr(2, 44)}`,
      isListed: true, // All verified items are listed in marketplace
      licenseId: `license_${registryItem.id}`,
      licensePrice: registryItem.price,
      licenseAmount: '1' // Single license amount
    };
  }

  // Get marketplace artworks from verified registry items
  static async getMarketplaceArtworks(): Promise<MarketplaceArtwork[]> {
    const verifiedItems = await this.getVerifiedItems();
    return verifiedItems.map(item => this.convertToMarketplaceArtwork(item));
  }

  // Get registry item by ID
  static async getRegistryItemById(id: string): Promise<RegistryItem | null> {
    this.initializeData();
    return this.registryItems.find(item => item.id === id) || null;
  }

  // Add new registry item
  static async addRegistryItem(item: Omit<RegistryItem, 'id'>): Promise<RegistryItem> {
    this.initializeData();
    const newItem: RegistryItem = {
      ...item,
      id: (this.registryItems.length + 1).toString()
    };
    this.registryItems.push(newItem);
    return newItem;
  }

  // Update registry item status
  static async updateItemStatus(id: string, status: 'verified' | 'pending' | 'rejected'): Promise<boolean> {
    this.initializeData();
    const item = this.registryItems.find(item => item.id === id);
    if (item) {
      item.status = status;
      return true;
    }
    return false;
  }
}

export default IPRegistryService;
