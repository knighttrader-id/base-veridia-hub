import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Loader,
  Settings
} from 'lucide-react';

interface WalletConnectProps {
  onConnect?: () => void;
  showBalance?: boolean;
  compact?: boolean;
}

export default function WalletConnect({ onConnect, showBalance = true, compact = false }: WalletConnectProps) {
  const { 
    account, 
    balance, 
    isConnected, 
    isConnecting, 
    connectWallet, 
    disconnectWallet,
    switchNetwork 
  } = useWallet();
  
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  const handleConnect = async () => {
    await connectWallet();
    if (onConnect) onConnect();
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      alert('Alamat wallet disalin ke clipboard!');
    }
  };

  const openEtherscan = () => {
    if (account) {
      window.open(`https://etherscan.io/address/${account}`, '_blank');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const networks = [
    { id: '0x1', name: 'Ethereum', icon: '🔷', color: 'blue' },
    { id: '0x89', name: 'Polygon', icon: '🟣', color: 'purple' },
    { id: '0x38', name: 'BSC', icon: '🟡', color: 'yellow' }
  ];

  if (compact && isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <Wallet className="h-4 w-4 text-white" />
        </div>
        <div className="text-sm">
          <div className="font-medium text-gray-900">{formatAddress(account!)}</div>
          {showBalance && balance && (
            <div className="text-gray-500">{parseFloat(balance).toFixed(4)} ETH</div>
          )}
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Hubungkan Wallet
          </h3>
          <p className="text-gray-600 mb-6">
            Hubungkan MetaMask untuk mengakses fitur blockchain dan NFT
          </p>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isConnecting ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Menghubungkan...
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5 mr-2" />
                Hubungkan MetaMask
              </>
            )}
          </button>
          
          {!window.ethereum && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center text-yellow-800">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  MetaMask tidak terdeteksi. 
                  <a 
                    href="https://metamask.io/download/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline ml-1"
                  >
                    Install MetaMask
                  </a>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Wallet Terhubung</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-600 font-medium">Connected</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Account Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Alamat Wallet</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={copyAddress}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={openEtherscan}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="font-mono text-sm text-gray-900">{formatAddress(account!)}</div>
        </div>

        {/* Balance */}
        {showBalance && balance && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-1">Saldo</div>
            <div className="text-2xl font-bold text-gray-900">
              {parseFloat(balance).toFixed(4)} ETH
            </div>
            <div className="text-sm text-gray-500">
              ≈ ${(parseFloat(balance) * 2500).toLocaleString()} USD
            </div>
          </div>
        )}

        {/* Network Selection */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Network</span>
          <button
            onClick={() => setShowNetworkModal(true)}
            className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
          >
            <span>🔷</span>
            <span>Ethereum</span>
            <Settings className="h-3 w-3" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowNetworkModal(true)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Ganti Network
          </button>
          <button
            onClick={disconnectWallet}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Network Selection Modal */}
      {showNetworkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pilih Network</h3>
              <button 
                onClick={() => setShowNetworkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {networks.map((network) => (
                <button
                  key={network.id}
                  onClick={() => {
                    switchNetwork(network.id);
                    setShowNetworkModal(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">{network.icon}</span>
                  <span className="font-medium text-gray-900">{network.name}</span>
                  {network.id === '0x1' && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}