'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import OverviewTab from '../../../../components/AgentDetails/OverviewTab';
import ConfigurationTab from '../../../../components/AgentDetails/ConfigurationTab';
import KnowledgeSourcesTab from '../../../../components/AgentDetails/KnowledgeSourcesTab';
import ConversationsTab from '../../../../components/AgentDetails/ConversationsTab';
import SidebarNavigation, { TabType } from '../../../../components/AgentDetails/SidebarNavigation';
import Playground from '../../../../components/Playground';
// Removed UsageAnalytics import - analytics moved to main dashboard only
import DeveloperTools from '../../../../components/sidebar-pages/DeveloperTools';

interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  greetingMessage: string;
  model: string;
  temperature: number;
  maxTokens: number;
  createdAt: string;
  updatedAt: string;
  knowledgeSources: Array<{
    id: string;
    name: string;
    url: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: string;
    updatedAt: string;
    documents: Array<{
      id: string;
      title: string;
      content: string;
      embedding: number[] | null;
      createdAt: string;
    }>;
  }>;
  conversations: Array<{
    id: string;
    title?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  _count: {
    conversations: number;
  };
}

export default function AgentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [processingKnowledge, setProcessingKnowledge] = useState<Set<string>>(new Set());
  const [showPlayground, setShowPlayground] = useState(false);

  const agentId = params.id as string;

  // Fetch agent data
  const fetchAgent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/agents/${agentId}`, {
      credentials: 'include'
    });
      if (!response.ok) {
        throw new Error('Failed to fetch agent');
      }
      const data = await response.json();
      setAgent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAgent();
  }, [agentId]);

  // Handle knowledge source processing
  const processKnowledgeSource = async (sourceId: string) => {
    try {
      console.log('🔍 Session before API call:', session);
      setProcessingKnowledge(prev => new Set(prev).add(sourceId));
      
      const response = await fetch(`/api/knowledge-sources/${sourceId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          maxPages: 10,
          maxDepth: 2,
          generateEmbeddings: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ API Error:', { status: response.status, error: errorData });
        throw new Error(`Failed to process knowledge source: ${errorData.error || response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ API Success:', result);
      
      // Refresh agent data to get updated status
      await fetchAgent();
    } catch (err) {
      console.error('Error processing knowledge source:', err);
    } finally {
      setProcessingKnowledge(prev => {
        const newSet = new Set(prev);
        newSet.delete(sourceId);
        return newSet;
      });
    }
  };

  // Handle delete knowledge source
  const deleteKnowledgeSource = async (sourceId: string, sourceName: string) => {
    if (!confirm(`Are you sure you want to delete the knowledge source "${sourceName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/knowledge-sources/${sourceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete knowledge source');
      }
      
      // Refresh agent data
      await fetchAgent();
    } catch (err) {
      console.error('Error deleting knowledge source:', err);
    }
  };

  // Handle playground modal
  const handlePlaygroundToggle = () => {
    setShowPlayground(!showPlayground);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agent details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🤖</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Agent not found</h1>
          <p className="text-gray-600 mb-4">The agent you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const hasProcessingItems = agent.knowledgeSources.some(source => source.status === 'processing');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
                <p className="text-gray-600">{agent.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {hasProcessingItems && (
                <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  <span>🔄 Processing knowledge sources...</span>
                </div>
              )}
              <button
                onClick={handlePlaygroundToggle}
                className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
              >
                🎮 Playground
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 min-h-[600px]">
          {/* Sidebar Navigation */}
          <SidebarNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hasProcessingItems={hasProcessingItems}
          />

          {/* Tab Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm">
            {activeTab === 'overview' && (
              <OverviewTab agent={agent} />
            )}

            {activeTab === 'configuration' && (
              <ConfigurationTab agent={agent} />
            )}

            {activeTab === 'knowledge' && (
              <KnowledgeSourcesTab
                agent={agent}
                onProcessKnowledgeSource={processKnowledgeSource}
                onDeleteKnowledgeSource={deleteKnowledgeSource}
              />
            )}

            {activeTab === 'conversations' && (
              <ConversationsTab
                agent={agent}
              />
            )}

            {activeTab === 'playground' && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">AI Playground</h2>
                <p className="text-gray-600 mb-4">Test your AI agent in an interactive environment</p>
                <button
                  onClick={handlePlaygroundToggle}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open Playground
                </button>
              </div>
            )}

            {/* Analytics tab removed - analytics moved to main dashboard only */}

            {activeTab === 'developer' && (
              <DeveloperTools />
            )}
          </div>
        </div>
      </div>

      {/* Playground Modal */}
      {showPlayground && (
        <Playground
          agent={{
            id: agent.id,
            name: agent.name,
            description: agent.description,
            prompt: agent.systemPrompt
          }}
          onClose={handlePlaygroundToggle}
        />
      )}
    </div>
  );
}
