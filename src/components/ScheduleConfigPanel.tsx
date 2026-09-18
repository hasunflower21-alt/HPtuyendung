import React, { useState } from "react";
import {
  Clock,
  ShieldCheck,
  Zap,
  Play,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowRight,
  Info,
  Check,
  Terminal,
  Download,
  ExternalLink,
  Laptop,
  Globe,
  User,
  Users,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { FacebookGroup, FacebookProfile, ScheduleConfig } from "../types";

interface ScheduleConfigPanelProps {
  config: ScheduleConfig;
  setConfig: React.Dispatch<React.SetStateAction<ScheduleConfig>>;
  onStartEngine: (mode: "test" | "full") => void;
  engineRunning: boolean;
  selectedGroupCount: number;
  onOpenScriptModal?: () => void;
  profiles?: FacebookProfile[];
  activeProfileId?: string;
  setActiveProfileId?: (id: string) => void;
  onOpenProfileModal?: () => void;
  groups?: FacebookGroup[];
  onOpenQuickTestModal?: () => void;
}

export const ScheduleConfigPanel: React.FC<ScheduleConfigPanelProps> = ({
  config,
  setConfig,
  onStartEngine,
  engineRunning,
  selectedGroupCount,
  onOpenScriptModal,
  profiles = [],
  activeProfileId,
  setActiveProfileId,
  onOpenProfileModal,
  groups = [],
  onOpenQuickTestModal,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<"safe" | "fast" | "custom">("safe");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Active Profile details
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Group metrics
  const selectedGroups = groups.filter((g) => g.isActive);
  const publicGroupCount = selectedGroups.filter((g) => g.privacy !== "private").length;
  const safeGroupCount = selectedGroups.filter((g) => g.isVerifiedSafe || g.autoApprove).length;

  // Approximate run time calculation
  const avgDelaySec = (config.minDelaySeconds + config.maxDelaySeconds) / 2;
  const totalMinutes = Math.round((selectedGroupCount * (avgDelaySec + 20)) / 60);

  const handleApplyPreset = (preset: "safe" | "fast") => {
    setSelectedPreset(preset);
    if (preset === "safe") {
      setConfig((prev) => ({
        ...prev,
        minDelaySeconds: 240, // 4 mins
        maxDelaySeconds: 480, // 8 mins
        stealthModeEnabled: true,
        autoScrollBeforePost: true,
      }));
    } else if (preset === "fast") {
      setConfig((prev) => ({
        ...prev,
        minDelaySeconds: 60, // 1 min
        maxDelaySeconds: 180, // 3 mins
        stealthModeEnabled: true,
        autoScrollBeforePost: false,
      }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Primary Hero 1-Click Launch Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Bước 3: Sẵn Sàng Đăng Bài Tự Động</span>
            </div>
            <h2 className="text-base sm:text-xl font-black tracking-tight">
              Bắt Đầu Tiến Trình Tự Động Đăng Nhóm
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Hệ thống sẽ tự động xử lý toàn bộ: xoay nội dung Spintax, đính kèm ảnh, nghỉ ngẫu nhiên chống khóa nick và báo cáo link bài viết trực tiếp trên web.
            </p>
          </div>

          {/* Large 1-Click Launch Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0">
            <div className="flex flex-col">
              <button
                id="test-run-single-btn"
                disabled={engineRunning || selectedGroupCount === 0}
                onClick={() => onStartEngine("test")}
                className="px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-950 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md cursor-pointer"
                title="Thử nghiệm đăng ngay vào 1 nhóm đầu tiên để kiểm tra kết quả"
              >
                <Zap className="w-4 h-4 fill-amber-950" />
                <span>Đăng Thử 1 Nhóm</span>
              </button>
              {onOpenQuickTestModal && (
                <button
                  type="button"
                  onClick={onOpenQuickTestModal}
                  className="mt-1 text-[11px] text-amber-200 hover:text-white underline font-semibold text-center cursor-pointer transition-colors"
                  title="Dán link nhóm thật của bạn để tránh lỗi không xem được nội dung trên Facebook"
                >
                  ✏️ Đổi Link Nhóm Thật Của Bạn
                </button>
              )}
            </div>

            <button
              id="start-full-campaign-btn"
              disabled={engineRunning || selectedGroupCount === 0}
              onClick={() => onStartEngine("full")}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md cursor-pointer ring-2 ring-white/30"
              title="Bắt đầu chạy tự động đăng toàn bộ các nhóm đã chọn"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>▶ BẮT ĐẦU ĐĂNG ({selectedGroupCount} NHÓM)</span>
            </button>

            {onOpenScriptModal && (
              <button
                type="button"
                onClick={onOpenScriptModal}
                className="px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer border border-white/20"
                title="Tải file .BAT để máy tính tự động mở Chrome và đăng bài không cần chạm tay"
              >
                <Terminal className="w-4 h-4 text-amber-300" />
                <span>🤖 Tải File .BAT (PC)</span>
              </button>
            )}
          </div>
        </div>

        {/* Operational Status Bar */}
        <div className="mt-4 pt-3.5 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-200" />
              <div>
                <div className="text-[10px] text-blue-200 uppercase font-bold">Nick Nguồn Đăng Bài:</div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>{activeProfile?.name || "Nick Chính"}</span>
                  {activeProfile?.tokenStatus === "valid" ? (
                    <span className="text-[9px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded font-bold border border-emerald-400/40">
                      ✓ Token Sẵn Sàng
                    </span>
                  ) : (
                    <span className="text-[9px] bg-white/20 text-white/90 px-1.5 py-0.2 rounded font-medium">
                      Web/Playwright
                    </span>
                  )}
                </div>
              </div>
            </div>
            {onOpenProfileModal && (
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="text-[11px] underline text-blue-200 hover:text-white font-bold cursor-pointer"
              >
                Đổi Nick
              </button>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-200" />
            <div>
              <div className="text-[10px] text-blue-200 uppercase font-bold">Nhóm Mục Tiêu:</div>
              <div className="font-bold text-white">
                {selectedGroupCount} nhóm đã chọn{" "}
                <span className="text-[11px] font-normal text-blue-200">
                  ({publicGroupCount} Công Khai, {safeGroupCount} an toàn)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-200" />
            <div>
              <div className="text-[10px] text-blue-200 uppercase font-bold">Thời Gian Ước Tính:</div>
              <div className="font-bold text-white">
                ~{totalMinutes} phút{" "}
                <span className="text-[11px] font-normal text-blue-200">
                  (Giãn cách {config.minDelaySeconds}–{config.maxDelaySeconds}s)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Group Count Warning if 0 */}
        {selectedGroupCount === 0 && (
          <div className="mt-3.5 p-3 rounded-xl bg-amber-500/20 border border-amber-300/40 text-amber-100 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span>
              Bạn chưa chọn nhóm nào. Hãy chuyển sang <strong>Bước 2: Chọn Nhóm Mục Tiêu</strong> để tích chọn ít nhất 1 nhóm trước khi bấm bắt đầu!
            </span>
          </div>
        )}
      </div>

      {/* Preset Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Preset 1: Standard Safe (Recommended) */}
        <div
          onClick={() => handleApplyPreset("safe")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedPreset === "safe"
              ? "bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-300/40 shadow-xs"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Chế Độ An Toàn Chuẩn
              </h3>
            </div>
            {selectedPreset === "safe" && (
              <span className="p-0.5 rounded-full bg-emerald-600 text-white">
                <Check className="w-3 h-3" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
            Nghỉ ngẫu nhiên <strong>4 – 8 phút/nhóm</strong> + Mô phỏng người thật gõ phím. Giúp nick an toàn tuyệt đối, không bị khóa.
          </p>
          <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            Khuyên Dùng Cho Nick Chính
          </span>
        </div>

        {/* Preset 2: Fast Mode */}
        <div
          onClick={() => handleApplyPreset("fast")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedPreset === "fast"
              ? "bg-blue-50/80 border-blue-400 ring-2 ring-blue-300/40 shadow-xs"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Chế Độ Tăng Tốc
              </h3>
            </div>
            {selectedPreset === "fast" && (
              <span className="p-0.5 rounded-full bg-blue-600 text-white">
                <Check className="w-3 h-3" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
            Nghỉ nhanh <strong>1 – 3 phút/nhóm</strong>. Hoàn thành chiến dịch nhanh chóng khi cần đẩy bài gấp.
          </p>
          <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
            Phù Hợp Cho Nick Phụ / Clone
          </span>
        </div>

        {/* Preset 3: Custom Toggle */}
        <div
          onClick={() => {
            setSelectedPreset("custom");
            setShowAdvanced(true);
          }}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedPreset === "custom"
              ? "bg-purple-50/80 border-purple-400 ring-2 ring-purple-300/40 shadow-xs"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Tùy Chỉnh Nâng Cao
              </h3>
            </div>
            {selectedPreset === "custom" && (
              <span className="p-0.5 rounded-full bg-purple-600 text-white">
                <Check className="w-3 h-3" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
            Tự chọn giờ chạy ca sáng/tối, chỉnh giây nghỉ chính xác và độ lệch ngẫu nhiên.
          </p>
          <span className="inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
            {showAdvanced ? "Đang Mở Cấu Hình" : "Bấm Để Mở Cài Đặt"}
          </span>
        </div>
      </div>

      {/* Primary 1-Click Execution Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chế Độ Tự Động 1-Click (Không Cần Thao Tác)</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Đăng Bài Tự Động Lên {selectedGroupCount} Nhóm Mục Tiêu
            </h3>
            <p className="text-xs text-blue-200/90 leading-relaxed max-w-xl">
              Hệ thống tự động xoay Spintax độc bản cho từng nhóm, kết nối API đăng bài, đếm ngược thời gian nghỉ chống Spam Checkpoint và xuất báo cáo link bài viết sau khi đăng.
            </p>
          </div>

          <button
            disabled={engineRunning || selectedGroupCount === 0}
            onClick={() => onStartEngine("full")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>BẮT ĐẦU ĐĂNG BÀI TỰ ĐỘNG</span>
          </button>
        </div>

        <div className="pt-3 border-t border-blue-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-200">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              Tự xoay Spintax độc bản
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              Nghỉ ngơi chống checkpoint
            </span>
          </div>

          {onOpenScriptModal && (
            <button
              onClick={onOpenScriptModal}
              className="text-xs text-blue-300 hover:text-white underline flex items-center gap-1 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Tùy chọn nâng cao: Tải script chạy trên Chrome máy tính</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Settings Drawer (Optional) */}
      {showAdvanced && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 animate-in fade-in duration-150">
          {/* Left Column: 2 Shift Schedule (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Khung Giờ 2 Ca Tự Động / Ngày
                  </h3>
                </div>
                <span className="text-[11px] text-blue-600 font-bold">Hẹn Giờ Tự Chạy</span>
              </div>

              {/* Shift 1: Morning */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">☀️</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Ca Sáng</h4>
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
                    <span className="text-base">🌙</span>
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
            </div>
          </div>

          {/* Right Column: Custom Delay Sliders (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Khoảng Nghỉ Giữa Các Nhóm
                  </h3>
                </div>
                <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                  {Math.round(config.minDelaySeconds / 60)}p – {Math.round(config.maxDelaySeconds / 60)}p
                </span>
              </div>

              {/* Slider for Min */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <span>Nghỉ tối thiểu: <strong>{Math.round(config.minDelaySeconds / 60)} phút</strong> ({config.minDelaySeconds}s)</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={360}
                  step={30}
                  value={config.minDelaySeconds}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setConfig((prev) => ({
                      ...prev,
                      minDelaySeconds: val,
                      maxDelaySeconds: Math.max(val + 30, prev.maxDelaySeconds),
                    }));
                  }}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Slider for Max */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <span>Nghỉ tối đa: <strong>{Math.round(config.maxDelaySeconds / 60)} phút</strong> ({config.maxDelaySeconds}s)</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={600}
                  step={30}
                  value={config.maxDelaySeconds}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      maxDelaySeconds: Math.max(prev.minDelaySeconds + 30, parseInt(e.target.value)),
                    }))
                  }
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overview Statistics Footer */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="text-slate-600 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Đang sẵn sàng cho <strong>{selectedGroupCount} nhóm</strong> • Ước tính thời gian chạy:{" "}
            <strong className="text-blue-700 font-mono">~{totalMinutes} phút</strong>
          </span>
        </div>

        <button
          disabled={engineRunning || selectedGroupCount === 0}
          onClick={() => onStartEngine("full")}
          className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Bấm Bắt Đầu Ngay</span>
        </button>
      </div>
    </div>
  );
};
