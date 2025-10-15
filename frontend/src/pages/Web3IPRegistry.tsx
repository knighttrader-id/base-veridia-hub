import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Hash, 
  Calendar, 
  User, 
  Eye, 
  Download,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Globe,
  Lock,
  FileText,
  Image,
  Music,
  Video,
  Code,
  Sparkles,
  X,
  TrendingUp,
  Heart,
  Share2,
  Tag
} from 'lucide-react';
import { AnimatedBackground, FloatingElements } from '../components/AnimatedBackground';
import { Web3Navbar } from '../components/Web3Navbar';
import DemoModeBadge from '../components/DemoModeBadge';
import { Web3Card } from '../components/Web3Card';
import TokenPriceDisplay from '../components/TokenPriceDisplay';
import TokenIcon from '../components/TokenIcon';
import { getNativeToken } from '../config/tokens';
import IPRegistryService from '../services/ipRegistryService';

interface RegistryItem {
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

export default function Web3IPRegistry() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayToken, setDisplayToken] = useState(getNativeToken().address);
  const [selectedItem, setSelectedItem] = useState<RegistryItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');

  const types = [
    { value: 'all', label: 'All Types', icon: <Globe className="h-4 w-4" /> },
    { value: 'artwork', label: 'Artwork', icon: <Image className="h-4 w-4" /> },
    { value: 'music', label: 'Music', icon: <Music className="h-4 w-4" /> },
    { value: 'video', label: 'Video', icon: <Video className="h-4 w-4" /> },
    { value: 'document', label: 'Document', icon: <FileText className="h-4 w-4" /> },
    { value: 'code', label: 'Code', icon: <Code className="h-4 w-4" /> }
  ];

  const statuses = [
    { value: 'all', label: 'All Status', color: 'text-gray-400' },
    { value: 'verified', label: 'Verified', color: 'text-green-400' },
    { value: 'pending', label: 'Pending', color: 'text-yellow-400' },
    { value: 'rejected', label: 'Rejected', color: 'text-red-400' }
  ];

  useEffect(() => {
    loadRegistryItems();
  }, []);

  const loadRegistryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const registryItems = await IPRegistryService.getRegistryItems();
      setItems(registryItems);
    } catch (error) {
      console.error('Error loading registry items:', error);
      setError('Failed to load registry items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'views':
        return b.views - a.views;
      case 'price':
        return parseFloat(b.price) - parseFloat(a.price);
      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedStatus, sortBy]);

  // Currency conversion function
  const convertPrice = (usdtPrice: string, currency: string): { price: string; symbol: string } => {
    const usdtValue = parseFloat(usdtPrice);
    
    switch (currency) {
      case 'USDT':
        return { price: usdtValue.toString(), symbol: 'USDT' };
      case 'USDC':
        return { price: usdtValue.toString(), symbol: 'USDC' };
      case 'DAI':
        return { price: usdtValue.toString(), symbol: 'DAI' };
      case 'IDRX':
        return { price: (usdtValue * 15000).toLocaleString(), symbol: 'IDRX' };
      case 'ETH':
        return { price: (usdtValue / 3000).toFixed(4), symbol: 'ETH' };
      case 'BTC':
        return { price: (usdtValue / 45000).toFixed(6), symbol: 'BTC' };
      default:
        return { price: usdtValue.toString(), symbol: 'USDT' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'artwork':
        return <Image className="h-5 w-5 text-blue-400" />;
      case 'music':
        return <Music className="h-5 w-5 text-purple-400" />;
      case 'video':
        return <Video className="h-5 w-5 text-pink-400" />;
      case 'document':
        return <FileText className="h-5 w-5 text-green-400" />;
      case 'code':
        return <Code className="h-5 w-5 text-orange-400" />;
      default:
        return <Globe className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <AnimatedBackground variant="grid" intensity="low" />
      <FloatingElements />
      
      {/* Web3 Navbar */}
      <Web3Navbar />
      
      {/* Demo Mode Badge */}
      <DemoModeBadge />

      <div className="relative z-10 pt-20 w-full overflow-x-hidden">
        {/* Hero Section */}
        <div className="text-center py-16 px-4 w-full">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 break-words whitespace-nowrap">
            IP Registry
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed break-words">
            Explore and verify intellectual property protected on the blockchain. 
            Discover verified digital assets and their ownership history.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span>Blockchain Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-blue-400" />
              <span>Immutable Records</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" />
              <span>Instant Verification</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {/* Search and Filter Section */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, description, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {types.map(type => (
                      <option key={type.value} value={type.value} className="bg-gray-800">
                        {type.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value} className="bg-gray-800">
                        {status.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="newest" className="bg-gray-800">Newest</option>
                    <option value="oldest" className="bg-gray-800">Oldest</option>
                    <option value="views" className="bg-gray-800">Most Viewed</option>
                    <option value="price" className="bg-gray-800">Price</option>
                  </select>

                  {/* Currency Filter */}
                  <div className="flex items-center gap-2 px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                    <Zap className="h-5 w-5 text-blue-400" />
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="bg-transparent text-white focus:outline-none"
                    >
                      <option value="USDT" className="bg-gray-800">USDT</option>
                      <option value="USDC" className="bg-gray-800">USDC</option>
                      <option value="DAI" className="bg-gray-800">DAI</option>
                      <option value="IDRX" className="bg-gray-800">IDRX</option>
                      <option value="ETH" className="bg-gray-800">ETH</option>
                      <option value="BTC" className="bg-gray-800">BTC</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white text-lg">Loading registry items...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Error Loading Data</h3>
                <p className="text-gray-400 mb-4">{error}</p>
                <button
                  onClick={loadRegistryItems}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {filteredItems.length} Items Found
                  </h2>
                  <p className="text-gray-400">
                    {selectedType !== 'all' && `in ${types.find(t => t.value === selectedType)?.label}`}
                    <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                      Prices in {selectedCurrency}
                    </span>
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      <Filter className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List Format */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                {/* Table Header */}
                <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400 min-w-[800px]">
                    <div className="col-span-3">Item</div>
                    <div className="col-span-2">Creator</div>
                    <div className="col-span-2">Hash</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Type</div>
                    <div className="col-span-1">Views</div>
                    <div className="col-span-1">Price</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-white/10">
                  {paginatedItems.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-white mb-2">No items found</h3>
                        <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                      </div>
                    </div>
                  ) : (
                    paginatedItems.map((item) => (
                      <div key={item.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                        <div className="grid grid-cols-12 gap-4 items-center min-w-[800px]">
                        {/* Item Info */}
                        <div className="col-span-3">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(item.type)}
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-semibold text-white truncate">
                                {item.title}
                              </h3>
                              <p className="text-xs text-gray-400 truncate">
                                {item.description}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.tags.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-gray-300"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {item.tags.length > 2 && (
                                  <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-gray-300">
                                    +{item.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Creator */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-300 font-mono">
                              {item.creator}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Hash */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-300 font-mono bg-black/20 rounded px-2 py-1 truncate">
                              {item.hash.substring(0, 12)}...
                            </span>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="col-span-1">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(item.status)}
                            <span className={`text-xs font-medium ${statuses.find(s => s.value === item.status)?.color}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>

                        {/* Type */}
                        <div className="col-span-1">
                          <span className="text-xs text-gray-400 capitalize">
                            {item.type}
                          </span>
                        </div>

                        {/* Views */}
                        <div className="col-span-1">
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Eye className="h-4 w-4" />
                            {item.views.toLocaleString()}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-1">
                          <div className="text-sm text-white font-semibold">
                            <div className="flex items-center gap-1">
                              <span>{convertPrice(item.price, selectedCurrency).price}</span>
                              <span className="text-xs text-gray-400">{convertPrice(item.price, selectedCurrency).symbol}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowDetailModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {/* Handle download */}}
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {/* Handle blockchain view */}}
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="View on Blockchain"
                            >
                              <Globe className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                </div>
                </div>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white/5 border-t border-white/10 gap-4">
                <div className="text-sm text-gray-400">
                  Showing {startIndex + 1}-{Math.min(endIndex, sortedItems.length)} of {sortedItems.length} items
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {/* Desktop: Show page numbers */}
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                : 'bg-white/10 hover:bg-white/20 text-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      {totalPages > 5 && (
                        <>
                          <span className="text-gray-400">...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                              currentPage === totalPages
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                : 'bg-white/10 hover:bg-white/20 text-gray-300'
                            }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    
                    {/* Mobile: Show current page */}
                    <div className="sm:hidden">
                      <span className="px-3 py-2 text-sm bg-white/10 text-gray-300 rounded-lg">
                        {currentPage} / {totalPages}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getTypeIcon(selectedItem.type)}
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedItem.title}</h2>
                    <p className="text-gray-400 capitalize">{selectedItem.type} • ID: {selectedItem.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Description</label>
                      <p className="text-white text-sm mt-1">{selectedItem.description}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Creator</label>
                      <p className="text-white text-sm mt-1 font-mono">{selectedItem.creator}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Created Date</label>
                      <p className="text-white text-sm mt-1">{new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedItem.status)}
                        <span className={`text-sm font-medium ${statuses.find(s => s.value === selectedItem.status)?.color}`}>
                          {selectedItem.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Blockchain Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Blockchain Hash</label>
                      <p className="text-white text-sm mt-1 font-mono bg-black/20 rounded px-2 py-1 break-all">
                        {selectedItem.hash}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">IPFS Hash</label>
                      <p className="text-white text-sm mt-1 font-mono bg-black/20 rounded px-2 py-1 break-all">
                        ipfs://Qm{Math.random().toString(36).substr(2, 44)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Network</label>
                      <p className="text-white text-sm mt-1">Base Network</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Block Number</label>
                      <p className="text-white text-sm mt-1 font-mono">#{Math.floor(Math.random() * 1000000) + 1000000}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-400">Views</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedItem.views.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-400">Downloads</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedItem.downloads}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-gray-400">Likes</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{Math.floor(Math.random() * 100) + 10}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Share2 className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-gray-400">Shares</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{Math.floor(Math.random() * 50) + 5}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Information */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Pricing Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-sm text-gray-400 mb-1">Selected Currency</div>
                    <div className="text-xl font-bold text-white">
                      {convertPrice(selectedItem.price, selectedCurrency).price} {convertPrice(selectedItem.price, selectedCurrency).symbol}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-sm text-gray-400 mb-1">USDT Base</div>
                    <div className="text-lg font-semibold text-white">{selectedItem.price} USDT</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-sm text-gray-400 mb-1">USDC Equivalent</div>
                    <div className="text-lg font-semibold text-white">{selectedItem.price} USDC</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-sm text-gray-400 mb-1">IDRX Equivalent</div>
                    <div className="text-lg font-semibold text-white">{(parseFloat(selectedItem.price) * 15000).toLocaleString()} IDRX</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 pt-6 border-t border-white/10">
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105">
                  <Download className="h-5 w-5" />
                  Download Certificate
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors">
                  <Globe className="h-5 w-5" />
                  View on Blockchain
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors">
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors">
                  <Heart className="h-5 w-5" />
                  Like
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
