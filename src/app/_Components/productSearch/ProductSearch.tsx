"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, X, Loader2, Package } from "lucide-react";
import ProductCard, { Product } from "../productCard/productCard";
import { Button, Input } from "@heroui/react";
import ProductsApiService from "../../_Services/productsApi";

interface ProductSearchProps {
  placeholder?: string;
  className?: string;
  showResults?: boolean;
  onProductSelect?: (product: Product) => void;
}
function useDebounced<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
export default function ProductSearch({ 
  placeholder = "Search products...", 
  className = "",
  showResults = true,
  onProductSelect 
}: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const debouncedSearchTerm = useDebounced(searchTerm, 500);
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }
      setIsSearching(true);
      setError(null);
      setHasSearched(true);
      try {
        const response = await ProductsApiService.searchProducts(debouncedSearchTerm, 1, 20);
        setSearchResults(response.data);
        setIsExpanded(true);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search products. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    performSearch();
  }, [debouncedSearchTerm]);

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setHasSearched(false);
    setIsExpanded(false);
    setError(null);
  };
  const handleProductClick = (product: Product) => {
    onProductSelect?.(product);
    if (!onProductSelect) {
      window.location.href = `/products/${product.slug}`;
    }
  };
  const handleAddToCart = useCallback(async (product: Product) => {
    console.log('Adding to cart:', product.title);
  }, []);

  const handleAddToWishlist = useCallback(async (product: Product) => {
    console.log('Adding to wishlist:', product.title);
  }, []);
  return (
    <div className={`product-search relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 z-10" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-12 text-sm md:text-base"
          size="lg"
          onFocus={() => {
            if (searchResults.length > 0) {
              setIsExpanded(true);
            }
          }}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {isSearching && (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          )}
          {searchTerm && !isSearching && (
            <button
              onClick={handleClearSearch}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>
      {showResults && isExpanded && hasSearched && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[70vh] md:max-h-[80vh] overflow-hidden">
          {/* Search Header */}
          <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                Search Results
                {searchResults.length > 0 && (
                  <span className="ml-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    ({searchResults.length} found)
                  </span>
                )}
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close search results"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <div className="max-h-[50vh] md:max-h-[60vh] overflow-y-auto">
            {error ? (
              <div className="p-4 md:p-6 text-center">
                <p className="text-red-600 dark:text-red-400 mb-4 text-sm md:text-base">{error}</p>
                <Button variant="bordered" onClick={() => window.location.reload()} size="sm">
                  Retry
                </Button>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-3 md:p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {searchResults.map((product) => (
                    <div key={product._id} className="cursor-pointer" onClick={() => handleProductClick(product)}>
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                        onAddToWishlist={handleAddToWishlist}
                        className="hover:scale-105 transition-transform duration-200 h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : debouncedSearchTerm ? (
              <div className="p-6 md:p-8 text-center">
                <Package className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-400 mb-4" />
                <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No products found
                </h4>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
                  We couldn't find any products matching "{debouncedSearchTerm}".
                  Try different keywords or browse our categories.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button variant="bordered" onClick={handleClearSearch} size="sm">
                    Clear Search
                  </Button>
                  <Button variant="solid" size="sm">
                    Browse Categories
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}
