import React from 'react';

export type TabType = 'overview' | 'configuration' | 'knowledge' | 'conversations' | 'playground' | 'analytics' | 'developer';

interface SidebarNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasProcessingItems?: boolean;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  hasProcessingItems 
}) => {
  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: '📊' },
    { id: 'configuration' as TabType, label: 'Configuration', icon: '⚙️' },
    { id: 'knowledge' as TabType, label: 'Knowledge Sources', icon: '📚' },
    { id: 'conversations' as TabType, label: 'Recent Conversations', icon: '💬' },
    { id: 'playground' as TabType, label: 'AI Playground', icon: '🎮' },
    { id: 'analytics' as TabType, label: 'Usage Analytics', icon: '📈' },
    { id: 'developer' as TabType, label: 'Developer Tools', icon: '⚡' }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
      <nav className="p-4 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <span className="mr-3">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'knowledge' && hasProcessingItems && (
                <span className="ml-auto">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    🔄
                  </span>
                </span>
              )}
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SidebarNavigation;
