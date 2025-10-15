// Blockchain-specific artwork service
import { ethers } from 'ethers';
import { getContract, getProvider, getSigner } from '../../lib/web3';
import { getActiveTokens } from '../../config/tokens';

// Artwork contract ABI
const ARTWORK_ABI = [
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function totalSupply() view returns (uint256)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function mint(address to, string memory tokenURI) returns (uint256)",
  "function setTokenURI(uint256 tokenId, string memory tokenURI)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function setApprovalForAll(address operator, bool approved)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
];

export interface BlockchainArtwork {
  tokenId: string;
  title: string;
  description: string;
  tokenURI: string;
  creator: string;
  owner: string;
  createdAt: string;
  isListed: boolean;
  price: string;
  currency: string;
}

export interface ArtworkMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  external_url: string;
  animation_url?: string;
}

export class BlockchainArtworkService {
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

      const contractAddress = import.meta.env.VITE_ARTWORK_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('Artwork contract address not configured');
      }

      this.contract = getContract(contractAddress, ARTWORK_ABI, this.provider);
    } catch (error) {
      console.error('Failed to initialize artwork contract:', error);
      throw error;
    }
  }

  /**
   * Get all artworks from blockchain
   */
  async getAllArtworks(): Promise<BlockchainArtwork[]> {
    try {
      if (!this.contract) {
        await this.initializeContract();
      }

      const totalSupply = await this.contract!.totalSupply();
      const artworks: BlockchainArtwork[] = [];

      for (let i = 0; i < totalSupply; i++) {
        try {
          const tokenId = await this.contract!.tokenByIndex(i);
          const artwork = await this.getArtworkById(tokenId.toString());
          if (artwork) {
            artworks.push(artwork);
          }
        } catch (error) {
          console.warn(`Failed to fetch artwork at index ${i}:`, error);
          continue;
        }
      }

      return artworks;
    } catch (error) {
      console.error('Error fetching all artworks:', error);
      throw error;
    }
  }

  /**
   * Get artwork by token ID
   */
  async getArtworkById(tokenId: string): Promise<BlockchainArtwork | null> {
    try {
      if (!this.contract) {
        await this.initializeContract();
      }

      const [tokenURI, owner] = await Promise.all([
        this.contract!.tokenURI(tokenId),
        this.contract!.ownerOf(tokenId)
      ]);

      // Fetch metadata from IPFS
      const metadata = await this.fetchMetadata(tokenURI);
      
      // Check if artwork is listed in marketplace
      const isListed = await this.checkIfListed(tokenId);

      return {
        tokenId,
        title: metadata.name,
        description: metadata.description,
        tokenURI,
        creator: owner, // In a real implementation, you'd track the original creator
        owner,
        createdAt: new Date().toISOString(), // You'd get this from events
        isListed,
        price: isListed ? await this.getListingPrice(tokenId) : '0',
        currency: 'ETH'
      };
    } catch (error) {
      console.error(`Error fetching artwork ${tokenId}:`, error);
      return null;
    }
  }

  /**
   * Get artworks by owner
   */
  async getArtworksByOwner(ownerAddress: string): Promise<BlockchainArtwork[]> {
    try {
      if (!this.contract) {
        await this.initializeContract();
      }

      const balance = await this.contract!.balanceOf(ownerAddress);
      const artworks: BlockchainArtwork[] = [];

      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await this.contract!.tokenOfOwnerByIndex(ownerAddress, i);
          const artwork = await this.getArtworkById(tokenId.toString());
          if (artwork) {
            artworks.push(artwork);
          }
        } catch (error) {
          console.warn(`Failed to fetch artwork ${i} for owner ${ownerAddress}:`, error);
          continue;
        }
      }

      return artworks;
    } catch (error) {
      console.error('Error fetching artworks by owner:', error);
      throw error;
    }
  }

  /**
   * Mint new artwork
   */
  async mintArtwork(
    to: string,
    tokenURI: string,
    metadata: ArtworkMetadata
  ): Promise<{ txHash: string; tokenId: string }> {
    try {
      const signer = await getSigner();
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const contract = getContract(
        import.meta.env.VITE_ARTWORK_CONTRACT_ADDRESS,
        ARTWORK_ABI,
        signer
      );

      const tx = await contract.mint(to, tokenURI);
      const receipt = await tx.wait();

      // Extract token ID from events
      const transferEvent = receipt.logs.find(
        log => log.topics[0] === ethers.id('Transfer(address,address,uint256)')
      );
      
      const tokenId = transferEvent ? 
        ethers.getBigInt(transferEvent.topics[3]).toString() : 
        'unknown';

      return {
        txHash: receipt.hash,
        tokenId
      };
    } catch (error) {
      console.error('Error minting artwork:', error);
      throw error;
    }
  }

  /**
   * Transfer artwork
   */
  async transferArtwork(
    from: string,
    to: string,
    tokenId: string
  ): Promise<{ txHash: string }> {
    try {
      const signer = await getSigner();
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const contract = getContract(
        import.meta.env.VITE_ARTWORK_CONTRACT_ADDRESS,
        ARTWORK_ABI,
        signer
      );

      const tx = await contract.transferFrom(from, to, tokenId);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('Error transferring artwork:', error);
      throw error;
    }
  }

  /**
   * Approve artwork for marketplace
   */
  async approveArtwork(
    to: string,
    tokenId: string
  ): Promise<{ txHash: string }> {
    try {
      const signer = await getSigner();
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const contract = getContract(
        import.meta.env.VITE_ARTWORK_CONTRACT_ADDRESS,
        ARTWORK_ABI,
        signer
      );

      const tx = await contract.approve(to, tokenId);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('Error approving artwork:', error);
      throw error;
    }
  }

  /**
   * Set approval for all artworks
   */
  async setApprovalForAll(
    operator: string,
    approved: boolean
  ): Promise<{ txHash: string }> {
    try {
      const signer = await getSigner();
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const contract = getContract(
        import.meta.env.VITE_ARTWORK_CONTRACT_ADDRESS,
        ARTWORK_ABI,
        signer
      );

      const tx = await contract.setApprovalForAll(operator, approved);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('Error setting approval for all:', error);
      throw error;
    }
  }

  /**
   * Fetch metadata from IPFS
   */
  private async fetchMetadata(tokenURI: string): Promise<ArtworkMetadata> {
    try {
      // Handle IPFS URLs
      const url = tokenURI.startsWith('ipfs://') 
        ? `https://ipfs.io/ipfs/${tokenURI.slice(7)}`
        : tokenURI;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching metadata:', error);
      // Return default metadata
      return {
        name: 'Unknown Artwork',
        description: 'Metadata unavailable',
        image: 'https://via.placeholder.com/400x400?text=Artwork',
        attributes: [],
        external_url: ''
      };
    }
  }

  /**
   * Check if artwork is listed in marketplace
   */
  private async checkIfListed(tokenId: string): Promise<boolean> {
    try {
      // This would check with the marketplace contract
      // For now, return false as placeholder
      return false;
    } catch (error) {
      console.error('Error checking listing status:', error);
      return false;
    }
  }

  /**
   * Get listing price for artwork
   */
  private async getListingPrice(tokenId: string): Promise<string> {
    try {
      // This would query the marketplace contract for the listing price
      // For now, return '0' as placeholder
      return '0';
    } catch (error) {
      console.error('Error getting listing price:', error);
      return '0';
    }
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    return import.meta.env.VITE_ARTWORK_CONTRACT_ADDRESS || '';
  }

  /**
   * Check if contract is initialized
   */
  isInitialized(): boolean {
    return this.contract !== null && this.provider !== null;
  }
}
