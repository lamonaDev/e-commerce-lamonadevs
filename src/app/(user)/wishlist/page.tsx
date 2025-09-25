"use client";
import { ProtectedRoute } from "@/_routes/route.route";
import { Suspense, useContext, useEffect } from "react";
import { MainContext } from "@/app/_Context/MainContext";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, {AxiosError} from "axios";
import toast from "react-hot-toast";
import ProductCard, { Product } from "../../_Components/productCard/productCard";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductFromCat } from "../categories/[...slug]/page";
type WishlistResponse = {
  data: Product[];
};
function WishlistContent() {
  const { userToken } = useContext(MainContext) as { userToken: string | null };
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<WishlistResponse, Error>({
    queryKey: ["wishlist"],
    queryFn: async () => {
      if (!userToken) throw new Error("User not authenticated");
      const response = await axios.get("https://ecommerce.routemisr.com/api/v1/wishlist", {
        headers: {
          token: userToken,
        },
      });
      return response.data;
    },
    enabled: !!userToken,
  });
  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!userToken) throw new Error("User not authenticated");
      const response = await axios.post(
        "https://ecommerce.routemisr.com/api/v1/wishlist",
        { productId },
        {
          headers: {
            "Content-Type": "application/json",
            token: userToken,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Product added to wishlist", {
        icon: '❤️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (error: AxiosError<{message: string}>) => {
      toast.error(error.response?.data?.message || "Failed to add to wishlist", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    },
  });
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!userToken) throw new Error("User not authenticated");
      const response = await axios.delete(`https://ecommerce.routemisr.com/api/v1/wishlist/${productId}`, {
        headers: {
          token: userToken,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Product removed from wishlist", {
        icon: '🗑️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (error: AxiosError<{message: string}>) => {
      toast.error(error.response?.data?.message || "Failed to remove from wishlist", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    },
  });
  const handleToggleWishlist = async (product: ProductFromCat) => {
    if (!userToken) {
      toast.error("Please log in to modify wishlist", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }
    try {
      const isWishlisted = data?.data.some((item) => item._id === product._id);
      if (isWishlisted) {
        await removeFromWishlistMutation.mutateAsync(product._id);
      } else {
        await addToWishlistMutation.mutateAsync(product._id);
      }
    } catch (error) {
      toast.error("An error occurred", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  };
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
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-pink-500 to-red-500 text-transparent bg-clip-text">
            Your Wishlist
          </h1>
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent"
            ></motion.div>
          </div>
        </motion.div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-pink-500 to-red-500 text-transparent bg-clip-text">
            Your Wishlist
          </h1>
          <div className="bg-red-50/50 border border-red-100 rounded-xl p-8 max-w-md mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="text-red-500 mb-4"
            >
              <Trash2 size={48} className="mx-auto" />
            </motion.div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error loading wishlist</h2>
            <p className="text-gray-600">Please try again later or contact support if the problem persists.</p>
          </div>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-pink-500 to-red-500 text-transparent bg-clip-text">
          Your Wishlist
        </h1>
        {data.data.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 max-w-md mx-auto"
          >
            <div className="relative mb-6">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  transition: { duration: 2, repeat: Infinity }
                }}
                className="inline-block"
              >
                <Heart className="h-24 w-24 text-pink-200/50 mx-auto" fill="url(#gradient)" />
              </motion.div>
              <svg width="0" height="0" className="absolute top-0 left-0">
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you have not added any items to your wishlist yet.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg"
            >
              <ShoppingCart size={18} className="inline mr-2" />
              Continue Shopping
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <p className="text-gray-600">
                {data.data.length} {data.data.length === 1 ? 'item' : 'items'} in your wishlist
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center text-sm text-gray-600 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} className="mr-1" />
                Clear all
              </motion.button>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {data.data.map((product) => (
                  <motion.div
                    key={product._id}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <ProductCard
                      product={product}
                      isInWishlist={true}
                      onAddToWishlist={handleToggleWishlist}
                      onAddToCart={() => {}}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
export default function Wishlist() {
  useEffect(() => {
    window.document.title = "WishList Page"
  }, [])
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
      <Suspense fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"
          ></motion.div>
        </div>
      }>
        <QueryClientProvider client={queryClient}>
          <WishlistContent />
        </QueryClientProvider>
      </Suspense>
    </ProtectedRoute>
  );
}