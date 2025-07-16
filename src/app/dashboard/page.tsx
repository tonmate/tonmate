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
  const [isCreating, setIsCreating] = useState(false);
  const [processingKnowledge, setProcessingKnowledge] = useState<string | null>(null);
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

  const processKnowledgeSource = async (knowledgeSourceId: string) => {
    setProcessingKnowledge(knowledgeSourceId);
    try {
      const response = await fetch(`/api/knowledge-sources/${knowledgeSourceId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxPages: 10,
          maxDepth: 2,
          generateEmbeddings: true
        }),
      });

      if (response.ok) {
        alert('Knowledge processing started!');
      } else {
        const error = await response.json();
        alert(`Failed to start processing: ${error.error}`);
      }
    } catch (error) {
      console.error('Error processing knowledge source:', error);
      alert('Error starting knowledge processing');
    } finally {
      setProcessingKnowledge(null);
    }
  };

  const deleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAgents(agents.filter(agent => agent.id !== id));
      } else {
        alert('Failed to delete agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Error deleting agent');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Customer Support AI
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session?.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Agents</h1>
            <p className="text-gray-600">Create and manage your customer support AI agents</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Agent
          </button>
        </div>

        {/* Agents Grid */}
        {agents.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No agents</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first AI agent.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Agent
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {agent.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Link 
                        href={`/dashboard/agents/${agent.id}`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <CogIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => deleteAgent(agent.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {agent.description && (
                    <p className="text-sm text-gray-600 mb-4">
                      {agent.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                      <span>{agent._count.conversations} conversations</span>
                    </div>
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-4 w-4 mr-1" />
                      <span>{agent.knowledgeSources.length} sources</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        agent.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <Link
                        href={`/chat?agent=${agent.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Test Chat →
                      </Link>
                    </div>
                    
                    {/* Knowledge Sources */}
                    {agent.knowledgeSources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Knowledge Sources</h4>
                        <div className="space-y-2">
                          {agent.knowledgeSources.map((source: KnowledgeSource) => (
                            <div key={source.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium">{source.name}</span>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    source.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    source.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                    source.status === 'failed' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {source.status}
                                  </span>
                                </div>
                                {source.url && (
                                  <div className="text-xs text-gray-500 truncate">{source.url}</div>
                                )}
                              </div>
                              {source.url && source.status !== 'processing' && (
                                <button
                                  onClick={() => processKnowledgeSource(source.id)}
                                  disabled={processingKnowledge === source.id}
                                  className="ml-2 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {processingKnowledge === source.id ? 'Processing...' : 'Process'}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Agent</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Customer Support Bot"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newAgent.description}
                    onChange={(e) => setNewAgent({...newAgent, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Brief description of what this agent does..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Greeting Message</label>
                  <input
                    type="text"
                    value={newAgent.greeting}
                    onChange={(e) => setNewAgent({...newAgent, greeting: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Hello! How can I help you today?"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={createAgent}
                  disabled={!newAgent.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md"
                >
                  Create Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
