import React, { useState } from 'react';

const TestMessageTab: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');

  const sendTestMessage = async () => {
    if (!phoneNumber || !message) {
      setResult('Please fill in both fields');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/admin/test-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:change-me')
        },
        body: JSON.stringify({ phoneNumber, message })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.message || 'Message sent successfully!');
        setPhoneNumber('');
        setMessage('');
      } else {
        const error = await response.json();
        const errorMsg = error.details 
          ? `${error.error}\n${error.details}` 
          : error.error;
        setResult(`Error: ${errorMsg}`);
      }
    } catch (error) {
      setResult(`Error: ${(error as Error).message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Send Test Message</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (with country code)
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+201234567890 or 201234567890"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Format: Include country code (e.g., +20 for Egypt). The contact must be saved in your WhatsApp.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter test message..."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {result && (
          <div className={`px-4 py-3 rounded whitespace-pre-line ${
            result.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {result}
          </div>
        )}
        <button
          onClick={sendTestMessage}
          disabled={sending}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send Test Message'}
        </button>
      </div>
    </div>
  );
};

export default TestMessageTab;

