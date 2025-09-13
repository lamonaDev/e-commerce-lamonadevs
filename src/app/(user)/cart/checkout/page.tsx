"use client";
import { useContext, useState } from "react";
import { MainContext } from "@/app/_Context/MainContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@heroui/react";
import { RadioGroup, Radio } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCreditCard, FiDollarSign, FiShoppingBag, FiMapPin, FiTrash2 } from "react-icons/fi";
import AddressModal from "../../../_Components/adressModal/AddressModal";
import { CartItem, Address, CartResponse, AddressesResponse, UserTokenResponse } from "../../../../../types/all";

function CartItemDisplay({ item }: { item: CartItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
    >
      <div className="relative">
        <img
          src={item.product.imageCover}
          alt={item.product.title}
          className="w-16 h-16 object-cover rounded-md"
          onError={(e) => (e.currentTarget.src = "https://placehold.co/64x64?text=Image+Error")}
        />
        <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{item.count}</span>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white line-clamp-1">{item.product.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.price)}
          </span>
          {item.product.price && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
              {Math.round(((item.product.price - item.price) / item.product.price) * 100)}% OFF
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function CheckOutPage() {
  const { userToken, invalidateCart } = useContext(MainContext) as {
    userToken: string | null;
    invalidateCart: () => void;
  };
  const queryClient = useQueryClient();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("online");

  const { data: cartData, isLoading: cartLoading, error: cartError } = useQuery<CartResponse, Error>({
    queryKey: ["cart", userToken],
    queryFn: async () => {
      if (!userToken) throw new Error("User not authenticated");
      const response = await axios.get("https://ecommerce.routemisr.com/api/v1/cart", {
        headers: { token: userToken },
      });
      return response.data;
    },
    enabled: !!userToken,
    retry: 1,
  });

  const { data: addressesData, isLoading: addressesLoading } = useQuery<AddressesResponse, Error>({
    queryKey: ["addresses", userToken],
    queryFn: async () => {
      if (!userToken) throw new Error("User not authenticated");
      const response = await axios.get("https://ecommerce.routemisr.com/api/v1/addresses", {
        headers: { token: userToken },
      });
      return response.data;
    },
    enabled: !!userToken,
    retry: 1,
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!userToken) throw new Error("User not authenticated");
      const response = await axios.delete("https://ecommerce.routemisr.com/api/v1/cart", {
        headers: { token: userToken },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Cart cleared successfully");
      invalidateCart();
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to clear cart");
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      if (!userToken) return toast.error("User not authenticated");
      if (!selectedAddress) return toast.error("Please select a shipping address");
      if (!cartData?.data._id) throw new Error("Cart not found");

      const shippingAddressData = {
        shippingAddress: {
          details: selectedAddress.details,
          phone: selectedAddress.phone,
          city: selectedAddress.city,
        },
      };

      if (paymentMethod === "cash") {
        const response = await axios.post(
          `https://ecommerce.routemisr.com/api/v1/orders/${cartData.data._id}`,
          shippingAddressData,
          {
            headers: {
              "Content-Type": "application/json",
              token: userToken,
            },
          }
        );
        clearCartMutation.mutate();
        return { data: response.data, paymentMethod: "cash" };
      } else {
        const response = await axios.post(
          `https://ecommerce.routemisr.com/api/v1/orders/checkout-session/${cartData.data._id}?url=http://localhost:3000`,
          shippingAddressData,
          {
            headers: {
              "Content-Type": "application/json",
              token: userToken,
            },
          }
        );
        return { data: response.data, paymentMethod: "online" };
      }
    },
    onSuccess: (result) => {
      toast.success("Order placed successfully");
      if (result.paymentMethod === "online" && result.data.session && result.data.session.url) {
        window.location.href = result.data.session.url;
      } else if (result.paymentMethod === "cash") {
        toast.success("Cash order placed successfully!");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to place order");
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
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
        duration: 0.5
      }
    }
  };
  const handlePlaceOrder = () => {
    placeOrderMutation.mutate();
  };

  if (cartLoading || addressesLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] pt-4 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-[70vh]"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
            />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Processing your order...</h2>
          </motion.div>
        </div>
      </div>
    );
  }

  if (cartError || !cartData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] pt-4 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <div className="mb-6 text-red-500">
              <FiShoppingBag size={60} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Error Loading Cart</h2>
            <p className="text-gray-600 dark:text-gray-400">We couldn't load your cart. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  const cartItems = cartData.data.products || [];
  const totalPrice = cartData.data.totalCartPrice || 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-[calc(100vh-4rem)] pt-4 pb-12 bg-gray-50 dark:bg-gray-900"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          variants={itemVariants}
          className="text-3xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-2"
        >
          <FiShoppingBag className="text-blue-600" />
          Checkout
        </motion.h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div
            variants={itemVariants}
            className="lg:w-2/3 space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiShoppingBag className="text-blue-500" />
                  Your Cart ({cartItems.length} items)
                </h2>
                {cartItems.length > 0 && (
                  <Button
                    onPress={() => clearCartMutation.mutate()}
                    color="danger"
                    variant="light"
                    size="sm"
                    isIconOnly
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 size={18} />
                  </Button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <FiShoppingBag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Your cart is empty</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Add items to your cart to proceed with checkout.</p>
                </motion.div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  className="space-y-4"
                >
                  <AnimatePresence>
                    {cartItems.map((item) => (
                      <CartItemDisplay key={item._id} item={item} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiMapPin className="text-blue-500" />
                  Shipping Address
                </h2>
                <AddressModal />
              </div>

              {addressesData?.data?.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <FiMapPin size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No Addresses Found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Please add an address to proceed.</p>
                </motion.div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  className="space-y-4"
                >
                  {addressesData?.data?.map((address) => (
                    <motion.div
                      key={address._id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedAddress?._id === address._id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                      }`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{address.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{address.details}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{address.city}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {address.phone}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="lg:w-1/3 space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-24">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <FiCreditCard className="text-blue-500" />
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="font-medium text-green-600 dark:text-green-400">Free</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Payment Method</h3>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as "cash" | "online")}
                  className="space-y-3"
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === "online"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Radio id="online-payment" value="online" className="text-blue-500" />
                      <div>
                        <label htmlFor="online-payment" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                          Online Payment
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pay with credit card (Visa, Mastercard, etc.)</p>
                      </div>
                      <FiCreditCard className="ml-auto text-blue-500" size={20} />
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === "cash"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Radio id="cash-payment" value="cash" className="text-blue-500" />
                      <div>
                        <label htmlFor="cash-payment" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                          Cash on Delivery
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pay when you receive your order</p>
                      </div>
                      <FiDollarSign className="ml-auto text-blue-500" size={20} />
                    </div>
                  </motion.div>
                </RadioGroup>
              </div>

              <Button
                onPress={handlePlaceOrder}
                disabled={placeOrderMutation.isPending || !selectedAddress || cartItems.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.01] shadow-lg"
                isLoading={placeOrderMutation.isPending}
              >
                {paymentMethod === "cash" ? "Place Cash Order" : "Proceed to Payment"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}