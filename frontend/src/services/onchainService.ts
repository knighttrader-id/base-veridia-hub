import { ethers } from 'ethers';
import { getContract, getSigner, getProvider } from '../lib/web3';
import { CONTRACTS } from '../config/contracts';
import Artwork from '../abi/Artwork.json';
import License from '../abi/License.json';
import Marketplace from '../abi/Marketplace.json';

// Type definitions for contract ABIs
type ContractABI = readonly (string | ethers.Fragment | ethers.JsonFragment)[];

// Type for parsed log
interface ParsedLog {
  name: string;
  args: {
    tokenId?: ethers.BigNumberish;
    licenseId?: ethers.BigNumberish;
    [key: string]: unknown;
  };
}

// Types for on-chain operations
export interface OnChainArtwork {
  tokenId: string;
  contentHash: string;
  title: string;
  description: string;
  metadataURI: string;
  creator: string;
  tokenURI?: string;
}

export interface OnChainLicense {
  licenseId: string;
  workHash: string;
  amount: string;
  price: string;
  royalty: string;
  expiration: string;
  termsURI: string;
  isActive: boolean;
}

export interface OnChainListing {
  licenseId: string;
  seller: string;
  amount: string;
  price: string;
  listedAt: string;
  active: boolean;
}

export interface MarketplaceStats {
  volume: string;
  platformBalance: string;
  nationalBalance: string;
}

// Artwork Operations
export class ArtworkService {
  static async getArtworks(): Promise<OnChainArtwork[]> {
    const provider = getProvider();
    if (!provider) return [];
    
    try {
      const contract = getContract(CONTRACTS.Artwork, Artwork.abi as ContractABI, provider);
      
      // Query WorkRegistered events
      const eventIface = new ethers.Interface(Artwork.abi as ContractABI);
      const event = eventIface.getEvent("WorkRegistered");
      if (!event) throw new Error("WorkRegistered event not found in ABI");
      const topic = event.topicHash;
      const logs = await provider.getLogs({
        address: CONTRACTS.Artwork,
        topics: [topic],
        fromBlock: 0,
        toBlock: "latest"
      });
      
      const artworks: OnChainArtwork[] = [];
      for (const log of logs) {
        const parsed = eventIface.parseLog(log) as ParsedLog;
        if (!parsed) continue;
        const tokenId = parsed.args.tokenId?.toString();
        if (!tokenId) continue;
        
        try {
          const [contentHash, title, description, metadataURI, creator] = await contract.getWork(tokenId);
          let tokenURI: string | undefined = undefined;
          try { 
            tokenURI = await contract.tokenURI(tokenId); 
          } catch (error) {
            console.warn(`Failed to get tokenURI for ${tokenId}:`, error);
          }
          
          artworks.push({
            tokenId,
            contentHash: contentHash as string,
            title,
            description,
            metadataURI,
            creator,
            tokenURI
          });
        } catch (error) {
          console.error(`Error fetching artwork ${tokenId}:`, error);
        }
      }
      
      return artworks.reverse(); // Most recent first
    } catch (error) {
      console.error('Error fetching artworks:', error);
      return [];
    }
  }

  static async registerArtwork(params: {
    contentHashHex: string;
    title: string;
    description: string;
    metadataURI: string;
  }): Promise<{ txHash: string; tokenId: string }> {
    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected');
    
    const contract = getContract(CONTRACTS.Artwork, Artwork.abi as ContractABI, signer);
    const tx = await contract.mintArtwork(
      params.contentHashHex,
      params.title,
      params.description,
      params.metadataURI
    );
    
    const receipt = await tx.wait();
    
    // Extract tokenId from event
    const eventIface = new ethers.Interface(Artwork.abi as ContractABI);
    const event = receipt.logs.find((log: ethers.Log) => {
      try {
        const parsed = eventIface.parseLog(log) as ParsedLog;
        return parsed && parsed.name === "WorkRegistered";
      } catch (error) {
        console.warn('Failed to parse log:', error);
        return false;
      }
    });
    
    const tokenId = event ? (eventIface.parseLog(event) as ParsedLog).args.tokenId?.toString() || "0" : "0";
    
    return { txHash: receipt.hash, tokenId };
  }

