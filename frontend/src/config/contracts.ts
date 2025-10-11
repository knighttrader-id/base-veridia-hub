import { ENV_CONFIG } from './environment';

export const CONTRACTS = {
  Artwork: ENV_CONFIG.CONTRACTS.Artwork,
  License: ENV_CONFIG.CONTRACTS.License,
  Marketplace: ENV_CONFIG.CONTRACTS.Marketplace,
  MultiSigWallet: ENV_CONFIG.CONTRACTS.MultiSigWallet,
  TimelockController: ENV_CONFIG.CONTRACTS.TimelockController,
  UpgradeProxy: ENV_CONFIG.CONTRACTS.UpgradeProxy,
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
