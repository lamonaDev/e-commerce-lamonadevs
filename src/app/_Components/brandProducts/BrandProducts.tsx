"use client";
import { useState, useEffect } from "react";
import ProductCard, { Product } from "../productCard/productCard";
import { Button } from "@heroui/react";
import { Grid3X3, List, RefreshCw, Package } from "lucide-react";
import ProductsApiService, { ProductsApiResponse } from "../../_Services/productsApi";
import { Brand } from "../brandCard/BrandCard";
import { ProductFromCat } from "@/app/(user)/categories/[...slug]/page";
import toast from "react-hot-toast";

interface BrandProductsProps {
  brand: Brand;
  className?: string;
}
type ViewMode = 'grid' | 'list';
export default function BrandProducts({ brand, className = "" }: BrandProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ProductsApiResponse['metadata'] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const fetchBrandProducts = async (page: number = 1, resetData: boolean = false) => {
    try {
      if (resetData) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const response = await ProductsApiService.getProductsByBrand(brand._id, page, 20);
      
      if (resetData) {
        setProducts(response.data);
      } else {
        setProducts(prev => [...prev, ...response.data]);
      }
      
      setMetadata(response.metadata);
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };
  useEffect(() => {
    fetchBrandProducts(1, true);
  }, [brand._id]);

  const handleLoadMore = () => {
    if (metadata?.nextPage) {
      fetchBrandProducts(metadata.nextPage, false);
    }
  };

  const handleRefresh = () => {
    fetchBrandProducts(1, true);
  };

  const handleAddToCart = async (product: ProductFromCat) => {
    toast.success("Product added to cart successfully")
  };

  const handleAddToWishlist = async (product: ProductFromCat) => {
    toast.success("Product Toggeled To WishList")
  };

  if (isLoading) {
    return (
      <section className={`brand-products-loading py-8 md:py-12 ${className}`}>
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-lg w-48 mx-auto"></div>
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
      </section>
    );
  }

  return (
    <section className={`brand-products py-8 md:py-12 bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <header className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              {brand.name} Products
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2"
              aria-label="Refresh products"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover high-quality products from {brand.name}
            {metadata && (
              <span className="block text-sm mt-2">
                {products.length} products available
              </span>
            )}
          </p>
        </header>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-between mb-8">
          <div className="text-gray-600 dark:text-gray-400">
            <span>Showing {products.length} products</span>
            {metadata && metadata.numberOfPages > 1 && (
              <span> • Page {currentPage} of {metadata.numberOfPages}</span>
            )}
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="View mode options">
            <Button
              variant={viewMode === 'grid' ? 'solid' : 'bordered'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="p-2"
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'solid' : 'bordered'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="p-2"
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {error && (
          <div className="error-message mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
        {products.length > 0 ? (
          <div className={`products-grid ${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' 
              : 'grid grid-cols-1 md:grid-cols-2 gap-6'
          }`}>
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                className="product-card-item"
              />
            ))}
          </div>
        ) : (
          <div className="no-products text-center py-12 md:py-20">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                No Products Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {brand.name} dose not have any products available at the moment. 
                Check back later for new arrivals.
              </p>
              <Button 
                variant="bordered" 
                onClick={handleRefresh}
                className="mx-auto"
              >
                Refresh Products
              </Button>
            </div>
          </div>
        )}
        {!isLoading && products.length > 0 && metadata && metadata.nextPage && (
          <div className="load-more text-center mt-12">
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Loaded {products.length} of {metadata.results} products
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-md mx-auto">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((products.length / metadata.results) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>
            <Button
              variant="bordered"
              size="lg"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-8 py-3"
            >
              {isLoadingMore ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load More Products'
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
