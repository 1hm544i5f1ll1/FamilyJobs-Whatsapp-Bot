import React, { useState } from 'react';
import StatusTab from './tabs/StatusTab';
import SourceTextTab from './tabs/SourceTextTab';
import AboutTextTab from './tabs/AboutTextTab';
import TestMessageTab from './tabs/TestMessageTab';
import SettingsTab from './tabs/SettingsTab';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('status');

  const tabs = [
    { id: 'status', name: 'Status', icon: '📊' },
    { id: 'source', name: 'School Events', icon: '🎓' },
    { id: 'about', name: 'About (EN/AR)', icon: '🌐' },
    { id: 'test', name: 'Test Message', icon: '📱' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'status':
        return <StatusTab />;
      case 'source':
        return <SourceTextTab />;
      case 'about':
        return <AboutTextTab />;
      case 'test':
        return <TestMessageTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <StatusTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Bot Admin Dashboard</h1>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

