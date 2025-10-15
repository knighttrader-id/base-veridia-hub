// Mock transactions data with 200 realistic items
export interface MockTransaction {
  id: string;
  hash: string;
  type: 'purchase' | 'license' | 'transfer' | 'mint' | 'sale' | 'bid' | 'offer';
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  from: string;
  to: string;
  tokenId: string;
  tokenSymbol: 'ETH' | 'USDC' | 'USDT' | 'DAI' | 'IDRX';
  amount: string;
  amountUSD: string;
  gasUsed: string;
  gasPrice: string;
  gasFee: string;
  gasFeeUSD: string;
  blockNumber: string;
  timestamp: string;
  createdAt: string;
  description: string;
  artworkTitle: string;
  artworkImage: string;
  isSuccessful: boolean;
  network: 'base' | 'ethereum' | 'polygon';
  explorerUrl: string;
}

// Transaction types with realistic distribution
const transactionTypes = [
  'purchase', 'purchase', 'purchase', 'purchase', // 40% purchases
  'license', 'license', 'license', // 30% licenses
  'transfer', 'transfer', // 20% transfers
  'mint', 'sale', 'bid', 'offer' // 10% others
];

// Token symbols with realistic distribution
const tokenSymbols = [
  'ETH', 'ETH', 'ETH', // 30% ETH
  'USDC', 'USDC', 'USDC', 'USDC', // 40% USDC
  'USDT', 'USDT', // 20% USDT
  'DAI', 'IDRX' // 10% others
];

// Realistic transaction descriptions
const descriptions = [
  'Purchased digital artwork from marketplace',
  'Licensed artwork for commercial use',
  'Transferred artwork to another wallet',
  'Minted new digital artwork to blockchain',
  'Sold artwork to another collector',
  'Placed bid on auction item',
  'Made offer for artwork purchase',
  'Completed artwork transaction',
  'Acquired digital art license',
  'Transferred NFT ownership',
  'Created new digital asset',
  'Exchanged artwork for payment',
  'Secured artwork license rights',
  'Moved artwork between wallets',
  'Finalized art purchase transaction'
];

// Generate realistic transaction hash
const generateTxHash = (): string => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

// Generate realistic amounts based on token
const generateAmount = (tokenSymbol: string): string => {
  const ranges = {
    'ETH': [0.01, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0],
    'USDC': [10, 25, 50, 100, 250, 500, 1000, 2500],
    'USDT': [10, 25, 50, 100, 250, 500, 1000, 2500],
    'DAI': [10, 25, 50, 100, 250, 500, 1000, 2500],
    'IDRX': [150000, 375000, 750000, 1500000, 3750000, 7500000, 15000000, 37500000]
  };
  
  const amounts = ranges[tokenSymbol];
  return amounts[Math.floor(Math.random() * amounts.length)].toString();
};

// Generate USD equivalent
const generateUSDAmount = (tokenSymbol: string, amount: string): string => {
  const ethPrice = 3000; // Assume 1 ETH = $3000
  const amountNum = parseFloat(amount);
  
  switch (tokenSymbol) {
    case 'ETH':
      return (amountNum * ethPrice).toFixed(2);
    case 'USDC':
    case 'USDT':
    case 'DAI':
      return amountNum.toFixed(2);
    case 'IDRX':
      return (amountNum / 15000).toFixed(2); // Assume 1 USD = 15000 IDRX
    default:
      return amountNum.toFixed(2);
  }
};

// Generate realistic gas data
const generateGasData = () => {
  const gasUsed = Math.floor(Math.random() * 200000) + 50000; // 50k - 250k gas
  const gasPrice = Math.random() * 20 + 1; // 1-21 gwei
  const gasFee = (gasUsed * gasPrice) / 1e9; // Convert to ETH
  const gasFeeUSD = gasFee * 3000; // Assume 1 ETH = $3000
  
  return {
    gasUsed: gasUsed.toString(),
    gasPrice: gasPrice.toFixed(2),
    gasFee: gasFee.toFixed(6),
    gasFeeUSD: gasFeeUSD.toFixed(2)
  };
};

// Generate block number (realistic for Base)
const generateBlockNumber = (): string => {
  const baseStartBlock = 10000000; // Approximate Base start
  const currentBlock = baseStartBlock + Math.floor(Math.random() * 1000000);
  return currentBlock.toString();
};

