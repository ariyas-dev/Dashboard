import React, { useState, useEffect } from 'react';
import { EvaluationItem } from './types';
import { SurveyView } from './components/SurveyView';
import { DashboardView } from './components/DashboardView';
import { FirebaseGuideView } from './components/FirebaseGuideView';
import { 
  Smartphone, 
  Tv2, 
  FileCode, 
  Share2, 
  Sparkles,
  QrCode as QrIcon,
  X
} from 'lucide-react';
import QRCode from 'qrcode';

export default function App() {
  const [activeTab, setActiveTab] = useState<'survey' | 'dashboard' | 'code'>('dashboard');
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [modalQrUrl, setModalQrUrl] = useState('');

  // Determine initial view from URL param (?view=survey or ?view=dashboard)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'survey') {
      setActiveTab('survey');
    } else if (viewParam === 'dashboard') {
      setActiveTab('dashboard');
    } else if (viewParam === 'code') {
      setActiveTab('code');
    }
  }, []);

  // Compute survey URL for attendees
  const surveyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?view=survey`
    : '';

  // Generate QR code for floating modal
  useEffect(() => {
    if (surveyUrl) {
      QRCode.toDataURL(surveyUrl, {
        width: 380,
        margin: 1.5,
        color: { dark: '#0f172a', light: '#ffffff' },
      })
        .then((url) => setModalQrUrl(url))
        .catch(() => {});
    }
  }, [surveyUrl]);

  // Connect to SSE Live Stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let fallbackInterval: any = null;

    const fetchInitial = async () => {
      try {
        const res = await fetch('/api/evaluations');
        const json = await res.json();
        if (json.data) {
          setEvaluations(json.data);
        }
      } catch (err) {
        console.warn('Initial fetch error:', err);
      }
    };

    fetchInitial();

    try {
      eventSource = new EventSource('/api/stream');
      eventSource.onopen = () => {
        setIsLiveConnected(true);
      };
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.evaluations) {
            setEvaluations(data.evaluations);
          }
        } catch {
          // ignore parsing error
        }
      };
      eventSource.onerror = () => {
        setIsLiveConnected(false);
        // Start polling fallback if SSE fails
        if (!fallbackInterval) {
          fallbackInterval = setInterval(fetchInitial, 4000);
        }
      };
    } catch {
      fallbackInterval = setInterval(fetchInitial, 4000);
    }

    return () => {
      if (eventSource) eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, []);

  // Handlers for Demo seed and Reset
  const handleSeedDemo = async () => {
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 5 }),
      });
      const data = await res.json();
      if (data.success) {
        // Triggered via SSE or local state update
        const evRes = await fetch('/api/evaluations');
        const evJson = await evRes.json();
        if (evJson.data) setEvaluations(evJson.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetData = async () => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลการประเมินทั้งหมดเพื่อเริ่มรอบใหม่?')) {
      try {
        await fetch('/api/reset', { method: 'POST' });
        setEvaluations([]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-['Prompt',sans-serif] selection:bg-indigo-500 selection:text-white">
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Live Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base tracking-tight">
                  Live Workshop Evaluation
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {isLiveConnected ? 'REALTIME LIVE' : 'SYNC READY'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                ระบบประเมินความพึงพอใจการอบรม & Dashboard สรุปผลบนจอ
              </p>
            </div>
          </div>

          {/* Center Tabs Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('survey')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'survey'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>หน้าแบบสอบถาม</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Tv2 className="w-3.5 h-3.5" />
              <span>จอ Dashboard</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>โค้ดแยก 2 ไฟล์ & Firebase</span>
            </button>
          </div>

          {/* Quick QR & Share Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <QrIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">สแกน QR ผู้เข้าอบรม</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col justify-start">
        {activeTab === 'survey' && (
          <SurveyView
            onSubmitted={() => {
              // optional callback
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            evaluations={evaluations}
            onSeedDemo={handleSeedDemo}
            onReset={handleResetData}
            surveyUrl={surveyUrl}
          />
        )}

        {activeTab === 'code' && <FirebaseGuideView />}
      </main>

      {/* Persistent Footer */}
      <footer className="border-t border-slate-200 bg-white/80 px-6 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>ระบบประเมินความพึงพอใจการอบรม • Likert Scale 5 ระดับ • ป้องกันการตอบซ้ำ</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className="hover:text-indigo-600 underline transition cursor-pointer"
          >
            ดาวน์โหลดไฟล์ HTML แยก & คู่มือ Firebase
          </button>
          <span>|</span>
          <a
            href="/survey.html"
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-600 underline transition"
          >
            เปิด standalone survey.html ↗
          </a>
        </div>
      </footer>

      {/* Floating Big QR Code Modal for Stage/Projector display */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-indigo-100">
              <QrIcon className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1">
              สแกน QR เพื่อทำแบบประเมิน
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              ผู้เข้าอบรมสามารถใช้กล้องมือถือสแกนภาพนี้เพื่อเข้าสู่หน้าแบบสอบถามได้ทันที
            </p>

            <div className="bg-slate-50 p-4 rounded-3xl inline-block shadow-md border-2 border-indigo-200 mb-6">
              {modalQrUrl ? (
                <img
                  src={modalQrUrl}
                  alt="QR Code สำหรับผู้เข้าอบรม"
                  className="w-56 h-56 object-contain mx-auto"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-600 text-xs">
                  กำลังสร้าง QR Code...
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-indigo-700 break-all select-all font-medium">
                {surveyUrl}
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(surveyUrl);
                    alert('คัดลอกลิงก์แบบประเมินเรียบร้อยแล้ว: ' + surveyUrl);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm shadow-indigo-600/30 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>คัดลอกลิงก์</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
