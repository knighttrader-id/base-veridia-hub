import { useState, useEffect } from 'react';
import { Menu, X, Zap, Wallet, User, Settings, Bell, Search } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface Web3NavbarProps {
  onMenuClick?: () => void;
  className?: string;
}

export function Web3Navbar({ onMenuClick, className = '' }: Web3NavbarProps) {
  const { account, isConnected, connectWallet, disconnectWallet, balance } = useWallet();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${isScrolled 
        ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' 
        : 'bg-transparent'
      }
      ${className}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu className="h-6 w-6 text-white" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  VeridiaHub
                </h1>
                <p className="text-xs text-gray-400 -mt-1">Web3 Platform</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="/" className="text-white hover:text-blue-400 transition-colors font-medium">
              Home
            </a>
            <a href="/marketplace" className="text-gray-300 hover:text-blue-400 transition-colors">
              Marketplace
            </a>
            <a href="/upload" className="text-gray-300 hover:text-blue-400 transition-colors">
              Upload
            </a>
            <a href="/ip-registry" className="text-gray-300 hover:text-blue-400 transition-colors">
              Registry
            </a>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search artworks..."
                className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent w-64"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
              >
                <Bell className="h-5 w-5 text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl">
                  <div className="text-white font-semibold mb-3">Notifications</div>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-300">
                      New artwork uploaded by 0x1234...5678
                    </div>
                    <div className="text-sm text-gray-300">
                      License purchased for "Digital Sunset"
                    </div>
                    <div className="text-sm text-gray-300">
                      Your artwork "Abstract Waves" got 5 new views
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wallet Connection */}
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium text-sm">
                    {formatAddress(account!)}
                  </span>
                  {balance && (
                    <span className="text-gray-400 text-sm">
                      {parseFloat(balance).toFixed(3)} ETH
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <User className="h-5 w-5 text-white" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <Settings className="h-5 w-5 text-white" />
                  </button>
                  <button
                    onClick={disconnectWallet}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <X className="h-5 w-5 text-red-400" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div className="lg:hidden">
        {/* Mobile menu content would go here */}
      </div>
    </nav>
  );
}

// Floating action button
export function FloatingActionButton({ onClick, icon, label }: { 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
}) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-110 group"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="hidden group-hover:block text-sm font-medium">
          {label}
        </span>
      </div>
    </button>
  );
}

// Status indicator
export function StatusIndicator({ status, label }: { status: 'online' | 'offline' | 'connecting'; label: string }) {
  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'offline': return 'bg-red-400';
      case 'connecting': return 'bg-yellow-400 animate-pulse';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      <span className="text-sm text-gray-300">{label}</span>
    </div>
  );
}
