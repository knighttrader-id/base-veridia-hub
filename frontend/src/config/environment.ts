// Environment configuration for VeridiaHub
export interface EnvironmentConfig {
  useMockData: boolean;
  mockFallback: boolean;
  showDemoBadge: boolean;
  network: 'testnet' | 'mainnet';
  baseUrl: string;
}

// Get environment variables with defaults
export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
    mockFallback: import.meta.env.VITE_MOCK_FALLBACK === 'true',
    showDemoBadge: import.meta.env.VITE_SHOW_DEMO_BADGE === 'true',
    network: (import.meta.env.VITE_NETWORK as 'testnet' | 'mainnet') || 'testnet',
    baseUrl: import.meta.env.VITE_BASE_URL || 'http://localhost:5173'
  };
};

// Get current environment config
export const env = getEnvironmentConfig();

// Helper functions
export const isDevelopment = () => env.network === 'testnet' && env.useMockData;
export const isDemo = () => env.showDemoBadge && env.useMockData;
export const isProduction = () => env.network === 'mainnet' && !env.useMockData;
export const shouldUseMockData = () => env.useMockData;
export const shouldShowDemoBadge = () => env.showDemoBadge;
export const shouldFallbackToMock = () => env.mockFallback;

// Data source detection
export const getDataSource = (): 'mock' | 'blockchain' | 'hybrid' => {
  if (env.useMockData && !env.mockFallback) return 'mock';
  if (!env.useMockData && !env.mockFallback) return 'blockchain';
  return 'hybrid';
};

// Log current configuration (development only)
if (import.meta.env.DEV) {
  console.log('🔧 VeridiaHub Environment Config:', {
    mode: getDataSource(),
    useMockData: env.useMockData,
    mockFallback: env.mockFallback,
    showDemoBadge: env.showDemoBadge,
    network: env.network
  });
}