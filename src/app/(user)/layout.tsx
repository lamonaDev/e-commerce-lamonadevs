import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Toaster } from "react-hot-toast";
import WelcomeNavBarComponent from "../_Components/_welcomeNav/navBar";
import UserNavBar from "../_Components/_UserNav/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Login",
  description: "Sign up for free and start or Login to your account",
};

export default function User({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <div className="min-h-screen flex flex-col">
      <div className="mb-[6vh]">
        <UserNavBar /> 
      </div>
      <main className="flex-grow"> 
        {children}
      </main>
      <Toaster />
    </div>
    </>
  );
}