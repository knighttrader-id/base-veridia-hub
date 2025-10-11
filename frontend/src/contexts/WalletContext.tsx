import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  account: string | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: string) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | null>(null);

// Supported networks
const NETWORKS = {
  base: {
    chainId: '0x2105', // 8453 in hex
    chainName: 'Base',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org']
  },
  baseTestnet: {
    chainId: '0x14A34', // 84532 in hex
    chainName: 'Base Sepolia',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org']
  },
  ethereum: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io/']
  }
};

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          await getBalance(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsConnected(true);
      getBalance(accounts[0]);
    } else {
      disconnectWallet();
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask tidak terdeteksi! Silakan install MetaMask terlebih dahulu.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        await getBalance(accounts[0]);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        alert('Koneksi wallet dibatalkan oleh pengguna');
      } else {
        alert('Gagal menghubungkan wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setIsConnected(false);
  };

  const getBalance = async (address: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  const switchNetwork = async (chainId: string) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error: any) {
      // Network not added to MetaMask
      if (error.code === 4902) {
        const network = Object.values(NETWORKS).find(n => n.chainId === chainId);
        if (network) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [network],
            });
          } catch (addError) {
            console.error('Error adding network:', addError);
          }
        }
      }
    }
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!window.ethereum || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return await signer.signMessage(message);
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider value={{
      account,
      balance,
      isConnected,
      isConnecting,
      connectWallet,
      disconnectWallet,
      switchNetwork,
      signMessage
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}