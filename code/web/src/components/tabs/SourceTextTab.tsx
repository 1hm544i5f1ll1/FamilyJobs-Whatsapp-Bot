import React, { useState, useEffect } from 'react';

const SourceTextTab: React.FC = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSourceText();
  }, []);

  const fetchSourceText = async () => {
    try {
      const response = await fetch('/api/admin/source', {
        headers: {
          'Authorization': 'Basic ' + btoa('admin:change-me')
        }
      });
      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching source text:', error);
      // Use mock data when backend is not available
      setContent(`School Events and Activities - Family Jobs Egypt

UPCOMING SCHOOL EVENTS:

🎓 Graduation Ceremony 2024
- Date: June 15, 2024
- Time: 10:00 AM - 2:00 PM
- Location: Assiut University Main Hall
- Dress Code: Formal attire required
- RSVP: Required by June 1st

📚 Career Fair 2024
- Date: July 20-22, 2024
- Time: 9:00 AM - 5:00 PM
- Location: Assiut Convention Center
- Companies: 50+ employers participating
- Registration: Free for students

🎯 Job Interview Workshop
- Date: August 10, 2024
- Time: 2:00 PM - 4:00 PM
- Location: Family Jobs Egypt Office
- Topics: Resume writing, interview tips, professional skills
- Cost: Free for registered students

📖 Study Abroad Information Session
- Date: September 5, 2024
- Time: 6:00 PM - 8:00 PM
- Location: Online via Zoom
- Countries: USA, UK, Germany, Canada
- Scholarships: Available for qualified students

🏆 Student Achievement Awards
- Date: October 12, 2024
- Time: 7:00 PM - 9:00 PM
- Location: Assiut Cultural Center
- Categories: Academic excellence, community service, leadership
- Nominations: Open until September 30th

📱 How to Register:
- WhatsApp: Send your name and event interest
- Email: events@familyjobsegypt.com
- Phone: Call our office during business hours
- Website: www.familyjobsegypt.com/events

💡 Tips for Students:
- Always arrive 15 minutes early
- Bring your student ID
- Dress appropriately for each event
- Prepare questions in advance
- Follow up after events

For more information about any school event, just ask!`);
    } finally {
      setLoading(false);
    }
  };

  const saveSourceText = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/source', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:change-me')
        },
        body: JSON.stringify({ content })
      });
      if (response.ok) {
        setMessage('Source text updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error updating source text');
      }
    } catch (error) {
      setMessage('Error updating source text');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading source text...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">School Events Management</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          School Events Content (for ChatGPT responses)
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter school events content..."
        />
      </div>
      {message && (
        <div className={`px-4 py-3 rounded ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}
      <button
        onClick={saveSourceText}
        disabled={saving}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save School Events'}
      </button>
    </div>
  );
};

export default SourceTextTab;

