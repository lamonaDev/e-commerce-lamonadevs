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
  Sparkles,
  Users,
  Package,
  Heart,
  Search,
  ShoppingCart,
  Truck,
  ShieldCheck
} from "lucide-react";
import WelcomeNavBarComponent from "./_Components/_welcomeNav/navBar";
import ProductSearch from "./_Components/productSearch/ProductSearch";
import ProductCard, { Product } from "./_Components/productCard/productCard";
import ProductsApiService from "./_Services/productsApi";
import toast from "react-hot-toast";

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
      damping: 12
    }
  }
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const stats = [
  { value: "10K+", label: "Products", color: "blue", icon: Package },
  { value: "50+", label: "Brands", color: "green", icon: ShoppingBag },
  { value: "100K+", label: "Happy Customers", color: "purple", icon: Users },
  { value: "4.8", label: "Rating", color: "orange", icon: Star }
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await ProductsApiService.getProducts(1, 8);
        const sortedProducts = response.data.sort((a, b) =>
          (b.ratingsAverage * b.sold) - (a.ratingsAverage * a.sold)
        );
        setFeaturedProducts(sortedProducts.slice(0, 8));
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products');
        toast.error('Failed to load featured products', {
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
    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    toast.success(`${product.title} added to cart`, {
      icon: <ShoppingCart className="w-5 h-5 text-emerald-500" />,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      }
    });
  };

  const handleAddToWishlist = async (product: Product) => {
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
      <WelcomeNavBarComponent />

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
                <Link href="/signup" className="w-full sm:w-auto block">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 md:px-8 py-3 text-sm md:text-base shadow-lg"
                  >
                    <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Start Shopping
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/login" className="w-full sm:w-auto block">
                  <Button
                    variant="bordered"
                    size="lg"
                    className="w-full px-6 md:px-8 py-3 text-sm md:text-base border-2 border-gray-300 dark:border-gray-600"
                  >
                    Sign In to Your Account
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-12 md:py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-sm"
              >
                <div className="flex justify-center mb-2">
                  <stat.icon className={`w-8 h-8 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <div className={`text-2xl sm:text-3xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mb-1`}>
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
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

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden"
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
                <Button
                  variant="bordered"
                  onClick={() => fetchFeaturedProducts()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Again
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="products"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
              >
                {featuredProducts.map((product) => (
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
            )}
          </AnimatePresence>
        </div>
      </section>
      <section className="benefits-section py-16 md:py-20 bg-white dark:bg-gray-800">
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
              <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-green-600" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Why Choose Us
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4"
            >
              We're committed to providing the best shopping experience
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get your products delivered to your doorstep in record time with our reliable shipping partners.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Secure Payments</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your payment information is protected with industry-standard security measures.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Easy Returns</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Not satisfied? Return your products within 30 days for a full refund, no questions asked.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <section className="cta-section py-16 md:py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 px-4">
              Ready to Start Shopping?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-8 opacity-90 px-4 max-w-2xl mx-auto">
              Join thousands of satisfied customers and discover amazing deals on premium products
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-base font-medium shadow-lg"
                >
                  Create Your Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}