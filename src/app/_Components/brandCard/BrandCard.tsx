"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";

export type Brand = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};
export type BrandsApiResponse = {
  results: number;
  metadata: {
    currentPage: number;
    numberOfPages: number;
    limit: number;
    nextPage?: number;
  };
  data: Brand[];
};
interface BrandCardProps {
  brand: Brand;
  className?: string;
}

export default function BrandCard({ brand, className = "" }: BrandCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const USE_FALLBACK_ONLY = true; // Temporarily forcing fallback due to CORS issues
  const getBrandColor = (name: string) => {
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600', 
      'from-red-500 to-pink-600',
      'from-yellow-500 to-orange-600',
      'from-indigo-500 to-blue-600',
      'from-purple-500 to-indigo-600',
      'from-pink-500 to-rose-600',
      'from-teal-500 to-green-600',
      'from-orange-500 to-red-600',
      'from-cyan-500 to-blue-600'
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };
  const getImageUrl = () => {
    if (USE_FALLBACK_ONLY) return null;
    if (retryCount === 0) {
      return `/api/image-proxy?url=${encodeURIComponent(brand.image)}`;
    }
    if (retryCount === 1) {
      return brand.image;
    }
    if (retryCount === 2) {
      return brand.image.replace('http://', 'https://');
    }
    return null;
  };
  const handleImageError = () => {
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      setImageLoading(true);
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  };
  const handleImageLoad = () => {
    setImageLoading(false);
  };
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
    setRetryCount(0);
  }, [brand._id]);
  return (
    <Link 
      href={`/brands/${brand.slug}`} 
      className={`group ${className} focus:outline-none`}
      aria-label={`View ${brand.name} products`}
    >
      <article className="brand-card bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
        <div className="brand-image-container relative w-full h-48 md:h-56 lg:h-64 bg-gray-50 dark:bg-gray-700 flex items-center justify-center p-6">
          <div className="relative w-full h-full">
            {!imageError && !USE_FALLBACK_ONLY ? (
              <>
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                )}
                <img
                  src={getImageUrl()}
                  alt={`${brand.name} logo`}
                  className={`w-full h-full object-contain group-hover:scale-105 transition-all duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  loading="lazy"
                  crossOrigin="anonymous"
                />
              </>
            ) : (
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getBrandColor(brand.name)} rounded-lg relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 25% 25%, white 2px, transparent 2px)',
                    backgroundSize: '20px 20px'
                  }}></div>
                </div>
                <div className="text-center relative z-10">
                  <div className="w-20 h-20 mx-auto mb-3 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                    <span className="text-3xl font-bold text-white drop-shadow-lg">
                      {brand.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
                    <p className="text-sm font-semibold text-white drop-shadow">
                      {brand.name}
                    </p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/10 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 rounded-t-2xl"></div>
        </div>
        <div className="brand-info p-4 md:p-6">
          <h3 className="brand-name text-lg md:text-xl font-semibold text-gray-900 dark:text-white text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {brand.name}
          </h3>
          <p className="brand-slug text-sm text-gray-500 dark:text-gray-400 text-center mt-1 capitalize">
            {brand.slug.replace('-', ' ')}
          </p>
        </div>
        <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" aria-hidden="true"></div>
      </article>
    </Link>
  );
}
