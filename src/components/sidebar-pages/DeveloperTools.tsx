'use client';

import React, { useState, useEffect } from 'react';
import { Code2, Copy, Eye, Settings, Globe, Key, Download, ExternalLink, Send } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: string;
}

interface EmbedConfig {
  agentId: string;
  theme: 'light' | 'dark' | 'auto';
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor: string;
  welcomeMessage: string;
  width: number;
  height: number;
  showBranding: boolean;
  autoOpen: boolean;
  allowFullscreen: boolean;
}

export default function DeveloperTools() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [embedConfig, setEmbedConfig] = useState<EmbedConfig>({
    agentId: '',
    theme: 'light',
    position: 'bottom-right',
    primaryColor: '#3B82F6',
    welcomeMessage: 'Hello! How can I help you today?',
    width: 400,
    height: 600,
    showBranding: true,
    autoOpen: false,
    allowFullscreen: true
  });
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'embed' | 'api' | 'webhook' | 'preview'>('embed');

  useEffect(() => {
    fetchAgents();
    fetchApiKey();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
        if (data.length > 0 && !selectedAgentId) {
          setSelectedAgentId(data[0].id);
          setEmbedConfig(prev => ({ ...prev, agentId: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApiKey = async () => {
    try {
      const response = await fetch('/api/developer/api-key');
      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey);
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  };

  const generateApiKey = async () => {
    try {
      const response = await fetch('/api/developer/api-key', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey);
      }
    } catch (error) {
      console.error('Error generating API key:', error);
    }
  };

  const generateEmbedCode = () => {
    const config = {
      agentId: embedConfig.agentId,
      theme: embedConfig.theme,
      position: embedConfig.position,
      primaryColor: embedConfig.primaryColor,
      welcomeMessage: embedConfig.welcomeMessage,
      width: embedConfig.width,
      height: embedConfig.height,
      showBranding: embedConfig.showBranding,
      autoOpen: embedConfig.autoOpen,
      allowFullscreen: embedConfig.allowFullscreen
    };

    return `<!-- AI Customer Support Widget -->
<script>
  (function() {
    const config = ${JSON.stringify(config, null, 2)};
    
    const widget = document.createElement('div');
    widget.id = 'ai-support-widget';
    widget.style.cssText = \`
      position: fixed;
      ${embedConfig.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
      ${embedConfig.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    \`;
    
    const iframe = document.createElement('iframe');
    iframe.src = \`\${window.location.origin}/embed/\${config.agentId}?config=\${encodeURIComponent(JSON.stringify(config))}\`;
    iframe.style.cssText = \`
      width: \${config.width}px;
      height: \${config.height}px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      background: white;
      display: \${config.autoOpen ? 'block' : 'none'};
    \`;
    
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = '💬';
    toggleButton.style.cssText = \`
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      background: \${config.primaryColor};
      color: white;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      display: \${config.autoOpen ? 'none' : 'block'};
      transition: all 0.3s ease;
    \`;
    
    toggleButton.addEventListener('click', () => {
      const isOpen = iframe.style.display === 'block';
      iframe.style.display = isOpen ? 'none' : 'block';
      toggleButton.style.display = isOpen ? 'block' : 'none';
    });
    
    widget.appendChild(iframe);
    widget.appendChild(toggleButton);
    document.body.appendChild(widget);
    
    // Handle close events from iframe
    window.addEventListener('message', (event) => {
      if (event.data.type === 'close-widget') {
        iframe.style.display = 'none';
        toggleButton.style.display = 'block';
      }
    });
  })();
</script>`;
  };

  const generateReactCode = () => {
    const config = {
      agentId: embedConfig.agentId,
      theme: embedConfig.theme,
      position: embedConfig.position,
      primaryColor: embedConfig.primaryColor,
      welcomeMessage: embedConfig.welcomeMessage,
      width: embedConfig.width,
      height: embedConfig.height,
      showBranding: embedConfig.showBranding,
      autoOpen: embedConfig.autoOpen,
      allowFullscreen: embedConfig.allowFullscreen
    };

    return `import React from 'react';

const AISupportWidget = () => {
  const config = ${JSON.stringify(config, null, 2)};
  
  React.useEffect(() => {
    const widget = document.createElement('div');
    widget.id = 'ai-support-widget';
    widget.style.cssText = \`
      position: fixed;
      \${config.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
      \${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
      z-index: 9999;
    \`;
    
    const iframe = document.createElement('iframe');
    iframe.src = \`\${window.location.origin}/embed/\${config.agentId}?config=\${encodeURIComponent(JSON.stringify(config))}\`;
    iframe.style.cssText = \`
      width: \${config.width}px;
      height: \${config.height}px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    \`;
    
    widget.appendChild(iframe);
    document.body.appendChild(widget);
    
    return () => {
      document.body.removeChild(widget);
    };
  }, []);
  
  return null;
};

export default AISupportWidget;`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadEmbedCode = () => {
    const code = generateEmbedCode();
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-support-widget.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading developer tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Developer Tools</h1>
        <p className="text-gray-600 mt-1">Integrate your AI agents into websites and applications</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('embed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'embed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4" />
              <span>Embed Code</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'api'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>API Keys</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'webhook'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Webhooks</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Live Preview</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Embed Code Tab */}
      {activeTab === 'embed' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Widget Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Agent
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => {
                    setSelectedAgentId(e.target.value);
                    setEmbedConfig(prev => ({ ...prev, agentId: e.target.value }));
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  value={embedConfig.theme}
                  onChange={(e) => setEmbedConfig(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' | 'auto' }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  value={embedConfig.position}
                  onChange={(e) => setEmbedConfig(prev => ({ ...prev, position: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={embedConfig.primaryColor}
                  onChange={(e) => setEmbedConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Welcome Message
                </label>
                <input
                  type="text"
                  value={embedConfig.welcomeMessage}
                  onChange={(e) => setEmbedConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={embedConfig.width}
                    onChange={(e) => setEmbedConfig(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={embedConfig.height}
                    onChange={(e) => setEmbedConfig(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={embedConfig.showBranding}
                    onChange={(e) => setEmbedConfig(prev => ({ ...prev, showBranding: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show branding</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={embedConfig.autoOpen}
                    onChange={(e) => setEmbedConfig(prev => ({ ...prev, autoOpen: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-open on page load</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={embedConfig.allowFullscreen}
                    onChange={(e) => setEmbedConfig(prev => ({ ...prev, allowFullscreen: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow fullscreen</span>
                </label>
              </div>
            </div>
          </div>

          {/* Code Panel */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generated Code</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(generateEmbedCode())}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={downloadEmbedCode}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                  title="Download HTML file"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
                {generateEmbedCode()}
              </pre>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Installation Instructions</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Copy the code above</li>
                <li>2. Paste it before the closing &lt;/body&gt; tag in your HTML</li>
                <li>3. The widget will automatically appear on your website</li>
                <li>4. Customize the configuration as needed</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Keys</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your API Key
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={apiKey || 'No API key generated'}
                  readOnly
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50 font-mono text-sm text-gray-900 placeholder-gray-400"
                />
                <button
                  onClick={() => copyToClipboard(apiKey)}
                  disabled={!apiKey}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <button
              onClick={generateApiKey}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {apiKey ? 'Regenerate API Key' : 'Generate API Key'}
            </button>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Important Security Notes</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Keep your API key secure and never share it publicly</li>
                <li>• Use it only in server-side applications</li>
                <li>• Regenerate if you suspect it has been compromised</li>
                <li>• Monitor your usage to detect unauthorized access</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {/* Preview Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Live Widget Preview</h3>
            </div>
            <p className="text-gray-600">Test how your AI support widget will appear on your website. Configure the settings in the Embed Code tab to see real-time changes.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Preview Panel */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Widget Preview</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Live</span>
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-[400px] relative">
                {/* Mock Website Background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-3 gap-4 p-4">
                    <div className="bg-white rounded h-8"></div>
                    <div className="bg-white rounded h-8"></div>
                    <div className="bg-white rounded h-8"></div>
                    <div className="bg-white rounded h-16 col-span-2"></div>
                    <div className="bg-white rounded h-16"></div>
                    <div className="bg-white rounded h-12 col-span-3"></div>
                  </div>
                </div>
                
                {/* Widget Preview */}
                <div 
                  className={`absolute z-10 ${
                    embedConfig.position.includes('bottom') ? 'bottom-4' : 'top-4'
                  } ${
                    embedConfig.position.includes('right') ? 'right-4' : 'left-4'
                  }`}
                >
                  {/* Widget Button */}
                  <div 
                    className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                    style={{ backgroundColor: embedConfig.primaryColor }}
                  >
                    <span className="text-white text-2xl">💬</span>
                  </div>
                  
                  {/* Sample Chat Window (always show in preview) */}
                  <div 
                    className="mt-2 bg-white rounded-lg shadow-xl border overflow-hidden"
                    style={{ 
                      width: `${Math.min(embedConfig.width, 300)}px`, 
                      height: `${Math.min(embedConfig.height, 250)}px` 
                    }}
                  >
                    {/* Chat Header */}
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">AI</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Support Agent</h5>
                          <p className="text-xs text-green-600">Online</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Chat Messages */}
                    <div className="p-3 space-y-2 text-sm">
                      <div className="bg-gray-100 rounded-lg p-2 max-w-[80%]">
                        <p className="text-gray-800">{embedConfig.welcomeMessage}</p>
                      </div>
                      <div className="bg-blue-500 text-white rounded-lg p-2 max-w-[80%] ml-auto">
                        <p>Hello! I need help with...</p>
                      </div>
                    </div>
                    
                    {/* Chat Input */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="text" 
                          placeholder="Type your message..." 
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-full text-sm focus:outline-none text-gray-900 placeholder-gray-400"
                          disabled
                        />
                        <button className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Snippets Panel */}
            <div className="space-y-4">
              {/* Installation Instructions */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">Quick Integration</h4>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {/* HTML Snippet */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">HTML Embed</label>
                        <button 
                          onClick={() => copyToClipboard(generateEmbedCode())}
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <pre className="bg-gray-100 rounded p-3 text-xs overflow-x-auto">
                        <code>{generateEmbedCode().slice(0, 200)}...</code>
                      </pre>
                    </div>

                    {/* React Snippet */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">React Component</label>
                        <button 
                          onClick={() => copyToClipboard(generateReactCode())}
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <pre className="bg-gray-100 rounded p-3 text-xs overflow-x-auto">
                        <code>{generateReactCode().slice(0, 200)}...</code>
                      </pre>
                    </div>

                    {/* WordPress Snippet */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">WordPress</label>
                        <button 
                          onClick={() => copyToClipboard('Add the HTML embed code to your WordPress theme footer or use a custom HTML block.')}
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="bg-gray-100 rounded p-3 text-xs text-gray-600">
                        <p>1. Copy the HTML embed code above</p>
                        <p>2. Go to Appearance → Theme Editor</p>
                        <p>3. Add code before &lt;/body&gt; tag</p>
                        <p>Or use a Custom HTML block in Gutenberg</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuration Summary */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">Current Configuration</h4>
                </div>
                <div className="p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Position:</span>
                    <span className="font-medium">{embedConfig.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Theme:</span>
                    <span className="font-medium">{embedConfig.theme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{embedConfig.width}×{embedConfig.height}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auto-open:</span>
                    <span className="font-medium">{embedConfig.autoOpen ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Tab */}
      {activeTab === 'webhook' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Integration</h3>
          
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Webhook configuration coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
}
