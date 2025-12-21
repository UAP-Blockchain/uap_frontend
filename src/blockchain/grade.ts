import { Contract } from "ethers";
import { getSigner } from "./index";

// Địa chỉ GradeManagement trên Quorum, khớp với backend
export const GRADE_MANAGEMENT_ADDRESS =
  import.meta.env.VITE_GRADE_MANAGEMENT_ADDRESS ||
  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

export const GRADE_MANAGEMENT_ABI = [
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
        name: "gradeId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approvedBy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "approvedAt",
        type: "uint256",
      },
    ],
    name: "GradeApproved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gradeId",
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
      {
        indexed: false,
        internalType: "string",
        name: "componentName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "score",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "gradedBy",
        type: "address",
      },
    ],
    name: "GradeRecorded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gradeId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "oldScore",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newScore",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "updatedBy",
        type: "address",
      },
    ],
    name: "GradeUpdated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "gradeId",
        type: "uint256",
      },
    ],
    name: "approveGrade",
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
    name: "calculateFinalGrade",
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
    name: "classStudentGrades",
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
        name: "gradeId",
        type: "uint256",
      },
    ],
    name: "getGrade",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "gradeId",
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
            internalType: "string",
            name: "componentName",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "score",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxScore",
            type: "uint256",
          },
          {
            internalType: "uint8",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "address",
            name: "gradedBy",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "gradedAt",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "approvedBy",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "approvedAt",
            type: "uint256",
          },
        ],
        internalType: "struct DataTypes.GradeRecord",
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
    name: "getStudentGrades",
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
    inputs: [],
    name: "gradeCount",
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
    name: "gradeRecords",
    outputs: [
      {
        internalType: "uint256",
        name: "gradeId",
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
        internalType: "string",
        name: "componentName",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "score",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxScore",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "gradedBy",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "gradedAt",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "approvedBy",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "approvedAt",
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
        name: "classId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "studentAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "componentName",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "score",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxScore",
        type: "uint256",
      },
    ],
    name: "recordGrade",
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
        name: "gradeId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "newScore",
        type: "uint256",
      },
    ],
    name: "updateGrade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export type GradeManagementContract = Contract & {
  recordGrade: (
    classId: bigint,
    studentAddress: string,
    componentName: string,
    score: bigint,
    maxScore: bigint
  ) => Promise<any>;

  approveGrade: (gradeId: bigint) => Promise<any>;
};

export const getGradeManagementContract = async (): Promise<GradeManagementContract> => {
  const signer = await getSigner();
  return new Contract(
    GRADE_MANAGEMENT_ADDRESS,
    GRADE_MANAGEMENT_ABI,
    signer
  ) as GradeManagementContract;
};
