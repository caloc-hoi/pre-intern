import express from 'express';
import OpenAI from 'openai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.use(express.json({ limit: '50kb' }));
app.use(express.static(__dirname));

function cleanText(value, max = 5000) {
  return String(value ?? '').trim().slice(0, max);
}

app.post('/api/analyze', async (req, res) => {
  const role = cleanText(req.body.role, 120);
  const task = cleanText(req.body.task, 180);
  const prompt = cleanText(req.body.prompt, 1000);
  const skill = cleanText(req.body.skill, 80);
  const answer = cleanText(req.body.answer, 3000);
  const rubric = Array.isArray(req.body.rubric) ? req.body.rubric.map(x => cleanText(x, 100)).slice(0, 12) : [];

  if (!answer) return res.status(400).json({ error: 'Thiếu câu trả lời.' });
  if (!client) return res.status(503).json({ error: 'Chưa cấu hình OPENAI_API_KEY.' });

  const instructions = `Bạn là hệ thống AI đánh giá năng lực cho game PRE:INTERN, một trò chơi mô phỏng công việc dành cho sinh viên.\n\nNhiệm vụ của bạn là phân tích câu trả lời theo bối cảnh công việc, không chấm theo kiểu bài thi. Hãy chỉ dựa trên bằng chứng có trong câu trả lời. Không suy đoán tính cách hay năng lực ngoài dữ liệu. Phản hồi bằng tiếng Việt, ngắn gọn, cụ thể và mang tính xây dựng.\n\nTrả JSON đúng schema gồm:\n- score: số nguyên 0-100\n- summary: 1-2 câu nhận xét chính\n- strengths: 1-3 điểm mạnh quan sát được\n- improvements: 1-3 điểm cần cải thiện\n- nextStep: 1 hành động luyện tập cụ thể tiếp theo.`;

  const input = JSON.stringify({ role, task, skill, situation: prompt, rubric, answer });

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
      instructions,
      input,
      text: {
        format: {
          type: 'json_schema',
          name: 'preintern_skill_feedback',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              score: { type: 'integer', minimum: 0, maximum: 100 },
              summary: { type: 'string' },
              strengths: { type: 'array', items: { type: 'string' } },
              improvements: { type: 'array', items: { type: 'string' } },
              nextStep: { type: 'string' }
            },
            required: ['score', 'summary', 'strengths', 'improvements', 'nextStep'],
            additionalProperties: false
          }
        }
      }
    });

    const raw = response.output_text || '{}';
    const result = JSON.parse(raw);
    res.json({ ...result, source: 'AI phân tích' });
  } catch (error) {
    console.error('AI analysis failed:', error);
    res.status(502).json({ error: 'Không thể kết nối tới hệ thống AI.' });
  }
});

app.listen(port, () => {
  console.log(`PRE:INTERN chạy tại http://localhost:${port}`);
});
