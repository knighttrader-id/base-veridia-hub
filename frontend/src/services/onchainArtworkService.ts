import { ethers } from 'ethers';
import { getContract, getSigner, getProvider } from '../lib/web3';
import { CONTRACTS } from '../config/contracts';
import Artwork from '../abi/Artwork.json';

export type ArtworkItem = {
  tokenId: string;
  contentHash: string;
  title: string;
  description: string;
  metadataURI: string;
  creator: string;
  tokenURI?: string;
};

export async function getArtworks(): Promise<ArtworkItem[]> {
  const provider = getProvider();
  if (!provider) return [];
  const c = getContract(CONTRACTS.Artwork, (Artwork as any).abi, provider);
  // Query WorkRegistered events as index
  const eventIface = new ethers.Interface((Artwork as any).abi);
  const topic = eventIface.getEvent("WorkRegistered").topicHash;
  const logs = await provider.getLogs({
    address: CONTRACTS.Artwork,
    topics: [topic],
    fromBlock: 0,
    toBlock: "latest"
  });
  const items: ArtworkItem[] = [];
  for (const log of logs) {
    const parsed = eventIface.parseLog(log);
    const tokenId = parsed.args.tokenId.toString();
    try {
      const [contentHash, title, description, metadataURI, creator] = await c.getWork(tokenId);
      let tokenURI: string | undefined = undefined;
      try { tokenURI = await c.tokenURI(tokenId); } catch {}
      items.push({
        tokenId, contentHash: contentHash as string, title, description, metadataURI, creator, tokenURI
      });
    } catch {}
  }
  return items.reverse();
}

export async function registerArtwork(params: { contentHashHex: string; title: string; description: string; metadataURI: string; }) {
  const signer = await getSigner();
  if (!signer) throw new Error('Wallet not connected');
  const c = getContract(CONTRACTS.Artwork, (Artwork as any).abi, signer);
  const tx = await c.mintArtwork(params.contentHashHex, params.title, params.description, params.metadataURI);
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}
