"use client";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } from "@heroui/react";
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { RiShoppingBasket2Fill } from "react-icons/ri";
import Link from "next/link";
import React, { useContext, useState, useEffect } from "react";
import MainUserContext, { MainContext } from "@/app/_Context/MainContext";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FaUser, FaBars, FaTimeline } from "react-icons/fa6";
import { GoSignOut } from "react-icons/go";
import { MdHome, MdCategory, MdFavorite, MdStore } from "react-icons/md";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

interface CartData {
  numOfCartItems: number;
}

interface MainContextType {
  userToken: string | null;
  setUserToken: (token: string | null) => void;
  numberOfCart: number;
  setNumberOfCart: (value: number) => void;
  invalidateCart: () => void;
}

function UserNavBarContent() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const context = useContext(MainContext) as MainContextType;
  const { setUserToken, userToken, numberOfCart, setNumberOfCart, invalidateCart } = context;

  const { data: cartData } = useQuery<CartData>({
    queryKey: ["cartItemCount", userToken],
    queryFn: async (): Promise<CartData> => {
      if (!userToken) return { numOfCartItems: 0 };

      try {
        const response = await fetch("https://ecommerce.routemisr.com/api/v1/cart", {
          headers: {
            token: userToken,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }

        return await response.json() as CartData;
      } catch (error) {
        console.error("Error fetching cart:", error);
        return { numOfCartItems: 0 };
      }
    },
    enabled: !!userToken,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (cartData) {
      setNumberOfCart(cartData.numOfCartItems || 0);
    }
  }, [cartData, setNumberOfCart]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userToken");
    }
    setUserToken(null);
  }

  const navItems: NavItem[] = [
    { name: "Home", href: "/home", icon: <MdHome size={18} className="mr-2" /> },
    { name: "Cart", href: "/cart", icon: <RiShoppingBasket2Fill size={18} className="mr-2" /> },
    { name: "Brands", href: "/brands", icon: <MdStore size={18} className="mr-2" /> },
    { name: "Categories", href: "/categories", icon: <MdCategory size={18} className="mr-2" /> },
    { name: "Wishlist", href: "/wishlist", icon: <MdFavorite size={18} className="mr-2" /> },
    { name: "Profile", href: "/user", icon: <FaUser size={18} className="mr-2" /> },
    { name: "Logout", href: "/", onClick: handleLogout, icon: <GoSignOut size={18} className="mr-2" />, danger: true },
  ];

  const cartItemCount = cartData?.numOfCartItems || numberOfCart || 0;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16 ${
        scrolled ? "bg-white/90 backdrop-blur-sm shadow-sm" : "bg-white/50"
      }`}>
        <Navbar maxWidth="full" className="px-4 py-3 h-full">
          <NavbarBrand>
            <div className="flex items-center">
              <PiShoppingCartSimpleBold size={28} className="text-purple-600" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                E-commerce
              </span>
            </div>
          </NavbarBrand>

          <NavbarContent className="hidden md:flex gap-6" justify="center">
            {navItems.slice(0, 5).map((item) => (
              <NavbarItem key={item.name}>
                <Link
                  href={item.href}
                  onClick={item.onClick}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    pathname === item.href
                      ? "text-purple-600 font-semibold"
                      : "text-gray-600 hover:text-purple-600"
                  }`}
                >
                  {item.name}
                  {pathname === item.href && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
                  )}
                </Link>
              </NavbarItem>
            ))}
          </NavbarContent>

          <NavbarContent className="md:hidden" justify="end">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {isMenuOpen ? <FaTimeline size={20} /> : <FaBars size={20} />}
            </button>
          </NavbarContent>

          <NavbarContent justify="end" className="gap-2 hidden md:flex">
            <NavbarItem>
              <div>
                <Button
                  as={Link}
                  href="/cart"
                  color="warning"
                  variant="flat"
                  className="relative"
                >
                  <RiShoppingBasket2Fill size={20} />
                  {cartItemCount > 0 && (
                    <span className="absolute top-1 right-1 bg-amber-800 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </div>
            </NavbarItem>
            <NavbarItem>
              <div>
                <Button as={Link} color="success" href="/user" variant="flat">
                  <FaUser size={20} />
                </Button>
              </div>
            </NavbarItem>
            <NavbarItem>
              <div>
                <Button
                  as={Link}
                  color="danger"
                  href="/"
                  onClick={handleLogout}
                  variant="flat"
                >
                  Log out
                </Button>
              </div>
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-lg overflow-hidden fixed top-14 left-0 right-0 z-40">
          <div className="flex flex-col items-center">
            {navItems.map((item) => (
              <div key={item.name} className="w-full">
                <Link
                  href={item.href}
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center justify-center px-4 py-3 text-sm font-medium w-full ${
                    item.danger
                      ? "text-red-500 hover:bg-red-50"
                      : pathname === item.href
                      ? "text-purple-600 bg-purple-50"
                      : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  {item.name === "Cart" && cartItemCount > 0 && (
                    <span className="ml-2 bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function UserNavBar() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: true,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <UserNavBarContent />
    </QueryClientProvider>
  );
}