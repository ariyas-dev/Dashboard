import React, { useState } from 'react';
import QRCode from 'qrcode';
import { EvaluationItem, WORKSHOP_QUESTIONS, getLikertInterpretation } from '../types';
import { 
  Users, 
  Award, 
  TrendingUp, 
  Maximize, 
  Minimize, 
  Download, 
  Sparkles, 
  Trash2, 
  Share2, 
  MessageSquare, 
  ExternalLink,
  Flame
} from 'lucide-react';

interface DashboardViewProps {
  evaluations: EvaluationItem[];
  onSeedDemo: () => void;
  onReset: () => void;
  surveyUrl: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  evaluations,
  onSeedDemo,
  onReset,
  surveyUrl,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Generate QR Code data URL
  React.useEffect(() => {
    if (surveyUrl) {
      QRCode.toDataURL(surveyUrl, {
        width: 320,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [surveyUrl]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const totalCount = evaluations.length;

  // Calculate Overall Average
  const overallAvg = totalCount > 0
    ? Number((evaluations.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / totalCount).toFixed(2))
    : 0;

  const overallInterpretation = getLikertInterpretation(overallAvg);

  // Positive rating percentage (>= 4.0)
  const positiveCount = evaluations.filter((e) => (e.overallScore || 0) >= 4.0).length;
  const positivePercent = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0;

  // Question stats breakdown
  const questionStats = WORKSHOP_QUESTIONS.map((q) => {
    let sum = 0;
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    evaluations.forEach((item) => {
      const s = item.scores ? Number(item.scores[q.id]) || 5 : 5;
      sum += s;
      if (distribution[s] !== undefined) {
        distribution[s]++;
      }
    });

    const mean = totalCount > 0 ? Number((sum / totalCount).toFixed(2)) : 0;
    const interpretation = getLikertInterpretation(mean);

    return {
      ...q,
      mean,
      distribution,
      interpretation,
      percentage: Math.min(100, Math.max(0, (mean / 5) * 100)),
    };
  });

  // Recent comments with text
  const comments = evaluations
    .filter((e) => e.feedback && e.feedback.trim().length > 0)
    .sort((a, b) => b.createdAt - a.createdAt);

  // Export CSV with UTF-8 BOM
  const handleDownloadCsv = () => {
    if (evaluations.length === 0) {
      alert('ยังไม่มีข้อมูลการประเมินให้ดาวน์โหลด');
      return;
    }

    const headers = [
      'ลำดับ',
      'วันเวลา',
      'ข้อ 1 (วิทยากรและการถ่ายทอด)',
      'ข้อ 2 (ความตรงประเด็นของเนื้อหา)',
      'ข้อ 3 (สื่อและเอกสารประกอบ)',
      'ข้อ 4 (การบริหารเวลาและบรรยากาศ)',
      'ข้อ 5 (การนำไปประยุกต์ใช้)',
      'คะแนนเฉลี่ย',
      'ระดับความพึงพอใจ',
      'ข้อเสนอแนะเพิ่มเติม',
    ];

    const rows = evaluations.map((item, index) => {
      const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleString('th-TH') : '-';
      const q1 = item.scores ? item.scores.q1 : 5;
      const q2 = item.scores ? item.scores.q2 : 5;
      const q3 = item.scores ? item.scores.q3 : 5;
      const q4 = item.scores ? item.scores.q4 : 5;
      const q5 = item.scores ? item.scores.q5 : 5;
      const avg = item.overallScore ? Number(item.overallScore).toFixed(2) : '-';
      const interp = getLikertInterpretation(Number(avg)).label;
      const cleanComment = item.feedback ? `"${item.feedback.replace(/"/g, '""')}"` : '""';

      return [index + 1, `"${dateStr}"`, q1, q2, q3, q4, q5, avg, `"${interp}"`, cleanComment].join(',');
    });

    const csvString = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ผลประเมินความพึงพอใจ_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-6 animate-fade-in">
      {/* Top Projector Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 p-3.5 sm:p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>● REALTIME LIVE SYNC</span>
          </div>
          <span className="hidden sm:inline text-xs text-slate-500">
            อัปเดตผลลัพธ์อัตโนมัติทันทีที่มีผู้ส่งแบบประเมิน
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSeedDemo}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            title="เพิ่มข้อมูลตัวอย่าง 5 รายการเพื่อทดสอบการแสดงผลบนจอ"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">จำลองข้อมูล</span> (+5)
          </button>

          <button
            onClick={handleDownloadCsv}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>ดาวน์โหลด CSV</span>
          </button>

          <button
            onClick={toggleFullscreen}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'ย่อหน้าต่าง' : 'เต็มจอโปรเจกเตอร์'}</span>
          </button>

          <button
            onClick={onReset}
            type="button"
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 text-xs transition active:scale-95 cursor-pointer"
            title="ล้างข้อมูลทั้งหมดเพื่อเริ่มรอบใหม่"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main KPI Row (High Contrast for Projector) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Respondents */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              ผู้ตอบแบบสอบถาม
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              {totalCount}
            </span>
            <span className="text-slate-500 text-sm font-semibold">คน</span>
          </div>
          <div className="mt-3 text-xs text-emerald-600 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ระบบกำลังรอรับคำตอบ...</span>
          </div>
        </div>

        {/* Overall Mean Rating */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              คะแนนเฉลี่ยรวม
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-indigo-600 tracking-tight">
              {overallAvg > 0 ? overallAvg.toFixed(2) : '0.00'}
            </span>
            <span className="text-slate-400 text-sm font-bold">/ 5.00</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            เฉลี่ยถ่วงน้ำหนักครบทั้ง 5 ด้าน
          </div>
        </div>

        {/* Likert Scale Interpretation Badge */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              ระดับความพึงพอใจ
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            {totalCount > 0 ? (
              <span
                className={`inline-block px-3.5 py-1.5 rounded-2xl text-lg sm:text-2xl font-black border ${overallInterpretation.bgColor} ${overallInterpretation.borderColor} ${overallInterpretation.textColor} shadow-xs`}
              >
                {overallInterpretation.label}
              </span>
            ) : (
              <span className="inline-block px-3.5 py-1.5 rounded-2xl text-lg font-bold bg-slate-100 text-slate-500 border border-slate-200">
                รอข้อมูล...
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            ตามเกณฑ์ Likert 5 ระดับ (Best & Kahn)
          </div>
        </div>

        {/* Positive Satisfaction Rate */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              สัดส่วนพึงพอใจเชิงบวก
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-emerald-600 tracking-tight">
              {positivePercent}%
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            สัดส่วนผู้ให้คะแนนระดับ ดี - ดีมาก
          </div>
        </div>
      </div>

      {/* Main Grid: Left Charts + Right QR & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 5 Questions Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  ผลคะแนนเฉลี่ยรายข้อ (สเกล 1 - 5)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  จำแนกตามองค์ประกอบ 5 ด้านของการจัดอบรม
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" />
                <span>คะแนนเต็ม 5.00</span>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3.5">
              {questionStats.map((q) => (
                <div
                  key={q.id}
                  className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="text-sm font-semibold text-slate-900 flex-1 min-w-[200px]">
                      {q.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-lg font-bold border ${q.interpretation.bgColor} ${q.interpretation.borderColor} ${q.interpretation.textColor}`}
                      >
                        {totalCount > 0 ? q.interpretation.label : '-'}
                      </span>
                      <span className="text-base font-extrabold text-slate-900">
                        {totalCount > 0 ? q.mean.toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>

                  {/* Animated Bar */}
                  <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 transition-all duration-700 ease-out shadow-xs"
                      style={{ width: `${totalCount > 0 ? q.percentage : 0}%` }}
                    />
                  </div>

                  {/* Mini Score Counts Breakdown (5, 4, 3, 2, 1) */}
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">การกระจายคะแนน:</span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="flex items-center gap-1">
                        <span className="text-indigo-600 font-bold">5★</span> {q.distribution[5]}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-emerald-600 font-bold">4★</span> {q.distribution[4]}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-amber-600 font-bold">3★</span> {q.distribution[3]}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-orange-600 font-bold">2★</span> {q.distribution[2]}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-rose-600 font-bold">1★</span> {q.distribution[1]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Criteria Reference */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="font-semibold text-slate-700 mb-2">เกณฑ์การแปลความหมายคะแนนเฉลี่ย:</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                <span className="text-emerald-700 font-bold">4.51 - 5.00</span>
                <div className="text-emerald-900 font-semibold mt-0.5">มากที่สุด</div>
              </div>
              <div className="bg-teal-50/80 p-2 rounded-xl border border-teal-200">
                <span className="text-teal-700 font-bold">3.51 - 4.50</span>
                <div className="text-teal-900 font-semibold mt-0.5">มาก</div>
              </div>
              <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                <span className="text-amber-700 font-bold">2.51 - 3.50</span>
                <div className="text-amber-900 font-semibold mt-0.5">ปานกลาง</div>
              </div>
              <div className="bg-orange-50/80 p-2 rounded-xl border border-orange-200">
                <span className="text-orange-700 font-bold">1.51 - 2.50</span>
                <div className="text-orange-900 font-semibold mt-0.5">น้อย</div>
              </div>
              <div className="bg-rose-50/80 p-2 rounded-xl border border-rose-200">
                <span className="text-rose-700 font-bold">1.00 - 1.50</span>
                <div className="text-rose-900 font-semibold mt-0.5">น้อยที่สุด</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: QR Code + Live Feed */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          {/* Big Projector QR Code Card */}
          <div className="bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/90 border border-indigo-200/90 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-white p-3 rounded-2xl shadow-sm flex-shrink-0 flex items-center justify-center border-2 border-indigo-200">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code สำหรับสแกนตอบแบบประเมิน"
                  className="w-36 h-36 object-contain"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-slate-500 text-xs">
                  กำลังสร้าง QR...
                </div>
              )}
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 mb-2">
                📱 สแกนเพื่อร่วมประเมิน
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 leading-snug">
                สแกนผ่านมือถือได้ทันที
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                ไม่ต้องดาวน์โหลดแอป ไม่ต้องล็อกอิน คะแนนจะขึ้นบนหน้าจอนี้แบบสดๆ
              </p>
              
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <a
                  href={surveyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-600/30 transition cursor-pointer"
                >
                  <span>เปิดหน้าตอบ</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(surveyUrl);
                    alert('คัดลอกลิงก์แบบสอบถามเรียบร้อยแล้ว: ' + surveyUrl);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300 transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>คัดลอกลิงก์</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Recent Feedback Stream */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex-1 flex flex-col min-h-[320px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">ข้อเสนอแนะล่าสุด</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-indigo-700 font-bold border border-slate-200">
                  {comments.length}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">อัปเดตแบบเรียลไทม์</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1 flex-1">
              {comments.length > 0 ? (
                comments.map((c) => {
                  const diffMinutes = Math.round((Date.now() - c.createdAt) / 60000);
                  const timeText = diffMinutes <= 1 ? 'เมื่อสักครู่' : `${diffMinutes} นาทีที่แล้ว`;

                  return (
                    <div
                      key={c.id}
                      className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 text-xs transition hover:border-slate-300"
                    >
                      <p className="text-slate-800 leading-relaxed font-medium mb-2">
                        "{c.feedback}"
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                        <span className="flex items-center gap-1">
                          คะแนนเฉลี่ย: <span className="text-indigo-600 font-bold">{c.overallScore.toFixed(2)}</span> / 5
                        </span>
                        <span className="text-slate-400">{timeText}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center text-slate-400">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-30 text-slate-400" />
                  <p className="text-xs">ยังไม่มีข้อเสนอแนะเพิ่มเติม</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ข้อเสนอแนะที่ผู้ตอบพิมพ์จะปรากฏที่นี่ทันที
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
