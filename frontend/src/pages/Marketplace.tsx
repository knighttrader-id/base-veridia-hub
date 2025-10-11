import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, ShoppingCart, User, Star, Loader } from 'lucide-react';
import { getMarketplaceArtworks, MarketplaceArtwork } from '../services/artworkService';

const categories = ['Semua', 'Desain', 'Musik', 'Film', 'Tulisan', 'Fotografi'];

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [artworks, setArtworks] = useState<MarketplaceArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArtworks();
  }, [selectedCategory]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount * 15000); // Convert USD to IDR for display
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        <p className="mt-1 text-sm text-gray-600">Jelajahi dan beli lisensi karya kreatif digital</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari karya atau kreator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Memuat karya...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtworks.map((artwork) => (
            <div key={artwork.tokenId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative overflow-hidden">
                <img
                  src={artwork.tokenURI || 'https://images.pexels.com/photos/1742370/pexels-photo-1742370.jpeg?w=300&h=200&fit=crop'}
                  alt={artwork.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLicenseColor('Komersial')}`}>
                    Komersial
                  </span>
                </div>
              <div className="absolute top-3 right-3">
                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Eye className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {artwork.title}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <User className="h-4 w-4 mr-1" />
                  {artwork.creator ? `${artwork.creator.slice(0, 6)}...${artwork.creator.slice(-4)}` : 'Unknown Creator'}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {artwork.description || 'No description available'}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-gray-600">{(4.0 + Math.random() * 1).toFixed(1)}</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {Number(artwork.price) === 0 ? 'Gratis' : formatCurrency(Number(artwork.price))}
                </div>
              </div>

              <Link
                to={`/purchase/${artwork.tokenId}`}
                className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-red-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Beli Lisensi
              </Link>
            </div>
          </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredArtworks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Tidak ada karya yang ditemukan</div>
          <p className="text-gray-400 text-sm mt-2">Coba ubah kata kunci atau filter pencarian</p>
        </div>
      )}
    </div>
  );
}