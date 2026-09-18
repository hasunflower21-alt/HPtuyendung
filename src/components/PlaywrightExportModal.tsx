import React, { useState } from "react";
import {
  Terminal,
  Copy,
  Download,
  Check,
  User,
  Info,
  AlertTriangle,
  Play,
  FileCode,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  generatePlaywrightScript,
  generateWindowsBatchFile,
  generateBookmarkletCode,
} from "../utils/playwrightScript";
import { FacebookGroup, ScheduleConfig, FacebookProfile } from "../types";

interface PlaywrightExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: FacebookGroup[];
  spintax: string;
  config: ScheduleConfig;
  profiles?: FacebookProfile[];
  activeProfileId?: string;
}

export const PlaywrightExportModal: React.FC<PlaywrightExportModalProps> = ({
  isOpen,
  onClose,
  groups,
  spintax,
  config,
  profiles = [],
  activeProfileId,
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    activeProfileId || (profiles[0]?.id ?? "default")
  );
  const [activeCodeTab, setActiveCodeTab] = useState<"bat" | "bookmarklet" | "js">("bat");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentProfile =
    profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  const scriptCode = generatePlaywrightScript(groups, spintax, config, currentProfile);
  const batCode = generateWindowsBatchFile(groups, spintax, config, currentProfile);
  const bookmarkletCode = generateBookmarkletCode(groups, spintax, config);

  const handleCopy = () => {
    let textToCopy = batCode;
    if (activeCodeTab === "js") textToCopy = scriptCode;
    if (activeCodeTab === "bookmarklet") textToCopy = bookmarkletCode;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJS = () => {
    const blob = new Blob([scriptCode], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fb_auto_post.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadBAT = () => {
    const blob = new Blob([batCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CHAY_TU_DONG_WINDOWS.bat";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tải File Chạy Tự Động 1-Click Cho Windows & Trình Duyệt
              </h3>
              <p className="text-xs text-slate-500">
                Đã sửa triệt để lỗi ký tự và tích hợp tự động toàn bộ trong 1 file duy nhất
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1.5 rounded-lg cursor-pointer"
          >
            ✕ Đóng
          </button>
        </div>

        {/* 1-Click Guide Callout */}
        <div className="p-3.5 bg-emerald-50 border-b border-emerald-200 flex flex-col sm:flex-row items-start gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-200 text-emerald-900 flex-shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="text-xs space-y-1 flex-1">
            <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
              ✅ Đã Nâng Cấp Bản Mới Nhất: Tự Động Trọn Gói Trong 1 File Duy Nhất (.BAT)
            </h4>
            <p className="text-emerald-900 leading-relaxed">
              Bạn chỉ cần bấm nút <strong>"Tải File .BAT Trọn Gói (1-Click)"</strong> ở dưới, sau đó <strong>nhấp đúp chuột vào file vừa tải</strong>:
            </p>
            <div className="p-2 bg-white/90 rounded-lg border border-emerald-300 font-medium text-slate-800 space-y-1 mt-1">
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700 ml-1">
                <li><strong>Tự động tạo mã script</strong> mà không cần tải thêm file .js rời.</li>
                <li><strong>Tự động tải môi trường chạy (Node.js)</strong> nếu máy bạn chưa cài đặt sẵn.</li>
                <li><strong>Tự động mở Google Chrome</strong> đã đăng nhập Facebook và đăng lần lượt toàn bộ nhóm theo lịch.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Profile Tagging Selector Banner & Tabs */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-xs font-bold text-slate-900">
              Nick Facebook cấu hình:
            </span>
            {profiles.length > 0 && (
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-bold text-blue-900 shadow-2xs"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Chrome: {p.chromeProfileName})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveCodeTab("bat")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCodeTab === "bat"
                  ? "bg-white text-emerald-800 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span>CHAY_TU_DONG_WINDOWS.bat</span>
            </button>
            <button
              onClick={() => setActiveCodeTab("bookmarklet")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCodeTab === "bookmarklet"
                  ? "bg-white text-indigo-800 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dấu Trang Chrome (1-Click)</span>
            </button>
            <button
              onClick={() => setActiveCodeTab("js")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCodeTab === "js"
                  ? "bg-white text-blue-800 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-blue-600" />
              <span>fb_auto_post.js</span>
            </button>
          </div>
        </div>

        {/* Code editor view */}
        <div className="flex-1 p-3.5 overflow-y-auto bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed max-h-[380px]">
          {activeCodeTab === "bookmarklet" ? (
            <div className="space-y-3 font-sans text-xs text-slate-300">
              <div className="p-3 bg-indigo-950/60 rounded-xl border border-indigo-500/40 space-y-2">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5 text-sm">
                  <Bookmark className="w-4 h-4 text-indigo-400" />
                  <span>Cách Dùng Dấu Trang Chrome (0 Cần Cài Đặt):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                  <li>Bấm nút <strong>"Sao Chép Mã"</strong> ở dưới.</li>
                  <li>Trên thanh Dấu trang của Chrome (nhấn <code>Ctrl + Shift + O</code>), tạo 1 Bookmark mới với tên <strong>"⚡ Tự Đăng FB"</strong> và dán mã vừa copy vào phần <strong>URL</strong>.</li>
                  <li>Mở tab Facebook của bạn và nhấn vào Bookmark <strong>"⚡ Tự Đăng FB"</strong> ➔ Hệ thống sẽ tự động đăng bài theo hàng đợi!</li>
                </ol>
              </div>
              <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-indigo-200 overflow-x-auto whitespace-pre-wrap break-all">
                {bookmarkletCode}
              </pre>
            </div>
          ) : (
            <pre className="whitespace-pre overflow-x-auto selection:bg-blue-600 selection:text-white">
              {activeCodeTab === "bat" ? batCode : scriptCode}
            </pre>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Cấu hình: <strong>{groups.filter((g) => g.isActive).length}</strong> nhóm mục tiêu • Profile Chrome:{" "}
            <strong className="text-blue-700">{currentProfile?.chromeProfileName || "Default"}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">Đã Sao Chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao Chép Mã</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadBAT}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              title="Tải 1 file .BAT duy nhất trọn gói - Tự động toàn bộ khi nhấp đúp"
            >
              <Download className="w-4 h-4" />
              <span>Tải File .BAT Trọn Gói (1-Click)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

