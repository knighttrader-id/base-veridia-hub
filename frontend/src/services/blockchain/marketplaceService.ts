// Blockchain-specific marketplace service
import { ethers } from 'ethers';
import { getContract, getProvider, getSigner } from '../../lib/web3';
import { getActiveTokens } from '../../config/tokens';

// Marketplace contract ABI
const MARKETPLACE_ABI = [
  "function listItem(uint256 tokenId, uint256 price, address paymentToken) external",
  "function buyItem(uint256 tokenId, address paymentToken) external payable",
  "function cancelListing(uint256 tokenId) external",
  "function updateListing(uint256 tokenId, uint256 newPrice) external",
  "function getListing(uint256 tokenId) view returns (address seller, uint256 price, address paymentToken, bool active)",
  "function getListings() view returns (uint256[] memory)",
  "function getListingsBySeller(address seller) view returns (uint256[] memory)",
  "function getListingsByPaymentToken(address paymentToken) view returns (uint256[] memory)",
  "function isListed(uint256 tokenId) view returns (bool)",
  "function getMarketplaceFee() view returns (uint256)",
  "function setMarketplaceFee(uint256 newFee) external",
  "function withdrawFees() external",
  "function getTotalVolume() view returns (uint256)",
  "function getTotalVolumeByToken(address token) view returns (uint256)",
  "event ItemListed(uint256 indexed tokenId, address indexed seller, uint256 price, address indexed paymentToken)",
  "event ItemSold(uint256 indexed tokenId, address indexed buyer, uint256 price, address indexed paymentToken)",
  "event ItemDelisted(uint256 indexed tokenId, address indexed seller)",
  "event ItemUpdated(uint256 indexed tokenId, uint256 newPrice)"
];

export interface MarketplaceListing {
  tokenId: string;
  seller: string;
  price: string;
  paymentToken: string;
  active: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface MarketplaceStats {
  totalListings: number;
  totalVolume: string;
  totalVolumeByToken: Record<string, string>;
  marketplaceFee: string;
  activeListings: number;
}

export interface PurchaseParams {
  tokenId: string;
  paymentToken: string;
  price: string;
  buyer: string;
}

export class BlockchainMarketplaceService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.Provider | null = null;

  constructor() {
    this.initializeContract();
  }

