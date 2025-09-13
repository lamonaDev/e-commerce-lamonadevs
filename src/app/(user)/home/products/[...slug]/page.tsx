"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import axios from "axios";
import ProductCard, { Product } from "../../../../_Components/productCard/productCard";
import { useContext } from "react";
import { MainContext } from "@/app/_Context/MainContext";
import toast from "react-hot-toast";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";

type ApiResponse = {
  data: Product;
};

function SpicificProductContent() {
  const { userToken } = useContext(MainContext) as { userToken: string | null };
  const params = useParams();
  const slug = params?.slug as string | string[] | undefined;

  const { data: response, isLoading, error } = useQuery<ApiResponse, Error>({
    queryKey: ["specificProduct", slug],
    queryFn: async () => {
      if (!slug || (Array.isArray(slug) && !slug.length)) throw new Error("No product slug provided");
      const productId = Array.isArray(slug) ? slug[0] : slug;
      const res = await axios.get(`https://ecommerce.routemisr.com/api/v1/products/${productId}`);
      return res.data;
    },
    enabled: !!slug && (!Array.isArray(slug) || slug.length > 0),
  });

  const product = response?.data;

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-10"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg font-medium">Loading product details...</p>
      </motion.div>
    </div>
  );

  if (error || !product) return (
    <div className="flex justify-center items-center h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-10 text-red-500"
      >
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
        <Button as={Link} href="/home" variant="flat" className="mt-6" color="success">
          <FiArrowLeft className="mr-2" /> Back To Home
        </Button>
      </motion.div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Back button with animation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <Button
            as={Link}
            href="/home"
            variant="light"
            className="group"
            color="success"
          >
            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Products
          </Button>
        </motion.div>

        {/* Product card with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <ProductCard
            product={product}
            className="w-full"
            onAddToCart={() => {
              toast.success(`${product.title} added to cart!`, {
                position: "top-right",
                duration: 3000,
                style: {
                  background: '#10B981',
                  color: '#fff',
                },
              });
            }}
          />
        </motion.div>

        {/* Additional product info with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Product Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Product Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Category</span>
                <span className="font-medium">{product.category?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Brand</span>
                <span className="font-medium">{product.brand?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Price</span>
                <span className="font-medium">${product.price}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Rating</span>
                <div className="flex items-center">
                  <span className="font-medium mr-2">{product.ratingsAverage}</span>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.ratingsAverage) ? 'fill-current' : 'fill-current opacity-30'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function SpicificProduct() {
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
      <SpicificProductContent />
    </QueryClientProvider>
  );
}