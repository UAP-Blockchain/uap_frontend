interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'student';
  status: 'active' | 'inactive' | 'suspended' | 'locked';
  mfaEnabled: boolean;
  mfaSecret?: string;
  lastLogin?: string;
  loginAttempts: number;
  lockoutUntil?: string;
  passwordChangedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginSession {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  loginTime: string;
  lastActivity: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'terminated';
  mfaVerified: boolean;
}

interface SecuritySettings {
  id: string;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number; // days
    preventReuse: number; // number of previous passwords
  };
  sessionPolicy: {
    maxDuration: number; // minutes
    inactivityTimeout: number; // minutes
    maxConcurrentSessions: number;
  };
  mfaPolicy: {
    required: boolean;
    allowedMethods: ('totp' | 'sms' | 'email')[];
    backupCodes: boolean;
  };
  loginPolicy: {
    maxAttempts: number;
    lockoutDuration: number; // minutes
    captchaThreshold: number;
  };
  auditPolicy: {
    retentionPeriod: number; // days
    logLevel: 'basic' | 'detailed' | 'verbose';
    realTimeAlerts: boolean;
  };
  updatedBy: string;
  updatedAt: string;
}

interface SecurityAlert {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'data_breach' | 'system_error' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  metadata?: any;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type { User, LoginSession, SecuritySettings, SecurityAlert };