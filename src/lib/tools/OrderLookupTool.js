import { Tool } from 'langchain/tools';
import { sampleOrders } from '../models/Order.js';

/**
 * Tool for looking up order information
 */
export class OrderLookupTool extends Tool {
  constructor(userOrders = []) {
    super();
    this.name = 'order_lookup';
    this.description = `Look up order information by order ID or customer email.
    Input should be either an order ID (e.g., "ORD-001") or customer email (e.g., "john@example.com").
    This tool helps customers track their orders and get order status updates.`;
    this.userOrders = userOrders;
  }

  async _call(input) {
    try {
      const searchTerm = input.trim();
      
      if (!searchTerm) {
        return JSON.stringify({
          success: false,
          message: 'Please provide an order ID or customer email'
        });
      }

      // Use user orders if available, otherwise fall back to sample orders
      const ordersToSearch = this.userOrders.length > 0 ? this.userOrders : sampleOrders;
      
      let order = null;

      // Search by order ID first
      if (searchTerm.toUpperCase().startsWith('ORD-')) {
        order = ordersToSearch.find(o => (o.orderId || o.id).toUpperCase() === searchTerm.toUpperCase());
      } else if (searchTerm.includes('@')) {
        // Search by customer email
        order = ordersToSearch.find(o => o.customerEmail && o.customerEmail.toLowerCase() === searchTerm.toLowerCase());
      } else {
        // Try to find by order ID without ORD- prefix
        order = ordersToSearch.find(o => (o.orderId || o.id).toUpperCase().includes(searchTerm.toUpperCase()));
      }

      if (!order) {
        return JSON.stringify({
          success: false,
          message: `No order found for "${searchTerm}". Please check your order ID or email address.`,
          help: 'Order IDs typically start with "ORD-" followed by numbers (e.g., ORD-001)'
        });
      }

      const orderInfo = {
        orderId: order.orderId || order.id,
        customerName: order.customerName,
        status: order.status,
        statusMessage: order.getStatusMessage ? order.getStatusMessage() : this.getStatusMessage(order.status),
        totalAmount: order.getFormattedTotal ? order.getFormattedTotal() : `$${order.total?.toFixed(2) || '0.00'}`,
        orderDate: order.orderDate ? order.orderDate.toLocaleDateString() : new Date(order.createdAt || Date.now()).toLocaleDateString(),
        items: this.parseOrderItems(order.items),
        shippingAddress: order.shippingAddress,
        trackingNumber: order.trackingNumber
      };

      return JSON.stringify({
        success: true,
        order: orderInfo
      });

    } catch (error) {
      return JSON.stringify({
        success: false,
        message: 'Error looking up order',
        error: error.message
      });
    }
  }

  getStatusMessage(status) {
    const statusMessages = {
      'pending': 'Order received and being processed',
      'confirmed': 'Order confirmed and being prepared',
      'processing': 'Order is being prepared for shipment',
      'shipped': 'Order has been shipped',
      'delivered': 'Order has been delivered',
      'cancelled': 'Order has been cancelled'
    };
    return statusMessages[status] || 'Status unknown';
  }

  parseOrderItems(items) {
    if (!items) return [];
    
    // If items is a string (JSON), parse it
    if (typeof items === 'string') {
      try {
        const parsedItems = JSON.parse(items);
        return parsedItems.map(item => ({
          productName: item.name || item.productName,
          quantity: item.quantity,
          price: `$${item.price?.toFixed(2) || '0.00'}`
        }));
      } catch (error) {
        return [];
      }
    }
    
    // If items is already an array
    if (Array.isArray(items)) {
      return items.map(item => ({
        productName: item.name || item.productName,
        quantity: item.quantity,
        price: `$${item.price?.toFixed(2) || '0.00'}`
      }));
    }
    
    return [];
  }
}