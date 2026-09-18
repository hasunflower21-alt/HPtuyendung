/**
 * Text formatting, Unicode font generators, and Facebook post symbols utility
 * Fully compatible with Vietnamese text and Spintax syntax {A|B}
 */

// Mapping of normal characters to styled Unicode characters
const UNICODE_FONTS = {
  // Sans-serif Bold: 𝗔 𝗕 𝗖 ... 𝗮 𝗯 𝗰 ... 𝟬 𝟭 𝟮
  bold: {
    upper: 0x1d5d4, // 𝗔
    lower: 0x1d5ee, // 𝗮
    digits: 0x1d7ec, // 𝟬
  },
  // Serif Bold: 𝐀 𝐁 𝐂 ... 𝐚 𝐛 𝐜 ... 𝟎 𝟏 𝟐
  serifBold: {
    upper: 0x1d400, // 𝐀
    lower: 0x1d41a, // 𝐚
    digits: 0x1d7ce, // 𝟎
  },
  // Sans-serif Italic: 𝘈 𝘉 𝘊 ... 𝘢 𝘣 𝘤
  italic: {
    upper: 0x1d608, // 𝘈
    lower: 0x1d622, // 𝘢
    digits: null,
  },
  // Sans-serif Bold Italic: 𝘼 𝘽 𝘾 ... 𝙖 𝙗 𝙘
  boldItalic: {
    upper: 0x1d63c, // 𝘼
    lower: 0x1d656, // 𝙖
    digits: null,
  },
  // Circled / Bubble: Ⓐ Ⓑ Ⓒ ... ⓐ ⓑ ⓒ ... ⓪ ① ②
  bubble: {
    upper: 0x24b6, // Ⓐ
    lower: 0x24d0, // ⓐ
    digits: 0x2460, // ① - Note: 1 is 0x2460, 0 is 0x24ea
  },
  // Squared / Boxed: 🄰 🄱 🄲 ...
  boxed: {
    upper: 0x1f130, // 🄰
    lower: 0x1f130, // 🄰 (Boxed generally uppercase)
    digits: null,
  },
  // Monospace / Typewriter: 𝚊 𝚋 𝚌 ... 𝟶 𝟷 𝟸
  monospace: {
    upper: 0x1d670, // 𝙰
    lower: 0x1d68a, // 𝚊
    digits: 0x1d7f6, // 𝟶
  },
  // Double-Struck / Blackboard: 𝔸 𝔹 ℂ ...
  blackboard: {
    upper: 0x1d538, // 𝔸 (with known unicode exceptions for C, H, N, P, Q, R, Z handled below)
    lower: 0x1d552, // 𝕒
    digits: 0x1d7d8, // 𝟘
  },
};

// Known Unicode exceptions for mathematical alphanumeric symbols
const EXCEPTIONS: Record<string, string> = {
  // Blackboard exceptions
  "blackboard_C": "ℂ",
  "blackboard_H": "ℍ",
  "blackboard_N": "ℕ",
  "blackboard_P": "ℙ",
  "blackboard_Q": "ℚ",
  "blackboard_R": "ℝ",
  "blackboard_Z": "ℤ",
  // Italic exceptions
  "italic_h": "ℎ",
};

/**
 * Normalizes Vietnamese diacritics if necessary, while preserving readability
 */
export function convertToUnicodeFont(
  text: string,
  style: "bold" | "serifBold" | "italic" | "boldItalic" | "bubble" | "boxed" | "monospace" | "blackboard"
): string {
  const font = UNICODE_FONTS[style];
  if (!font) return text;

  let result = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);

    // Uppercase A-Z (65-90)
    if (code >= 65 && code <= 90) {
      const exceptionKey = `${style}_${char}`;
      if (EXCEPTIONS[exceptionKey]) {
        result += EXCEPTIONS[exceptionKey];
      } else {
        const offset = code - 65;
        result += String.fromCodePoint(font.upper + offset);
      }
    }
    // Lowercase a-z (97-122)
    else if (code >= 97 && code <= 122) {
      const exceptionKey = `${style}_${char}`;
      if (EXCEPTIONS[exceptionKey]) {
        result += EXCEPTIONS[exceptionKey];
      } else {
        const offset = code - 97;
        result += String.fromCodePoint(font.lower + offset);
      }
    }
    // Digits 0-9 (48-57)
    else if (code >= 48 && code <= 57 && font.digits !== null) {
      const digit = code - 48;
      if (style === "bubble") {
        if (digit === 0) result += "⓪";
        else result += String.fromCodePoint(0x2460 + digit - 1);
      } else {
        result += String.fromCodePoint(font.digits + digit);
      }
    }
    // Any other character (e.g. spaces, punctuation, or accented Vietnamese vowels)
    // Note: If letter has Vietnamese accent (e.g. á, à, ơ, ư), we keep standard letter or base mapping
    else {
      result += char;
    }
  }

  return result;
}

