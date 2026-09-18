interface Env {
  GEMINI_API_KEY?: string;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { request, env } = context;
    const body = (await request.json()) as {
      text?: string;
      tone?: string;
      variationIntensity?: string;
    };
    const text = body?.text;

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Nội dung bài viết không được để trống" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
      const fallbackSpintax = generateFallbackSpintax(text);
      return new Response(
        JSON.stringify({
          spintax: fallbackSpintax,
          isFallback: true,
          message:
            "Đã tạo Spintax biến thể nhẹ giữ nguyên văn phong (bộ từ điển tự động).",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
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

    // Direct fetch to Gemini REST API for Cloudflare Edge Workers compatibility
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!geminiRes.ok) {
      throw new Error(`Gemini API error: ${geminiRes.statusText}`);
    }

    const data = (await geminiRes.json()) as any;
    const spintax =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      generateFallbackSpintax(text);

    return new Response(JSON.stringify({ spintax, isFallback: false }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    const fallback = generateFallbackSpintax("");
    return new Response(
      JSON.stringify({
        spintax: fallback,
        isFallback: true,
        message: "Lỗi kết nối AI, đã dùng bộ tạo biến thể nhẹ dự phòng.",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}

function generateFallbackSpintax(input: string): string {
  let result = input;
  const gentleReplacements: [RegExp, string][] = [
    [
      /^(Xin chào mọi người|Chào cả nhà|Hello mọi người|Chào anh chị)/im,
      "{Xin chào mọi người|Chào cả nhà|Chào quý anh chị}",
    ],
    [/\b(liên hệ|inbox)\b/i, "{liên hệ|inbox trực tiếp}"],
    [/\b(nhắn tin trực tiếp)\b/i, "{nhắn tin trực tiếp|nhắn tin Zalo}"],
    [
      /\b(Chúc cả nhà ngày mới làm việc hiệu quả!)\b/i,
      "{Chúc cả nhà ngày mới làm việc hiệu quả!|Chúc anh em một ngày nhiều thuận lợi!|Cảm ơn mọi người đã xem tin!}",
    ],
  ];

  gentleReplacements.forEach(([regex, rep]) => {
    result = result.replace(regex, rep);
  });

  if (!result.includes("{")) {
    const trimmed = result.trim();
    result =
      `{Chào cả nhà|Xin chào mọi người}! {✨|🌟|}\n\n` +
      trimmed +
      `\n\n{Chúc mọi người ngày mới hiệu quả!|Cảm ơn cả nhà đã xem bài!}`;
  }
  return result;
}
