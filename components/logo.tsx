
import Link from "next/link";
import React from "react";
import Image from "next/image";


export default function Logo({
  variant = "light",

}: {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}) {
  if (variant === "light") {
    return (
      <div>
        <Link href={"/"}>
          <Image src="/" alt="Logo" height={100} width={100} />
        </Link>
      </div>
    );
  }
}
