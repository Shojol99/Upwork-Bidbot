export interface TrainingData {
  id?: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  coverLetter: string;
  tags: string[];
  isWinning: boolean;
  createdAt: number;
}

export interface GeneratedBid {
  id?: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  generatedContent: string;
  status: 'pending' | 'won' | 'lost';
  score: number;
  createdAt: number;
}

export interface BlockedKeyword {
  id?: string;
  userId: string;
  phrase: string;
  createdAt: number;
}

export interface AISettings {
  userId: string;
  tone: string;
  length: string;
  confidence: string;
  ctaStyle: string;
  greetingStyle: string;
  technicalDepth: string;
  persona: string;
}

export type OperationType = 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}
