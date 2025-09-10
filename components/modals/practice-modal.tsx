"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import Image from "next/image";

import { useEffect, useState } from "react";
import { usePracticeModal } from "@/store/use-practice-modal";
export const PracticeModal = () => {

  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = usePracticeModal();

  useEffect(() => setIsClient(true), []);


  if (!isClient) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={close} >
      <DialogContent
        className="max-w-md "
      >
        <DialogHeader>
          <div className="flex items-center w-full justify-center mb-5">
            <Image src="/mascot.jpg" alt="Mascot" height={80} width={80} />
          </div>
          <DialogTitle className="text-center font-bold text-2xl">
          Aula prática
          </DialogTitle>
          <DialogDescription className="text-center text-base ">
          utilize lições práticas para recuperar corações e pontos. não poderá perder corações ou pontos na aula prática
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4">
          <div className="flex flex-col gap-y-4 w-full">
            
            <Button variant="secondary" className="w-full" size="lg" onClick={
              close}>Eu entendo</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
