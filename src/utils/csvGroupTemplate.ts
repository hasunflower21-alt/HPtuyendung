import { FacebookGroup } from "../types";

/**
 * Standard CSV Template Header and Sample Rows for Facebook Groups Import/Export
 * Designed with UTF-8 BOM so Excel opens Vietnamese characters cleanly without font corruption.
 */
export const SAMPLE_CSV_HEADER = [
  "Tên Nhóm",
  "Đường Dẫn URL (Facebook Group)",
  "Quyền Riêng Tư (Công khai / Kín)",
  "Trạng Thái Duyệt (Thành công / Chờ duyệt)",
  "Số Lượng Thành Viên",
  "Phân Loại (Thảo luận / Rao vặt)",
  "Ca Đăng (Cả 2 ca / Sáng / Tối)",
  "Ghi Chú"
];

export const SAMPLE_CSV_ROWS = [
  [
    "Cộng Đồng Cư Dân Vinhomes Smart City",
    "https://www.facebook.com/groups/dan.cu.smartcity",
    "Công khai",
    "Thành công",
    "128k thành viên",
    "Thảo luận",
    "Cả 2 ca",
    "Duyệt tự động, tương tác cao"
  ],
  [
    "Hội Kỹ Sư Cơ Điện & Xây Dựng Hà Nội",
    "https://www.facebook.com/groups/kysu.codien.hanoi",
    "Công khai",
    "Thành công",
    "65k thành viên",
    "Thảo luận",
    "Cả 2 ca",
    "Đăng mượt không bị chặn link"
  ],
  [
    "Chợ Cư Dân Ecopark Hưng Yên Official",
    "https://www.facebook.com/groups/chodancu.ecopark",
    "Kín",
    "Chờ duyệt",
    "92k thành viên",
    "Rao vặt",
    "Chỉ ca Sáng",
    "Admin duyệt bài 10h sáng hàng ngày"
  ],
  [
    "Bất Động Sản & Cho Thuê Căn Hộ Miền Bắc",
    "https://www.facebook.com/groups/bds.chothue.mienbac",
    "Công khai",
    "Thành công",
    "210k thành viên",
    "Rao vặt",
    "Chỉ ca Tối",
    "Duyệt nhanh, nhiều khách hỏi"
  ]
];

/**
 * Generate standard CSV template string with UTF-8 BOM
 */
export function generateSampleCsvContent(): string {
  const rows = [
    SAMPLE_CSV_HEADER.map((h) => `"${h}"`).join(","),
    ...SAMPLE_CSV_ROWS.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
  ];
  return "\uFEFF" + rows.join("\r\n");
}

/**
 * Trigger immediate browser download of the sample CSV template
 */
