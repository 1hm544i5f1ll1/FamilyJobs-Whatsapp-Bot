import React, { useState, useEffect } from 'react';

const AboutTextTab: React.FC = () => {
  const [contentEn, setContentEn] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAboutText();
  }, []);

  const fetchAboutText = async () => {
    try {
      // Fetch both languages
      const [responseEn, responseAr] = await Promise.all([
        fetch('/api/admin/about/en', {
        headers: {
          'Authorization': 'Basic ' + btoa('admin:change-me')
        }
        }).catch(() => null),
        fetch('/api/admin/about/ar', {
          headers: {
            'Authorization': 'Basic ' + btoa('admin:change-me')
          }
        }).catch(() => null)
      ]);

      if (responseEn?.ok) {
        const data = await responseEn.json();
        setContentEn(data.content);
      } else {
        // Demo data for English
        setContentEn(`🤖 Family Jobs Egypt - School Events Assistant

Welcome! I'm your AI assistant for school events and activities.

I can help you with:
• Upcoming school events and dates
• Event registration and RSVP
• Career fair information
• Study abroad opportunities
• Student achievement programs
• Interview workshops and tips

I respond in both English and Arabic automatically based on your language preference.

Available 24/7 for all your school event questions!

Type "events" or "activities" to see upcoming events.`);
      }

      if (responseAr?.ok) {
        const data = await responseAr.json();
        setContentAr(data.content);
      } else {
        // Demo data for Arabic
        setContentAr(`🤖 عائلة الوظائف مصر - مساعد الأحداث المدرسية

مرحباً! أنا مساعدك الذكي للأحداث والأنشطة المدرسية.

يمكنني مساعدتك في:
• الأحداث المدرسية القادمة والتواريخ
• تسجيل الأحداث والتأكيد
• معلومات معرض الوظائف
• فرص الدراسة في الخارج
• برامج إنجازات الطلاب
• ورش عمل المقابلات والنصائح

أستجيب باللغتين العربية والإنجليزية تلقائياً حسب تفضيلك اللغوي.

متاح 24/7 لجميع أسئلتك حول الأحداث المدرسية!

اكتب "أحداث" أو "أنشطة" لرؤية الأحداث القادمة.`);
      }
    } catch (error) {
      console.error('Error fetching about text:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAboutText = async () => {
    setSaving(true);
    setMessage('');
    try {
      const [resultEn, resultAr] = await Promise.all([
        fetch('/api/admin/about/en', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('admin:change-me')
          },
          body: JSON.stringify({ content: contentEn })
        }).catch(() => ({ ok: false })),
        fetch('/api/admin/about/ar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:change-me')
        },
          body: JSON.stringify({ content: contentAr })
        }).catch(() => ({ ok: false }))
      ]);

      if (resultEn.ok && resultAr.ok) {
        setMessage('About text updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Note: Backend server not running. Changes saved locally only.');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage('Error updating about text');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading about text...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Demo Mode</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>This is demo information. Edit both languages below and save when backend is running.</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold">About Text - Bilingual (English & Arabic)</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* English Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            English Content 🇺🇸
          </label>
          <textarea
            value={contentEn}
            onChange={(e) => setContentEn(e.target.value)}
            className="w-full h-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Enter about text in English..."
          />
        </div>

        {/* Arabic Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Arabic Content 🇪🇬
        </label>
        <textarea
            value={contentAr}
            onChange={(e) => setContentAr(e.target.value)}
            className="w-full h-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            dir="rtl"
            placeholder="أدخل نص حول بالعربية..."
        />
        </div>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 
          message.includes('Note') ? 'bg-yellow-100 text-yellow-700' : 
          'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <div className="flex justify-end">
      <button
        onClick={saveAboutText}
        disabled={saving}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
          {saving ? 'Saving...' : 'Save Both Languages'}
      </button>
      </div>
    </div>
  );
};

export default AboutTextTab;

