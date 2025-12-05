import { BrowserProvider, Contract } from "ethers";

/**
 * Global MetaMask + ethers helpers
 * - Use ENV or constants to configure contract addresses
 */

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export async function getBrowserProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask (hoặc ví tương thích EVM) chưa được cài đặt.");
  }

  const provider = new BrowserProvider(window.ethereum as any);
  await provider.send("eth_requestAccounts", []);
  return provider;
}

export async function getSigner() {
  const provider = await getBrowserProvider();
  return provider.getSigner();
}

export async function getAccountAddress(): Promise<string> {
  const signer = await getSigner();
  return signer.getAddress();
}

export interface ContractConfig {
  address: string;
  abi: any;
}

export async function getContract<T extends Contract = Contract>(
  config: ContractConfig
): Promise<T> {
  const signer = await getSigner();
  return new Contract(config.address, config.abi, signer) as T;
}

export async function ensureCorrectNetwork(expectedChainIdHex?: string) {
  if (!window.ethereum) return;

  const chainId = (await window.ethereum.request({
    method: "eth_chainId",
  })) as string;

  if (expectedChainIdHex && chainId !== expectedChainIdHex) {
    throw new Error("Vui lòng chuyển đúng mạng trong MetaMask trước khi tiếp tục.");
  }
}
