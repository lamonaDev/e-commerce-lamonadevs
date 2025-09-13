"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import BrandsApiService from "../../../_Services/brandsApi";
import BrandProducts from "../../../_Components/brandProducts/BrandProducts";
import { Brand } from "../../../_Components/brandCard/BrandCard";
import { Button } from "@heroui/react";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/_routes/route.route";
function BrandPageLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="animate-pulse">
            <div className="h-32 w-32 bg-gray-300 dark:bg-gray-700 rounded-2xl mx-auto mb-6"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-lg w-64 mx-auto"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BrandPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrandBySlug = async () => {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await BrandsApiService.getAllBrands(200);
        const foundBrand = response.data.find(b => b.slug === slug);
        
        if (foundBrand) {
          setBrand(foundBrand);
        } else {
          setError('Brand not found');
        }
      } catch (err) {
        console.error('Error fetching brand:', err);
        setError('Failed to load brand information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandBySlug();
  }, [slug]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <BrandPageLoadingFallback />
      </ProtectedRoute>
    );
  }

  if (error || !brand) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center py-20">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <span className="text-4xl">😞</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {error || 'Brand Not Found'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {error === 'Brand not found' 
                  ? `We couldn't find a brand with the name "${slug}". It might have been removed or the link is incorrect.`
                  : 'There was an error loading the brand information. Please try again.'
                }
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/brands">
                  <Button variant="solid">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Brands
                  </Button>
                </Link>
                <Button variant="bordered" onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <section className="bg-white dark:bg-gray-800 py-12 md:py-16 shadow-sm">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-8">
              <Link href="/brands">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to All Brands
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-white drop-shadow-lg">
                      {brand.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  {brand.name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  Discover the complete collection of {brand.name} products
                </p>
                <div className="flex flex-wrap gap-4 justify-center items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>Established Brand</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>Quality Assured</span>
                  </div>
                  <Button variant="bordered" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Brand Website
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Suspense fallback={<BrandPageLoadingFallback />}>
          <BrandProducts brand={brand} />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