/**
 * Adds combining underline (\u0332)
 */
export function applyUnderline(text: string): string {
  return text
    .split("")
    .map((char) => (char === "\n" ? "\n" : `${char}\u0332`))
    .join("");
}

/**
 * Adds combining strikethrough (\u0336)
 */
export function applyStrikethrough(text: string): string {
  return text
    .split("")
    .map((char) => (char === "\n" ? "\n" : `${char}\u0336`))
    .join("");
}

/**
 * Removes custom unicode styling back to regular plain text
 */
export function stripUnicodeStyles(text: string): string {
  // Remove combining diacritics for underline / strikethrough
  let cleaned = text.replace(/[\u0332\u0336]/g, "");

  // Normalize compatibility form
  try {
    cleaned = cleaned.normalize("NFKD");
  } catch {
    // Ignore if not supported
  }

  return cleaned;
}

/**
 * Categories of Facebook Post Symbols & Emojis
 */
export interface SymbolCategory {
  title: string;
  icon: string;
  items: string[];
}

export const SYMBOL_CATEGORIES: SymbolCategory[] = [
  {
    title: "Gây Chú Ý & Khuyến Mãi",
    icon: "🔥",
    items: ["⚡", "🔥", "💥", "🎯", "🚀", "💎", "👑", "🎁", "🏷️", "🌟", "🔔", "📣", "🚨", "🎉", "✨"],
  },
  {
    title: "Hotline, Liên Hệ & Địa Chỉ",
    icon: "☎️",
    items: ["☎️", "📞", "📲", "💬", "📩", "📧", "🌐", "🏠", "📍", "🏢", "📌", "🚗", "🛵", "⏰", "📅"],
  },
  {
    title: "Kêu Gọi Hành Động (CTA)",
    icon: "👉",
    items: ["👉", "➡️", "⬇️", "🔺", "🔹", "🔸", "🔘", "➜", "➮", "▶️", "👇", "👈", "⏩", "🎯", "🔎"],
  },
  {
    title: "Cam Kết, Chất Lượng & Uy Tín",
    icon: "✅",
    items: ["✅", "✔️", "💯", "🛡️", "⭐", "🔒", "🌿", "👍", "🤝", "🏆", "🥇", "💪", "👌", "❤️", "🎯"],
  },
  {
    title: "Số Thứ Tự Đóng Khung",
    icon: "❶",
    items: [
      "❶", "❷", "❸", "❹", "❺", "❻", "❼", "❽", "❾", "❿",
      "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩",
    ],
  },
  {
    title: "Kí Tự Đồ Họa & Bullet",
    icon: "❖",
    items: ["▪️", "▫️", "◾", "◽", "◼️", "◻️", "⬥", "⬦", "◆", "◇", "✦", "✧", "❖", "✪", "✵", "❋"],
  },
];

/**
 * Decorative Dividers for Facebook posts
 */
export const POST_DIVIDERS = [
  { label: "Nét đôi (Sang trọng)", value: "═════════════════════════════" },
  { label: "Nét đậm (Rõ ràng)", value: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" },
  { label: "Nét mảnh (Thanh lịch)", value: "─────────────────────────────" },
  { label: "Ngôi sao may mắn", value: "★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★" },
  { label: "Họa tiết hoa văn", value: "✦ ────────── ❖ ────────── ✦" },
  { label: "Chấm cách đều", value: "• • • • • • • • • • • • • • •" },
  { label: "Kim cương", value: "◈ ─── ◈ ─── ◈ ─── ◈ ─── ◈" },
];
