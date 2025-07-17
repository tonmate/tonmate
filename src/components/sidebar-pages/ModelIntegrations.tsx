'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Check, X, Key, Brain, Zap, Globe, ChevronRight, Plus, Save, AlertCircle } from 'lucide-react';

interface ModelProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error';
  models: string[];
  apiKeyConfigured: boolean;
  defaultModel?: string;
  pricing?: {
    input: string;
    output: string;
  };
}

interface ModelConfig {
  providerId: string;
  apiKey: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

const MODEL_PROVIDERS: ModelProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5, and other OpenAI models',
    icon: '🤖',
    status: 'connected',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
    apiKeyConfigured: true,
    defaultModel: 'gpt-4',
    pricing: {
      input: '$0.03/1K tokens',
      output: '$0.06/1K tokens'
    }
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3 Opus, Sonnet, and Haiku models',
    icon: '🧠',
    status: 'disconnected',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-2'],
    apiKeyConfigured: false,
    pricing: {
      input: '$0.015/1K tokens',
      output: '$0.075/1K tokens'
    }
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Gemini Pro and other Google AI models',
    icon: '🔍',
    status: 'disconnected',
    models: ['gemini-pro', 'gemini-pro-vision', 'palm-2'],
    apiKeyConfigured: false,
    pricing: {
      input: '$0.00025/1K tokens',
      output: '$0.0005/1K tokens'
    }
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral 7B, Mixtral 8x7B, and other models',
    icon: '⚡',
    status: 'disconnected',
    models: ['mistral-7b', 'mixtral-8x7b', 'mistral-small', 'mistral-medium'],
    apiKeyConfigured: false,
    pricing: {
      input: '$0.0002/1K tokens',
      output: '$0.0006/1K tokens'
    }
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Command and Command Light models',
    icon: '💫',
    status: 'disconnected',
    models: ['command', 'command-light', 'command-nightly'],
    apiKeyConfigured: false,
    pricing: {
      input: '$0.0015/1K tokens',
      output: '$0.002/1K tokens'
    }
  }
];

export default function ModelIntegrations() {
  const [providers, setProviders] = useState<ModelProvider[]>(MODEL_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<ModelProvider | null>(null);
  const [configuring, setConfiguring] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    providerId: '',
    apiKey: '',
    defaultModel: '',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleConfigureProvider = (provider: ModelProvider) => {
    setSelectedProvider(provider);
    setConfiguring(true);
    setModelConfig({
      providerId: provider.id,
      apiKey: '',
      defaultModel: provider.models[0],
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0
    });
  };

  const handleSaveConfiguration = async () => {
    if (!selectedProvider || !modelConfig.apiKey) {
      setError('Please provide an API key');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/models/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      // Update provider status
      setProviders(prev => prev.map(p => 
        p.id === selectedProvider.id 
          ? { ...p, status: 'connected' as const, apiKeyConfigured: true, defaultModel: modelConfig.defaultModel }
          : p
      ));

      setSuccess('Configuration saved successfully!');
      setConfiguring(false);
      setSelectedProvider(null);
    } catch (err) {
      setError('Failed to save configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectProvider = async (providerId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/models/disconnect/${providerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect provider');
      }

      // Update provider status
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { ...p, status: 'disconnected' as const, apiKeyConfigured: false }
          : p
      ));

      setSuccess('Provider disconnected successfully!');
    } catch (err) {
      setError('Failed to disconnect provider. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Check className="w-4 h-4" />;
      case 'error': return <X className="w-4 h-4" />;
      default: return <X className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Model Integrations</h2>
          <p className="text-gray-600 mt-1">Configure and manage your AI model providers</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {providers.filter(p => p.status === 'connected').length} of {providers.length} connected
          </span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Provider List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <div key={provider.id} className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{provider.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                    <p className="text-sm text-gray-600">{provider.description}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(provider.status)}`}>
                  {getStatusIcon(provider.status)}
                  <span className="capitalize">{provider.status}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Available Models:</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.models.slice(0, 3).map((model) => (
                      <span key={model} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {model}
                      </span>
                    ))}
                    {provider.models.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{provider.models.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {provider.pricing && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pricing:</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Input: {provider.pricing.input}</div>
                      <div>Output: {provider.pricing.output}</div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  {provider.status === 'connected' ? (
                    <>
                      <button
                        onClick={() => handleConfigureProvider(provider)}
                        className="flex-1 bg-blue-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Configure</span>
                      </button>
                      <button
                        onClick={() => handleDisconnectProvider(provider.id)}
                        className="bg-red-100 text-red-700 text-sm px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                        disabled={loading}
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConfigureProvider(provider)}
                      className="flex-1 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Connect</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {configuring && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Configure {selectedProvider.name}</h3>
                <button
                  onClick={() => setConfiguring(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={modelConfig.apiKey}
                    onChange={(e) => setModelConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your API key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Model
                  </label>
                  <select
                    value={modelConfig.defaultModel}
                    onChange={(e) => setModelConfig(prev => ({ ...prev, defaultModel: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {selectedProvider.models.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature: {modelConfig.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={modelConfig.temperature}
                    onChange={(e) => setModelConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Conservative</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={modelConfig.maxTokens}
                    onChange={(e) => setModelConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="8000"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setConfiguring(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveConfiguration}
                    disabled={loading || !modelConfig.apiKey}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Configuration</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
