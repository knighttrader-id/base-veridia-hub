import React from 'react';
import { Coins, Circle } from 'lucide-react';

interface TokenIconProps {
  token: string; // symbol or address
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TOKEN_ICONS: { [key: string]: string } = {
  'ETH': '/logos/eth.svg',
  'USDC': '/logos/usdc.svg',
  'USDT': '/logos/usdt.svg',
  'DAI': '/logos/dai.svg',
  'IDRX': '/logos/idrx.svg',
};

const SIZE_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export default function TokenIcon({ token, size = 'md', className = '' }: TokenIconProps) {
  const iconPath = TOKEN_ICONS[token.toUpperCase()];
  const sizeClass = SIZE_CLASSES[size];
  
  if (iconPath) {
    return (
      <img
        src={iconPath}
        alt={`${token} icon`}
        className={`${sizeClass} ${className}`}
        onError={(e) => {
          // Fallback to generic icon if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            const fallback = document.createElement('div');
            fallback.className = `${sizeClass} ${className} flex items-center justify-center bg-gray-600 rounded-full`;
            fallback.innerHTML = '<svg class="w-3/4 h-3/4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>';
            parent.appendChild(fallback);
          }
        }}
      />
    );
  }

  // Fallback to generic coin icon
  return (
    <div className={`${sizeClass} ${className} flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-full`}>
      <Coins className="w-3/4 h-3/4 text-white" />
    </div>
  );
}
