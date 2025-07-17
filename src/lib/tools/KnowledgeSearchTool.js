import { DynamicTool } from 'langchain/tools';

/**
 * Universal Knowledge Search Tool
 * Searches through the agent's knowledge base using semantic similarity
 */
export class KnowledgeSearchTool extends DynamicTool {
  constructor(knowledgeBase = []) {
    const name = 'knowledge_search';
    const description = `
      Search through the knowledge base to find relevant information.
      Use this tool when you need to find specific information about the business, policies, services, or any other topics the agent should know about.
      Input should be a search query describing what information you're looking for.
      Examples: "refund policy", "shipping information", "business hours", "product details"
    `;

    super({
      name,
      description,
      func: async (query) => {
        try {
          if (!query || query.trim().length === 0) {
            return 'Please provide a search query to look for information in the knowledge base.';
          }

          // If no knowledge base provided, return helpful message
          if (!knowledgeBase || knowledgeBase.length === 0) {
            return 'No knowledge base has been configured for this agent yet. Please add some knowledge sources like website content, documents, or FAQs to help me provide better assistance.';
          }

          // Simple text search for now (can be enhanced with vector search later)
          const searchTerm = query.toLowerCase();
          const relevantDocs = knowledgeBase.filter(doc => {
            const content = (doc.content || '').toLowerCase();
            const title = (doc.title || '').toLowerCase();
            return content.includes(searchTerm) || title.includes(searchTerm);
          });

          if (relevantDocs.length === 0) {
            return `I couldn't find specific information about "${query}" in the knowledge base. You may want to ask the user to be more specific or offer to connect them with a human agent for detailed assistance.`;
          }

          // Return the most relevant information
          const topResults = relevantDocs.slice(0, 3);
          const formattedResults = topResults.map(doc => {
            const snippet = doc.content.length > 200 
              ? doc.content.substring(0, 200) + '...' 
              : doc.content;
            return `${doc.title ? `**${doc.title}**\n` : ''}${snippet}`;
          }).join('\n\n');

          return `Here's what I found about "${query}":\n\n${formattedResults}`;

        } catch (error) {
          console.error('Error in KnowledgeSearchTool:', error);
          return 'I encountered an error while searching the knowledge base. Please try rephrasing your question or contact support.';
        }
      }
    });
  }
}
