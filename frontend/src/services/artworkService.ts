import { ArtworkService, LicenseService, MarketplaceService } from './onchainService';

export type ArtworkItem = {
  tokenId: string;
  contentHash: string;
  title: string;
  description: string;
  metadataURI: string;
  creator: string;
  tokenURI?: string;
};

export type MarketplaceArtwork = {
  tokenId: string;
  contentHash: string;
  title: string;
  description: string;
  metadataURI: string;
  creator: string;
  tokenURI?: string;
  price: string;
  isListed: boolean;
  licenseId?: string;
  licensePrice?: string;
  licenseAmount?: string;
};

// Artwork Operations
export async function getArtworks(): Promise<ArtworkItem[]> {
  const artworks = await ArtworkService.getArtworks();
  return artworks.map(artwork => ({
    tokenId: artwork.tokenId,
    contentHash: artwork.contentHash,
    title: artwork.title,
    description: artwork.description,
    metadataURI: artwork.metadataURI,
    creator: artwork.creator,
    tokenURI: artwork.tokenURI
  }));
}

export async function getMarketplaceArtworks(): Promise<MarketplaceArtwork[]> {
  try {
    // Get all artworks from blockchain
    const artworks = await getArtworks();
    const listings = await MarketplaceService.getListings();
    
    const marketplaceItems: MarketplaceArtwork[] = [];
    
    for (const artwork of artworks) {
      // Find any listings for this artwork
      const artworkListings = listings.filter(listing => 
        listing.licenseId === artwork.tokenId && listing.active
      );
      
      if (artworkListings.length > 0) {
        // Use the first active listing
        const listing = artworkListings[0];
        marketplaceItems.push({
          ...artwork,
          price: listing.price,
          isListed: true,
          licenseId: listing.licenseId,
          licensePrice: listing.price,
          licenseAmount: listing.amount
        });
      } else {
        // No active listings for this artwork
        marketplaceItems.push({
          ...artwork,
          price: "0",
          isListed: false,
          licenseId: artwork.tokenId,
          licensePrice: "0",
          licenseAmount: "0"
        });
      }
    }
    
    return marketplaceItems;
  } catch (error) {
    console.error('Error fetching marketplace artworks:', error);
    return [];
  }
}

export async function registerArtwork(params: { 
  contentHashHex: string; 
  title: string; 
  description: string; 
  metadataURI: string; 
}): Promise<{ txHash: string; tokenId: string }> {
  return await ArtworkService.registerArtwork(params);
}

export async function getArtworkById(tokenId: string): Promise<ArtworkItem | null> {
  try {
    const artworks = await getArtworks();
    return artworks.find(artwork => artwork.tokenId === tokenId) || null;
  } catch (error) {
    console.error(`Error fetching artwork ${tokenId}:`, error);
    return null;
  }
}

export async function getCreatorArtworks(creatorAddress: string): Promise<ArtworkItem[]> {
  const artworks = await ArtworkService.getCreatorArtworks(creatorAddress);
  return artworks.map(artwork => ({
    tokenId: artwork.tokenId,
    contentHash: artwork.contentHash,
    title: artwork.title,
    description: artwork.description,
    metadataURI: artwork.metadataURI,
    creator: artwork.creator,
    tokenURI: artwork.tokenURI
  }));
}

// License Operations
export async function getLicenses(): Promise<any[]> {
  return await LicenseService.getLicenses();
}

export async function mintLicense(params: {
  workHash: string;
  amount: string;
  price: string;
  royalty: string;
  expiration: string;
  termsURI: string;
}): Promise<{ txHash: string; licenseId: string }> {
  return await LicenseService.mintLicense(params);
}

// Marketplace Operations
export async function getListings(): Promise<any[]> {
  return await MarketplaceService.getListings();
}

export async function listLicense(params: {
  licenseId: string;
  amount: string;
  price: string;
}): Promise<{ txHash: string }> {
  return await MarketplaceService.listLicense(params);
}

export async function buyLicense(params: {
  licenseId: string;
  amount: string;
  value: string;
}): Promise<{ txHash: string }> {
  return await MarketplaceService.buyLicense(params);
}

export async function getMarketplaceStats(): Promise<{
  volume: string;
  platformBalance: string;
  nationalBalance: string;
}> {
  return await MarketplaceService.getMarketplaceStats();
}

export async function withdrawEarnings(): Promise<{ txHash: string }> {
  return await MarketplaceService.withdrawEarnings();
}

export async function getCreatorBalance(creatorAddress: string): Promise<string> {
  return await MarketplaceService.getCreatorBalance(creatorAddress);
}