import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// In-memory store with realistic initial seed
let evaluations: EvaluationItem[] = [
  {
    id: 'eval-1',
    createdAt: Date.now() - 1000 * 60 * 18,
    scores: { q1: 5, q2: 5, q3: 4, q4: 5, q5: 5 },
    overallScore: 4.8,
    feedback: 'วิทยากรอธิบายเข้าใจง่ายมาก มี Workshop ให้ลงมือทำจริง สนุกและได้ความรู้เต็มที่ครับ',
  },
  {
    id: 'eval-2',
    createdAt: Date.now() - 1000 * 60 * 12,
    scores: { q1: 5, q2: 4, q3: 5, q4: 4, q5: 5 },
    overallScore: 4.6,
    feedback: 'สไลด์สวยงาม เนื้อหากระชับ สามารถนำเทคนิคไปปรับใช้กับงานโปรเจกต์วันพรุ่งนี้ได้เลย',
  },
  {
    id: 'eval-3',
    createdAt: Date.now() - 1000 * 60 * 6,
    scores: { q1: 4, q2: 5, q3: 4, q4: 5, q5: 4 },
    overallScore: 4.4,
    feedback: 'บรรยากาศดีเป็นกันเอง อยากให้มีคอร์สขั้นสูง (Advanced) เพิ่มเติมอีกครับ',
  },
  {
    id: 'eval-4',
    createdAt: Date.now() - 1000 * 60 * 2,
    scores: { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5 },
    overallScore: 5.0,
    feedback: 'ยอดเยี่ยมมากครับ จัดเวลาได้ดี อาหารว่างอร่อย ทีมงานซัพพอร์ตดีเยี่ยม',
  },
];

// SSE Clients for instant push updates
const sseClients = new Set<Response>();

function broadcastUpdate() {
  const payload = JSON.stringify({
    type: 'UPDATE',
    evaluations,
    timestamp: Date.now(),
  });
  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/evaluations', (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: evaluations,
      count: evaluations.length,
    });
  });

  app.post('/api/evaluations', (req: Request, res: Response) => {
    const { scores, feedback, deviceFingerprint } = req.body;

    if (!scores || typeof scores !== 'object') {
      res.status(400).json({ error: 'กรุณากรอกคะแนนประเมินให้ครบถ้วน' });
      return;
    }

    const q1 = Number(scores.q1) || 5;
    const q2 = Number(scores.q2) || 5;
    const q3 = Number(scores.q3) || 5;
    const q4 = Number(scores.q4) || 5;
    const q5 = Number(scores.q5) || 5;

    const validatedScores = {
      q1: Math.min(5, Math.max(1, q1)),
      q2: Math.min(5, Math.max(1, q2)),
      q3: Math.min(5, Math.max(1, q3)),
      q4: Math.min(5, Math.max(1, q4)),
      q5: Math.min(5, Math.max(1, q5)),
    };

    const overallScore = Number(
      ((validatedScores.q1 + validatedScores.q2 + validatedScores.q3 + validatedScores.q4 + validatedScores.q5) / 5).toFixed(2)
    );

    const newEvaluation: EvaluationItem = {
      id: `eval-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      deviceFingerprint: deviceFingerprint || undefined,
      scores: validatedScores,
      overallScore,
      feedback: typeof feedback === 'string' ? feedback.trim() : '',
    };

    evaluations.unshift(newEvaluation);
    broadcastUpdate();

    res.status(201).json({
      success: true,
      data: newEvaluation,
      totalCount: evaluations.length,
    });
  });

  // Server-Sent Events stream for Real-Time Projector Dashboard
  app.get('/api/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send initial snapshot
    res.write(
      `data: ${JSON.stringify({
        type: 'INITIAL_STATE',
        evaluations,
        timestamp: Date.now(),
      })}\n\n`
    );

    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // Reset evaluations (for starting a new workshop)
  app.post('/api/reset', (_req: Request, res: Response) => {
    evaluations = [];
    broadcastUpdate();
    res.json({ success: true, message: 'ล้างข้อมูลการประเมินเรียบร้อยแล้ว' });
  });

  // Seed sample data for testing projector display
  app.post('/api/seed', (req: Request, res: Response) => {
    const sampleComments = [
      'เนื้อหาดีมาก วิทยากรมีเทคนิคถ่ายทอดที่เข้าใจง่าย นำไปใช้ได้ทันที',
      'อยากให้ขยายเวลาช่วง workshop เพิ่มอีกนิดครับ สนุกมาก',
      'เอกสารและการเตรียมงานพร้อมมาก ทีมงานดูแลดีครับ',
      'ประทับใจตัวอย่างจริงที่ยกมาสาธิต ทำให้เห็นภาพชัดเจน',
      'ได้ไอเดียไปปรับใช้กับงานในองค์กรเยอะมาก ขอบคุณครับ',
      'บรรยากาศการเรียนรู้สนุก ไม่น่าเบื่อเลย',
      'ชอบที่มีแบบฝึกหัดให้ลงมือทำจริง',
      'การจัดลำดับเนื้อหาเป็นขั้นตอนดีมาก ตอบคำถามได้เคลียร์ทุกข้อ',
    ];

    const count = Number(req.body?.count) || 5;
    for (let i = 0; i < count; i++) {
      const q1 = Math.floor(Math.random() * 2) + 4; // 4 or 5
      const q2 = Math.floor(Math.random() * 3) + 3; // 3, 4, 5
      const q3 = Math.floor(Math.random() * 2) + 4;
      const q4 = Math.floor(Math.random() * 2) + 4;
      const q5 = Math.floor(Math.random() * 2) + 4;
      const overall = Number(((q1 + q2 + q3 + q4 + q5) / 5).toFixed(2));

      evaluations.unshift({
        id: `eval-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now() - i * 1000 * 45,
        scores: { q1, q2, q3, q4, q5 },
        overallScore: overall,
        feedback: Math.random() > 0.3 ? sampleComments[Math.floor(Math.random() * sampleComments.length)] : '',
      });
    }

    broadcastUpdate();
    res.json({ success: true, count: evaluations.length });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Live Workshop Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
