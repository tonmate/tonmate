import { Tool } from 'langchain/tools';

/**
 * Tool for providing shop information and policies
 */
export class ShopInfoTool extends Tool {
  constructor() {
    super();
    this.name = 'shop_info';
    this.description = `Get information about the shop including policies, contact information, shipping details, and general store information.
    Input should specify what information is needed: "policies", "contact", "shipping", "returns", or "general".`;
  }

  async _call(infoType) {
    try {
      const type = infoType.toLowerCase().trim();
      
      const shopInfo = {
        name: process.env.SHOP_NAME || 'Demo Fashion Store',
        description: process.env.SHOP_DESCRIPTION || 'Trendy fashion items for all ages',
        email: process.env.SHOP_CONTACT_EMAIL || 'support@demofashion.com',
        phone: process.env.SHOP_CONTACT_PHONE || '+1234567890',
        policies: process.env.SHOP_POLICIES || '30-day return policy, free shipping over $50'
      };

      switch (type) {
        case 'policies':
        case 'policy':
          return JSON.stringify({
            success: true,
            info: {
              returnPolicy: '30-day return policy for unworn items with tags',
              shippingPolicy: 'Free shipping on orders over $50, otherwise $5.99',
              exchangePolicy: 'Exchanges accepted within 30 days',
              refundPolicy: 'Refunds processed within 5-7 business days'
            }
          });

        case 'contact':
          return JSON.stringify({
            success: true,
            info: {
              email: shopInfo.email,
              phone: shopInfo.phone,
              businessHours: 'Monday-Friday 9AM-6PM EST',
              socialMedia: 'Follow us on Instagram for latest updates'
            }
          });

        case 'shipping':
          return JSON.stringify({
            success: true,
            info: {
              standardShipping: '5-7 business days ($5.99)',
              expressShipping: '2-3 business days ($12.99)',
              freeShipping: 'Free standard shipping on orders over $50',
              internationalShipping: 'Available to select countries (7-14 business days)'
            }
          });

        case 'returns':
        case 'return':
          return JSON.stringify({
            success: true,
            info: {
              timeLimit: '30 days from purchase date',
              condition: 'Items must be unworn with original tags',
              process: 'Contact support to initiate return process',
              refundTime: '5-7 business days after we receive the item',
              returnShipping: 'Customer responsible for return shipping costs'
            }
          });

        case 'general':
        default:
          return JSON.stringify({
            success: true,
            info: {
              name: shopInfo.name,
              description: shopInfo.description,
              specialties: ['Fashion', 'Accessories', 'Footwear'],
              paymentMethods: ['Credit Cards', 'PayPal', 'Apple Pay', 'Google Pay'],
              customerService: 'Available Monday-Friday 9AM-6PM EST',
              socialMedia: 'Active on Instagram with daily updates'
            }
          });
      }

    } catch (error) {
      return JSON.stringify({
        success: false,
        message: 'Error retrieving shop information',
        error: error.message
      });
    }
  }
}