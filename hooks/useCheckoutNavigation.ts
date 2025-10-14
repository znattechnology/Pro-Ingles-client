"use client";

import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect } from "react";

export const useCheckoutNavigation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useDjangoAuth();

  const courseId = searchParams.get("id") ?? "";
  const checkoutStep = parseInt(searchParams.get("step") ?? "1", 10);

  const navigateToStep = useCallback(
    (step: number) => {
      const newStep = Math.min(Math.max(1, step), 3);
      const showSignUp = isAuthenticated ? "true" : "false";

      router.push(
        `/checkout?step=${newStep}&id=${courseId}&showSignUp=${showSignUp}`,
        {
          scroll: false,
        }
      );
    },
    [courseId, isAuthenticated, router]
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated && checkoutStep > 1) {
      navigateToStep(1);
    }
  }, [isLoading, isAuthenticated, checkoutStep, navigateToStep]);

  return { checkoutStep, navigateToStep };
};
