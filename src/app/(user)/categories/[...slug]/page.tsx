"use client";
import { ProtectedRoute } from "@/_routes/route.route";
import { Suspense, useContext } from "react";
import { MainContext } from "@/app/_Context/MainContext";
import ProductCard from "@/app/_Components/productCard/productCard";
import Carousel from "@/app/_Components/carosel/carosel";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";

type Subcategory = {
  _id: string;
  name: string;
  slug: string;
};

type Category = {
  _id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  title: string;
  price: number;
  _id: string;
  images: string[];
  ratingsAverage?: number;
  category: Category;
  subcategory: Subcategory[];
  description?: string;
};

type ProductsResponse = {
  data: Product[];
  metadata: {
    numberOfPages: number;
  };
};

function HomeContent() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { userToken } = useContext(MainContext) as { userToken: string | null };

  const { data: allProducts, isLoading, error } = useQuery<ProductsResponse, Error>({
    queryKey: ["specificCategoryProducts", slug],
    queryFn: async () => {
      const res = await axios.get(`https://ecommerce.routemisr.com/api/v1/products?sort=-price&category[in]=${slug}`);
      return res.data;
    },
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="h-8 bg-gray-200 rounded-full w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-full w-48 mx-auto animate-pulse"></div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Products</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!allProducts?.data || allProducts.data.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-yellow-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Products Found</h2>
          <p className="text-gray-600 mb-6">This category dose not have any products yet.</p>
          <button
            onClick={() => router.push('/categories')}
            className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          >
            <FiArrowLeft className="mr-2" />
            Back to All Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center"
        >
          <button
            onClick={() => router.push('/categories')}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
          >
            <FiArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 capitalize">
            {allProducts.data[0]?.subcategory[0]?.name || allProducts.data[0]?.category?.name || "Products"}
          </h1>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {allProducts.data.map((product) => (
            <motion.div
              key={product._id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <ProductCard product={product} productId={product._id} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
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
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }>
          <HomeContent />
        </Suspense>
      </QueryClientProvider>
    </ProtectedRoute>
  );
}