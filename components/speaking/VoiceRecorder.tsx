"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Mic, 
 
  Square, 
  Play, 
  Pause,
  RotateCcw
} from "lucide-react";

interface VoiceRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: (audioBlob: Blob) => void;
  onPlayback?: (audioUrl: string) => void;
  maxDuration?: number; // em segundos
  showVisualizer?: boolean;
  className?: string;
}

interface AudioVisualizationProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
}

// Componente de visualização de áudio
const AudioVisualization: React.FC<AudioVisualizationProps> = ({ analyser, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!analyser || !isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isActive) return;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(15, 15, 15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        const r = barHeight + 25 * (i / bufferLength);
        const g = 250 * (i / bufferLength);
        const b = 50;

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={100}
      className="w-full h-24 rounded-lg border border-violet-900/30"
    />
  );
};

export default function VoiceRecorder({ 
  isRecording, 
  onStartRecording, 
  onStopRecording,
  onPlayback,
  maxDuration = 60,
  showVisualizer = true,
  className = ""
}: VoiceRecorderProps) {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const levelTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar gravação
  const initializeRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      // Configurar análise de áudio
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyserNode = audioContextRef.current.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      setAnalyser(analyserNode);

      // Configurar MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setHasRecording(true);
        onStopRecording(audioBlob);
        
        // Parar todas as tracks do stream
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      return recorder;
    } catch (error) {
      console.error('Erro ao acessar o microfone:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
      return null;
    }
  }, [audioChunks, onStopRecording]);

  // Timer de gravação
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            handleStopRecording();
            return maxDuration;
          }
          return newTime;
        });
      }, 1000);

      // Monitor de nível de áudio
      if (analyser) {
        levelTimerRef.current = setInterval(() => {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(Math.min(100, (average / 255) * 100));
        }, 100);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (levelTimerRef.current) {
        clearInterval(levelTimerRef.current);
        levelTimerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (levelTimerRef.current) clearInterval(levelTimerRef.current);
    };
  }, [isRecording, maxDuration, analyser]);

  const handleStartRecording = async () => {
    setAudioChunks([]);
    setRecordingTime(0);
    setAudioUrl(null);
    setHasRecording(false);

    const recorder = mediaRecorder || await initializeRecording();
    if (recorder && recorder.state === 'inactive') {
      recorder.start(100); // Coletar dados a cada 100ms
      onStartRecording();
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  const handlePlayback = () => {
    if (!audioUrl || !onPlayback) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onended = () => setIsPlaying(false);
    audio.onpause = () => setIsPlaying(false);
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
      onPlayback(audioUrl);
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setHasRecording(false);
    setRecordingTime(0);
    setAudioLevel(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30 ${className}`}>
      <CardContent className="p-6 space-y-4">
        
        {/* Visualização de áudio */}
        {showVisualizer && (
          <div className="space-y-2">
            <AudioVisualization analyser={analyser} isActive={isRecording} />
            {isRecording && (
              <Progress 
                value={audioLevel} 
                className="h-2 bg-customgreys-darkGrey" 
              />
            )}
          </div>
        )}

        {/* Informações de tempo */}
        <div className="text-center space-y-2">
          <div className="text-2xl font-mono text-white">
            {formatTime(recordingTime)}
          </div>
          {maxDuration && (
            <div className="text-sm text-gray-400">
              Máximo: {formatTime(maxDuration)}
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="flex justify-center gap-3">
          {!isRecording && !hasRecording && (
            <Button 
              onClick={handleStartRecording}
              className="bg-red-600 hover:bg-red-700"
              size="lg"
            >
              <Mic className="w-5 h-5 mr-2" />
              Gravar
            </Button>
          )}

          {isRecording && (
            <Button 
              onClick={handleStopRecording}
              className="bg-red-600 hover:bg-red-700"
              size="lg"
            >
              <Square className="w-5 h-5 mr-2" />
              Parar
            </Button>
          )}

          {hasRecording && !isRecording && (
            <>
              <Button 
                onClick={handlePlayback}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-green-600 hover:border-green-600"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isPlaying ? 'Pausar' : 'Reproduzir'}
              </Button>
              
              <Button 
                onClick={handleStartRecording}
                className="bg-red-600 hover:bg-red-700"
              >
                <Mic className="w-4 h-4 mr-2" />
                Gravar Novamente
              </Button>

              <Button 
                onClick={handleReset}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* Status */}
        <div className="text-center text-sm">
          {isRecording && (
            <div className="text-red-400 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Gravando...
            </div>
          )}
          {hasRecording && !isRecording && (
            <div className="text-green-400">
              Gravação concluída
            </div>
          )}
          {!isRecording && !hasRecording && (
            <div className="text-gray-400">
              Clique para começar a gravar
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}