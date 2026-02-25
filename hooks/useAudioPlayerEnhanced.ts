/**
 * Enhanced Audio Player Hook
 *
 * Provides a comprehensive audio player with:
 * - Loading state tracking
 * - Error handling
 * - Play/pause/stop/replay controls
 * - Volume control
 * - Playback progress tracking
 * - Duration information
 * - Keyboard shortcuts support
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface AudioPlayerState {
  /** Whether audio is currently loading */
  isLoading: boolean;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Whether audio has finished playing */
  isEnded: boolean;
  /** Whether audio is ready to play */
  isReady: boolean;
  /** Error message if any */
  error: string | null;
  /** Current playback time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Playback progress as percentage (0-100) */
  progress: number;
  /** Current volume (0-1) */
  volume: number;
  /** Whether audio is muted */
  isMuted: boolean;
}

export interface AudioPlayerControls {
  /** Start or resume playback */
  play: () => Promise<void>;
  /** Pause playback */
  pause: () => void;
  /** Stop playback and reset to start */
  stop: () => void;
  /** Replay from the beginning */
  replay: () => Promise<void>;
  /** Toggle play/pause */
  toggle: () => Promise<void>;
  /** Seek to specific time in seconds */
  seek: (time: number) => void;
  /** Set volume (0-1) */
  setVolume: (volume: number) => void;
  /** Toggle mute */
  toggleMute: () => void;
  /** Set playback speed (0.5-2) */
  setPlaybackRate: (rate: number) => void;
}

export interface UseAudioPlayerReturn {
  state: AudioPlayerState;
  controls: AudioPlayerControls;
  /** Reference to the audio element for advanced usage */
  audioRef: React.RefObject<HTMLAudioElement>;
}

// ============================================================================
// DEFAULT STATE
// ============================================================================

const DEFAULT_STATE: AudioPlayerState = {
  isLoading: true,
  isPlaying: false,
  isEnded: false,
  isReady: false,
  error: null,
  currentTime: 0,
  duration: 0,
  progress: 0,
  volume: 1,
  isMuted: false,
};

// ============================================================================
// HOOK
// ============================================================================

export function useAudioPlayerEnhanced(
  src: string | undefined | null,
  options?: {
    autoPlay?: boolean;
    volume?: number;
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void;
    onError?: (error: string) => void;
    onTimeUpdate?: (currentTime: number, duration: number) => void;
  }
): UseAudioPlayerReturn {
  const [state, setState] = useState<AudioPlayerState>(DEFAULT_STATE);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeBeforeMute = useRef<number>(1);

  // Initialize audio element
  useEffect(() => {
    if (!src) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isReady: false,
        error: null,
      }));
      return;
    }

    // Create new audio element
    const audio = new Audio();
    audioRef.current = audio;

    // Set initial volume
    audio.volume = options?.volume ?? 1;

    // Event handlers
    const handleLoadStart = () => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));
    };

    const handleLoadedMetadata = () => {
      setState((prev) => ({
        ...prev,
        duration: audio.duration,
        isLoading: false,
      }));
    };

    const handleCanPlay = () => {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isReady: true,
      }));

      // Auto play if enabled
      if (options?.autoPlay) {
        audio.play().catch((err) => {
          console.warn('Auto-play prevented:', err);
        });
      }
    };

    const handlePlay = () => {
      setState((prev) => ({
        ...prev,
        isPlaying: true,
        isEnded: false,
      }));
      options?.onPlay?.();
    };

    const handlePause = () => {
      setState((prev) => ({
        ...prev,
        isPlaying: false,
      }));
      options?.onPause?.();
    };

    const handleEnded = () => {
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        isEnded: true,
        progress: 100,
      }));
      options?.onEnded?.();
    };

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      const duration = audio.duration || 1;
      const progress = (currentTime / duration) * 100;

      setState((prev) => ({
        ...prev,
        currentTime,
        progress,
      }));

      options?.onTimeUpdate?.(currentTime, duration);
    };

    const handleVolumeChange = () => {
      setState((prev) => ({
        ...prev,
        volume: audio.volume,
        isMuted: audio.muted,
      }));
    };

    const handleError = () => {
      const errorMessage = getAudioErrorMessage(audio.error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isReady: false,
        error: errorMessage,
      }));
      options?.onError?.(errorMessage);
    };

    // Attach event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('error', handleError);

    // Set source and start loading
    audio.src = src;
    audio.load();

    // Cleanup
    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('error', handleError);

      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [src]);

  // Controls
  const play = useCallback(async () => {
    if (audioRef.current && state.isReady) {
      try {
        await audioRef.current.play();
      } catch (err) {
        console.error('Play failed:', err);
        setState((prev) => ({
          ...prev,
          error: 'Falha ao reproduzir áudio. Tente novamente.',
        }));
      }
    }
  }, [state.isReady]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
        progress: 0,
      }));
    }
  }, []);

  const replay = useCallback(async () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      try {
        await audioRef.current.play();
      } catch (err) {
        console.error('Replay failed:', err);
      }
    }
  }, []);

  const toggle = useCallback(async () => {
    if (state.isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [state.isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, state.duration));
    }
  }, [state.duration]);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
      if (audioRef.current.muted && volume > 0) {
        audioRef.current.muted = false;
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (audioRef.current.muted) {
        audioRef.current.muted = false;
        audioRef.current.volume = volumeBeforeMute.current;
      } else {
        volumeBeforeMute.current = audioRef.current.volume;
        audioRef.current.muted = true;
      }
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = Math.max(0.5, Math.min(2, rate));
    }
  }, []);

  const controls: AudioPlayerControls = {
    play,
    pause,
    stop,
    replay,
    toggle,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
  };

  return {
    state,
    controls,
    audioRef: audioRef as React.RefObject<HTMLAudioElement>,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function getAudioErrorMessage(error: MediaError | null): string {
  if (!error) return 'Erro desconhecido ao carregar áudio';

  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return 'Carregamento de áudio foi cancelado';
    case MediaError.MEDIA_ERR_NETWORK:
      return 'Erro de rede ao carregar áudio. Verifique sua conexão.';
    case MediaError.MEDIA_ERR_DECODE:
      return 'Erro ao decodificar áudio. O arquivo pode estar corrompido.';
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return 'Formato de áudio não suportado pelo navegador.';
    default:
      return 'Erro ao carregar áudio. Tente novamente.';
  }
}

// ============================================================================
// UTILITY: Format time for display
// ============================================================================

export function formatAudioTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default useAudioPlayerEnhanced;
