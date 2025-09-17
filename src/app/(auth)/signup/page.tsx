"use client";
import { Input } from "@heroui/input";
import { Button } from "@heroui/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios, {AxiosError} from "axios";
import { SignUp } from "../../../../interfaces/AUTH";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Phone,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
  Sparkles
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

const signUpSchema = z
  .object({
    name: z.string().min(2, "Username must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    rePassword: z.string(),
    phone: z.string().regex(/^\d{11}$/, "Phone number must be 11 digits"),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Passwords do not match",
    path: ["rePassword"],
  });

type SignUpForm = z.infer<typeof signUpSchema>;

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
      type: "spring" as const,
      stiffness: 100
    }
  }
};

function SignUpForm() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rePassword: "",
      phone: "",
    },
    mode: 'all'
  });

  const mutation = useMutation({
    mutationFn: async (data: SignUp) => {
      const response = await axios.post(
        "https://ecommerce.routemisr.com/api/v1/auth/signup",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Account created successfully!", {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        }
      });
      router.push("/login");
      reset();
    },
    onError: (error: AxiosError<{message: string}>) => {
      toast.error(error.response?.data?.message || "Signup failed. Please try again.", {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        }
      });
    },
  });
  const onSubmit = (values: SignUpForm) => {
    mutation.mutate(values);
  };
  return (
    <section className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create Your Account</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Join thousands of happy customers
              </p>
            </motion.div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <motion.div variants={itemVariants}>
                <Input
                  {...register("name")}
                  variant="flat"
                  label="Username"
                  placeholder="Enter your username"
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                  className="text-black dark:text-white"
                  startContent={<User className="w-4 h-4 text-gray-500" />}
                />
              </motion.div>
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

              <motion.div variants={itemVariants}>
                <Input
                  {...register("rePassword")}
                  variant="flat"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  type="password"
                  isInvalid={!!errors.rePassword}
                  errorMessage={errors.rePassword?.message}
                  className="text-black dark:text-white"
                  startContent={<Lock className="w-4 h-4 text-gray-500" />}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  {...register("phone")}
                  variant="flat"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  type="tel"
                  isInvalid={!!errors.phone}
                  errorMessage={errors.phone?.message}
                  className="text-black dark:text-white"
                  startContent={<Phone className="w-4 h-4 text-gray-500" />}
                />
              </motion.div>

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
                          <ShoppingBag className="w-4 h-4 mr-2" />
                        </motion.span>
                        Creating Account...
                      </span>
                    </>
                  ) : (
                    <>
                      Sign Up Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Sign in
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
            <p>By signing up, you agree to our Terms and Privacy Policy</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default function SignUpPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SignUpForm />
    </QueryClientProvider>
  );
}