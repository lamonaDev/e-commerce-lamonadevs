import { Product } from '../_Components/productCard/productCard';

const API_BASE_URL = 'https://ecommerce.routemisr.com/api/v1';

export type ProductsApiResponse = {
  results: number;
  metadata: {
    currentPage: number;
    numberOfPages: number;
    limit: number;
    nextPage?: number;
  };
  data: Product[];
};

export class ProductsApiService {
  /**
   * Fetch products with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @returns Promise with products data
   */
  static async getProducts(page: number = 1, limit: number = 20): Promise<ProductsApiResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
          next: { revalidate: 300 },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }

      const data: ProductsApiResponse = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search products by keyword
   * @param keyword - Search term
   * @param page - Page number
   * @param limit - Items per page
   */
  static async searchProducts(
    keyword: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ProductsApiResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to search products: ${response.status} ${response.statusText}`);
      }
      const data: ProductsApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
  /**
   * Get products by brand
   * @param brandId - Brand ID
   * @param page - Page number
   * @param limit - Items per page
   */
  static async getProductsByBrand(
    brandId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ProductsApiResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products?brand=${brandId}&page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch brand products: ${response.status} ${response.statusText}`);
      }

      const data: ProductsApiResponse = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get products by category
   * @param categoryId - Category ID
   * @param page - Page number
   * @param limit - Items per page
   */
  static async getProductsByCategory(
    categoryId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ProductsApiResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products?category=${categoryId}&page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch category products: ${response.status} ${response.statusText}`);
      }

      const data: ProductsApiResponse = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all products (handles pagination internally)
   * @param maxProducts - Maximum number of products to fetch (default: 200)
   */
  static async getAllProducts(maxProducts: number = 200): Promise<ProductsApiResponse> {
    try {
      const firstPage = await this.getProducts(1, 50);

      const allProducts = [...firstPage.data];
      const totalPages = Math.min(firstPage.metadata.numberOfPages, Math.ceil(maxProducts / 50));
      if (totalPages > 1) {
        const promises = [];
        for (let page = 2; page <= totalPages; page++) {
          promises.push(this.getProducts(page, 50));
        }
        const remainingPages = await Promise.all(promises);
        remainingPages.forEach(pageData => {
          allProducts.push(...pageData.data);
        });
      }
      return {
        results: allProducts.length,
        metadata: {
          ...firstPage.metadata,
          currentPage: 1,
          numberOfPages: Math.ceil(allProducts.length / 50),
        },
        data: allProducts.slice(0, maxProducts),
      };
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  }
}

export default ProductsApiService;
