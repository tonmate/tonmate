import React from 'react';

interface Agent {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  greetingMessage: string;
  temperature: number;
  createdAt: string;
  knowledgeSources: KnowledgeSource[];
  _count?: {
    conversations: number;
  };
}

interface KnowledgeSource {
  id: string;
  name: string;
  url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  documents: any[];
}

interface OverviewTabProps {
  agent: Agent;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ agent }) => {
  const totalDocuments = agent.knowledgeSources.reduce((acc, ks) => acc + ks.documents.length, 0);

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📚</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Knowledge Sources</div>
              <div className="text-2xl font-bold text-gray-900">{agent.knowledgeSources.length}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">💬</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Conversations</div>
              <div className="text-2xl font-bold text-gray-900">{agent._count?.conversations || 0}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📄</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Documents</div>
              <div className="text-2xl font-bold text-gray-900">{totalDocuments}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Agent Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Created</span>
            <p className="text-gray-900">{new Date(agent.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">LLM Provider</span>
            <p className="text-gray-900">OpenAI</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Temperature</span>
            <p className="text-gray-900">{agent.temperature}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Max Tokens</span>
            <p className="text-gray-900">4096</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
