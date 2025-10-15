import { useState } from 'react';
import { ExternalLink, Copy, CheckCircle, Star, TrendingUp, Zap } from 'lucide-react';
import { ArtworkImage } from './ImageWithFallback';

interface Web3CardProps {
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

export function Web3Card({
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
}: Web3CardProps) {
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
        group relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-visible
        hover:bg-white/20 hover:border-white/30 hover:scale-105 transition-all duration-300
        ${isFeatured ? 'ring-2 ring-blue-500/50' : ''}
        ${className}
      `}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
      onClick={onClick}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Badge container - positioned outside content area */}
      <div className="absolute -top-2 -right-2 z-20 flex flex-col gap-1">
        {/* Featured badge - top */}
        {isFeatured && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
            <Star className="w-3 h-3" />
            Featured
          </div>
        )}
        
        {/* New badge - bottom */}
        {isNew && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
            New
          </div>
        )}
      </div>

      {/* Horizontal Layout */}
      <div className="flex">
        {/* Image container - enlarged for better display */}
        <div className="relative w-48 h-48 flex-shrink-0 overflow-hidden">
          <ArtworkImage
            src={image || ''}
            alt={title}
            className="w-full h-full group-hover:scale-110 transition-transform duration-500"
            fallbackText={title}
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex gap-1">
              <button className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                <ExternalLink className="w-3 h-3 text-white" />
              </button>
              <button 
                className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
              >
                <Star className={`w-3 h-3 ${isLiked ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content - horizontal layout optimized for 3 columns */}
        <div className="flex-1 p-4 flex flex-col justify-between min-h-0">
          {/* Top section - title and price */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 flex-1 mr-3 min-h-0">
              {title}
            </h3>
                {price && (
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-lg font-bold text-white">
                      {price === '0' ? 'Free' : `${price} USDT`}
                    </div>
                    {price !== '0' && (
                      <div className="text-sm text-gray-400">
                        ≈ ${parseFloat(price).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm mb-4 line-clamp-3 flex-shrink-0">
            {description}
          </p>

          {/* Middle section - creator and stats */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            {/* Creator info */}
            {creator && (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">
                    {creator.slice(0, 1).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-gray-300 truncate">
                  {creator.slice(0, 8)}...{creator.slice(-4)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            )}

            {/* Stats */}
            {stats && (
              <div className="flex items-center gap-3 text-sm text-gray-400 flex-shrink-0">
                {stats.views && (
                  <div className="flex items-center gap-1">
                    <ExternalLink className="w-4 h-4" />
                    {stats.views > 1000 ? `${(stats.views / 1000).toFixed(1)}k` : stats.views}
                  </div>
                )}
                {stats.likes && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {stats.likes > 1000 ? `${(stats.likes / 1000).toFixed(1)}k` : stats.likes}
                  </div>
                )}
                {stats.sales && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
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
              <div className="flex gap-2 flex-1 min-w-0">
                {tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-gray-300 whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-gray-300">
                    +{tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Action button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                console.log('Web3Card View Details button clicked for:', title);
                onClick?.();
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-sm flex-shrink-0"
            >
              <Zap className="w-4 h-4" />
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
    </div>
  );
}

// Grid layout component - 2 columns maximum for better readability with larger images
export function Web3Grid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${className}`}>
      {children}
    </div>
  );
}

// Hero section component
export function Web3Hero({ 
  title, 
  subtitle, 
  description, 
  ctaText, 
  onCtaClick,
  stats 
}: {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  onCtaClick: () => void;
  stats?: Array<{ label: string; value: string; icon: React.ReactNode }>;
}) {
  return (
    <div className="relative text-center py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-pulse">
            {title}
          </h1>
          <h2 className="text-2xl md:text-3xl text-white/80 mb-6">
            {subtitle}
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <button
          onClick={onCtaClick}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center gap-3 mx-auto"
        >
          <Zap className="w-5 h-5" />
          {ctaText}
        </button>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2 whitespace-nowrap">
                  {stat.icon}
                  <span className="truncate">{stat.value}</span>
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
