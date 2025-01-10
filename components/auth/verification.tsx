import { styles } from "@/styles/style";
import { useActivationMutation } from "@/redux/features/auth/authApi";
import React, { FC, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Icon } from '@iconify/react';
import { Button } from "../ui/button";

import { Loader2, Lock } from "lucide-react";
import { Input } from "../ui/input";

type Props = {
  setRoute: (route: string) => void;
};

type VerifyNumber = {
  "0": string;
  "1": string;
  "2": string;
  "3": string;
};

const Verification: FC<Props> = ({ setRoute }) => {
  const { token } = useSelector((state: any) => state.auth);
  const [activation, { isSuccess, error, isLoading }] = useActivationMutation();
  const [invalidError, setInvalidError] = useState<boolean>(false);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Conta activada com sucesso");
      setRoute("Login");
    }
    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message);
        setInvalidError(true);
      } else {
        console.log("Alguma coisa não correu bem ", error);
      }
    }
  }, [isSuccess, error, isLoading]);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const [verifyNumber, setVerifyNumber] = useState<VerifyNumber>({
    0: "",
    1: "",
    2: "",
    3: "",
  });

  const verificationHandler = async () => {
    const verificationNumber = Object.values(verifyNumber).join("");
    if (verificationNumber.length !== 4) {
      setInvalidError(true);
      return;
    }
    await activation({
      activation_token: token,
      activation_code: verificationNumber,
    });
  };

  const handlerInputChange = (index: number, value: string) => {
    setInvalidError(false);
    const newVerifyNumber = { ...verifyNumber, [index]: value };
    setVerifyNumber(newVerifyNumber);

    if (value === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (value.length === 1 && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  return (
    <div>
      <h1 className={`${styles.title}`}>Código de verificação</h1>
      <br />
      <div className="w-full flex items-center  justify-center mt-2">
        <div className="w-[50px] h-[50px]  rounded-full bg-violet-600 flex items-center justify-center">
        <Icon icon="lucide:lock" width="24" height="24" />
        </div>
      </div>
      <br />
      <div className=" m-auto flex items-center justify-around gap-2">
        {Object.keys(verifyNumber).map((key, index) => (
          <Input
          disabled={isLoading}
            type="number"
            key={key}
            ref={inputRefs[index]}
            className={`w-[75px] h-[30px] bg-transparent border-[1px] rounded-[10px] flex items-center text-white justify-center text-[18px] p-2 font-Poppins outline-none text-center ${
              invalidError
                ? "shake border-red-500"
                : "dark:border-white border-violet-600"
            }`}
            placeholder=""
            maxLength={1}
            value={verifyNumber[key as keyof VerifyNumber]}
            onChange={(e) => handlerInputChange(index, e.target.value)}
          />
        ))}
      </div>
      <br />
      <br />
      <div className="w-full h-10 flex justify-center">
        {/* <button className={`${styles.button} `} onClick={verificationHandler}>
          Vericação do OTP
        </button> */}

        <Button disabled={isLoading}  value="Registrar-se" onClick={verificationHandler} className={`${styles.button} h-10 bg-violet-600 mt-5`}>
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-white"/>
        ):
        (
          <span> Vericação do OTP</span>
        )}
       </Button>
      </div>
      <br />
      <h5 className="text-center pt-4 font-Poppins text-white dark:text-white">
        Voltar para o login ?{" "}
        <span
          className="text-violet-600 pl-1 cursor-pointer"
          onClick={() => setRoute("Login")}
        >
          Login
        </span>
      </h5>
    </div>
  );
};

export default Verification;
