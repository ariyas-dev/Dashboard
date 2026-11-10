import React, { useState } from 'react';
import { 
  FileCode2, 
  Download, 
  Copy, 
  Check, 
  Flame, 
  HelpCircle
} from 'lucide-react';

export const FirebaseGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'survey' | 'dashboard' | 'guide'>('guide');
  const [copiedSurvey, setCopiedSurvey] = useState(false);
  const [copiedDashboard, setCopiedDashboard] = useState(false);
  const [surveyCode, setSurveyCode] = useState<string>('');
  const [dashboardCode, setDashboardCode] = useState<string>('');

  // Fetch file content for preview and download
  React.useEffect(() => {
    fetch('/survey.html')
      .then((res) => res.text())
      .then((text) => setSurveyCode(text))
      .catch(() => {});

    fetch('/dashboard.html')
      .then((res) => res.text())
      .then((text) => setDashboardCode(text))
      .catch(() => {});
  }, []);

  const handleCopy = (text: string, type: 'survey' | 'dashboard') => {
    navigator.clipboard.writeText(text);
    if (type === 'survey') {
      setCopiedSurvey(true);
      setTimeout(() => setCopiedSurvey(false), 2000);
    } else {
      setCopiedDashboard(true);
      setTimeout(() => setCopiedDashboard(false), 2000);
    }
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-white to-amber-50/90 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            คู่มือการติดตั้ง & ซอร์สโค้ดแยก 2 ไฟล์
          </span>
          <span className="text-xs text-slate-500">Firebase Realtime Database (Free Tier)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          โค้ดแยก 2 ไฟล์ & วิธีตั้งค่า Firebase ทีละขั้นตอน
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          ตามคำขอ: โค้ดถูกเขียนแยกเป็น <code className="text-indigo-700 font-mono bg-slate-100 px-1.5 py-0.5 rounded font-semibold">survey.html</code> (หน้าตอบของผู้เข้าอบรม) 
          และ <code className="text-purple-700 font-mono bg-slate-100 px-1.5 py-0.5 rounded font-semibold">dashboard.html</code> (หน้าแสดงผลบนจอโปรเจกเตอร์) 
          พร้อมคู่มือตั้งค่า Firebase Console และ Deploy ฟรี 100%
        </p>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>ขั้นตอนการตั้งค่า & Deploy</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('survey')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'survey'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>ไฟล์ที่ 1: survey.html</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>ไฟล์ที่ 2: dashboard.html</span>
          </button>
        </div>
      </div>

      {/* Guide Tab */}
      {activeTab === 'guide' && (
        <div className="space-y-6 animate-fade-in">
          {/* Step 1: Firebase Project */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center flex-shrink-0 text-lg border border-indigo-200">
                1
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  สร้างโปรเจกต์บน Firebase Console (แพ็กเกจฟรี Spark Plan)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  1. เข้าไปที่เว็บ <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">https://console.firebase.google.com</a> แล้วเข้าสู่ระบบด้วย Google Account<br/>
                  2. คลิกปุ่ม <strong>"Add project"</strong> (สร้างโปรเจกต์ใหม่) ตั้งชื่อโปรเจกต์ เช่น <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-mono">workshop-eval-live</code><br/>
                  3. หน้า Google Analytics สามารถเลือกเปิดหรือปิดก็ได้ จากนั้นกด <strong>"Create project"</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Enable Realtime Database */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 font-extrabold flex items-center justify-center flex-shrink-0 text-lg border border-amber-200">
                2
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  เปิดใช้งาน Firebase Realtime Database
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  1. ในเมนูด้านซ้าย เลือก <strong>Build &gt; Realtime Database</strong><br/>
                  2. คลิกปุ่ม <strong>"Create Database"</strong><br/>
                  3. เลือกตำแหน่งเซิร์ฟเวอร์ (Realtime Database Location) แนะนำ <strong>Singapore (asia-southeast1)</strong> หรือ <strong>United States (us-central1)</strong><br/>
                  4. ในส่วน Security Rules ให้เลือก <strong>"Start in test mode"</strong> แล้วกด <strong>Enable</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Configure Security Rules */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center flex-shrink-0 text-lg border border-emerald-200">
                3
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  ตั้งค่า Security Rules เพื่อให้ตอบได้โดยไม่ต้องล็อกอิน
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  ไปที่แท็บ <strong>"Rules"</strong> ของ Realtime Database แล้ววาง JSON ตามนี้ เพื่อให้ผู้เข้าอบรมสามารถส่งคะแนนและหน้าจอ Dashboard อ่านคะแนนแบบสดๆ ได้ทันที:
                </p>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto shadow-xs">
                  <pre>{`{
  "rules": {
    "evaluations": {
      ".read": true,
      ".write": true,
      "$evaluation_id": {
        ".validate": "newData.hasChildren(['scores', 'overallScore', 'createdAt'])"
      }
    }
  }
}`}</pre>
                </div>
                <p className="text-xs text-slate-500">
                  เสร็จแล้วกดปุ่ม <strong>"Publish"</strong> ที่มุมขวาบน
                </p>
              </div>
            </div>
          </div>

          {/* Step 4: Copy firebaseConfig */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 font-extrabold flex items-center justify-center flex-shrink-0 text-lg border border-purple-200">
                4
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  คัดลอก Firebase Config มาใส่ใน survey.html และ dashboard.html
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  1. คลิกไอคอนฟันเฟือง ⚙️ ข้างคำว่า <strong>Project Overview</strong> &gt; เลือก <strong>Project settings</strong><br/>
                  2. เลื่อนลงมาล่างสุดที่หัวข้อ <strong>"Your apps"</strong> คลิกไอคอนเว็บ <strong>&lt;/&gt;</strong> (Web App)<br/>
                  3. ตั้งชื่อแอป เช่น <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-mono">workshop-app</code> แล้วกด Register<br/>
                  4. คัดลอก Object <code className="bg-slate-100 px-1.5 py-0.5 rounded text-amber-800 font-mono">firebaseConfig</code> นำไปวางแทนที่ตัวแปรในทั้ง 2 ไฟล์:
                </p>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto shadow-xs">
                  <pre>{`const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: Deploy Guide */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center flex-shrink-0 text-lg border border-teal-200">
                5
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  วิธี Deploy ขึ้น Firebase Hosting (ฟรี 100% ใช้งานได้ตลอดชีพ)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  วางไฟล์ทั้ง 2 ไว้ในโฟลเดอร์เดียวกัน เช่น <code className="bg-slate-100 px-1.5 py-0.5 rounded text-teal-700 font-mono">public/</code> แล้วรันคำสั่งต่อไปนี้ใน Terminal:
                </p>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-teal-300 space-y-1 overflow-x-auto shadow-xs">
                  <div><span className="text-slate-400"># 1. ติดตั้ง Firebase CLI</span></div>
                  <div>npm install -g firebase-tools</div>
                  <div className="pt-2"><span className="text-slate-400"># 2. ล็อกอิน Firebase</span></div>
                  <div>firebase login</div>
                  <div className="pt-2"><span className="text-slate-400"># 3. เริ่มต้นโปรเจกต์ (เลือก Hosting)</span></div>
                  <div>firebase init hosting</div>
                  <div className="pt-2"><span className="text-slate-400"># 4. ดีพลอยขึ้นระบบ</span></div>
                  <div>firebase deploy --only hosting</div>
                </div>
                <p className="text-xs text-emerald-700 font-semibold">
                  ✓ เมื่อเสร็จสิ้น คุณจะได้ URL สำหรับใช้งานจริง เช่น <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-900 font-mono">https://your-project.web.app/survey.html</code> และ <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-900 font-mono">https://your-project.web.app/dashboard.html</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Survey.html Code Viewer */}
      {activeTab === 'survey' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-indigo-700">survey.html</span>
                <span className="text-xs text-slate-500">หน้าตอบสำหรับมือถือผู้เข้าอบรม (Mobile-First)</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ปุ่มสเกล 1-5 ขนาดใหญ่ กดง่าย พร้อมระบบป้องกันตอบซ้ำด้วย localStorage และยิงพลุ Confetti
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(surveyCode, 'survey')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                {copiedSurvey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSurvey ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ดทั้งหมด'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('survey.html', surveyCode)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-xs shadow-indigo-600/30 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ดาวน์โหลด survey.html</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 font-mono text-xs text-slate-200 max-h-[600px] overflow-auto shadow-xs">
            <pre><code>{surveyCode || 'กำลังโหลดเนื้อหาโค้ด...'}</code></pre>
          </div>
        </div>
      )}

      {/* Dashboard.html Code Viewer */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-purple-700">dashboard.html</span>
                <span className="text-xs text-slate-500">หน้าแสดงผลสำหรับฉายขึ้นจอโปรเจกเตอร์ (Projector Ready)</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                คำนวณคะแนนเฉลี่ยเรียลไทม์, แปลผล Likert 5 ระดับ, กราฟแท่ง, แสดง QR Code อัตโนมัติ, ดาวน์โหลด CSV
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(dashboardCode, 'dashboard')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                {copiedDashboard ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDashboard ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ดทั้งหมด'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('dashboard.html', dashboardCode)}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-xs shadow-purple-600/30 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ดาวน์โหลด dashboard.html</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 font-mono text-xs text-slate-200 max-h-[600px] overflow-auto shadow-xs">
            <pre><code>{dashboardCode || 'กำลังโหลดเนื้อหาโค้ด...'}</code></pre>
          </div>
        </div>
      )}
    </div>
  );
};
