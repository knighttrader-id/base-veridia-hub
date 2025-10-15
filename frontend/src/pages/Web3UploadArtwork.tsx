import { useState, useRef } from 'react';
import { 
  Upload, 
  Image, 
  FileText, 
  Hash, 
  Zap, 
  CheckCircle, 
  Loader,
  DollarSign,
  Shield,
  User,
  Copyright,
  Settings
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
    licenseType: 'commercial',
    royalty: '10',
    licenseExpiration: '',
    usageRights: [] as string[],
    restrictions: [] as string[],
    licenseTerms: '',
    // Contact Details
    creatorName: '',
    email: '',
    phone: '',
    website: '',
    socialMedia: '',
    location: '',
    // Rights and Usage Details
    copyrightOwner: '',
    copyrightYear: '',
    originalCreationDate: '',
    workType: '',
    medium: '',
    dimensions: '',
    resolution: '',
    fileFormat: '',
    // Additional Details
    inspiration: '',
    techniques: '',
    materials: '',
    software: '',
    collaboration: '',
    acknowledgments: '',
    // Legal Details
    ownershipProof: '',
    thirdPartyRights: '',
    modelReleases: '',
    locationReleases: '',
    trademarkRights: '',
    // Commercial Details
    exclusivity: '',
    territory: '',
    duration: '',
    renewalTerms: '',
    transferRights: '',
    sublicensing: ''
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
    { number: 2, title: 'Basic Details', icon: <FileText className="h-5 w-5" /> },
    { number: 3, title: 'Contact Info', icon: <User className="h-5 w-5" /> },
    { number: 4, title: 'Rights & Usage', icon: <Copyright className="h-5 w-5" /> },
    { number: 5, title: 'Additional Info', icon: <Settings className="h-5 w-5" /> },
    { number: 6, title: 'License Config', icon: <Shield className="h-5 w-5" /> },
    { number: 7, title: 'Mint NFT', icon: <Zap className="h-5 w-5" /> }
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

          {/* Progress Steps - Horizontal Layout */}
          <div className="mb-12">
            {/* Desktop: Full horizontal layout */}
            <div className="hidden lg:flex items-center justify-center space-x-2">
              {steps.map((stepItem, index) => (
                <div key={index} className="flex items-center flex-shrink-0">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                    ${step >= stepItem.number 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-transparent text-white' 
                      : 'bg-white/10 border-white/20 text-gray-400'
                    }
                  `}>
                    {step >= stepItem.number ? <CheckCircle className="h-5 w-5" /> : stepItem.icon}
                  </div>
                  <div className="ml-2">
                    <div className={`text-xs font-medium ${step >= stepItem.number ? 'text-white' : 'text-gray-400'} whitespace-nowrap`}>
                      {stepItem.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-6 h-0.5 mx-2 ${step > stepItem.number ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-white/20'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Mobile/Tablet: Compact horizontal layout with scroll */}
            <div className="lg:hidden">
              <div className="flex items-center space-x-1 overflow-x-auto pb-4 scrollbar-hide">
                {steps.map((stepItem, index) => (
                  <div key={index} className="flex items-center flex-shrink-0">
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300
                      ${step >= stepItem.number 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-transparent text-white' 
                        : 'bg-white/10 border-white/20 text-gray-400'
                      }
                    `}>
                      {step >= stepItem.number ? <CheckCircle className="h-4 w-4" /> : stepItem.icon}
                    </div>
                    <div className="ml-1">
                      <div className={`text-xs font-medium ${step >= stepItem.number ? 'text-white' : 'text-gray-400'} whitespace-nowrap`}>
                        {stepItem.title}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-4 h-0.5 mx-1 ${step > stepItem.number ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-white/20'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>Step {step} of {steps.length}</span>
                <span>{Math.round(((step - 1) / (steps.length - 1)) * 100)}% Complete</span>
              </div>
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
                      Price (USDT)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="100"
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
                    onClick={() => setStep(3)}
                    disabled={!formData.title}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next: Contact Info
                    <User className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Contact Information</h2>
                  <p className="text-gray-300">Provide your contact details for potential buyers and collaborators</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Creator Contact Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.creatorName}
                        onChange={(e) => setFormData({...formData, creatorName: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Social Media
                      </label>
                      <input
                        type="text"
                        value={formData.socialMedia}
                        onChange={(e) => setFormData({...formData, socialMedia: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="@yourusername or https://instagram.com/yourusername"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={() => setStep(4)}
                    disabled={!formData.creatorName || !formData.email}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next: Rights & Usage
                    <Copyright className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Rights & Usage Details</h2>
                  <p className="text-gray-300">Define the rights and usage terms for your artwork</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Copyright className="w-5 h-5" />
                    Copyright & Ownership
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Copyright Owner *
                      </label>
                      <input
                        type="text"
                        value={formData.copyrightOwner}
                        onChange={(e) => setFormData({...formData, copyrightOwner: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Your name or organization"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Copyright Year *
                      </label>
                      <input
                        type="number"
                        value={formData.copyrightYear}
                        onChange={(e) => setFormData({...formData, copyrightYear: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="2024"
                        min="1900"
                        max="2024"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Original Creation Date *
                      </label>
                      <input
                        type="date"
                        value={formData.originalCreationDate}
                        onChange={(e) => setFormData({...formData, originalCreationDate: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Work Type
                      </label>
                      <select
                        value={formData.workType}
                        onChange={(e) => setFormData({...formData, workType: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="">Select work type</option>
                        <option value="original">Original Work</option>
                        <option value="derivative">Derivative Work</option>
                        <option value="collaboration">Collaborative Work</option>
                        <option value="commission">Commissioned Work</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Medium
                      </label>
                      <input
                        type="text"
                        value={formData.medium}
                        onChange={(e) => setFormData({...formData, medium: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Digital art, Photography, 3D modeling, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Dimensions
                      </label>
                      <input
                        type="text"
                        value={formData.dimensions}
                        onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="1920x1080, 3000x2000, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Resolution
                      </label>
                      <input
                        type="text"
                        value={formData.resolution}
                        onChange={(e) => setFormData({...formData, resolution: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="300 DPI, 72 DPI, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        File Format
                      </label>
                      <input
                        type="text"
                        value={formData.fileFormat}
                        onChange={(e) => setFormData({...formData, fileFormat: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="PNG, JPG, SVG, etc."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={() => setStep(5)}
                    disabled={!formData.copyrightOwner || !formData.copyrightYear || !formData.originalCreationDate}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next: Additional Info
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Additional Information</h2>
                  <p className="text-gray-300">Provide additional details about your artwork and creative process</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Creative Process & Details
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Inspiration & Concept
                      </label>
                      <textarea
                        value={formData.inspiration}
                        onChange={(e) => setFormData({...formData, inspiration: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="What inspired this artwork? What concept or message does it convey?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Techniques Used
                      </label>
                      <textarea
                        value={formData.techniques}
                        onChange={(e) => setFormData({...formData, techniques: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Describe the techniques, methods, or processes used to create this artwork"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Materials & Tools
                        </label>
                        <input
                          type="text"
                          value={formData.materials}
                          onChange={(e) => setFormData({...formData, materials: e.target.value})}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="Photoshop, Procreate, Wacom tablet, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Software Used
                        </label>
                        <input
                          type="text"
                          value={formData.software}
                          onChange={(e) => setFormData({...formData, software: e.target.value})}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="Adobe Creative Suite, Blender, Maya, etc."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Collaboration Details
                      </label>
                      <textarea
                        value={formData.collaboration}
                        onChange={(e) => setFormData({...formData, collaboration: e.target.value})}
                        rows={2}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="If this is a collaborative work, describe the collaboration and contributors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Acknowledgments
                      </label>
                      <textarea
                        value={formData.acknowledgments}
                        onChange={(e) => setFormData({...formData, acknowledgments: e.target.value})}
                        rows={2}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Credit any sources, references, or people who contributed to this work"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(4)}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={() => setStep(6)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                  >
                    Next: License Config
                    <Shield className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">License Configuration</h2>
                  <p className="text-gray-300">Configure the licensing terms for your artwork</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    License Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        License Type *
                      </label>
                      <select
                        value={formData.licenseType}
                        onChange={(e) => setFormData({...formData, licenseType: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="commercial">Commercial License</option>
                        <option value="non-commercial">Non-Commercial License</option>
                        <option value="limited">Limited License</option>
                        <option value="exclusive">Exclusive License</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Royalty Percentage
                      </label>
                      <input
                        type="number"
                        value={formData.royalty}
                        onChange={(e) => setFormData({...formData, royalty: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="10"
                        min="0"
                        max="50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        License Expiration (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.licenseExpiration}
                        onChange={(e) => setFormData({...formData, licenseExpiration: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        License Terms (IPFS URI)
                      </label>
                      <input
                        type="text"
                        value={formData.licenseTerms}
                        onChange={(e) => setFormData({...formData, licenseTerms: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="ipfs://Qm..."
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-white mb-3">
                      Usage Rights (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'Print and digital reproduction',
                        'Social media sharing',
                        'Website and marketing use',
                        'Merchandise production',
                        'Advertising and promotion',
                        'Editorial use',
                        'Educational materials',
                        'Gaming and entertainment'
                      ].map((right) => (
                        <label key={right} className="flex items-center gap-2 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={formData.usageRights.includes(right)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({...formData, usageRights: [...formData.usageRights, right]});
                              } else {
                                setFormData({...formData, usageRights: formData.usageRights.filter(r => r !== right)});
                              }
                            }}
                            className="rounded border-white/20 bg-white/10"
                          />
                          {right}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-white mb-3">
                      Usage Restrictions (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'No resale or redistribution',
                        'Attribution required',
                        'No modification allowed',
                        'Limited geographic distribution',
                        'Time-limited usage',
                        'No AI training use',
                        'No commercial derivatives',
                        'No adult content use'
                      ].map((restriction) => (
                        <label key={restriction} className="flex items-center gap-2 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={formData.restrictions.includes(restriction)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({...formData, restrictions: [...formData.restrictions, restriction]});
                              } else {
                                setFormData({...formData, restrictions: formData.restrictions.filter(r => r !== restriction)});
                              }
                            }}
                            className="rounded border-white/20 bg-white/10"
                          />
                          {restriction}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.licenseType}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Zap className="h-5 w-5" />
                    Mint NFT
                  </button>
                </div>
              </div>
            )}

            {step === 7 && (
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
