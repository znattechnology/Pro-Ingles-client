"use client";
import { Button } from "@/components/ui/button";
import {  HeartIcon,ZapIcon } from "lucide-react";

type Props = {
    hearts: number;
    points: number;
    hasActiveSubscription: boolean;
}

export const Items = ({
    hearts, hasActiveSubscription,points
}:Props) => {
    return (
        <ul className="w-full">
            <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
            <HeartIcon className="mr-2 w-20 h-20 text-rose-900" />
            <div className="flex-1">
                <p className="text-slate-400 text-base lg:text-xl font-bold">
                    Refill hearts
                </p>
            </div>
            <Button
         variant="outline"
         
            
            
            >
                   {hearts === 5 ? "Full" : (
                <div className="flex items-center">
                     <ZapIcon className="h-5 w-5 stroke-2 text-orange-600" />
                    <p>50</p>
                </div>
            )}

            </Button>
            </div>
        </ul>
    )
}