/**
 * Product model for the Instagram shop
 */
export class Product {
  constructor({
    id,
    name,
    description,
    price,
    currency = 'USD',
    category,
    sizes = [],
    colors = [],
    inStock = true,
    images = [],
    tags = []
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.currency = currency;
    this.category = category;
    this.sizes = sizes;
    this.colors = colors;
    this.inStock = inStock;
    this.images = images;
    this.tags = tags;
  }

  toString() {
    return `${this.name} - $${this.price} ${this.currency} (${this.inStock ? 'In Stock' : 'Out of Stock'})`;
  }

  getFormattedPrice() {
    return `$${this.price} ${this.currency}`;
  }

  isAvailable() {
    return this.inStock;
  }
}

// Sample product data for demonstration
export const sampleProducts = [
  new Product({
    id: '1',
    name: 'Classic White T-Shirt',
    description: 'Comfortable cotton t-shirt perfect for everyday wear',
    price: 25.99,
    category: 'Clothing',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Gray'],
    inStock: true,
    tags: ['casual', 'cotton', 'basic']
  }),
  new Product({
    id: '2',
    name: 'Denim Jeans',
    description: 'High-quality denim jeans with a modern fit',
    price: 79.99,
    category: 'Clothing',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Blue', 'Black'],
    inStock: true,
    tags: ['denim', 'casual', 'pants']
  }),
  new Product({
    id: '3',
    name: 'Summer Dress',
    description: 'Light and breezy summer dress perfect for warm weather',
    price: 45.99,
    category: 'Clothing',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Floral', 'Solid Blue', 'Yellow'],
    inStock: false,
    tags: ['dress', 'summer', 'feminine']
  }),
  new Product({
    id: '4',
    name: 'Sneakers',
    description: 'Comfortable athletic sneakers for daily activities',
    price: 89.99,
    category: 'Footwear',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['White', 'Black', 'Red'],
    inStock: true,
    tags: ['shoes', 'athletic', 'comfortable']
  }),
  new Product({
    id: '5',
    name: 'Leather Handbag',
    description: 'Elegant leather handbag perfect for any occasion',
    price: 129.99,
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Brown', 'Black', 'Tan'],
    inStock: true,
    tags: ['bag', 'leather', 'accessory']
  })
];