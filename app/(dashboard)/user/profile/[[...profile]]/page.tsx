import Header from "@/components/course/Header";
import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import React from "react";

const UserProfilePage = () => {
  return (
    <>
      <Header title="Perfil" subtitle="Veja o seu perfil" />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 100px)", // Ajusta a altura para centralizar abaixo do header
          padding: "20px",
        }}
      >
        <UserProfile
          path="/user/profile"
          routing="path"
          appearance={{
            baseTheme: dark,
            elements: {
              scrollBox: "bg-customgreys-darkGrey",
              navbar: {
                "& > div:nth-child(1)": {
                  background: "none",
                },
              },
              card: {
                boxShadow: "none",
                 // Remove a sombra do card
              },
            },
          }}
        />
      </div>
    </>
  );
};

export default UserProfilePage;

