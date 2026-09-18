import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Spintax Generator endpoint
  app.post("/api/ai/spintax", async (req, res) => {
    try {
      const { text, tone, variationIntensity = "minimal" } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Nội dung bài viết không được để trống" });
      }

      const ai = getGemini();
      if (!ai) {
        // Fallback rule-based spintax generator if API key is not configured
        const fallbackSpintax = generateFallbackSpintax(text);
        return res.json({
          spintax: fallbackSpintax,
          isFallback: true,
          message: "Đã tạo Spintax biến thể nhẹ giữ nguyên văn phong (bộ từ điển tự động)."
        });
      }

      const prompt = `Bạn là chuyên gia về content Facebook Marketing.
YÊU CẦU ĐẶC BIỆT TỪ NGƯỜI DÙNG: CÁC BIẾN THỂ PHẢI THAY ĐỔI RẤT ÍT ĐỂ GIỮ NGUYÊN VĂN PHONG VÀ NỘI DUNG BÀI VIẾT.
Quy tắc bắt buộc:
1. GIỮ NGUYÊN 90% - 95% CÂU CHỮ GỐC: Tuyệt đối KHÔNG viết lại câu văn, KHÔNG thay đổi giọng điệu, từ ngữ chuyên ngành hay thông tin kỹ thuật/giá/liên hệ.
2. CHỈ TẠO BIẾN THỂ NHẸ (SUBTLE SPINTAX) Ở:
   - Lời chào đầu bài: vd {Xin chào mọi người|Chào cả nhà|Chào anh chị}
   - 1 hoặc 2 từ nối/từ đệm rất nhẹ không làm đổi nghĩa: vd {Hôm nay bên em|Bên em} hoặc {quý khách|anh em}
   - Icon cảm xúc nhẹ ở đầu hoặc cuối câu: vd {✨|🌟|}
   - Lời chúc hoặc câu kêu gọi kết bài nhẹ nhàng: vd {Chúc cả nhà ngày làm việc hiệu quả!|Cảm ơn mọi người đã theo dõi!}
3. Giữ nguyên toàn bộ số điện thoại, Zalo, link, thông số kỹ thuật và các gạch đầu dòng liệt kê.
4. Chỉ trả về duy nhất đoạn văn bản chứa cú pháp {lựa chọn 1|lựa chọn 2}, không có bất kỳ lời giải thích nào khác.

Văn bản gốc:
"""${text}"""`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const spintax = response.text?.trim() || generateFallbackSpintax(text);
      return res.json({ spintax, isFallback: false });
    } catch (error: any) {
      console.error("Lỗi khi tạo Spintax với AI:", error);
      const fallback = generateFallbackSpintax(req.body?.text || "");
      return res.json({
        spintax: fallback,
        isFallback: true,
        message: "Lỗi kết nối AI, đã dùng bộ tạo biến thể nhẹ dự phòng."
      });
    }
  });

  // Helper fallback function for Spintax (Minimal Variation - Preserves Author Style)
  function generateFallbackSpintax(input: string): string {
    let result = input;
    // Only light, style-preserving substitutions
    const gentleReplacements: [RegExp, string][] = [
      [/^(Xin chào mọi người|Chào cả nhà|Hello mọi người|Chào anh chị)/im, "{Xin chào mọi người|Chào cả nhà|Chào quý anh chị}"],
      [/\b(liên hệ|inbox)\b/i, "{liên hệ|inbox trực tiếp}"],
      [/\b(nhắn tin trực tiếp)\b/i, "{nhắn tin trực tiếp|nhắn tin Zalo}"],
      [/\b(Chúc cả nhà ngày mới làm việc hiệu quả!)\b/i, "{Chúc cả nhà ngày mới làm việc hiệu quả!|Chúc anh em một ngày nhiều thuận lợi!|Cảm ơn mọi người đã xem tin!}"]
    ];

    gentleReplacements.forEach(([regex, rep]) => {
      result = result.replace(regex, rep);
    });

    // If no greeting replaced, add a gentle wrapper without changing the body
    if (!result.includes("{")) {
      const trimmed = result.trim();
      result = `{Chào cả nhà|Xin chào mọi người}! {✨|🌟|}\n\n` + trimmed + `\n\n{Chúc mọi người ngày mới hiệu quả!|Cảm ơn cả nhà đã xem bài!}`;
    }
    return result;
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
