"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import React from "react";

const CompletionPage = () => {
  return (
    <div className="flex flex-col h-full items-center justify-center bg-background text-foreground bg-black">
      <div className="text-center">
        <div className="mb-4 rounded-full bg-green-500 p-3 inline-flex items-center justify-center">
          <Check className="w-16 h-16" />
        </div>
        <h1 className="text-4xl font-bold mb-3 text-white">CONCLUÍDO</h1>
        <p className="mb-1 text-white/70">
          🎉 Fez uma compra de curso com sucesso! 🎉
        </p>
      </div>
      <div className="completion__support">
        <p className="text-white/70">
        Precisa de ajuda? Entre em contacto com o nosso{" "}
          <Button variant="link" asChild className="p-0 m-0 text-violet-800">
            <a href="mailto:support@example.com">apoio ao cliente</a>
          </Button>
          .
        </p>
      </div>
      <div className=" mt-2 flex justify-center bg-violet-800 rounded-lg px-4 text-white py-2 hover:bg-violet-900 cursor-pointer">
        <Link href="user/courses" scroll={false}>
        Ir para os cursos
        </Link>
      </div>
    </div>
  );
};

export default CompletionPage;
