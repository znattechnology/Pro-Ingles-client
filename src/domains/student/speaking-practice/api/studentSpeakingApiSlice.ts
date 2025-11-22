/**
 * Student Speaking Practice API Slice
 * RTK Query slice para gerenciar APIs de prática de conversação
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { studentSpeakingPracticeBaseQuery } from '../../../shared/api/baseQuery';
import type { 
  SpeakingExercise, 
  SpeakingSession,
  SpeakingTurn,
  SpeakingProgress,
  SpeakingStats,
  SpeechAnalysis,
  SpeakingSessionCreate,
  SpeakingTurnCreate,
  SpeechAnalysisRequest,
  TTSRequest,
  PaginatedResponse,
  SpeakingExerciseFilters,
  SpeakingSessionFilters
} from '../types';

export const studentSpeakingApiSlice = createApi({
  reducerPath: 'studentSpeakingApi',
  baseQuery: studentSpeakingPracticeBaseQuery,

  tagTypes: [
    'SpeakingExercise', 
    'SpeakingSession', 
    'SpeakingTurn', 
    'SpeakingProgress',
    'SpeakingStats'
  ],

  endpoints: (builder) => ({
    
    // ========================================================================
    // EXERCÍCIOS DE SPEAKING
    // ========================================================================
    
    /**
     * Lista exercícios de speaking com filtros opcionais
     */
    getSpeakingExercises: builder.query<SpeakingExercise[] | PaginatedResponse<SpeakingExercise>, SpeakingExerciseFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        if (filters.course) params.append('course', filters.course);
        
        return `exercises/?${params.toString()}`;
      },
      providesTags: ['SpeakingExercise'],
    }),

    /**
     * Obtém detalhes de um exercício específico
     */
    getSpeakingExercise: builder.query<SpeakingExercise, string>({
      query: (id) => `exercises/${id}/`,
      providesTags: (result, error, id) => [
        { type: 'SpeakingExercise', id },
        'SpeakingExercise'
      ],
    }),

    /**
     * Obtém exercícios para um curso específico
     */
    getCourseSpeakingExercises: builder.query<SpeakingExercise[], string>({
      query: (courseId) => `../courses/${courseId}/speaking/`,
      providesTags: ['SpeakingExercise'],
    }),

    // ========================================================================
    // SESSÕES DE SPEAKING
    // ========================================================================

    /**
     * Lista sessões do usuário com filtros opcionais
     */
    getSpeakingSessions: builder.query<PaginatedResponse<SpeakingSession>, SpeakingSessionFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.exercise_type) params.append('exercise_type', filters.exercise_type);
        
        return `sessions/?${params.toString()}`;
      },
      providesTags: ['SpeakingSession'],
    }),

    /**
     * Obtém detalhes de uma sessão específica
     */
    getSpeakingSession: builder.query<SpeakingSession, string>({
      query: (id) => `sessions/${id}/`,
      providesTags: (result, error, id) => [
        { type: 'SpeakingSession', id },
        'SpeakingSession'
      ],
    }),

    /**
     * Cria nova sessão de speaking practice
     */
    createSpeakingSession: builder.mutation<SpeakingSession, SpeakingSessionCreate>({
      query: (sessionData) => ({
        url: 'sessions/create/',
        method: 'POST',
        body: sessionData,
      }),
      invalidatesTags: ['SpeakingSession'],
    }),

    /**
     * Finaliza uma sessão de speaking
     */
    completeSpeakingSession: builder.mutation<SpeakingSession, string>({
      query: (sessionId) => ({
        url: `sessions/${sessionId}/complete/`,
        method: 'POST',
      }),
      invalidatesTags: ['SpeakingSession', 'SpeakingProgress', 'SpeakingStats'],
    }),

    // ========================================================================
    // TURNOS DE CONVERSAÇÃO
    // ========================================================================

    /**
     * Cria novo turno de speaking (com áudio)
     */
    createSpeakingTurn: builder.mutation<SpeakingTurn, SpeakingTurnCreate>({
      query: (turnData) => {
        const formData = new FormData();
        
        // Adicionar campos obrigatórios
        formData.append('session', turnData.session);
        formData.append('turn_type', turnData.turn_type);
        formData.append('transcribed_text', turnData.transcribed_text);
        
        // Adicionar campos opcionais
        if (turnData.target_text) {
          formData.append('target_text', turnData.target_text);
        }
        if (turnData.audio_file) {
          formData.append('audio_file', turnData.audio_file);
        }
        if (turnData.pronunciation_score !== undefined) {
          formData.append('pronunciation_score', turnData.pronunciation_score.toString());
        }
        if (turnData.fluency_score !== undefined) {
          formData.append('fluency_score', turnData.fluency_score.toString());
        }
        if (turnData.accuracy_score !== undefined) {
          formData.append('accuracy_score', turnData.accuracy_score.toString());
        }
        if (turnData.confidence_score !== undefined) {
          formData.append('confidence_score', turnData.confidence_score.toString());
        }
        if (turnData.duration) {
          formData.append('duration', turnData.duration);
        }

        return {
          url: 'turns/',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, arg) => [
        { type: 'SpeakingSession', id: arg.session },
        'SpeakingSession'
      ],
    }),

    // ========================================================================
    // ANÁLISE DE FALA
    // ========================================================================

    /**
     * Analisa áudio de fala usando OpenAI
     */
    analyzeSpeech: builder.mutation<SpeechAnalysis, SpeechAnalysisRequest>({
      query: (analysisData) => {
        const formData = new FormData();
        formData.append('audio_file', analysisData.audio_file);
        
        if (analysisData.target_text) {
          formData.append('target_text', analysisData.target_text);
        }

        return {
          url: 'analyze/',
          method: 'POST',
          body: formData,
        };
      },
      // Não invalidar tags pois é análise pontual
    }),

    // ========================================================================
    // AI CONVERSATION - Conversação com IA em tempo real
    // ========================================================================

    /**
     * Inicia nova conversação com IA
     */
    startAIConversation: builder.mutation<AIConversationStartResponse, AIConversationStartRequest>({
      query: (conversationData) => ({
        url: 'conversation/start/',
        method: 'POST',
        body: conversationData,
      }),
      invalidatesTags: ['SpeakingSession'],
    }),

    /**
     * Continua conversação existente
     */
    continueAIConversation: builder.mutation<AIConversationContinueResponse, AIConversationContinueRequest>({
      query: (conversationData) => ({
        url: 'conversation/continue/',
        method: 'POST',
        body: conversationData,
      }),
      invalidatesTags: ['SpeakingSession'],
    }),

    /**
     * Analisa conversação completa
     */
    analyzeAIConversation: builder.mutation<AIConversationAnalysisResponse, AIConversationAnalysisRequest>({
      query: (analysisData) => ({
        url: 'conversation/analyze/',
        method: 'POST',
        body: analysisData,
      }),
      invalidatesTags: ['SpeakingSession'],
    }),

    // ========================================================================
    // PROGRESSO E ESTATÍSTICAS
    // ========================================================================

    /**
     * Obtém progresso de speaking do usuário
     */
    getSpeakingProgress: builder.query<SpeakingProgress, void>({
      query: () => 'progress/',
      providesTags: ['SpeakingProgress'],
    }),

    /**
     * Obtém estatísticas do dashboard de speaking
     */
    getSpeakingStats: builder.query<SpeakingStats, void>({
      query: () => 'dashboard/',
      providesTags: ['SpeakingStats'],
    }),

    // ========================================================================
    // TEXT-TO-SPEECH
    // ========================================================================

    /**
     * Gera áudio TTS para texto
     */
    generateTTS: builder.mutation<Blob, TTSRequest>({
      query: (ttsData) => ({
        url: 'tts/',
        method: 'POST',
        body: ttsData,
        responseHandler: (response) => response.blob(),
      }),
      // Não invalidar tags pois é geração pontual
    }),

    // ========================================================================
    // EXERCÍCIOS POR CURSO
    // ========================================================================

    /**
     * Obtém progresso de speaking para um curso específico
     */
    getCourseSpeakingProgress: builder.query<SpeakingProgress, string>({
      query: (courseId) => `../courses/${courseId}/progress/`,
      providesTags: ['SpeakingProgress'],
    }),

  }),
});

// Export hooks gerados automaticamente
export const {
  // Exercícios
  useGetSpeakingExercisesQuery,
  useGetSpeakingExerciseQuery,
  useGetCourseSpeakingExercisesQuery,
  
  // Sessões
  useGetSpeakingSessionsQuery,
  useGetSpeakingSessionQuery,
  useCreateSpeakingSessionMutation,
  useCompleteSpeakingSessionMutation,
  
  // Turnos
  useCreateSpeakingTurnMutation,
  
  // Análise
  useAnalyzeSpeechMutation,
  
  // AI Conversation
  useStartAIConversationMutation,
  useContinueAIConversationMutation,
  useAnalyzeAIConversationMutation,
  
  // Progresso
  useGetSpeakingProgressQuery,
  useGetSpeakingStatsQuery,
  useGetCourseSpeakingProgressQuery,
  
  // TTS
  useGenerateTTSMutation,
} = studentSpeakingApiSlice;

export default studentSpeakingApiSlice;