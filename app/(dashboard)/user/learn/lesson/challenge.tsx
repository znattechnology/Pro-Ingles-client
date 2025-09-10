import { cn } from "@/lib/utils";
import { Card } from "./card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Volume2, Mic } from "lucide-react";

// Django API types
interface ChallengeOption {
  id: string;
  text: string;
  is_correct?: boolean;
  imageSrc?: string;
  audioSrc?: string;
  order: number;
}

type Props = {
    options: ChallengeOption[];
    onSelect: (id: string) => void;
    status: "correct" | "wrong" | "none" | undefined;
    selectedOption?: string;
    disabled?: boolean;
    type: "SELECT" | "ASSIST" | "FILL_BLANK" | "TRANSLATION" | "LISTENING" | "SPEAKING" | "MATCH_PAIRS" | "SENTENCE_ORDER";
};

export const Challenge =({options,onSelect,status,selectedOption,disabled,type}:Props)=> {
    const [textInput, setTextInput] = useState("");
    const [draggedItems, setDraggedItems] = useState<string[]>([]);
    const [selectedPairs, setSelectedPairs] = useState<{[key: string]: string}>({});
    const [currentSelection, setCurrentSelection] = useState<{type: 'english' | 'portuguese', id: string, text: string} | null>(null);
    
    // Handle text input submission for TRANSLATION and FILL_BLANK
    const handleTextSubmit = () => {
        if (textInput.trim()) {
            // Find option that matches the input (for simplicity, using first option's ID)
            const firstOption = options[0];
            if (firstOption) {
                onSelect(firstOption.id);
            }
        }
    };
    
    // Handle sentence ordering
    const handleWordOrder = (wordId: string) => {
        if (draggedItems.includes(wordId)) {
            setDraggedItems(draggedItems.filter(id => id !== wordId));
        } else {
            setDraggedItems([...draggedItems, wordId]);
        }
    };
    
    // Submit ordered sentence
    const handleOrderSubmit = () => {
        if (draggedItems.length === options.length) {
            const firstOption = options[0];
            if (firstOption) {
                onSelect(firstOption.id);
            }
        }
    };
    
    // Handle pair matching
    const handlePairSelection = (type: 'english' | 'portuguese', id: string, text: string) => {
        if (disabled) return;
        
        if (!currentSelection) {
            // First selection
            setCurrentSelection({ type, id, text });
        } else {
            // Second selection - create pair if different types
            if (currentSelection.type !== type) {
                const englishWord = type === 'english' ? text : currentSelection.text;
                const portugueseWord = type === 'portuguese' ? text : currentSelection.text;
                const pairKey = type === 'english' ? id : currentSelection.id;
                
                setSelectedPairs(prev => ({
                    ...prev,
                    [pairKey]: `${englishWord} - ${portugueseWord}`
                }));
                setCurrentSelection(null);
            } else {
                // Same type selected, replace current selection
                setCurrentSelection({ type, id, text });
            }
        }
    };
    
    // Submit pairs
    const handlePairsSubmit = () => {
        if (Object.keys(selectedPairs).length === options.length) {
            // Check if all pairs are correct
            const isCorrect = options.every(option => {
                const selectedPair = selectedPairs[option.id];
                return selectedPair === option.text;
            });
            
            // Submit the first option (Django will handle the correctness)
            const firstOption = options[0];
            if (firstOption) {
                onSelect(firstOption.id);
            }
        }
    };
    
    // Render based on challenge type
    switch (type) {
        case "FILL_BLANK":
            return (
                <div className="space-y-4">
                    <div className="flex gap-2 items-center">
                        <Input 
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Type your answer here..."
                            disabled={disabled}
                            className="bg-customgreys-primarybg border-violet-800 text-white placeholder-gray-400"
                            onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                        />
                        <Button 
                            onClick={handleTextSubmit}
                            disabled={disabled || !textInput.trim()}
                            className="bg-violet-600 hover:bg-violet-700"
                        >
                            Submit
                        </Button>
                    </div>
                    <div className="text-sm text-gray-400">Or select from options below:</div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {options.map((option,i) => (
                            <Card
                                key={option.id}
                                id={option.id}
                                text={option.text}
                                imageSrc={option.imageSrc || null}
                                shortcut={`${i + 1}`}
                                selected={selectedOption === option.id}
                                onClick={()=> onSelect(option.id)}
                                status={status}
                                audioSrc={option.audioSrc || null}
                                disabled={disabled}
                                type={type}
                            />
                        ))}
                    </div>
                </div>
            );
            
        case "TRANSLATION":
            return (
                <div className="space-y-4">
                    <div className="bg-customgreys-primarybg border border-violet-800 rounded-lg p-4">
                        <textarea 
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Type your translation here..."
                            disabled={disabled}
                            className="w-full bg-transparent text-white placeholder-gray-400 resize-none outline-none"
                            rows={3}
                        />
                        <Button 
                            onClick={handleTextSubmit}
                            disabled={disabled || !textInput.trim()}
                            className="mt-2 bg-violet-600 hover:bg-violet-700"
                        >
                            Submit Translation
                        </Button>
                    </div>
                    <div className="text-sm text-gray-400">Or choose from options:</div>
                    <div className="grid grid-cols-1 gap-2">
                        {options.map((option,i) => (
                            <Card
                                key={option.id}
                                id={option.id}
                                text={option.text}
                                imageSrc={option.imageSrc || null}
                                shortcut={`${i + 1}`}
                                selected={selectedOption === option.id}
                                onClick={()=> onSelect(option.id)}
                                status={status}
                                audioSrc={option.audioSrc || null}
                                disabled={disabled}
                                type={type}
                            />
                        ))}
                    </div>
                </div>
            );
            
        case "LISTENING":
            return (
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <Button 
                            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-lg px-8 py-4"
                            disabled={disabled}
                        >
                            <Volume2 className="w-6 h-6" />
                            Play Audio
                        </Button>
                    </div>
                    <div className="text-center text-sm text-gray-400">Listen carefully and select what you hear:</div>
                    <div className="grid grid-cols-1 gap-2">
                        {options.map((option,i) => (
                            <Card
                                key={option.id}
                                id={option.id}
                                text={option.text}
                                imageSrc={option.imageSrc || null}
                                shortcut={`${i + 1}`}
                                selected={selectedOption === option.id}
                                onClick={()=> onSelect(option.id)}
                                status={status}
                                audioSrc={option.audioSrc || null}
                                disabled={disabled}
                                type={type}
                            />
                        ))}
                    </div>
                </div>
            );
            
        case "SPEAKING":
            return (
                <div className="space-y-4">
                    <div className="text-center">
                        <div className="bg-customgreys-primarybg border border-violet-800 rounded-lg p-6">
                            <div className="text-lg text-white mb-4">Practice saying this phrase:</div>
                            <div className="text-xl text-blue-400 mb-6 font-semibold">
                                {options[0]?.text || "Phrase to practice"}
                            </div>
                            <Button 
                                className="bg-red-600 hover:bg-red-700 flex items-center gap-2 text-lg px-8 py-4"
                                disabled={disabled}
                                onClick={() => options[0] && onSelect(options[0].id)}
                            >
                                <Mic className="w-6 h-6" />
                                Start Recording
                            </Button>
                        </div>
                    </div>
                </div>
            );
            
        case "MATCH_PAIRS":
            return (
                <div className="space-y-4">
                    <div className="text-center text-sm text-gray-400">Match the pairs by clicking them in order:</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="text-sm text-gray-400 text-center">English</div>
                            {options.map((option, i) => {
                                const [english] = option.text.split(' - ');
                                return (
                                    <div
                                        key={`en-${option.id}`}
                                        className={cn(
                                            "bg-customgreys-primarybg border border-violet-800 rounded-lg p-3 cursor-pointer hover:bg-violet-600/20",
                                            selectedOption === option.id && "border-blue-500 bg-blue-600/20"
                                        )}
                                        onClick={() => onSelect(option.id)}
                                    >
                                        <div className="text-white text-center">{english}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm text-gray-400 text-center">Português</div>
                            {options.map((option, i) => {
                                const [, portuguese] = option.text.split(' - ');
                                return (
                                    <div
                                        key={`pt-${option.id}`}
                                        className="bg-customgreys-primarybg border border-violet-800 rounded-lg p-3"
                                    >
                                        <div className="text-white text-center">{portuguese}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="text-center">
                        <Button 
                            onClick={() => options[0] && onSelect(options[0].id)}
                            disabled={disabled || !selectedOption}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Confirm Matches
                        </Button>
                    </div>
                </div>
            );
            
        case "SENTENCE_ORDER":
            return (
                <div className="space-y-4">
                    <div className="text-center text-sm text-gray-400">Drag the words to form the correct sentence:</div>
                    
                    {/* Selected words area */}
                    <div className="bg-customgreys-primarybg border border-violet-800 rounded-lg p-4 min-h-[60px]">
                        <div className="text-sm text-gray-400 mb-2">Your sentence:</div>
                        <div className="flex flex-wrap gap-2">
                            {draggedItems.map((wordId, index) => {
                                const word = options.find(opt => opt.id === wordId);
                                return (
                                    <div 
                                        key={wordId}
                                        className="bg-blue-600 text-white px-3 py-1 rounded-md cursor-pointer"
                                        onClick={() => handleWordOrder(wordId)}
                                    >
                                        {word?.text}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Available words */}
                    <div className="space-y-2">
                        <div className="text-sm text-gray-400 text-center">Available words:</div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {options.filter(opt => !draggedItems.includes(opt.id)).map((option) => (
                                <div 
                                    key={option.id}
                                    className="bg-customgreys-primarybg border border-violet-800 text-white px-3 py-2 rounded-md cursor-pointer hover:bg-violet-600/20"
                                    onClick={() => handleWordOrder(option.id)}
                                >
                                    {option.text}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <Button 
                            onClick={handleOrderSubmit}
                            disabled={disabled || draggedItems.length !== options.length}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Submit Sentence
                        </Button>
                    </div>
                </div>
            );
            
        // Default cases: SELECT and ASSIST (original implementation)
        case "SELECT":
        case "ASSIST":
        default:
            return (
                <div className={cn(
                    "grid gap-2", 
                    type === "ASSIST" && "grid-cols-1",
                    type === "SELECT" && "grid-cols-2 lg:grid-cols-3"
                )}>
                    {options.map((option,i) => (
                        <Card
                            key={option.id}
                            id={option.id}
                            text={option.text}
                            imageSrc={option.imageSrc || null}
                            shortcut={`${i + 1}`}
                            selected={selectedOption === option.id}
                            onClick={()=> onSelect(option.id)}
                            status={status}
                            audioSrc={option.audioSrc || null}
                            disabled={disabled}
                            type={type}
                        />
                    ))}
                </div>
            );
    }
}