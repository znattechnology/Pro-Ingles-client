import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCallback, useState, useMemo } from "react";
import { useKey } from "react-use";
import { useAudioPlayerEnhanced, formatAudioTime } from "@/hooks/useAudioPlayerEnhanced";
import { Volume2, VolumeX, RotateCcw, Loader2, AlertCircle, Check, X } from "lucide-react";

// Simple HTML entity escaping for XSS protection
// React already escapes text in JSX, but this adds an extra layer for edge cases
const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .slice(0, 500); // Limit text length to prevent display issues
};

type Props = {
  id: string;
  imageSrc: string | null;
  audioSrc: string | null;
  text: string;
  shortcut: string;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
  status?: "correct" | "wrong" | "none";
  type:
    | "SELECT"
    | "ASSIST"
    | "FILL_BLANK"
    | "TRANSLATION"
    | "LISTENING"
    | "SPEAKING"
    | "MATCH_PAIRS"
    | "SENTENCE_ORDER"
    | "TRUE_FALSE";
  isProcessing?: boolean;
};

export const Card = ({
  imageSrc,
  text,
  shortcut,
  selected,
  status,
  onClick,
  disabled,
  type,
  audioSrc,
  isProcessing,
}: Props) => {
  const [hasPlayed, setHasPlayed] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const { state, controls } = useAudioPlayerEnhanced(audioSrc, {
    onPlay: () => setHasPlayed(true),
  });

  const handleClick = useCallback(() => {
    if (disabled || isProcessing) return;

    // Play audio if available and ready
    if (audioSrc && state.isReady && !state.isPlaying) {
      controls.play();
    }

    onClick();
  }, [disabled, isProcessing, onClick, audioSrc, state.isReady, state.isPlaying, controls]);

  const handleReplay = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      controls.replay();
    },
    [controls]
  );

  const handleVolumeToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      controls.toggleMute();
    },
    [controls]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      controls.setVolume(parseFloat(e.target.value));
    },
    [controls]
  );

  useKey(shortcut, handleClick, {}, [handleClick]);

  // Show audio controls for listening challenges or when audio exists
  const showAudioControls = audioSrc && (type === "LISTENING" || hasPlayed);

  // Sanitize text for display
  const safeText = useMemo(() => sanitizeText(text), [text]);

  // Generate ARIA label based on status and selection
  const ariaLabel = useMemo(() => {
    let label = `Opção ${shortcut}: ${text}`;
    if (selected) {
      label += ". Selecionada";
      if (status === "correct") label += ". Correta";
      if (status === "wrong") label += ". Incorreta";
    }
    if (audioSrc) label += ". Tem áudio";
    return label;
  }, [shortcut, text, selected, status, audioSrc]);

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-pressed={selected}
      aria-disabled={disabled || isProcessing}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        "min-h-[48px] sm:h-full border border-violet-800 rounded-xl border-b-2 hover:bg-slate-400/10 p-3 sm:p-4 lg:p-6 cursor-pointer active:border-b-2 transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-customgreys-primarybg",
        selected && "border-sky-900 bg-sky-700/20 hover:bg-sky-600/20",
        selected && status === "correct" && "border-green-900 bg-green-700/20 hover:bg-green-600/20",
        selected && status === "wrong" && "border-rose-900 bg-rose-700/20 hover:bg-rose-600/20",
        disabled && "pointer-events-none hover:bg-slate-200 opacity-50",
        isProcessing && "opacity-60 pointer-events-none animate-pulse",
        type === "ASSIST" && "lg:p-3 w-full",
        (type === "TRANSLATION" || type === "LISTENING") && "w-full",
        (type === "FILL_BLANK" || type === "MATCH_PAIRS" || type === "SENTENCE_ORDER") &&
          "hover:bg-violet-600/20"
      )}
    >
      {/* Audio Loading Indicator */}
      {audioSrc && state.isLoading && (
        <div className="absolute top-2 right-2">
          <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
        </div>
      )}

      {/* Audio Error Indicator */}
      {state.error && (
        <div className="absolute top-2 right-2" title={state.error}>
          <AlertCircle className="w-4 h-4 text-rose-400" />
        </div>
      )}

      {/* Image */}
      {imageSrc && (
        <div className="relative aspect-square mb-2 sm:mb-4 max-h-[60px] sm:max-h-[80px] lg:max-h-[150px] w-full">
          <Image
            src={imageSrc}
            fill
            alt={text}
            sizes="(max-width: 640px) 60px, (max-width: 768px) 80px, 150px"
          />
        </div>
      )}

      {/* Status Icon - Visual indicator for correct/wrong (accessibility) */}
      {selected && status !== "none" && (
        <div className="absolute top-2 left-2">
          {status === "correct" ? (
            <div className="bg-green-500 rounded-full p-1" aria-label="Resposta correta">
              <Check className="w-3 h-3 text-white" />
            </div>
          ) : status === "wrong" ? (
            <div className="bg-rose-500 rounded-full p-1" aria-label="Resposta incorreta">
              <X className="w-3 h-3 text-white" />
            </div>
          ) : null}
        </div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "flex items-center justify-between gap-2",
          type === "ASSIST" && "flex-row-reverse",
          (type === "TRANSLATION" || type === "LISTENING") && "justify-center"
        )}
      >
        {type === "ASSIST" && <div />}
        <p
          className={cn(
            "text-white text-xs sm:text-sm lg:text-base flex-1 leading-tight",
            selected && "text-sky-500",
            selected && status === "correct" && "text-green-500",
            selected && status === "wrong" && "text-rose-500",
            (type === "TRANSLATION" || type === "LISTENING") && "text-center"
          )}
        >
          {safeText}
        </p>
        <div
          className={cn(
            "w-6 h-6 sm:w-7 sm:h-7 lg:w-[30px] lg:h-[20px] border flex items-center justify-center rounded-lg text-white text-xs lg:text-[15px] font-bold flex-shrink-0",
            selected && "border-sky-300 text-sky-500",
            selected && status === "correct" && "border-green-300 text-green-500",
            selected && status === "wrong" && "border-rose-300 text-rose-500"
          )}
          aria-hidden="true"
        >
          {shortcut}
        </div>
      </div>

      {/* Audio Controls - Show after audio has played or for listening challenges */}
      {showAudioControls && (
        <div
          className="mt-2 pt-2 border-t border-violet-800/30 flex items-center justify-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Replay Button */}
          <button
            onClick={handleReplay}
            disabled={!state.isReady || state.isPlaying}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors",
              "bg-violet-800/30 hover:bg-violet-700/40 text-violet-300",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              state.isPlaying && "animate-pulse"
            )}
            title="Ouvir novamente"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">
              {state.isPlaying ? "Tocando..." : "Repetir"}
            </span>
          </button>

          {/* Volume Control */}
          <div
            className="relative flex items-center"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              onClick={handleVolumeToggle}
              className="p-1 rounded-md bg-violet-800/30 hover:bg-violet-700/40 text-violet-300 transition-colors"
              title={state.isMuted ? "Ativar som" : "Silenciar"}
            >
              {state.isMuted || state.volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Volume Slider (shown on hover) */}
            {showVolumeSlider && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-800 rounded-lg shadow-lg">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={state.volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 accent-violet-500 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>

          {/* Duration Display */}
          {state.duration > 0 && (
            <span className="text-[10px] text-violet-400 tabular-nums">
              {formatAudioTime(state.currentTime)} / {formatAudioTime(state.duration)}
            </span>
          )}
        </div>
      )}

      {/* Playing Indicator */}
      {state.isPlaying && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1 bg-violet-400 rounded-full animate-pulse"
                style={{
                  height: `${8 + i * 2}px`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
