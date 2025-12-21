import { Contract } from "ethers";
import { getSigner } from "./index";

export const CLASS_MANAGEMENT_ADDRESS =
  import.meta.env.VITE_CLASS_MANAGEMENT_ADDRESS ||
  "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

export const CLASS_MANAGEMENT_ABI = [
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
        name: "classId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "classCode",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "lecturerAddress",
        type: "address",
      },
    ],
    name: "ClassCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "enrollmentId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "classId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "studentAddress",
        type: "address",
      },
    ],
    name: "StudentDropped",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "enrollmentId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "classId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "studentAddress",
        type: "address",
      },
    ],
    name: "StudentEnrolled",
    type: "event",
  },
  {
    inputs: [],
    name: "classCount",
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
    name: "enrollmentCount",
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
        internalType: "string",
        name: "classCode",
        type: "string",
      },
      {
        internalType: "string",
        name: "className",
        type: "string",
      },
      {
        internalType: "address",
        name: "lecturerAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "startDate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endDate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxStudents",
        type: "uint256",
      },
    ],
    name: "createClass",
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
        name: "classId",
        type: "uint256",
      },
    ],
    name: "getClass",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "classId",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "classCode",
            type: "string",
          },
          {
            internalType: "string",
            name: "className",
            type: "string",
          },
          {
            internalType: "address",
            name: "lecturerAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "startDate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endDate",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "maxStudents",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "enrolledCount",
            type: "uint256",
          },
        ],
        internalType: "struct DataTypes.Class",
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
        internalType: "uint256",
        name: "classId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "studentAddress",
        type: "address",
      },
    ],
    name: "enrollStudent",
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
        name: "classId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "studentAddress",
        type: "address",
      },
    ],
    name: "dropStudent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "classId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "studentAddress",
        type: "address",
      },
    ],
    name: "checkEnrollment",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "classId",
        type: "uint256",
      },
    ],
    name: "getClassEnrollments",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "enrollmentId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "classId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "studentAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "enrolledAt",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "droppedAt",
            type: "uint256",
          },
        ],
        internalType: "struct DataTypes.Enrollment[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export async function getClassManagementContract() {
  const signer = await getSigner();
  return new Contract(
    CLASS_MANAGEMENT_ADDRESS,
    CLASS_MANAGEMENT_ABI,
    signer
  );
}

export interface CreateOnChainClassOptions {
  classCode: string;
  className: string;
  lecturerAddress: string;
  startDateUnix: number;
  endDateUnix: number;
  maxStudents: number;
}

export async function createOnChainClass(
  opts: CreateOnChainClassOptions
): Promise<number> {
  const contract = await getClassManagementContract();

  const tx = await contract.createClass(
    opts.classCode,
    opts.className,
    opts.lecturerAddress,
    opts.startDateUnix,
    opts.endDateUnix,
    opts.maxStudents
  );

  const receipt = await tx.wait();

  const parsedLogs = receipt.logs
    .map((log: any) => {
      try {
        return contract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const classCreatedEvent = parsedLogs.find(
    (e: any) => e.name === "ClassCreated"
  );

  if (!classCreatedEvent) {
    throw new Error("Không tìm thấy event ClassCreated trong transaction");
  }

  const classIdOnChain: bigint = classCreatedEvent.args?.classId;
  const idNum = Number(classIdOnChain);

  if (!Number.isFinite(idNum) || idNum <= 0) {
    throw new Error("classId on-chain không hợp lệ");
  }

  return idNum;
}
