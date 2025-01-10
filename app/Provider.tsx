'use client';
import React, {ReactNode} from "react";
import StoreProvider from "@/state/redux";
interface ProviderProps {
    children: ReactNode;
}

const  Providers = ({children}:ProviderProps) => {
    return <StoreProvider >{children}</StoreProvider>
}

export default Providers;



