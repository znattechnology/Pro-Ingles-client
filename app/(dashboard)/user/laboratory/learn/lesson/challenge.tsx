import { cn } from "@/lib/utils";
import { Card } from "./card";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Volume2, Check, X, Lightbulb } from "lucide-react";
import { SpeakingChallenge } from "./speaking-challenge";

// Django API types
interface ChallengeOption {
  id: string;
  text: string;
  is_correct?: boolean;
  imageSrc?: string;
  audioSrc?: string;
  order: number;
}

// Extended answer data for complex challenge types
export interface ExtendedAnswerData {
  selectedOption?: string;
  textAnswer?: string;
  textAnswers?: string[];  // For multiple blanks
  orderedOptions?: string[];
  pairedOptions?: { [key: string]: string };
  pronunciationScore?: number;  // For SPEAKING challenges
}

type Props = {
    options: ChallengeOption[];
    onSelect: (id: string, extendedData?: ExtendedAnswerData) => void;
    status: "correct" | "wrong" | "none" | undefined;
    selectedOption?: string;
    disabled?: boolean;
    type: "SELECT" | "ASSIST" | "FILL_BLANK" | "TRANSLATION" | "LISTENING" | "SPEAKING" | "MATCH_PAIRS" | "SENTENCE_ORDER" | "TRUE_FALSE";
    isProcessing?: boolean;
    hint?: string;
    challengeId?: string;
    referenceAudioUrl?: string;
    question?: string;  // For detecting blanks in FILL_BLANK
};

// Maximum replay count for LISTENING challenges
const MAX_AUDIO_REPLAYS = 5;

// Playback speeds for audio
const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5];

