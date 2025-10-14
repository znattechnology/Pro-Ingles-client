import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { ChallengeOption } from "@/redux/features/api/practiceApiSlice";

type Props = {
    options: ChallengeOption[];
    onSelect: (id: string) => void;
    status: "correct" | "wrong" | "none" | undefined;
    selectedOption?: string;
    disabled?: boolean;
    type: "SELECT" | "ASSIST";
};

export const Challenge = ({
    options,
    onSelect,
    status,
    selectedOption,
    disabled,
    type
}: Props) => {
    return (
        <div className={cn(
            "grid gap-2", 
            type === "ASSIST" && "grid-cols-1",
            type === "SELECT" && "grid-cols-2 lg:grid-cols-3"
        )}>
            {options.map((option, i) => (
                <Card
                    key={option.id}
                    id={option.id}
                    text={option.text}
                    imageSrc={option.image_url}
                    shortcut={`${i + 1}`}
                    selected={selectedOption === option.id}
                    onClick={() => onSelect(option.id)}
                    status={status}
                    audioSrc={option.audio_url}
                    disabled={disabled}
                    type={type}
                />
            ))}
        </div>
    );
};