export function downloadSampleCsvTemplate(filename = "file_mau_danh_sach_nhom_facebook.csv"): void {
  const csvContent = generateSampleCsvContent();
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export current active groups list to CSV with full statuses and metrics
 */
export function exportGroupsToCsv(groups: FacebookGroup[], filename?: string): void {
  const header = [
    "STT",
    "Tên Nhóm",
    "Đường Dẫn URL",
    "Quyền Riêng Tư",
    "Trạng Thái Duyệt Gần Nhất",
    "Số Lần Thành Công",
    "Số Lần Bị Chặn/Lỗi",
    "Số Thành Viên",
    "Phân Loại",
    "Ca Đăng",
    "Được Chọn Đăng",
    "Ghi Chú Đăng Bài",
    "Link Bài Gần Nhất"
  ];

  const rows = groups.map((g, idx) => {
    const privacyText = g.privacy === "private" ? "Nhóm Kín" : "Công Khai";
    const statusText =
      g.lastStatus === "success"
        ? "Đã Đăng Thành Công (Duyệt Tự Động)"
        : g.lastStatus === "pending_approval"
        ? "Đang Chờ Phê Duyệt (Pending)"
        : g.lastStatus === "blocked"
        ? "Bị Chặn / Cấm Đăng"
        : "Chưa Đăng (Sẵn Sàng)";

    const shiftText =
      g.shift === "morning"
        ? "Chỉ ca Sáng"
        : g.shift === "evening"
        ? "Chỉ ca Tối"
        : "Cả 2 ca";

    return [
      idx + 1,
      `"${(g.name || "").replace(/"/g, '""')}"`,
      `"${g.url || ""}"`,
      `"${privacyText}"`,
      `"${statusText}"`,
      g.successCount || 0,
      g.blockedCount || 0,
      `"${(g.memberCount || "").replace(/"/g, '""')}"`,
      `"${g.category === "marketplace" ? "Mua bán / Rao vặt" : "Thảo luận"}"`,
      `"${shiftText}"`,
      g.isActive ? "Có" : "Không",
      `"${(g.postNote || "").replace(/"/g, '""')}"`,
      `"${(g.lastPostUrl || "").replace(/"/g, '""')}"`
    ].join(",");
  });

  const fullCsv = "\uFEFF" + [header.join(","), ...rows].join("\r\n");
  const blob = new Blob([fullCsv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    filename || `danh_sach_nhom_facebook_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Robust parser for imported text / CSV / JSON file contents
 */
export function parseImportedDataToGroups(
  content: string,
  existingCount = 0
): { groups: FacebookGroup[]; count: number } {
  const trimmed = content.trim();
  if (!trimmed) return { groups: [], count: 0 };

  // 1. Try JSON Array first
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const parsedGroups: FacebookGroup[] = parsed
          .map((item, idx): FacebookGroup => {
            const privacy: "public" | "private" =
              item.privacy === "private" || item.privacy === "kín" || item.privacy === "kin"
                ? "private"
                : "public";
            const category: "discussion" | "marketplace" =
              item.category === "marketplace" ? "marketplace" : "discussion";
            const shift: "morning" | "evening" | "all" =
              item.shift === "morning" || item.shift === "evening" ? item.shift : "all";
            const lastStatus: "ready" | "success" | "pending_approval" | "blocked" | "error" =
              item.lastStatus === "success" ||
              item.lastStatus === "pending_approval" ||
              item.lastStatus === "blocked" ||
              item.lastStatus === "error"
                ? item.lastStatus
                : "ready";

            return {
              id: item.id || `imported-${Date.now()}-${idx}`,
              name: item.name || `Nhóm FB #${existingCount + idx + 1}`,
              url: (item.url || "").trim(),
              isActive: item.isActive ?? true,
              category,
              privacy,
              shift,
              lastStatus,
              successCount: Number(item.successCount) || 0,
              blockedCount: Number(item.blockedCount) || 0,
              isVerifiedSafe: item.isVerifiedSafe ?? (lastStatus === "success"),
              memberCount: item.memberCount,
              postNote: item.postNote,
              lastPostedAt: item.lastPostedAt,
              lastPostUrl: item.lastPostUrl,
            };
          })
          .filter((g) => g.url.length > 0);

        if (parsedGroups.length > 0) {
          return { groups: parsedGroups, count: parsedGroups.length };
        }
      }
    } catch {
      // Fallback
    }
  }

  // 2. CSV / Plain Text line-by-line parsing
  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const result: FacebookGroup[] = [];

  // Check if first line is a header
  let startIndex = 0;
  if (
    lines[0] &&
    (lines[0].toLowerCase().includes("tên nhóm") ||
      lines[0].toLowerCase().includes("url") ||
      lines[0].toLowerCase().includes("đường dẫn") ||
      lines[0].toLowerCase().includes("group name"))
  ) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Handle CSV quoted values splitting
    let columns: string[] = [];
    if (rawLine.includes(",")) {
      // Split by comma respecting quotes
      const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
      let match;
      while ((match = regex.exec(rawLine)) !== null) {
        let val = match[1];
        if (val !== undefined) {
          val = val.trim().replace(/^"|"$/g, "").replace(/""/g, '"');
          columns.push(val);
        }
        if (regex.lastIndex >= rawLine.length) break;
      }
    } else if (rawLine.includes("\t")) {
      columns = rawLine.split("\t").map((c) => c.trim());
    } else if (rawLine.includes("|")) {
      columns = rawLine.split("|").map((c) => c.trim());
    } else {
      columns = [rawLine];
    }

    // Identify URL and Name
    let url = "";
    let name = "";
    let privacy: "public" | "private" = "public";
    let status: FacebookGroup["lastStatus"] = "ready";
    let memberCount = "";
    let note = "";

    const urlCandidate = columns.find((c) => c.startsWith("http"));
    if (urlCandidate) {
      url = urlCandidate;
      // Name is usually the first non-URL column
      const nameCandidate = columns.find((c) => c !== urlCandidate && c.length > 1 && !c.includes("facebook.com"));
      if (nameCandidate) {
        name = nameCandidate;
      }
    } else {
      // Maybe the whole line is a Facebook URL without http?
      const fbUrl = columns.find((c) => c.includes("facebook.com/groups/"));
      if (fbUrl) {
        url = fbUrl.startsWith("http") ? fbUrl : `https://${fbUrl}`;
      }
    }

    if (!url) continue;

    // Check privacy in columns
    for (const c of columns) {
      const lower = c.toLowerCase();
      if (lower.includes("kín") || lower.includes("private") || lower.includes("riêng tư")) {
        privacy = "private";
      } else if (lower.includes("công khai") || lower.includes("public")) {
        privacy = "public";
      }

      if (lower.includes("thành công") || lower.includes("success") || lower.includes("tự động")) {
        status = "success";
      } else if (lower.includes("chờ duyệt") || lower.includes("pending") || lower.includes("kiểm duyệt")) {
        status = "pending_approval";
      } else if (lower.includes("chặn") || lower.includes("cấm") || lower.includes("blocked")) {
        status = "blocked";
      }

      if (lower.includes("k") || lower.includes("thành viên") || lower.includes("members")) {
        memberCount = c;
      }
    }

    if (!name) {
      name = `Nhóm FB #${existingCount + result.length + 1}`;
    }

    result.push({
      id: `imported-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
      name,
      url,
      isActive: true,
      category: "discussion",
      privacy,
      shift: "all",
      lastStatus: status,
      successCount: status === "success" ? 1 : 0,
      blockedCount: status === "blocked" ? 1 : 0,
      isVerifiedSafe: status === "success",
      memberCount: memberCount || undefined,
      postNote: note || undefined,
    });
  }

  return { groups: result, count: result.length };
}