export const Challenge =({options,onSelect,status,selectedOption,disabled,type,isProcessing,hint,challengeId,referenceAudioUrl,question}:Props)=> {
    const [textInput, setTextInput] = useState("");
    const [blankInputs, setBlankInputs] = useState<string[]>([]);  // For multiple blanks
    const [draggedItems, setDraggedItems] = useState<string[]>([]);
    const [selectedPairs, setSelectedPairs] = useState<{[key: string]: string}>({});
    const [currentSelection, setCurrentSelection] = useState<{type: 'english' | 'portuguese', id: string, text: string} | null>(null);
    const [showHint, setShowHint] = useState(false);

    // Count blanks in question (supports ___, __, or single _)
    // Works for both FILL_BLANK and LISTENING (dictation mode)
    const blankCount = useMemo(() => {
        if (!question || (type !== 'FILL_BLANK' && type !== 'LISTENING')) return 1;
        // Match patterns like ___, __, _ (at least one underscore)
        const matches = question.match(/_{1,}/g);
        return matches ? matches.length : 1;
    }, [question, type]);

    // Initialize blank inputs when blank count changes
    // Works for both FILL_BLANK and LISTENING (dictation mode)
    useEffect(() => {
        if ((type === 'FILL_BLANK' || type === 'LISTENING') && blankCount > 0) {
            setBlankInputs(new Array(blankCount).fill(''));
        }
    }, [blankCount, type]);

    // LISTENING challenge state
    const [audioPlayCount, setAudioPlayCount] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);

    // Create stable shuffled arrays for MATCH_PAIRS and SENTENCE_ORDER
    const shuffledOptions = useMemo(() => {
        if (type === 'SENTENCE_ORDER') {
            const shuffled = [...options];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }
        return options;
    }, [options, type]);

    // Stable shuffled lists for MATCH_PAIRS - English words
    const englishWords = useMemo(() => {
        if (type !== 'MATCH_PAIRS') return [];
        const words = options.map(option => ({
            id: option.id,
            text: option.text.split(' - ')[0]?.trim() || option.text,
        }));
        // Shuffle
        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
        }
        return words;
    }, [options, type]);

    // Stable shuffled lists for MATCH_PAIRS - Portuguese words
    const portugueseWords = useMemo(() => {
        if (type !== 'MATCH_PAIRS') return [];
        const words = options.map(option => ({
            id: option.id,
            text: option.text.split(' - ')[1]?.trim() || '',
        }));
        // Shuffle differently
        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
        }
        return words;
    }, [options, type]);

    // Reset state when challenge changes
    useEffect(() => {
        setTextInput("");
        setBlankInputs(new Array(blankCount).fill(''));
        setDraggedItems([]);
        setSelectedPairs({});
        setCurrentSelection(null);
        setShowHint(false);
    }, [options, blankCount]);

    // Handle text input submission for TRANSLATION and FILL_BLANK
    const handleTextSubmit = () => {
        if (textInput.trim()) {
            // Send the text answer to backend for validation
            onSelect('text-input', {
                textAnswer: textInput.trim()
            });
        }
    };

    // Handle sentence ordering - add/remove word from sequence
    const handleWordOrder = (wordId: string) => {
        if (disabled) return;

        if (draggedItems.includes(wordId)) {
            setDraggedItems(draggedItems.filter(id => id !== wordId));
        } else {
            setDraggedItems([...draggedItems, wordId]);
        }
    };

    // Submit ordered sentence with the actual order
    const handleOrderSubmit = () => {
        if (draggedItems.length === options.length) {
            // Send the ordered option IDs to backend
            onSelect('sentence-order', {
                orderedOptions: draggedItems
            });
        }
    };

    // Handle pair matching selection
    const handlePairSelection = (selectionType: 'english' | 'portuguese', id: string, text: string) => {
        if (disabled) return;

        if (!currentSelection) {
            // First selection
            setCurrentSelection({ type: selectionType, id, text });
        } else {
            // Check if clicking the same item - deselect it
            if (currentSelection.type === selectionType && currentSelection.id === id) {
                // Same item clicked - deselect
                setCurrentSelection(null);
            } else if (currentSelection.type !== selectionType) {
                // Different type - create pair
                // Get the English option ID (the original option ID)
                const englishId = selectionType === 'english' ? id : currentSelection.id;
                const portugueseText = selectionType === 'portuguese' ? text : currentSelection.text;

                setSelectedPairs(prev => ({
                    ...prev,
                    [englishId]: portugueseText
                }));
                setCurrentSelection(null);
            } else {
                // Same type but different item - replace current selection
                setCurrentSelection({ type: selectionType, id, text });
            }
        }
    };

    // Remove a pair
    const handleRemovePair = (pairKey: string) => {
        if (disabled) return;
        setSelectedPairs(prev => {
            const newPairs = { ...prev };
            delete newPairs[pairKey];
            return newPairs;
        });
    };

    // Submit pairs with the actual pair mappings
    const handlePairsSubmit = () => {
        if (Object.keys(selectedPairs).length === options.length) {
            // Send the paired options to backend for validation
            // Format: { "option_id": "portuguese_text", ... }
            onSelect('match-pairs', {
                pairedOptions: selectedPairs
            });
        }
    };

    // Hint display component
    const HintSection = () => {
        if (!hint) return null;

        return (
            <div className="mb-4">
                <button
                    onClick={() => setShowHint(!showHint)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                        showHint
                            ? "bg-amber-600/20 text-amber-300"
                            : "bg-violet-800/30 text-violet-300 hover:bg-violet-700/40"
                    )}
                    aria-expanded={showHint}
                    aria-controls="hint-content"
                >
                    <Lightbulb className="w-4 h-4" />
                    {showHint ? "Esconder Dica" : "Mostrar Dica"}
                </button>
                {showHint && (
                    <div
                        id="hint-content"
                        className="mt-2 p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg text-amber-200 text-sm"
                        role="tooltip"
                    >
                        💡 {hint}
                    </div>
                )}
            </div>
        );
    };

    // Handle multiple blanks input change with validation
    const MAX_INPUT_LENGTH = 500; // Maximum characters per input
    const handleBlankInputChange = (index: number, value: string) => {
        // Limit input length to prevent abuse
        const sanitizedValue = value.slice(0, MAX_INPUT_LENGTH);
        const newInputs = [...blankInputs];
        newInputs[index] = sanitizedValue;
        setBlankInputs(newInputs);
    };

    // Handle multiple blanks submission
    const handleMultipleBlanksSubmit = () => {
        const filledBlanks = blankInputs.filter(b => b.trim());
        if (filledBlanks.length === blankCount) {
            // For single blank, use textAnswer for backward compatibility
            if (blankCount === 1) {
                onSelect('text-input', {
                    textAnswer: blankInputs[0].trim()
                });
            } else {
                // For multiple blanks, send as array AND combined string
                onSelect('text-input', {
                    textAnswers: blankInputs.map(b => b.trim()),
                    textAnswer: blankInputs.map(b => b.trim()).join(', ')
                });
            }
        }
    };

    // Check if all blanks are filled
    const allBlanksFilled = blankInputs.length === blankCount && blankInputs.every(b => b.trim());

    // Render based on challenge type
    switch (type) {
        case "FILL_BLANK":
            // Parse question to show inline blanks with numbered markers
            const questionParts = question ? question.split(/_{1,}/g) : [''];

            // Generate colors for each blank (for visual association)
            // Colors for up to 10+ blanks (cycles if more)
            const blankColors = [
                { bg: 'bg-violet-500/20', border: 'border-violet-500', text: 'text-violet-400', badge: 'bg-violet-500' },
                { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', badge: 'bg-blue-500' },
                { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500' },
                { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400', badge: 'bg-amber-500' },
                { bg: 'bg-rose-500/20', border: 'border-rose-500', text: 'text-rose-400', badge: 'bg-rose-500' },
                { bg: 'bg-cyan-500/20', border: 'border-cyan-500', text: 'text-cyan-400', badge: 'bg-cyan-500' },
                { bg: 'bg-pink-500/20', border: 'border-pink-500', text: 'text-pink-400', badge: 'bg-pink-500' },
                { bg: 'bg-indigo-500/20', border: 'border-indigo-500', text: 'text-indigo-400', badge: 'bg-indigo-500' },
                { bg: 'bg-teal-500/20', border: 'border-teal-500', text: 'text-teal-400', badge: 'bg-teal-500' },
                { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-400', badge: 'bg-orange-500' },
            ];

            // Audio player state for dictation mode
            const handlePlayFillBlankAudio = () => {
                if (referenceAudioUrl) {
                    const audio = new Audio(referenceAudioUrl);
                    audio.play().catch(console.error);
                }
            };

            return (
                <div className="space-y-4">
                    <HintSection />

                    {/* Reference Audio Player - for dictation exercises */}
                    {referenceAudioUrl && (
                        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 sm:p-5">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="flex-shrink-0">
                                    <button
                                        onClick={handlePlayFillBlankAudio}
                                        disabled={disabled}
                                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-500 hover:bg-amber-400 disabled:bg-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg shadow-amber-500/30"
                                    >
                                        <Volume2 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                                    </button>
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-amber-300 font-medium text-sm sm:text-base">
                                        🎧 Exercício de Ditado
                                    </p>
                                    <p className="text-amber-200/70 text-xs sm:text-sm">
                                        Ouça o áudio e complete as lacunas com o que ouvir
                                    </p>
                                </div>
                            </div>
                            {/* Audio element for controls */}
                            <div className="mt-3">
                                <audio
                                    controls
                                    src={referenceAudioUrl}
                                    className="w-full h-10 opacity-80"
                                >
                                    Seu navegador não suporta áudio.
                                </audio>
                            </div>
                        </div>
                    )}

                    {/* Question display with numbered blank markers */}
                    {blankCount > 1 && question && (
                        <div className="bg-customgreys-primarybg border border-customgreys-darkerGrey rounded-xl p-4 sm:p-6">
                            <div className="text-xs sm:text-sm text-gray-400 mb-3 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                                    <span className="text-violet-400 text-xs">?</span>
                                </span>
                                Complete as {blankCount} lacunas:
                            </div>

                            {/* Sentence with numbered blank markers */}
                            <div className="text-base sm:text-lg md:text-xl text-white leading-relaxed">
                                {questionParts.map((part, index) => (
                                    <span key={index}>
                                        <span>{part}</span>
                                        {index < blankCount && (
                                            <span
                                                className={`inline-flex items-center justify-center mx-1 px-2 sm:px-3 py-1 rounded-lg ${blankColors[index % blankColors.length].bg} ${blankColors[index % blankColors.length].border} border-2 border-dashed min-w-[60px] sm:min-w-[80px]`}
                                            >
                                                <span className={`${blankColors[index % blankColors.length].text} font-bold text-sm sm:text-base`}>
                                                    {blankInputs[index]?.trim() || `(${index + 1})`}
                                                </span>
                                            </span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input fields for multiple blanks - responsive grid */}
                    {blankCount > 1 && (
                        <div className="space-y-3">
                            <div className="text-xs sm:text-sm text-gray-400 px-1">
                                Digite as respostas:
                            </div>
                            <div className={`grid gap-3 ${
                                blankCount <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
                                blankCount === 3 ? 'grid-cols-1 sm:grid-cols-3' :
                                blankCount <= 6 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' :
                                'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6'
                            }`}>
                                {Array.from({ length: blankCount }).map((_, index) => (
                                    <div
                                        key={index}
                                        className={`relative rounded-xl overflow-hidden ${blankColors[index % blankColors.length].bg} border ${blankColors[index % blankColors.length].border}`}
                                    >
                                        {/* Badge number */}
                                        <div className={`absolute top-0 left-0 ${blankColors[index % blankColors.length].badge} text-white text-xs font-bold px-2 py-1 rounded-br-lg`}>
                                            {index + 1}
                                        </div>
                                        <Input
                                            value={blankInputs[index] || ''}
                                            onChange={(e) => handleBlankInputChange(index, e.target.value)}
                                            disabled={disabled || status !== 'none'}
                                            placeholder={`Lacuna ${index + 1}...`}
                                            className={`bg-transparent border-0 ${blankColors[index % blankColors.length].text} placeholder-gray-500 min-h-[56px] text-base sm:text-lg pt-6 px-3 pb-3 w-full focus:ring-2 focus:ring-offset-0 ${blankColors[index % blankColors.length].border}`}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && allBlanksFilled) {
                                                    handleMultipleBlanksSubmit();
                                                }
                                            }}
                                            autoFocus={index === 0}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Confirm button */}
                            <div className="flex justify-center pt-2">
                                <Button
                                    onClick={handleMultipleBlanksSubmit}
                                    disabled={disabled || !allBlanksFilled || status !== 'none'}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 min-h-[48px] px-6 sm:px-8 font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Confirmar ({blankInputs.filter(b => b.trim()).length}/{blankCount})
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Single blank - clean layout */}
                    {blankCount === 1 && (
                        <div className="bg-customgreys-primarybg border border-violet-800 rounded-xl p-4 sm:p-6">
                            <label className="text-xs sm:text-sm text-gray-400 mb-3 block flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                                    <span className="text-violet-400 text-xs">✎</span>
                                </span>
                                Digite sua resposta:
                            </label>
                            <Input
                                value={blankInputs[0] || ''}
                                onChange={(e) => handleBlankInputChange(0, e.target.value)}
                                placeholder="Digite a palavra ou frase..."
                                disabled={disabled || status !== 'none'}
                                className="bg-customgreys-secondarybg border-violet-700 text-white placeholder-gray-500 min-h-[52px] sm:min-h-[56px] text-base sm:text-lg rounded-xl"
                                onKeyDown={(e) => e.key === 'Enter' && allBlanksFilled && handleMultipleBlanksSubmit()}
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Show selected answers feedback */}
                    {selectedOption === 'text-input' && status === 'none' && (
                        <div className="mt-3 text-xs sm:text-sm text-violet-400 text-center bg-violet-500/10 rounded-lg p-3 border border-violet-500/20">
                            {blankCount === 1 ? (
                                <>✓ Resposta: &quot;{blankInputs[0]}&quot; — Clique em &quot;Verificar&quot;</>
                            ) : (
                                <div className="flex flex-wrap justify-center gap-2">
                                    <span>✓ Respostas:</span>
                                    {blankInputs.map((b, i) => (
                                        <span key={i} className={`${blankColors[i % blankColors.length].text} font-medium`}>
                                            ({i+1}) &quot;{b}&quot;{i < blankInputs.length - 1 ? '' : ''}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
            
        case "TRANSLATION":
            // Handle reference audio playback for translation (dictation exercises)
            const handlePlayTranslationAudio = () => {
                if (referenceAudioUrl) {
                    const audio = new Audio(referenceAudioUrl);
                    audio.play().catch(console.error);
                }
            };

            return (
                <div className="space-y-4">
                    <HintSection />

                    {/* Reference Audio Button - for "listen and write" exercises */}
                    {referenceAudioUrl && (
                        <div className="bg-customgreys-primarybg border border-blue-700/50 rounded-lg p-4">
                            <div className="flex flex-col items-center gap-3">
                                <span className="text-sm text-gray-400">
                                    🎧 Ouça o áudio e escreva o que você ouvir:
                                </span>
                                <Button
                                    onClick={handlePlayTranslationAudio}
                                    disabled={disabled}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 text-lg"
                                >
                                    <Volume2 className="w-5 h-5" />
                                    Ouvir Áudio
                                </Button>
                                <span className="text-xs text-gray-500">
                                    Você pode ouvir quantas vezes precisar
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Main translation input area */}
                    <div className="bg-customgreys-primarybg border border-violet-800 rounded-lg p-4">
                        <label className="text-sm text-gray-400 mb-2 block">
                            {referenceAudioUrl ? "Escreva o que ouviu:" : "Digite sua tradução:"}
                        </label>
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value.slice(0, 2000))}
                            placeholder={referenceAudioUrl ? "Escreva aqui o que ouviu no áudio..." : "Digite a tradução aqui..."}
                            disabled={disabled || status !== 'none'}
                            className="w-full bg-customgreys-secondarybg border border-violet-700 rounded-lg p-3 text-white placeholder-gray-500 resize-none outline-none focus:border-violet-500 text-lg"
                            rows={3}
                            maxLength={2000}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey && !disabled && textInput.trim()) {
                                    handleTextSubmit();
                                }
                            }}
                        />
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-500">Ctrl+Enter para confirmar</span>
                            <Button
                                onClick={handleTextSubmit}
                                disabled={disabled || !textInput.trim() || status !== 'none'}
                                className="bg-green-600 hover:bg-green-700 px-6 font-semibold"
                            >
                                {referenceAudioUrl ? "Confirmar Resposta" : "Confirmar Tradução"}
                            </Button>
                        </div>

                        {/* Show selected answer feedback */}
                        {selectedOption === 'text-input' && status === 'none' && (
                            <div className="mt-3 text-sm text-violet-400">
                                ✓ Tradução definida - Clique em "Verificar" abaixo
                            </div>
                        )}
                    </div>

                    {/*
                      Options section removed for TRANSLATION challenges.
                      Showing options would reveal the correct answer.
                      Users must type their answer manually.
                    */}
                </div>
            );
            
        case "LISTENING":
            // Debug: Log values to check dictation detection
            console.log('🎧 LISTENING Challenge Debug:', {
                question,
                referenceAudioUrl,
                hasBlanks: question ? /_{1,}/g.test(question) : false,
            });

            // Check if this is a dictation-style exercise (has referenceAudioUrl and blanks in question)
            const hasBlanksInQuestion = question && /_{1,}/g.test(question);
            const isDictationStyle = referenceAudioUrl && hasBlanksInQuestion;

            if (isDictationStyle) {
                // DICTATION STYLE - Render like FILL_BLANK with audio
                const listeningQuestionParts = question ? question.split(/_{1,}/g) : [''];
                const listeningBlankCount = question ? (question.match(/_{1,}/g) || []).length : 0;

                // Generate colors for each blank
                // Colors for up to 10+ blanks (cycles if more)
                const listeningBlankColors = [
                    { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400', badge: 'bg-amber-500' },
                    { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', badge: 'bg-blue-500' },
                    { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500' },
                    { bg: 'bg-violet-500/20', border: 'border-violet-500', text: 'text-violet-400', badge: 'bg-violet-500' },
                    { bg: 'bg-rose-500/20', border: 'border-rose-500', text: 'text-rose-400', badge: 'bg-rose-500' },
                    { bg: 'bg-cyan-500/20', border: 'border-cyan-500', text: 'text-cyan-400', badge: 'bg-cyan-500' },
                    { bg: 'bg-pink-500/20', border: 'border-pink-500', text: 'text-pink-400', badge: 'bg-pink-500' },
                    { bg: 'bg-indigo-500/20', border: 'border-indigo-500', text: 'text-indigo-400', badge: 'bg-indigo-500' },
                    { bg: 'bg-teal-500/20', border: 'border-teal-500', text: 'text-teal-400', badge: 'bg-teal-500' },
                    { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-400', badge: 'bg-orange-500' },
                ];

                const handlePlayListeningAudio = () => {
                    if (referenceAudioUrl) {
                        const audio = new Audio(referenceAudioUrl);
                        audio.play().catch(console.error);
                    }
                };

                // Check if all listening blanks are filled
                const allListeningBlanksFilled = blankInputs.length === listeningBlankCount && blankInputs.every(b => b.trim());

                // Handle listening dictation submission
                const handleListeningDictationSubmit = () => {
                    const filledBlanks = blankInputs.filter(b => b.trim());
                    if (filledBlanks.length === listeningBlankCount) {
                        if (listeningBlankCount === 1) {
                            onSelect('text-input', {
                                textAnswer: blankInputs[0].trim()
                            });
                        } else {
                            onSelect('text-input', {
                                textAnswers: blankInputs.map(b => b.trim()),
                                textAnswer: blankInputs.map(b => b.trim()).join(', ')
                            });
                        }
                    }
                };

                return (
                    <div className="space-y-4">
                        <HintSection />

                        {/* Audio Player for Dictation */}
                        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 sm:p-5">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="flex-shrink-0">
                                    <button
                                        onClick={handlePlayListeningAudio}
                                        disabled={disabled}
                                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-500 hover:bg-amber-400 disabled:bg-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg shadow-amber-500/30"
                                    >
                                        <Volume2 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                                    </button>
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-amber-300 font-medium text-sm sm:text-base">
                                        🎧 Exercício de Compreensão Auditiva
                                    </p>
                                    <p className="text-amber-200/70 text-xs sm:text-sm">
                                        Ouça o áudio e complete as {listeningBlankCount > 1 ? `${listeningBlankCount} lacunas` : 'lacuna'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3">
                                <audio
                                    controls
                                    src={referenceAudioUrl}
                                    className="w-full h-10 opacity-80"
                                >
                                    Seu navegador não suporta áudio.
                                </audio>
                            </div>
                        </div>

                        {/* Question display with numbered blank markers */}
                        {listeningBlankCount > 1 && (
                            <div className="bg-customgreys-primarybg border border-customgreys-darkerGrey rounded-xl p-4 sm:p-6">
                                <div className="text-xs sm:text-sm text-gray-400 mb-3 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                                        <span className="text-amber-400 text-xs">?</span>
                                    </span>
                                    Complete as {listeningBlankCount} lacunas:
                                </div>
                                <div className="text-base sm:text-lg md:text-xl text-white leading-relaxed">
                                    {listeningQuestionParts.map((part, index) => (
                                        <span key={index}>
                                            <span>{part}</span>
                                            {index < listeningBlankCount && (
                                                <span
                                                    className={`inline-flex items-center justify-center mx-1 px-2 sm:px-3 py-1 rounded-lg ${listeningBlankColors[index % listeningBlankColors.length].bg} ${listeningBlankColors[index % listeningBlankColors.length].border} border-2 border-dashed min-w-[60px] sm:min-w-[80px]`}
                                                >
                                                    <span className={`${listeningBlankColors[index % listeningBlankColors.length].text} font-bold text-sm sm:text-base`}>
                                                        {blankInputs[index]?.trim() || `(${index + 1})`}
                                                    </span>
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input fields for blanks */}
                        {listeningBlankCount > 1 ? (
                            <div className="space-y-3">
                                <div className="text-xs sm:text-sm text-gray-400 px-1">
                                    Digite o que ouviu:
                                </div>
                                <div className={`grid gap-3 ${
                                    listeningBlankCount <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
                                    listeningBlankCount === 3 ? 'grid-cols-1 sm:grid-cols-3' :
                                    listeningBlankCount <= 6 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' :
                                    'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6'
                                }`}>
                                    {Array.from({ length: listeningBlankCount }).map((_, index) => (
                                        <div
                                            key={index}
                                            className={`relative rounded-xl overflow-hidden ${listeningBlankColors[index % listeningBlankColors.length].bg} border ${listeningBlankColors[index % listeningBlankColors.length].border}`}
                                        >
                                            <div className={`absolute top-0 left-0 ${listeningBlankColors[index % listeningBlankColors.length].badge} text-white text-xs font-bold px-2 py-1 rounded-br-lg`}>
                                                {index + 1}
                                            </div>
                                            <Input
                                                value={blankInputs[index] || ''}
                                                onChange={(e) => handleBlankInputChange(index, e.target.value)}
                                                disabled={disabled || status !== 'none'}
                                                placeholder={`Lacuna ${index + 1}...`}
                                                className={`bg-transparent border-0 ${listeningBlankColors[index % listeningBlankColors.length].text} placeholder-gray-500 min-h-[56px] text-base sm:text-lg pt-6 px-3 pb-3 w-full focus:ring-2 focus:ring-offset-0 ${listeningBlankColors[index % listeningBlankColors.length].border}`}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && allListeningBlanksFilled) {
                                                        handleListeningDictationSubmit();
                                                    }
                                                }}
                                                autoFocus={index === 0}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-center pt-2">
                                    <Button
                                        onClick={handleListeningDictationSubmit}
                                        disabled={disabled || !allListeningBlanksFilled || status !== 'none'}
                                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 min-h-[48px] px-6 sm:px-8 font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        Confirmar ({blankInputs.filter(b => b.trim()).length}/{listeningBlankCount})
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // Single blank
                            <div className="bg-customgreys-primarybg border border-amber-800 rounded-xl p-4 sm:p-6">
                                <label className="text-xs sm:text-sm text-gray-400 mb-3 block flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                                        <span className="text-amber-400 text-xs">✎</span>
                                    </span>
                                    Digite o que ouviu:
                                </label>
                                <Input
                                    value={blankInputs[0] || ''}
                                    onChange={(e) => handleBlankInputChange(0, e.target.value)}
                                    placeholder="Digite a palavra ou frase..."
                                    disabled={disabled || status !== 'none'}
                                    className="bg-customgreys-secondarybg border-amber-700 text-white placeholder-gray-500 min-h-[52px] sm:min-h-[56px] text-base sm:text-lg rounded-xl"
                                    onKeyDown={(e) => e.key === 'Enter' && allListeningBlanksFilled && handleListeningDictationSubmit()}
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Show selected answers feedback */}
                        {selectedOption === 'text-input' && status === 'none' && (
                            <div className="mt-3 text-xs sm:text-sm text-amber-400 text-center bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                                {listeningBlankCount === 1 ? (
                                    <>✓ Resposta: &quot;{blankInputs[0]}&quot; — Clique em &quot;Verificar&quot;</>
                                ) : (
                                    <div className="flex flex-wrap justify-center gap-2">
                                        <span>✓ Respostas:</span>
                                        {blankInputs.map((b, i) => (
                                            <span key={i} className={`${listeningBlankColors[i % listeningBlankColors.length].text} font-medium`}>
                                                ({i+1}) &quot;{b}&quot;
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            }

            // LEGACY STYLE - Multiple choice with audio options
            const audioOption = options.find(opt => opt.audioSrc);
            const mainAudioSrc = audioOption?.audioSrc || null;
            const remainingPlays = MAX_AUDIO_REPLAYS - audioPlayCount;
            const canPlayAudio = remainingPlays > 0 && !isAudioPlaying && !!mainAudioSrc;

            const handlePlayAudio = () => {
                if (!canPlayAudio || !mainAudioSrc) return;

                let audio = audioRef;
                if (!audio) {
                    audio = new Audio(mainAudioSrc);
                    setAudioRef(audio);
                }

                audio.playbackRate = playbackSpeed;

                audio.onplay = () => setIsAudioPlaying(true);
                audio.onended = () => {
                    setIsAudioPlaying(false);
                    setAudioPlayCount(prev => prev + 1);
                };
                audio.onerror = () => setIsAudioPlaying(false);

                audio.currentTime = 0;
                audio.play().catch(console.error);
            };

            const handleSpeedChange = (speed: number) => {
                setPlaybackSpeed(speed);
                if (audioRef) {
                    audioRef.playbackRate = speed;
                }
            };

            return (
                <div className="space-y-4">
                    <HintSection />

                    {/* Audio Controls - only show if audio exists */}
                    {mainAudioSrc ? (
                        <div className="bg-customgreys-primarybg border border-violet-800 rounded-lg p-4">
                            <div className="flex flex-col items-center gap-4">
                                <Button
                                    onClick={handlePlayAudio}
                                    disabled={disabled || !canPlayAudio}
                                    aria-label={`Reproduzir áudio. ${remainingPlays} reproduções restantes`}
                                    className={cn(
                                        "flex items-center gap-2 text-lg px-8 py-4 transition-all",
                                        canPlayAudio ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 cursor-not-allowed",
                                        isAudioPlaying && "animate-pulse"
                                    )}
                                >
                                    <Volume2 className={cn("w-6 h-6", isAudioPlaying && "animate-bounce")} />
                                    {isAudioPlaying ? "Tocando..." : "Ouvir Áudio"}
                                </Button>

                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-sm font-medium",
                                        remainingPlays > 2 ? "text-green-400" : remainingPlays > 0 ? "text-yellow-400" : "text-red-400"
                                    )}>
                                        {remainingPlays > 0 ? (
                                            <>🔊 {remainingPlays} reproduções restantes</>
                                        ) : (
                                            <>⚠️ Limite de reproduções atingido</>
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm">Velocidade:</span>
                                    <div className="flex gap-1">
                                        {PLAYBACK_SPEEDS.map(speed => (
                                            <button
                                                key={speed}
                                                onClick={() => handleSpeedChange(speed)}
                                                disabled={disabled}
                                                className={cn(
                                                    "px-3 py-1 rounded-lg text-sm font-medium transition-all",
                                                    playbackSpeed === speed
                                                        ? "bg-violet-600 text-white"
                                                        : "bg-violet-800/30 text-violet-300 hover:bg-violet-700/40"
                                                )}
                                                aria-label={`Velocidade ${speed}x`}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="text-center text-sm text-gray-400">
                        {mainAudioSrc
                            ? "Ouça com atenção e selecione o que você ouviu:"
                            : "Selecione a opção correta:"
                        }
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {options.map((option, i) => (
                            <Card
                                key={option.id}
                                id={option.id}
                                text={option.text}
                                imageSrc={option.imageSrc || null}
                                shortcut={`${i + 1}`}
                                selected={selectedOption === option.id}
                                onClick={() => onSelect(option.id)}
                                status={status}
                                audioSrc={null}
                                disabled={disabled}
                                type={type}
                                isProcessing={isProcessing}
                            />
                        ))}
                    </div>
                </div>
            );
            
        case "SPEAKING":
            // Get the target text - prefer options[0].text, but fall back to question field
            // The question field is where teachers typically put the text to pronounce
            const speakingText = options[0]?.text || question || "Practice phrase";
            // Get reference audio from options if available
            const speakingReferenceAudio = referenceAudioUrl || options.find(opt => opt.audioSrc)?.audioSrc;

            console.log('🎤 SPEAKING challenge setup:', {
                speakingText,
                hasOptions: options.length > 0,
                question: question?.substring(0, 50),
                referenceAudioUrl: speakingReferenceAudio ? 'present' : 'none'
            });

            return (
                <div className="space-y-4">
                    <HintSection />
                    <SpeakingChallenge
                        targetText={speakingText}
                        challengeId={challengeId}
                        difficultyLevel="intermediate"
                        referenceAudioUrl={speakingReferenceAudio}
                        disabled={disabled || status !== 'none'}
                        onAnalysisComplete={(result, isCorrect) => {
                            console.log('🎤 Speaking analysis complete:', {
                                transcribed: result.ai_analysis?.transcribed_text,
                                expected: speakingText,
                                score: result.ai_analysis?.overall_score,
                                isCorrect,
                                isAcceptable: result.ai_analysis?.is_acceptable
                            });

                            // Pass the result to parent with pronunciation data
                            // Use a generated ID if no option exists
                            const optionId = options[0]?.id || `speaking-${challengeId}`;
                            onSelect(optionId, {
                                selectedOption: optionId,
                                textAnswer: result.ai_analysis?.transcribed_text || '',
                                pronunciationScore: result.ai_analysis?.overall_score ?? 0,
                            });
                        }}
                    />
                </div>
            );
            
        case "MATCH_PAIRS":
            // englishWords and portugueseWords are now computed at the top level via useMemo
            return (
                <div className="space-y-6">
                    <HintSection />
                    <div className="text-center text-sm text-gray-400">
                        Clique primeiro na palavra em inglês, depois na tradução em português
                    </div>

                    {/* Current selection indicator */}
                    {currentSelection && (
                        <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-3 text-center animate-pulse">
                            <span className="text-blue-400 text-sm">Selecionado: </span>
                            <span className="text-white font-semibold">{currentSelection.text}</span>
                            <span className="text-gray-400 text-sm ml-2">
                                ({currentSelection.type === 'english' ? '🇺🇸 Inglês' : '🇦🇴 Português'})
                            </span>
                        </div>
                    )}

                    {/* Show formed pairs with remove option */}
                    {Object.keys(selectedPairs).length > 0 && (
                        <div className="bg-green-600/10 border border-green-500 rounded-lg p-4">
                            <div className="text-green-400 text-sm mb-2 font-semibold">
                                Pares formados ({Object.keys(selectedPairs).length}/{options.length}):
                            </div>
                            <div className="space-y-2">
                                {Object.entries(selectedPairs).map(([englishId, portugueseText]) => {
                                    const englishOption = options.find(o => o.id === englishId);
                                    const englishText = englishOption?.text.split(' - ')[0]?.trim() || '';
                                    return (
                                        <div key={englishId} className="flex items-center justify-between bg-green-900/30 rounded px-3 py-2">
                                            <span className="text-white text-sm">
                                                <Check className="w-4 h-4 inline mr-2 text-green-400" />
                                                {englishText} → {portugueseText}
                                            </span>
                                            {!disabled && (
                                                <button
                                                    onClick={() => handleRemovePair(englishId)}
                                                    className="text-red-400 hover:text-red-300 p-1"
                                                    title="Remover par"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <div className="text-sm text-gray-400 text-center font-semibold">🇺🇸 English</div>
                            {englishWords.map((word) => {
                                const isCurrentSelection = currentSelection?.type === 'english' && currentSelection?.id === word.id;
                                const isAlreadyPaired = Object.keys(selectedPairs).includes(word.id);

                                return (
                                    <div
                                        key={`en-${word.id}`}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`English word: ${word.text}`}
                                        aria-pressed={isCurrentSelection}
                                        className={cn(
                                            "bg-customgreys-primarybg border rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 min-h-[50px] flex items-center justify-center",
                                            isCurrentSelection && "border-blue-500 bg-blue-600/20 ring-2 ring-blue-400 scale-105",
                                            isAlreadyPaired && "border-green-500 bg-green-600/20",
                                            !isCurrentSelection && !isAlreadyPaired && "border-violet-800 hover:bg-violet-600/20 hover:border-violet-600",
                                            disabled && "pointer-events-none opacity-50"
                                        )}
                                        onClick={() => !isAlreadyPaired && handlePairSelection('english', word.id, word.text)}
                                        onKeyDown={(e) => e.key === 'Enter' && !isAlreadyPaired && handlePairSelection('english', word.id, word.text)}
                                    >
                                        <div className="text-white text-center font-medium text-sm sm:text-base">
                                            {isAlreadyPaired && <Check className="w-4 h-4 inline mr-1 text-green-400" />}
                                            {word.text}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm text-gray-400 text-center font-semibold">🇦🇴 Português</div>
                            {portugueseWords.map((word) => {
                                const isCurrentSelection = currentSelection?.type === 'portuguese' && currentSelection?.text === word.text;
                                const isAlreadyPaired = Object.values(selectedPairs).includes(word.text);

                                return (
                                    <div
                                        key={`pt-${word.id}`}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Portuguese word: ${word.text}`}
                                        aria-pressed={isCurrentSelection}
                                        className={cn(
                                            "bg-customgreys-primarybg border rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 min-h-[50px] flex items-center justify-center",
                                            isCurrentSelection && "border-blue-500 bg-blue-600/20 ring-2 ring-blue-400 scale-105",
                                            isAlreadyPaired && "border-green-500 bg-green-600/20",
                                            !isCurrentSelection && !isAlreadyPaired && "border-violet-800 hover:bg-violet-600/20 hover:border-violet-600",
                                            disabled && "pointer-events-none opacity-50"
                                        )}
                                        onClick={() => !isAlreadyPaired && handlePairSelection('portuguese', word.id, word.text)}
                                        onKeyDown={(e) => e.key === 'Enter' && !isAlreadyPaired && handlePairSelection('portuguese', word.id, word.text)}
                                    >
                                        <div className="text-white text-center font-medium text-sm sm:text-base">
                                            {isAlreadyPaired && <Check className="w-4 h-4 inline mr-1 text-green-400" />}
                                            {word.text}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="text-center">
                        <Button
                            onClick={handlePairsSubmit}
                            disabled={disabled || Object.keys(selectedPairs).length !== options.length}
                            className={cn(
                                "px-8 py-3 font-semibold transition-all",
                                Object.keys(selectedPairs).length === options.length
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-gray-600 cursor-not-allowed"
                            )}
                        >
                            Confirmar Pares ({Object.keys(selectedPairs).length}/{options.length})
                        </Button>
                    </div>
                </div>
            );
            
        case "SENTENCE_ORDER":
            // Use shuffled options that don't change on re-render
            const availableWords = shuffledOptions.filter(opt => !draggedItems.includes(opt.id));

            return (
                <div className="space-y-4">
                    <HintSection />
                    <div className="text-center text-sm text-gray-400">
                        Clique nas palavras na ordem correta para formar a frase:
                    </div>

                    {/* Selected words area - the sentence being built */}
                    <div className="bg-customgreys-primarybg border-2 border-dashed border-violet-600 rounded-lg p-4 min-h-[80px]">
                        <div className="text-sm text-gray-400 mb-2">Sua frase:</div>
                        <div className="flex flex-wrap gap-2 min-h-[40px]">
                            {draggedItems.length === 0 ? (
                                <span className="text-gray-500 italic text-sm">Clique nas palavras abaixo...</span>
                            ) : (
                                draggedItems.map((wordId, index) => {
                                    const word = options.find(opt => opt.id === wordId);
                                    return (
                                        <div
                                            key={wordId}
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`Word ${index + 1}: ${word?.text}. Click to remove.`}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 shadow-md"
                                            onClick={() => handleWordOrder(wordId)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleWordOrder(wordId)}
                                        >
                                            <span className="text-xs text-blue-200">{index + 1}.</span>
                                            <span>{word?.text}</span>
                                            <X className="w-4 h-4 text-blue-200 hover:text-white" />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Available words - shuffled and stable */}
                    <div className="space-y-2">
                        <div className="text-sm text-gray-400 text-center">
                            Palavras disponíveis ({availableWords.length}):
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {availableWords.map((option) => (
                                <div
                                    key={option.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Add word: ${option.text}`}
                                    className={cn(
                                        "bg-customgreys-primarybg border border-violet-800 text-white px-4 py-2 rounded-lg cursor-pointer transition-all hover:bg-violet-600/30 hover:border-violet-500 hover:scale-105",
                                        disabled && "pointer-events-none opacity-50"
                                    )}
                                    onClick={() => handleWordOrder(option.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleWordOrder(option.id)}
                                >
                                    {option.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="text-center text-sm text-gray-400">
                        {draggedItems.length} / {options.length} palavras selecionadas
                    </div>

                    <div className="text-center">
                        <Button
                            onClick={handleOrderSubmit}
                            disabled={disabled || draggedItems.length !== options.length}
                            className={cn(
                                "px-8 py-3 font-semibold transition-all",
                                draggedItems.length === options.length
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-gray-600 cursor-not-allowed"
                            )}
                        >
                            Confirmar Frase ({draggedItems.length}/{options.length})
                        </Button>
                    </div>
                </div>
            );

        case "TRUE_FALSE":
            // True/False is a binary choice challenge
            // Expanded detection patterns for various languages and formats
            const truePatterns = ['true', 'verdadeiro', 'verdade', 'v', 'sim', 'yes', 'correct', 'certo', 'correto'];
            const falsePatterns = ['false', 'falso', 'f', 'não', 'nao', 'no', 'incorrect', 'errado', 'incorreto'];

            const trueOption = options.find(opt => {
                const text = opt.text.toLowerCase().trim();
                return truePatterns.some(pattern => text === pattern || text.includes(pattern));
            });
            const falseOption = options.find(opt => {
                const text = opt.text.toLowerCase().trim();
                return falsePatterns.some(pattern => text === pattern || text.includes(pattern));
            });

            // Fallback: if exactly 2 options and couldn't detect patterns, use order (first=true, second=false)
            const useFallbackOrder = !trueOption && !falseOption && options.length === 2;
            const effectiveTrueOption = trueOption || (useFallbackOrder ? options[0] : null);
            const effectiveFalseOption = falseOption || (useFallbackOrder ? options[1] : null);

            return (
                <div className="space-y-6">
                    <HintSection />
                    <div className="text-center text-sm text-gray-400 mb-4">
                        Esta afirmação é verdadeira ou falsa?
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                        {/* True Button */}
                        <button
                            onClick={() => effectiveTrueOption && onSelect(effectiveTrueOption.id)}
                            disabled={disabled || !effectiveTrueOption}
                            aria-label="True"
                            className={cn(
                                "relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200",
                                "bg-customgreys-primarybg hover:bg-green-600/20",
                                selectedOption === effectiveTrueOption?.id
                                    ? "border-green-500 bg-green-600/20 ring-2 ring-green-400"
                                    : "border-violet-800 hover:border-green-500",
                                status === "correct" && selectedOption === effectiveTrueOption?.id && "border-green-500 bg-green-600/30",
                                status === "wrong" && selectedOption === effectiveTrueOption?.id && "border-red-500 bg-red-600/30",
                                (disabled || !effectiveTrueOption) && "pointer-events-none opacity-50"
                            )}
                        >
                            <Check className={cn(
                                "w-10 h-10 mb-2",
                                selectedOption === effectiveTrueOption?.id ? "text-green-400" : "text-green-500/50"
                            )} />
                            <span className={cn(
                                "text-lg font-bold",
                                selectedOption === effectiveTrueOption?.id ? "text-green-400" : "text-white"
                            )}>
                                Verdadeiro
                            </span>
                            <span className="text-xs text-gray-400 mt-1">Pressione 1</span>
                        </button>

                        {/* False Button */}
                        <button
                            onClick={() => effectiveFalseOption && onSelect(effectiveFalseOption.id)}
                            disabled={disabled || !effectiveFalseOption}
                            aria-label="False"
                            className={cn(
                                "relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200",
                                "bg-customgreys-primarybg hover:bg-red-600/20",
                                selectedOption === effectiveFalseOption?.id
                                    ? "border-red-500 bg-red-600/20 ring-2 ring-red-400"
                                    : "border-violet-800 hover:border-red-500",
                                status === "correct" && selectedOption === effectiveFalseOption?.id && "border-green-500 bg-green-600/30",
                                status === "wrong" && selectedOption === effectiveFalseOption?.id && "border-red-500 bg-red-600/30",
                                (disabled || !effectiveFalseOption) && "pointer-events-none opacity-50"
                            )}
                        >
                            <X className={cn(
                                "w-10 h-10 mb-2",
                                selectedOption === effectiveFalseOption?.id ? "text-red-400" : "text-red-500/50"
                            )} />
                            <span className={cn(
                                "text-lg font-bold",
                                selectedOption === effectiveFalseOption?.id ? "text-red-400" : "text-white"
                            )}>
                                Falso
                            </span>
                            <span className="text-xs text-gray-400 mt-1">Pressione 2</span>
                        </button>
                    </div>

                    {/* Fallback to regular cards if options don't match true/false pattern and not 2 options */}
                    {(!effectiveTrueOption || !effectiveFalseOption) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            {options.map((option, i) => (
                                <Card
                                    key={option.id}
                                    id={option.id}
                                    text={option.text}
                                    imageSrc={option.imageSrc || null}
                                    shortcut={`${i + 1}`}
                                    selected={selectedOption === option.id}
                                    onClick={() => onSelect(option.id)}
                                    status={status}
                                    audioSrc={option.audioSrc || null}
                                    disabled={disabled}
                                    type={type}
                                    isProcessing={isProcessing}
                                />
                            ))}
                        </div>
                    )}
                </div>
            );
            
        // Default cases: SELECT and ASSIST (original implementation)
        case "SELECT":
        case "ASSIST":
        default:
            // Check if there are valid options to display
            const validOptions = options.filter(opt => opt.text && opt.text.trim());

            // Show error if no valid options
            if (validOptions.length === 0) {
                return (
                    <div className="space-y-4">
                        <HintSection />
                        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-6 text-center">
                            <div className="text-red-400 text-lg font-semibold mb-2">
                                ⚠️ Exercício sem opções configuradas
                            </div>
                            <p className="text-gray-400 text-sm">
                                Este exercício não possui opções de resposta.
                                Por favor, entre em contato com o professor.
                            </p>
                        </div>
                    </div>
                );
            }

            return (
                <div className="space-y-4">
                    <HintSection />
                    <div className={cn(
                        "grid gap-2 sm:gap-3",
                        type === "ASSIST" && "grid-cols-1",
                        type === "SELECT" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    )}>
                        {validOptions.map((option, i) => (
                            <Card
                                key={option.id}
                                id={option.id}
                                text={option.text}
                                imageSrc={option.imageSrc || null}
                                shortcut={`${i + 1}`}
                                selected={selectedOption === option.id}
                                onClick={() => onSelect(option.id)}
                                status={status}
                                audioSrc={option.audioSrc || null}
                                disabled={disabled}
                                type={type}
                            />
                        ))}
                    </div>
                </div>
            );
    }
}