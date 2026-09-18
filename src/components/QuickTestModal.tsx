import React, { useState } from "react";
import {
  Zap,
  ExternalLink,
  ClipboardPaste,
  CheckCircle2,
  AlertTriangle,
  X,
  Globe,
  ArrowRight,
} from "lucide-react";
import { FacebookGroup } from "../types";

interface QuickTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmStart: (targetGroupUrl: string, groupName?: string) => void;
  currentGroup?: FacebookGroup | null;
  allGroups: FacebookGroup[];
}

export const QuickTestModal: React.FC<QuickTestModalProps> = ({
  isOpen,
  onClose,
  onConfirmStart,
  currentGroup,
  allGroups,
}) => {
  const [targetUrl, setTargetUrl] = useState(() => {
    if (currentGroup?.url && !currentGroup.url.includes("startup.kinhdoanh.vn")) {
      return currentGroup.url;
    }
    return "";
  });
  const [customName, setCustomName] = useState(() => currentGroup?.name || "Nhóm Thử Nghiệm");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.includes("facebook.com") || text.includes("fb.com"))) {
        setTargetUrl(text.trim());
        setErrorMsg(null);
      } else if (text) {
        setTargetUrl(text.trim());
      }
    } catch (e) {
      // Browser clipboard permission denied
    }
  };

  const handleOpenMyGroupsFeed = () => {
    window.open("https://www.facebook.com/groups/feed/", "_blank");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = targetUrl.trim();
    if (!cleanUrl) {
      setErrorMsg("Vui lòng nhập link nhóm Facebook thật mà bạn đã tham gia!");
      return;
    }

    if (!cleanUrl.includes("facebook.com") && !cleanUrl.includes("fb.com")) {
      setErrorMsg("Đường dẫn phải bắt đầu bằng https://www.facebook.com/groups/...");
      return;
    }

    if (cleanUrl.includes("startup.kinhdoanh.vn")) {
      setErrorMsg("Đây là link mẫu ví dụ không có thật trên Facebook. Vui lòng dán link nhóm thật của bạn!");
      return;
    }

    onConfirmStart(cleanUrl, customName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Đăng Thử Vào Nhóm Facebook Thật
              </h3>
              <p className="text-[11px] text-blue-100">
                Nhập link 1 nhóm bạn đã tham gia để thử nghiệm ngay
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic Banner explaining "Bạn hiện không xem được nội dung này" */}
        <div className="p-3.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              Tại sao Facebook báo "Bạn hiện không xem được nội dung này"?
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Các link trong danh sách ban đầu là <strong>dữ liệu mẫu minh họa</strong> (nhóm ảo không có thật trên Facebook). Để Facebook hiển thị ô đăng bài, bạn chỉ cần <strong>dán link 1 nhóm Facebook thật</strong> mà tài khoản của bạn đang là thành viên.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Link Nhóm Facebook Thật Của Bạn:</span>
              </label>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ClipboardPaste className="w-3 h-3" />
                <span>Dán từ bộ nhớ tạm</span>
              </button>
            </div>

            <input
              type="text"
              value={targetUrl}
              onChange={(e) => {
                setTargetUrl(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="https://www.facebook.com/groups/123456789 hoặc tên nhóm..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-mono"
              autoFocus
            />

            {errorMsg && (
              <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                <span>⚠️</span> <span>{errorMsg}</span>
              </p>
            )}

            <p className="text-[10px] text-slate-500">
              Ví dụ: https://www.facebook.com/groups/muabanhaiphong hoặc nhóm bất kỳ bạn đã tham gia.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Tên gợi nhớ của nhóm (Tùy chọn):
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Ví dụ: Hội Mua Bán Đồ Cũ..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Quick Helper: Open Facebook My Groups Feed */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-2">
            <div className="text-[11px] text-blue-900">
              <span className="font-bold">Chưa nhớ link nhóm của bạn?</span>
              <p className="text-[10px] text-blue-700">Mở danh sách các nhóm Facebook bạn đã tham gia để copy link.</p>
            </div>
            <button
              type="button"
              onClick={handleOpenMyGroupsFeed}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 flex-shrink-0 transition-colors shadow-2xs cursor-pointer"
            >
              <span>Xem Nhóm Của Tôi</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>🚀 BẮT ĐẦU ĐĂNG THỬ NGAY</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
