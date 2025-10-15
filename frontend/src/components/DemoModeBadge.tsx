import React, { useState } from 'react';
import { AlertTriangle, Database, Zap, X, Settings } from 'lucide-react';
import { env, shouldShowDemoBadge, getDataSource } from '../config/environment';

interface DemoModeBadgeProps {
  className?: string;
}

export default function DemoModeBadge({ className = '' }: DemoModeBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Don't show if not in demo mode or if dismissed
  if (!shouldShowDemoBadge() || isDismissed) {
    return null;
  }
  
  const dataSource = getDataSource();
  const isMockMode = dataSource === 'mock';
  const isHybridMode = dataSource === 'hybrid';
  
  const getBadgeColor = () => {
    if (isMockMode) return 'bg-yellow-500/90 text-black';
    if (isHybridMode) return 'bg-blue-500/90 text-white';
    return 'bg-green-500/90 text-white';
  };
  
  const getBadgeIcon = () => {
    if (isMockMode) return <Database className="h-4 w-4" />;
    if (isHybridMode) return <Zap className="h-4 w-4" />;
    return <Database className="h-4 w-4" />;
  };
  
  const getBadgeText = () => {
    if (isMockMode) return 'Demo Mode';
    if (isHybridMode) return 'Hybrid Mode';
    return 'Live Mode';
  };
  
  return (
    <div className={`fixed top-20 right-4 z-50 ${className}`}>
      {/* Main Badge */}
      <div 
        className={`
          ${getBadgeColor()} 
          px-3 py-2 rounded-lg shadow-lg cursor-pointer transition-all duration-300
          hover:scale-105 hover:shadow-xl
          ${isExpanded ? 'rounded-b-none' : ''}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {getBadgeIcon()}
          <span className="text-sm font-semibold">
            {getBadgeText()}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="ml-2 hover:bg-black/20 rounded p-1 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      {/* Expanded Info */}
      {isExpanded && (
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-b-lg shadow-xl p-4 min-w-80">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Data Source Info</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Current Mode */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isMockMode ? 'bg-yellow-500' : isHybridMode ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  Current Mode: {isMockMode ? 'Mock Data' : isHybridMode ? 'Hybrid (Blockchain + Mock)' : 'Blockchain'}
                </span>
              </div>
              
              <div className="text-xs text-gray-600">
                Network: {env.network}
              </div>
            </div>
            
            {/* Data Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-100 rounded p-2">
                <div className="font-medium text-gray-700">Artworks</div>
                <div className="text-gray-600">100 items</div>
              </div>
              <div className="bg-gray-100 rounded p-2">
                <div className="font-medium text-gray-700">Users</div>
                <div className="text-gray-600">30 profiles</div>
              </div>
              <div className="bg-gray-100 rounded p-2">
                <div className="font-medium text-gray-700">Transactions</div>
                <div className="text-gray-600">200 records</div>
              </div>
              <div className="bg-gray-100 rounded p-2">
                <div className="font-medium text-gray-700">Listings</div>
                <div className="text-gray-600">100 active</div>
              </div>
            </div>
            
            {/* Mode Description */}
            <div className="text-xs text-gray-600">
              {isMockMode && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Using mock data for demo purposes. No real blockchain transactions.
                  </span>
                </div>
              )}
              
              {isHybridMode && (
                <div className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Using blockchain data with mock fallback. Real transactions when possible.
                  </span>
                </div>
              )}
            </div>
            
            {/* Environment Info */}
            <div className="pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                <div>Environment: {import.meta.env.MODE}</div>
                <div>Mock Data: {env.useMockData ? 'Enabled' : 'Disabled'}</div>
                <div>Fallback: {env.mockFallback ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
            
            {/* Development Controls (only in development) */}
            {import.meta.env.DEV && (
              <div className="pt-2 border-t border-gray-200">
                <button className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 transition-colors">
                  <Settings className="h-3 w-3" />
                  <span>Switch Data Source</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Alternative compact version
export function CompactDemoBadge({ className = '' }: DemoModeBadgeProps) {
  if (!shouldShowDemoBadge()) return null;
  
  const dataSource = getDataSource();
  const isMockMode = dataSource === 'mock';
  
  return (
    <div className={`fixed top-20 right-4 z-50 ${className}`}>
      <div className={`
        ${isMockMode ? 'bg-yellow-500/90 text-black' : 'bg-blue-500/90 text-white'}
        px-2 py-1 rounded text-xs font-medium shadow-lg
      `}>
        {isMockMode ? '🧪 Demo' : '🔄 Hybrid'}
      </div>
    </div>
  );
}
