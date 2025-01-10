import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import { useCreateOrderMutation } from "@/redux/features/orders/ordersApi";
import { useElements, useStripe } from "@stripe/react-stripe-js";

import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  LinkAuthenticationElement,
} from "@stripe/react-stripe-js";
import { styles } from "@/styles/style";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";
import socketIO from "socket.io-client";
const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

type Props = {
  setOpen: any;
  data: any;
  user:any;
  refetch:any;
};

const CheckOutForm = ({ setOpen, data, user,refetch }: Props) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<any>("");
  const [createOrder, { data: orderData, error }] = useCreateOrderMutation();
  const [loadUser, setLoadUser] = useState(false);
  const {} = useLoadUserQuery({ skip: loadUser ? false : true });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!stripe || !elements) {
        return;
    }
    setIsLoading(true);
    const {error, paymentIntent} = await stripe.confirmPayment({
        elements,
        redirect:"if_required"
    });
    if (error) {
        setMessage(error.message);
        setIsLoading(false);
    }else if (paymentIntent && paymentIntent.status === "succeeded"){
        setIsLoading(false);
        createOrder({courseId: data.course._id, payment_info: paymentIntent})
    }
  };

  useEffect(() => {
    if(orderData){
        // setLoadUser(true);
        refetch();
        socketId.emit("notification", {
           title: "New Order",
           message: `You have a new order from ${data.name}`,
           userId: user._id,
        });
        redirect(`/admin/content/course-access/${data.course._id}`)
    }
    if (error) {
        if ("data" in error) {
            const errorMessage = error as any;
            toast.error(errorMessage.data.message);
        }
    }
  },[orderData, error]);



//   const paymentElementOptions = {
//     appearance: {
//       theme: 'night',
//       variables: {
//         colorBackground: '#000000',
//         colorText: '#ffffff',
//         fontFamily: 'Poppins, sans-serif',
//         fontSizeBase: '16px',
//         spacingUnit: '4px',
//         borderRadius: '8px',
//         colorPrimary: '#7c3aed',
//         colorTextPlaceholder: '#aab7c4',
//       },
//       rules: {
//         '.Input': {
//           color: '#ffffff',
//         },
//         '.Input:focus': {
//           borderColor: '#7c3aed',
//         },
//         '.Label': {
//           color: '#ffffff',
//         },
//       },
//     },
//   };

  


  return (
    <form id="payment-form"  onSubmit={handleSubmit}>
      <LinkAuthenticationElement 
        id="link-authentication-element"
       
        // Access the email value like so:
        // onChange={(event) => {
        //  setEmail(event.value.email);s
        // }}
        //
        // Prefill the email field like so:
        // options={{defaultValues: {email: 'foo@bar.com'}}}
      />
      <PaymentElement  id="payment-element"   />
      <button disabled={isLoading || !stripe || !elements} id="submit">
        <span id="button-text" className={`${styles.button} mt-2 h-10`}>
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pagar"}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message" className="text-red-500">{message}</div>}
    </form>
  );
};

export default CheckOutForm;
