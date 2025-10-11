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
  Sparkles
} from 'lucide-react';
import { AnimatedBackground, FloatingElements } from '../components/AnimatedBackground';
import { Web3Navbar } from '../components/Web3Navbar';
import { Web3Card } from '../components/Web3Card';

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
    // Simulate loading data
    const mockData: RegistryItem[] = [
      {
        id: '1',
        title: 'Digital Sunset',
        type: 'artwork',
        hash: '0x1234567890abcdef...',
        creator: '0x1234...5678',
        createdAt: '2024-01-15',
        status: 'verified',
        views: 1250,
        downloads: 45,
        price: '0.5',
        description: 'A beautiful digital artwork depicting a sunset over mountains',
        tags: ['digital-art', 'sunset', 'landscape']
      },
      {
        id: '2',
        title: 'Ambient Soundscape',
        type: 'music',
        hash: '0xabcdef1234567890...',
        creator: '0x5678...9abc',
        createdAt: '2024-01-14',
        status: 'verified',
        views: 890,
        downloads: 23,
        price: '0.3',
        description: 'Relaxing ambient music for meditation and focus',
        tags: ['ambient', 'music', 'meditation']
      },
      {
        id: '3',
        title: '3D Animation Short',
        type: 'video',
        hash: '0x9876543210fedcba...',
        creator: '0x9abc...def0',
        createdAt: '2024-01-13',
        status: 'pending',
        views: 567,
        downloads: 12,
        price: '1.2',
        description: 'Short 3D animated film showcasing character animation',
        tags: ['3d', 'animation', 'character']
      },
      {
        id: '4',
        title: 'Smart Contract Template',
        type: 'code',
        hash: '0xfedcba0987654321...',
        creator: '0xdef0...1234',
        createdAt: '2024-01-12',
        status: 'verified',
        views: 2100,
        downloads: 156,
        price: '0.1',
        description: 'Reusable smart contract template for NFT marketplace',
        tags: ['smart-contract', 'solidity', 'nft']
      }
    ];

    setTimeout(() => {
      setItems(mockData);
      setLoading(false);
    }, 1000);
  }, []);

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

      <div className="relative z-10 pt-20">
        {/* Hero Section */}
        <div className="text-center py-16 px-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            IP Registry
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
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

              {/* Items Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedItems.map((item) => (
                    <div key={item.id} className="group">
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 h-full">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(item.type)}
                            <div>
                              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-400 capitalize">{item.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            <span className={`text-xs font-medium ${statuses.find(s => s.value === item.status)?.color}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>

                        {/* Hash */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                            <Hash className="h-4 w-4" />
                            <span>Hash</span>
                          </div>
                          <p className="text-white font-mono text-xs bg-black/20 rounded px-2 py-1">
                            {item.hash}
                          </p>
                        </div>

                        {/* Description */}
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                          {item.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {item.views.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              {item.downloads}
                            </div>
                          </div>
                          <div className="text-white font-semibold">
                            {item.price} ETH
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-gray-300">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Creator */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-300">{item.creator}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedItems.map((item) => (
                    <div key={item.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getTypeIcon(item.type)}
                          <div>
                            <h3 className="text-lg font-bold text-white">{item.title}</h3>
                            <p className="text-sm text-gray-400">{item.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-white font-semibold">{item.price} ETH</div>
                            <div className="text-sm text-gray-400">{item.views} views</div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            <span className={`text-sm font-medium ${statuses.find(s => s.value === item.status)?.color}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Load More */}
              <div className="text-center py-8">
                <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto">
                  <Sparkles className="h-5 w-5" />
                  Load More Items
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
