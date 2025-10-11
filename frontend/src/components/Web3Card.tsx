import { useState } from 'react';
import { ExternalLink, Copy, CheckCircle, Star, TrendingUp, Zap } from 'lucide-react';

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
        group relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden
        hover:bg-white/20 hover:border-white/30 hover:scale-105 transition-all duration-300
        ${isFeatured ? 'ring-2 ring-blue-500/50' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Featured badge */}
      {isFeatured && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Star className="w-3 h-3" />
            Featured
          </div>
        </div>
      )}

      {/* New badge */}
      {isNew && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            New
          </div>
        </div>
      )}

      {/* Image container */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image || 'https://images.pexels.com/photos/1742370/pexels-photo-1742370.jpeg?w=400&h=400&fit=crop'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex gap-2">
            <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
              <ExternalLink className="w-4 h-4 text-white" />
            </button>
            <button 
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
            >
              <Star className={`w-4 h-4 ${isLiked ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
            {title}
          </h3>
          {price && (
            <div className="text-right">
              <div className="text-xl font-bold text-white">
                {price === '0' ? 'Free' : `${price} ETH`}
              </div>
              {price !== '0' && (
                <div className="text-sm text-gray-400">
                  ≈ ${(parseFloat(price) * 2500).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {description}
        </p>

        {/* Creator info */}
        {creator && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {creator.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-300 truncate">
                {creator.slice(0, 6)}...{creator.slice(-4)}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="p-1 hover:bg-white/20 rounded transition-colors"
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
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
            {stats.views && (
              <div className="flex items-center gap-1">
                <ExternalLink className="w-4 h-4" />
                {stats.views.toLocaleString()}
              </div>
            )}
            {stats.likes && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                {stats.likes.toLocaleString()}
              </div>
            )}
            {stats.sales && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {stats.sales.toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-gray-300 hover:bg-white/20 transition-colors"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-gray-300">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action button */}
        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" />
          View Details
        </button>
      </div>

      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
    </div>
  );
}

// Grid layout component
export function Web3Grid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  {stat.icon}
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
