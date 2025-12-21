import { Contract } from "ethers";
import { getSigner } from "./index";

// Địa chỉ AttendanceManagement trên Quorum, khớp với appsettings
export const ATTENDANCE_MANAGEMENT_ADDRESS =
  import.meta.env.VITE_ATTENDANCE_MANAGEMENT_ADDRESS ||
  "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

export const ATTENDANCE_MANAGEMENT_ABI = [
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
        name: "recordId",
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
        internalType: "enum DataTypes.AttendanceStatus",
        name: "status",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "address",
        name: "markedBy",
        type: "address",
      },
    ],
    name: "AttendanceMarked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "recordId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum DataTypes.AttendanceStatus",
        name: "oldStatus",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "enum DataTypes.AttendanceStatus",
        name: "newStatus",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "address",
        name: "updatedBy",
        type: "address",
      },
    ],
    name: "AttendanceUpdated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "classAttendanceCount",
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
    name: "classStudentAttendance",
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
        name: "recordId",
        type: "uint256",
      },
    ],
    name: "getAttendanceRecord",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "recordId",
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
            name: "sessionDate",
            type: "uint256",
          },
          {
            internalType: "enum DataTypes.AttendanceStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "string",
            name: "notes",
            type: "string",
          },
          {
            internalType: "address",
            name: "markedBy",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "markedAt",
            type: "uint256",
          },
        ],
        internalType: "struct DataTypes.AttendanceRecord",
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
        name: "",
        type: "uint256",
      },
    ],
    name: "getClassAttendanceRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
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
    name: "getStudentAttendance",
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
        name: "sessionDate",
        type: "uint256",
      },
      {
        internalType: "enum DataTypes.AttendanceStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "notes",
        type: "string",
      },
    ],
    name: "markAttendance",
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
    name: "recordCount",
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
        name: "recordId",
        type: "uint256",
      },
      {
        internalType: "enum DataTypes.AttendanceStatus",
        name: "newStatus",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "notes",
        type: "string",
      },
    ],
    name: "updateAttendance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export async function getAttendanceManagementContract() {
  const signer = await getSigner();
  return new Contract(
    ATTENDANCE_MANAGEMENT_ADDRESS,
    ATTENDANCE_MANAGEMENT_ABI,
    signer
  );
}
