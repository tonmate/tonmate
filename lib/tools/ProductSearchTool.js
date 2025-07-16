import { Tool } from 'langchain/tools';
import { sampleProducts } from '../models/Product.js';

/**
 * Tool for searching products in the Instagram shop
 */
export class ProductSearchTool extends Tool {
  constructor(userProducts = []) {
    super();
    this.name = 'product_search';
    this.description = `Search for products in the shop. Input should be a search query string.
    You can search by product name, category, color, size, or tags.
    Examples: "white t-shirt", "denim", "size M", "summer dress", "accessories"`;
    this.userProducts = userProducts;
  }

  async _call(query) {
    try {
      const searchTerm = query.toLowerCase().trim();
      
      if (!searchTerm) {
        return JSON.stringify({
          success: false,
          message: 'Please provide a search term'
        });
      }

      // Use user products if available, otherwise fall back to sample products
      const productsToSearch = this.userProducts.length > 0 ? this.userProducts : sampleProducts;
      
      const results = productsToSearch.filter(product => {
        const searchableText = [
          product.name,
          product.description,
          product.category,
          product.color,
          product.size,
          ...(product.colors || []),
          ...(product.sizes || []),
          ...(product.tags || [])
        ].filter(Boolean).join(' ').toLowerCase();

        return searchableText.includes(searchTerm);
      });

      if (results.length === 0) {
        return JSON.stringify({
          success: false,
          message: `No products found matching "${query}". Try searching for clothing, footwear, or accessories.`,
          suggestions: ['t-shirt', 'jeans', 'dress', 'sneakers', 'handbag']
        });
      }

      const formattedResults = results.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.getFormattedPrice(),
        category: product.category,
        sizes: product.sizes,
        colors: product.colors,
        inStock: product.inStock,
        availability: product.isAvailable() ? 'Available' : 'Out of Stock'
      }));

      return JSON.stringify({
        success: true,
        count: results.length,
        products: formattedResults
      });

    } catch (error) {
      return JSON.stringify({
        success: false,
        message: 'Error searching products',
        error: error.message
      });
    }
  }
}