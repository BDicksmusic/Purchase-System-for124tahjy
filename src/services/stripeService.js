const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');

class StripeService {
  constructor() {
    this.stripe = stripe;
  }

  // Create a payment intent for a composition purchase
  async createPaymentIntent(compositionData, customerEmail) {
    try {
      const { title, price, compositionId } = compositionData;
      
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(price * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          compositionId,
          compositionTitle: title,
          customerEmail,
          orderId: uuidv4()
        },
        receipt_email: customerEmail,
        description: `Purchase: ${title}`,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId: paymentIntent.metadata.orderId
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error(`Payment intent creation failed: ${error.message}`);
    }
  }

  // Create or update a Stripe product for a composition
  async createOrUpdateProduct(compositionData) {
    try {
      const { id, title, description, price, imageUrl } = compositionData;
      
      // Check if product already exists
      const existingProducts = await this.stripe.products.list({
        limit: 1,
        metadata: { compositionId: id }
      });

      if (existingProducts.data.length > 0) {
        // Update existing product
        const product = await this.stripe.products.update(existingProducts.data[0].id, {
          name: title,
          description: description || `Sheet music for ${title}`,
          images: imageUrl ? [imageUrl] : [],
          metadata: {
            compositionId: id,
            lastUpdated: new Date().toISOString()
          }
        });

        // Update price if it changed
        const currentPrice = existingProducts.data[0].default_price;
        if (currentPrice) {
          const priceData = await this.stripe.prices.retrieve(currentPrice);
          if (priceData.unit_amount !== Math.round(price * 100)) {
            // Create new price
            const newPrice = await this.stripe.prices.create({
              product: product.id,
              unit_amount: Math.round(price * 100),
              currency: 'usd',
            });

            // Update product default price
            await this.stripe.products.update(product.id, {
              default_price: newPrice.id
            });
          }
        }

        return product;
      } else {
        // Create new product
        const product = await this.stripe.products.create({
          name: title,
          description: description || `Sheet music for ${title}`,
          images: imageUrl ? [imageUrl] : [],
          metadata: {
            compositionId: id,
            lastUpdated: new Date().toISOString()
          }
        });

        // Create price for the product
        const price = await this.stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(price * 100),
          currency: 'usd',
        });

        // Set as default price
        await this.stripe.products.update(product.id, {
          default_price: price.id
        });

        return product;
      }
    } catch (error) {
      console.error('Error creating/updating Stripe product:', error);
      throw new Error(`Product creation failed: ${error.message}`);
    }
  }

  // Retrieve payment intent details
  async getPaymentIntent(paymentIntentId) {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw new Error(`Payment intent retrieval failed: ${error.message}`);
    }
  }

  // Create a payment link for a composition
  async createPaymentLink(compositionData) {
    try {
      const { title, price, compositionId } = compositionData;
      
      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: title,
              description: `Sheet music for ${title}`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        }],
        metadata: {
          compositionId,
          compositionTitle: title
        },
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${process.env.FRONTEND_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
          },
        },
      });

      return paymentLink;
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw new Error(`Payment link creation failed: ${error.message}`);
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature) {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  // Get all products (for admin dashboard)
  async getAllProducts() {
    try {
      const products = await this.stripe.products.list({
        limit: 100,
        expand: ['data.default_price']
      });
      return products.data;
    } catch (error) {
      console.error('Error retrieving products:', error);
      throw new Error(`Product retrieval failed: ${error.message}`);
    }
  }

  // Delete a product
  async deleteProduct(productId) {
    try {
      return await this.stripe.products.del(productId);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error(`Product deletion failed: ${error.message}`);
    }
  }
}

module.exports = new StripeService(); 