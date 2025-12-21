import { Contract } from "ethers";
import { getSigner } from "./index";

export const UNIVERSITY_MANAGEMENT_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const UNIVERSITY_MANAGEMENT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "contractType", type: "string" },
      {
        indexed: false,
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
    ],
    name: "ContractUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "account", type: "address" },
      {
        indexed: false,
        internalType: "enum DataTypes.Role",
        name: "role",
        type: "uint8",
      },
      { indexed: true, internalType: "address", name: "grantedBy", type: "address" },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "account", type: "address" },
      {
        indexed: false,
        internalType: "enum DataTypes.Role",
        name: "role",
        type: "uint8",
      },
      { indexed: true, internalType: "address", name: "revokedBy", type: "address" },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "userAddress", type: "address" }],
    name: "UserDeactivated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "userAddress", type: "address" },
      { indexed: false, internalType: "string", name: "userId", type: "string" },
      {
        indexed: false,
        internalType: "enum DataTypes.Role",
        name: "role",
        type: "uint8",
      },
    ],
    name: "UserRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "userAddress", type: "address" },
      { indexed: false, internalType: "string", name: "userId", type: "string" },
    ],
    name: "UserUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "attendanceContract",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "classContract",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "credentialContract",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "userAddress", type: "address" }],
    name: "deactivateUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getMyUser",
    outputs: [
      {
        components: [
          { internalType: "address", name: "userAddress", type: "address" },
          { internalType: "string", name: "userId", type: "string" },
          { internalType: "string", name: "fullName", type: "string" },
          { internalType: "string", name: "email", type: "string" },
          {
            internalType: "enum DataTypes.Role",
            name: "role",
            type: "uint8",
          },
          { internalType: "bool", name: "isActive", type: "bool" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct DataTypes.User",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "enum DataTypes.Role", name: "role", type: "uint8" }],
    name: "getRoleCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalUsers",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "userAddress", type: "address" }],
    name: "getUser",
    outputs: [
      {
        components: [
          { internalType: "address", name: "userAddress", type: "address" },
          { internalType: "string", name: "userId", type: "string" },
          { internalType: "string", name: "fullName", type: "string" },
          { internalType: "string", name: "email", type: "string" },
          {
            internalType: "enum DataTypes.Role",
            name: "role",
            type: "uint8",
          },
          { internalType: "bool", name: "isActive", type: "bool" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct DataTypes.User",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "userId", type: "string" }],
    name: "getUserByUserId",
    outputs: [
      {
        components: [
          { internalType: "address", name: "userAddress", type: "address" },
          { internalType: "string", name: "userId", type: "string" },
          { internalType: "string", name: "fullName", type: "string" },
          { internalType: "string", name: "email", type: "string" },
          {
            internalType: "enum DataTypes.Role",
            name: "role",
            type: "uint8",
          },
          { internalType: "bool", name: "isActive", type: "bool" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct DataTypes.User",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "userAddress", type: "address" }],
    name: "getUserRole",
    outputs: [
      { internalType: "enum DataTypes.Role", name: "", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "gradeContract",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "userAddress", type: "address" },
      { internalType: "enum DataTypes.Role", name: "role", type: "uint8" },
    ],
    name: "hasRole",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_credentialContract", type: "address" },
      { internalType: "address", name: "_attendanceContract", type: "address" },
      { internalType: "address", name: "_gradeContract", type: "address" },
      { internalType: "address", name: "_classContract", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "initialized",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "userAddress", type: "address" },
      { internalType: "string", name: "userId", type: "string" },
      { internalType: "string", name: "fullName", type: "string" },
      { internalType: "string", name: "email", type: "string" },
      {
        internalType: "enum DataTypes.Role",
        name: "role",
        type: "uint8",
      },
    ],
    name: "registerUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "userAddress", type: "address" },
      { internalType: "enum DataTypes.Role", name: "role", type: "uint8" },
    ],
    name: "requireRole",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "contractType", type: "string" },
      { internalType: "address", name: "contractAddress", type: "address" },
    ],
    name: "updateContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "userAddress", type: "address" },
      { internalType: "string", name: "fullName", type: "string" },
      { internalType: "string", name: "email", type: "string" },
    ],
    name: "updateUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "oldAddress", type: "address" },
      { internalType: "address", name: "newAddress", type: "address" },
    ],
    name: "updateUserAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "userAddresses",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "", type: "string" }],
    name: "userIdToAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "users",
    outputs: [
      { internalType: "address", name: "userAddress", type: "address" },
      { internalType: "string", name: "userId", type: "string" },
      { internalType: "string", name: "fullName", type: "string" },
      { internalType: "string", name: "email", type: "string" },
      {
        internalType: "enum DataTypes.Role",
        name: "role",
        type: "uint8",
      },
      { internalType: "bool", name: "isActive", type: "bool" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export async function getUniversityManagementContract() {
  const signer = await getSigner();
  return new Contract(
    UNIVERSITY_MANAGEMENT_ADDRESS,
    UNIVERSITY_MANAGEMENT_ABI,
    signer
  );
}

export function mapRoleToEnum(roleName: string): number {
  switch (roleName.toLowerCase()) {
    case "admin":
      return 0;
    case "teacher":
      return 2;
    case "student":
      return 3;
    default:
      throw new Error(`Vai trò không hợp lệ: ${roleName}`);
  }
}

export async function getCurrentSignerAndRole() {
  const signer = await getSigner();
  const currentAddress = (await signer.getAddress()).toLowerCase();

  const contract = await getUniversityManagementContract();
  const roleBigInt: bigint = await contract.getUserRole(currentAddress);
  const role = Number(roleBigInt);

  return { currentAddress, role };
}
