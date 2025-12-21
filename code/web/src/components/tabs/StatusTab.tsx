import React, { useState, useEffect } from 'react';

interface StatusData {
  whatsapp: {
    ready: boolean;
    connected: boolean;
  };
  timestamp: string;
}

const StatusTab: React.FC = () => {
  const [status, setStatus] = useState<StatusData>({ whatsapp: { ready: false, connected: false }, timestamp: new Date().toISOString() });
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    fetchStatus();
    // Refresh every 5 seconds
    const interval = setInterval(() => {
      fetchStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/status', {
        headers: {
          'Authorization': 'Basic ' + btoa('admin:change-me')
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setUseMockData(false);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
      // Use mock data when backend is not available
      setUseMockData(true);
      setStatus({
        whatsapp: { ready: false, connected: false },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <div className="text-center py-8">Loading status...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">System Status</h2>
      
      {/* Demo Info Banner */}
      {useMockData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Demo Mode Active</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p><strong>Backend server is not running.</strong> To start the bot:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Add your OpenAI API key to <code className="bg-blue-100 px-1 rounded">.env</code> file</li>
                  <li>Run <code className="bg-blue-100 px-1 rounded">npm run dev</code> in terminal</li>
                  <li><strong>Check the terminal</strong> - QR code will appear there</li>
                  <li>Scan the QR code from terminal with WhatsApp mobile app</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-900">WhatsApp Status</h3>
          <div className="mt-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              status.whatsapp.ready ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {status.whatsapp.ready ? '✅ Connected' : '❌ Disconnected'}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Last Updated</h3>
          <p className="text-sm text-gray-600">{new Date(status.timestamp).toLocaleString()}</p>
        </div>
      </div>
      
      {!status.whatsapp.ready && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">WhatsApp Connection</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">QR Code Location</h4>
                <div className="mt-2 text-sm text-blue-700">
                  <p>The QR code appears in your <strong>terminal/console</strong> when the server starts.</p>
                  <p className="mt-2">📱 <strong>To connect:</strong></p>
                  <ol className="list-decimal list-inside mt-1 space-y-1 ml-4">
                    <li>Look at the terminal where you ran <code className="bg-blue-100 px-1 rounded">npm run dev</code></li>
                    <li>Find the QR code displayed in the terminal</li>
                    <li>Open WhatsApp → Settings → Linked Devices → Link a Device</li>
                    <li>Scan the QR code from the terminal</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {status.whatsapp.ready && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                ✅ WhatsApp Web Connected
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your WhatsApp bot is ready to receive messages!</p>
                <p className="mt-1">Try sending: <code className="bg-green-100 px-1 rounded">about</code> or <code className="bg-green-100 px-1 rounded">عن</code></p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={() => { fetchStatus(); }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          🔄 Refresh Status
        </button>
        {useMockData && (
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-4 py-2 flex items-center">
            <span className="text-sm text-gray-600">
              💡 Tip: Check terminal for QR code and server status
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusTab;

