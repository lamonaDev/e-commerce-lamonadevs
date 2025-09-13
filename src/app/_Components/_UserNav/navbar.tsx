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
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode | null;
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
    { name: "Home", href: "/home", icon: null },
    { name: "Cart", href: "/cart", icon: <RiShoppingBasket2Fill size={18} className="mr-2" /> },
    { name: "Brands", href: "/brands", icon: null },
    { name: "Categories", href: "/categories", icon: null },
    { name: "Wishlist", href: "/wishlist", icon: null },
    { name: "Profile", href: "/user", icon: <FaUser size={18} className="mr-2" /> },
    { name: "Logout", href: "/", onClick: handleLogout, icon: <GoSignOut size={18} className="mr-2" />, danger: true },
  ];

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const mobileMenuVariants = {
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        stiffness: 200,
        damping: 20,
      },
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        stiffness: 200,
        damping: 20,
      },
    },
  };

  const cartItemCount = cartData?.numOfCartItems || numberOfCart || 0;

  return (
    <>
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={navVariants}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-14 ${
          scrolled ? "bg-white/90 backdrop-blur-sm shadow-sm" : "bg-white/50"
        }`}
      >
        <Navbar maxWidth="full" className="px-4 py-3 h-full">
          <NavbarBrand>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <PiShoppingCartSimpleBold size={28} className="text-purple-600" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                E-commerce
              </span>
            </motion.div>
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
                    <motion.div
                      layoutId="underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full"
                    />
                  )}
                </Link>
              </NavbarItem>
            ))}
          </NavbarContent>

          <NavbarContent className="md:hidden" justify="end">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {isMenuOpen ? <FaTimeline size={20} /> : <FaBars size={20} />}
            </motion.button>
          </NavbarContent>

          <NavbarContent justify="end" className="gap-2 hidden md:flex">
            <NavbarItem>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  as={Link}
                  href="/cart"
                  color="warning"
                  variant="flat"
                  className="relative"
                >
                  <RiShoppingBasket2Fill size={20} />
                  {cartItemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 bg-amber-800 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </Button>
              </motion.div>
            </NavbarItem>
            <NavbarItem>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button as={Link} color="success" href="/user" variant="flat">
                  <FaUser size={20} />
                </Button>
              </motion.div>
            </NavbarItem>
            <NavbarItem>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  as={Link}
                  color="danger"
                  href="/"
                  onClick={handleLogout}
                  variant="flat"
                >
                  Log out
                </Button>
              </motion.div>
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      </motion.nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden bg-white shadow-lg rounded-b-lg overflow-hidden fixed top-14 left-0 right-0 z-40"
          >
            {navItems.map((item) => (
              <motion.div key={item.name} variants={navVariants}>
                <Link
                  href={item.href}
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    setIsMenuOpen(false);
                  }}
                  className={`block px-4 py-3 text-sm font-medium flex items-center ${
                    item.danger
                      ? "text-red-500 hover:bg-red-50"
                      : pathname === item.href
                      ? "text-purple-600 bg-purple-50"
                      : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                  }`}
                >
                  {item.icon} {item.name}
                  {item.name === "Cart" && cartItemCount > 0 && (
                    <span className="ml-auto bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
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