  private async initializeContract() {
    try {
      this.provider = getProvider();
      if (!this.provider) {
        throw new Error('Provider not available');
      }

      const contractAddress = import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('Marketplace contract address not configured');
      }

      this.contract = getContract(contractAddress, MARKETPLACE_ABI, this.provider);
    } catch (error) {
      console.error('Failed to initialize marketplace contract:', error);
      throw error;
    }
  }

  /**
   * Get all active listings
   */
  async getAllListings(): Promise<MarketplaceListing[]> {
    try {
      if (!this.contract) {
        await this.initializeContract();
      }

      const listingIds = await this.contract!.getListings();
      const listings: MarketplaceListing[] = [];

      for (const tokenId of listingIds) {
        try {
          const listing = await this.getListing(tokenId.toString());
          if (listing && listing.active) {
            listings.push(listing);
          }
        } catch (error) {
          console.warn(`Failed to fetch listing for token ${tokenId}:`, error);
          continue;
        }
      }

      return listings;
    } catch (error) {
      console.error('Error fetching all listings:', error);
      throw error;
    }
  }

  /**
   * Get listing by token ID
   */
  async getListing(tokenId: string): Promise<MarketplaceListing | null> {
    try {
      if (!this.contract) {
        await this.initializeContract();
      }

      const [seller, price, paymentToken, active] = await this.contract!.getListing(tokenId);

      return {
        tokenId,
        seller,
        price: ethers.formatEther(price),
        paymentToken,
        active,
        createdAt: new Date().toISOString(), // You'd get this from events
        expiresAt: undefined // Add if you have expiration logic
      };
    } catch (error) {
      console.error(`Error fetching listing ${tokenId}:`, error);
      return null;
    }
  }

  /**
   * Get listings by seller
   */
  async getListingsBySeller(sellerAddress: string): Promise<MarketplaceListing[]> {
    try {
      if (!this.contract) {
        await this.initializeContract();
      }

      const listingIds = await this.contract!.getListingsBySeller(sellerAddress);
      const listings: MarketplaceListing[] = [];

      for (const tokenId of listingIds) {
        try {
          const listing = await this.getListing(tokenId.toString());
          if (listing) {
            listings.push(listing);
          }
        } catch (error) {
          console.warn(`Failed to fetch listing ${tokenId} for seller ${sellerAddress}:`, error);
          continue;
        }
      }

      return listings;
    } catch (error) {
      console.error('Error fetching listings by seller:', error);
      throw error;
    }
  }

  /**
   * Get listings by payment token
   */
  async getListingsByPaymentToken(paymentToken: string): Promise<MarketplaceListing[]> {
    try {
      if (!this.contract) {
        await this.initializeContract();
      }

      const listingIds = await this.contract!.getListingsByPaymentToken(paymentToken);
      const listings: MarketplaceListing[] = [];

      for (const tokenId of listingIds) {
        try {
          const listing = await this.getListing(tokenId.toString());
          if (listing && listing.active) {
            listings.push(listing);
          }
        } catch (error) {
          console.warn(`Failed to fetch listing ${tokenId} for payment token ${paymentToken}:`, error);
          continue;
        }
      }

      return listings;
    } catch (error) {
      console.error('Error fetching listings by payment token:', error);
      throw error;
    }
  }

  /**
   * List item for sale
   */
  async listItem(
    tokenId: string,
    price: string,
    paymentToken: string
  ): Promise<{ txHash: string }> {
    try {
      const signer = await getSigner();
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const contract = getContract(
        import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      const priceWei = ethers.parseEther(price);
      const tx = await contract.listItem(tokenId, priceWei, paymentToken);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('Error listing item:', error);
      throw error;
    }
  }

  /**
   * Buy item
   */
  async buyItem(params: PurchaseParams): Promise<{ txHash: string }> {
    try {
      const signer = await getSigner();
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const contract = getContract(
        import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      const priceWei = ethers.parseEther(params.price);
      
      // For ETH payments, send value with transaction
      const tx = paymentToken === ethers.ZeroAddress 
        ? await contract.buyItem(params.tokenId, params.paymentToken, { value: priceWei })
        : await contract.buyItem(params.tokenId, params.paymentToken);

      const receipt = await tx.wait();

      return {
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('Error buying item:', error);
      throw error;
    }
  }

  /**
   * Cancel listing
   */
  async cancelListing(tokenId: string): Promise<{ txHash: string }> {
    try {
      const signer = await getSigner();
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const contract = getContract(
        import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      const tx = await contract.cancelListing(tokenId);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('Error canceling listing:', error);
      throw error;
    }
  }

  /**
   * Update listing price
   */
  async updateListing(tokenId: string, newPrice: string): Promise<{ txHash: string }> {
    try {
      const signer = await getSigner();
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const contract = getContract(
        import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      const priceWei = ethers.parseEther(newPrice);
      const tx = await contract.updateListing(tokenId, priceWei);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('Error updating listing:', error);
      throw error;
    }
  }

  /**
   * Check if item is listed
   */
  async isListed(tokenId: string): Promise<boolean> {
    try {
      if (!this.contract) {
        await this.initializeContract();
      }

      return await this.contract!.isListed(tokenId);
    } catch (error) {
      console.error('Error checking listing status:', error);
      return false;
    }
  }

  /**
   * Get marketplace statistics
   */
  async getMarketplaceStats(): Promise<MarketplaceStats> {
    try {
      if (!this.contract) {
        await this.initializeContract();
      }

      const [totalVolume, marketplaceFee] = await Promise.all([
        this.contract!.getTotalVolume(),
        this.contract!.getMarketplaceFee()
      ]);

      const activeListings = await this.getAllListings();
      const totalListings = activeListings.length;

      // Get volume by token
      const tokens = getActiveTokens();
      const totalVolumeByToken: Record<string, string> = {};
      
      for (const [symbol, tokenInfo] of Object.entries(tokens)) {
        try {
          const volume = await this.contract!.getTotalVolumeByToken(tokenInfo.address);
          totalVolumeByToken[symbol] = ethers.formatEther(volume);
        } catch (error) {
          totalVolumeByToken[symbol] = '0';
        }
      }

      return {
        totalListings,
        totalVolume: ethers.formatEther(totalVolume),
        totalVolumeByToken,
        marketplaceFee: ethers.formatEther(marketplaceFee),
        activeListings: totalListings
      };
    } catch (error) {
      console.error('Error fetching marketplace stats:', error);
      throw error;
    }
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    return import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS || '';
  }

  /**
   * Check if contract is initialized
   */
  isInitialized(): boolean {
    return this.contract !== null && this.provider !== null;
  }
}
