"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/react";
import Link from "next/link";
import {
  ArrowRight,
  ShoppingBag,
  Star,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingCart,
  Heart,
  Search,
  LayoutGrid,
  Filter
} from "lucide-react";
import ProductCard, { Product } from "../../_Components/productCard/productCard";
import ProductsApiService, { ProductsApiResponse } from "../../_Services/productsApi";
import toast from "react-hot-toast";
import { ProductFromCat } from "../categories/[...slug]/page";

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
      type: "spring" as const,
      stiffness: 100,
      damping: 12
    }
  }
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productsPerPage] = useState(12);
  const [metadata, setMetadata] = useState<ProductsApiResponse['metadata'] | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchProducts = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ProductsApiService.getProducts(page, productsPerPage);

      setProducts(response.data);
      setMetadata(response.metadata);
      setTotalPages(response.metadata.numberOfPages);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      toast.error('Failed to load products', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const handleAddToCart = async (product: ProductFromCat) => {
    toast.success(`${product.title} added to cart`, {
      icon: <ShoppingCart className="w-5 h-5 text-emerald-500" />,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      }
    });
  };

  const handleAddToWishlist = async (product: ProductFromCat) => {
    toast.success(`${product.title} added to wishlist`, {
      icon: <Heart className="w-5 h-5 text-red-500" />,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      }
    });
  };

  if (!isMounted) return null;

  return (
    <>
      <section className="hero-section relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-16 md:py-24 lg:py-32">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-yellow-200 dark:bg-yellow-900 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <div className="flex items-center justify-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-semibold text-gray-800 dark:text-white">New Collection 2023</span>
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Exceptional</span>
              <br />
              Products <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Just for You</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto px-4"
            >
              Explore our curated selection of premium products from top brands worldwide.
              <br className="hidden sm:block" />
              Quality, style, and innovation delivered to your doorstep.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  as={Link}
                  href="/products"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="bordered"
                  className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <Search className="mr-2 w-5 h-5" />
                  Explore Categories
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <section className="featured-products-section py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Featured Products
              </h2>
              <Star className="w-6 h-6 md:w-7 md:h-7 text-yellow-500" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4"
            >
              Discover our most popular and highly-rated products chosen by our community
            </motion.p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4"
          >
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="light"
                  className="flex items-center gap-2 bg-white dark:bg-gray-800"
                >
                  <LayoutGrid className="w-5 h-5" />
                  <span>All Categories</span>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="light"
                  className="flex items-center gap-2 bg-white dark:bg-gray-800"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </Button>
              </motion.div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {products.length} of {metadata?.total || 0} products
            </div>
          </motion.div>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
              >
                {[...Array(productsPerPage)].map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
                  >
                    <div className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4 animate-pulse"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="mb-6"
                >
                  <ShoppingBag className="w-16 h-16 text-red-500 mx-auto" />
                </motion.div>
                <p className="text-red-600 dark:text-red-400 mb-6 text-lg">{error}</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="bordered"
                    onClick={() => fetchProducts(currentPage)}
                  >
                    Try Again
                  </Button>
                </motion.div>
              </motion.div>
            ) : products.length > 0 ? (
              <>
                <motion.div
                  key="products"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
                >
                  {products.map((product) => (
                    <motion.div
                      key={product._id}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className="h-full"
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                        onAddToWishlist={handleAddToWishlist}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-4"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="bordered"
                      size="sm"
                      isDisabled={currentPage <= 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                  </motion.div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <motion.div key={pageNumber} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant={currentPage === pageNumber ? "flat" : "bordered"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`w-10 h-10 ${currentPage === pageNumber ? 'bg-blue-600 text-white' : ''}`}
                          >
                            {pageNumber}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="bordered"
                      size="sm"
                      isDisabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </motion.div>
              </>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="mb-6"
                >
                  <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto" />
                </motion.div>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">No products available at the moment.</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    as={Link}
                    href="/brands"
                    variant="bordered"
                  >
                    Explore Brands Instead
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <section className="py-16 md:py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Ready to elevate your shopping experience?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us for quality products and exceptional service.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                as={Link}
                href="/products"
                className="px-8 py-4 bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-100 transition-all"
              >
                Shop All Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}