// Generate timestamps (last 3 months)
const generateTimestamp = (): string => {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - (3 * 30 * 24 * 60 * 60 * 1000));
  const randomTime = threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime());
  return new Date(randomTime).toISOString();
};

// Generate wallet addresses
const generateWalletAddress = (): string => {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

// Generate mock transactions
export const MOCK_TRANSACTIONS: MockTransaction[] = [];

for (let i = 1; i <= 200; i++) {
  const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
  const tokenSymbol = tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)];
  const amount = generateAmount(tokenSymbol);
  const amountUSD = generateUSDAmount(tokenSymbol, amount);
  const gasData = generateGasData();
  const timestamp = generateTimestamp();
  const hash = generateTxHash();
  const blockNumber = generateBlockNumber();
  
  const transaction: MockTransaction = {
    id: i.toString(),
    hash,
    type,
    status: Math.random() > 0.1 ? 'confirmed' : 'pending', // 90% confirmed
    from: generateWalletAddress(),
    to: generateWalletAddress(),
    tokenId: Math.floor(Math.random() * 100) + 1, // Link to mock artworks
    tokenSymbol,
    amount,
    amountUSD,
    gasUsed: gasData.gasUsed,
    gasPrice: gasData.gasPrice,
    gasFee: gasData.gasFee,
    gasFeeUSD: gasData.gasFeeUSD,
    blockNumber,
    timestamp,
    createdAt: timestamp,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    artworkTitle: `Artwork #${Math.floor(Math.random() * 100) + 1}`,
    artworkImage: `https://dummyimage.com/400x400/10b981/ffffff&text=Artwork+${Math.floor(Math.random() * 100) + 1}`,
    isSuccessful: Math.random() > 0.05, // 95% successful
    network: 'base',
    explorerUrl: `https://basescan.org/tx/${hash}`
  };
  
  MOCK_TRANSACTIONS.push(transaction);
}

// Helper functions
export const getTransactionsByType = (type: string) => 
  MOCK_TRANSACTIONS.filter(tx => tx.type === type);

export const getTransactionsByToken = (tokenSymbol: string) => 
  MOCK_TRANSACTIONS.filter(tx => tx.tokenSymbol === tokenSymbol);

export const getTransactionsByStatus = (status: string) => 
  MOCK_TRANSACTIONS.filter(tx => tx.status === status);

export const getSuccessfulTransactions = () => 
  MOCK_TRANSACTIONS.filter(tx => tx.isSuccessful);

export const getFailedTransactions = () => 
  MOCK_TRANSACTIONS.filter(tx => !tx.isSuccessful);

export const getTransactionsByUser = (userAddress: string) => 
  MOCK_TRANSACTIONS.filter(tx => 
    tx.from.toLowerCase() === userAddress.toLowerCase() || 
    tx.to.toLowerCase() === userAddress.toLowerCase()
  );

export const getRecentTransactions = (limit: number = 20) => 
  MOCK_TRANSACTIONS
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

export const getTransactionsByDateRange = (startDate: string, endDate: string) => 
  MOCK_TRANSACTIONS.filter(tx => {
    const txDate = new Date(tx.timestamp);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return txDate >= start && txDate <= end;
  });

export const getTotalVolume = (tokenSymbol?: string) => {
  const transactions = tokenSymbol 
    ? getTransactionsByToken(tokenSymbol)
    : MOCK_TRANSACTIONS;
    
  return transactions
    .filter(tx => tx.isSuccessful)
    .reduce((total, tx) => total + parseFloat(tx.amount), 0);
};

export const getTotalVolumeUSD = () => {
  return MOCK_TRANSACTIONS
    .filter(tx => tx.isSuccessful)
    .reduce((total, tx) => total + parseFloat(tx.amountUSD), 0);
};

export const getAverageGasFee = () => {
  const successfulTxs = getSuccessfulTransactions();
  const totalGasFee = successfulTxs.reduce((total, tx) => total + parseFloat(tx.gasFee), 0);
  return (totalGasFee / successfulTxs.length).toFixed(6);
};

export const getTransactionStats = () => {
  const total = MOCK_TRANSACTIONS.length;
  const successful = getSuccessfulTransactions().length;
  const failed = getFailedTransactions().length;
  const pending = getTransactionsByStatus('pending').length;
  
  return {
    total,
    successful,
    failed,
    pending,
    successRate: ((successful / total) * 100).toFixed(1),
    totalVolumeUSD: getTotalVolumeUSD().toFixed(2),
    averageGasFee: getAverageGasFee()
  };
};
