export interface ActionLogDto {
  id: string;
  createdAt: string;
  action: string; // ISSUE_CREDENTIAL, SUBMIT_GRADE, USER_LOGIN, etc.
  detail: string; // JSON string
  transactionHash?: string;
  blockNumber?: number;
  eventName?: string;
  txFrom?: string;
  txTo?: string;
  contractAddress?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  credentialId?: string;
}

export interface ActionLogFilter {
  action?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  hasBlockchain?: boolean;
  searchText?: string;
  page?: number;
  pageSize?: number;
}

export interface ActionLogStats {
  total: number;
  today: number;
  blockchainTransactions: number;
  topActions: Array<{
    action: string;
    count: number;
  }>;
}

export interface ActionLogResponse {
  items: ActionLogDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

