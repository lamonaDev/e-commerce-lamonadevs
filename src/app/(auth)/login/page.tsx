"use client";
import { Input } from "@heroui/input";
import { Button } from "@heroui/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { Login } from "../../../../interfaces/AUTH";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MainContext } from "@/app/_Context/MainContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  LogIn,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  ArrowRight,
  User
} from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof LoginSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

function LoginForm() {
  const { userToken, setUserToken } = useContext(MainContext) as {
    userToken: string | null;
    setUserToken: (token: string) => void
  };
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "all",
  });

  const mutation = useMutation({
    mutationFn: async (data: Login) => {
      const response = await axios.post(
        "https://ecommerce.routemisr.com/api/v1/auth/signin",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Login successful! Welcome back!", {
        icon: <LogIn className="w-5 h-5 text-green-500" />,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        }
      });
      const token = data?.token;
      if (token) {
        window.localStorage.setItem("token", token);
        setUserToken(token);
        router.push("/home");
        reset();
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Login failed. Please try again.", {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        }
      });
    },
  });

  const onSubmit = (values: LoginForm) => {
    mutation.mutate(values);
  };

  if (!isMounted) return null;

  return (
    <section className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Decorative elements */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          <div className="p-6 sm:p-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="text-center mb-6"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome Back</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Sign in to your account to continue
              </p>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <motion.div variants={itemVariants}>
                <Input
                  {...register("email")}
                  variant="flat"
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message}
                  className="text-black dark:text-white"
                  startContent={<Mail className="w-4 h-4 text-gray-500" />}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  {...register("password")}
                  variant="flat"
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  isInvalid={!!errors.password}
                  errorMessage={errors.password?.message}
                  className="text-black dark:text-white"
                  startContent={<Lock className="w-4 h-4 text-gray-500" />}
                />
              </motion.div>

              <div className="flex justify-between items-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <AnimatePresence>
                {mutation.isError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-sm flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {mutation.error?.message || "Something went wrong"}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2"
              >
                <Button
                  color="primary"
                  variant="solid"
                  size="md"
                  type="submit"
                  disabled={mutation.isPending}
                  isLoading={mutation.isPending}
                  className="w-full py-3 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {mutation.isPending ? (
                    <>
                      <span className="flex items-center justify-center">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                        </motion.span>
                        Signing In...
                      </span>
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="bordered"
                  size="md"
                  className="w-full py-3 text-base font-medium border-2 border-gray-300 dark:border-gray-600"
                >
                  <User className="w-4 h-4 mr-2" />
                  Guest Checkout
                </Button>
              </motion.div>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Do not have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="px-6 pb-6 pt-4 bg-gray-50 dark:bg-gray-900/50 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            <p>By signing in, you agree to our Terms and Privacy Policy</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LoginForm />
    </QueryClientProvider>
  );
}