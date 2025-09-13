"use client";
import { useState, useMemo, useEffect } from "react";
import BrandCard, { Brand, BrandsApiResponse } from "../brandCard/BrandCard";
import { Button } from "@heroui/react";
import { Search, Grid3X3, List, Filter, RefreshCw } from "lucide-react";
import styles from "./BrandsPage.module.css";
import BrandsApiService from "../../_Services/brandsApi";
type ViewMode = 'grid' | 'list';
export default function BrandsPage() {
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<BrandsApiResponse['metadata'] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const fetchBrands = async (page: number = 1, resetData: boolean = false) => {
    try {
      if (resetData) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const response = await BrandsApiService.getBrands(page, 20);
      
      if (resetData) {
        setAllBrands(response.data);
      } else {
        setAllBrands(prev => [...prev, ...response.data]);
      }
      
      setMetadata(response.metadata);
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to load brands. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const fetchAllBrands = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await BrandsApiService.getAllBrands(200); 
      setAllBrands(response.data);
      setMetadata(response.metadata);
    } catch (err) {
      setError('Failed to load brands. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchAllBrands();
  }, []);

  const filteredBrands = useMemo(() => {
    if (!searchTerm.trim()) return allBrands;
    
    return allBrands.filter(brand =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allBrands, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleLoadMore = () => {
    if (metadata?.nextPage) {
      fetchBrands(metadata.nextPage, false);
    }
  };

  const handleRefresh = () => {
    fetchAllBrands();
  };

  return (
    <main className="brands-page min-h-screen bg-gray-50 dark:bg-gray-900 py-6 md:py-8 lg:py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <header className="brands-header text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Our Brands
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2"
              aria-label="Refresh brands"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover amazing products from the world  most trusted brands
            {metadata && (
              <span className="block text-sm mt-2">
                {metadata.numberOfPages} pages • {allBrands.length} brands loaded
              </span>
            )}
          </p>
        </header>
        <section className="brands-controls mb-8 md:mb-12" aria-label="Brand search and view options">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="search-container relative flex-1 max-w-md w-full">
              <label htmlFor="brand-search" className="sr-only">
                Search brands by name or description
              </label>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
              <input
                id="brand-search"
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                aria-describedby="search-description"
              />
              <div id="search-description" className="sr-only">
                Search through {allBrands.length} available brands
              </div>
            </div>
            <div className="view-controls flex items-center gap-2" role="group" aria-label="View mode options">
              <Button
                variant={viewMode === 'grid' ? 'solid' : 'bordered'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="p-2"
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <Grid3X3 className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'solid' : 'bordered'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-2"
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
              >
                <List className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>
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
        <div className="results-count mb-6" aria-live="polite" aria-atomic="true">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredBrands.length} of {allBrands.length} brands
            {searchTerm && (
              <span className="font-medium"> for {searchTerm}</span>
            )}
            {isLoading && (
              <span className="text-blue-500 ml-2">Loading...</span>
            )}
          </p>
        </div>
        <section aria-label={`Brand results - ${filteredBrands.length} brands found`}>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-lg w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-lg w-1/2 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBrands.length > 0 ? (
            <div 
              className={`brands-grid ${styles.brandsGrid} ${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8' 
                  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
              }`}
              role="grid"
              aria-label="Brands grid"
            >
              {filteredBrands.map((brand, index) => (
                <BrandCard
                  key={brand._id}
                  brand={brand}
                  className={`brand-card-item ${styles.brandCardItem}`}
                />
              ))}
            </div>
          ) : (
            <div className="no-results text-center py-12 md:py-20" role="status" aria-live="polite">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" aria-hidden="true" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  No brands found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  We could not find any brands matching {searchTerm}. 
                  Try adjusting your search terms.
                </p>
                <Button 
                  variant="bordered" 
                  onClick={() => setSearchTerm('')}
                  className="mx-auto"
                  aria-label="Clear search and show all brands"
                >
                  Clear Search
                </Button>
              </div>
            </div>
          )}
        </section>
        {!isLoading && !searchTerm && metadata && allBrands.length < metadata.results * metadata.numberOfPages && (
          <div className="load-more text-center mt-12">
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Loaded {allBrands.length} of ~{metadata.results} brands
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-md mx-auto">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((allBrands.length / (metadata.results || 1)) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>
            <Button
              variant="bordered"
              size="lg"
              onClick={handleLoadMore}
              disabled={isLoadingMore || !metadata?.nextPage}
              className="px-8 py-3"
            >
              {isLoadingMore ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load More Brands'
              )}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
