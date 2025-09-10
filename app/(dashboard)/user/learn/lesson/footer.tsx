import {useKey,useMedia} from "react-use";
import {CheckCircle, XCircle} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";


type Props = {
    onCheck: () => void;
    status: "correct" | "wrong" | "none" | "completed";
    disabled?: boolean;
    lessonId?: string | number; // Support both UUID strings and legacy numbers
};

export const Footer = ({onCheck,status,disabled,lessonId}:Props) => {

    useKey("Enter",onCheck , {},[onCheck])
    const isMobile = useMedia("(max-width: 1024px)");
    return (
        <footer className={cn(
            "lg:-h-[140px] h-[100px] border-t-2 mt-16",
            status === "correct" && "border-transparent bg-green-700/20",
            status === "wrong" && "border-transparent bg-rose-700/20",
        )}>
           <div className="max-w-[1140px] h-full mx-auto flex items-center justify-between px-6 lg:px-10">

                {status === "correct" && (
                    <div className="text-green-500 font-bold text-base lg:text-2xl flex items-center">
                        <CheckCircle className="h-6 w-6 lg:h-10 mr-4"/>
                        Well done!
                    </div>
                )}
                 {status === "wrong" && (
                    <div className="text-rose-500 font-bold text-base lg:text-2xl flex items-center">
                        <XCircle className="h-6 w-6 lg:h-10 mr-4"/>
                        Try again!
                    </div>
                )}
                 {status === "completed" && (
                  <Button variant="outline" size={isMobile ? "sm":"lg"} onClick={() => window.location.href=`/user/learn/lesson/${lessonId}`}>
                    Practice again
                  </Button>
                )}
                <Button
                disabled={disabled}
                className="ml-auto"
                onClick={onCheck}
                size={isMobile ? "sm" : "lg"}
                variant={status === "wrong" ? "destructive" : "secondary"}
                
                
                >
                    {status === "none" && "Check"}
                    {status === "correct" && "Next"}
                    {status === "wrong" && "Retry"}
                    {status === "completed" && "Continue"}
                   

                </Button>
           </div>
        </footer>
    )
}