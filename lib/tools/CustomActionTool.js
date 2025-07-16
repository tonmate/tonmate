import { DynamicTool } from 'langchain/tools';

/**
 * Custom Action Tool
 * Allows users to define custom actions for their agents
 */
export class CustomActionTool extends DynamicTool {
  constructor(actions = []) {
    const name = 'custom_action';
    const description = `
      Execute custom actions that have been configured for this agent.
      Available actions: ${actions.length > 0 ? actions.map(a => a.name).join(', ') : 'None configured'}
      
      Use this tool when you need to perform specific business actions like:
      - Creating tickets or support requests
      - Sending notifications
      - Triggering workflows
      - Recording customer feedback
      
      Input should be the action name and any required parameters in JSON format.
      Example: {"action": "create_ticket", "priority": "high", "category": "technical"}
    `;

    super({
      name,
      description,
      func: async (input) => {
        try {
          if (!input || input.trim().length === 0) {
            return `Available custom actions: ${actions.length > 0 ? actions.map(a => `${a.name} - ${a.description}`).join(', ') : 'No custom actions configured for this agent.'}`;
          }

          // Parse the input
          let actionRequest;
          try {
            actionRequest = JSON.parse(input);
          } catch (parseError) {
            // If not JSON, treat as simple action name
            actionRequest = { action: input.trim() };
          }

          const actionName = actionRequest.action;
          if (!actionName) {
            return 'Please specify which action you want to execute.';
          }

          // Find the requested action
          const action = actions.find(a => a.name === actionName);
          if (!action) {
            return `Action "${actionName}" not found. Available actions: ${actions.map(a => a.name).join(', ')}`;
          }

          // Execute the action (this would integrate with external systems in production)
          console.log(`Executing custom action: ${actionName}`, actionRequest);
          
          // Mock execution for now
          const result = {
            action: actionName,
            status: 'completed',
            timestamp: new Date().toISOString(),
            parameters: actionRequest
          };

          return `Successfully executed "${actionName}". ${action.successMessage || 'Action completed successfully.'}`;

        } catch (error) {
          console.error('Error in CustomActionTool:', error);
          return 'I encountered an error while trying to execute that action. Please try again or contact support.';
        }
      }
    });
  }
}
