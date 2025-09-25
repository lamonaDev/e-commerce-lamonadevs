import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { HeroProvider } from './_Providers/heroui';
import WelcomeNavBarComponent from "./_Components/_welcomeNav/navBar";
import MainUserContext from "./_Context/MainContext";
import e_commerce_logo from "../../public/e-commerce-logo.svg";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-commerce App",
  description: "Sign up for free and start or Login to your account",
  icons: {
    icon: [
      { url: "/e-commerce-logo.svg" },
      { url: "/favicon.ico" }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MainUserContext>
          <HeroProvider>
              {/* <WelcomeNavBarComponent /> */}
              <Toaster />
              {children}
          </HeroProvider>
        </MainUserContext>
      </body>
    </html>
  );
}