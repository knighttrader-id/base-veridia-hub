// VeridiaHub Frontend Environment Configuration
// This file contains the default configuration for the frontend

export const ENV_CONFIG = {
  // Base Network Configuration
  RPC_URL: import.meta.env.VITE_RPC_URL || 'https://mainnet.base.org',
  CHAIN_ID: import.meta.env.VITE_CHAIN_ID || '8453',
  
  // Smart Contract Addresses (Update these after deployment to Base mainnet)
  CONTRACTS: {
    Artwork: import.meta.env.VITE_CONTRACT_ARTWORK || '0x0000000000000000000000000000000000000000',
    License: import.meta.env.VITE_CONTRACT_LICENSE || '0x0000000000000000000000000000000000000000',
    Marketplace: import.meta.env.VITE_CONTRACT_MARKETPLACE || '0x0000000000000000000000000000000000000000',
    MultiSigWallet: import.meta.env.VITE_CONTRACT_MULTISIG || '0x0000000000000000000000000000000000000000',
    TimelockController: import.meta.env.VITE_CONTRACT_TIMELOCK || '0x0000000000000000000000000000000000000000',
    UpgradeProxy: import.meta.env.VITE_CONTRACT_UPGRADE_PROXY || '0x0000000000000000000000000000000000000000',
  },
  
  // IPFS Configuration
  IPFS_GATEWAY: import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
  
  // Application Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'VeridiaHub',
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Enterprise-Ready Copyright Platform for Indonesian Creators',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  UPLOAD_ENDPOINT: import.meta.env.VITE_UPLOAD_ENDPOINT || '/api/upload',
  HASH_ENDPOINT: import.meta.env.VITE_HASH_ENDPOINT || '/api/hash',
};

// Base Network Configuration
export const BASE_NETWORK = {
  chainId: '0x2105', // 8453 in hex
  chainName: 'Base',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org'],
};

// Base Testnet Configuration (for development)
export const BASE_TESTNET = {
  chainId: '0x14A34', // 84532 in hex
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
};

// Network validation
export function validateNetworkConfig() {
  const requiredEnvVars = [
    'VITE_RPC_URL',
    'VITE_CHAIN_ID',
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars);
    console.warn('Using default configuration. Please set up .env.local file.');
    console.warn('For development, you can create a .env.local file with:');
    console.warn('VITE_RPC_URL=https://mainnet.base.org');
    console.warn('VITE_CHAIN_ID=8453');
  }
  
  return missingVars.length === 0;
}

// Initialize configuration
validateNetworkConfig();
