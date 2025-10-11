import { ethers } from 'ethers';
import { getContract, getSigner, getProvider } from '../lib/web3';
import { CONTRACTS } from '../config/contracts';
import Artwork from '../abi/Artwork.json';
import License from '../abi/License.json';
import Marketplace from '../abi/Marketplace.json';

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
      const contract = getContract(CONTRACTS.Artwork, (Artwork as any).abi, provider);
      
      // Query WorkRegistered events
      const eventIface = new ethers.Interface((Artwork as any).abi);
      const topic = eventIface.getEvent("WorkRegistered").topicHash;
      const logs = await provider.getLogs({
        address: CONTRACTS.Artwork,
        topics: [topic],
        fromBlock: 0,
        toBlock: "latest"
      });
      
      const artworks: OnChainArtwork[] = [];
      for (const log of logs) {
        const parsed = eventIface.parseLog(log);
        const tokenId = parsed.args.tokenId.toString();
        
        try {
          const [contentHash, title, description, metadataURI, creator] = await contract.getWork(tokenId);
          let tokenURI: string | undefined = undefined;
          try { 
            tokenURI = await contract.tokenURI(tokenId); 
          } catch {}
          
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
    
    const contract = getContract(CONTRACTS.Artwork, (Artwork as any).abi, signer);
    const tx = await contract.mintArtwork(
      params.contentHashHex,
      params.title,
      params.description,
      params.metadataURI
    );
    
    const receipt = await tx.wait();
    
    // Extract tokenId from event
    const eventIface = new ethers.Interface((Artwork as any).abi);
    const event = receipt.logs.find(log => {
      try {
        const parsed = eventIface.parseLog(log);
        return parsed && parsed.name === "WorkRegistered";
      } catch {
        return false;
      }
    });
    
    const tokenId = event ? eventIface.parseLog(event).args.tokenId.toString() : "0";
    
    return { txHash: receipt.hash, tokenId };
  }

  static async getCreatorArtworks(creatorAddress: string): Promise<OnChainArtwork[]> {
    const provider = getProvider();
    if (!provider) return [];
    
    try {
      const contract = getContract(CONTRACTS.Artwork, (Artwork as any).abi, provider);
      const tokenIds = await contract.getCreatorTokens(creatorAddress);
      
      const artworks: OnChainArtwork[] = [];
      for (const tokenId of tokenIds) {
        try {
          const [contentHash, title, description, metadataURI, creator] = await contract.getWork(tokenId.toString());
          let tokenURI: string | undefined = undefined;
          try { 
            tokenURI = await contract.tokenURI(tokenId.toString()); 
          } catch {}
          
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
      const contract = getContract(CONTRACTS.License, (License as any).abi, provider);
      
      // Query LicenseMinted events
      const eventIface = new ethers.Interface((License as any).abi);
      const topic = eventIface.getEvent("LicenseMinted").topicHash;
      const logs = await provider.getLogs({
        address: CONTRACTS.License,
        topics: [topic],
        fromBlock: 0,
        toBlock: "latest"
      });
      
      const licenses: OnChainLicense[] = [];
      for (const log of logs) {
        const parsed = eventIface.parseLog(log);
        const licenseId = parsed.args.licenseId.toString();
        
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
    
    const contract = getContract(CONTRACTS.License, (License as any).abi, signer);
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
    const eventIface = new ethers.Interface((License as any).abi);
    const event = receipt.logs.find(log => {
      try {
        const parsed = eventIface.parseLog(log);
        return parsed && parsed.name === "LicenseMinted";
      } catch {
        return false;
      }
    });
    
    const licenseId = event ? eventIface.parseLog(event).args.licenseId.toString() : "0";
    
    return { txHash: receipt.hash, licenseId };
  }
}

// Marketplace Operations
export class MarketplaceService {
  static async getListings(): Promise<OnChainListing[]> {
    const provider = getProvider();
    if (!provider) return [];
    
    try {
      const contract = getContract(CONTRACTS.Marketplace, (Marketplace as any).abi, provider);
      
      // Query LicenseListed events
      const eventIface = new ethers.Interface((Marketplace as any).abi);
      const topic = eventIface.getEvent("LicenseListed").topicHash;
      const logs = await provider.getLogs({
        address: CONTRACTS.Marketplace,
        topics: [topic],
        fromBlock: 0,
        toBlock: "latest"
      });
      
      const listings: OnChainListing[] = [];
      for (const log of logs) {
        const parsed = eventIface.parseLog(log);
        const licenseId = parsed.args.licenseId.toString();
        
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
    
    const contract = getContract(CONTRACTS.Marketplace, (Marketplace as any).abi, signer);
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
  }): Promise<{ txHash: string }> {
    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected');
    
    const contract = getContract(CONTRACTS.Marketplace, (Marketplace as any).abi, signer);
    const tx = await contract.buyLicense(
      params.licenseId,
      params.amount,
      { value: ethers.parseEther(params.value) }
    );
    
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  static async getMarketplaceStats(): Promise<MarketplaceStats> {
    const provider = getProvider();
    if (!provider) throw new Error('No provider available');
    
    try {
      const contract = getContract(CONTRACTS.Marketplace, (Marketplace as any).abi, provider);
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
    
    const contract = getContract(CONTRACTS.Marketplace, (Marketplace as any).abi, signer);
    const tx = await contract.withdrawEarnings();
    
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  static async getCreatorBalance(creatorAddress: string): Promise<string> {
    const provider = getProvider();
    if (!provider) return "0";
    
    try {
      const contract = getContract(CONTRACTS.Marketplace, (Marketplace as any).abi, provider);
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
