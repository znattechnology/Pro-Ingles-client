import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCallback } from "react";
import {useAudio, useKey} from "react-use";

type Props = {
    id: string;
    imageSrc: string | null;
    audioSrc:string | null;
    text:string;
    shortcut:string;
    selected?:boolean;
    onClick:() => void;
    disabled?: boolean;
    status?: "correct" | "wrong" | "none";
    type: "SELECT" | "ASSIST" | "FILL_BLANK" | "TRANSLATION" | "LISTENING" | "SPEAKING" | "MATCH_PAIRS" | "SENTENCE_ORDER";
    isProcessing?: boolean;
};

export const Card = ({imageSrc,text,shortcut,selected,status,onClick,disabled,type, audioSrc, isProcessing}:Props) => {

        const [audio , _, controls] = useAudio({ src: audioSrc || ""});
       
        const handleClick = useCallback(()=> {
            if (disabled) return null;
            
            controls.play();
            onClick();
        },[disabled,onClick, controls]);

        useKey(shortcut,handleClick,{},[handleClick])


    return (
        
        <div 
        onClick={handleClick}
        className={cn("min-h-[48px] sm:h-full border border-violet-800 rounded-xl border-b-2 hover:bg-slate-400/10 p-3 sm:p-4 lg:p-6 cursor-pointer active:border-b-2 transition-all duration-200",
            selected && "border-sky-900 bg-sky-700/20 hover:bg-sky-600/20",
            selected && status === "correct" 
            && "border-green-900 bg-green-700/20 hover:bg-green-600/20",
            selected && status === "wrong" 
            && "border-rose-900 bg-rose-700/20 hover:bg-rose-600/20",
            disabled && "pointer-events-none hover:bg-slate-200",
            isProcessing && "opacity-60 pointer-events-none animate-pulse",
            type === "ASSIST" && "lg:p-3 w-full",
            (type === "TRANSLATION" || type === "LISTENING") && "w-full",
            (type === "FILL_BLANK" || type === "MATCH_PAIRS" || type === "SENTENCE_ORDER") && "hover:bg-violet-600/20"
        )}>
            {audio}
            {imageSrc && (
                <div className="relative aspect-square mb-2 sm:mb-4 max-h-[60px] sm:max-h-[80px] lg:max-h-[150px] w-full">
                    <Image src={imageSrc} fill alt={text} sizes="(max-width: 640px) 60px, (max-width: 768px) 80px, 150px"/>
                </div>
            )}
            <div className={cn(
                "flex items-center justify-between gap-2",
                type === "ASSIST" && "flex-row-reverse",
                (type === "TRANSLATION" || type === "LISTENING") && "justify-center"
            )}>
                {type === "ASSIST" && <div/>}
                <p className={cn(
                    "text-white text-xs sm:text-sm lg:text-base flex-1 leading-tight",
                    selected && "text-sky-500",
                    selected && status === "correct" 
                    && "text-green-500",
                    selected && status === "wrong" && "text-rose-500",
                    (type === "TRANSLATION" || type === "LISTENING") && "text-center"
                )}>{text}</p>
                <div className={cn(
                    "w-6 h-6 sm:w-7 sm:h-7 lg:w-[30px] lg:h-[20px] border flex items-center justify-center rounded-lg text-white text-xs lg:text-[15px] font-bold flex-shrink-0",
                    selected && "border-sky-300 text-sky-500",
                    selected && status === "correct" 
                    && "border-green-300 text-green-500",
                    selected && status === "wrong" && "border-rose-300 text-rose-500"
                )}>
                    {shortcut}

                </div>

            </div>
        </div>
    )
}