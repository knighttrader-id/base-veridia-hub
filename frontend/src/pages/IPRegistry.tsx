import React, { useState, useEffect } from 'react';
import { getArtworks } from '../services/onchainArtworkService';
import { useWallet } from '../contexts/WalletContext';
import {
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  User,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Hash,
  Globe
} from 'lucide-react';

const categories = ['Semua', 'Desain', 'Musik', 'Film', 'Tulisan', 'Fotografi'];
const statusOptions = ['Semua', 'registered', 'pending', 'rejected'];

export default function IPRegistry() {
  const { account } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [selectedWork, setSelectedWork] = useState<any>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      loadArtworks();
    }
  }, [account]);

  const loadArtworks = async () => {
    try {
      setLoading(true);
      const result = await getArtworks();
      setArtworks(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load artworks');
    } finally {
      setLoading(false);
    }
  };

  const filteredWorks = artworks.filter(work => {
    const matchesSearch = work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          work.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          work.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || work.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Semua' || work.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registri Hak Kekayaan Intelektual</h1>
        <p className="mt-1 text-sm text-gray-600">Database lengkap semua karya kreatif yang terdaftar</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Karya</p>
              <p className="text-2xl font-bold text-gray-900">{artworks.length.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Terdaftar</p>
              <p className="text-2xl font-bold text-gray-900">
                {artworks.length.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Loading</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On-Chain</p>
              <p className="text-2xl font-bold text-gray-900">
                {artworks.length.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan judul, kreator, atau ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
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
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'Semua' ? 'Semua Status' : status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* IP Works Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Karya
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kreator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Registrasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Daftar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lisensi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWorks.map((work) => (
                <tr key={work.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={work.thumbnail} 
                        alt={work.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {work.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {work.category} • {work.fileSize}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{work.creator.name}</div>
                    <div className="text-sm text-gray-500">{work.creator.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">{work.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(work.status)}`}>
                      {getStatusIcon(work.status)}
                      <span className="ml-1 capitalize">{work.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {new Date(work.registrationDate).toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{work.licenseType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => setSelectedWork(work)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900 transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredWorks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Tidak ada karya yang ditemukan</div>
          <p className="text-gray-400 text-sm mt-2">Coba ubah kata kunci atau filter pencarian</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedWork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedWork.title}</h2>
                  <p className="text-gray-600">ID: {selectedWork.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedWork(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={selectedWork.thumbnail} 
                    alt={selectedWork.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Informasi Kreator</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Nama:</span> {selectedWork.creator.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedWork.creator.email}</p>
                      <p><span className="font-medium">ID Kreator:</span> {selectedWork.creator.id}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Status Verifikasi</h3>
                    <div className={`flex items-center ${getVerificationColor(selectedWork.verificationStatus)}`}>
                      <Shield className="h-4 w-4 mr-1" />
                      <span className="capitalize">{selectedWork.verificationStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Detail Teknis</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Kategori:</span> {selectedWork.category}</p>
                    <p><span className="font-medium">Tipe File:</span> {selectedWork.fileType}</p>
                    <p><span className="font-medium">Ukuran:</span> {selectedWork.fileSize}</p>
                    <p><span className="font-medium">Tanggal Daftar:</span> {new Date(selectedWork.registrationDate).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Lisensi & Hak Cipta</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Tipe Lisensi:</span> {selectedWork.licenseType}</p>
                    <p><span className="font-medium">Royalti:</span> {selectedWork.royaltyRate}%</p>
                    <p><span className="font-medium">Berakhir:</span> {new Date(selectedWork.copyrightExpiry).toLocaleDateString('id-ID')}</p>
                    <p><span className="font-medium">Total Penggunaan:</span> {selectedWork.usageCount}x</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Blockchain Info</h3>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center">
                      <Hash className="h-3 w-3 mr-1" />
                      <span className="font-medium">Hash:</span>
                    </p>
                    <p className="font-mono text-xs break-all text-gray-600">
                      {selectedWork.blockchainHash}
                    </p>
                    <p className="flex items-center">
                      <Globe className="h-3 w-3 mr-1" />
                      <span className="font-medium">IPFS:</span>
                    </p>
                    <p className="font-mono text-xs break-all text-gray-600">
                      {selectedWork.ipfsHash}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Deskripsi</h3>
                <p className="text-gray-600 text-sm">{selectedWork.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedWork.tags?.map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {tag}
                    </span>
                  )) || <span className="text-gray-500 text-sm">Tidak ada tags</span>}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Download Sertifikat
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Lihat di Blockchain
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}