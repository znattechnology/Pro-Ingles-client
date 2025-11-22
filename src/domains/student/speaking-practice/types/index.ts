/**
 * Speaking Practice Types
 * Tipos para sistema de prática de conversação com IA
 */

// Tipos base para exercícios
export type ExerciseType = 
  | 'PRONUNCIATION'
  | 'CONVERSATION'
  | 'READING_ALOUD'
  | 'ROLE_PLAY'
  | 'STORY_TELLING'
  | 'VOCABULARY_PRACTICE';

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type SessionStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ABANDONED';

export type TurnType = 'USER_SPEECH' | 'AI_RESPONSE' | 'SYSTEM_PROMPT';

// Interface para exercício de speaking
export interface SpeakingExercise {
  id: string;
  title: string;
  description: string;
  exercise_type: ExerciseType;
  exercise_type_display: string;
  difficulty: DifficultyLevel;
  difficulty_display: string;
  target_text: string;
  conversation_prompt: string;
  vocabulary_words: string[];
  pronunciation_weight: number;
  fluency_weight: number;
  accuracy_weight: number;
  points_reward: number;
  hearts_cost: number;
  minimum_score: number;
  is_active: boolean;
  course_title?: string;
  practice_lesson_title?: string;
  created_at: string;
}

// Interface para análise de fala
export interface SpeechAnalysis {
  overall_score: number;
  pronunciation_score: number;
  fluency_score: number;
  accuracy_score: number;
  confidence_score: number;
  transcribed_text: string;
  target_text: string;
  word_analysis: WordAnalysis[];
  phoneme_analysis: PhonemeAnalysis[];
  grammar_errors: GrammarError[];
  feedback_text: string;
  improvement_suggestions: string[];
  next_exercises: string[];
}

// Interface para análise de palavra
export interface WordAnalysis {
  word: string;
  spoken: string;
  accuracy: number;
  phonetic_errors: string[];
}

// Interface para análise de fonema
export interface PhonemeAnalysis {
  phoneme: string;
  accuracy: number;
  position: number;
  suggestions: string[];
}

// Interface para erro gramatical
export interface GrammarError {
  error_type: string;
  message: string;
  suggestion: string;
  position?: number;
}

// Interface para turno de conversação
export interface SpeakingTurn {
  id: string;
  turn_number: number;
  turn_type: TurnType;
  turn_type_display: string;
  timestamp: string;
  audio_url?: string;
  transcribed_text: string;
  target_text?: string;
  ai_response_text?: string;
  pronunciation_score?: number;
  fluency_score?: number;
  accuracy_score?: number;
  confidence_score?: number;
  words_analysis?: WordAnalysis[];
  pronunciation_errors?: string[];
  grammar_errors?: GrammarError[];
  duration?: string;
  duration_seconds?: number;
}

// Interface para sessão de speaking
export interface SpeakingSession {
  id: string;
  exercise: SpeakingExercise;
  status: SessionStatus;
  status_display: string;
  started_at: string;
  completed_at?: string;
  total_duration?: string;
  total_duration_minutes?: number;
  turns_count: number;
  overall_score?: number;
  pronunciation_score?: number;
  fluency_score?: number;
  accuracy_score?: number;
  points_earned?: number;
  hearts_used?: number;
  is_passed?: boolean;
  ai_feedback?: string;
  improvement_suggestions?: string[];
  turns: SpeakingTurn[];
}

// Interface para criação de sessão
export interface SpeakingSessionCreate {
  exercise: string; // UUID do exercício
}

// Interface para criação de turno
export interface SpeakingTurnCreate {
  session: string; // UUID da sessão
  turn_type: TurnType;
  transcribed_text: string;
  target_text?: string;
  audio_file?: File;
  pronunciation_score?: number;
  fluency_score?: number;
  accuracy_score?: number;
  confidence_score?: number;
  words_analysis?: WordAnalysis[];
  pronunciation_errors?: string[];
  grammar_errors?: GrammarError[];
  duration?: string;
}

// Interface para progresso de speaking
export interface SpeakingProgress {
  user: string;
  total_sessions: number;
  total_hours_practiced: number;
  total_words_spoken: number;
  average_pronunciation: number;
  average_fluency: number;
  average_accuracy: number;
  overall_average: number;
  beginner_sessions: number;
  intermediate_sessions: number;
  advanced_sessions: number;
  current_streak: number;
  longest_streak: number;
  weak_phonemes: string[];
  strong_areas: string[];
  practice_recommendations: string[];
  last_session_date?: string;
  created_at: string;
  updated_at: string;
}

// Interface para estatísticas de speaking
export interface SpeakingStats {
  total_sessions: number;
  total_practice_time: string;
  average_score: number;
  sessions_this_week: number;
  sessions_this_month: number;
  improvement_trend: 'up' | 'down' | 'stable';
  favorite_exercise_type: ExerciseType;
  strongest_skill: 'pronunciation' | 'fluency' | 'accuracy' | 'confidence';
  areas_for_improvement: string[];
}

