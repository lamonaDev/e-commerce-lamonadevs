"use client";
import { useContext, useState, useEffect } from "react";
import { MainContext } from "@/app/_Context/MainContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { Trash2, Plus, User, Mail, Phone, MapPin, Home, Lock, RefreshCw } from "lucide-react";
import { Button } from "@heroui/react";
import AdressModal from "../_Components/adressModal/AddressModal";
import { IoIosArrowRoundBack } from "react-icons/io";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosPaper } from "react-icons/io";
import { easeInOut } from "framer-motion";
import Image from "next/image";

interface Address {
  _id: string;
  name: string;
  details: string;
  phone: string;
  city: string;
}

interface AddressesResponse {
  data: Address[];
}

export interface DecodedToken {
  id: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

export interface UserTokenResponse {
  message: string;
  decoded: DecodedToken;
}

export interface UserData {
  data: {
    role: string;
    active: boolean;
    wishlist: string[];
    _id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    addresses: Address[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

function UserPageContent() {
  const { userToken, userData } = useContext(MainContext) as { userToken: string | null; userData: object | null };
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isMounted, setIsMounted] = useState(false);
  const queryClient = useQueryClient();

  // Ensure component is mounted before rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ecommerce.routemisr.com/api/v1";

  const { data, isLoading, error } = useQuery<AddressesResponse, Error>({
    queryKey: ["addresses", userToken],
    queryFn: async () => {
      if (!userToken) throw new Error("User not authenticated");
      const response = await axios.get(`${API_BASE_URL}/addresses`, {
        headers: { token: userToken },
      });
      return response.data;
    },
    enabled: !!userToken,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: userDataFromToken } = useQuery<UserTokenResponse, Error>({
    queryKey: ["userDataFromToken", userToken],
    queryFn: async () => {
      if (!userToken) throw new Error("User not authenticated");
      const response = await axios.get(`${API_BASE_URL}/auth/verifyToken`, {
        headers: { token: userToken }
      });
      return response?.data;
    },
    enabled: !!userToken,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const { data: userDataQuery } = useQuery<UserData, Error>({
    queryKey: ["userQuery", userDataFromToken?.decoded?.id],
    queryFn: async () => {
      if (!userDataFromToken?.decoded?.id) throw new Error("User not found");
      const response = await axios.get(`${API_BASE_URL}/users/${userDataFromToken?.decoded?.id}`);
      return response?.data;
    },
    enabled: !!userDataFromToken?.decoded?.id,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      if (!userToken) throw new Error("User not authenticated");
      const response = await axios.delete(`${API_BASE_URL}/addresses/${addressId}`, {
        headers: { token: userToken },
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Address deleted successfully", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        }
      });
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: AxiosError<{message: string}>) => {
      toast.error(error.response?.data?.message || "Failed to delete address", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        }
      });
    },
  });

  const handleDeleteAddress = (addressId: string) => {
    deleteAddressMutation.mutate(addressId);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const buttonVariants = {
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: easeInOut
      }
    },
    tap: {
      scale: 0.98
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
        duration: 0.5
      }
    }
  };

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center h-full"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"
          />
          <p className="mt-4 text-emerald-500 font-medium">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-full"
        >
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mb-4"
            >
              <Trash2 className="w-16 h-16 text-red-500 mx-auto" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error loading profile</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {error?.message || "Please try refreshing the page or contact support."}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="flat"
              color="primary"
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <motion.div
            whileHover="hover"
            variants={buttonVariants}
          >
            <Button
              as={Link}
              href='/home'
              variant='flat'
              color='success'
              className='mb-6 group'
            >
              <div className="flex items-center gap-2">
                <IoIosArrowRoundBack className="group-hover:-translate-x-1 transition-transform" size={24} />
                <span>Back to Home</span>
              </div>
            </Button>
          </motion.div>
        </motion.div>
        <motion.h1
          variants={itemVariants}
          className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
        >
          My Profile
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl"
        >
          Manage your personal information and addresses
        </motion.p>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div
            variants={itemVariants}
            className="lg:w-1/3 w-full space-y-6"
          >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700/50 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-blue-900/10 -z-10" />
              <div className="flex flex-col items-center text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mb-4"
                >
                  {!imageError ? (
                    <Image
                      src="" // Fallback image
                      alt="Profile picture"
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500 shadow-lg"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center border-4 border-emerald-500 shadow-lg">
                      <span className="text-4xl font-bold text-white">
                        {userDataQuery?.data?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white mb-1"
                >
                  {userDataQuery?.data?.name || "User"}
                </motion.h2>
                <div className="flex items-center gap-2 text-emerald-300 mb-3">
                  <span className={`h-2 w-2 rounded-full ${userDataQuery?.data?.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm">{userDataQuery?.data?.active ? "Active" : "Inactive"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 mb-4">
                  <span className="bg-gray-700 px-2 py-1 rounded-full text-xs">
                    {userDataQuery?.data?.role || "user"}
                  </span>
                </div>
                <div className="w-full space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="h-5 w-5 text-emerald-400" />
                    <span>{userDataQuery?.data?.email || "user@example.com"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone className="h-5 w-5 text-emerald-400" />
                    <span>{userDataQuery?.data?.phone || "+123 456 7890"}</span>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                    <Button
                      as={Link}
                      href="/allorders"
                      className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-medium py-3"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <IoIosPaper size={18} />
                        <span>My Orders</span>
                      </div>
                    </Button>
                  </motion.div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                      <Button
                        variant="flat"
                        color="primary"
                        className="bg-gray-700 hover:bg-gray-600 text-blue-200 hover:text-white py-3 w-full"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Lock size={18} />
                          <span className="text-sm">Reset Password</span>
                        </div>
                      </Button>
                    </motion.div>
                    <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                      <Button
                        variant="flat"
                        color="primary"
                        className="bg-gray-700 hover:bg-gray-600 text-blue-200 hover:text-white py-3 w-full"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <User size={18} />
                          <span className="text-sm">Update Profile</span>
                        </div>
                      </Button>
                    </motion.div>
                    <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants} className="col-span-full">
                      <Button
                        variant="flat"
                        color="primary"
                        className="bg-gray-700 hover:bg-gray-600 text-blue-200 hover:text-white py-3 w-full"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw size={18} />
                          <span className="text-sm">Update Password</span>
                        </div>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="lg:w-2/3 w-full space-y-6"
          >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700/50">
              <div className="flex justify-between items-center mb-6">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold text-white"
                >
                  My Addresses
                </motion.h2>
                <AdressModal />
              </div>
              {data.data.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="mb-4"
                  >
                    <Home className="w-16 h-16 text-gray-400 mx-auto" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">
                    No Addresses Found
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Add your first address to make checkout faster and easier
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <AnimatePresence>
                    {data.data.map((address) => (
                      <motion.div
                        key={address._id}
                        variants={itemVariants}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="p-5 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-emerald-500 transition-colors relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-medium text-white">{address.name}</h3>
                            <motion.button
                              onClick={() => handleDeleteAddress(address._id)}
                              disabled={deleteAddressMutation.isPending}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 rounded-full bg-red-900/50 hover:bg-red-800 text-red-300 hover:text-white transition-colors"
                              title="Delete address"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2 text-gray-300">
                              <MapPin className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                              <p className="text-sm">{address.details}</p>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <Home className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                              <p className="text-sm">{address.city}</p>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <Phone className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                              <p className="text-sm">{address.phone}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function UserPage() {
  return <UserPageContent />;
}