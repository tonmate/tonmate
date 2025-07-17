'use client';

import React, { useState } from 'react';
import { X, Bot, Settings, Brain, MessageCircle, Globe, Zap, Info } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Alert } from './Alert';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (agentData: AgentFormData) => void;
  loading?: boolean;
}

interface AgentFormData {
  name: string;
  description: string;
  prompt: string;
  greeting: string;
  temperature: number;
  llmProvider: string;
  model: string;
  maxTokens: number;
  enableKnowledgeBase: boolean;
  persona: {
    tone: string;
    style: string;
    expertise: string;
  };
  capabilities: {
    canSearchWeb: boolean;
    canProcessImages: boolean;
    canAccessDocuments: boolean;
  };
}

const DEFAULT_AGENT_DATA: AgentFormData = {
  name: '',
  description: '',
  prompt: 'You are a helpful customer support agent. Be professional, empathetic, and solution-focused.',
  greeting: 'Hello! How can I help you today?',
  temperature: 0.7,
  llmProvider: 'openai',
  model: 'gpt-4',
  maxTokens: 2000,
  enableKnowledgeBase: true,
  persona: {
    tone: 'professional',
    style: 'helpful',
    expertise: 'general',
  },
  capabilities: {
    canSearchWeb: false,
    canProcessImages: false,
    canAccessDocuments: true,
  },
};

const LLM_PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'cohere', label: 'Cohere' },
  { value: 'huggingface', label: 'Hugging Face' },
];

const MODELS = {
  openai: [
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  anthropic: [
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
  ],
};

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
];

const STYLE_OPTIONS = [
  { value: 'helpful', label: 'Helpful' },
  { value: 'concise', label: 'Concise' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'empathetic', label: 'Empathetic' },
];

const EXPERTISE_OPTIONS = [
  { value: 'general', label: 'General Support' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'sales', label: 'Sales Support' },
  { value: 'billing', label: 'Billing Support' },
];

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<AgentFormData>(DEFAULT_AGENT_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');

  const handleInputChange = (field: keyof AgentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleNestedChange = (parent: keyof AgentFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value,
      },
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Agent name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.prompt.trim()) {
      newErrors.prompt = 'System prompt is required';
    }
    
    if (!formData.greeting.trim()) {
      newErrors.greeting = 'Greeting message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData(DEFAULT_AGENT_DATA);
      setErrors({});
    }
  };

  const handleClose = () => {
    setFormData(DEFAULT_AGENT_DATA);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Create New Agent</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="basic">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic" className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <span>Basic</span>
                </TabsTrigger>
                <TabsTrigger value="model" className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span>Model</span>
                </TabsTrigger>
                <TabsTrigger value="persona" className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Persona</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Advanced</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="h-5 w-5" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      label="Agent Name *"
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Customer Support Bot"
                      error={errors.name}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Brief description of what this agent does..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Greeting Message *
                      </label>
                      <Input
                        value={formData.greeting}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('greeting', e.target.value)}
                        placeholder="Hello! How can I help you today?"
                        error={errors.greeting}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="model" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5" />
                      <span>AI Model Configuration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="LLM Provider"
                        value={formData.llmProvider}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('llmProvider', e.target.value)}
                        options={LLM_PROVIDERS}
                      />
                      
                      <Select
                        label="Model"
                        value={formData.model}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('model', e.target.value)}
                        options={MODELS[formData.llmProvider as keyof typeof MODELS] || MODELS.openai}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Temperature: {formData.temperature}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={formData.temperature}
                          onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Conservative</span>
                          <span>Creative</span>
                        </div>
                      </div>

                      <Input
                        label="Max Tokens"
                        type="number"
                        value={formData.maxTokens}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('maxTokens', parseInt(e.target.value))}
                        placeholder="2000"
                        min="100"
                        max="4000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        System Prompt *
                      </label>
                      <textarea
                        value={formData.prompt}
                        onChange={(e) => handleInputChange('prompt', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={5}
                        placeholder="Define how the agent should behave and respond to users..."
                      />
                      {errors.prompt && (
                        <p className="mt-1 text-sm text-red-600">{errors.prompt}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="persona" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageCircle className="h-5 w-5" />
                      <span>Agent Persona</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select
                        label="Tone"
                        value={formData.persona.tone}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleNestedChange('persona', 'tone', e.target.value)}
                        options={TONE_OPTIONS}
                      />
                      
                      <Select
                        label="Style"
                        value={formData.persona.style}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleNestedChange('persona', 'style', e.target.value)}
                        options={STYLE_OPTIONS}
                      />
                      
                      <Select
                        label="Expertise"
                        value={formData.persona.expertise}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleNestedChange('persona', 'expertise', e.target.value)}
                        options={EXPERTISE_OPTIONS}
                      />
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <div>
                        <strong>Persona Impact:</strong> These settings influence how your agent communicates and handles different types of queries.
                      </div>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Advanced Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Knowledge Base Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="enableKnowledgeBase"
                            checked={formData.enableKnowledgeBase}
                            onChange={(e) => handleInputChange('enableKnowledgeBase', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="enableKnowledgeBase" className="text-sm text-gray-700">
                            Enable Knowledge Base Integration
                          </label>
                        </div>
                        
                        {formData.enableKnowledgeBase && (
                          <div className="pl-6 space-y-3 border-l-2 border-gray-200">
                            <p className="text-sm text-gray-600">
                              <Info className="inline w-4 h-4 mr-1" />
                              Crawler settings are managed globally in the{' '}
                              <a href="/crawler-settings" className="text-blue-600 hover:text-blue-800 underline">
                                Crawler Settings
                              </a>
                              {' '}page.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Capabilities</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="canAccessDocuments"
                            checked={formData.capabilities.canAccessDocuments}
                            onChange={(e) => handleNestedChange('capabilities', 'canAccessDocuments', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="canAccessDocuments" className="text-sm text-gray-700">
                            Can access knowledge base documents
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="canSearchWeb"
                            checked={formData.capabilities.canSearchWeb}
                            onChange={(e) => handleNestedChange('capabilities', 'canSearchWeb', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="canSearchWeb" className="text-sm text-gray-700">
                            Can search the web (coming soon)
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="canProcessImages"
                            checked={formData.capabilities.canProcessImages}
                            onChange={(e) => handleNestedChange('capabilities', 'canProcessImages', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="canProcessImages" className="text-sm text-gray-700">
                            Can process images (coming soon)
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? 'Creating...' : 'Create Agent'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAgentModal;
