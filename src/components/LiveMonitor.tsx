import React, { useState } from "react";
import {
  Terminal,
  Play,
  Pause,
  FastForward,
  Clock,
  CheckCircle2,
  ExternalLink,
  Shuffle,
  ShieldAlert,
  Copy,
  Trash2,
  Moon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { EngineState, LogEntry, FacebookGroup } from "../types";

interface LiveMonitorProps {
  engineState: EngineState;
  logs: LogEntry[];
  onPauseResume: () => void;
  onEmergencyStop: () => void;
  onFastForwardCooldown: () => void;
  onClearLogs: () => void;
  activeGroup?: FacebookGroup;
  onToggleBatterySaver?: () => void;
  onGoToGroups?: () => void;
  groups?: FacebookGroup[];
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({
  engineState,
  logs,
  onPauseResume,
  onEmergencyStop,
  onFastForwardCooldown,
  onClearLogs,
  activeGroup,
  onToggleBatterySaver,
  onGoToGroups,
  groups = [],
}) => {
  const [logFilter, setLogFilter] = useState<"all" | "success" | "delay" | "warning">("all");
  const [copiedLogs, setCopiedLogs] = useState(false);

  const filteredLogs = logs.filter((log) => {
    if (logFilter === "all") return true;
    if (logFilter === "success") return log.type === "success";
    if (logFilter === "delay") return log.type === "delay";
    if (logFilter === "warning") return log.type === "warning" || log.type === "error";
    return true;
  });

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Engine Status Card - Compact & Full Info */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  engineState.status === "running"
                    ? "bg-blue-600 animate-ping"
                    : engineState.status === "cooling_down"
                    ? "bg-amber-500 animate-pulse"
                    : engineState.status === "completed"
                    ? "bg-emerald-600"
                    : engineState.status === "paused"
                    ? "bg-amber-500"
                    : "bg-slate-400"
                }`}
              ></div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                Trạng Thái Ca Đăng:
              </h2>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase whitespace-nowrap ${
                  engineState.status === "running"
                    ? "bg-blue-50 text-blue-800 border border-blue-200"
                    : engineState.status === "cooling_down"
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : engineState.status === "completed"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : engineState.status === "paused"
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {engineState.status === "running" && "Đang xử lý gửi bài..."}
                {engineState.status === "cooling_down" && "Đang nghỉ an toàn (Anti-Spam)"}
                {engineState.status === "completed" && "Hoàn thành ca đăng!"}
                {engineState.status === "paused" && "Tạm dừng"}
                {engineState.status === "idle" && "Chưa khởi chạy"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 whitespace-nowrap overflow-x-auto no-scrollbar">
              <span>Tiến độ:</span>
              <strong className="text-slate-900 font-bold">
                {engineState.currentGroupIndex}/{engineState.totalGroups || 0} nhóm
              </strong>
              <span className="text-slate-300">•</span>
              <span>Đang gửi:</span>
              <span className="text-blue-700 font-semibold truncate max-w-[180px] xs:max-w-xs" title={engineState.currentGroupName}>
                {engineState.currentGroupName || "Chưa chọn"}
              </span>
            </div>
          </div>

          {/* Controls: Quick action buttons */}
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
            {onToggleBatterySaver && (
              <button
                onClick={onToggleBatterySaver}
                className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
                title="Bật màn hình đen OLED tiết kiệm pin điện thoại"
              >
                <Moon className="w-3.5 h-3.5 text-amber-600" />
                <span>Tiết Kiệm Pin</span>
              </button>
            )}

            {engineState.status === "cooling_down" && (
              <button
                id="skip-cooldown-btn"
                onClick={onFastForwardCooldown}
                className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
                title="Bỏ qua thời gian chờ nếu bạn đang kiểm tra thử nghiệm"
              >
                <FastForward className="w-3.5 h-3.5 text-amber-600" />
                <span>Bỏ Qua Nghỉ Chờ</span>
              </button>
            )}

            {(engineState.status === "running" ||
              engineState.status === "cooling_down" ||
              engineState.status === "paused") && (
              <>
                <button
                  id="pause-resume-btn"
                  onClick={onPauseResume}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
                >
                  {engineState.status === "paused" ? (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                      <span>Tiếp Tục</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-600" />
                      <span>Tạm Dừng</span>
                    </>
                  )}
                </button>

                <button
                  id="emergency-stop-btn"
                  onClick={onEmergencyStop}
                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
                  title="Dừng khẩn cấp toàn bộ tiến trình"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Dừng Khẩn Cấp</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2.5 space-y-1">
          <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
            <span>Tiến trình hoàn thành</span>
            <span className="font-mono text-blue-700 font-bold">{engineState.progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
              style={{ width: `${engineState.progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Completion & Safe Groups Highlight Banner */}
        {engineState.status === "completed" && (
          <div className="mt-3 p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  🎉 Hoàn Thành Ca Đăng! Đã Tự Động Lưu Nhóm Thành Công
                </h4>
                <p className="text-[11px] text-emerald-100 mt-0.5">
                  Các nhóm đăng bài không gặp lỗi/chặn link đã được đánh dấu an toàn để lọc cho ca tiếp theo.
                </p>
              </div>
            </div>

            {onGoToGroups && (
              <button
                onClick={onGoToGroups}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Xem & Lọc Nhóm Thành Công &rarr;</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid: Current Activity Snapshot & Real-time Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Cooldown Countdown Timer */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Đếm Ngược Nghỉ Giữa Các Nhóm
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
              Anti-Checkpoint
            </span>
          </div>

          <div className="py-2.5 text-center">
            {engineState.status === "cooling_down" ? (
              <div className="space-y-0.5">
                <div className="text-2xl font-black font-mono tracking-tight text-amber-600">
                  {formatSeconds(engineState.countdownSeconds)}
                </div>
                <p className="text-[10px] text-slate-500">
                  Nghỉ ngẫu nhiên như người thật trước khi sang nhóm tiếp theo
                </p>
              </div>
            ) : engineState.status === "running" ? (
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-blue-600 animate-pulse">
                  Đang mở trình duyệt & điền form...
                </div>
                <p className="text-[10px] text-slate-400">Giả lập gõ phím & đính kèm ảnh</p>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Sẵn sàng. Bộ đếm sẽ kích hoạt khi chạy ca.
              </div>
            )}
          </div>

          {engineState.status === "cooling_down" && (
            <button
              onClick={onFastForwardCooldown}
              className="w-full py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold transition-colors"
            >
              Bỏ qua giây chờ &rarr; Sang nhóm ngay
            </button>
          )}
        </div>

        {/* Card 2 & 3: Active Target Group & Spin Variation */}
        <div className="md:col-span-2 bg-white rounded-xl p-3 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Shuffle className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-bold text-slate-700">
                Nhóm Đang Thực Thi & Mẫu Biến Thể
              </span>
            </div>
            {activeGroup && (
              <a
                href={activeGroup.url}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 font-mono"
              >
                <span>Mở link nhóm</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-semibold">Nhóm mục tiêu:</span>
              <strong className="text-xs text-slate-900 truncate max-w-xs">
                {engineState.currentGroupName || "Chưa có nhóm nào đang chạy"}
              </strong>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-mono leading-relaxed line-clamp-3">
              {engineState.currentVariation ||
                "Nội dung văn bản được xoay vòng spintax ngẫu nhiên sẽ hiển thị trực quan tại đây khi bot đăng bài..."}
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Log Console - Compact High Information Density */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Terminal Header */}
        <div className="p-2 sm:p-2.5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900">
              Nhật Ký Thực Thi Thời Gian Thực ({filteredLogs.length})
            </h3>
          </div>

          {/* Filter Pills & Actions */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-1.5 flex-wrap">
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-[10px]">
              <button
                onClick={() => setLogFilter("all")}
                className={`px-1.5 py-0.5 rounded font-semibold transition-all ${
                  logFilter === "all" ? "bg-blue-50 text-blue-700" : "text-slate-500"
                }`}
              >
                Tất Cả
              </button>
              <button
                onClick={() => setLogFilter("success")}
                className={`px-1.5 py-0.5 rounded font-semibold transition-all ${
                  logFilter === "success" ? "bg-emerald-50 text-emerald-800" : "text-slate-500"
                }`}
              >
                Thành Công
              </button>
              <button
                onClick={() => setLogFilter("delay")}
                className={`px-1.5 py-0.5 rounded font-semibold transition-all ${
                  logFilter === "delay" ? "bg-amber-50 text-amber-800" : "text-slate-500"
                }`}
              >
                Nghỉ Chờ
              </button>
              <button
                onClick={() => setLogFilter("warning")}
                className={`px-1.5 py-0.5 rounded font-semibold transition-all ${
                  logFilter === "warning" ? "bg-red-50 text-red-700" : "text-slate-500"
                }`}
              >
                Cảnh Báo
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyLogs}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-[10px] text-slate-700 font-semibold flex items-center gap-1"
                title="Sao chép toàn bộ nhật ký"
              >
                <Copy className="w-3 h-3 text-slate-500" />
                <span>{copiedLogs ? "Đã chép!" : "Sao Chép"}</span>
              </button>
              <button
                onClick={onClearLogs}
                className="p-1 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-red-600"
                title="Xóa nhật ký"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Log Entries Container - High Information Density on Mobile */}
        <div className="p-2 sm:p-3 bg-slate-900 text-slate-200 font-mono text-[10px] sm:text-[11px] leading-relaxed max-h-72 sm:max-h-96 overflow-y-auto space-y-1">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 py-6 text-center text-xs">
              Chưa có nhật ký nào được ghi nhận. Bấm "Bắt Đầu Ca" để theo dõi.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-1.5 hover:bg-slate-800/60 p-0.5 rounded transition-colors"
              >
                <span className="text-slate-500 flex-shrink-0 select-none">
                  [{log.timestamp}]
                </span>

                <span
                  className={`px-1 rounded text-[9px] font-bold uppercase flex-shrink-0 select-none ${
                    log.type === "success"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : log.type === "delay"
                      ? "bg-amber-500/20 text-amber-300"
                      : log.type === "warning" || log.type === "error"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {log.type}
                </span>

                <span className="text-slate-300 break-words flex-1">
                  {log.groupName && (
                    <strong className="text-white mr-1">[{log.groupName}]</strong>
                  )}
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
