"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Settings,
  Rewind,
  FastForward 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  allowReplay?: boolean;
  maxReplays?: number;
  availableSpeeds?: number[];
  onReplayLimitReached?: () => void;
  onSpeedChange?: (speed: number) => void;
  onPlaybackComplete?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  title,
  allowReplay = true,
  maxReplays = 3,
  availableSpeeds = [0.5, 0.75, 1.0, 1.25, 1.5],
  onReplayLimitReached,
  onSpeedChange,
  onPlaybackComplete,
  onTimeUpdate,
  className
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [replayCount, setReplayCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime, audio.duration);
    };

    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onPlaybackComplete?.();
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [onTimeUpdate, onPlaybackComplete]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!allowReplay || replayCount >= maxReplays) {
      onReplayLimitReached?.();
      return;
    }

    audio.currentTime = 0;
    setCurrentTime(0);
    setReplayCount(prev => prev + 1);
    
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = newTime[0];
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const vol = newVolume[0];
    audio.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume > 0 ? volume : 0.5;
      setIsMuted(false);
      if (volume === 0) setVolume(0.5);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = speed;
    setPlaybackRate(speed);
    onSpeedChange?.(speed);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isReplayDisabled = !allowReplay || replayCount >= maxReplays;

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm p-6", className)}>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onError={() => setIsLoading(false)}
      />
      
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full cursor-pointer"
          disabled={isLoading}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {/* Skip Backward */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => skip(-10)}
          disabled={isLoading}
          className="p-2"
        >
          <Rewind className="w-4 h-4" />
        </Button>

        {/* Restart */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestart}
          disabled={isReplayDisabled || isLoading}
          className="p-2"
          title={isReplayDisabled ? `Máximo de ${maxReplays} reproduções atingido` : "Reiniciar"}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        {/* Play/Pause */}
        <Button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="bg-violet-600 hover:bg-violet-700 text-white p-4 rounded-full"
        >
          {isLoading ? (
            <div className="w-6 h-6 animate-spin border-2 border-white border-t-transparent rounded-full" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </Button>

        {/* Skip Forward */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => skip(10)}
          disabled={isLoading}
          className="p-2"
        >
          <FastForward className="w-4 h-4" />
        </Button>

        {/* Speed Control */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="p-2" disabled={isLoading}>
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <div className="px-2 py-1 text-sm font-semibold text-gray-600">
              Velocidade
            </div>
            {availableSpeeds.map((speed) => (
              <DropdownMenuItem
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={cn(
                  "cursor-pointer",
                  playbackRate === speed && "bg-violet-50 text-violet-700"
                )}
              >
                {speed}x {speed === 1.0 && "(Normal)"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className="p-2 hover:bg-gray-100"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
        
        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.1}
          onValueChange={handleVolumeChange}
          className="flex-1 max-w-20 cursor-pointer"
        />
      </div>

      {/* Replay Counter */}
      {allowReplay && maxReplays > 0 && (
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500">
            Reproduções: {replayCount}/{maxReplays}
          </span>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;