import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Cpu,
  Clock,
  Terminal,
  Smartphone,
  Moon,
  ChevronDown,
  Check,
  ShieldCheck,
  FileCode,
  User,
  FileSpreadsheet,
  EyeOff,
} from "lucide-react";

interface HeaderProps {
  onOpenScriptModal: () => void;
  onOpenGuideModal: () => void;
  onOpenUserGuide?: () => void;
  onOpenMobileModal: () => void;
  onOpenProfileModal: () => void;
  onOpenReportModal: () => void;
  onOpenDiagnosticModal?: () => void;
  onToggleBatterySaver: () => void;
  isBatterySaverOpen?: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedGroupCount: number;
  totalGroupCount: number;
  engineRunning: boolean;
  activeProfileName?: string;
  reportCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenScriptModal,
  onOpenGuideModal,
  onOpenUserGuide,
  onOpenMobileModal,
  onOpenProfileModal,
  onOpenReportModal,
  onOpenDiagnosticModal,
  onToggleBatterySaver,
  activeTab,
  setActiveTab,
  selectedGroupCount,
  totalGroupCount,
  engineRunning,
  activeProfileName = "Nick Chính (Admin)",
  reportCount = 0,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    {
      id: "composer",
      title: "Soạn Bài & Spintax",
      shortTitle: "Soạn Bài",
      description: "Soạn nội dung, biến thể nhẹ 95% văn phong",
      icon: Sparkles,
      iconColor: "text-amber-500",
      badge: "Spintax",
    },
    {
      id: "groups",
      title: `Danh Sách Nhóm (${selectedGroupCount}/${totalGroupCount})`,
      shortTitle: `Nhóm (${selectedGroupCount})`,
      description: "Quản lý nhóm mục tiêu, gán nick Facebook",
      icon: Cpu,
      iconColor: "text-blue-600",
      badge: `${selectedGroupCount} nhóm`,
    },
    {
      id: "schedule",
      title: "Lập Lịch & Giãn Cách",
      shortTitle: "Lập Lịch",
      description: "Hẹn giờ 2 ca sáng/tối & nghỉ ngẫu nhiên 4–8p",
      icon: Clock,
      iconColor: "text-indigo-600",
      badge: "Anti-Spam",
    },
    {
      id: "monitor",
      title: "Giám Sát & Nhật Ký",
      shortTitle: "Giám Sát",
      description: "Theo dõi tiến độ gửi bài & nick đang chạy",
      icon: Terminal,
      iconColor: "text-emerald-600",
      badge: engineRunning ? "Đang chạy" : "Sẵn sàng",
    },
    {
      id: "reports",
      title: `Báo Cáo & Link Bài Đăng (${reportCount})`,
      shortTitle: `Báo Cáo (${reportCount})`,
      description: "Bảng link bài viết thật & xuất file Excel CSV",
      icon: FileSpreadsheet,
      iconColor: "text-teal-600",
      badge: `${reportCount} bài`,
    },
  ];

  const currentNavItem = navItems.find((item) => item.id === activeTab) || navItems[0];
  const CurrentIcon = currentNavItem.icon;

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 px-2.5 sm:px-6 py-2 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto space-y-1.5 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
        {/* Row 1 on Mobile: Logo, Active Profile Badge & Quick Tools */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand & Compact Status */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0 shadow-xs">
              f
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  FB Đẩy Bài
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200 whitespace-nowrap">
                  v2.5
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 whitespace-nowrap">
                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Anti-Spam 4–8p
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-blue-700 font-semibold">{selectedGroupCount}/{totalGroupCount} nhóm</span>
              </div>
            </div>
          </div>

          {/* PROFILE TAGGING SELECTOR BUTTON */}
          <button
            onClick={onOpenProfileModal}
            className="px-2 sm:px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs max-w-[150px] sm:max-w-xs"
            title="Nhấp để đổi hoặc quản lý danh sách Nick Facebook"
          >
            <User className="w-3 h-3 text-blue-600 flex-shrink-0" />
            <span className="text-[9px] sm:text-[10px] text-blue-600 font-normal hidden xs:inline">Nick:</span>
            <span className="truncate">{activeProfileName}</span>
          </button>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Quick Report Button */}
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs ${
                activeTab === "reports"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900"
              }`}
              title="Xem danh sách link bài viết đã đăng & xuất file Excel CSV"
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
              <span className="hidden xs:inline">Link Đã Đăng</span>
              {reportCount > 0 && (
                <span className="text-[9px] px-1 py-0.2 rounded-full bg-emerald-700 text-white font-bold">
                  {reportCount}
                </span>
              )}
            </button>

            <button
              onClick={onToggleBatterySaver}
              className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
              title="Bật màn hình đen OLED tiết kiệm pin tối đa cho điện thoại"
            >
              <Moon className="w-3 h-3 text-amber-600" />
              <span className="hidden xs:inline">Tiết Kiệm Pin</span>
            </button>

            <button
              onClick={onOpenMobileModal}
              className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
              title="Cài đặt chạy ẩn liên tục trên điện thoại"
            >
              <Smartphone className="w-3 h-3 text-slate-600" />
              <span className="hidden sm:inline">Chạy Ẩn</span>
            </button>

            {onOpenUserGuide && (
              <button
                onClick={onOpenUserGuide}
                className="px-2 sm:px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-colors whitespace-nowrap shadow-xs"
                title="Xem hướng dẫn sử dụng chi tiết từng bước cho người mới"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Hướng Dẫn Sử Dụng</span>
              </button>
            )}

            <button
              onClick={onOpenScriptModal}
              className="p-1 sm:px-2 sm:py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
              title="Tải mã nguồn Playwright Node.js kết nối Chrome thật"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Script Node.js</span>
            </button>

            <button
              onClick={onOpenGuideModal}
              className="p-1 sm:px-2 sm:py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
              title="Xem nguyên tắc bảo vệ nick Facebook cá nhân"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Bảo Vệ Nick</span>
            </button>

            {onOpenDiagnosticModal && (
              <button
                onClick={onOpenDiagnosticModal}
                className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
                title="Hướng dẫn sửa lỗi: Không xem được bài đăng trên Facebook"
              >
                <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Chẩn Đoán Lỗi Bài</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2 on Mobile / Right column on Desktop: DROPDOWN CHỌN THẢ COMPACT */}
        <div className="relative w-full md:w-auto min-w-[200px] md:min-w-[280px]" ref={dropdownRef}>
          {/* Dropdown Toggle Button */}
          <button
            id="nav-dropdown-toggle-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs transition-all focus:ring-1 focus:ring-blue-500/30"
            aria-expanded={dropdownOpen}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center shadow-2xs flex-shrink-0">
                <CurrentIcon className={`w-3.5 h-3.5 ${currentNavItem.iconColor}`} />
              </div>
              <div className="text-left min-w-0 flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-medium hidden xs:inline">Mục:</span>
                <span className="text-xs font-bold text-slate-900 truncate">
                  {currentNavItem.title}
                </span>
                {engineRunning && activeTab === "monitor" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0"></span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400 pl-1.5 border-l border-slate-200 flex-shrink-0">
              <span className="text-[10px] text-blue-600 font-semibold hidden sm:inline">Đổi mục</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </div>
          </button>

          {/* Floating Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute left-0 right-0 md:left-auto md:right-0 top-full mt-1.5 w-full md:w-80 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Chuyển Chức Năng</span>
                <span className="text-[9px] font-normal text-slate-400">Chạm để mở</span>
              </div>

              <div className="p-1 space-y-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-lg text-left flex items-start gap-2.5 transition-colors ${
                        isSelected
                          ? "bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs"
                          : "hover:bg-slate-50 text-slate-700 border border-transparent"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-bold ${isSelected ? "text-blue-900" : "text-slate-900"}`}>
                            {item.title}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.2">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
