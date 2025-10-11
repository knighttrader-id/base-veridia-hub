import { ethers } from 'ethers';

const rpcUrl = import.meta.env.VITE_RPC_URL;
const chainIdEnv = import.meta.env.VITE_CHAIN_ID;
if (!rpcUrl) {
  console.warn('VITE_RPC_URL is not set. On-chain features will not work without a provider.');
}

export function getProvider(): ethers.JsonRpcProvider | null {
  if (!rpcUrl) return null;
  return new ethers.JsonRpcProvider(rpcUrl, chainIdEnv ? Number(chainIdEnv) : undefined);
}

export async function getSigner(): Promise<ethers.Signer | null> {
  if (typeof window === 'undefined') return null;
  // If using injected wallet (e.g., MetaMask)
  // @ts-ignore
  const { ethereum } = window;
  if (!ethereum) return null;
  const provider = new ethers.BrowserProvider(ethereum);
  await provider.send('eth_requestAccounts', []);
  return await provider.getSigner();
}

export function getContract(address: string, abi: any, signerOrProvider?: ethers.Signer | ethers.Provider): ethers.Contract {
  const provider = signerOrProvider || getProvider();
  if (!provider) throw new Error('No provider/signature available');
  return new ethers.Contract(address, abi, provider as any);
}
