import { useState, useRef } from 'react';
import { 
  Upload, 
  Image, 
  FileText, 
  Hash, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Loader,
  Camera,
  Link,
  Tag,
  DollarSign,
  Clock,
  Shield,
  Sparkles
} from 'lucide-react';
import { AnimatedBackground, FloatingElements } from '../components/AnimatedBackground';
import { Web3Navbar } from '../components/Web3Navbar';

export default function Web3UploadArtwork() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    price: '',
    licenseType: 'commercial'
  });
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setUploadedFile(file);
      setStep(2);
    } else {
      alert('Please upload an image file');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const simulateUpload = async () => {
    setUploading(true);
    setUploadProgress(0);
    
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }
    
    setUploading(false);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!uploadedFile) return;
    
    await simulateUpload();
  };

  const steps = [
    { number: 1, title: 'Upload File', icon: <Upload className="h-5 w-5" /> },
    { number: 2, title: 'Add Details', icon: <FileText className="h-5 w-5" /> },
    { number: 3, title: 'Mint NFT', icon: <Zap className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <AnimatedBackground variant="particles" intensity="low" />
      <FloatingElements />
      
      {/* Web3 Navbar */}
      <Web3Navbar />

      <div className="relative z-10 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Upload Your Artwork
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Protect your digital creations with blockchain technology and start earning from your art
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-8">
              {steps.map((stepItem, index) => (
                <div key={index} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                    ${step >= stepItem.number 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-transparent text-white' 
                      : 'bg-white/10 border-white/20 text-gray-400'
                    }
                  `}>
                    {step >= stepItem.number ? <CheckCircle className="h-6 w-6" /> : stepItem.icon}
                  </div>
                  <div className="ml-3">
                    <div className={`text-sm font-medium ${step >= stepItem.number ? 'text-white' : 'text-gray-400'}`}>
                      {stepItem.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${step > stepItem.number ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-white/20'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            {step === 1 && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-6">Upload Your Artwork</h2>
                
                <div
                  className={`
                    relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300
                    ${dragActive 
                      ? 'border-blue-400 bg-blue-500/20' 
                      : 'border-white/30 hover:border-blue-400 hover:bg-white/5'
                    }
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Drop your artwork here
                      </h3>
                      <p className="text-gray-300 mb-4">
                        or click to browse files
                      </p>
                      <p className="text-sm text-gray-400">
                        Supports JPG, PNG, GIF, WebP (Max 10MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <Shield className="h-8 w-8 text-blue-400 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Blockchain Security</h3>
                    <p className="text-gray-400 text-sm">Your artwork gets a unique hash for copyright protection</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <Zap className="h-8 w-8 text-purple-400 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Instant Minting</h3>
                    <p className="text-gray-400 text-sm">Convert to NFT with automated metadata</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <DollarSign className="h-8 w-8 text-green-400 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Start Earning</h3>
                    <p className="text-gray-400 text-sm">Set your price and start monetizing</p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && uploadedFile && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-6">Add Artwork Details</h2>
                  
                  <div className="flex items-center justify-center mb-6">
                    <img
                      src={URL.createObjectURL(uploadedFile)}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-xl border border-white/20"
                    />
                    <div className="ml-4 text-left">
                      <p className="text-white font-medium">{uploadedFile.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Artwork Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Enter artwork title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">Select category</option>
                      <option value="digital-art">Digital Art</option>
                      <option value="photography">Photography</option>
                      <option value="illustration">Illustration</option>
                      <option value="3d-art">3D Art</option>
                      <option value="music">Music</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Describe your artwork, inspiration, techniques used..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="nft, digital-art, abstract (comma separated)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Price (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="0.1"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.title}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Zap className="h-5 w-5" />
                    Mint NFT
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center">
                {uploading ? (
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                      <Loader className="h-8 w-8 text-white animate-spin" />
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-4">Minting Your NFT</h2>
                      <p className="text-gray-300 mb-6">Please wait while we process your artwork...</p>
                      
                      <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      
                      <p className="text-sm text-gray-400">{uploadProgress}% Complete</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-4">NFT Minted Successfully!</h2>
                      <p className="text-gray-300 mb-6">
                        Your artwork has been protected on the blockchain and is now available in the marketplace.
                      </p>
                      
                      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Token ID:</span>
                            <p className="text-white font-mono">#12345</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Transaction:</span>
                            <p className="text-white font-mono">0x1234...5678</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Network:</span>
                            <p className="text-white">Base</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Gas Used:</span>
                            <p className="text-white">45,230</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2">
                          <Hash className="h-5 w-5" />
                          View on Explorer
                        </button>
                        
                        <button className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2">
                          <Image className="h-5 w-5" />
                          View in Gallery
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
