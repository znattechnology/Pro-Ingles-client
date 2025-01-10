"use client";

import Loading from "@/components/course/Loading";
import WizardStepper from "@/components/course/WizardStepper";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { useUser } from "@clerk/nextjs";
import React from "react";
import CheckoutDetailsPage from "./details";
import PaymentPage from "./payment";
import CompletionPage from "./completion";

const CheckoutWizard = () => {
  const { isLoaded } = useUser();
  const { checkoutStep } = useCheckoutNavigation();

  if (!isLoaded) return <Loading />;

  const renderStep = () => {
    switch (checkoutStep) {
      case 1:
        return <CheckoutDetailsPage />;
      case 2:
        return <PaymentPage />;
      case 3:
        return <CompletionPage />;
      default:
        return <CheckoutDetailsPage />;
    }
  };

  return (
    <div className="w-full px-4 h-full flex flex-col items-center py-12 mt-24">
      <WizardStepper currentStep={checkoutStep} />
      <div className="w-full max-w-screen-lg flex flex-col items-center mt-10">{renderStep()}</div>
    </div>
  );
};

export default CheckoutWizard;
