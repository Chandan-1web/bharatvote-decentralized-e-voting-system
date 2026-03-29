
export enum VotingStep {
  LOGIN = 'LOGIN',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  CHOOSE_LOCATION = 'CHOOSE_LOCATION',
  AADHAR_VERIFICATION = 'AADHAR_VERIFICATION',
  VOTER_ID_VERIFICATION = 'VOTER_ID_VERIFICATION',
  FACE_RECOGNITION = 'FACE_RECOGNITION',
  VOTING_BOOTH = 'VOTING_BOOTH',
  CONFIRMATION = 'CONFIRMATION',
  BLOCKCHAIN_LEDGER = 'BLOCKCHAIN_LEDGER',
  LOCATION_REJECTED = 'LOCATION_REJECTED'
}

export type Language = 'en' | 'hi' | 'kn';

export interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol: string;
  color: string;
  logo: string;
  description: string;
}

export interface Block {
  index: number;
  timestamp: number;
  vote: string; // Candidate ID
  previousHash: string;
  hash: string;
  nonce: number;
  integrityScore: number;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  extractedData?: any;
}

export interface UserState {
  isLoggedIn: boolean;
  email?: string;
  voterName?: string;
  voterId?: string;
  aadharNumber?: string;
  voterLocation?: string;
  selectedLocation?: string;
  isVerified: boolean;
  hasVoted: boolean;
  language: Language;
}
