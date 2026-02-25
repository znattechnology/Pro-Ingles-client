"use client";

/**
 * Speaking Challenge Component
 *
 * Provides real audio recording with AI pronunciation analysis.
 * Uses MediaRecorder API for recording and integrates with the
 * /analyze-ai-pronunciation/ endpoint for AI feedback.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Volume2, RotateCcw, Loader2, Check, AlertCircle } from "lucide-react";
import { tokenRefreshCoordinator } from "@/lib/token-refresh-coordinator";

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

// Types
interface PronunciationAnalysis {
    success: boolean;
    ai_analysis?: {
        transcribed_text: string;
        expected_text: string;
        pronunciation_score: number;
        fluency_score: number;
        clarity_score: number;
        overall_score: number;
        is_acceptable: boolean;
        partial_credit: number;
        confidence_level: string;
    };
    feedback?: {
        message: string;
        problematic_words: string[];
        suggestions: string[];
    };
    user_progress?: {
        hearts: number;
        points: number;
    };
    points_earned?: number;
    ai_analyses_remaining?: number; // -1 = unlimited
}

interface AILimitError {
    error: 'ai_limit';
    message: string;
    ai_analyses_remaining: number;
    limit: number;
}

interface SpeakingChallengeProps {
    targetText: string;
    challengeId?: string;
    difficultyLevel?: string;
    onAnalysisComplete: (result: PronunciationAnalysis, isCorrect: boolean) => void;
    disabled?: boolean;
    referenceAudioUrl?: string;
    initialAiAnalysesRemaining?: number; // -1 = unlimited, undefined = unknown
}

// Recording states
type RecordingState = 'idle' | 'recording' | 'recorded' | 'analyzing' | 'error';

export const SpeakingChallenge = ({
    targetText,
    challengeId,
    difficultyLevel = 'intermediate',
    onAnalysisComplete,
    disabled = false,
    referenceAudioUrl,
    initialAiAnalysesRemaining,
}: SpeakingChallengeProps) => {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [analysis, setAnalysis] = useState<PronunciationAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [aiAnalysesRemaining, setAiAnalysesRemaining] = useState<number | undefined>(initialAiAnalysesRemaining);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Maximum recording time (30 seconds)
    const MAX_RECORDING_DURATION = 30;

    // Fetch AI analyses remaining on mount
    useEffect(() => {
        const fetchAiAnalysesRemaining = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/subscriptions/limits/`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.ai_analyses) {
                        const remaining = data.ai_analyses.unlimited ? -1 : data.ai_analyses.remaining;
                        setAiAnalysesRemaining(remaining);
                    }
                }
            } catch (err) {
                console.error('Error fetching AI analyses limit:', err);
            }
        };

        // Only fetch if we don't have an initial value
        if (initialAiAnalysesRemaining === undefined) {
            fetchAiAnalysesRemaining();
        }
    }, [initialAiAnalysesRemaining]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Start recording
    const startRecording = useCallback(async () => {
        try {
            setError(null);
            audioChunksRef.current = [];

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                }
            });
            streamRef.current = stream;

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: mediaRecorder.mimeType
                });
                setAudioBlob(audioBlob);
                setRecordingState('recorded');

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(100); // Collect data every 100ms
            setRecordingState('recording');
            setRecordingDuration(0);

            // Start duration timer
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => {
                    if (prev >= MAX_RECORDING_DURATION - 1) {
                        stopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (err: any) {
            console.error('Error starting recording:', err);
            if (err.name === 'NotAllowedError') {
                setError('Permissão do microfone negada. Por favor, permita o acesso ao microfone nas configurações do navegador.');
            } else if (err.name === 'NotFoundError') {
                setError('Nenhum microfone encontrado. Por favor, conecte um microfone.');
            } else {
                setError('Erro ao iniciar gravação. Tente novamente.');
            }
            setRecordingState('error');
        }
    }, []);

    // Stop recording
    const stopRecording = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    // Reset recording
    const resetRecording = useCallback(() => {
        setAudioBlob(null);
        setAnalysis(null);
        setError(null);
        setRecordingDuration(0);
        setRecordingState('idle');
    }, []);

    // Analyze pronunciation with AI
    const analyzePronunciation = useCallback(async () => {
        if (!audioBlob) return;

        try {
            setRecordingState('analyzing');
            setError(null);

            // Create FormData
            const formData = new FormData();
            formData.append('audio_file', audioBlob, 'recording.webm');
            formData.append('expected_text', targetText);
            formData.append('difficulty_level', difficultyLevel);
            if (challengeId) {
                formData.append('challenge_id', challengeId);
            }

            // Helper function to make the API call
            const makeRequest = async () => {
                return fetch(`${API_BASE_URL}/practice/analyze-ai-pronunciation/`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                });
            };

            // Send to API
            let response = await makeRequest();

            // Handle 401 with token refresh
            if (response.status === 401) {
                console.log('🔄 Token expired, attempting refresh...');
                try {
                    await tokenRefreshCoordinator.refreshToken();
                    // Retry with refreshed token
                    response = await makeRequest();
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    // Redirect to login on refresh failure
                    if (typeof window !== 'undefined') {
                        window.location.href = '/signin?reason=session_expired';
                    }
                    return;
                }
            }

            // Handle AI limit error (429)
            if (response.status === 429) {
                const limitError = await response.json().catch(() => ({})) as AILimitError;
                setAiAnalysesRemaining(0);
                setError(`Limite diário atingido (${limitError.limit} análises). Tente novamente amanhã ou faça upgrade do plano.`);
                setRecordingState('error');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Análise falhou: ${response.status}`);
            }

            const result: PronunciationAnalysis = await response.json();
            setAnalysis(result);
            setRecordingState('recorded'); // Analysis complete, stop the loading spinner

            // Update remaining analyses count from response
            if (result.ai_analyses_remaining !== undefined) {
                setAiAnalysesRemaining(result.ai_analyses_remaining);
            }

            // Notify parent
            const isCorrect = result.ai_analysis?.is_acceptable ?? false;
            onAnalysisComplete(result, isCorrect);

        } catch (err: any) {
            console.error('Error analyzing pronunciation:', err);
            setError(err.message || 'Erro ao analisar pronúncia. Tente novamente.');
            setRecordingState('error');
        }
    }, [audioBlob, targetText, challengeId, difficultyLevel, onAnalysisComplete]);

    // Play reference audio
    const playReferenceAudio = useCallback(() => {
        if (referenceAudioUrl) {
            const audio = new Audio(referenceAudioUrl);
            audio.play().catch(console.error);
        }
    }, [referenceAudioUrl]);

    // Render score display
    // Check if AI analyses limit is reached
    const isLimitReached = aiAnalysesRemaining === 0;
    const isRecordingDisabled = disabled || recordingState === 'analyzing' || (analysis !== null && analysis.ai_analysis?.is_acceptable) || isLimitReached;

    const renderScores = () => {
        if (!analysis?.ai_analysis) return null;

        const { pronunciation_score, fluency_score, clarity_score, overall_score } = analysis.ai_analysis;

        const getScoreColor = (score: number) => {
            if (score >= 80) return 'text-green-400';
            if (score >= 60) return 'text-yellow-400';
            return 'text-red-400';
        };

        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="text-center bg-violet-900/30 rounded-lg p-3">
                    <div className={cn("text-2xl font-bold", getScoreColor(pronunciation_score))}>
                        {pronunciation_score}%
                    </div>
                    <div className="text-xs text-gray-400">Pronúncia</div>
                </div>
                <div className="text-center bg-violet-900/30 rounded-lg p-3">
                    <div className={cn("text-2xl font-bold", getScoreColor(fluency_score))}>
                        {fluency_score}%
                    </div>
                    <div className="text-xs text-gray-400">Fluência</div>
                </div>
                <div className="text-center bg-violet-900/30 rounded-lg p-3">
                    <div className={cn("text-2xl font-bold", getScoreColor(clarity_score))}>
                        {clarity_score}%
                    </div>
                    <div className="text-xs text-gray-400">Clareza</div>
                </div>
                <div className="text-center bg-violet-900/30 rounded-lg p-3">
                    <div className={cn("text-2xl font-bold", getScoreColor(overall_score))}>
                        {overall_score}%
                    </div>
                    <div className="text-xs text-gray-400">Geral</div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Target text to practice */}
            <div className="bg-customgreys-primarybg border border-violet-800 rounded-lg p-6">
                <div className="text-sm text-gray-400 mb-2">Leia em voz alta:</div>
                <div className="text-xl text-blue-400 font-semibold text-center">
                    "{targetText}"
                </div>

                {/* Reference audio button */}
                {referenceAudioUrl && (
                    <div className="flex justify-center mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={playReferenceAudio}
                            className="bg-violet-800/30 border-violet-700 text-violet-300 hover:bg-violet-700/40"
                        >
                            <Volume2 className="w-4 h-4 mr-2" />
                            Ouvir Pronúncia Correta
                        </Button>
                    </div>
                )}

                {/* AI Analyses Counter */}
                {aiAnalysesRemaining !== undefined && aiAnalysesRemaining >= 0 && (
                    <div className={cn(
                        "mt-4 text-center text-sm px-3 py-2 rounded-lg",
                        aiAnalysesRemaining > 3 ? "bg-green-900/30 text-green-400" :
                        aiAnalysesRemaining > 0 ? "bg-yellow-900/30 text-yellow-400" :
                        "bg-red-900/30 text-red-400"
                    )}>
                        <Mic className="w-4 h-4 inline mr-1" />
                        {aiAnalysesRemaining > 0 ? (
                            <>{aiAnalysesRemaining} análise{aiAnalysesRemaining !== 1 ? 's' : ''} AI restante{aiAnalysesRemaining !== 1 ? 's' : ''} hoje</>
                        ) : (
                            <>Limite diário de análises AI atingido</>
                        )}
                    </div>
                )}
            </div>

            {/* Recording controls */}
            <div className="flex flex-col items-center gap-4">
                {/* Main recording button */}
                <button
                    onClick={recordingState === 'recording' ? stopRecording : startRecording}
                    disabled={isRecordingDisabled}
                    className={cn(
                        "relative w-24 h-24 rounded-full flex items-center justify-center transition-all",
                        "focus:outline-none focus:ring-4 focus:ring-violet-500/50",
                        recordingState === 'idle' && !isLimitReached && "bg-violet-600 hover:bg-violet-700",
                        recordingState === 'idle' && isLimitReached && "bg-gray-600",
                        recordingState === 'recording' && "bg-red-600 hover:bg-red-700 animate-pulse",
                        recordingState === 'recorded' && "bg-green-600 hover:bg-green-700",
                        recordingState === 'analyzing' && "bg-violet-600 cursor-wait",
                        recordingState === 'error' && "bg-red-800",
                        isRecordingDisabled && "opacity-50 cursor-not-allowed"
                    )}
                    aria-label={isLimitReached ? 'Limite de análises atingido' : recordingState === 'recording' ? 'Parar gravação' : 'Iniciar gravação'}
                >
                    {recordingState === 'recording' ? (
                        <MicOff className="w-10 h-10 text-white" />
                    ) : recordingState === 'analyzing' ? (
                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                    ) : recordingState === 'recorded' && analysis?.ai_analysis?.is_acceptable ? (
                        <Check className="w-10 h-10 text-white" />
                    ) : (
                        <Mic className="w-10 h-10 text-white" />
                    )}

                    {/* Recording duration indicator */}
                    {recordingState === 'recording' && (
                        <div className="absolute -bottom-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                            {recordingDuration}s / {MAX_RECORDING_DURATION}s
                        </div>
                    )}
                </button>

                {/* Status text */}
                <div className="text-center">
                    {recordingState === 'idle' && (
                        <p className="text-gray-400">Clique para gravar sua pronúncia</p>
                    )}
                    {recordingState === 'recording' && (
                        <p className="text-red-400 animate-pulse">Gravando... Clique para parar</p>
                    )}
                    {recordingState === 'recorded' && !analysis && (
                        <p className="text-green-400">Gravação concluída!</p>
                    )}
                    {recordingState === 'recorded' && analysis && (
                        <p className="text-green-400">✓ Análise concluída!</p>
                    )}
                    {recordingState === 'analyzing' && (
                        <p className="text-violet-400 animate-pulse">Analisando com IA...</p>
                    )}
                    {recordingState === 'error' && (
                        <p className="text-red-400 flex items-center gap-2 justify-center">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </p>
                    )}
                </div>

                {/* Action buttons */}
                {recordingState === 'recorded' && !analysis && (
                    <div className="flex gap-3">
                        <Button
                            onClick={resetRecording}
                            variant="outline"
                            className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Gravar Novamente
                        </Button>
                        <Button
                            onClick={analyzePronunciation}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Analisar com IA
                        </Button>
                    </div>
                )}

                {/* Reset button after analysis */}
                {analysis && !analysis.ai_analysis?.is_acceptable && (
                    <Button
                        onClick={resetRecording}
                        variant="outline"
                        className="bg-transparent border-violet-600 text-violet-300 hover:bg-violet-800/30"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Tentar Novamente
                    </Button>
                )}
            </div>

            {/* Analysis results */}
            {analysis && analysis.ai_analysis && (
                <div className={cn(
                    "border rounded-lg p-4 mt-4",
                    analysis.ai_analysis.is_acceptable
                        ? "bg-green-900/20 border-green-700"
                        : "bg-orange-900/20 border-orange-700"
                )}>
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">AI</span>
                        </div>
                        <h4 className="text-violet-400 font-medium">Análise de Pronúncia</h4>
                        <div className="flex-1" />
                        {analysis.points_earned !== undefined && (
                            <span className="text-white font-bold">
                                +{analysis.points_earned} pts
                            </span>
                        )}
                    </div>

                    {/* Transcription */}
                    <div className="bg-customgreys-secondarybg rounded-lg p-3 mb-4">
                        <div className="text-xs text-gray-400 mb-1">O que a IA ouviu:</div>
                        <p className="text-white font-mono">
                            "{analysis.ai_analysis.transcribed_text}"
                        </p>
                    </div>

                    {/* Scores */}
                    {renderScores()}

                    {/* Feedback */}
                    {analysis.feedback && (
                        <div className={cn(
                            "mt-4 p-3 rounded-lg",
                            analysis.ai_analysis.is_acceptable ? "bg-green-900/30" : "bg-orange-900/30"
                        )}>
                            <p className={cn(
                                "text-sm font-medium",
                                analysis.ai_analysis.is_acceptable ? "text-green-300" : "text-orange-300"
                            )}>
                                {analysis.feedback.message}
                            </p>
                        </div>
                    )}

                    {/* Problematic words */}
                    {analysis.feedback?.problematic_words && analysis.feedback.problematic_words.length > 0 && (
                        <div className="mt-4 bg-red-900/20 border border-red-700/30 rounded-lg p-3">
                            <div className="text-red-400 text-sm font-medium mb-2">
                                Palavras para melhorar:
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {analysis.feedback.problematic_words.map((word, i) => (
                                    <span
                                        key={i}
                                        className="bg-red-800/30 text-red-300 px-2 py-1 rounded text-sm"
                                    >
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggestions */}
                    {analysis.feedback?.suggestions && analysis.feedback.suggestions.length > 0 && (
                        <div className="mt-4 bg-violet-900/20 border border-violet-700/30 rounded-lg p-3">
                            <div className="text-violet-400 text-sm font-medium mb-2">
                                Sugestões:
                            </div>
                            <ul className="text-gray-300 text-sm space-y-1">
                                {analysis.feedback.suggestions.map((suggestion, i) => (
                                    <li key={i}>• {suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Recording waveform animation */}
            {recordingState === 'recording' && (
                <div className="flex justify-center items-end gap-1 h-12">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="w-1 bg-red-500 rounded-full animate-pulse"
                            style={{
                                height: `${Math.random() * 100}%`,
                                minHeight: '8px',
                                animationDelay: `${i * 0.1}s`,
                                animationDuration: '0.5s',
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SpeakingChallenge;
