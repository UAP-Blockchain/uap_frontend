import api from "../../../config/axios";
import type {
  ActionLogDto,
  ActionLogFilter,
  ActionLogResponse,
  ActionLogStats,
} from "../../../types/ActionLog";

// Backend DTO types (backend returns camelCase after JSON serialization)
interface BackendActionLogDto {
  id: string;
  createdAt: string;
  action: string;
  detail: string | null;
  userId: string;
  userFullName: string | null;
  userEmail: string | null;
  credentialId: string | null;
}

interface BackendPagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

// Helper function to map backend DTO to frontend DTO
function mapBackendToFrontend(backend: BackendActionLogDto): ActionLogDto {
  return {
    id: backend.id,
    createdAt: backend.createdAt,
    action: backend.action,
    detail: backend.detail || "",
    userId: backend.userId,
    userName: backend.userFullName || undefined,
    userEmail: backend.userEmail || undefined,
    userRole: undefined, // Backend doesn't provide this yet
    credentialId: backend.credentialId || undefined,
    // Blockchain fields - backend DTO doesn't have these yet
    transactionHash: undefined,
    blockNumber: undefined,
    eventName: undefined,
    txFrom: undefined,
    txTo: undefined,
    contractAddress: undefined,
  };
}

// Mock data generator - chỉ dùng cho stats và getById (backend chưa có endpoints)
const generateMockActionLogs = (count: number = 50): ActionLogDto[] => {
  const actions = [
    "ISSUE_CREDENTIAL",
    "SUBMIT_GRADE",
    "UPDATE_GRADE",
    "DELETE_GRADE",
    "USER_LOGIN",
    "USER_LOGOUT",
    "USER_CREATED",
    "PASSWORD_RESET",
    "CREATE_CLASS",
    "UPDATE_SCHEDULE",
    "CANCEL_SLOT",
    "VERIFY_CREDENTIAL",
    "REVOKE_CREDENTIAL",
    "BLOCKCHAIN_STORE",
  ];

  const roles = ["Admin", "Teacher", "Student"];
  const users = [
    { name: "Admin User", email: "admin@fap.edu.vn", role: "Admin" },
    { name: "Teacher 1", email: "teacher1@fap.edu.vn", role: "Teacher" },
    { name: "Teacher 2", email: "teacher2@fap.edu.vn", role: "Teacher" },
    { name: "Student 1", email: "student1@fap.edu.vn", role: "Student" },
    { name: "Student 2", email: "student2@fap.edu.vn", role: "Student" },
    { name: "Student 3", email: "student3@fap.edu.vn", role: "Student" },
  ];

  const logs: ActionLogDto[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const createdAt = new Date(
      now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000
    );

    const hasBlockchain =
      action.includes("CREDENTIAL") || action.includes("BLOCKCHAIN");

    let detail: any = {};
    if (action === "ISSUE_CREDENTIAL") {
      detail = {
        CredentialId: `CRED-2025${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`,
        StudentId: `student-${Math.floor(Math.random() * 10) + 1}`,
        TemplateId: `template-${Math.floor(Math.random() * 5) + 1}`,
        IssuedDate: createdAt.toISOString(),
      };
    } else if (action === "SUBMIT_GRADE" || action === "UPDATE_GRADE") {
      detail = {
        StudentId: `student-${Math.floor(Math.random() * 10) + 1}`,
        SubjectId: `subject-${Math.floor(Math.random() * 20) + 1}`,
        ComponentId: `component-${Math.floor(Math.random() * 5) + 1}`,
        Score: (Math.random() * 4 + 6).toFixed(1),
        LetterGrade: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)],
      };
      if (action === "UPDATE_GRADE") {
        detail.OldScore = (parseFloat(detail.Score) - 0.5).toFixed(1);
        detail.NewScore = detail.Score;
        detail.Reason = "Score correction after review";
      }
    } else if (action === "USER_LOGIN") {
      detail = {
        Email: user.email,
        Role: user.role,
        IPAddress: `192.168.1.${Math.floor(Math.random() * 255) + 1}`,
        UserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      };
    } else if (action === "CREATE_CLASS") {
      detail = {
        ClassCode: `PRF192.W25.${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
        SubjectName: "Programming Fundamentals",
        MaxEnrollment: Math.floor(Math.random() * 20 + 30),
        TeacherUserId: `teacher-${Math.floor(Math.random() * 5) + 1}`,
      };
    } else {
      detail = {
        Action: action,
        Timestamp: createdAt.toISOString(),
      };
    }

    logs.push({
      id: `log-${i + 1}`,
      createdAt: createdAt.toISOString(),
      action,
      detail: JSON.stringify(detail),
      userId: `user-${Math.floor(Math.random() * 10) + 1}`,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      ...(hasBlockchain && Math.random() > 0.5
        ? {
            transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
            blockNumber: Math.floor(Math.random() * 100000) + 10000,
            eventName: action.replace("_", ""),
            txFrom: `0x${Math.random().toString(16).substring(2, 42)}`,
            txTo: `0x${Math.random().toString(16).substring(2, 42)}`,
            contractAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
          }
        : {}),
      ...(action.includes("CREDENTIAL")
        ? { credentialId: `credential-${Math.floor(Math.random() * 10) + 1}` }
        : {}),
    });
  }

  return logs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// Mock data
let mockLogs: ActionLogDto[] = generateMockActionLogs(100);

/**
 * Fetch action logs with filters
 * Calls real backend API: GET /api/action-logs
 */
export const fetchActionLogsApi = async (
  filter: ActionLogFilter = {}
): Promise<ActionLogResponse> => {
  try {
    // Map frontend filter to backend query params
    const params: any = {
      Page: filter.page || 1,
      PageSize: filter.pageSize || 20,
    };

    if (filter.searchText) {
      params.SearchTerm = filter.searchText;
    }

    if (filter.action && filter.action !== "all") {
      params.Action = filter.action;
    }

    if (filter.dateFrom) {
      params.From = new Date(filter.dateFrom).toISOString();
    }

    if (filter.dateTo) {
      params.To = new Date(filter.dateTo).toISOString();
    }

    if (filter.userId) {
      params.UserId = filter.userId;
    }

    // Note: hasBlockchain filter not supported by backend yet
    // Will be filtered on frontend if needed

    const response = await api.get<BackendPagedResult<BackendActionLogDto>>(
      "/action-logs",
      { params }
    );

    // Backend returns camelCase, map to frontend format
    // Map userFullName to userName
    const mappedItems = (response.data.items || []).map((item: BackendActionLogDto) =>
      mapBackendToFrontend(item)
    );

    return {
      items: mappedItems,
      totalCount: response.data.totalCount || 0,
      page: response.data.page || 1,
      pageSize: response.data.pageSize || 20,
    };
  } catch (error) {
    console.error("Error fetching action logs:", error);
    throw error;
  }
};

/**
 * Get action log statistics
 * TODO: Backend doesn't have stats endpoint yet - using mock data
 * When backend adds GET /api/action-logs/stats, replace this implementation
 */
export const getActionLogStatsApi = async (): Promise<ActionLogStats> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // TODO: Replace with real API call when backend endpoint is available
  // const response = await api.get<ActionLogStats>("/action-logs/stats");
  // return response.data;

  // Mock implementation - calculate from fetched logs if available
  // For now, use mock data
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayLogs = mockLogs.filter(
    (log) => new Date(log.createdAt) >= today
  );

  const blockchainLogs = mockLogs.filter(
    (log) => !!log.transactionHash || !!log.blockNumber
  );

  // Count actions
  const actionCounts: Record<string, number> = {};
  mockLogs.forEach((log) => {
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
  });

  const topActions = Object.entries(actionCounts)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total: mockLogs.length,
    today: todayLogs.length,
    blockchainTransactions: blockchainLogs.length,
    topActions,
  };
};

/**
 * Get action log by ID
 * TODO: Backend doesn't have get by ID endpoint yet
 * Option 1: Use data from list if available (recommended)
 * Option 2: Keep mock until backend adds GET /api/action-logs/{id}
 */
export const getActionLogByIdApi = async (
  id: string
): Promise<ActionLogDto> => {
  // TODO: Replace with real API call when backend endpoint is available
  // const response = await api.get<BackendActionLogDto>(`/action-logs/${id}`);
  // return mapBackendToFrontend(response.data);

  // Mock implementation - use mock data for now
  await new Promise((resolve) => setTimeout(resolve, 200));

  const log = mockLogs.find((l) => l.id === id);
  if (!log) {
    throw new Error("Action log not found");
  }

  return log;
};

