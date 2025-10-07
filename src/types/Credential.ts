interface Credential {
  id: string;
  credentialType: 'degree' | 'certificate' | 'transcript' | 'achievement';
  title: string;
  description?: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  issuerId: string; // Admin/Teacher who issued
  issuerName: string;
  issueDate: string;
  expiryDate?: string;
  status: 'active' | 'revoked' | 'expired';
  blockchainHash?: string; // Hash on blockchain
  transactionHash?: string; // Blockchain transaction hash
  ipfsHash?: string; // IPFS hash for document storage
  metadata: {
    gpa?: number;
    credits?: number;
    grade?: string;
    course?: string;
    classId?: string;
    className?: string;
    academicYear?: string;
    semester?: string;
  };
  verificationUrl?: string; // Public verification URL
  qrCode?: string; // QR code for verification
  createdAt: string;
  updatedAt: string;
  revokedAt?: string;
  revokedBy?: string;
  revokedReason?: string;
}

interface CredentialFormData {
  credentialType: 'degree' | 'certificate' | 'transcript' | 'achievement';
  title: string;
  description?: string;
  studentId: string;
  expiryDate?: Date;
  metadata: {
    gpa?: number;
    credits?: number;
    grade?: string;
    course?: string;
    classId?: string;
    academicYear?: string;
    semester?: string;
  };
}

interface CredentialStats {
  total: number;
  active: number;
  revoked: number;
  expired: number;
  thisMonth: number;
  byType: {
    degree: number;
    certificate: number;
    transcript: number;
    achievement: number;
  };
}

export type { Credential, CredentialFormData, CredentialStats };