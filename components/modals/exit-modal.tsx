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
import { useExitModal } from "@/store/use-exit-modal";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export const ExitModal = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useExitModal();

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
            Espera, não vás!
          </DialogTitle>
          <DialogDescription className="text-center text-base ">
            Estás prestes a sair da lição. Tens a certeza?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4">
          <div className="flex flex-col gap-y-4 w-full">
            <Button variant="secondary" className="w-full" size="lg" onClick={close}>CONTINUAR APRENDENDO</Button>
            <Button variant="destructive" className="w-full" size="lg" onClick={() => {
                close();
                router.push("/user/laboratory/learn")
            }}>SAIR DA LIÇÃO</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
