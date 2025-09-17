"use client";
import { createContext, useEffect, useState } from "react";
import { ContextTestData, ContextTestDataNumber } from "../../../types/ContextTestData";
import axios from "axios";
import toast from "react-hot-toast";
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface UserData {
  message: string;
  decoded: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface MainContextType {
  userToken: string | null;
  setUserToken: (token: string | null) => void;
  testData: ContextTestData;
  number: ContextTestDataNumber;
  userData: UserData | null;
  numberOfCart: number;
  setNumberOfCart: (value: number) => void;
  invalidateCart: () => Promise<void>;
}

export const MainContext = createContext<MainContextType | undefined>(undefined);

function MainUserContextContent({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  });
  const [userData, setUserData] = useState<UserData | null>(null);
  const [numberOfCart, setNumberOfCart] = useState<number>(0);
  const testData: ContextTestData = "test";
  const number: ContextTestDataNumber = 123;
  const queryClient = useQueryClient();

  async function getUserData() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await axios.get("https://ecommerce.routemisr.com/api/v1/auth/verifyToken", {
          headers: { token },
        });
        setUserData(res.data);
      } catch (error) {
        toast.error("Failed to verify token");
        setUserToken(null);
        localStorage.removeItem("token");
      }
    } else {
      setUserData(null);
    }
  }

  const { data: cartCount, isError } = useQuery({
    queryKey: ["cartItemCount", userToken],
    queryFn: async () => {
      if (!userToken) return 0;
      const response = await axios.get("https://ecommerce.routemisr.com/api/v1/cart", {
        headers: { token: userToken },
      });
      return response.data.numOfCartItems || 0;
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

  useEffect(() => {
    getUserData();
  }, [userToken]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (userToken) {
        localStorage.setItem("token", userToken);
      } else {
        localStorage.removeItem("token");
        setUserData(null);
      }
    }
  }, [userToken]);

  return (
    <MainContext.Provider
      value={{
        userToken,
        setUserToken,
        testData,
        number,
        userData,
        numberOfCart,
        setNumberOfCart,
        invalidateCart
      }}
    >
      {children}
    </MainContext.Provider>
  );
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
    <QueryClientProvider client={queryClient}>
      <MainUserContextContent>{children}</MainUserContextContent>
    </QueryClientProvider>
  );
}