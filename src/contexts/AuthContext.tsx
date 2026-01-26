import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type Auth = {
    session: Session | null;
    isLoading: boolean;
}


export type AuthContextType = {
    auth: Auth;
}


export const AuthContext = createContext<AuthContextType>({
    auth: { session: null, isLoading: true }
})



export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((e, session) => {
            console.log(e);
            setSession(session);
            setIsLoading(false);
            if (e === "SIGNED_OUT") {
                router.replace("/login")
            } else if (e === "SIGNED_IN") {
                router.replace("/")

            }

        });

        return () => {
            subscription.unsubscribe();
        }

    }, [])

    const value: AuthContextType = {
        auth: {
            session,
            isLoading,
        }
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}


export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("Hata: AuthProvider is never used")
    }

    return context;
}
