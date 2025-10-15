import { useState } from 'react';
import { X, Heart, Share2, ExternalLink, Copy, CheckCircle, Star, TrendingUp, Eye, Clock, Shield } from 'lucide-react';
import { ArtworkImage } from './ImageWithFallback';

interface ArtworkDetailModalProps {
  artwork: {
    tokenId: string;
    title: string;
    description: string;
    tokenURI: string;
    creator: string;
    creatorName: string;
    price: string;
    category: string;
    tags: string[];
    views: number;
    likes: number;
    sales: number;
    createdAt: string;
    isVerified: boolean;
    isFeatured: boolean;
    isNew: boolean;
    licenseType: string;
    fileSize: string;
    dimensions: string;
    format: string;
    royalty?: number;
    licenseExpiration?: string;
    usageRights?: string[];
    restrictions?: string[];
    licenseTermsURI?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onPurchase?: () => void;
  account?: string | null;
}

export function ArtworkDetailModal({ 
  artwork, 
  isOpen, 
  onClose, 
  onPurchase,
  account 
}: ArtworkDetailModalProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(artwork.tokenId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: artwork.title,
          text: artwork.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Artwork Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-800 rounded-xl overflow-hidden">
                <ArtworkImage
                  src={artwork.tokenURI}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                  fallbackText={`Artwork ${artwork.title}`}
                />
              </div>
              
              {/* Image Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors ${
                    isLiked 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-gray-800/50 text-gray-300 border border-gray-600 hover:bg-gray-700/50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-800/50 text-gray-300 border border-gray-600 hover:bg-gray-700/50 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
                
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-800/50 text-gray-300 border border-gray-600 hover:bg-gray-700/50 transition-colors"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                  {copied ? 'Copied' : 'Copy ID'}
                </button>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Title and Badges */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-2xl font-bold text-white">{artwork.title}</h3>
                  <div className="flex gap-2">
                    {artwork.isFeatured && (
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        Featured
                      </span>
                    )}
                    {artwork.isNew && (
                      <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold">
                        New
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-300 text-lg leading-relaxed">
                  {artwork.description}
                </p>
              </div>

              {/* Creator Info */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {artwork.creatorName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{artwork.creatorName}</div>
                    <div className="text-gray-400 text-sm font-mono">
                      {artwork.creator.slice(0, 6)}...{artwork.creator.slice(-4)}
                    </div>
                  </div>
                  {artwork.isVerified && (
                    <div className="ml-auto">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                    <Eye className="w-5 h-5" />
                    {artwork.views.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">Views</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                    <Heart className="w-5 h-5" />
                    {artwork.likes.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">Likes</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                    <TrendingUp className="w-5 h-5" />
                    {artwork.sales.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">Sales</div>
                </div>
              </div>

              {/* File Info */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">File Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Category</div>
                    <div className="text-white capitalize">{artwork.category}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Format</div>
                    <div className="text-white">{artwork.format}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Size</div>
                    <div className="text-white">{artwork.fileSize}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Dimensions</div>
                    <div className="text-white">{artwork.dimensions}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Created</div>
                    <div className="text-white flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(artwork.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* License Information */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  License Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-400 text-sm">License Type</div>
                      <div className="text-white font-medium capitalize">{artwork.licenseType}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Royalty</div>
                      <div className="text-white font-medium">{artwork.royalty || 10}% on secondary sales</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Expiration</div>
                      <div className="text-white font-medium">
                        {artwork.licenseExpiration ? new Date(artwork.licenseExpiration).toLocaleDateString() : 'Perpetual'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Terms & Conditions</div>
                      {artwork.licenseTermsURI ? (
                        <a 
                          href={artwork.licenseTermsURI} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                        >
                          View License Terms (IPFS)
                        </a>
                      ) : (
                        <div className="text-gray-400 text-sm">Standard terms apply</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Usage Rights */}
                  {artwork.usageRights && artwork.usageRights.length > 0 && (
                    <div>
                      <div className="text-gray-400 text-sm mb-2">Usage Rights Included</div>
                      <div className="flex flex-wrap gap-2">
                        {artwork.usageRights.map((right, index) => (
                          <span key={index} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                            {right}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Restrictions */}
                  {artwork.restrictions && artwork.restrictions.length > 0 && (
                    <div>
                      <div className="text-gray-400 text-sm mb-2">Usage Restrictions</div>
                      <div className="flex flex-wrap gap-2">
                        {artwork.restrictions.map((restriction, index) => (
                          <span key={index} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">
                            {restriction}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* License Summary */}
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-gray-300 text-sm">
                      <strong className="text-white">License Summary:</strong> This artwork is licensed under a {artwork.licenseType} license. 
                      {artwork.licenseType === 'commercial' && ' You may use this work for commercial purposes with proper attribution.'}
                      {artwork.licenseType === 'non-commercial' && ' This work is for non-commercial use only.'}
                      {artwork.licenseType === 'limited' && ' This license has time and usage restrictions.'}
                      {artwork.licenseType === 'exclusive' && ' This is an exclusive license with specific terms.'}
                      {artwork.royalty && ` The creator receives ${artwork.royalty}% royalty on all secondary sales.`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {artwork.tags.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {artwork.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price and Purchase */}
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-gray-400 text-sm">Price</div>
                    <div className="text-3xl font-bold text-white">
                      {artwork.price === '0' ? 'Free' : `${artwork.price} USDT`}
                    </div>
                    {artwork.price !== '0' && (
                      <div className="text-gray-400 text-sm">
                        ≈ ${parseFloat(artwork.price).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                
                {onPurchase && (
                  <button
                    onClick={onPurchase}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    {account ? 'Purchase Now' : 'Connect Wallet to Purchase'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
