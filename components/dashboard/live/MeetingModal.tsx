import React, { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  buttonText?: string;
  handleClick?: () => void;
  children?: React.ReactNode;
  icon?: string;
  buttonIcon?: string;
  image?:string 
  
};

const MeetingModal: FC<Props> = ({
  isOpen,
  onClose,
  title,
  className,
  buttonText,
  handleClick,
  children,
  buttonIcon,
  image
  
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>

<DialogTitle>
              My Dialog Title
            </DialogTitle>
    
     
    <DialogContent className="flex w-full max-w-[520px] flex-col gap-6 border-none bg-primary-black px-6 py-9 text-white">
            <div className="flex flex-col gap-6">
                {image && (
                    <div className="flex justify-center">
                        <Image src={image} alt="Image" width={72} height={72}/>
                    </div>
                )}
                <h1 className={cn('text-3xl font-bold leading-[42px]',className)}>{title}</h1>
                {children}
                <Button className="bg-violet-500 bg-opacity-20 focus-visible:right-0 focus-visible:ring-offset-0" onClick={handleClick}>
                    {buttonIcon && (<Image src={buttonIcon} alt="buttonIcon" width={13} height={13}/>)}&nbsp;
                    {buttonText || 'Iniciar Live'}
                </Button>
            </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingModal;