  static async getCreatorArtworks(creatorAddress: string): Promise<OnChainArtwork[]> {
    const provider = getProvider();
    if (!provider) return [];
    
    try {
      const contract = getContract(CONTRACTS.Artwork, Artwork.abi as ContractABI, provider);
      const tokenIds = await contract.getCreatorTokens(creatorAddress);
      
      const artworks: OnChainArtwork[] = [];
      for (const tokenId of tokenIds) {
        try {
          const [contentHash, title, description, metadataURI, creator] = await contract.getWork(tokenId.toString());
          let tokenURI: string | undefined = undefined;
          try { 
            tokenURI = await contract.tokenURI(tokenId.toString()); 
          } catch (error) {
            console.warn(`Failed to get tokenURI for ${tokenId}:`, error);
          }
          
          artworks.push({
            tokenId: tokenId.toString(),
            contentHash: contentHash as string,
            title,
            description,
            metadataURI,
            creator,
            tokenURI
          });
        } catch (error) {
          console.error(`Error fetching artwork ${tokenId}:`, error);
        }
      }
      
      return artworks;
    } catch (error) {
      console.error('Error fetching creator artworks:', error);
      return [];
    }
  }
}

// License Operations
export class LicenseService {
  static async getLicenses(): Promise<OnChainLicense[]> {
    const provider = getProvider();
    if (!provider) return [];
    
    try {
    const contract = getContract(CONTRACTS.License, License.abi as ContractABI, provider);
    
    // Query LicenseMinted events
    const eventIface = new ethers.Interface(License.abi as ContractABI);
      const event = eventIface.getEvent("LicenseMinted");
      if (!event) throw new Error("LicenseMinted event not found in ABI");
      const topic = event.topicHash;
      const logs = await provider.getLogs({
        address: CONTRACTS.License,
        topics: [topic],
        fromBlock: 0,
        toBlock: "latest"
      });
      
      const licenses: OnChainLicense[] = [];
      for (const log of logs) {
        const parsed = eventIface.parseLog(log) as ParsedLog;
        if (!parsed) continue;
        const licenseId = parsed.args.licenseId?.toString();
        if (!licenseId) continue;
        
        try {
          const metadata = await contract.getLicenseMetadata(licenseId);
          licenses.push({
            licenseId,
            workHash: metadata.workHash,
            amount: metadata.amount.toString(),
            price: metadata.price.toString(),
            royalty: metadata.royalty.toString(),
            expiration: metadata.expiration.toString(),
            termsURI: metadata.termsURI,
            isActive: true
          });
        } catch (error) {
          console.error(`Error fetching license ${licenseId}:`, error);
        }
      }
      
      return licenses.reverse();
    } catch (error) {
      console.error('Error fetching licenses:', error);
      return [];
    }
  }

  static async mintLicense(params: {
    workHash: string;
    amount: string;
    price: string;
    royalty: string;
    expiration: string;
    termsURI: string;
  }): Promise<{ txHash: string; licenseId: string }> {
    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected');
    
    const contract = getContract(CONTRACTS.License, License.abi as ContractABI, signer);
    const tx = await contract.mintLicense(
      params.workHash,
      params.amount,
      params.price,
      params.royalty,
      params.expiration,
      params.termsURI
    );
    
    const receipt = await tx.wait();
    
    // Extract licenseId from event
    const eventIface = new ethers.Interface(License.abi as ContractABI);
    const event = receipt.logs.find((log: ethers.Log) => {
      try {
        const parsed = eventIface.parseLog(log) as ParsedLog;
        return parsed && parsed.name === "LicenseMinted";
      } catch (error) {
        console.warn('Failed to parse log:', error);
        return false;
      }
    });
    
    const licenseId = event ? (eventIface.parseLog(event) as ParsedLog).args.licenseId?.toString() || "0" : "0";
    
    return { txHash: receipt.hash, licenseId };
  }
}

