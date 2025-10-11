import { ethers } from 'ethers';
import { getContract, getSigner, getProvider } from '../lib/web3';
import { CONTRACTS } from '../config/contracts';
import License from '../abi/License.json';
import Marketplace from '../abi/Marketplace.json';

export type Transaction = {
  licenseId: string;
  amount: string;
  pricePaid: string;
  buyer: string;
  txHash: string;
  blockNumber: number;
  createdAt?: string;
};

export async function getUserTransactions(buyerAddr?: string): Promise<Transaction[]> {
  const provider = getProvider();
  if (!provider) return [];
  const iface = new ethers.Interface((Marketplace as any).abi);
  const topic = iface.getEvent("LicensePurchased").topicHash;
  const topics = [topic, null, buyerAddr ? ethers.getAddress(buyerAddr) : null].map((t, i) => i===2 && t ? ethers.zeroPadValue(t, 32) : t);
  const logs = await provider.getLogs({
    address: CONTRACTS.Marketplace,
    topics,
    fromBlock: 0,
    toBlock: "latest"
  });
  return logs.map((log) => {
    const p = iface.parseLog(log);
    return {
      licenseId: p.args.licenseId.toString(),
      amount: p.args.amount.toString(),
      pricePaid: p.args.pricePaid.toString(),
      buyer: p.args.buyer,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber
    };
  }).reverse();
}

export async function purchaseArtwork(licenseId: string, amount: string) {
  const signer = await getSigner();
  if (!signer) throw new Error('Wallet not connected');
  const lic = getContract(CONTRACTS.License, (License as any).abi, signer);
  const pricePerUnit = await lic.licensePrice(licenseId);
  const total = pricePerUnit * BigInt(amount);
  const market = getContract(CONTRACTS.Marketplace, (Marketplace as any).abi, signer);
  const tx = await market.buyLicense(licenseId, amount, { value: total });
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}
