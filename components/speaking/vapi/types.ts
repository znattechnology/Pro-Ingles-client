/**
 * Types for Vapi Conversation Practice
 */

export interface UserProfile {
  name: string;
  background?: string;
}

export interface VapiConfig {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  domain: 'general' | 'petroleum' | 'IT' | 'business';
  objective: string;
  correction_mode: 'gentle' | 'direct';
  speaking_speed_target: number;
  maxDurationMinutes: number;
  autoEndEnabled: boolean;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  corrections?: any[];
  scores?: {
    fluency: number;
    pronunciation: number;
  };
}

export interface VapiSession {
  id: string;
  userProfile: UserProfile;
  config: VapiConfig;
  messages: ConversationMessage[];
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  assistantId?: string;
}

export type CallStatus = 'idle' | 'connecting' | 'connected' | 'ended' | 'error';
export type MicPermission = 'unknown' | 'granted' | 'denied' | 'checking';
export type BackendStatus = 'unknown' | 'connected' | 'error';
export type BrowserType = 'chrome' | 'firefox' | 'edge' | 'safari' | 'other';
export type Step = 'setup' | 'conversation' | 'summary';

export interface LevelOption {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface DomainOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  objectives: string[];
}

export interface CorrectionModeOption {
  id: string;
  name: string;
  description: string;
}
