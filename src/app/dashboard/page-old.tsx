'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusIcon, CogIcon, ChatBubbleLeftIcon, DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Agent {
  id: string;
  name: string;
  description?: string;
  prompt?: string;
  greeting?: string;
  temperature: number;
  llmProvider: string;
  isActive: boolean;
  createdAt: string;
  knowledgeSources: KnowledgeSource[];
  _count: {
    conversations: number;
  };
}

interface KnowledgeSource {
  id: string;
  name: string;
  type: string;
  url?: string;
  status: string;
  _count?: {
    documents: number;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    prompt: 'You are a helpful customer support agent.',
    greeting: 'Hello! How can I help you today?',
    temperature: 0.7,
    llmProvider: 'openai'
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAgents();
    }
  }, [session]);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    const createAgent = async () => {
      try {
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAgent),
        });

        if (response.ok) {
          const agent = await response.json();
          setAgents([agent, ...agents]);
          setShowCreateModal(false);
          setNewAgent({
            name: '',
            description: '',
            prompt: 'You are a helpful customer support agent.',
            greeting: 'Hello! How can I help you today?',
            temperature: 0.7,
            llmProvider: 'openai'
          });
        } else {
          alert('Failed to create agent');
        }
      } catch (error) {
        console.error('Error creating agent:', error);
        alert('Error creating agent');
      }
    };

    const handleCrawlStore = async () => {
      if (!shopUrl) {
        alert('Please enter a shop URL first');
        return;
      }
      alert('Please enter a shop URL first');
      return;
    }

    setCrawling(true);
    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shopUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setOrders(data.orders || []);
        alert(`Crawling completed! Found ${data.products?.length || 0} products and ${data.orders?.length || 0} orders.`);
      } else {
        alert('Error crawling store');
      }
    } catch (error) {
      console.error('Error crawling store:', error);
      alert('Error crawling store');
    } finally {
      setCrawling(false);
    }
  };

  const handleTestAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMessage.trim()) return;

    setTestLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testMessage,
          userId: session?.user?.id,
          useUserConfig: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTestResponse(data.response);
      } else {
        setTestResponse('Error: Could not get response from agent');
      }
    } catch (error) {
      console.error('Error testing agent:', error);
      setTestResponse('Error: Could not connect to agent');
    } finally {
      setTestLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {session.user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/chat"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Test Chat
              </Link>
              <button
                onClick={() => signOut()}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration</h2>
              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="sk-..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Your API key is encrypted and stored securely
                  </p>
                </div>

                <div>
                  <label htmlFor="shopUrl" className="block text-sm font-medium text-gray-700">
                    Shop URL
                  </label>
                  <input
                    type="url"
                    id="shopUrl"
                    value={shopUrl}
                    onChange={(e) => setShopUrl(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://yourshop.com"
                  />
                </div>

                <div>
                  <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    id="shopName"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your Shop Name"
                  />
                </div>

                <div>
                  <label htmlFor="shopDescription" className="block text-sm font-medium text-gray-700">
                    Shop Description
                  </label>
                  <textarea
                    id="shopDescription"
                    value={shopDescription}
                    onChange={(e) => setShopDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of your shop"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </form>
            </div>

            {/* Crawl Store Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Store Data</h2>
              <p className="text-gray-600 mb-4">
                Crawl your store to automatically fetch product and order information.
              </p>
              <button
                onClick={handleCrawlStore}
                disabled={crawling || !shopUrl}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {crawling ? 'Crawling...' : 'Crawl Store Data'}
              </button>
            </div>
          </div>

          {/* Data Preview Section */}
          <div className="space-y-6">
            {/* Products Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Products ({products.length})
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {products.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No products found. Try crawling your store first.
                  </p>
                ) : (
                  products.slice(0, 5).map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded p-3">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium text-green-600">
                          ${product.price?.toFixed(2) || 'N/A'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Orders Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Orders ({orders.length})
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No orders found. Try crawling your store first.
                  </p>
                ) : (
                  orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">#{order.orderId}</h3>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-green-600">
                            ${order.total?.toFixed(2) || 'N/A'}
                          </span>
                          <p className="text-xs text-gray-500 capitalize">{order.status}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Test Agent Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Your AI Agent</h2>
          <form onSubmit={handleTestAgent} className="space-y-4">
            <div>
              <label htmlFor="testMessage" className="block text-sm font-medium text-gray-700">
                Test Message
              </label>
              <input
                type="text"
                id="testMessage"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ask about products, orders, or store policies..."
              />
            </div>
            <button
              type="submit"
              disabled={testLoading || !testMessage.trim()}
              className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {testLoading ? 'Testing...' : 'Test Agent'}
            </button>
          </form>

          {testResponse && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium text-gray-900 mb-2">Agent Response:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{testResponse}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}