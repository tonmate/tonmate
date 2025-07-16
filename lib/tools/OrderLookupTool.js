import { Tool } from 'langchain/tools';
import { sampleOrders } from '../models/Order.js';

/**
 * Tool for looking up order information
 */
export class OrderLookupTool extends Tool {
  constructor() {
    super();
    this.name = 'order_lookup';
    this.description = `Look up order information by order ID or customer email.
    Input should be either an order ID (e.g., "ORD-001") or customer email (e.g., "john@example.com").
    This tool helps customers track their orders and get order status updates.`;
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

      let order = null;

      // Search by order ID first
      if (searchTerm.toUpperCase().startsWith('ORD-')) {
        order = sampleOrders.find(o => o.id.toUpperCase() === searchTerm.toUpperCase());
      } else if (searchTerm.includes('@')) {
        // Search by customer email
        order = sampleOrders.find(o => o.customerEmail.toLowerCase() === searchTerm.toLowerCase());
      } else {
        // Try to find by order ID without ORD- prefix
        order = sampleOrders.find(o => o.id.toUpperCase().includes(searchTerm.toUpperCase()));
      }

      if (!order) {
        return JSON.stringify({
          success: false,
          message: `No order found for "${searchTerm}". Please check your order ID or email address.`,
          help: 'Order IDs typically start with "ORD-" followed by numbers (e.g., ORD-001)'
        });
      }

      const orderInfo = {
        orderId: order.id,
        customerName: order.customerName,
        status: order.status,
        statusMessage: order.getStatusMessage(),
        totalAmount: order.getFormattedTotal(),
        orderDate: order.orderDate.toLocaleDateString(),
        items: order.items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          price: `$${item.price}`
        })),
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
}