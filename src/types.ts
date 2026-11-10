export interface EvaluationItem {
  id: string;
  createdAt: number;
  deviceFingerprint?: string;
  scores: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
  };
  overallScore: number;
  feedback?: string;
}

export interface QuestionMeta {
  id: 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
  title: string;
  description?: string;
}

export const WORKSHOP_QUESTIONS: QuestionMeta[] = [
  { id: 'q1', title: '1. ความรู้ความสามารถและเทคนิคการถ่ายทอดของวิทยากร', description: 'ความชัดเจนในการอธิบายและการตอบข้อซักถาม' },
  { id: 'q2', title: '2. ความตรงประเด็น ความครบถ้วน และความทันสมัยของเนื้อหา', description: 'เนื้อหาตอบโจทย์วัตถุประสงค์และเข้าใจง่าย' },
  { id: 'q3', title: '3. สื่อ เอกสาร และตัวอย่างที่ใช้ประกอบการบรรยาย', description: 'สไลด์ ตัวอย่างโค้ด/กรณีศึกษา ช่วยเสริมความเข้าใจ' },
  { id: 'q4', title: '4. การบริหารเวลาและบรรยากาศการมีส่วนร่วมในการอบรม', description: 'การจัดสรรเวลาเหมาะสม บรรยากาศเป็นกันเอง' },
  { id: 'q5', title: '5. ประโยชน์และความคุ้มค่าในการนำไปประยุกต์ใช้จริง', description: 'สามารถนำความรู้ไปต่อยอดกับงานหรือการเรียนได้' },
];

export interface LikertInterpretation {
  label: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
}

export const LIKERT_LEVELS: LikertInterpretation[] = [
  {
    label: 'มากที่สุด',
    min: 4.51,
    max: 5.00,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-700',
    description: 'ผลการดำเนินงานอยู่ในระดับยอดเยี่ยม',
  },
  {
    label: 'มาก',
    min: 3.51,
    max: 4.50,
    color: 'teal',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-300',
    textColor: 'text-teal-700',
    description: 'ผลการดำเนินงานเป็นที่พึงพอใจอย่างดี',
  },
  {
    label: 'ปานกลาง',
    min: 2.51,
    max: 3.50,
    color: 'amber',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-800',
    description: 'ผลการดำเนินงานอยู่ในเกณฑ์ยอมรับได้',
  },
  {
    label: 'น้อย',
    min: 1.51,
    max: 2.50,
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    textColor: 'text-orange-800',
    description: 'มีประเด็นที่ควรปรับปรุงอย่างเห็นได้ชัด',
  },
  {
    label: 'น้อยที่สุด',
    min: 1.00,
    max: 1.50,
    color: 'rose',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    textColor: 'text-rose-700',
    description: 'ต้องได้รับการแก้ไขปรับปรุงอย่างเร่งด่วน',
  },
];

export function getLikertInterpretation(score: number): LikertInterpretation {
  if (score >= 4.51) return LIKERT_LEVELS[0];
  if (score >= 3.51) return LIKERT_LEVELS[1];
  if (score >= 2.51) return LIKERT_LEVELS[2];
  if (score >= 1.51) return LIKERT_LEVELS[3];
  return LIKERT_LEVELS[4];
}
