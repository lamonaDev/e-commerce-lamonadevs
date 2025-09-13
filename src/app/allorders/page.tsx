"use client";
import { useContext, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { MainContext } from '../_Context/MainContext';
import axios from 'axios';
import { Button } from '@heroui/react';
import Link from 'next/link';
import { IoIosArrowRoundBack } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CreditCard, Home, MapPin, ShoppingBag, DollarSign, CheckCircle, Clock, ChevronDown, ChevronUp, Phone } from 'lucide-react';

type DecodedToken = {
  id: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
};

type VerifyTokenResponse = {
  message: string;
  decoded: DecodedToken;
};

type Subcategory = {
  _id: string;
  name: string;
  slug: string;
  category: string;
};

type Category = {
  _id: string;
  name: string;
  slug: string;
  image: string;
};

type Brand = {
  _id: string;
  name: string;
  slug: string;
  image: string;
};

type Product = {
  subcategory: Subcategory[];
  ratingsQuantity: number;
  _id: string;
  title: string;
  imageCover: string;
  category: Category;
  brand: Brand;
  ratingsAverage: number;
  id: string;
};

type CartItem = {
  count: number;
  _id: string;
  product: Product;
  price: number;
};

type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
};

type ShippingAddress = {
  details: string;
  phone: string;
  city: string;
};

type Order = {
  shippingAddress: ShippingAddress;
  taxPrice: number;
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethodType: string;
  isPaid: boolean;
  isDelivered: boolean;
  _id: string;
  user: User;
  cartItems: CartItem[];
  createdAt: string;
  updatedAt: string;
  id: number;
  __v: number;
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
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const loadingContainerVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const loadingItemVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function AllOrdersPage() {
  const { userToken } = useContext(MainContext) as { userToken: string };
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function getUserId(token: string): Promise<string> {
    try {
      const response = await axios.get<VerifyTokenResponse>(
        "https://ecommerce.routemisr.com/api/v1/auth/verifyToken",
        { headers: { token: token } }
      );
      return response.data.decoded.id;
    } catch (err) {
      throw new Error('Failed to verify token');
    }
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!userToken) {
          throw new Error('No user token available');
        }

        const userId = await getUserId(userToken);
        const response = await fetch(
          `https://ecommerce.routemisr.com/api/v1/orders/user/${userId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userToken]);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
  };

  if (!isMounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={loadingContainerVariants}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={loadingItemVariants} className="mb-8">
            <Button
              as={Link}
              href='/home'
              variant='flat'
              color='success'
              className='mb-6 opacity-50 cursor-not-allowed'
              disabled
            >
              <IoIosArrowRoundBack size={30}/>
            </Button>
            <div className="h-10 bg-gray-200 rounded-lg w-48 mb-8 animate-pulse"></div>
          </motion.div>

          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              variants={loadingItemVariants}
              className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden"
            >
              <div className="p-6 animate-pulse">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="space-y-2 text-right">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <Button
            as={Link}
            href='/home'
            variant='flat'
            color='success'
            className='mb-6'
          >
            <IoIosArrowRoundBack size={30}/>
          </Button>

          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center border border-red-50">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mb-6"
            >
              <Package className="w-16 h-16 text-red-500 mx-auto" />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Orders</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Retry
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <Button
            as={Link}
            href='/home'
            variant='flat'
            color='success'
            className='mb-6'
          >
            <IoIosArrowRoundBack size={30}/>
          </Button>

          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center border border-gray-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mb-6"
            >
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto" />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Found</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't placed any orders yet. When you do, they'll appear here.
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                as={Link}
                href='/home'
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Continue Shopping
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <Button
            as={Link}
            href='/home'
            variant='flat'
            color='success'
            className='mb-4 md:mb-6'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IoIosArrowRoundBack size={30}/>
          </Button>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="text-3xl font-bold text-gray-800 mb-2"
          >
            Your Orders
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
            className="text-gray-600 max-w-2xl"
          >
            View and manage your recent orders and track their status
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {orders.map((order) => (
            <motion.div
              key={order._id}
              variants={itemVariants}
              layout
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-50"
            >
              <div
                className="p-4 md:p-6 cursor-pointer"
                onClick={() => toggleOrderDetails(order._id)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="hidden md:block p-3 rounded-lg bg-emerald-50">
                      {order.isDelivered ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-yellow-600" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-gray-800">
                          Order #{order.id}
                        </h2>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          order.isDelivered
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.isDelivered ? 'Delivered' : 'Processing'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-800">
                        ${order.totalOrderPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.cartItems.length} item{order.cartItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="md:hidden p-2 rounded-full bg-gray-100 text-gray-600"
                    >
                      {expandedOrderId === order._id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Order Details - Expanded Content */}
              <AnimatePresence>
                {expandedOrderId === order._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden border-t border-gray-100"
                  >
                    <div className="p-4 md:p-6">
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                      >
                        {/* Order Items */}
                        <motion.div variants={itemVariants}>
                          <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-gray-600" />
                            Order Items ({order.cartItems.length})
                          </h3>

                          <div className="space-y-4">
                            {order.cartItems.map((item) => (
                              <motion.div
                                key={item._id}
                                whileHover={{ scale: 1.02 }}
                                className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <motion.img
                                  whileHover={{ scale: 1.05 }}
                                  src={item.product.imageCover}
                                  alt={item.product.title}
                                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-800 line-clamp-1">
                                    {item.product.title}
                                  </h4>
                                  <div className="flex items-center gap-4 mt-1">
                                    <p className="text-gray-600 text-sm">
                                      Qty: {item.count}
                                    </p>
                                    <p className="text-gray-800 font-medium">
                                      ${item.price.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-6">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-gray-600" />
                              Order Summary
                            </h3>

                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">
                                  ${(order.totalOrderPrice - order.shippingPrice).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium">
                                  ${order.shippingPrice.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-gray-200">
                                <span className="font-medium">Total</span>
                                <span className="font-bold text-gray-800">
                                  ${order.totalOrderPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Shipping Address */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <Truck className="w-5 h-5 text-gray-600" />
                              Shipping Address
                            </h3>

                            <div className="text-gray-600 text-sm space-y-1">
                              <p className="flex items-center gap-2">
                                <Home className="w-4 h-4 text-gray-500" />
                                {order.shippingAddress.details}
                              </p>
                              <p className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                {order.shippingAddress.city}
                              </p>
                              <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                {order.shippingAddress.phone}
                              </p>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-gray-600" />
                              Payment Method
                            </h3>
                            <p className="text-gray-600 capitalize flex items-center gap-2">
                              <span className={`inline-block w-2 h-2 rounded-full ${
                                order.isPaid ? 'bg-emerald-500' : 'bg-yellow-500'
                              }`}></span>
                              {order.paymentMethodType} {order.isPaid && <span className="text-emerald-600 text-xs ml-2">(Paid)</span>}
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}