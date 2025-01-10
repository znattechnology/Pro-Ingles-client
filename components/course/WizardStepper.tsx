import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import React from "react";

const WizardStepper = ({ currentStep }: WizardStepperProps) => {
  return (
    <div className="w-1/2 mb-4 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        {[1, 2, 3].map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={cn("w-8 h-8 flex items-center justify-center rounded-full mb-2", {
                  "bg-green-500":
                    currentStep > step || (currentStep === 3 && step === 3),
                  "bg-violet-800 text-white":
                    currentStep === step && step !== 3,
                  "border border-customgreys-dirtyGrey text-customgreys-dirtyGrey": currentStep < step,
                })}
              >
                {currentStep > step || (currentStep === 3 && step === 3) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              <p
                className={cn("text-sm", {
                  "text-white": currentStep >= step,
                  "text-customgreys-dirtyGrey": currentStep < step,
                })}
              >
                {step === 1 && "Detalhes"}
                {step === 2 && "Pagamento"}
                {step === 3 && "Conclusão"}
              </p>
            </div>
            {index < 2 && (
              <div
                className={cn("w-1/4 h-[1px] self-start mt-4", {
                  "bg-green-500": currentStep > step,
                  "bg-customgreys-dirtyGrey": currentStep <= step,
                })}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WizardStepper;
