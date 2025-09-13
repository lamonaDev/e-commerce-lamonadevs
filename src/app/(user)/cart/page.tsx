"use client";
import { ProtectedRoute } from "@/_routes/route.route";
import { Suspense, useContext, useEffect, useState } from "react";
import { MainContext } from "@/app/_Context/MainContext";
import { Product } from "../../_Components/productCard/productCard";
import Image from "next/image";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShoppingCart,
  Package,
  CreditCard,
  Truck,
  X,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Button } from "@heroui/react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export interface CartItem {
  count: number;
  _id: string;
  product: Product;
  price: number;
}

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

export default function CartPage() {
  const { userToken } = useContext(MainContext) as { userToken: string | null };
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchCartItems = async () => {
    if (!userToken) return;

    try {
      setLoading(true);
      const response = await fetch("https://ecommerce.routemisr.com/api/v1/cart", {
        headers: {
          token: userToken
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.data.products || []);
      } else {
        toast.error("Failed to load your cart", {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          }
        });
      }
    } catch (error) {
      toast.error("Error loading your cart", {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchCartItems();
    }
  }, [userToken]);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (!userToken) return;
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setUpdatingItem(productId);
    try {
      const response = await fetch(`https://ecommerce.routemisr.com/api/v1/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "token": userToken
        },
        body: JSON.stringify({
          "count": newQuantity
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.data.products);
        toast.success("Cart updated successfully", {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          }
        });
      } else {
        toast.error("Failed to update item quantity", {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          }
        });
      }
    } catch (error) {
      toast.error("Error updating item quantity", {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        }
      });
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!userToken) return;

    setUpdatingItem(productId);
    try {
      const response = await fetch(`https://ecommerce.routemisr.com/api/v1/cart/${productId}`, {
        method: "DELETE",
        headers: {
          "token": userToken
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.data.products);
        toast.success("Item removed from cart", {
          icon: <Trash2 className="w-5 h-5 text-green-500" />,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          }
        });
      } else {
        toast.error("Failed to remove item from cart", {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          }
        });
      }
    } catch (error) {
      toast.error("Error removing item from cart", {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        }
      });
    } finally {
      setUpdatingItem(null);
    }
  };

  const clearCart = async () => {
    if (!userToken) return;

    try {
      const response = await fetch("https://ecommerce.routemisr.com/api/v1/cart", {
        method: "DELETE",
        headers: {
          "token": userToken
        }
      });

      if (response.ok) {
        setCartItems([]);
        toast.success("Cart cleared successfully", {
          icon: <ShoppingCart className="w-5 h-5 text-green-500" />,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          }
        });
      } else {
        toast.error("Failed to clear cart", {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          }
        });
      }
    } catch (error) {
      toast.error("Error clearing cart", {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        }
      });
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.count);
    }, 0);
  };

  const calculateItemTotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  if (!isMounted) return null;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8 md:py-12 min-h-screen">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Your Shopping Cart</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Loading your cart...</p>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <ShoppingCart className="w-16 h-16 text-blue-500 mx-auto" />
            </motion.div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 animate-pulse"
                >
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8 min-h-screen">
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <ShoppingCart className="w-12 h-12 text-blue-500" />
            </motion.div>
          </div>
        </div>
      }>
        <section className="container mx-auto px-4 py-8 md:py-12 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Your Shopping Cart</h1>
              {cartItems.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearCart}
                  className="flex items-center text-sm sm:text-base py-2 px-3 sm:px-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </motion.button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 md:py-20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="mb-6"
                >
                  <div className="relative mx-auto w-48 h-48">
                    <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
                    >
                      <Package className="w-8 h-8 text-gray-400" />
                    </motion.div>
                  </div>
                </motion.div>

                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">Your cart is empty</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Looks like you haven't added any items to your cart yet. Let's change that!
                </p>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/home">
                    <Button
                      color="primary"
                      className="px-6 py-3 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Continue Shopping
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                {/* Cart Items */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="lg:col-span-8 space-y-6"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium text-gray-600 dark:text-gray-300">
                      <div className="col-span-5">Product</div>
                      <div className="col-span-2 text-center">Price</div>
                      <div className="col-span-3 text-center">Quantity</div>
                      <div className="col-span-2 text-right">Total</div>
                    </div>

                    <AnimatePresence>
                      {cartItems.map((item) => (
                        <motion.div
                          key={item._id}
                          variants={itemVariants}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.3 }}
                          className="grid grid-cols-12 gap-2 sm:gap-4 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 last:border-b-0 items-center"
                        >
                          {/* Product Info */}
                          <div className="col-span-12 md:col-span-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="relative h-24 w-24 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <Image
                                src={item.product.imageCover || item.product.images?.[0] || '/placeholder-product.jpg'}
                                alt={item.product.title}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-product.jpg';
                                }}
                              />
                            </motion.div>

                            <div className="w-full sm:min-w-0">
                              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white line-clamp-2">
                                {item.product.title}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {item.product.brand?.name || "No Brand"} • {item.product.category?.name}
                              </p>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeFromCart(item.product._id)}
                                disabled={updatingItem === item.product._id}
                                className="mt-2 text-red-500 hover:text-red-700 disabled:opacity-50 text-sm flex items-center"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </motion.button>
                            </div>
                          </div>
                          <div className="col-span-6 md:col-span-2 flex md:block justify-between md:justify-center">
                            <span className="md:hidden font-medium text-gray-500 dark:text-gray-400 text-sm">Price:</span>
                            <span className="text-gray-900 dark:text-white font-medium text-lg">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                          <div className="col-span-6 md:col-span-3 flex md:block justify-between md:justify-center">
                            <span className="md:hidden font-medium text-gray-500 dark:text-gray-400 text-sm">Quantity:</span>
                            <div className="flex items-center justify-end sm:justify-center">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.product._id, item.count - 1)}
                                disabled={updatingItem === item.product._id || item.count <= 1}
                                className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                              >
                                <Minus className="h-4 w-4" />
                              </motion.button>
                              <span className="mx-2 sm:mx-3 text-gray-900 dark:text-white font-medium w-8 text-center">
                                {item.count}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.product._id, item.count + 1)}
                                disabled={updatingItem === item.product._id}
                                className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                              >
                                <Plus className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </div>
                          <div className="col-span-12 md:col-span-2 flex md:block justify-between md:justify-end items-center mt-4 md:mt-0">
                            <span className="md:hidden font-medium text-gray-500 dark:text-gray-400 text-sm">Total:</span>
                            <div className="flex items-center">
                              <span className="text-gray-900 dark:text-white font-medium text-lg">
                                ${calculateItemTotal(item.price, item.count).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-4 space-y-6"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-20">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                      <ShoppingCart className="w-6 h-6 mr-2 text-blue-600" />
                      Order Summary
                    </h2>

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal ({cartItems.reduce((acc, item) => acc + item.count, 0)} items)</span>
                        <span className="font-medium text-gray-800 dark:text-white">${calculateTotal().toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                        <span className="font-medium text-gray-800 dark:text-white">Calculated at checkout</span>
                      </div>

                      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-lg font-semibold text-gray-800 dark:text-white">Total</span>
                        <span className="text-lg font-bold text-gray-800 dark:text-white">${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-6"
                    >
                      <Button
                        className="w-full py-3 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        as={Link}
                        href="/cart/checkout"
                      >
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </motion.div>

                    <div className="mt-4 flex justify-center">
                      <Link
                        href="/home"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                      >
                        <ArrowRight className="mr-1 h-4 w-4 transform rotate-180" />
                        Continue Shopping
                      </Link>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                        <Truck className="w-4 h-4 mr-2" />
                        <span>Free shipping on orders over $50</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mt-2">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span>Secure payment options</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
        </section>
      </Suspense>
    </ProtectedRoute>
  );
}