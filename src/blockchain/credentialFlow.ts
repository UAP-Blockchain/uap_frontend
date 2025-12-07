import { getCredentialManagementContract } from "./credential";
import {
  saveCredentialOnChainApi,
  type SaveCredentialOnChainRequest,
  type CredentialDetailDto,
} from "../services/admin/credentials/api";
import { getBrowserProvider } from "./index";

export interface IssueCredentialOnChainResult {
  transactionHash: string;
  blockNumber?: number;
  chainId?: number;
}

/**
 * Phương án 2 helper: nhận CredentialDetailDto (đã được duyệt nội bộ),
 * FE ký on-chain rồi callback lưu /on-chain.
 */
export async function issueCredentialOnChain(
  approved: CredentialDetailDto & {
    onChainData?: {
      studentAddress: string;
      credentialType: string;
      credentialData: string;
      expiresAt: string | number;
    };
  }
): Promise<IssueCredentialOnChainResult> {
  const onChainData = approved.onChainData;

  if (!onChainData) {
    throw new Error("Backend không gửi payload on-chain cho credential.");
  }

  const credentialId = approved.id;

  // Chuẩn hoá expiresAt sang bigint (timestamp giây)
  let expiresAtBigInt: bigint;
  if (typeof onChainData.expiresAt === "string") {
    const ts = Date.parse(onChainData.expiresAt);
    if (Number.isNaN(ts)) {
      throw new Error("Giá trị expiresAt không hợp lệ.");
    }
    expiresAtBigInt = BigInt(Math.floor(ts / 1000));
  } else {
    expiresAtBigInt = BigInt(onChainData.expiresAt);
  }

  // 2) Gọi contract issueCredential qua MetaMask
  const contract = await getCredentialManagementContract();

  const tx = await contract.issueCredential(
    onChainData.studentAddress,
    onChainData.credentialType,
    onChainData.credentialData,
    expiresAtBigInt
  );

  const receipt = await tx.wait();

  const provider = await getBrowserProvider();
  const network = await provider.getNetwork();

  const txInfo: SaveCredentialOnChainRequest = {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber ? Number(receipt.blockNumber) : undefined,
    chainId: Number(network.chainId),
    // contractAddress fix cứng trong FE, backend có thể không cần nhưng cứ gửi kèm
    contractAddress: contract.target?.toString(),
  };

  // 3) Callback về backend lưu thông tin on-chain
  await saveCredentialOnChainApi(credentialId, txInfo);

  return {
    transactionHash: txInfo.transactionHash,
    blockNumber: txInfo.blockNumber,
    chainId: txInfo.chainId,
  };
}
