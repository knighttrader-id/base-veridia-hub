// Token configuration for multi-token payment system
export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  icon: string;
  name: string;
  isActive: boolean;
}

// Base Network Token Addresses (Production)
export const SUPPORTED_TOKENS: Record<string, TokenInfo> = {
  ETH: {
    address: '0x0000000000000000000000000000000000000000', // Native ETH
    symbol: 'ETH',
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    name: 'Ethereum',
    isActive: true
  },
  USDC: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
    symbol: 'USDC',
    decimals: 6,
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    name: 'USD Coin',
    isActive: true
  },
  USDT: {
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // Base USDT (verify address)
    symbol: 'USDT',
    decimals: 6,
    icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    name: 'Tether USD',
    isActive: true
  },
  DAI: {
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // Base DAI (verify address)
    symbol: 'DAI',
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    name: 'Dai Stablecoin',
    isActive: true
  },
  IDRX: {
    address: '0x0000000000000000000000000000000000000000', // To be deployed
    symbol: 'IDRX',
    decimals: 6,
    icon: 'https://cryptologos.cc/logos/indonesian-rupiah-idr-logo.png',
    name: 'Indonesian Rupiah',
    isActive: false // Not deployed yet
  }
};

// Testnet/Development Token Addresses
export const TESTNET_TOKENS: Record<string, TokenInfo> = {
  ETH: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    name: 'Ethereum',
    isActive: true
  },
  USDC: {
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Mock USDC
    symbol: 'USDC',
    decimals: 6,
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    name: 'USD Coin',
    isActive: true
  },
  USDT: {
    address: '0x4200000000000000000000000000000000000006', // Mock USDT
    symbol: 'USDT',
    decimals: 6,
    icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    name: 'Tether USD',
    isActive: true
  },
  DAI: {
    address: '0x4200000000000000000000000000000000000007', // Mock DAI
    symbol: 'DAI',
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    name: 'Dai Stablecoin',
    isActive: true
  },
  IDRX: {
    address: '0x4200000000000000000000000000000000000008', // Mock IDRX
    symbol: 'IDRX',
    decimals: 6,
    icon: 'https://cryptologos.cc/logos/indonesian-rupiah-idr-logo.png',
    name: 'Indonesian Rupiah',
    isActive: true
  }
};

// Get active tokens based on environment
export function getActiveTokens(): Record<string, TokenInfo> {
  const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_NETWORK === 'testnet';
  const tokens = isDevelopment ? TESTNET_TOKENS : SUPPORTED_TOKENS;
  
  return Object.fromEntries(
    Object.entries(tokens).filter(([_, token]) => token.isActive)
  );
}

// Get token by address
export function getTokenByAddress(address: string): TokenInfo | null {
  const tokens = getActiveTokens();
  return Object.values(tokens).find(token => 
    token.address.toLowerCase() === address.toLowerCase()
  ) || null;
}

// Get token by symbol
export function getTokenBySymbol(symbol: string): TokenInfo | null {
  const tokens = getActiveTokens();
  return tokens[symbol.toUpperCase()] || null;
}

// Format token amount for display
export function formatTokenAmount(amount: string | number, decimals: number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const divisor = Math.pow(10, decimals);
  const formatted = (num / divisor).toFixed(decimals > 6 ? 6 : decimals);
  return parseFloat(formatted).toString();
}

// Convert price between tokens (simplified - in production use price oracle)
export function convertPrice(price: string, fromDecimals: number, toDecimals: number): string {
  const num = parseFloat(price);
  const divisor = Math.pow(10, fromDecimals - toDecimals);
  return (num / divisor).toString();
}

// Get token icon URL
export function getTokenIcon(symbol: string): string {
  const token = getTokenBySymbol(symbol);
  return token?.icon || 'https://cryptologos.cc/logos/ethereum-eth-logo.png';
}

// Check if token is ETH
export function isETH(tokenAddress: string): boolean {
  return tokenAddress === '0x0000000000000000000000000000000000000000';
}

// Get default payment token
export function getDefaultPaymentToken(): TokenInfo {
  return getTokenBySymbol('ETH') || Object.values(getActiveTokens())[0];
}
