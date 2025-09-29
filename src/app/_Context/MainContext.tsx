"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { Session } from "next-auth";
declare module "next-auth" {
  interface Session {
    accessToken?: string | null;
  }
}
interface MainContextType {
  testData: string;
  number: number;
  numberOfCart: number;
  setNumberOfCart: (value: number) => void;
  invalidateCart: () => Promise<void>;
  userToken: string | null;
}
export const MainContext = createContext<MainContextType | undefined>(undefined);

function MainUserContextContent({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [numberOfCart, setNumberOfCart] = useState<number>(0);
  const testData = "test";
  const number = 123;
  const queryClient = useQueryClient();
  const user = session?.user || null;
  const userToken = session?.accessToken || null;

  const { data: cartCount, isError } = useQuery({
    queryKey: ["cartItemCount", userToken],
    queryFn: async () => {
      if (!userToken) return 0;
      try {
        const response = await axios.get("https://ecommerce.routemisr.com/api/v1/cart", {
          headers: { token: userToken },
        });
        return response.data.numOfCartItems || 0;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          return 0;
        }
        throw error;
      }
    },
    enabled: !!userToken,
    retry: 1,
  });

  useEffect(() => {
    if (isError) {
      setNumberOfCart(0);
    } else if (typeof cartCount === "number") {
      setNumberOfCart(cartCount);
    }
  }, [cartCount, isError]);

  const invalidateCart = async () => {
    await queryClient.invalidateQueries({ queryKey: ["cartItemCount", userToken] });
  };

  return (
    <MainContext.Provider
      value={{
        testData,
        number,
        numberOfCart,
        setNumberOfCart,
        invalidateCart,
        userToken,
      }}
    >
      {children}
    </MainContext.Provider>
  );
}
export function useMainContext() {
  const context = useContext(MainContext);
  if (context === undefined) {
    throw new Error('useMainContext must be used within a MainUserContextProvider');
  }
  return context;
}

export default function MainUserContext({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <MainUserContextContent>{children}</MainUserContextContent>
      </QueryClientProvider>
    </SessionProvider>
  );
}
