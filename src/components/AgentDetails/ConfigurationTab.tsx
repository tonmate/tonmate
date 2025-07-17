import React from 'react';

interface Agent {
  id: string;
  name: string;
  systemPrompt: string;
  greetingMessage: string;
  temperature: number;
}

interface ConfigurationTabProps {
  agent: Agent;
}

const ConfigurationTab: React.FC<ConfigurationTabProps> = ({ agent }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Prompt</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{agent.systemPrompt}</pre>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Greeting Message</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">{agent.greetingMessage}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Temperature</span>
            <p className="text-gray-900">{agent.temperature}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Provider</span>
            <p className="text-gray-900">OpenAI</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationTab;
