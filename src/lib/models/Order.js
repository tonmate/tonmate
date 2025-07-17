/**
 * Order model for tracking customer orders
 */
export class Order {
  constructor({
    id,
    customerId,
    customerName,
    customerEmail,
    items = [],
    status = 'pending',
    totalAmount,
    currency = 'USD',
    shippingAddress,
    orderDate = new Date(),
    trackingNumber = null
  }) {
    this.id = id;
    this.customerId = customerId;
    this.customerName = customerName;
    this.customerEmail = customerEmail;
    this.items = items;
    this.status = status;
    this.totalAmount = totalAmount;
    this.currency = currency;
    this.shippingAddress = shippingAddress;
    this.orderDate = orderDate;
    this.trackingNumber = trackingNumber;
  }

  getStatusMessage() {
    const statusMessages = {
      'pending': 'Your order is being processed',
      'confirmed': 'Your order has been confirmed',
      'shipped': 'Your order has been shipped',
      'delivered': 'Your order has been delivered',
      'cancelled': 'Your order has been cancelled'
    };
    return statusMessages[this.status] || 'Unknown status';
  }

  getFormattedTotal() {
    return `$${this.totalAmount} ${this.currency}`;
  }

  addTrackingNumber(trackingNumber) {
    this.trackingNumber = trackingNumber;
    if (this.status === 'confirmed') {
      this.status = 'shipped';
    }
  }
}

// Sample order data for demonstration
export const sampleOrders = [
  new Order({
    id: 'ORD-001',
    customerId: 'CUST-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    items: [
      { productId: '1', productName: 'Classic White T-Shirt', quantity: 2, price: 25.99 },
      { productId: '4', productName: 'Sneakers', quantity: 1, price: 89.99 }
    ],
    status: 'shipped',
    totalAmount: 141.97,
    shippingAddress: '123 Main St, City, State 12345',
    orderDate: new Date('2024-01-15'),
    trackingNumber: 'TRK123456789'
  }),
  new Order({
    id: 'ORD-002',
    customerId: 'CUST-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    items: [
      { productId: '2', productName: 'Denim Jeans', quantity: 1, price: 79.99 },
      { productId: '5', productName: 'Leather Handbag', quantity: 1, price: 129.99 }
    ],
    status: 'confirmed',
    totalAmount: 209.98,
    shippingAddress: '456 Oak Ave, City, State 67890',
    orderDate: new Date('2024-01-16')
  })
];