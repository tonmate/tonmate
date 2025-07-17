'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { PlusIcon, ChatBubbleLeftIcon, DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';

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
  _count?: {
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
  const [hasProcessingItems, setHasProcessingItems] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isCreatingKnowledge, setIsCreatingKnowledge] = useState(false);
  const [newKnowledgeSource, setNewKnowledgeSource] = useState({
    name: '',
    url: '',
    type: 'website' as const
  });
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

  // Auto-refresh when there are processing items
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (hasProcessingItems && session?.user?.id) {
      interval = setInterval(() => {
        fetchAgents();
      }, 5000); // Check every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasProcessingItems, session]);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
        
        // Check if any knowledge sources are processing
        const hasProcessing = data.some((agent: Agent) => 
          agent.knowledgeSources.some((source: KnowledgeSource) => source.status === 'processing')
        );
        setHasProcessingItems(hasProcessing);
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

  const createKnowledgeSource = async () => {
    if (!selectedAgentId || !newKnowledgeSource.name || !newKnowledgeSource.url) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreatingKnowledge(true);
    try {
      const response = await fetch('/api/knowledge-sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: selectedAgentId,
          name: newKnowledgeSource.name,
          url: newKnowledgeSource.url,
          type: newKnowledgeSource.type
        }),
      });

      if (response.ok) {
        // Reset form and close modal
        setNewKnowledgeSource({ name: '', url: '', type: 'website' });
        setShowKnowledgeModal(false);
        setSelectedAgentId(null);
        // Refresh agents
        fetchAgents();
        alert('Knowledge source created successfully! You can now process it to crawl and embed the content.');
      } else {
        const error = await response.json();
        alert(`Failed to create knowledge source: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating knowledge source:', error);
      alert('Error creating knowledge source');
    } finally {
      setIsCreatingKnowledge(false);
    }
  };

  const openKnowledgeModal = (agentId: string) => {
    setSelectedAgentId(agentId);
    setShowKnowledgeModal(true);
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
    <DashboardLayout 
      title="Dashboard" 
      description="Manage your AI agents and knowledge sources"
    >
      <div className="p-6">
        {/* Processing Status */}
        {hasProcessingItems && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="animate-pulse text-yellow-600">🔄</span>
              <span className="text-sm font-medium text-yellow-800">Processing knowledge sources...</span>
            </div>
          </div>
        )}
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
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Details
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
                      <span>{agent._count?.conversations || 0} conversations</span>
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
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">Knowledge Sources</h4>
                        <button
                          onClick={() => openKnowledgeModal(agent.id)}
                          className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md border border-blue-200"
                        >
                          + Add Source
                        </button>
                      </div>
                      
                      {agent.knowledgeSources.length > 0 ? (
                        <div className="space-y-2">
                          {agent.knowledgeSources.map((source: KnowledgeSource) => (
                            <div key={source.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">{source.name}</span>
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    source.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                    source.status === 'processing' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                    source.status === 'failed' ? 'bg-red-100 text-red-800 border border-red-200' :
                                    'bg-gray-100 text-gray-800 border border-gray-200'
                                  }`}>
                                    {source.status === 'processing' && <span className="animate-pulse mr-1">🔄</span>}
                                    {source.status === 'completed' && <span className="mr-1">✅</span>}
                                    {source.status === 'failed' && <span className="mr-1">❌</span>}
                                    {source.status.toUpperCase()}
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
                      ) : (
                        <p className="text-xs text-gray-500 italic">No knowledge sources yet. Add a website to train your agent.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Customer Support Bot"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newAgent.description}
                    onChange={(e) => setNewAgent({...newAgent, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
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

      {/* Create Knowledge Source Modal */}
      {showKnowledgeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Knowledge Source</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={newKnowledgeSource.name}
                    onChange={(e) => setNewKnowledgeSource({...newKnowledgeSource, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Company Website"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website URL *</label>
                  <input
                    type="url"
                    value={newKnowledgeSource.url}
                    onChange={(e) => setNewKnowledgeSource({...newKnowledgeSource, url: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                  <strong>Note:</strong> After creating the knowledge source, click the "Process" button to crawl the website and generate embeddings for AI training.
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowKnowledgeModal(false);
                    setSelectedAgentId(null);
                    setNewKnowledgeSource({ name: '', url: '', type: 'website' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={createKnowledgeSource}
                  disabled={!newKnowledgeSource.name.trim() || !newKnowledgeSource.url.trim() || isCreatingKnowledge}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md"
                >
                  {isCreatingKnowledge ? 'Creating...' : 'Create Knowledge Source'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
