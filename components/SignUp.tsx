"use client";

import { SignUp, useUser } from "@clerk/nextjs";
import React from "react";

import { useSearchParams } from "next/navigation";

const SignUpComponent = () => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const isCheckoutPage = searchParams.get("showSignUp") !== null;
  const courseId = searchParams.get("id");

  const signInUrl = isCheckoutPage
    ? `/checkout?step=1&id=${courseId}&showSignUp=false`
    : "/signin";

  const getRedirectUrl = () => {
    if (isCheckoutPage) {
      return `/checkout?step=2&id=${courseId}&showSignUp=false`;
    }

    const userType = user?.publicMetadata?.userType as string;
    if (userType === "teacher") {
      return "/teacher/courses";
    }
    return "/user/courses";
  };

  return (
    <SignUp
    appearance={{
      elements: {
        rootBox: "flex justify-center items-center py-5 bg-black", 
        cardBox: "shadow-none bg-black", 
        card: "bg-black w-full shadow-none", 
        headerTitle: "text-white",
        socialButtonsBlockButton: "border border-white", // Tentativa de borda branca
        socialButtonsBlockButtonText: "text-white", // Garante texto branco
        socialButtonsBlockButtonIcon: "text-white", // Garante ícones brancos
        socialButtonsProviderButton: "border border-white", // Outra tentativa de seletor
        footer: {
          background: "black",
          padding: "0rem 2.5rem",
          "& > div > div:nth-child(1)": {
            background: "black",
          },
        },
        formFieldLabel: "text-white font-normal", 
        formButtonPrimary: "bg-violet-800 text-white hover:bg-violet-900 !shadow-none", 
        formFieldInput: "bg-gray-900 text-white !shadow-none", 
        footerActionLink: "text-white hover:text-white",
      }, 
      }}
      signInUrl={signInUrl}
      forceRedirectUrl={getRedirectUrl()}
      routing="hash"
      afterSignOutUrl="/"
    />
  );
};

export default SignUpComponent;
