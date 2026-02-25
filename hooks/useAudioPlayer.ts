import { useCallback, useEffect, useRef, useState } from 'react';

export interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  duration: number;
  currentTime: number;
  volume: number;
  playbackRate: number;
}

export interface UseAudioPlayerOptions {
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
  playbackRate?: number;
  preload?: 'none' | 'metadata' | 'auto';
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
  onLoadStart?: () => void;
  onLoadedData?: () => void;
}

export interface UseAudioPlayerReturn {
  state: AudioPlayerState;
  controls: {
    play: () => Promise<void>;
    pause: () => void;
    stop: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    setPlaybackRate: (rate: number) => void;
    load: (src: string) => void;
    replay: () => Promise<void>;
  };
  audioRef: React.RefObject<HTMLAudioElement>;
}

export function useAudioPlayer(options: UseAudioPlayerOptions = {}): UseAudioPlayerReturn {
  const {
    autoPlay = false,
    loop = false,
    volume = 1,
    playbackRate = 1,
    preload = 'metadata',
    onPlay,
    onPause,
    onEnded,
    onError,
    onLoadStart,
    onLoadedData
  } = options;

  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoading: false,
    error: null,
    duration: 0,
    currentTime: 0,
    volume: volume,
    playbackRate: playbackRate
  });

  // Update audio properties when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
      audioRef.current.playbackRate = state.playbackRate;
    }
  }, [state.volume, state.playbackRate]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setState(prev => ({
        ...prev,
        currentTime: audioRef.current!.currentTime
      }));
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setState(prev => ({
        ...prev,
        duration: audioRef.current!.duration,
        isLoading: false
      }));
      onLoadedData?.();
    }
  }, [onLoadedData]);

  const handleLoadStart = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));
    onLoadStart?.();
  }, [onLoadStart]);

  const handlePlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    onPause?.();
  }, [onPause]);

  const handleEnded = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    onEnded?.();
  }, [onEnded]);

  const handleError = useCallback(() => {
    const error = audioRef.current?.error;
    const errorMessage = error ? `Audio error: ${error.message}` : 'Unknown audio error';
    
    setState(prev => ({
      ...prev,
      isPlaying: false,
      isLoading: false,
      error: errorMessage
    }));
    
    onError?.(errorMessage);
  }, [onError]);

  // Set up event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [
    handleTimeUpdate,
    handleLoadedMetadata,
    handleLoadStart,
    handlePlay,
    handlePause,
    handleEnded,
    handleError
  ]);

  const play = useCallback(async () => {
    if (!audioRef.current) {
      throw new Error('Audio element not available');
    }

    try {
      await audioRef.current.play();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to play audio';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current && time >= 0 && time <= state.duration) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, [state.duration]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setState(prev => ({ ...prev, volume: clampedVolume }));
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.25, Math.min(4, rate));
    setState(prev => ({ ...prev, playbackRate: clampedRate }));
  }, []);

  const load = useCallback((src: string) => {
    if (audioRef.current) {
      audioRef.current.src = src;
      audioRef.current.load();
    }
  }, []);

  const replay = useCallback(async () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      await play();
    }
  }, [play]);

  // Create audio element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = document.createElement('audio');
      audio.preload = preload;
      audio.loop = loop;
      
      if (autoPlay) {
        audio.autoplay = true;
      }
      
      audioRef.current = audio;
    }
  }, [preload, loop, autoPlay]);

  return {
    state,
    controls: {
      play,
      pause,
      stop,
      seek,
      setVolume,
      setPlaybackRate,
      load,
      replay
    },
    audioRef
  };
}