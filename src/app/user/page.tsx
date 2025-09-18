"use client";
import { useContext, useState, useEffect } from "react";
import { MainContext } from "@/app/_Context/MainContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { Trash2, Plus, User, Mail, Phone, MapPin, Home, Lock, RefreshCw } from "lucide-react";
import { Button } from "@heroui/react";
import AdressModal from "../_Components/adressModal/AddressModal";
import { IoIosArrowRoundBack, IoIosPaper } from "react-icons/io";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Types
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

interface DecodedToken {
  id: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

interface UserTokenResponse {
  message: string;
  decoded: DecodedToken;
}

interface UserDataResponse {
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

// Skeleton components
const ProfileSkeleton = () => (
  <div className="lg:w-1/3 w-full space-y-6">
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <div className="flex flex-col items-center text-center">
        <div className="w-32 h-32 rounded-full bg-gray-700 mb-4 animate-pulse"></div>
        <div className="h-6 w-32 bg-gray-700 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-700 rounded mb-4 animate-pulse"></div>
        <div className="w-full space-y-3 mb-6">
          <div className="h-4 w-full bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-full bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="w-full space-y-3">
          <div className="h-10 w-full bg-gray-700 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-10 w-full bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-700 rounded animate-pulse col-span-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AddressSkeleton = () => (
  <div className="lg:w-2/3 w-full space-y-6">
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 w-10 bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((item) => (
          <div key={item} className="p-5 bg-gray-700 rounded-xl animate-pulse">
            <div className="h-4 w-32 bg-gray-600 rounded mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-600 rounded"></div>
              <div className="h-3 w-full bg-gray-600 rounded"></div>
              <div className="h-3 w-2/3 bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

function UserPageContent() {
  const router = useRouter();
  const { userToken, userData } = useContext(MainContext) || { userToken: null, userData: null };
  const [imageError, setImageError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const queryClient = useQueryClient();

  // Ensure component is mounted before rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!userToken && isMounted) {
      router.push('/login');
    }
  }, [userToken, isMounted, router]);

  // API Configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ecommerce.routemisr.com/api/v1";

  // Fetch addresses
  const { data: addressesData, isLoading: isLoadingAddresses, error: addressesError } = useQuery({
    queryKey: ["addresses", userToken],
    queryFn: async (): Promise<AddressesResponse> => {
      if (!userToken) throw new Error("User not authenticated");
      const response = await axios.get(`${API_BASE_URL}/addresses`, {
        headers: { token: userToken },
      });
      return response.data;
    },
    enabled: !!userToken && isMounted,
    retry: 2,
  });

  // Verify token and get user data
  const { data: tokenData, isLoading: isLoadingToken } = useQuery({
    queryKey: ["userTokenData", userToken],
    queryFn: async (): Promise<UserTokenResponse> => {
      if (!userToken) throw new Error("User not authenticated");
      const response = await axios.get(`${API_BASE_URL}/auth/verifyToken`, {
        headers: { token: userToken },
      });
      return response.data;
    },
    enabled: !!userToken && isMounted,
    retry: 2,
  });

  // Get full user data
  const { data: userDataResponse, isLoading: isLoadingUserData } = useQuery({
    queryKey: ["userData", tokenData?.decoded?.id],
    queryFn: async (): Promise<UserDataResponse> => {
      if (!tokenData?.decoded?.id) throw new Error("User ID not found");
      const response = await axios.get(`${API_BASE_URL}/users/${tokenData.decoded.id}`);
      return response.data;
    },
    enabled: !!tokenData?.decoded?.id && isMounted,
    retry: 2,
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      if (!userToken) throw new Error("User not authenticated");
      const response = await axios.delete(`${API_BASE_URL}/addresses/${addressId}`, {
        headers: { token: userToken },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Address deleted successfully", {
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: AxiosError<{message: string}>) => {
      toast.error(error.response?.data?.message || "Failed to delete address", {
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
    },
  });

  const handleDeleteAddress = (addressId: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      deleteAddressMutation.mutate(addressId);
    }
  };

  const handleImageError = () => setImageError(true);

  // Loading states
  const isLoading = isLoadingAddresses || isLoadingToken || isLoadingUserData;

  // Error states
  const hasError = addressesError || !addressesData || !userDataResponse;

  if (!isMounted) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="space-y-6">
          <Button
            as={Link}
            href='/home'
            variant='flat'
            color='success'
            className='mb-6'
          >
            <div className="flex items-center gap-2">
              <IoIosArrowRoundBack size={24} />
              <span>Back to Home</span>
            </div>
          </Button>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
            Manage your personal information and addresses
          </p>

          <div className="flex flex-col lg:flex-row gap-8">
            <ProfileSkeleton />
            <AddressSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center py-12 max-w-md">
            <div className="mb-4">
              <Trash2 className="w-16 h-16 text-red-500 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {addressesError ? "Error loading profile" : "No user data found"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {addressesError?.message || "Please try refreshing the page or contact support."}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="flat"
                color="primary"
              >
                Refresh Page
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="flat"
                color="secondary"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          as={Link}
          href='/home'
          variant='flat'
          color='success'
          className='mb-6'
        >
          <div className="flex items-center gap-2">
            <IoIosArrowRoundBack size={24} />
            <span>Back to Home</span>
          </div>
        </Button>

        {/* Page Header */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          My Profile
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
          Manage your personal information and addresses
        </p>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Profile Section */}
          <div className="lg:w-1/3 w-full space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700/50 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-blue-900/10 -z-10" />
              <div className="flex flex-col items-center text-center">
                {/* Profile Image */}
                <div className="mb-4">
                  {!imageError ? (
                    <Image
                      src="/default-profile.png"
                      alt="Profile picture"
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500 shadow-lg"
                      onError={handleImageError}
                      priority
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center border-4 border-emerald-500 shadow-lg">
                      <span className="text-4xl font-bold text-white">
                        {userDataResponse?.data?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <h2 className="text-2xl font-bold text-white mb-1">
                  {userDataResponse?.data?.name || "User"}
                </h2>

                <div className="flex items-center gap-2 text-emerald-300 mb-3">
                  <span className={`h-2 w-2 rounded-full ${userDataResponse?.data?.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm">{userDataResponse?.data?.active ? "Active" : "Inactive"}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-300 mb-4">
                  <span className="bg-gray-700 px-2 py-1 rounded-full text-xs">
                    {userDataResponse?.data?.role || "user"}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="w-full space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="h-5 w-5 text-emerald-400" />
                    <span>{userDataResponse?.data?.email || "user@example.com"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone className="h-5 w-5 text-emerald-400" />
                    <span>{userDataResponse?.data?.phone || "+123 456 7890"}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full space-y-3">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                    <Button
                      variant="flat"
                      color="primary"
                      className="bg-gray-700 hover:bg-gray-600 text-blue-200 hover:text-white py-3 w-full col-span-full"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw size={18} />
                        <span className="text-sm">Update Password</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div className="lg:w-2/3 w-full space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  My Addresses
                </h2>
                <AdressModal />
              </div>

              {addressesData?.data?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Home className="w-16 h-16 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">
                    No Addresses Found
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Add your first address to make checkout faster and easier
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addressesData?.data?.map((address) => (
                    <div
                      key={address._id}
                      className="p-5 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-emerald-500 transition-colors relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-medium text-white">{address.name}</h3>
                          <button
                            onClick={() => handleDeleteAddress(address._id)}
                            disabled={deleteAddressMutation.isPending}
                            className="p-1.5 rounded-full bg-red-900/50 hover:bg-red-800 text-red-300 hover:text-white transition-colors"
                            title="Delete address"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserPage() {
  return <UserPageContent />;
}