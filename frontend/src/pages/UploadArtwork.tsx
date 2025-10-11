import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Image, Music, Video, Eye, Loader } from 'lucide-react';

const categories = [
  { value: 'design', label: 'Desain' },
  { value: 'music', label: 'Musik' },
  { value: 'film', label: 'Film/Video' },
  { value: 'writing', label: 'Tulisan' },
  { value: 'photography', label: 'Fotografi' }
];

export default function UploadArtwork() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [mintingProgress, setMintingProgress] = useState(0);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview('');
      }
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8" />;
    if (type.startsWith('audio/')) return <Music className="h-8 w-8" />;
    if (type.startsWith('video/')) return <Video className="h-8 w-8" />;
    return <FileText className="h-8 w-8" />;
  };

  const handleMintNFT = async () => {
    if (!file || !formData.title || !formData.category) {
      alert('Mohon lengkapi semua field dan pilih file');
      return;
    }

    setMinting(true);
    setMintingProgress(0);

    // Simulate blockchain minting process
    const steps = [
      { message: 'Uploading file to IPFS...', duration: 2000 },
      { message: 'Generating metadata hash...', duration: 1500 },
      { message: 'Creating smart contract...', duration: 2500 },
      { message: 'Minting NFT on blockchain...', duration: 3000 },
      { message: 'Finalizing certificate...', duration: 1000 }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      setMintingProgress((i + 1) * 20);
    }

    setMinting(false);
    
    // Show success notification
    alert('Sertifikat digital berhasil di-mint! Redirecting ke halaman lisensi...');
    navigate('/select-license');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Karya Kreatif</h1>
        <p className="mt-1 text-sm text-gray-600">Unggah dan mint karya digital Anda ke blockchain</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Karya</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Karya *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan judul karya"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Singkat
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Deskripsikan karya Anda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,audio/*,video/*,.pdf"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {file ? (
                  <div className="space-y-2">
                    <div className="flex justify-center text-blue-600">
                      {getFileIcon(file.type)}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Klik untuk upload
                      </span> atau drag & drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, MP3, MP4, PDF (Max 100MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Preview & Actions */}
        <div className="space-y-6">
          {/* File Preview */}
          {file && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Preview
              </h2>
              
              {preview ? (
                <div className="space-y-3">
                  <img 
                    src={preview} 
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                  <div className="text-center">
                    {getFileIcon(file.type)}
                    <p className="mt-2 text-sm text-gray-600">{file.name}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mint Button */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Minting</h2>
            
            {minting && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress Minting</span>
                  <span>{mintingProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-red-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${mintingProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleMintNFT}
              disabled={!file || !formData.title || !formData.category || minting}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-red-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {minting ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Minting NFT...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Mint Sertifikat Digital
                </>
              )}
            </button>

            <p className="mt-3 text-xs text-gray-500 text-center">
              Proses minting akan mencatat karya Anda ke blockchain dan menghasilkan sertifikat digital yang tidak dapat dipalsukan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}