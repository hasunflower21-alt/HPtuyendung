export interface FacebookProfile {
  id: string;
  name: string; // Tên hiển thị ví dụ: "Nick Chính (Admin)", "Nick Phụ Bán Hàng 01"
  fbUidOrUsername?: string; // Link FB cá nhân hoặc UID (e.g. facebook.com/me)
  chromeProfileName: string; // "Default", "Profile 1", "Profile 2"...
  chromeUserDataPath?: string; // Đường dẫn thư mục User Data nếu có
  authType?: "token" | "cookie" | "browser"; // Loại xác thực để app tự động đăng
  tokenOrCookie?: string; // Access Token (EAA...) hoặc Cookie (c_user=...; xs=...)
  avatarUrl?: string; // Ảnh đại diện Facebook
  fbUserId?: string; // UID Facebook
  tokenStatus?: "valid" | "invalid" | "unconfigured";
  lastCheckedAt?: string;
  notes?: string; // Ghi chú loại nick, mục đích sử dụng
  isDefault?: boolean;
  color?: "blue" | "purple" | "emerald" | "amber" | "rose" | "indigo";
}

export interface PostResultRecord {
  id: string;
  timestamp: string; // Giờ đăng ví dụ: "09:15 18/09"
  groupId: string;
  groupName: string;
  groupUrl: string;
  profileId: string;
  profileName: string;
  contentVariant: string; // Nội dung Spintax đã xuất
  postUrl?: string; // Link bài viết cụ thể hoặc link nhóm
  groupPrivacy?: "public" | "private"; // Nhóm công khai (ai cũng xem được) hay nhóm kín
  status: "success" | "pending_approval" | "blocked" | "error" | "ready";
  note?: string;
}

export interface FacebookGroup {
  id: string;
  name: string;
  url: string;
  category: "discussion" | "marketplace";
  privacy?: "public" | "private"; // Nhóm Công Khai (Public) hay Nhóm Kín/Riêng Tư (Private)
  memberCount?: string;
  isActive: boolean;
  shift: "all" | "morning" | "evening";
  lastStatus?: "success" | "pending_approval" | "blocked" | "error" | "ready";
  lastPostedAt?: string;
  postNote?: string;
  successCount?: number; // Số lần đăng bài thành công không bị chặn
  blockedCount?: number; // Số lần bị kiểm duyệt hoặc bị chặn
  isVerifiedSafe?: boolean; // Nhóm uy tín đã kiểm chứng đăng mượt mà
  autoApprove?: boolean; // Nhóm duyệt bài tự động không cần duyệt tay
  assignedProfileId?: string; // Nick Facebook chỉ định riêng cho nhóm này (nếu có)
  lastPostUrl?: string; // Link bài viết gần nhất trong nhóm
}

export interface ScheduleConfig {
  morningShiftTime: string; // "08:45"
  eveningShiftTime: string; // "19:30"
  randomOffsetMinutes: number; // 15 mins (+/- 15 mins)
  minDelaySeconds: number; // 240s (4 mins)
  maxDelaySeconds: number; // 480s (8 mins)
  typingDelayMinMs: number; // 60ms
  typingDelayMaxMs: number; // 160ms
  autoScrollBeforePost: boolean;
  stealthModeEnabled: boolean;
  emergencyStopOnWarning: boolean;
  activeShifts: {
    morning: boolean;
    evening: boolean;
  };
}

export interface PostCampaign {
  rawContent: string;
  spintaxContent: string;
  images: string[];
  selectedGroupIds: string[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error" | "delay";
  groupName?: string;
  profileName?: string;
  message: string;
  actionUrl?: string;
}

export interface EngineState {
  status: "idle" | "running" | "paused" | "cooling_down" | "completed";
  currentGroupIndex: number;
  totalGroups: number;
  currentGroupName: string;
  countdownSeconds: number;
  progressPercent: number;
  currentVariation: string;
  activeProfileId?: string;
  activeProfileName?: string;
  executionMode?: "auto_script" | "assisted_manual" | "simulation";
}

export interface PostDraft {
  id: string;
  title: string;
  rawContent: string;
  spintaxContent: string;
  images: string[];
  updatedAt: string;
  isAutoSaved?: boolean;
}
