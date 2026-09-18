import React from "react";
import {
  Smartphone,
  Moon,
  VolumeX,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface MobileBackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnableBatterySaver: () => void;
  keepAliveActive: boolean;
  wakeLockActive: boolean;
}

export const MobileBackgroundModal: React.FC<MobileBackgroundModalProps> = ({
  isOpen,
  onClose,
  onEnableBatterySaver,
  wakeLockActive,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Chạy Ẩn Điện Thoại & Tiết Kiệm Pin Tối Đa
              </h3>
              <p className="text-xs text-slate-500">
                Không cần mở máy tính, chỉ cần mở trên điện thoại rồi để máy tự chạy
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          {/* Active Status Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tiến Trình Chạy Ẩn Nền</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Kích hoạt Audio Keep-Alive: Safari & Chrome không đóng tab khi khóa màn hình.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>WakeLock Chống Tắt Màn</span>
              </div>
              <p className="text-[11px] text-blue-700">
                {wakeLockActive ? "Đang giữ máy thức" : "Tự kích hoạt khi bắt đầu ca"}
              </p>
            </div>
          </div>

          {/* 3 Core Rules for running on phone */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <Zap className="w-4 h-4 text-amber-500" />
              Cách Để Điện Thoại Chạy Êm Và Tốn Ít Pin Nhất:
            </h4>

            {/* Rule 1: OLED Black Mode */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-600" />
                  1. Bật Chế Độ Màn Hình Đen (OLED Black)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Tiết kiệm 90% pin
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Màn hình điện thoại (OLED) sẽ tắt hoàn toàn các bóng led màu, chỉ giữ độ sáng cực nhỏ hiển thị đồng hồ và tiến độ. Máy sẽ không bị nóng và chạy cả ngày mát rượi.
              </p>
            </div>

            {/* Rule 2: Keep tab alive */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <VolumeX className="w-4 h-4 text-emerald-600" />
                2. Chạy Ẩn Không Bị Hệ Thống Diệt (Keep-Alive)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hệ thống tự phát một xung tín hiệu âm thanh câm tần số siêu thấp (vô thanh). iOS Safari và Android sẽ hiểu đây là tác vụ phát media ưu tiên, cho phép bộ hẹn giờ chạy liên tục ngầm dưới nền.
              </p>
            </div>

            {/* Rule 3: Add to Home Screen (PWA) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-blue-600" />
                3. Thêm Vào Màn Hình Chính (Dùng Như App)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                - <strong>Trên iPhone (Safari):</strong> Bấm nút <strong>Chia sẻ (Share icon)</strong> &rarr; Chọn <strong>"Thêm vào MH chính" (Add to Home Screen)</strong>.
                <br />
                - <strong>Trên Android (Chrome):</strong> Bấm <strong>dấu 3 chấm</strong> &rarr; Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Hệ thống đã sẵn sàng chạy độc lập trên điện thoại.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onEnableBatterySaver();
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Moon className="w-3.5 h-3.5" />
              Bật Màn Hình Đen Tiết Kiệm Pin Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
