interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'teacher' | 'student';
  action: string; // 'create', 'update', 'delete', 'issue', 'revoke', 'login', 'logout'
  resource: string; // 'student', 'teacher', 'class', 'credential', 'grade', 'attendance'
  resourceId?: string;
  resourceName?: string;
  details: string; // Description of what was done
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    oldValue?: any;
    newValue?: any;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  blockchainHash?: string; // If action was recorded on blockchain
}

interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  service: string; // 'auth', 'blockchain', 'api', 'database'
  details?: any;
  timestamp: string;
  userId?: string;
  requestId?: string;
}

interface AuditReport {
  id: string;
  reportType: 'activity' | 'security' | 'blockchain' | 'performance';
  title: string;
  description?: string;
  dateRange: {
    from: string;
    to: string;
  };
  filters: {
    userId?: string;
    action?: string;
    resource?: string;
    severity?: string;
  };
  data: any; // Report data
  generatedBy: string;
  generatedAt: string;
  fileUrl?: string; // URL to exported file
}

export type { ActivityLog, SystemLog, AuditReport };