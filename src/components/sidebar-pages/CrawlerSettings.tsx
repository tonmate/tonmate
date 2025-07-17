'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Globe, Clock, Filter, Save, AlertCircle, Check, Info, Zap, Database } from 'lucide-react';

interface CrawlerConfig {
  maxPages: number;
  maxDepth: number;
  respectRobotsTxt: boolean;
  crawlDelay: number;
  maxConcurrentRequests: number;
  timeout: number;
  retryAttempts: number;
  userAgent: string;
  excludePatterns: string[];
  includePatterns: string[];
  contentTypes: string[];
  maxFileSize: number;
  followRedirects: boolean;
  extractImages: boolean;
  extractLinks: boolean;
  extractMetadata: boolean;
  minContentLength: number;
  enableJavaScript: boolean;
  waitForSelector: string;
  customHeaders: { [key: string]: string };
}

const DEFAULT_CONFIG: CrawlerConfig = {
  maxPages: 100,
  maxDepth: 3,
  respectRobotsTxt: true,
  crawlDelay: 1000,
  maxConcurrentRequests: 5,
  timeout: 30000,
  retryAttempts: 3,
  userAgent: 'UniversalAI-Support-Crawler/1.0',
  excludePatterns: [
    '*.pdf',
    '*.jpg',
    '*.jpeg',
    '*.png',
    '*.gif',
    '*.zip',
    '*.exe',
    '/admin/*',
    '/wp-admin/*',
    '*/login',
    '*/logout'
  ],
  includePatterns: [
    '*.html',
    '*.htm',
    '*.php',
    '*.asp',
    '*.aspx',
    '*.jsp'
  ],
  contentTypes: [
    'text/html',
    'text/plain',
    'application/xhtml+xml',
    'application/xml'
  ],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  followRedirects: true,
  extractImages: false,
  extractLinks: true,
  extractMetadata: true,
  minContentLength: 100,
  enableJavaScript: false,
  waitForSelector: '',
  customHeaders: {}
};

