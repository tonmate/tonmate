/**
 * Instagram Webhook utilities for future integration
 */

/**
 * Verify Instagram webhook signature
 */
import crypto from 'crypto';

export function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha1', secret)
    .update(payload)
    .digest('hex');
  
  return signature === `sha1=${expectedSignature}`;
}

/**
 * Send message to Instagram user
 */
export async function sendInstagramMessage(recipientId, message, accessToken) {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: message }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Instagram API error: ${data.error?.message || 'Unknown error'}`);
    }

    return {
      success: true,
      messageId: data.message_id,
      recipientId: data.recipient_id
    };

  } catch (error) {
    console.error('Error sending Instagram message:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Process Instagram webhook event
 */
export function processWebhookEvent(event) {
  const { object, entry } = event;
  
  if (object !== 'instagram') {
    return null;
  }

  const messages = [];
  
  entry.forEach(item => {
    if (item.messaging) {
      item.messaging.forEach(messagingEvent => {
        if (messagingEvent.message && messagingEvent.message.text) {
          messages.push({
            senderId: messagingEvent.sender.id,
            message: messagingEvent.message.text,
            messageId: messagingEvent.message.mid,
            timestamp: messagingEvent.timestamp
          });
        }
      });
    }
  });

  return messages;
}

/**
 * Example webhook handler route
 */
export function createWebhookHandler(supportAgent) {
  return async (req, res) => {
    try {
      // Verify webhook (in production, verify signature)
      if (req.query['hub.mode'] === 'subscribe' && 
          req.query['hub.verify_token'] === process.env.WEBHOOK_VERIFY_TOKEN) {
        return res.status(200).send(req.query['hub.challenge']);
      }

      // Process incoming messages
      const messages = processWebhookEvent(req.body);
      
      if (messages && messages.length > 0) {
        for (const messageData of messages) {
          // Process message with support agent
          const response = await supportAgent.handleInstagramMessage(messageData);
          
          // Send response back to Instagram
          if (response.success && process.env.INSTAGRAM_ACCESS_TOKEN) {
            await sendInstagramMessage(
              response.recipientId,
              response.message,
              process.env.INSTAGRAM_ACCESS_TOKEN
            );
          }
        }
      }

      res.status(200).send('OK');

    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).send('Error processing webhook');
    }
  };
}