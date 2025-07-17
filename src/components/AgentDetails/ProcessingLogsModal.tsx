'use client';

import { useState, useEffect } from 'react';
import { X, Clock, AlertCircle, CheckCircle, Info, AlertTriangle, ExternalLink, FileText, Database, Activity } from 'lucide-react';

interface ProcessingLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: any;
  url?: string;
  step?: string;
  progress?: number;
}

interface ProcessingStatistics {
  totalDocuments: number;
  totalPages: number;
  totalLinks: number;
  failedPages: number;
  successRate: string;
}

interface ProcessedDocument {
  id: string;
  title: string;
  url: string;
  contentPreview: string;
  wordCount: number;
  createdAt: string;
}

interface ProcessingLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  knowledgeSourceId: string;
  knowledgeSourceName: string;
}

export default function ProcessingLogsModal({ 
  isOpen, 
  onClose, 
  knowledgeSourceId, 
  knowledgeSourceName 
}: ProcessingLogsModalProps) {
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [statistics, setStatistics] = useState<ProcessingStatistics | null>(null);
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'logs' | 'statistics' | 'documents'>('logs');

  useEffect(() => {
    if (isOpen) {
      fetchProcessingLogs();
    }
  }, [isOpen, knowledgeSourceId]);

  const fetchProcessingLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/knowledge-sources/${knowledgeSourceId}/logs`);
      if (!response.ok) {
        throw new Error('Failed to fetch processing logs');
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setStatistics(data.statistics || null);
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching processing logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch processing logs');
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatStep = (step?: string) => {
    if (!step) return '';
    
    const stepLabels: { [key: string]: string } = {
      'started': 'Processing Started',
      'crawl_start': 'Crawling Started',
      'crawl_completed': 'Crawling Completed',
      'crawl_failed': 'Crawling Failed',
      'page_processing': 'Processing Page',
      'chunks_created': 'Chunks Created',
      'embeddings_generated': 'Embeddings Generated',
      'document_saved': 'Document Saved',
      'completed': 'Processing Completed',
      'failed': 'Processing Failed'
    };
    
    return stepLabels[step] || step;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Processing Logs</h2>
              <p className="text-sm text-gray-600 mt-1">{knowledgeSourceName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-white">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Processing Logs</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'statistics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Statistics</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Documents ({documents.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto" style={{ maxHeight: '70vh' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading processing logs...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">Error loading logs</p>
                <p className="text-gray-600 mt-1">{error}</p>
                <button
                  onClick={fetchProcessingLogs}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  {logs.length === 0 ? (
                    <div className="text-center py-12">
                      <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No processing logs available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className={`p-4 rounded-lg border ${getLogColor(log.level)}`}
                        >
                          <div className="flex items-start space-x-3">
                            {getLogIcon(log.level)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{log.message}</span>
                                  {log.step && (
                                    <span className="text-xs px-2 py-1 bg-white bg-opacity-60 rounded-full">
                                      {formatStep(log.step)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  {log.progress !== undefined && (
                                    <span className="text-xs font-medium">
                                      {log.progress.toFixed(1)}%
                                    </span>
                                  )}
                                  <span className="text-xs">
                                    {formatTimestamp(log.timestamp)}
                                  </span>
                                </div>
                              </div>
                              
                              {log.url && (
                                <div className="mt-2 flex items-center space-x-1 text-sm">
                                  <ExternalLink className="w-3 h-3" />
                                  <a
                                    href={log.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 truncate"
                                  >
                                    {log.url}
                                  </a>
                                </div>
                              )}
                              
                              {log.details && (
                                <div className="mt-2">
                                  <details className="text-sm">
                                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                                      View details
                                    </summary>
                                    <pre className="mt-2 p-2 bg-white bg-opacity-60 rounded text-xs overflow-x-auto">
                                      {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                  </details>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'statistics' && statistics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{statistics.totalDocuments}</div>
                      <div className="text-sm text-gray-600">Documents Created</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{statistics.totalPages}</div>
                      <div className="text-sm text-gray-600">Pages Crawled</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{statistics.totalLinks}</div>
                      <div className="text-sm text-gray-600">Links Found</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{statistics.failedPages}</div>
                      <div className="text-sm text-gray-600">Failed Pages</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-lg font-medium text-gray-900 mb-2">Success Rate</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${statistics.successRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{statistics.successRate}%</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  {documents.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No documents found</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {documents.map((doc) => (
                        <div key={doc.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">{doc.title}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <span>{doc.wordCount} words</span>
                                <span>Created {formatTimestamp(doc.createdAt)}</span>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{doc.contentPreview}</p>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>View original</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
