"use client";
import { ProtectedRoute } from "@/_routes/route.route";
import { Suspense, useContext, useState } from "react";
import { MainContext } from "@/app/_Context/MainContext";
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type Category = {
  _id: string;
  name: string;
  image: string;
  slug: string;
};

type ApiResponse = {
  data?: Category[];
};

function CategoryContent() {
  const { userToken } = useContext(MainContext) as { userToken: string | null };
  const [categories, setCategories] = useState<Category[] | null>(null);

  const mutation = useMutation<ApiResponse, Error>({
    mutationFn: async () => {
      const res = await axios.get("https://ecommerce.routemisr.com/api/v1/categories");
      return res.data;
    },
    onSuccess: (data) => {
      setCategories(data?.data || []);
    },
    onError: (error) => {
      console.error("Error fetching categories:", error);
    },
  });

  React.useEffect(() => {
    mutation.mutate();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
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
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Explore Our Categories
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our wide range of products across different categories
          </p>
        </motion.div>

        {mutation.isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
          </div>
        )}

        {mutation.isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-8"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Error loading categories. Please try again later.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {categories && Array.isArray(categories) && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
          >
            {categories.map((category) => (
              <motion.div
                key={category._id}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <Link
                  href={`categories/${category?._id}`}
                  className="block h-full"
                >
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <img
                      src={category?.image}
                      className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                      alt={category?.name}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
                      {category?.name}
                    </h3>
                    <p className="text-blue-600 text-sm font-medium mt-1">
                      Explore →
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </Suspense>
  );
}

export default function Home() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <ProtectedRoute>
      <QueryClientProvider client={queryClient}>
        <CategoryContent />
      </QueryClientProvider>
    </ProtectedRoute>
  );
}