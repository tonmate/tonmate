import React, { useState } from 'react';
import Link from 'next/link';
import ProcessingLogsModal from './ProcessingLogsModal';

interface KnowledgeSource {
  id: string;
  name: string;
  url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  documents: any[];
}

interface Agent {
  id: string;
  knowledgeSources: KnowledgeSource[];
}

interface KnowledgeSourcesTabProps {
  agent: Agent;
  onProcessKnowledgeSource: (id: string) => void;
  onDeleteKnowledgeSource: (id: string, name: string) => void;
}

const KnowledgeSourcesTab: React.FC<KnowledgeSourcesTabProps> = ({ 
  agent, 
  onProcessKnowledgeSource,
  onDeleteKnowledgeSource 
}) => {
  const [selectedKnowledgeSource, setSelectedKnowledgeSource] = useState<{ id: string; name: string } | null>(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  const handleViewLogs = (id: string, name: string) => {
    setSelectedKnowledgeSource({ id, name });
    setIsLogsModalOpen(true);
  };

  const handleCloseLogsModal = () => {
    setIsLogsModalOpen(false);
    setSelectedKnowledgeSource(null);
  };
  const getStatusBadge = (status: string) => {
    const badges = {
      completed: 'bg-green-100 text-green-800 border-green-300',
      processing: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
      pending: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    
    const icons = {
      completed: '✅',
      processing: '🔄',
      failed: '❌',
      pending: '⏳'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badges[status as keyof typeof badges]}`}>
        {icons[status as keyof typeof icons]} {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Sources</h3>
          {agent.knowledgeSources.length > 0 ? (
            <div className="space-y-4">
              {agent.knowledgeSources.map((ks) => (
                <div key={ks.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{ks.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{ks.url}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Created: {new Date(ks.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Documents: {ks.documents.length}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(ks.status)}
                      <button
                        onClick={() => handleViewLogs(ks.id, ks.name)}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                      >
                        View Logs
                      </button>
                      <button
                        onClick={() => onProcessKnowledgeSource(ks.id)}
                        disabled={ks.status === 'processing'}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          ks.status === 'processing' 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {ks.status === 'processing' ? 'Processing...' : 'Process'}
                      </button>
                      <button
                        onClick={() => onDeleteKnowledgeSource(ks.id, ks.name)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No knowledge sources configured yet.</p>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Knowledge Source
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Processing Logs Modal */}
      {selectedKnowledgeSource && (
        <ProcessingLogsModal
          isOpen={isLogsModalOpen}
          onClose={handleCloseLogsModal}
          knowledgeSourceId={selectedKnowledgeSource.id}
          knowledgeSourceName={selectedKnowledgeSource.name}
        />
      )}
    </div>
  );
};

export default KnowledgeSourcesTab;
