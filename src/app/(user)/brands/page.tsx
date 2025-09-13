"use client";
import { ProtectedRoute } from "@/_routes/route.route";
import { Suspense } from "react";
import BrandsPage from "../../_Components/brandsPage/BrandsPage";
function BrandsLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 mt-10">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded-lg w-96 mx-auto"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-lg w-3/4 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BrandsRoute() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<BrandsLoadingFallback />}>
        <BrandsPage />
      </Suspense>
    </ProtectedRoute>
  );
}
