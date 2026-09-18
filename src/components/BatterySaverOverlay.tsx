import React, { useEffect, useState } from "react";
import {
  Battery,
  BatteryCharging,
  Power,
  Lock,
  Smartphone,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  VolumeX,
} from "lucide-react";
import { EngineState, FacebookGroup } from "../types";

interface BatterySaverOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  engineState: EngineState;
  activeGroup?: FacebookGroup;
  wakeLockActive: boolean;
  keepAliveActive: boolean;
}

export const BatterySaverOverlay: React.FC<BatterySaverOverlayProps> = ({
  isOpen,
  onClose,
  engineState,
  activeGroup,
  wakeLockActive,
  keepAliveActive,
}) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-neutral-400 flex flex-col justify-between p-6 select-none font-mono">
      {/* Top minimal status bar */}
      <div className="flex items-center justify-between text-xs text-neutral-600 border-b border-neutral-900 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-neutral-400 font-semibold tracking-wider uppercase text-[11px]">
            OLED ECO BLACK
          </span>
          <span className="text-neutral-700">•</span>
          <span className="text-emerald-500/80 text-[10px]">Tối ưu 0% pixel sáng</span>
        </div>
        <div className="text-neutral-500 font-medium">{currentTime}</div>
      </div>

      {/* Center status info (Dim, minimal energy consumption) */}
      <div className="max-w-md mx-auto w-full text-center space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400">
            <Smartphone className="w-3.5 h-3.5 text-blue-500" />
            <span>Chạy ẩn điện thoại liên tục</span>
          </div>
          <p className="text-[10px] text-neutral-600 pt-1">
            Màn hình đen chuẩn OLED giúp tiết kiệm tới 90% pin điện thoại.
          </p>
        </div>

        {/* Big countdown or status indicator */}
        <div className="p-6 rounded-2xl bg-neutral-950/80 border border-neutral-900 space-y-3">
          <div className="text-xs tracking-widest text-neutral-500 uppercase">
            {engineState.status === "cooling_down"
              ? "KHOẢNG NGHỈ AN TOÀN (ANTI-SPAM)"
              : engineState.status === "running"
              ? "ĐANG XỬ LÝ ĐĂNG BÀI"
              : engineState.status === "completed"
              ? "HOÀN THÀNH CA ĐĂNG"
              : "HỆ THỐNG ĐANG TẠM DỪNG"}
          </div>

          {engineState.status === "cooling_down" ? (
            <div className="text-5xl font-extrabold text-amber-500/90 tracking-tight">
              {formatSeconds(engineState.countdownSeconds)}
            </div>
          ) : (
            <div className="text-2xl font-bold text-neutral-200">
              {engineState.status === "running" ? "Đang gửi nội dung..." : "Sẵn sàng"}
            </div>
          )}

          {/* Group and progress */}
          <div className="pt-2 text-xs text-neutral-400 space-y-1 border-t border-neutral-900/80">
            <div className="flex items-center justify-between text-neutral-500">
              <span>Tiến độ ca:</span>
              <span className="text-neutral-300 font-bold">
                {engineState.currentGroupIndex} / {engineState.totalGroups || 0} nhóm
              </span>
            </div>
            <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${engineState.progressPercent}%` }}
              ></div>
            </div>
            <div className="text-left truncate text-neutral-500 text-[11px] pt-1">
              Đang tới: <span className="text-neutral-300">{engineState.currentGroupName || "Chưa có"}</span>
            </div>
          </div>
        </div>

        {/* Running state indicators */}
        <div className="grid grid-cols-2 gap-2 text-left text-[11px]">
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-900 flex items-center gap-2">
            <VolumeX className="w-3.5 h-3.5 text-emerald-500" />
            <div>
              <div className="text-neutral-300 font-medium">Chạy ẩn nền</div>
              <div className="text-[10px] text-neutral-600">Đã giữ tiến trình</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-900 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-blue-500" />
            <div>
              <div className="text-neutral-300 font-medium">Chống tắt máy</div>
              <div className="text-[10px] text-neutral-600">WakeLock Kích hoạt</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wake up button */}
      <div className="max-w-md mx-auto w-full pt-4 text-center">
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold border border-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Eye className="w-4 h-4 text-neutral-400" />
          <span>Chạm vào đây để thoát Chế độ Tiết Kiệm Pin</span>
        </button>
        <p className="text-[10px] text-neutral-700 mt-2">
          Bạn có thể để máy trên bàn hoặc bỏ túi, máy vẫn tự động đăng chuẩn lịch êm ru.
        </p>
      </div>
    </div>
  );
};
