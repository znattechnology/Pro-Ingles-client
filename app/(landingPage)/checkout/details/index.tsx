"use client";

import CoursePreview from "@/components/course/CoursePreview";
import { CustomFormField } from "@/components/course/CustomFormField";
import Loading from "@/components/course/Loading";
import { Button } from "@/components/ui/button";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import { GuestFormData, guestSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import React from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import SignUpComponent from "@/components/SignUp";
import SignInComponent from "@/components/SignIn";


const CheckoutDetailsPage = () => {
  const { course: selectedCourse, isLoading, isError } = useCurrentCourse();
  const searchParams = useSearchParams();
  const showSignUp = searchParams.get("showSignUp") === "true";

  const methods = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      email: "",
    },
  });

  if (isLoading) return <Loading />;
  if (isError) return <div>Falha ao pesquisar dados do cursoa</div>;
  if (!selectedCourse) return <div>Curso não encontrado</div>;

  return (
    <div className="w-full h-fit gap-10">
      <div className="sm:flex gap-10">
        <div className=" basis-1/2 rounded-lg ">
          <CoursePreview course={selectedCourse} />
        </div>

        {/* STRETCH FEATURE */}
        <div className="basis-1/2 flex-1 h-auto flex flex-col gap-10">
          <div className="w-full bg-slate-900/30 py-12 px-24 rounded-lg">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">Check-out de convidado</h2>
            <p className="mb-6 text-sm text-center text-white/70 mx-auto">
            Introduza o e-mail para receber os detalhes de acesso ao curso e fazer o pedido
            confirmação. Pode criar uma conta após a compra.
            </p>
            <Form {...methods}>
              <form
                onSubmit={methods.handleSubmit((data) => {
                  console.log(data);
                })}
                className="space-y-8"
              >
                <CustomFormField
                  name="email"
                  label="Email address"
                  type="email"
                  className="w-full rounded mt-4"
                  labelClassName="font-normal text-white-50"
                  inputClassName="py-3"
                />
                <Button type="submit" className="w-full my-6 py-3 bg-violet-800 hover:bg-violet-900 text-white-100 rounded shadow text-sm font-semibold">
                Continuar como convidado
                </Button>
              </form>
            </Form>
          </div>

          <div className="flex items-center justify-between">
            <hr className="w-full border-customgreys-dirtyGrey" />
            <span className="px-4 text-sm text-gray-400 whitespace-nowrap">Ou</span>
            <hr className=" w-full border-customgreys-dirtyGrey" />
          </div>

          <div className="w-full bg-slate-900/30 flex justify-center items-center rounded-lg">
            {showSignUp ? <SignUpComponent /> : <SignInComponent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDetailsPage;
