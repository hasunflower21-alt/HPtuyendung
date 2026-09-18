import React, { useState } from "react";
import { Terminal, Copy, Download, Check, User, Info } from "lucide-react";
import { generatePlaywrightScript } from "../utils/playwrightScript";
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
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentProfile =
    profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  const scriptCode = generatePlaywrightScript(groups, spintax, config, currentProfile);

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
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
                Mã Nguồn Script Tự Động Hóa Playwright (Node.js)
              </h3>
              <p className="text-xs text-slate-500">
                Chạy trực tiếp trên máy tính với Profile Google Chrome đã đăng nhập sẵn nick Facebook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1.5 rounded-lg"
          >
            ✕ Đóng
          </button>
        </div>

        {/* Profile Tagging Selector Banner */}
        <div className="px-4 py-3 bg-blue-50/70 border-b border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-xs font-bold text-slate-900">
              Nick Facebook cấu hình cho Script:
            </span>
            {profiles.length > 0 && (
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-blue-300 bg-white text-xs font-bold text-blue-900 shadow-2xs"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Chrome: {p.chromeProfileName})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="text-[11px] text-blue-800">
            Script sẽ tự ghi kết quả vào file{" "}
            <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono font-bold text-slate-800">
              post_results.json
            </code>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <strong className="text-blue-700 font-bold block mb-0.5">1. Cài đặt Playwright:</strong>
            <code className="bg-slate-100 px-2 py-0.5 rounded text-emerald-700 font-mono text-[11px] block mt-1 border border-slate-200 font-semibold">
              npm install playwright-core
            </code>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <strong className="text-amber-800 font-bold block mb-0.5">2. Hồ sơ Chrome thật:</strong>
            <p className="text-slate-600 text-[11px] leading-tight">
              Sử dụng profile <strong className="text-slate-900">{currentProfile?.chromeProfileName || "Default"}</strong> để đăng bài đúng nick mà không cần nhập mật khẩu hay 2FA.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <strong className="text-emerald-800 font-bold block mb-0.5">3. Khởi chạy Script:</strong>
            <code className="bg-slate-100 px-2 py-0.5 rounded text-emerald-700 font-mono text-[11px] block mt-1 border border-slate-200 font-semibold">
              node fb_auto_post.js
            </code>
          </div>
        </div>

        {/* Code editor view */}
        <div className="flex-1 p-3.5 overflow-y-auto bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed max-h-[420px]">
          <pre className="whitespace-pre overflow-x-auto selection:bg-blue-600 selection:text-white">
            {scriptCode}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Đang cấu hình: <strong>{groups.filter((g) => g.isActive).length}</strong> nhóm mục tiêu • Nick:{" "}
            <strong className="text-blue-700">{currentProfile?.name}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">Đã Sao Chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao Chép Script</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Tải File fb_auto_post.js</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
