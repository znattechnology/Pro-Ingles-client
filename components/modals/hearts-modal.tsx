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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useHeartsModal } from "@/store/use-hearts-modal";
export const HeartstModal = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useHeartsModal();

  useEffect(() => setIsClient(true), []);

  const onClick = () => {
    close();
    router.push("/user/learn/store");
  }
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
           Sem corações
          </DialogTitle>
          <DialogDescription className="text-center text-base ">
            Você não tem corações o suficiente para saber se a resposta esta correcta ou errada assine o plano Pro
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4">
          <div className="flex flex-col gap-y-4 w-full">
            <Button variant="secondary" className="w-full" size="lg" onClick={onClick}>Ger unlimited hearts</Button>
            <Button variant="outline" className="w-full" size="lg" onClick={
              close}>No thanks</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
