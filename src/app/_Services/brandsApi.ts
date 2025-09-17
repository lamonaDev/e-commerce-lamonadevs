import { BrandsApiResponse } from '../_Components/brandCard/BrandCard';
const API_BASE_URL = 'https://ecommerce.routemisr.com/api/v1';
export class BrandsApiService {
  /**
   * Fetch brands with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @returns Promise with brands data
   */
  static async getBrands(page: number = 1, limit: number = 20): Promise<BrandsApiResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/brands?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
          next: { revalidate: 300 }
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch brands: ${response.status} ${response.statusText}`);
      }
      const data: BrandsApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  }
  /**
   * Fetch all brands (handles pagination internally)
   * @param maxBrands - Maximum number of brands to fetch (default: 500)
   * @returns Promise with all brands data
   */
  static async getAllBrands(maxBrands: number = 500): Promise<BrandsApiResponse> {
    try {
      const firstPage = await this.getBrands(1, 50);
      const allBrands = [...firstPage.data];
      const totalPages = Math.min(firstPage.metadata.numberOfPages, Math.ceil(maxBrands / 50));
      if (totalPages > 1) {
        const promises = [];
        for (let page = 2; page <= totalPages; page++) {
          promises.push(this.getBrands(page, 50));
        }
        const remainingPages = await Promise.all(promises);
        remainingPages.forEach(pageData => {
          allBrands.push(...pageData.data);
        });
      }
      return {
        results: allBrands.length,
        metadata: {
          ...firstPage.metadata,
          currentPage: 1,
          numberOfPages: Math.ceil(allBrands.length / 50),
        },
        data: allBrands.slice(0, maxBrands), 
      };
    } catch (error) {
      console.error('Error fetching all brands:', error);
      throw error;
    }
  }

  /**
   * Search brands by name
   * @param searchTerm - Search term
   * @param page - Page number
   * @param limit - Items per page
   */
  static async searchBrands(
    searchTerm: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<BrandsApiResponse> {
    try {
      const response = await this.getBrands(page, limit);
      const filteredBrands = response.data.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        ...response,
        results: filteredBrands.length,
        data: filteredBrands,
      };
    } catch (error) {
      console.error('Error searching brands:', error);
      throw error;
    }
  }
}

export default BrandsApiService;
