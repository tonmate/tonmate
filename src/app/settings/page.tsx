'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Input, Button, Select, Card, Tabs, TabsList, TabsTrigger, TabsContent, Alert, Loading } from '../../components/ui';
import { 
  CogIcon, 
  KeyIcon, 
  CloudIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface IntegrationSettings {
  openaiApiKey: string;
  openaiModel: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
  anthropicApiKey?: string;
  anthropicModel?: string;
  cohereApiKey?: string;
  huggingFaceApiKey?: string;
  webhookUrl?: string;
  webhookSecret?: string;
}

export default function Settings() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'llm' | 'integrations' | 'security'>('llm');
  const [settings, setSettings] = useState<IntegrationSettings>({
    openaiApiKey: '',
    openaiModel: 'gpt-3.5-turbo',
    defaultTemperature: 0.7,
    defaultMaxTokens: 1000,
    anthropicApiKey: '',
    anthropicModel: 'claude-3-sonnet-20240229',
    cohereApiKey: '',
    huggingFaceApiKey: '',
    webhookUrl: '',
    webhookSecret: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{ [key: string]: 'success' | 'error' | null }>({});
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (session?.user?.id) {
      fetchSettings();
    }
  }, [session]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        // Show success message
        console.log('Settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (provider: string) => {
    setTestingConnection(provider);
    setConnectionStatus(prev => ({ ...prev, [provider]: null }));

    try {
      const response = await fetch('/api/settings/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, settings }),
      });

      const result = await response.json();
      setConnectionStatus(prev => ({ 
        ...prev, 
        [provider]: result.success ? 'success' : 'error' 
      }));
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus(prev => ({ ...prev, [provider]: 'error' }));
    } finally {
      setTestingConnection(null);
    }
  };

  const handleInputChange = (field: keyof IntegrationSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const toggleApiKeyVisibility = (key: string) => {
    setShowApiKey(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  const tabs = [
    { id: 'llm' as const, name: 'LLM Providers', icon: CloudIcon },
    { id: 'integrations' as const, name: 'Integrations', icon: CogIcon },
    { id: 'security' as const, name: 'Security', icon: ShieldCheckIcon },
  ];

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout title="Settings" description="Configure your integrations and preferences">
        <div className="flex items-center justify-center py-12">
          <Loading size="lg" text="Loading settings..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings" description="Configure your integrations and preferences">
      <div className="max-w-6xl mx-auto p-6">
        <Tabs defaultValue="llm" value={activeTab} onValueChange={(value: string) => setActiveTab(value as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="llm" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">OpenAI Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="API Key"
                    type={showApiKey.openai ? 'text' : 'password'}
                    value={settings.openaiApiKey}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('openaiApiKey', e.target.value)}
                    placeholder="sk-..."
                    className="text-gray-900 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => toggleApiKeyVisibility('openai')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <KeyIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <div>
                  <Select
                    label="Model"
                    value={settings.openaiModel}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('openaiModel', e.target.value)}
                    options={[
                      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
                      { value: 'gpt-4', label: 'GPT-4' },
                      { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' },
                      { value: 'gpt-4o', label: 'GPT-4o' }
                    ]}
                  />
                </div>
                <div>
                  <Input
                    label="Default Temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.defaultTemperature.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('defaultTemperature', parseFloat(e.target.value))}
                    className="text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div>
                  <Input
                    label="Default Max Tokens"
                    type="number"
                    min="1"
                    max="4000"
                    value={settings.defaultMaxTokens.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('defaultMaxTokens', parseInt(e.target.value))}
                    className="text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-4">
                <Button
                  onClick={() => testConnection('openai')}
                  disabled={!settings.openaiApiKey || testingConnection === 'openai'}
                  loading={testingConnection === 'openai'}
                  className="flex items-center space-x-2"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Test Connection</span>
                </Button>
                {connectionStatus.openai === 'success' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Connection successful</span>
                  </div>
                )}
                {connectionStatus.openai === 'error' && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    <span>Connection failed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Anthropic Configuration */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Anthropic (Claude) Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey.anthropic ? 'text' : 'password'}
                      value={settings.anthropicApiKey || ''}
                      onChange={(e) => handleInputChange('anthropicApiKey', e.target.value)}
                      placeholder="sk-ant-..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleApiKeyVisibility('anthropic')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <KeyIcon className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <select
                    value={settings.anthropicModel || ''}
                    onChange={(e) => handleInputChange('anthropicModel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                    <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                    <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => testConnection('anthropic')}
                  disabled={!settings.anthropicApiKey || testingConnection === 'anthropic'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {testingConnection === 'anthropic' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircleIcon className="h-4 w-4" />
                  )}
                  <span>Test Connection</span>
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Webhook Configuration</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Input
                    label="Webhook URL"
                    type="url"
                    value={settings.webhookUrl || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('webhookUrl', e.target.value)}
                    placeholder="https://your-domain.com/webhook"
                  />
                </div>
                <div>
                  <Input
                    label="Webhook Secret"
                    type="password"
                    value={settings.webhookSecret || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('webhookSecret', e.target.value)}
                    placeholder="Your webhook secret key"
                  />
                </div>
              </div>
            </div>

            {/* Other Integrations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Other AI Providers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Cohere API Key"
                    type="password"
                    value={settings.cohereApiKey || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('cohereApiKey', e.target.value)}
                    placeholder="Your Cohere API key"
                  />
                </div>
                <div>
                  <Input
                    label="Hugging Face API Key"
                    type="password"
                    value={settings.huggingFaceApiKey || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('huggingFaceApiKey', e.target.value)}
                    placeholder="Your Hugging Face API key"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">API Key Security</p>
                      <p className="text-sm text-yellow-600">Your API keys are encrypted and stored securely</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h4 className="font-medium text-gray-900 mb-2">Encryption Status</h4>
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span className="text-sm">All sensitive data encrypted</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h4 className="font-medium text-gray-900 mb-2">Access Control</h4>
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span className="text-sm">User-based access control</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Save Button */}
          <div className="flex justify-end mt-8">
            <Button
              onClick={saveSettings}
              disabled={saving}
              loading={saving}
              className="flex items-center space-x-2"
            >
              <CheckCircleIcon className="h-4 w-4" />
              <span>Save Settings</span>
            </Button>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
