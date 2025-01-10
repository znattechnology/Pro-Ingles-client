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
import { useLoginMutation } from "@/redux/features/auth/authApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import Loader from "@/components/Loader";
import { Loader2, Lock } from "lucide-react";
import { Input } from "../ui/input";

type Props = {
  setRoute: (route: string) => void;
  setOpen: (open: boolean) => void;
};

const schema = Yup.object().shape({
  email: Yup.string()
    .email("Email não válido")
    .required("O campo email é obrigatório"),
  password: Yup.string().required("O campo password é obrigatório").min(6),
});

const Login: FC<Props> = ({ setRoute, setOpen }) => {
  const [show, setShow] = useState(false);
  const [login, {isLoading, isSuccess, data, error }] = useLoginMutation();

  const router = useRouter();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: async ({ email, password }) => {
      await login({ email, password });
    },
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Usuario logado com sucesso");
      setOpen(false);
      router.push("/admin");
    }
    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message);
      }
    }
  }, [isSuccess, error, isLoading]);

  const { errors, touched, values, handleChange, handleSubmit } = formik;

  return (
    <div className="w-[400px] bg-black">
      <h1 className={`${styles.title}`}>Login</h1>
      <form onSubmit={handleSubmit}>
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
            type={!show ? "password" : "text"}
            disabled={isLoading}
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

        {/* <div className="w-full h-[18px] mt-5">
          <input
            type="submit"
            value="Login"
            className={`${styles.button} h-10 bg-violet-600`}
          />
        </div> */}

       <Button disabled={isLoading}  value="Login" type="submit" className={`${styles.button} h-10 bg-violet-600 mt-5`}>
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-white"/>
        ):
        (
          <span>Login</span>
        )}
       </Button>
        <br />
        <h5 className="text-center pt-4 font-Poppins text-[14px] text-white ">
          Fazer login com
        </h5>
        <div className="flex items-center justify-center my-3">
          <FcGoogle className="cursor-pointer mr-2" size={30} />
          <AiFillGithub className="cursor-pointer mr-2" size={30} />
        </div>
        <h5 className="text-center pt-4 font-Poppins text-[14px] text-white ">
          Não tem nenhuma conta ?{" "}
          <span
            className="text-violet-600 pl-1 cursor-pointer"
            onClick={() => setRoute("SignUp")}
          >
            Registrar-se
          </span>
        </h5>
      </form>
      <br />
    </div>
  );
};

export default Login;
