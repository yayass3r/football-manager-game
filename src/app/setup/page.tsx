'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [dbUrl, setDbUrl] = useState('');
  const [testResult, setTestResult] = useState('');
  const [testing, setTesting] = useState(false);
  const [initResult, setInitResult] = useState('');
  const [initializing, setInitializing] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setTestResult('');
    try {
      const res = await fetch('/api/test-db-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: dbUrl }),
      });
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setTestResult('Error: ' + e.message);
    }
    setTesting(false);
  };

  const initializeDb = async () => {
    setInitializing(true);
    setInitResult('');
    try {
      const res = await fetch('/api/setup');
      const data = await res.json();
      setInitResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setInitResult('Error: ' + e.message);
    }
    setInitializing(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          ⚽ إعداد قاعدة بيانات نادي الاسطورة
        </h1>

        {/* Step 1: Database URL */}
        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h2 className="text-xl font-bold text-green-400 mb-4">
            الخطوة 1: الحصول على رابط قاعدة البيانات
          </h2>
          <ol className="space-y-3 text-gray-300 mb-4">
            <li>1. اذهب إلى <a href="https://supabase.com/dashboard/project/bzvvxdmbswtdvdrzjyay/settings/database" target="_blank" className="text-blue-400 underline">إعدادات قاعدة البيانات</a> في Supabase</li>
            <li>2. اضغط على &quot;Database&quot; في القائمة الجانبية</li>
            <li>3. ابحث عن قسم &quot;Connection string&quot;</li>
            <li>4. اختر &quot;Transaction Pooler&quot; أو &quot;Session Pooler&quot;</li>
            <li>5. انسخ رابط الاتصال (تأكد من استبدال كلمة المرور)</li>
          </ol>
          
          <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 mb-4">
            <p className="text-yellow-300 font-bold mb-2">⚠️ ملاحظة مهمة:</p>
            <p className="text-yellow-200 text-sm">
              تأكد من نسخ رابط الاتصال بالضبط كما هو ظاهر في لوحة التحكم. 
              بعض المشاريع تستخدم aws-0- والبعض يستخدم aws-1- في بداية الرابط.
              إذا ظهرت لك رسالة &quot;Tenant not found&quot; فالرابط خاطئ.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-gray-400">رابط قاعدة البيانات (DATABASE_URL):</label>
            <input
              type="text"
              value={dbUrl}
              onChange={(e) => setDbUrl(e.target.value)}
              placeholder="postgresql://postgres.bzvvxdmbswtdvdrzjyay:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500"
              dir="ltr"
            />
            <button
              onClick={testConnection}
              disabled={testing || !dbUrl}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              {testing ? '⏳ جاري الاختبار...' : '🔌 اختبار الاتصال'}
            </button>
            {testResult && (
              <pre className="bg-gray-800 rounded-lg p-3 text-xs overflow-auto max-h-40" dir="ltr">
                {testResult}
              </pre>
            )}
          </div>
        </div>

        {/* Step 2: Initialize Database */}
        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h2 className="text-xl font-bold text-green-400 mb-4">
            الخطوة 2: إنشاء جداول قاعدة البيانات
          </h2>
          <p className="text-gray-300 mb-4">
            بعد التأكد من أن رابط الاتصال يعمل، يمكنك إنشاء الجداول بطريقتين:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-bold text-purple-400 mb-2">الطريقة A: تلقائياً</h3>
              <p className="text-gray-400 text-sm mb-3">
                اضغط على الزر أدناه لإنشاء الجداول وتهيئة البيانات تلقائياً.
                يتطلب ذلك رابط اتصال يعمل (من الخطوة 1).
              </p>
              <button
                onClick={initializeDb}
                disabled={initializing}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors w-full"
              >
                {initializing ? '⏳ جاري التهيئة...' : '🚀 تهيئة قاعدة البيانات'}
              </button>
              {initResult && (
                <pre className="bg-gray-900 rounded-lg p-3 text-xs overflow-auto max-h-40 mt-3" dir="ltr">
                  {initResult}
                </pre>
              )}
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-bold text-orange-400 mb-2">الطريقة B: يدوياً</h3>
              <p className="text-gray-400 text-sm mb-3">
                إذا لم تعمل الطريقة التلقائية، يمكنك تشغيل السكريبت يدوياً:
              </p>
              <ol className="text-gray-400 text-sm space-y-2">
                <li>1. اذهب إلى <a href="https://supabase.com/dashboard/project/bzvvxdmbswtdvdrzjyay/sql/new" target="_blank" className="text-blue-400 underline">SQL Editor</a></li>
                <li>2. انسخ محتوى ملف <code className="bg-gray-700 px-1 rounded">supabase-init.sql</code></li>
                <li>3. الصقه في المحرر واضغط &quot;Run&quot;</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Step 3: Update Vercel */}
        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h2 className="text-xl font-bold text-green-400 mb-4">
            الخطوة 3: تحديث متغيرات البيئة على Vercel
          </h2>
          <p className="text-gray-300 mb-4">
            بعد الحصول على رابط الاتصال الصحيح، قم بتحديث متغيرات البيئة:
          </p>
          <ol className="text-gray-300 space-y-2">
            <li>1. اذهب إلى <a href="https://vercel.com/tvyas409/my-project/settings/environment-variables" target="_blank" className="text-blue-400 underline">إعدادات Vercel</a></li>
            <li>2. قم بتحديث DATABASE_URL بالرابط الصحيح</li>
            <li>3. قم بتحديث DIRECT_URL أيضاً (استخدم نفس الرابط مع المنفذ 5432)</li>
            <li>4. أعد نشر المشروع</li>
          </ol>
        </div>

        {/* SQL Script */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-green-400 mb-4">
            سكريبت التهيئة SQL
          </h2>
          <p className="text-gray-400 text-sm mb-3">
            انسخ هذا السكريبت وشغّله في Supabase SQL Editor إذا لم تعمل الطريقة التلقائية:
          </p>
          <button
            onClick={() => {
              fetch('/api/setup/sql').then(r => r.text()).then(sql => {
                navigator.clipboard.writeText(sql);
                alert('تم نسخ السكريبت!');
              });
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors mb-3"
          >
            📋 نسخ السكريبت
          </button>
        </div>
      </div>
    </div>
  );
}
