// Contract addresses configuration
export const CONTRACTS = {
  Artwork: import.meta.env.VITE_ARTWORK_CONTRACT || '0x0000000000000000000000000000000000000000',
  License: import.meta.env.VITE_LICENSE_CONTRACT || '0x0000000000000000000000000000000000000000',
  Marketplace: import.meta.env.VITE_MARKETPLACE_CONTRACT || '0x0000000000000000000000000000000000000000',
  MultiSigWallet: import.meta.env.VITE_MULTISIG_CONTRACT || '0x0000000000000000000000000000000000000000',
  TimelockController: import.meta.env.VITE_TIMELOCK_CONTRACT || '0x0000000000000000000000000000000000000000',
  UpgradeProxy: import.meta.env.VITE_UPGRADE_PROXY_CONTRACT || '0x0000000000000000000000000000000000000000',
};

// Contract validation
export function validateContracts() {
  const contractAddresses = Object.values(CONTRACTS);
  const invalidAddresses = contractAddresses.filter(addr => 
    addr === '0x0000000000000000000000000000000000000000' || !addr
  );
  
  if (invalidAddresses.length > 0) {
    console.warn('Some contract addresses are not set. Please deploy contracts and update environment variables.');
    return false;
  }
  
  return true;
}