export default function CrawlerSettings() {
  const [config, setConfig] = useState<CrawlerConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'performance' | 'filters' | 'advanced'>('general');

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/crawler/config');
      if (response.ok) {
        const data = await response.json();
        setConfig({ ...DEFAULT_CONFIG, ...data });
      }
    } catch (err) {
      console.error('Failed to load crawler configuration:', err);
    }
  };

  const handleSaveConfiguration = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/crawler/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      setSuccess('Crawler configuration saved successfully!');
    } catch (err) {
      setError('Failed to save configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    setConfig(DEFAULT_CONFIG);
    setSuccess('Configuration reset to defaults');
  };

  const handleAddPattern = (type: 'exclude' | 'include') => {
    const pattern = prompt(`Enter ${type} pattern:`);
    if (pattern) {
      setConfig(prev => ({
        ...prev,
        [type === 'exclude' ? 'excludePatterns' : 'includePatterns']: [
          ...prev[type === 'exclude' ? 'excludePatterns' : 'includePatterns'],
          pattern
        ]
      }));
    }
  };

  const handleRemovePattern = (type: 'exclude' | 'include', index: number) => {
    setConfig(prev => ({
      ...prev,
      [type === 'exclude' ? 'excludePatterns' : 'includePatterns']: 
        prev[type === 'exclude' ? 'excludePatterns' : 'includePatterns'].filter((_, i) => i !== index)
    }));
  };

  const handleAddHeader = () => {
    const key = prompt('Enter header name:');
    const value = prompt('Enter header value:');
    if (key && value) {
      setConfig(prev => ({
        ...prev,
        customHeaders: {
          ...prev.customHeaders,
          [key]: value
        }
      }));
    }
  };

  const handleRemoveHeader = (key: string) => {
    setConfig(prev => ({
      ...prev,
      customHeaders: Object.fromEntries(
        Object.entries(prev.customHeaders).filter(([k]) => k !== key)
      )
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Crawler Settings</h2>
          <p className="text-gray-600 mt-1">Configure web crawling behavior and limits</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleResetToDefaults}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSaveConfiguration}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'performance', label: 'Performance', icon: Zap },
            { id: 'filters', label: 'Filters', icon: Filter },
            { id: 'advanced', label: 'Advanced', icon: Database }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border shadow-sm">
        {activeTab === 'general' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Pages to Crawl
                </label>
                <input
                  type="number"
                  value={config.maxPages}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxPages: parseInt(e.target.value) || 0 }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="10000"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum number of pages to crawl per session</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Crawl Depth
                </label>
                <input
                  type="number"
                  value={config.maxDepth}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxDepth: parseInt(e.target.value) || 0 }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="10"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum link depth to follow from the starting page</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crawl Delay (ms)
                </label>
                <input
                  type="number"
                  value={config.crawlDelay}
                  onChange={(e) => setConfig(prev => ({ ...prev, crawlDelay: parseInt(e.target.value) || 0 }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="10000"
                />
                <p className="text-xs text-gray-500 mt-1">Delay between requests to avoid overwhelming the server</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Agent
                </label>
                <input
                  type="text"
                  value={config.userAgent}
                  onChange={(e) => setConfig(prev => ({ ...prev, userAgent: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="User agent string"
                />
                <p className="text-xs text-gray-500 mt-1">Identifies the crawler to web servers</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="respectRobotsTxt"
                  checked={config.respectRobotsTxt}
                  onChange={(e) => setConfig(prev => ({ ...prev, respectRobotsTxt: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="respectRobotsTxt" className="text-sm font-medium text-gray-700">
                  Respect robots.txt
                </label>
                <Info className="w-4 h-4 text-gray-400" />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="followRedirects"
                  checked={config.followRedirects}
                  onChange={(e) => setConfig(prev => ({ ...prev, followRedirects: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="followRedirects" className="text-sm font-medium text-gray-700">
                  Follow redirects
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="extractMetadata"
                  checked={config.extractMetadata}
                  onChange={(e) => setConfig(prev => ({ ...prev, extractMetadata: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="extractMetadata" className="text-sm font-medium text-gray-700">
                  Extract metadata (title, description, etc.)
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Concurrent Requests
                </label>
                <input
                  type="number"
                  value={config.maxConcurrentRequests}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxConcurrentRequests: parseInt(e.target.value) || 1 }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="20"
                />
                <p className="text-xs text-gray-500 mt-1">Number of parallel requests to process</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Timeout (ms)
                </label>
                <input
                  type="number"
                  value={config.timeout}
                  onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30000 }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="5000"
                  max="120000"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum time to wait for a response</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retry Attempts
                </label>
                <input
                  type="number"
                  value={config.retryAttempts}
                  onChange={(e) => setConfig(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) || 0 }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="10"
                />
                <p className="text-xs text-gray-500 mt-1">Number of retry attempts for failed requests</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  value={config.maxFileSize / (1024 * 1024)}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxFileSize: (parseFloat(e.target.value) || 5) * 1024 * 1024 }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0.1"
                  max="50"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum file size to download</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'filters' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exclude Patterns
                </label>
                <div className="space-y-2">
                  {config.excludePatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={pattern}
                        onChange={(e) => {
                          const newPatterns = [...config.excludePatterns];
                          newPatterns[index] = e.target.value;
                          setConfig(prev => ({ ...prev, excludePatterns: newPatterns }));
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleRemovePattern('exclude', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddPattern('exclude')}
                    className="w-full p-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:border-gray-400 hover:text-gray-600"
                  >
                    + Add Exclude Pattern
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Include Patterns
                </label>
                <div className="space-y-2">
                  {config.includePatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={pattern}
                        onChange={(e) => {
                          const newPatterns = [...config.includePatterns];
                          newPatterns[index] = e.target.value;
                          setConfig(prev => ({ ...prev, includePatterns: newPatterns }));
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleRemovePattern('include', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddPattern('include')}
                    className="w-full p-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:border-gray-400 hover:text-gray-600"
                  >
                    + Add Include Pattern
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Content Length
              </label>
              <input
                type="number"
                value={config.minContentLength}
                onChange={(e) => setConfig(prev => ({ ...prev, minContentLength: parseInt(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="10000"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum content length to consider valid</p>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableJavaScript"
                  checked={config.enableJavaScript}
                  onChange={(e) => setConfig(prev => ({ ...prev, enableJavaScript: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="enableJavaScript" className="text-sm font-medium text-gray-700">
                  Enable JavaScript rendering
                </label>
                <Info className="w-4 h-4 text-gray-400" />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="extractImages"
                  checked={config.extractImages}
                  onChange={(e) => setConfig(prev => ({ ...prev, extractImages: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="extractImages" className="text-sm font-medium text-gray-700">
                  Extract images
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="extractLinks"
                  checked={config.extractLinks}
                  onChange={(e) => setConfig(prev => ({ ...prev, extractLinks: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="extractLinks" className="text-sm font-medium text-gray-700">
                  Extract links
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wait for Selector (Optional)
              </label>
              <input
                type="text"
                value={config.waitForSelector}
                onChange={(e) => setConfig(prev => ({ ...prev, waitForSelector: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="CSS selector to wait for"
              />
              <p className="text-xs text-gray-500 mt-1">CSS selector to wait for before extracting content</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Headers
              </label>
              <div className="space-y-2">
                {Object.entries(config.customHeaders).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={key}
                      readOnly
                      className="flex-1 p-2 border border-gray-300 rounded bg-gray-50"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        customHeaders: {
                          ...prev.customHeaders,
                          [key]: e.target.value
                        }
                      }))}
                      className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleRemoveHeader(key)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddHeader}
                  className="w-full p-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:border-gray-400 hover:text-gray-600"
                >
                  + Add Custom Header
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
