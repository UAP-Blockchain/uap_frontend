import { Contract, Interface } from "ethers";
import { getSigner } from "./index";

export const CREDENTIAL_MANAGEMENT_ADDRESS =
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const CREDENTIAL_MANAGEMENT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_universityManagement",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "credentialId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "studentAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "credentialType",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "issuedBy",
        type: "address",
      },
    ],
    name: "CredentialIssued",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "credentialId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "revokedBy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "revokedAt",
        type: "uint256",
      },
    ],
    name: "CredentialRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "credentialId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "oldStatus",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "CredentialStatusUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "credentialCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "credentials",
    outputs: [
      {
        internalType: "uint256",
        name: "credentialId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "studentAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "credentialType",
        type: "string",
      },
      {
        internalType: "string",
        name: "credentialData",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "issuedBy",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "issuedAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expiresAt",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "credentialId",
        type: "uint256",
      },
    ],
    name: "getCredential",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "credentialId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "studentAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "credentialType",
            type: "string",
          },
          {
            internalType: "string",
            name: "credentialData",
            type: "string",
          },
          {
            internalType: "uint8",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "address",
            name: "issuedBy",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "issuedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "expiresAt",
            type: "uint256",
          },
        ],
        internalType: "struct DataTypes.Credential",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "studentAddress",
        type: "address",
      },
    ],
    name: "getStudentCredentials",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "studentAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "credentialType",
        type: "string",
      },
      {
        internalType: "string",
        name: "credentialData",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "expiresAt",
        type: "uint256",
      },
    ],
    name: "issueCredential",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "credentialId",
        type: "uint256",
      },
    ],
    name: "revokeCredential",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "studentCredentials",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "universityManagement",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "credentialId",
        type: "uint256",
      },
    ],
    name: "verifyCredential",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export type CredentialManagementContract = Contract & {
  issueCredential: (
    studentAddress: string,
    credentialType: string,
    credentialData: string,
    expiresAt: bigint
  ) => Promise<any>;
};

export const getCredentialManagementContract = async (): Promise<CredentialManagementContract> => {
  const signer = await getSigner();
  const iface = new Interface(CREDENTIAL_MANAGEMENT_ABI);
  return new Contract(
    CREDENTIAL_MANAGEMENT_ADDRESS,
    iface,
    signer
  ) as CredentialManagementContract;
};
