import { DynamicTool } from 'langchain/tools';

/**
 * Human Escalation Tool
 * Handles escalating conversations to human agents when needed
 */
export class EscalationTool extends DynamicTool {
  constructor(config = {}) {
    const name = 'escalate_to_human';
    const description = `
      Escalate the conversation to a human agent when:
      1. The customer is frustrated or unsatisfied
      2. The issue is complex and requires human judgment
      3. You cannot find relevant information in the knowledge base
      4. The customer specifically requests to speak with a human
      5. The conversation involves sensitive topics (complaints, refunds, account issues)
      
      Input should be a brief reason for escalation.
      Examples: "customer frustrated with service", "complex technical issue", "refund request"
    `;

    super({
      name,
      description,
      func: async (reason) => {
        try {
          const escalationReason = reason || 'Customer requested human assistance';
          
          // Log the escalation (in production, this would create a ticket or notification)
          console.log(`Escalation triggered: ${escalationReason}`);
          
          // Return a professional escalation message
          const escalationMessage = `I understand this requires specialized attention. I'm connecting you with one of our human agents who can better assist you with this matter.

**Escalation Details:**
- Reason: ${escalationReason}
- Time: ${new Date().toISOString()}
- Session ID: ${config.sessionId || 'N/A'}

A human agent will be with you shortly. In the meantime, is there anything else I can help clarify about your current issue?`;

          return escalationMessage;

        } catch (error) {
          console.error('Error in EscalationTool:', error);
          return 'I apologize, but I encountered an issue while trying to connect you with a human agent. Please contact our support team directly for immediate assistance.';
        }
      }
    });
  }
}