// Interface para análise de fala (requisição)
export interface SpeechAnalysisRequest {
  audio_file: File;
  target_text?: string;
}

// Interface para TTS (Text-to-Speech)
export interface TTSRequest {
  text: string;
  voice?: string;
}

// Interface para resposta de lista paginada
export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Interface para filtros de exercícios
export interface SpeakingExerciseFilters {
  type?: ExerciseType;
  difficulty?: DifficultyLevel;
  course?: string;
}

// Interface para filtros de sessões
export interface SpeakingSessionFilters {
  status?: SessionStatus;
  exercise_type?: ExerciseType;
}

// Estados para hooks
export interface SpeakingSessionState {
  currentSession: SpeakingSession | null;
  isRecording: boolean;
  isProcessing: boolean;
  isSessionActive: boolean;
  sessionStats: {
    messagesExchanged: number;
    averageScore: number;
    timeSpent: number;
    heartsUsed: number;
  };
  currentHearts: number;
}

// Configurações de speaking practice
export interface SpeakingPracticeConfig {
  maxRecordingDuration: number;
  minScore: number;
  maxHearts: number;
  autoSaveProgress: boolean;
  enableRealTimeFeedback: boolean;
}

// ========================================================================
// AI CONVERSATION TYPES - Conversação com IA
// ========================================================================

// Tipos para conversação com IA
export interface AIConversationStartRequest {
  level: DifficultyLevel;
  topic: string;
  user_profile?: {
    name?: string;
    background?: string;
    interests?: string[];
    goals?: string[];
  };
  conversation_config?: {
    max_duration_minutes?: number;
    auto_end_enabled?: boolean;
    voice_preference?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    enable_final_summary?: boolean;
    enable_detailed_evaluation?: boolean;
  };
}

export interface AIConversationStartResponse {
  session_id: string;
  ai_message: {
    content: string;
    audio_url?: string;
    metadata: {
      turn_number: number;
      target_turns: number;
      topic: string;
      level: string;
      tokens_used: number;
    };
  };
  session_config: {
    level: string;
    topic: string;
    target_turns: number;
    conversation_style: string;
  };
}

export interface AIConversationContinueRequest {
  session_id: string;
  level: DifficultyLevel;
  topic: string;
  conversation_history: {
    speaker: 'user' | 'ai';
    content: string;
    timestamp: string;
  }[];
  user_input: string;
  user_audio_analysis?: {
    pronunciation_score: number;
    fluency_score: number;
    accuracy_score: number;
    confidence_score: number;
  };
}

export interface AIConversationContinueResponse {
  session_id: string;
  ai_message: {
    content: string;
    audio_url?: string;
    metadata: {
      turn_number: number;
      target_turns: number;
      topic: string;
      level: string;
      tokens_used: number;
    };
  };
  conversation_progress: {
    current_turn: number;
    target_turns: number;
    progress_percentage: number;
  };
}

export interface AIConversationAnalysisRequest {
  session_id: string;
  level: DifficultyLevel;
  topic: string;
  conversation_history: ConversationTurn[];
}

export interface AIConversationAnalysisResponse {
  session_id: string;
  analysis: {
    overall_score: number;
    pronunciation_avg: number;
    fluency_avg: number;
    vocabulary_diversity: number;
    grammar_accuracy: number;
    conversation_flow: number;
    total_turns: number;
    target_turns: number;
    ai_analysis: string;
    next_level_ready: boolean;
    level_completed: string;
    topic_completed: string;
    // Novos campos para avaliação detalhada
    listening_comprehension: number;
    response_appropriateness: number;
    engagement_level: number;
    confidence_progression: number;
    cultural_awareness: number;
  };
  session_summary: {
    level: string;
    topic: string;
    total_turns: number;
    target_turns: number;
    completion_rate: number;
    duration_minutes: number;
    user_name?: string;
    conversation_highlights: string[];
    topics_covered: string[];
  };
  detailed_feedback: {
    strengths: string[];
    areas_for_improvement: string[];
    specific_recommendations: string[];
    conversation_flow_analysis: string;
    vocabulary_usage_feedback: string;
    pronunciation_insights: string;
    progress_indicators: {
      compared_to_level: string;
      improvement_areas: string[];
      celebration_points: string[];
    };
  };
  conversation_transcript?: {
    speaker: 'user' | 'ai';
    content: string;
    timestamp: string;
    analysis_notes?: string;
  }[];
}

// Tipo para turns de conversação com IA
export interface ConversationTurn {
  id: string;
  speaker: 'user' | 'ai';
  content: string;
  audioUrl?: string;
  timestamp: Date;
  analysis?: {
    pronunciation_score: number;
    fluency_score: number;
    vocabulary_usage: number;
    grammar_accuracy: number;
  };
}

// All types are already exported above as individual exports