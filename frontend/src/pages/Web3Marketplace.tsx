import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, ShoppingCart, User, Star, Loader, Zap, TrendingUp, Users, Clock, Sparkles, Heart, Share2 } from 'lucide-react';
import { getMarketplaceArtworks, MarketplaceArtwork } from '../services/artworkService';
import { AnimatedBackground, FloatingElements } from '../components/AnimatedBackground';
import { Web3Card, Web3Grid, Web3Hero } from '../components/Web3Card';
import { Web3Navbar, FloatingActionButton } from '../components/Web3Navbar';

const categories = ['Semua', 'Desain', 'Musik', 'Film', 'Tulisan', 'Fotografi', 'NFT', '3D Art'];

export default function Web3Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [artworks, setArtworks] = useState<MarketplaceArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price' | 'popular'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadArtworks();
  }, [selectedCategory, sortBy]);

  const loadArtworks = async () => {
    try {
      setLoading(true);
      const data = await getMarketplaceArtworks();
      setArtworks(data);
    } catch (err) {
      console.error('Error loading artworks:', err);
      setError('Failed to load marketplace artworks');
    } finally {
      setLoading(false);
    }
  };

  const filteredArtworks = artworks.filter(artwork => {
    const matchesSearch = artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artwork.creator.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedArtworks = [...filteredArtworks].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'popular':
        return Math.random() - 0.5; // Mock popularity
      default:
        return 0; // Keep original order for newest
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount * 15000);
  };

  const getLicenseColor = (licenseType: string) => {
    switch (licenseType) {
      case 'Komersial':
        return 'bg-green-100 text-green-800';
      case 'Non-Komersial':
        return 'bg-blue-100 text-blue-800';
      case 'Terbatas':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <AnimatedBackground variant="particles" intensity="medium" />
      <FloatingElements />
      
      {/* Web3 Navbar */}
      <Web3Navbar />

      <div className="relative z-10 pt-20">
        {/* Hero Section */}
        <Web3Hero
          title="VeridiaHub"
          subtitle="Web3 Copyright Marketplace"
          description="Discover, trade, and monetize digital artworks on the blockchain. Experience the future of creative ownership with our decentralized platform."
          ctaText="Start Creating"
          onCtaClick={() => {}}
          stats={[
            { label: 'Total Artworks', value: '1,234', icon: <Zap className="w-6 h-6" /> },
            { label: 'Active Creators', value: '567', icon: <Users className="w-6 h-6" /> },
            { label: 'Total Sales', value: '89.2 ETH', icon: <TrendingUp className="w-6 h-6" /> },
            { label: 'Avg. Price', value: '0.15 ETH', icon: <Clock className="w-6 h-6" /> }
          ]}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter Section */}
          <div className="mb-12">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search artworks, creators, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  />
                </div>

                {/* Sort and View Controls */}
                <div className="flex gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="newest" className="bg-gray-800">Newest</option>
                    <option value="price" className="bg-gray-800">Price</option>
                    <option value="popular" className="bg-gray-800">Popular</option>
                  </select>

                  <div className="flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-4 py-4 transition-colors ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      <Filter className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-4 py-4 transition-colors ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-3 mt-6">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                        : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 hover:text-white hover:scale-105'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-white text-lg">Loading artworks...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto">
                <p className="text-red-400 text-lg">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {filteredArtworks.length} Artworks Found
                  </h2>
                  <p className="text-gray-400">
                    {selectedCategory !== 'Semua' && `in ${selectedCategory}`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Sparkles className="h-5 w-5" />
                    <span>Web3 Powered</span>
                  </div>
                </div>
              </div>

              {/* Artworks Grid */}
              <Web3Grid>
                {sortedArtworks.map((artwork) => (
                  <Web3Card
                    key={artwork.tokenId}
                    title={artwork.title}
                    description={artwork.description}
                    price={artwork.price}
                    image={artwork.tokenURI}
                    creator={artwork.creator}
                    stats={{
                      views: Math.floor(Math.random() * 1000) + 100,
                      likes: Math.floor(Math.random() * 100) + 10,
                      sales: Math.floor(Math.random() * 50) + 5
                    }}
                    tags={['Digital Art', 'NFT', 'Blockchain']}
                    isFeatured={Math.random() > 0.8}
                    isNew={Math.random() > 0.9}
                    onClick={() => {}}
                  />
                ))}
              </Web3Grid>

              {/* Load More */}
              <div className="text-center py-8">
                <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto">
                  <Sparkles className="h-5 w-5" />
                  Load More Artworks
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => {}}
        icon={<Zap className="h-5 w-5" />}
        label="Create Artwork"
      />
    </div>
  );
}
