/**
 * AI Conversation Hooks
 * 
 * Custom hooks para gerenciar conversação com IA
 */

import { 
  useStartAIConversationMutation,
  useContinueAIConversationMutation,
  useAnalyzeAIConversationMutation
} from '../api/studentSpeakingApiSlice';

import type { 
  AIConversationStartRequest,
  AIConversationContinueRequest,
  AIConversationAnalysisRequest,
  ConversationTurn,
  DifficultyLevel
} from '../types';

// Hook para iniciar conversação
export const useStartAIConversation = () => {
  const [startConversation, { isLoading, error, data }] = useStartAIConversationMutation();

  const startNewConversation = async (
    level: DifficultyLevel, 
    topic: string, 
    userProfile?: AIConversationStartRequest['user_profile']
  ) => {
    try {
      const result = await startConversation({
        level,
        topic,
        user_profile: userProfile
      }).unwrap();
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao iniciar conversação:', error);
      throw error;
    }
  };

  return {
    startNewConversation,
    isStarting: isLoading,
    startError: error,
    startData: data
  };
};

// Hook para continuar conversação
export const useContinueAIConversation = () => {
  const [continueConversation, { isLoading, error, data }] = useContinueAIConversationMutation();

  const continueExistingConversation = async (
    sessionId: string,
    level: DifficultyLevel,
    topic: string,
    conversationHistory: ConversationTurn[],
    userInput: string,
    userAudioAnalysis?: AIConversationContinueRequest['user_audio_analysis']
  ) => {
    try {
      const result = await continueConversation({
        session_id: sessionId,
        level,
        topic,
        conversation_history: conversationHistory,
        user_input: userInput,
        user_audio_analysis: userAudioAnalysis
      }).unwrap();
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao continuar conversação:', error);
      throw error;
    }
  };

  return {
    continueExistingConversation,
    isContinuing: isLoading,
    continueError: error,
    continueData: data
  };
};

// Hook para analisar conversação
export const useAnalyzeAIConversation = () => {
  const [analyzeConversation, { isLoading, error, data }] = useAnalyzeAIConversationMutation();

  const analyzeCompleteConversation = async (
    sessionId: string,
    level: DifficultyLevel,
    topic: string,
    conversationHistory: ConversationTurn[]
  ) => {
    try {
      const result = await analyzeConversation({
        session_id: sessionId,
        level,
        topic,
        conversation_history: conversationHistory
      }).unwrap();
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao analisar conversação:', error);
      throw error;
    }
  };

  return {
    analyzeCompleteConversation,
    isAnalyzing: isLoading,
    analysisError: error,
    analysisData: data
  };
};

// Hook combinado para gerenciar toda a conversação
export const useAIConversationManager = () => {
  const {
    startNewConversation,
    isStarting,
    startError
  } = useStartAIConversation();

  const {
    continueExistingConversation,
    isContinuing,
    continueError
  } = useContinueAIConversation();

  const {
    analyzeCompleteConversation,
    isAnalyzing,
    analysisError
  } = useAnalyzeAIConversation();

  return {
    // Métodos
    startNewConversation,
    continueExistingConversation,
    analyzeCompleteConversation,
    
    // Estados
    isStarting,
    isContinuing,
    isAnalyzing,
    isProcessing: isStarting || isContinuing || isAnalyzing,
    
    // Erros
    startError,
    continueError,
    analysisError,
    hasError: Boolean(startError || continueError || analysisError)
  };
};