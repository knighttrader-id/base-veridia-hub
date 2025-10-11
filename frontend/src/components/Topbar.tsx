import { Menu, User, LogOut } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import WalletConnect from './WalletConnect';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { account, isConnected, disconnectWallet } = useWallet();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <div className="ml-4 lg:ml-0">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
              VeridiaHub
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Wallet Status */}
          <div className="hidden md:block">
            <WalletConnect compact={true} showBalance={false} />
          </div>
          
          {isConnected && (
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span className="font-mono text-xs">
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connected'}
              </span>
            </div>
          )}
          {isConnected && (
            <button
              onClick={disconnectWallet}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Disconnect</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}