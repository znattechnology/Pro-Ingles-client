
import React from "react";
import StripeProvider from "./StripeProvider";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import { useClerk, useUser } from "@clerk/nextjs";
import CoursePreview from "@/components/course/CoursePreview";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateTransactionMutation } from "@/state/api";
import { toast } from "sonner";

const PaymentPageContent = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [createTransaction] = useCreateTransactionMutation();
  const { navigateToStep } = useCheckoutNavigation();
  const { course, courseId } = useCurrentCourse();
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica se o Stripe e os elementos estão disponíveis
    if (!stripe || !elements) {
      toast.error("Stripe service is not available");
      return;
    }

    try {
      // Define a URL base com suporte para diferentes ambientes
      const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL
        ? `http://${process.env.NEXT_PUBLIC_LOCAL_URL}`
        : process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : undefined;

      // Confirmação do pagamento
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${baseUrl}/checkout?step=3&id=${courseId}`,
        },
        redirect: "if_required",
      });

      // Verifica o status do pagamento
      if (result.paymentIntent?.status === "succeeded") {
        const transactionData: Partial<Transaction> = {
          transactionId: result.paymentIntent.id,
          userId: user?.id,
          courseId,
          paymentProvider: "stripe",
          amount: course?.price || 0,
        };

        // Cria a transação e navega para o próximo passo
        await createTransaction(transactionData);
        navigateToStep(3);
      } else {
        toast.error("Payment not completed successfully.");
      }
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error("An error occurred during the payment process.");
    }
  };

  // Função para deslogar e navegar para o início do checkout
  const handleSignOutAndNavigate = async () => {
    await signOut();
    navigateToStep(1);
  };

  if (!course) return null;

  return (
    <div className="flex flex-col w-full">
      <div className="sm:flex gap-10 mb-6">
        {/* Resumo do Pedido */}
        <div className="basis-1/2 rounded-lg">
          <CoursePreview course={course} />
        </div>

        {/* Formulário de Pagamento */}
        <div className="basis-1/2">
          <form
            id="payment-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="flex flex-col gap-4 bg-slate-900/30 px-10 py-10 rounded-lg">
              <h1 className="text-2xl font-bold text-white">Checkout</h1>
              <p className="text-sm text-white/70">
                Preencha os dados de pagamento abaixo para finalizar a sua compra.
              </p>

              <div className="flex flex-col gap-2 w-full mt-6">
                <h3 className="text-md text-white/70">Método de pagamento</h3>

                <div className="flex flex-col border-[2px] border-white-100/5 rounded-lg">
                  <div className="flex items-center gap-2 bg-white-50/5 py-2 px-2">
                    <CreditCard size={24} />
                    <span>Credit/Debit Card</span>
                  </div>
                  <div className="px-4 py-6">
                    <PaymentElement />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Botões de Navegação */}
      <div className="flex justify-between items-center w-full mt-6">
        <Button
          className="hover:bg-white-50/10"
          onClick={handleSignOutAndNavigate}
          variant="outline"
          type="button"
        >
          Mudar de conta
        </Button>

        <Button
          form="payment-form"
          type="submit"
          className="hover:bg-violet-800 bg-violet-900"
          disabled={!stripe || !elements}
        >
          {stripe && elements ? "Pague com cartão de crédito" : "Aguarde..."}
        </Button>
      </div>
    </div>
  );
};

const PaymentPage = () => (
  <StripeProvider>
    <PaymentPageContent />
  </StripeProvider>
);

export default PaymentPage;




// import React from "react";
// import StripeProvider from "./StripeProvider";
// import {
//   PaymentElement,
//   useElements,
//   useStripe,
// } from "@stripe/react-stripe-js";
// import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
// import { useCurrentCourse } from "@/hooks/useCurrentCourse";
// import { useClerk, useUser } from "@clerk/nextjs";
// import CoursePreview from "@/components/course/CoursePreview";
// import { CreditCard } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useCreateTransactionMutation } from "@/state/api";
// import { toast } from "sonner";

// const PaymentPageContent = () => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [createTransaction] = useCreateTransactionMutation();
//   const { navigateToStep } = useCheckoutNavigation();
//   const { course, courseId } = useCurrentCourse();
//   const { user } = useUser();
//   const { signOut } = useClerk();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!stripe || !elements) {
//       toast.error("Stripe service is not available");
//       return;
//     }

//     const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL
//       ? `http://${process.env.NEXT_PUBLIC_LOCAL_URL}`
//       : process.env.NEXT_PUBLIC_VERCEL_URL
//       ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
//       : undefined;

//     const result = await stripe.confirmPayment({
//       elements,
//       confirmParams: {
//         return_url: `${baseUrl}/checkout?step=3&id=${courseId}}`,
//         // `${baseUrl}/checkout?step=3&id=${courseId}`,
//       },
//       redirect: "if_required",
//     });

//     if (result.paymentIntent?.status === "succeeded") {
//       const transactionData: Partial<Transaction> = {
//         transactionId: result.paymentIntent.id,
//         userId: user?.id,
//         courseId: courseId,
//         paymentProvider: "stripe",
//         amount: course?.price || 0,
//       };

//       await createTransaction(transactionData), navigateToStep(3);
//     }
//   };

//   const handleSignOutAndNavigate = async () => {
//     await signOut();
//     navigateToStep(1);
//   };

//   if (!course) return null;

//   return (
//     <div className="flex flex-col w-full">
//       <div className="sm:flex gap-10 mb-6">
//         {/* Order Summary */}
//         <div className="basis-1/2 rounded-lg">
//           <CoursePreview course={course} />
//         </div>

//         {/* Pyament Form */}
//         <div className="basis-1/2">
//           <form
//             id="payment-form"
//             onSubmit={handleSubmit}
//             className="space-y-4"
//           >
//             <div className="flex flex-col gap-4 bg-slate-900/30 px-10 py-10 rounded-lg">
//               <h1 className="text-2xl font-bold text-white">Checkout</h1>
//               <p className="text-sm text-white/70">
//               Preencha os dados de pagamento abaixo para finalizar a sua compra.
//               </p>

//               <div className="flex flex-col gap-2 w-full mt-6">
//                 <h3 className="text-md text-white/70">Método de pagamento</h3>

//                 <div className="flex flex-col border-[2px] border-white-100/5 rounded-lg">
//                   <div className="flex items-center gap-2 bg-white-50/5 py-2 px-2">
//                     <CreditCard size={24} />
//                     <span>Credit/Debit Card</span>
//                   </div>
//                   <div className="px-4 py-6">
//                     <PaymentElement />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Navigation Buttons */}
//       <div className="flex justify-between items-center w-full mt-6">
//         <Button
//           className="hover:bg-white-50/10"
//           onClick={handleSignOutAndNavigate}
//           variant="outline"
//           type="button"
//         >
//           Mudar de conta
//         </Button>

//         <Button
//           form="payment-form"
//           type="submit"
//           className="hover:bg-violet-800 bg-violet-900"
//           disabled={!stripe || !elements}
//         >
//           Pague com cartão de crédito
//         </Button>
//       </div>
//     </div>
//   );
// };

// const PaymentPage = () => (
//   <StripeProvider>
//     <PaymentPageContent />
//   </StripeProvider>
// );

// export default PaymentPage;
