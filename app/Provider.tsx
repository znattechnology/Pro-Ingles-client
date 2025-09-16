'use client';
import React, {ReactNode} from "react";
import StoreProvider from "@/state/redux";
import TokenManagerInitializer from "@/components/auth/TokenManagerInitializer";

interface ProviderProps {
    children: ReactNode;
}

const  Providers = ({children}:ProviderProps) => {
    return (
        <StoreProvider>
            <TokenManagerInitializer />
            {children}
        </StoreProvider>
    );
}

export default Providers;



