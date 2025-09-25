"use client";
import MainUserContext, { MainContext } from "@/app/_Context/MainContext";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } from "@heroui/react";
import { useContext, useState, useEffect } from "react";
import { MdOutlineShoppingCart } from "react-icons/md";
import { ContextTestData, ContextTestDataNumber } from "../../../../types/ContextTestData";
import Link from "next/link";
import { FaBars, FaTimeline } from "react-icons/fa6";
import { usePathname } from "next/navigation";
import { AiFillHome } from "react-icons/ai";
import { IoLogIn } from "react-icons/io5";
import { FiUserPlus } from "react-icons/fi";

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-1 ${
        scrolled ? "bg-white/90 backdrop-blur-sm shadow-sm" : "bg-white/50"
      }`}
    >
      <Navbar maxWidth="full" className="px-3">
        <NavbarBrand className="gap-3">
          <div className="flex items-center">
            <MdOutlineShoppingCart className="text-2xl text-purple-600" />
            <Link
              href="/"
              className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text"
            >
              E-Commerce
            </Link>
          </div>
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
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
              )}
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent className="md:hidden" justify="end">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            {isMenuOpen ? <FaTimeline size={20} /> : <FaBars size={20} />}
          </button>
        </NavbarContent>
        <NavbarContent justify="end" className="gap-2">
          <NavbarItem className="hidden lg:flex">
            <Button
              as={Link}
              href="/login"
              variant="flat"
              className="text-gray-700 hover:text-purple-600"
            >
              Login
            </Button>
          </NavbarItem>

          <NavbarItem>
            <Button
              as={Link}
              href="/signup"
              color="primary"
              variant="flat"
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Sign Up
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-lg overflow-hidden py-2">
          <div className="flex flex-col items-center">
            <Link
              href="/"
              className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium transition-all ${
                pathname === "/"
                  ? "text-purple-600 bg-purple-50"
                  : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
              }`}
            >
              <AiFillHome size={15} className="mr-2" />
              <span>Home</span>
            </Link>
          </div>

          <div className="border-t border-gray-100">
            <Link
              href="/login"
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
            >
              <IoLogIn size={20} className="mr-1" />
              <span>Login</span>
            </Link>
          </div>

          <div className="border-t border-gray-100">
            <Button
              as={Link}
              href="/signup"
              color="primary"
              className="flex items-center justify-center w-full px-10 py-3 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700"
            >
              <FiUserPlus size={15} className="mr-1" />
              <span>Sign Up</span>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}