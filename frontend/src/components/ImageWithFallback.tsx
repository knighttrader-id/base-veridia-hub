import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  fallbackColor?: string;
  textColor?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackText = 'Artwork',
  fallbackColor = '6366f1',
  textColor = 'ffffff'
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const fallbackSrc = `https://dummyimage.com/400x400/${fallbackColor}/${textColor}&text=${encodeURIComponent(fallbackText)}`;

  return (
    <div className={`relative ${className}`}>
      {imageLoading && !imageError && (
        <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {imageError ? (
        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center p-1">
          <div className="text-center text-gray-400 w-full h-full flex flex-col items-center justify-center">
            <ImageIcon className="w-4 h-4 mb-1 flex-shrink-0" />
            <p className="text-strict">
              {fallbackText?.length > 12 ? fallbackText.substring(0, 12) + '...' : fallbackText || 'Image not available'}
            </p>
          </div>
        </div>
      ) : (
        <img
          src={src || fallbackSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      )}
    </div>
  );
}

// Preset configurations for different use cases
export const ArtworkImage = (props: Omit<ImageWithFallbackProps, 'fallbackText' | 'fallbackColor' | 'textColor'>) => (
  <ImageWithFallback
    {...props}
    fallbackText={props.fallbackText || "Artwork"}
    fallbackColor="6366f1"
    textColor="ffffff"
  />
);

export const UserAvatar = (props: Omit<ImageWithFallbackProps, 'fallbackText' | 'fallbackColor' | 'textColor'>) => (
  <ImageWithFallback
    {...props}
    fallbackText="User"
    fallbackColor="8b5cf6"
    textColor="ffffff"
  />
);

export const TransactionImage = (props: Omit<ImageWithFallbackProps, 'fallbackText' | 'fallbackColor' | 'textColor'>) => (
  <ImageWithFallback
    {...props}
    fallbackText="Transaction"
    fallbackColor="10b981"
    textColor="ffffff"
  />
);
