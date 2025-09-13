"use client";
import MainUserContext, { MainContext } from "@/app/_Context/MainContext";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } from "@heroui/react";
import { useContext, useState, useEffect } from "react";
import { MdOutlineShoppingCart } from "react-icons/md";
import { ContextTestData, ContextTestDataNumber } from "../../../../types/ContextTestData";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimeline } from "react-icons/fa6";
import { usePathname } from "next/navigation";

export default function WelcomeNavBarComponent() {
  const { testData, number } = useContext(MainContext) as { testData: ContextTestData, number: ContextTestDataNumber };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

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

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
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
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  };

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-1 ${
        scrolled ? "bg-white/90 backdrop-blur-sm shadow-sm" : "bg-white/50"
      }`}
    >
      <Navbar maxWidth="full" className="px-4 py-3">
        <NavbarBrand className="gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center"
          >
            <MdOutlineShoppingCart className="text-2xl text-purple-600" />
            <Link
              href="/"
              className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text"
            >
              E-Commerce
            </Link>
          </motion.div>
        </NavbarBrand>
        <NavbarContent className="hidden md:flex gap-4" justify="center">
          <NavbarItem>
            <Link
              href="/"
              className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all ${
                pathname === "/"
                  ? "text-purple-600 font-semibold"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              Home
              {pathname === "/" && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full"
                />
              )}
            </Link>
          </NavbarItem>
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
        <NavbarContent justify="end" className="gap-2">
          <NavbarItem className="hidden lg:flex">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                as={Link}
                href="/login"
                variant="flat"
                className="text-gray-700 hover:text-purple-600"
              >
                Login
              </Button>
            </motion.div>
          </NavbarItem>

          <NavbarItem>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                as={Link}
                href="/signup"
                color="primary"
                variant="flat"
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                Sign Up
              </Button>
            </motion.div>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden bg-white shadow-lg rounded-b-lg overflow-hidden"
          >
            <motion.div variants={navVariants}>
              <Link
                href="/"
                className={`block px-4 py-3 text-sm font-medium ${
                  pathname === "/"
                    ? "text-purple-600 bg-purple-50"
                    : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                }`}
              >
                Home
              </Link>
            </motion.div>

            <motion.div variants={navVariants} className="border-t border-gray-100">
              <Link
                href="/login"
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
              >
                Login
              </Link>
            </motion.div>

            <motion.div variants={navVariants}>
              <Button
                as={Link}
                href="/signup"
                color="primary"
                className="w-full justify-start px-4 py-3 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700"
              >
                Sign Up
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}