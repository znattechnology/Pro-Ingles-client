import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
    type: "SELECT" | "ASSIST";
};

export const Card = ({
    id,
    imageSrc,
    text,
    shortcut,
    selected,
    status,
    onClick,
    disabled,
    type,
    audioSrc
}: Props) => {
    const handleClick = useCallback(() => {
        if (disabled) return;
        
        // Play audio if available
        if (audioSrc) {
            const audio = new Audio(audioSrc);
            audio.play().catch(console.error);
        }
        
        onClick();
    }, [disabled, onClick, audioSrc]);

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === shortcut && !disabled) {
            handleClick();
        }
    }, [shortcut, disabled, handleClick]);

    // Add event listener for keyboard shortcuts
    React.useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div 
            onClick={handleClick}
            className={cn(
                "h-full border-2 border-gray-200 rounded-xl border-b-4 hover:bg-gray-100 p-4 lg:p-6 cursor-pointer active:border-b-2 transition-all",
                selected && "border-sky-300 bg-sky-100 hover:bg-sky-100",
                selected && status === "correct" && "border-green-300 bg-green-100 hover:bg-green-100",
                selected && status === "wrong" && "border-red-300 bg-red-100 hover:bg-red-100",
                disabled && "pointer-events-none hover:bg-gray-100 opacity-75",
                type === "ASSIST" && "lg:p-3 w-full"
            )}
        >
            {imageSrc && (
                <div className="relative aspect-square mb-4 max-h-[80px] lg:max-h-[150px] w-full">
                    <Image 
                        src={imageSrc} 
                        fill 
                        alt={text}
                        className="object-cover rounded-lg"
                    />
                </div>
            )}
            
            <div className={cn(
                "flex items-center justify-between",
                type === "ASSIST" && "flex-row-reverse"
            )}>
                {type === "ASSIST" && <div />}
                
                <p className={cn(
                    "text-gray-700 text-sm lg:text-base font-medium",
                    selected && "text-sky-600",
                    selected && status === "correct" && "text-green-600",
                    selected && status === "wrong" && "text-red-600"
                )}>
                    {text}
                </p>
                
                <div className={cn(
                    "lg:w-[30px] lg:h-[20px] h-[20px] w-[20px] border-2 flex items-center justify-center rounded-lg text-gray-700 lg:text-[15px] text-xs font-bold",
                    selected && "border-sky-300 text-sky-600",
                    selected && status === "correct" && "border-green-300 text-green-600",
                    selected && status === "wrong" && "border-red-300 text-red-600"
                )}>
                    {shortcut}
                </div>
            </div>
        </div>
    );
};