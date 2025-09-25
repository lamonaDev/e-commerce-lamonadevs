"use client";
import Link from "next/link";
import { useState, useContext } from "react";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { Button } from "@heroui/react";
import { MainContext } from "@/app/_Context/MainContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AxiosError } from "axios";
import { ProductFromCat } from "@/app/(user)/categories/[...slug]/page";

export type Subcategory = {
  _id: string;
  name: string;
  slug: string;
  category: string;
};

export type Brand = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
};

export type Product = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  quantity: number;
  price: number;
  priceAfterDiscount?: number;
  imageCover: string;
  images: string[];
  sold: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  subcategory: Subcategory[];
  category: Category;
  brand: Brand;
  createdAt: string;
  updatedAt: string;
  id: string;
};

interface ProductCardProps {
  product: ProductFromCat;
  productId?: string;
  className?: string;
  onAddToCart?: (product: ProductFromCat) => void;
  onAddToWishlist?: (product: ProductFromCat) => void;
  isInWishlist?: boolean;
}

export default function ProductCard({
  product,
  className = "",
  productId,
  onAddToCart,
  onAddToWishlist,
  isInWishlist = false,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);

  const { userToken, setNumberOfCart, invalidateCart } = useContext(MainContext) as {
    userToken: string | null;
    setNumberOfCart: (value: number) => void;
    invalidateCart: () => void;
  };

  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!userToken) throw new Error("Please log in to add to cart");
      const response = await axios.post(
        "https://ecommerce.routemisr.com/api/v1/cart",
        { productId: product._id },
        {
          headers: {
            "Content-Type": "application/json",
            token: userToken,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      // toast.success("Product added to cart successfully");
      const currentCount = queryClient.getQueryData<number>(["cartItemCount", userToken]) || 0;
      queryClient.setQueryData(["cartItemCount", userToken], currentCount + 1);
      setNumberOfCart(currentCount + 1);
      invalidateCart();
      onAddToCart?.(product);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to add product to cart");
    },
    onSettled: () => {
      setIsAddingToCart(false);
    },
  });

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    addToCartMutation.mutate();
  };

  const handleToggleWishlist = async () => {
    if (!userToken) {
      toast.error("Please log in to modify wishlist");
      return;
    }
    setIsUpdatingWishlist(true);
    try {
      if (isWishlisted) {
        await axios.delete(`https://ecommerce.routemisr.com/api/v1/wishlist/${product._id}`, {
          headers: { token: userToken },
        });
        setIsWishlisted(false);
      } else {
        await axios.post(
          "https://ecommerce.routemisr.com/api/v1/wishlist",
          { productId: product._id },
          { headers: { token: userToken } }
        );
        setIsWishlisted(true);
      }
      onAddToWishlist?.(product);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || `Failed to ${isWishlisted ? "remove from" : "add to"} wishlist`);
      setIsWishlisted(isWishlisted);
    } finally {
      setIsUpdatingWishlist(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-3 h-3 md:w-4 md:h-4 fill-yellow-200 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-3 h-3 md:w-4 md:h-4 text-gray-300" />);
    }

    return stars;
  };

  const discountPercentage = product.priceAfterDiscount
    ? Math.round(((product.price - product.priceAfterDiscount) / product.price) * 100)
    : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`product-card group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col ${className}`}
    >
      <button
        onClick={handleToggleWishlist}
        disabled={isUpdatingWishlist}
        className={` flex flex-col justify-center items-center shadow-2xl absolute top-3 right-3 z-10 p-1.5 md:p-2 w-10 h-10 rounded-full transition-all duration-200 ${
          isWishlisted
            ? "bg-red-100 text-red-500 hover:bg-red-200 shadow-2xl"
            : "bg-gray-200 backdrop-blur-sm text-gray-600 hover:bg-gray-100 hover:text-red-500 shadow-2xl"
        } shadow-sm disabled:opacity-50`}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`w-5 h-5 md:w-5 md:h-5 ${isWishlisted ? "fill-current" : ""}`} />
      </button>
      {discountPercentage > 0 && (
        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
          {discountPercentage}% OFF
        </div>
      )}
      <Link href={`/home/products/${product._id}`} className="block flex-1">
        <div className="relative w-full h-48 sm:h-56 md:h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
              />
            </div>
          )}
          {!imageError ? (
            <img
              src={product.imageCover || product.images?.[0]}
              alt={product.title}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                imageLoading ? "opacity-0" : "opacity-100 group-hover:scale-105"
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <div className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-500 dark:text-gray-400">
                    {product.title.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">No Image Available</p>
              </div>
            </div>
          )}
        </div>
      </Link>
      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-1">
          {product.category?.name && (
            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full truncate">
              {product.category.name}
            </span>
          )}
          {product.brand?.name && (
            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium truncate">
              {product.brand.name}
            </span>
          )}
        </div>
        <Link href={`/home/products/${product._id}`} className="block">
          <h3 className="font-medium text-gray-900 dark:text-white text-sm md:text-base line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 mb-1">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 md:gap-2 my-1">
          <div className="flex items-center">{renderStars(product.ratingsAverage)}</div>
          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            ({product.ratingsQuantity})
          </span>
        </div>
        <div className="mb-2">
          {product.priceAfterDiscount ? (
            <div className="flex items-center gap-2">
              <span className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400">
                {formatPrice(product.priceAfterDiscount)}
              </span>
              <span className="text-sm md:text-base text-gray-500 dark:text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            </div>
          ) : (
            <span className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400">
              {formatPrice(product.price)}
            </span>
          )}
          {product.sold > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              {product.sold} sold
            </span>
          )}
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.quantity === 0}
          className={`w-full ${product.quantity === 0 ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
          size="sm"
        >
          {isAddingToCart ? (
            <>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center justify-center"
              >
                <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                Adding...
              </motion.span>
            </>
          ) : product.quantity === 0 ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Add to Cart
            </>
          )}
        </Button>
        <div className="mt-1 text-center">
          {product.quantity > 0 ? (
            <span className="text-xs text-green-600 dark:text-green-400">
              ✓ {product.quantity} in stock
            </span>
          ) : (
            <span className="text-xs text-red-600 dark:text-red-400">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}