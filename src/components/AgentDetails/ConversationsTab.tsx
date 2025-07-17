import React from 'react';
import Link from 'next/link';

interface Conversation {
  id: string;
  createdAt: string;
}

interface Agent {
  id: string;
  conversations?: Conversation[];
}

interface ConversationsTabProps {
  agent: Agent;
}

const ConversationsTab: React.FC<ConversationsTabProps> = ({ agent }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversations</h3>
          {agent.conversations && agent.conversations.length > 0 ? (
            <div className="space-y-4">
              {agent.conversations.map((conversation, index) => (
                <div key={conversation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Conversation {index + 1}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Created: {new Date(conversation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/chat/${agent.id}?conversation=${conversation.id}`}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No conversations yet.</p>
              <Link
                href={`/chat/${agent.id}`}
                className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Start New Conversation
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationsTab;