// Marketplace Operations
export class MarketplaceService {
  static async getListings(): Promise<OnChainListing[]> {
    const provider = getProvider();
    if (!provider) return [];
    
    try {
      const contract = getContract(CONTRACTS.Marketplace, Marketplace.abi as ContractABI, provider);
      
      // Query LicenseListed events
      const eventIface = new ethers.Interface(Marketplace.abi as ContractABI);
      const event = eventIface.getEvent("LicenseListed");
      if (!event) throw new Error("LicenseListed event not found in ABI");
      const topic = event.topicHash;
      const logs = await provider.getLogs({
        address: CONTRACTS.Marketplace,
        topics: [topic],
        fromBlock: 0,
        toBlock: "latest"
      });
      
      const listings: OnChainListing[] = [];
      for (const log of logs) {
        const parsed = eventIface.parseLog(log) as ParsedLog;
        if (!parsed) continue;
        const licenseId = parsed.args.licenseId?.toString();
        if (!licenseId) continue;
        
        try {
          const listing = await contract.listings(licenseId);
          listings.push({
            licenseId,
            seller: listing.seller,
            amount: listing.amount.toString(),
            price: listing.price.toString(),
            listedAt: listing.listedAt.toString(),
            active: listing.active
          });
        } catch (error) {
          console.error(`Error fetching listing ${licenseId}:`, error);
        }
      }
      
      return listings.reverse();
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  }

  static async listLicense(params: {
    licenseId: string;
    amount: string;
    price: string;
  }): Promise<{ txHash: string }> {
    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected');
    
    const contract = getContract(CONTRACTS.Marketplace, Marketplace.abi as ContractABI, signer);
    const tx = await contract.listLicense(
      params.licenseId,
      params.amount,
      params.price
    );
    
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  static async buyLicense(params: {
    licenseId: string;
    amount: string;
    value: string;
    paymentToken?: string;
  }): Promise<{ txHash: string }> {
    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected');
    
    const contract = getContract(CONTRACTS.Marketplace, Marketplace.abi as ContractABI, signer);
    
    if (!params.paymentToken || params.paymentToken === '0x0000000000000000000000000000000000000000') {
      // ETH payment (legacy)
      const tx = await contract.buyLicense(
        params.licenseId,
        params.amount,
        { value: ethers.parseEther(params.value) }
      );
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } else {
      // ERC20 token payment
      const tx = await contract.buyLicenseWithToken(
        params.licenseId,
        params.amount,
        params.paymentToken,
        { value: 0 }
      );
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    }
  }

  static async getMarketplaceStats(): Promise<MarketplaceStats> {
    const provider = getProvider();
    if (!provider) throw new Error('No provider available');
    
    try {
      const contract = getContract(CONTRACTS.Marketplace, Marketplace.abi as ContractABI, provider);
      const [volume, platformBalance, nationalBalance] = await contract.getMarketplaceStats();
      
      return {
        volume: ethers.formatEther(volume),
        platformBalance: ethers.formatEther(platformBalance),
        nationalBalance: ethers.formatEther(nationalBalance)
      };
    } catch (error) {
      console.error('Error fetching marketplace stats:', error);
      return {
        volume: "0",
        platformBalance: "0",
        nationalBalance: "0"
      };
    }
  }

  static async withdrawEarnings(): Promise<{ txHash: string }> {
    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected');
    
    const contract = getContract(CONTRACTS.Marketplace, Marketplace.abi as ContractABI, signer);
    const tx = await contract.withdrawEarnings();
    
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  static async getCreatorBalance(creatorAddress: string): Promise<string> {
    const provider = getProvider();
    if (!provider) return "0";
    
    try {
      const contract = getContract(CONTRACTS.Marketplace, Marketplace.abi as ContractABI, provider);
      const balance = await contract.creatorBalance(creatorAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error fetching creator balance:', error);
      return "0";
    }
  }
}

// Utility functions
export function formatEther(value: string | bigint): string {
  return ethers.formatEther(value);
}

export function parseEther(value: string): bigint {
  return ethers.parseEther(value);
}

export function formatUnits(value: string | bigint, decimals: number = 18): string {
  return ethers.formatUnits(value, decimals);
}

export function parseUnits(value: string, decimals: number = 18): bigint {
  return ethers.parseUnits(value, decimals);
}
