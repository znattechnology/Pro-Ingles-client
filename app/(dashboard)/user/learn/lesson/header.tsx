import { X,HeartIcon,ZapIcon, InfinityIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useExitModal } from "@/store/use-exit-modal";

type Props = {
    hearts:number;
    percentage:number;
    hasActiveSubscription:boolean;
};


export const Header = ({hearts,percentage,hasActiveSubscription}:Props) => {
    const {open} = useExitModal();
    return (
        <div className="lg:pt-[50px] pt-[20px] px-10 flex gap-x-7 items-center justify-between max-w-[1140px] mx-auto w-full" >
            <X
            onClick={open}
            className="text-white hover:opacity-75 transition cursor-pointer"
            
            />
            <Progress value={percentage}
            
            />
            
            <HeartIcon className="h-5 w-5 stroke-2 text-rose-800" />
            {hasActiveSubscription ? (
          <InfinityIcon className="h-4 w-4 stroke-[3] text-rose-700" />
        ) : (
          <p className="text-rose-800 font-bold">{hearts}</p>
        )}
           
        </div>
    )
}