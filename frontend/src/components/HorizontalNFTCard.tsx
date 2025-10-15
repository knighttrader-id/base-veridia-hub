import { useState } from 'react';
import { ExternalLink, Copy, CheckCircle, Star, TrendingUp, Zap, Heart } from 'lucide-react';
import { ArtworkImage } from './ImageWithFallback';

interface HorizontalNFTCardProps {
  title: string;
  description: string;
  price?: string;
  image?: string;
  creator?: string;
  stats?: {
    views?: number;
    likes?: number;
    sales?: number;
  };
  tags?: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  onClick?: () => void;
  className?: string;
}

export function HorizontalNFTCard({
  title,
  description,
  price,
  image,
  creator,
  stats,
  tags = [],
  isFeatured = false,
  isNew = false,
  onClick,
  className = ''
}: HorizontalNFTCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (creator) {
      await navigator.clipboard.writeText(creator);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`
        group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-visible
        hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all duration-300
        ${isFeatured ? 'ring-1 ring-blue-500/50' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Badge container - positioned outside content area */}
      <div className="absolute -top-1 -right-1 z-20 flex flex-col gap-1">
        {/* Featured badge - top */}
        {isFeatured && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-1.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
            <Star className="w-2.5 h-2.5" />
            Featured
          </div>
        )}
        
        {/* New badge - bottom */}
        {isNew && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-1.5 py-0.5 rounded-full text-xs font-semibold shadow-lg">
            New
          </div>
        )}
      </div>

      {/* Horizontal Layout */}
      <div className="flex">
        {/* Image container - enlarged for better display */}
        <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden">
          <ArtworkImage
            src={image || ''}
            alt={title}
            className="w-full h-full group-hover:scale-110 transition-transform duration-500"
            fallbackText={title}
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex gap-1">
              <button className="p-1 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                <ExternalLink className="w-3 h-3 text-white" />
              </button>
              <button 
                className="p-1 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
              >
                <Heart className={`w-3 h-3 ${isLiked ? 'text-red-400 fill-red-400' : 'text-white'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content - compact horizontal layout optimized for 3 columns */}
        <div className="flex-1 p-3 flex flex-col justify-between min-h-0">
          {/* Top section - title and price */}
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-2 flex-1 mr-2 min-h-0">
              {title}
            </h3>
                {price && (
                  <div className="text-right flex-shrink-0 ml-1">
                    <div className="text-sm font-bold text-white">
                      {price === '0' ? 'Free' : `${price} USDT`}
                    </div>
                  </div>
                )}
          </div>

          {/* Description */}
          <p className="text-gray-300 text-xs mb-2 line-clamp-1 flex-shrink-0">
            {description}
          </p>

          {/* Middle section - creator and stats */}
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            {/* Creator info */}
            {creator && (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {creator.slice(0, 1).toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-300 truncate">
                  {creator.slice(0, 4)}...{creator.slice(-3)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  className="p-0.5 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-400" />
                  )}
                </button>
              </div>
            )}

            {/* Stats */}
            {stats && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
                {stats.views && (
                  <div className="flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    {stats.views > 1000 ? `${(stats.views / 1000).toFixed(1)}k` : stats.views}
                  </div>
                )}
                {stats.likes && (
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {stats.likes > 1000 ? `${(stats.likes / 1000).toFixed(1)}k` : stats.likes}
                  </div>
                )}
                {stats.sales && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stats.sales}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom section - tags and action */}
          <div className="flex items-center justify-between flex-shrink-0">
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex gap-1 flex-1 min-w-0">
                {tags.slice(0, 1).map((tag, index) => (
                  <span
                    key={index}
                    className="px-1.5 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-gray-300 whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 1 && (
                  <span className="px-1.5 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-gray-300">
                    +{tags.length - 1}
                  </span>
                )}
              </div>
            )}

            {/* Action button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                console.log('HorizontalNFTCard View button clicked for:', title);
                onClick?.();
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-1.5 px-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-1 text-xs flex-shrink-0"
            >
              <Zap className="w-3 h-3" />
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact horizontal grid layout - 2 columns maximum with larger images
export function HorizontalNFTGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {children}
    </div>
  );
}

// Ultra compact horizontal grid - 2 columns maximum with larger images
export function UltraHorizontalNFTGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      {children}
    </div>
  );
}
