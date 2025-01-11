"use client";
import React from "react";


import {  UserButton, useUser } from "@clerk/nextjs";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";

import { dark } from "@clerk/themes";



import NotificationButton from "@/components/notification-button";
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

function SidebarHeader() {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.userType as "student" | "teacher";
  const [searchQuery, setSearchQuery] = React.useState("");
  return (
    <div className="flex h-16 items-center gap-4 border-b px-4 bg-customgreys-primarybg border-b-violet-900/30">
      <SidebarTrigger className="bg-violet-800 hover:bg-violet-900 text-white hover:text-white" />
      <div className="flex-1">
        <Input
          placeholder="Procurar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm bg-customgreys-primarybg border border-violet-900/30 text-white/70 placeholder:text-white/70"
        />
      </div>
      {/* <Button variant="outline" size="icon">
      <span className="sr-only">Toggle theme</span>
      <Sun className="h-5 w-5" />
    </Button> */}
      {/* <Button variant="ghost" className="border border-violet-500" size="icon">
        <Plus className="h-5 w-5 text-violet-800" />
        <span className="sr-only ">Add new</span>
      </Button> */}

      <NotificationButton/>

 
        <UserButton
            appearance={{
              baseTheme: dark,
              elements: {
                card: "bg-black w-full shadow-none", 
                userButtonOuterIdentifier: "text-white",
                userButtonBox: " text-white",
                userButtonTrigger: "border-white",
                userButtonPopoverCard: "bg-black border border-violet-900",
                userPreviewTextContainer: "text-white",
                userPreviewMainIdentifier: "text-white",
               
                userButtonPopoverFooter: "border-t border-white bg-black",
                userButtonPopoverActions: "text-white",
                footer: {
                  background: "black",
                  padding: "0rem 2.5rem",
                  "& > div > div:nth-child(1)": {
                    background: "black",
                  },
                },
              },
              
            }}
            showName={true}
            userProfileMode="navigation"
            userProfileUrl={
              userRole === "teacher" ? "/teacher/profile" : "/user/profile"
            }
          />
    </div>
  );
}

export default SidebarHeader;

