import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { WORKSHOP_QUESTIONS } from '../types';
import { CheckCircle2, Send, RotateCcw, Sparkles, MessageSquare, ShieldCheck, HeartHandshake } from 'lucide-react';

interface SurveyViewProps {
  onSubmitted?: () => void;
  standaloneUrl?: string;
}

const SCORE_LABELS = [
  { score: 1, label: 'ปรับปรุง', emoji: '😞', ring: 'ring-rose-400', activeBg: 'bg-rose-50 border-rose-400 text-rose-700' },
  { score: 2, label: 'พอใช้', emoji: '😐', ring: 'ring-orange-400', activeBg: 'bg-orange-50 border-orange-400 text-orange-700' },
  { score: 3, label: 'ปานกลาง', emoji: '🙂', ring: 'ring-amber-400', activeBg: 'bg-amber-50 border-amber-400 text-amber-800' },
  { score: 4, label: 'ดี', emoji: '😊', ring: 'ring-emerald-400', activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-700' },
  { score: 5, label: 'ดีมากที่สุด', emoji: '🤩', ring: 'ring-indigo-500', activeBg: 'bg-indigo-50 border-indigo-500 text-indigo-700' },
];

export const SurveyView: React.FC<SurveyViewProps> = ({ onSubmitted }) => {
  const [scores, setScores] = useState<Record<string, number>>({
    q1: 5,
    q2: 5,
    q3: 5,
    q4: 5,
    q5: 5,
  });
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);

  const STORAGE_KEY = 'workshop_evaluation_status';

  // Check if device already answered
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setIsSubmitted(true);
        setSubmittedAt(parsed.timestamp || Date.now());
      } catch {
        setIsSubmitted(true);
      }
    }
  }, []);

  const handleScoreChange = (qid: string, score: number) => {
    setScores((prev) => ({ ...prev, [qid]: score }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores,
          feedback: feedback.trim(),
          deviceFingerprint: `device-${Math.random().toString(36).substring(2, 9)}`,
        }),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถส่งผลการประเมินได้');
      }

      // Confetti effect
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.65 },
      });

      // Save to localStorage to prevent multiple submissions
      const now = Date.now();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          submitted: true,
          timestamp: now,
          scores,
        })
      );

      setIsSubmitted(true);
      setSubmittedAt(now);
      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + (err.message || 'โปรดลองอีกครั้ง'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForTesting = () => {
    if (confirm('ต้องการล้างสถานะเพื่อทดสอบการตอบแบบสอบถามอีกครั้งใช่หรือไม่?')) {
      localStorage.removeItem(STORAGE_KEY);
      setIsSubmitted(false);
      setScores({ q1: 5, q2: 5, q3: 5, q4: 5, q5: 5 });
      setFeedback('');
    }
  };

  // Screen when already submitted
  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto w-full py-8 px-4 animate-fade-in">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />
          
          <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-5 text-emerald-600 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">ส่งแบบประเมินเรียบร้อยแล้ว</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            ขอบคุณที่ร่วมเป็นส่วนหนึ่งในการประเมินและพัฒนาการจัดอบรมในครั้งนี้ ความคิดเห็นของท่านถูกส่งไปยังหน้าจอ Dashboard เรียบร้อยแล้วครับ
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 mb-6 space-y-2 text-left">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ระบบป้องกันการตอบซ้ำ (Duplicate Protection Active)</span>
            </div>
            <p className="text-slate-500">
              อุปกรณ์เครื่องนี้ได้ทำการส่งข้อมูลแล้วเมื่อ{' '}
              {submittedAt ? new Date(submittedAt).toLocaleTimeString('th-TH') : 'ก่อนหน้านี้'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={handleResetForTesting}
              type="button"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition active:scale-95 border border-slate-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>(สำหรับผู้จัด/ทดสอบ) ตอบใหม่อีกครั้ง</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full py-5 px-4 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/90 border border-indigo-200/90 rounded-3xl p-5 sm:p-6 mb-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            เปิดรับการประเมิน
          </span>
          <span className="text-xs text-slate-500 font-medium">ไม่ระบุตัวตน 100%</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 tracking-tight">
          แบบประเมินความพึงพอใจการอบรม
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          โปรดเลือกคะแนนความพึงพอใจในแต่ละข้อ (1 = ปรับปรุง ถึง 5 = ดีมากที่สุด) ข้อมูลจะอัปเดตขึ้นจอทันที
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {WORKSHOP_QUESTIONS.map((q, idx) => {
          const currentScore = scores[q.id] || 5;
          return (
            <div
              key={q.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs transition hover:border-slate-300"
            >
              <div className="flex items-start gap-2.5 mb-3.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5 border border-indigo-200">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {q.title}
                  </h3>
                  {q.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{q.description}</p>
                  )}
                </div>
              </div>

              {/* 5 Big Buttons */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {SCORE_LABELS.map((item) => {
                  const isSelected = currentScore === item.score;
                  return (
                    <button
                      key={item.score}
                      type="button"
                      onClick={() => handleScoreChange(q.id, item.score)}
                      className={`relative flex flex-col items-center justify-center py-2.5 sm:py-3 px-1 rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer ${
                        isSelected
                          ? `${item.activeBg} font-bold ring-2 ${item.ring} shadow-xs scale-[1.03]`
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl mb-1">{item.emoji}</span>
                      <span className="text-sm font-bold">{item.score}</span>
                      <span className="text-[10px] sm:text-[11px] leading-tight text-center mt-0.5 opacity-90 line-clamp-1">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Feedback Textarea */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <label htmlFor="feedback" className="text-sm font-semibold text-slate-900">
              ข้อเสนอแนะเพิ่มเติมสำหรับวิทยากรและผู้จัด <span className="text-slate-400 text-xs font-normal">(ไม่บังคับ)</span>
            </label>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            สิ่งที่ท่านประทับใจ หรือหัวข้อที่ต้องการให้จัดเพิ่มเติมในครั้งถัดไป
          </p>
          <textarea
            id="feedback"
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="พิมพ์ข้อเสนอแนะหรือความประทับใจได้ที่นี่..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>กำลังบันทึกคะแนน...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>ส่งผลการประเมินความพึงพอใจ</span>
              <Sparkles className="w-4 h-4 text-amber-200" />
            </>
          )}
        </button>

        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-2">
          <HeartHandshake className="w-3.5 h-3.5 text-slate-400" />
          <span>ขอบคุณทุกความคิดเห็นเพื่อการพัฒนาโครงการอบรมให้ดียิ่งขึ้น</span>
        </div>
      </form>
    </div>
  );
};
