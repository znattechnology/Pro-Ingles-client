"use client";
import React, { FC, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiFillGithub,
} from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { styles } from "@/styles/style";
import { useRegisterMutation } from "@/redux/features/auth/authApi";
import toast from "react-hot-toast";
import { Button } from "../ui/button";

import { Loader2} from "lucide-react";
import { Input } from "../ui/input";

type Props = {
  setRoute: (route: string) => void;
};

const schema = Yup.object().shape({
  name: Yup.string().required("O campo nome é obrigatório"),
  email: Yup.string()
    .email("Email não válido")
    .required("O campo email é obrigatório"),
  password: Yup.string().required("O campo senha é obrigatório").min(6),
});

const SignUp: FC<Props> = ({ setRoute }) => {
  const [show, setShow] = useState(false);
  const [register, { data, isLoading, isSuccess, error}] = useRegisterMutation();

  useEffect(()=>{
    if (isSuccess) {
      const message = data?.message || "Usuário registrado com sucesso";
      toast.success(message);
      setRoute("verification");
    }

    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message);
      }
    }
  },[isSuccess, error, isLoading]);

  const formik = useFormik({
    initialValues: { email: "", password: "", name: "" },
    validationSchema: schema,
    onSubmit: async ({ name, email, password }) => {
      const data = {
        name, email, password
      };
      await register(data);
    },
  });

  const { errors, touched, values, handleChange, handleSubmit } = formik;

  return (
    <div className="w-[400px]">
      <h1 className={`${styles.title}`}>Registrar-se</h1>
      <form onSubmit={handleSubmit}>
        {/* Label for the login form */}
        <label className={`${styles.label}`} htmlFor="text">
          Nome
        </label>

        {/* Input name for the login form */}
        <Input
        disabled={isLoading}
          type="text"
          name=""
          value={values.name}
          onChange={handleChange}
          id="name"
          placeholder="john"
          className={`${errors.name && touched.name && "border-red-500"} ${
            styles.input
          }`}
        />
        {/* error message for the login form */}
        {errors.name && touched.name && (
          <span className="text-red-500 pt-2 block">{errors.name}</span>
        )}

        {/* Label for the login form */}
        <label className={`${styles.label}`} htmlFor="email">
          Email
        </label>

        {/* Input email for the login form */}
        <Input
        disabled={isLoading}
          type="email"
          name=""
          value={values.email}
          onChange={handleChange}
          id="email"
          placeholder="loginmail@gmail.com"
          className={`${errors.email && touched.email && "border-red-500"} ${
            styles.input
          }`}
        />
        {/* error message for the login form */}
        {errors.email && touched.email && (
          <span className="text-red-500 pt-2 block">{errors.email}</span>
        )}
        <div className="w-full mt-5 relative mb-1">
          <label className={`${styles.label}`} htmlFor="email">
            Senha
          </label>
          {/* input for password  */}
          <Input
          disabled={isLoading}
            type={!show ? "password" : "text"}
            name="password"
            value={values.password}
            onChange={handleChange}
            id="password"
            placeholder="*******"
            className={`${
              errors.password && touched.password && "border-red-500"
            } ${styles.input}`}
          />
          {!show ? (
            <AiOutlineEyeInvisible
              className="absolute bottom-3 right-2 z-1 cursor-pointer"
              size={20}
              onClick={() => setShow(true)}
            />
          ) : (
            <AiOutlineEye
              className="absolute bottom-3 right-2 z-1 cursor-pointer"
              size={20}
              onClick={() => setShow(false)}
            />
          )}
      
        </div>
            {/* error for the passwor field */}
            {errors.password && touched.password && (
            <span className="text-red-500 pt-2 block">{errors.password}</span>
          )}

        {/* button for submit */}

        {/* <div className="w-full mt-5">
          <input disabled={isLoading} type="submit" value="Registrar-se" className={`${styles.button} h-10`} />
        </div> */}
            <Button disabled={isLoading}  value="Registrar-se" type="submit" className={`${styles.button} h-10 bg-violet-600 mt-5`}>
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-white"/>
        ):
        (
          <span>Registrar-se</span>
        )}
       </Button>
        <br />
        <h5 className="text-center pt-4 font-Poppins text-[14px] text-white">
          Fazer login com
        </h5>
        <div className="flex items-center justify-center my-3">
          <FcGoogle className="cursor-pointer mr-2" size={30} />
          <AiFillGithub className="cursor-pointer mr-2" size={30} />
        </div>
        <h5 className="text-center pt-4 font-Poppins text-[14px] text-white">
          Já tem uma conta ?{" "}
          <span
            className="text-violet-600 pl-1 cursor-pointer"
            onClick={() => setRoute("Login")}
          >
            Login
          </span>
        </h5>
      </form>
      <br />
    </div>
  );
};

export default SignUp;
