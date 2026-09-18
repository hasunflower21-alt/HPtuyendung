import React, { useState } from "react";
import { Terminal, Copy, Download, Check, User, Info, AlertTriangle, Play, FileCode, CheckCircle2 } from "lucide-react";
import { generatePlaywrightScript, generateWindowsBatchFile } from "../utils/playwrightScript";
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
  const [activeCodeTab, setActiveCodeTab] = useState<"bat" | "js">("bat");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentProfile =
    profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  const scriptCode = generatePlaywrightScript(groups, spintax, config, currentProfile);
  const batCode = generateWindowsBatchFile();

  const handleCopy = () => {
    const textToCopy = activeCodeTab === "bat" ? batCode : scriptCode;
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

  const handleDownloadAll = () => {
    handleDownloadBAT();
    setTimeout(() => {
      handleDownloadJS();
    }, 400);
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
                Tải Script Tự Động Hóa & File Chạy 1-Click Cho Windows
              </h3>
              <p className="text-xs text-slate-500">
                Tự động mở Google Chrome thật để đăng bài theo lịch mà không bị Facebook khóa nick
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

        {/* Windows Script Host Error Callout & Quick Fix */}
        <div className="p-3.5 bg-amber-50 border-b border-amber-200 flex flex-col sm:flex-row items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-200/80 text-amber-900 flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-800" />
          </div>
          <div className="text-xs space-y-1 flex-1">
            <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
              ⚠️ Nếu máy bạn báo lỗi "Windows Script Host - Syntax error" khi nhấp vào file .js:
            </h4>
            <p className="text-amber-900 leading-relaxed">
              Nguyên nhân: Windows mặc định cố mở file <code className="font-mono bg-white px-1.5 py-0.2 rounded border border-amber-300 font-bold">.js</code> bằng trình đọc cổ xưa của Windows thay vì Node.js.
            </p>
            <div className="p-2 bg-white/90 rounded-lg border border-amber-300 font-medium text-amber-950 space-y-1 mt-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Cách khắc phục cực dễ:</span>
              </div>
              <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-700 ml-1">
                <li>Bấm nút <strong>"Tải File CHAY_TU_DONG_WINDOWS.bat"</strong> và <strong>"Tải File fb_auto_post.js"</strong> về để chung một thư mục.</li>
                <li>Chỉ cần <strong>nhấp đúp chuột vào file CHAY_TU_DONG_WINDOWS.bat</strong> là Chrome sẽ tự động khởi động và đăng bài!</li>
                <li>(Nếu máy tính chưa có Node.js, file .bat sẽ tự mở trang <code className="font-mono text-blue-600">nodejs.org</code> để bạn tải bản cài đặt miễn phí).</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Profile Tagging Selector Banner */}
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
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                activeCodeTab === "bat"
                  ? "bg-white text-emerald-800 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span>CHAY_TU_DONG_WINDOWS.bat</span>
            </button>
            <button
              onClick={() => setActiveCodeTab("js")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
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
          <pre className="whitespace-pre overflow-x-auto selection:bg-blue-600 selection:text-white">
            {activeCodeTab === "bat" ? batCode : scriptCode}
          </pre>
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
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
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
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              title="Tải file .BAT để nhấp đúp chạy ngay trên Windows mà không cần gõ lệnh"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Tải File .BAT (1-Click Windows)</span>
            </button>

            <button
              onClick={handleDownloadJS}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải fb_auto_post.js</span>
            </button>

            <button
              onClick={handleDownloadAll}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              title="Tải cả file .BAT và file .JS về máy cùng lúc"
            >
              <Download className="w-4 h-4" />
              <span>Tải Trọn Bộ (2 File)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
