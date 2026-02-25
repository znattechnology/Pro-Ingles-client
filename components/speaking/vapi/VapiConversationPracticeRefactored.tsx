'use client';

/**
 * Vapi Conversation Practice - Refactored Version
 *
 * This is the refactored version of VapiConversationPractice using
 * modular hooks and components for better maintainability.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/course/Loading';
import { useGetProfileQuery } from '@/src/domains/auth/services/authApi';
import {
  ArrowLeft,
  Mic,
  MicOff,
  Activity,
  AlertTriangle,
  MessageCircle,
} from 'lucide-react';

// Local imports from vapi module
import type { UserProfile, VapiConfig, Step } from './types';
import { DEFAULT_CONFIG } from './constants';
import {
  useVapiSDK,
  useMicrophonePermission,
  useBackendAPI,
  useSessionTimer,
  useSessionRecovery,
  useVapiCall,
} from './hooks';
import {
  LoadingOverlay,
  ErrorState,
  MicPermissionDialog,
  UserProfileCard,
  LevelSelector,
  DomainSelector,
  ConfigCard,
  RecoveryDialog,
  ConnectionStatus,
  ConversationHeader,
  SpeakingIndicator,
  MessagePanel,
  SessionSidebar,
} from './components';
import { vapiLogger } from './utils';

export default function VapiConversationPracticeRefactored() {
  const router = useRouter();
  const { data: loggedInUser } = useGetProfileQuery();

  // UI State
  const [step, setStep] = useState<Step>('setup');

  // User configuration
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    background: '',
  });

  const [config, setConfig] = useState<VapiConfig>(DEFAULT_CONFIG);

  // Initialize hooks
  const { isLoaded: isVapiLoaded, VapiClass } = useVapiSDK();

  const {
    permission: micPermission,
    showDialog: showMicDialog,
    showDeniedAlert: showMicDeniedAlert,
    browserType,
    check: checkMicPermission,
    request: requestMicPermission,
    setShowDeniedAlert: setShowMicDeniedAlert,
  } = useMicrophonePermission();

  const backendAPI = useBackendAPI(config, userProfile);

  const timer = useSessionTimer(
    config.maxDurationMinutes,
    config.autoEndEnabled,
    () => {
      // Auto-end when time is up
      vapiLogger.info('Time limit reached, ending call');
      handleEndCall();
    }
  );

  const sessionRecovery = useSessionRecovery();

  // Main call hook
  const vapiCall = useVapiCall(config, userProfile, {
    VapiClass,
    sdkLoaded: isVapiLoaded,
    micGranted: micPermission === 'granted',
    checkBackendStatus: backendAPI.checkStatus,
    createAssistant: backendAPI.createAssistant,
    startSession: backendAPI.startSession,
    saveSessionToStorage: sessionRecovery.saveSession,
    updateMessagesInStorage: sessionRecovery.updateMessages,
    requestMicPermission,
    onCallStart: () => {
      vapiLogger.info('Call started');
      timer.start();
      setStep('conversation');
    },
    onCallEnd: () => {
      vapiLogger.info('Call ended');
      timer.stop();
    },
    onError: (error) => {
      vapiLogger.error('Call error', { data: { error } });
    },
  });

  // Auto-fill user name from logged-in profile
  useEffect(() => {
    if (loggedInUser?.name && !userProfile.name) {
      vapiLogger.debug('Auto-filling user name from profile');
      setUserProfile((prev) => ({
        ...prev,
        name: loggedInUser.name,
      }));
    }
  }, [loggedInUser, userProfile.name]);

  // Check backend status on mount
  useEffect(() => {
    backendAPI.checkStatus();
    checkMicPermission();
  }, []);

  // Handle start call
  const handleStartCall = useCallback(async () => {
    vapiLogger.info('Starting call');
    await vapiCall.start();
  }, [vapiCall]);

  // Handle end call
  const handleEndCall = useCallback(async () => {
    vapiLogger.info('Ending call');
    await vapiCall.end();

    // Get messages from storage (more reliable than state due to closures)
    const storedSessionId = sessionRecovery.getStoredSessionId();
    const storedMessages = sessionRecovery.getStoredMessages();

    // Debug logging
    console.log('[END_CALL] Session ID from storage:', storedSessionId);
    console.log('[END_CALL] Messages from storage:', storedMessages);
    console.log('[END_CALL] Messages from vapiCall.messages:', vapiCall.messages);

    // Use messages from vapiCall if storage is empty
    const messagesToAnalyze = storedMessages.length > 0 ? storedMessages : vapiCall.messages;
    console.log('[END_CALL] Messages to analyze:', messagesToAnalyze);

    if (storedSessionId) {
      // Send batch analysis with elapsed time
      const success = await backendAPI.sendBatchAnalysis(storedSessionId, messagesToAnalyze, timer.elapsed);

      if (success) {
        vapiLogger.info('Batch analysis successful, redirecting to summary');
        sessionRecovery.clearStorage();

        const summaryUrl = `/user/laboratory/speaking/summary/${storedSessionId}`;
        router.push(summaryUrl);
      } else {
        vapiLogger.error('Batch analysis failed');
        // Keep data in storage for retry
      }
    } else {
      vapiLogger.warn('No session ID found');
      router.push('/user/laboratory/speaking/real-time');
    }
  }, [vapiCall, sessionRecovery, backendAPI, router]);

  // Handle session recovery
  const handleRecoverSession = useCallback(() => {
    const recovered = sessionRecovery.recover();
    if (recovered) {
      vapiLogger.info('Recovering session', { data: { sessionId: recovered.sessionId } });
      setUserProfile(recovered.userProfile);
      if (recovered.config) {
        setConfig((prev) => ({ ...prev, ...recovered.config }));
      }
      vapiCall.setMessages(recovered.messages);
    }
  }, [sessionRecovery, vapiCall]);

  const handleDiscardSession = useCallback(() => {
    vapiLogger.info('Discarding saved session');
    sessionRecovery.discard();
  }, [sessionRecovery]);

  // Handle config changes
  const handleConfigChange = useCallback((updates: Partial<VapiConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render Setup Step
  const renderSetupStep = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Recovery Dialog */}
      <RecoveryDialog
        show={sessionRecovery.showDialog}
        sessionData={sessionRecovery.savedData}
        onRecover={handleRecoverSession}
        onDiscard={handleDiscardSession}
      />

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">
          Pratica de Conversacao com Tutor de IA
        </h1>
        <p className="text-xl text-gray-300">
          Configure sua sessao personalizada de pratica conversacional
        </p>
        {!isVapiLoaded && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
            <p className="text-yellow-400">Preparando Tutor de IA...</p>
          </div>
        )}
      </div>

      {/* User Profile */}
      <UserProfileCard userProfile={userProfile} onChange={setUserProfile} />

      {/* Level Selection */}
      <LevelSelector
        level={config.level}
        onChange={(level) => handleConfigChange({ level })}
      />

      {/* Domain Selection */}
      <DomainSelector
        domain={config.domain}
        objective={config.objective}
        onDomainChange={(domain) => handleConfigChange({ domain, objective: '' })}
        onObjectiveChange={(objective) => handleConfigChange({ objective })}
      />

      {/* Configuration */}
      <ConfigCard config={config} onChange={handleConfigChange} />

      {/* Connection Status */}
      <ConnectionStatus
        isVapiLoaded={isVapiLoaded}
        backendStatus={backendAPI.status}
        micPermission={micPermission}
        onRequestMicPermission={requestMicPermission}
      />

      {/* Microphone Dialog */}
      {showMicDialog && (
        <MicPermissionDialog
          show={showMicDialog}
          permission={micPermission}
          browserType={browserType}
        />
      )}

      {/* Microphone Denied Alert */}
      {showMicDeniedAlert && (
        <MicPermissionDialog
          show={showMicDeniedAlert}
          permission="denied"
          browserType={browserType}
          onCheckAgain={() => {
            setShowMicDeniedAlert(false);
            checkMicPermission();
          }}
          onClose={() => setShowMicDeniedAlert(false)}
        />
      )}

      {/* Start Button */}
      <div className="text-center">
        <Button
          onClick={handleStartCall}
          disabled={
            !isVapiLoaded ||
            !userProfile.name ||
            !config.objective ||
            backendAPI.status !== 'connected' ||
            vapiCall.status === 'connecting' ||
            vapiCall.status === 'connected' ||
            vapiCall.isCallActive ||
            micPermission === 'denied'
          }
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
        >
          {vapiCall.status === 'connecting' ? (
            <>
              <Activity className="w-5 h-5 animate-spin" />
              Conectando...
            </>
          ) : micPermission === 'denied' ? (
            <>
              <MicOff className="w-5 h-5" />
              Microfone Bloqueado
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Iniciar Conversa
            </>
          )}
        </Button>

        <p className="text-sm text-gray-400 mt-2">
          {micPermission === 'granted' ? (
            <>A conversa sera gravada e analisada para fornecer feedback detalhado</>
          ) : micPermission === 'denied' ? (
            <span className="text-red-400 flex items-center justify-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Habilite o microfone para iniciar a conversa
            </span>
          ) : (
            <>Voce sera solicitado a permitir o acesso ao microfone</>
          )}
        </p>
      </div>
    </div>
  );

  // Render Conversation Step
  const renderConversationStep = () => {
    // Processing state
    if (backendAPI.isProcessing) {
      return (
        <LoadingOverlay
          title="Processando sua sessao..."
          description="Estamos analisando sua conversa e gerando o feedback personalizado. Isso pode levar alguns segundos."
        />
      );
    }

    // Error state
    if (backendAPI.error) {
      return (
        <ErrorState
          title="Erro ao processar sessao"
          message={backendAPI.error}
          onRetry={() => {
            backendAPI.clearError();
            handleEndCall();
          }}
          onBack={() => {
            backendAPI.clearError();
            setStep('setup');
            vapiCall.setMessages([]);
          }}
        />
      );
    }

    // Call error state
    if (vapiCall.status === 'error') {
      return (
        <ErrorState
          title="Erro ao iniciar conversa"
          message={vapiCall.connectionStep || 'Nao foi possivel conectar ao Tutor de IA.'}
          onRetry={() => {
            setStep('setup');
          }}
          onBack={() => router.push('/user/laboratory')}
          backLabel="Voltar ao Laboratorio"
        />
      );
    }

    return (
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <ConversationHeader
          formattedTime={timer.formattedTime}
          maxDurationFormatted={formatTime(config.maxDurationMinutes * 60)}
          progress={timer.progress}
          callStatus={vapiCall.status}
          isUserSpeaking={vapiCall.isUserSpeaking}
          isAISpeaking={vapiCall.isAISpeaking}
          config={config}
          isCallActive={vapiCall.isCallActive}
          onEndCall={handleEndCall}
        />

        <div className="flex-1 flex gap-6">
          {/* Main conversation area */}
          <div className="flex-1 flex flex-col bg-gray-800/30 rounded-lg border border-gray-700">
            {/* Speaking indicator */}
            <SpeakingIndicator
              isUserSpeaking={vapiCall.isUserSpeaking}
              isAISpeaking={vapiCall.isAISpeaking}
              userName={userProfile.name}
              level={config.level}
              domain={config.domain}
            />

            {/* Messages */}
            <MessagePanel
              messages={vapiCall.messages}
              userName={userProfile.name}
              isAISpeaking={vapiCall.isAISpeaking}
            />
          </div>

          {/* Sidebar */}
          <SessionSidebar
            objective={config.objective}
            messagesCount={vapiCall.messages.length}
            timeElapsed={timer.elapsed}
          />
        </div>
      </div>
    );
  };

  // Loading overlay for connecting state
  if (step === 'conversation' && (!vapiCall.session || vapiCall.status === 'connecting')) {
    let progress = 45;
    if (vapiCall.connectionStep.includes('backend')) progress = 50;
    if (vapiCall.connectionStep.includes('assistente')) progress = 60;
    if (vapiCall.connectionStep.includes('sessao')) progress = 70;
    if (vapiCall.connectionStep.includes('Tutor de IA')) progress = 80;
    if (vapiCall.connectionStep.includes('Aguardando')) progress = 90;

    return (
      <Loading
        title="AI Tutor"
        subtitle="Pratica de Conversacao"
        description={vapiCall.connectionStep}
        icon={MessageCircle}
        progress={progress}
        theme={{
          primary: 'violet',
          secondary: 'purple',
          accent: 'yellow',
        }}
        size="md"
      />
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>

        {vapiCall.session && step === 'conversation' && (
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-violet-600 text-white">
              {timer.formattedTime} / {formatTime(config.maxDurationMinutes * 60)}
            </Badge>
            <Badge
              className={
                vapiCall.status === 'connected'
                  ? 'bg-green-600'
                  : vapiCall.status === 'connecting'
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
              }
            >
              {vapiCall.status === 'connected'
                ? 'Conectado'
                : vapiCall.status === 'connecting'
                ? 'Conectando'
                : 'Desconectado'}
            </Badge>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6">
        {step === 'setup' && renderSetupStep()}
        {step === 'conversation' && renderConversationStep()}
      </div>
    </div>
  );
}
