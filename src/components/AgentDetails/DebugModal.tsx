import React from 'react';

interface DebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  debugInfo: any;
}

const DebugModal: React.FC<DebugModalProps> = ({ isOpen, onClose, debugInfo }) => {
  if (!isOpen || !debugInfo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Debug Information</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Documents Status Section */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg border border-blue-200">
            📄 Documents Status
          </h4>
          <div className="space-y-2">
            {debugInfo.documents && debugInfo.documents.length > 0 ? (
              debugInfo.documents.map((doc: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{doc.title || `Document ${index + 1}`}</p>
                    <p className="text-xs text-gray-600 mt-1">{doc.content?.substring(0, 80)}...</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      doc.embedding ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'
                    }`}>
                      {doc.embedding ? '✅ EMBEDDED' : '❌ NO EMBEDDING'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic p-3 bg-gray-50 rounded-lg">No documents found</p>
            )}
          </div>
        </div>

        {/* User Configuration Section */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg border border-green-200">
            ⚙️ User Configuration
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">OpenAI API Key</span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                debugInfo.hasOpenAIKey ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'
              }`}>
                {debugInfo.hasOpenAIKey ? '✅ CONFIGURED' : '❌ MISSING'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Source URL</span>
              <span className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                {debugInfo.sourceUrl || 'Not specified'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Agent Name</span>
              <span className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                {debugInfo.agentName || 'Not specified'}
              </span>
            </div>
          </div>
        </div>

        {/* Raw Debug Data Section */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-2 rounded-lg border border-purple-200">
            🔍 Raw Debug Data
          </h4>
          <details className="border border-gray-200 rounded-lg">
            <summary className="cursor-pointer p-3 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 rounded-t-lg">
              Click to view raw JSON data
            </summary>
            <div className="p-4 bg-white max-h-96 overflow-y-auto">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </details>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugModal;
