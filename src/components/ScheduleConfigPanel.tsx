import React from "react";
import {
  Clock,
  ShieldCheck,
  Zap,
  Play,
  Sliders,
  Sparkles,
} from "lucide-react";
import { ScheduleConfig } from "../types";

interface ScheduleConfigPanelProps {
  config: ScheduleConfig;
  setConfig: React.Dispatch<React.SetStateAction<ScheduleConfig>>;
  onStartEngine: (mode: "test" | "full") => void;
  engineRunning: boolean;
  selectedGroupCount: number;
}

export const ScheduleConfigPanel: React.FC<ScheduleConfigPanelProps> = ({
  config,
  setConfig,
  onStartEngine,
  engineRunning,
  selectedGroupCount,
}) => {
  // Approximate run time calculation
  const avgDelaySec = (config.minDelaySeconds + config.maxDelaySeconds) / 2;
  const totalMinutes = Math.round((selectedGroupCount * (avgDelaySec + 20)) / 60);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Overview Banner - Compact & Mobile Friendly */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">
              Lập Lịch & Giãn Cách An Toàn (Anti-Spam)
            </h2>
            <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              Chuẩn Người Dùng Thật
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Phân bố 2 ca/ngày và nghỉ ngẫu nhiên 4 – 8 phút giữa các nhóm để bảo vệ nick không bị checkpoint.
          </p>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <button
            id="test-run-single-btn"
            disabled={engineRunning || selectedGroupCount === 0}
            onClick={() => onStartEngine("test")}
            className="flex-1 md:flex-none px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-50 whitespace-nowrap shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Thử 1 Nhóm</span>
          </button>

          <button
            id="start-full-campaign-btn"
            disabled={engineRunning || selectedGroupCount === 0}
            onClick={() => onStartEngine("full")}
            className="flex-1 md:flex-none px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-50 whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Bắt Đầu ({selectedGroupCount} nhóm)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left Column: 2 Shift Schedule (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Khung Giờ 2 Ca / Ngày
                </h3>
              </div>
              <span className="text-[11px] text-blue-600 font-bold">Tần suất tối ưu</span>
            </div>

            {/* Shift 1: Morning */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">☀️</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Ca Sáng (Giờ Làm Việc)</h4>
                    <p className="text-[10px] text-slate-500">Tiếp cận khách hàng đầu ngày</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={config.activeShifts.morning}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        activeShifts: { ...prev.activeShifts, morning: e.target.checked },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 text-xs">
                <span className="text-slate-600 text-[11px]">Giờ bắt đầu:</span>
                <input
                  type="time"
                  value={config.morningShiftTime}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, morningShiftTime: e.target.value }))
                  }
                  className="bg-white border border-slate-300 rounded-md px-2 py-0.5 text-slate-900 font-mono text-xs font-semibold"
                />
              </div>
            </div>

            {/* Shift 2: Evening */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🌙</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Ca Tối (Giờ Vàng)</h4>
                    <p className="text-[10px] text-slate-500">Khung giờ lướt Facebook cao điểm</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={config.activeShifts.evening}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        activeShifts: { ...prev.activeShifts, evening: e.target.checked },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 text-xs">
                <span className="text-slate-600 text-[11px]">Giờ bắt đầu:</span>
                <input
                  type="time"
                  value={config.eveningShiftTime}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, eveningShiftTime: e.target.value }))
                  }
                  className="bg-white border border-slate-300 rounded-md px-2 py-0.5 text-slate-900 font-mono text-xs font-semibold"
                />
              </div>
            </div>

            {/* Random Offset */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold text-[11px]">
                  Độ lệch giờ ngẫu nhiên (Jitter):
                </span>
                <span className="font-mono text-blue-700 font-bold text-[11px]">
                  ± {config.randomOffsetMinutes} phút
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={5}
                value={config.randomOffsetMinutes}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    randomOffsetMinutes: parseInt(e.target.value),
                  }))
                }
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Ví dụ hẹn 08:30 thì bot sẽ kích hoạt ngẫu nhiên giữa 08:15 – 08:45 như người thật.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Delay between groups & Anti-Checkpoint (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Thời Gian Nghỉ Giữa Các Nhóm
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Khuyến nghị: 4–8 phút
              </span>
            </div>

            {/* Delay Range Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-semibold text-[11px]">Khoảng nghỉ ngẫu nhiên:</span>
                <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                  {Math.round(config.minDelaySeconds / 60)} phút – {Math.round(config.maxDelaySeconds / 60)} phút
                </span>
              </div>

              {/* Slider for Min */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                  <span>Nghỉ tối thiểu: {Math.round(config.minDelaySeconds / 60)} phút ({config.minDelaySeconds}s)</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={360}
                  step={30}
                  value={config.minDelaySeconds}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setConfig((prev) => ({
                      ...prev,
                      minDelaySeconds: val,
                      maxDelaySeconds: Math.max(val + 60, prev.maxDelaySeconds),
                    }));
                  }}
                  className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Slider for Max */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                  <span>Nghỉ tối đa: {Math.round(config.maxDelaySeconds / 60)} phút ({config.maxDelaySeconds}s)</span>
                </div>
                <input
                  type="range"
                  min={180}
                  max={600}
                  step={30}
                  value={config.maxDelaySeconds}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      maxDelaySeconds: Math.max(prev.minDelaySeconds + 30, parseInt(e.target.value)),
                    }))
                  }
                  className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[10px] text-emerald-800">
                ⭐ <strong>Lưu ý quan trọng:</strong> Tuyệt đối không đăng liên tục từng phút. Khoảng cách 4–8 phút là tiêu chuẩn an toàn giúp nick hoạt động ổn định quanh năm.
              </div>
            </div>

            {/* Anti-detection toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-50">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    Cuộn bảng tin mô phỏng người thật
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    Tự cuộn xem 2-3 bài viết khác của nhóm trước khi bấm nút đăng
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoScrollBeforePost}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, autoScrollBeforePost: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 flex-shrink-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-50">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    Gõ phím ngẫu nhiên (Human Typing Simulation)
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    Tốc độ gõ 60–160ms/ký tự, chống paste clipboard hàng loạt
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.stealthModeEnabled}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, stealthModeEnabled: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 flex-shrink-0"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Duration Estimate Summary */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="text-xs text-slate-700">
          Ước tính thời gian chạy 1 ca:{" "}
          <strong className="text-blue-700 font-mono text-xs">
            ~{totalMinutes} phút ({Math.round(totalMinutes / 60 * 10) / 10} giờ)
          </strong>{" "}
          cho <strong className="text-slate-900">{selectedGroupCount} nhóm mục tiêu</strong>.
        </div>

        <button
          disabled={engineRunning || selectedGroupCount === 0}
          onClick={() => onStartEngine("full")}
          className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Kích Hoạt Ca Ngay</span>
        </button>
      </div>
    </div>
  );
};
