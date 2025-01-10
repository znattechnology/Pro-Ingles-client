"use client";
import AddNewButton from "@/components/FormInputs/AddNewButton";
import React from "react";
import Select from "react-tailwindcss-select";
import { Option, Options } from "react-tailwindcss-select/dist/components/type";
type FormSelectInputProps = {
  options: Options;
  label: string;
  option: Option;
  setOption: any;
  href?: string;
  labelShown?: boolean;
  toolTipText?: string;
  isSearchable?: boolean;
};
export default function FormSelectInput({
  options,
  label,
  option,
  setOption,
  href,
  toolTipText,
  labelShown = true,
  isSearchable = true
}: FormSelectInputProps) {
  return (
    <div className="">
      {labelShown && (
        <h2 className="pb-2 block text-sm font-medium leading-6 mr-1 text-gray-900">
{label}
        </h2>
      )}
      <div className="flex space-x-2">
        <Select
          isSearchable = {isSearchable}
          primaryColor="blue"
          value={option}
          onChange={(item) => setOption(item)}
          options={options}
          placeholder={label}
        />
        {href && toolTipText && (
          <AddNewButton toolTipText={toolTipText} href={href} />
        )}
      </div>
    </div>
  );
}
