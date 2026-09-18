import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Layers,
  Clock,
  Activity,
  Smartphone,
  Moon,
  ShieldCheck,
  User,
  FileSpreadsheet,
  HelpCircle,
  Settings,
  Zap,
  CheckCircle2,
  ChevronDown,
  Check,
} from "lucide-react";
import { FacebookProfile } from "../types";

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
  profiles?: FacebookProfile[];
  activeProfileId?: string;
  setActiveProfileId?: (id: string) => void;
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
  profiles = [],
  activeProfileId,
  setActiveProfileId,
}) => {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const steps = [
    {
      id: "composer",
      stepNum: "1",
      title: "Soạn Bài & Ảnh",
      shortTitle: "1. Soạn Bài",
      subtitle: "Văn bản, Spintax & Ảnh",
      icon: Sparkles,
      iconColor: "text-amber-500",
    },
    {
      id: "groups",
      stepNum: "2",
      title: "Chọn Nhóm Mục Tiêu",
      shortTitle: `2. Chọn Nhóm (${selectedGroupCount})`,
      subtitle: `${selectedGroupCount}/${totalGroupCount} nhóm đã chọn`,
      icon: Layers,
      iconColor: "text-blue-600",
    },
    {
      id: "schedule",
      stepNum: "3",
      title: "Lên Lịch & Đăng Bài",
      shortTitle: "3. Bấm Đăng",
      subtitle: "1-Click Tự Động Chạy",
      icon: Clock,
      iconColor: "text-indigo-600",
      highlight: true,
    },
    {
      id: "monitor",
      stepNum: "4",
      title: "Tiến Độ & Nhật Ký",
      shortTitle: "4. Giám Sát",
      subtitle: engineRunning ? "Đang chạy..." : "Nhật ký hệ thống",
      icon: Activity,
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 border-b border-slate-100 flex items-center justify-between gap-2">
        {/* Brand & Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-xs ring-2 ring-blue-100">
            f
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                FB ĐẨY BÀI
              </h1>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Tự Động 100%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block truncate">
              Hệ thống tự động đăng bài theo nhóm Facebook chuẩn Anti-Spam
            </p>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Active Profile Pill & Quick Switcher */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => {
                if (profiles.length > 1) {
                  setProfileDropdownOpen(!profileDropdownOpen);
                } else {
                  onOpenProfileModal();
                }
              }}
              className="px-2 sm:px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer border border-slate-200"
              title="Đổi hoặc quản lý danh sách nick Facebook"
            >
              <User className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span className="max-w-[90px] sm:max-w-[130px] truncate">{activeProfileName}</span>
              {profiles.length > 1 && (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              )}
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                  <span>Chọn Nick Facebook</span>
                  <span className="text-blue-600 font-normal">{profiles.length} nick</span>
                </div>

                <div className="max-h-56 overflow-y-auto py-1">
                  {profiles.map((p) => {
                    const isSelected = p.id === activeProfileId;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (setActiveProfileId) setActiveProfileId(p.id);
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          isSelected ? "bg-blue-50/70 font-bold text-blue-700" : "text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                          <span className="truncate">{p.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-1 px-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenProfileModal();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 font-bold text-[11px] flex items-center gap-1.5"
                  >
                    <span>⚙️ Quản Lý & Thêm Nick Mới...</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Guide Button */}
          {onOpenUserGuide && (
            <button
              onClick={onOpenUserGuide}
              className="px-2.5 sm:px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-blue-200 shadow-2xs"
              title="Xem hướng dẫn sử dụng chi tiết"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden xs:inline">Hướng Dẫn</span>
            </button>
          )}

          {/* Report Button */}
          <button
            onClick={onOpenReportModal}
            className="px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-emerald-200 shadow-2xs"
            title="Xem danh sách bài đăng thành công"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Báo Cáo</span>
            {reportCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-bold">
                {reportCount}
              </span>
            )}
          </button>

          {/* More Tools Dropdown */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-2xs"
              title="Công cụ bổ sung"
            >
              <Settings className="w-4 h-4" />
            </button>

            {moreMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Công Cụ Bổ Trợ
                </div>

                <button
                  onClick={() => {
                    onToggleBatterySaver();
                    setMoreMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Moon className="w-4 h-4 text-amber-500" />
                  <span>Màn Hình Tối Tiết Kiệm Pin</span>
                </button>

                <button
                  onClick={() => {
                    onOpenMobileModal();
                    setMoreMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-slate-600" />
                  <span>Hướng Dẫn Chạy Ẩn Mobile</span>
                </button>

                <button
                  onClick={() => {
                    onOpenGuideModal();
                    setMoreMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Quy Tắc An Toàn Nick</span>
                </button>

                {onOpenDiagnosticModal && (
                  <button
                    onClick={() => {
                      onOpenDiagnosticModal();
                      setMoreMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span>Chẩn Đoán Nhóm Kiểm Duyệt</span>
                  </button>
                )}

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => {
                    onOpenScriptModal();
                    setMoreMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-blue-600 font-semibold hover:bg-blue-50 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span>Script Nâng Cao (Node.js/BAT)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Step Navigation Bar (1 - 2 - 3 - 4) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-1.5">
        <nav className="grid grid-cols-4 gap-1 sm:gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCurrent = activeTab === step.id;

            return (
              <button
                key={step.id}
                onClick={() => setActiveTab(step.id)}
                className={`relative px-2 sm:px-3 py-2 rounded-xl text-left transition-all flex items-center gap-2 sm:gap-2.5 ${
                  isCurrent
                    ? "bg-blue-50/90 text-blue-950 border border-blue-200 shadow-2xs font-bold"
                    : "hover:bg-slate-50 text-slate-600 border border-transparent"
                }`}
              >
                {/* Step Icon / Number Indicator */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isCurrent
                      ? "bg-blue-600 text-white shadow-xs font-black text-xs sm:text-sm"
                      : "bg-slate-100 text-slate-500 font-bold text-xs"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Step Text Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-[13px] font-bold truncate">
                      <span className="hidden md:inline">{step.title}</span>
                      <span className="md:hidden">{step.shortTitle}</span>
                    </span>
                    {engineRunning && step.id === "monitor" && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-normal truncate hidden sm:block">
                    {step.subtitle}
                  </p>
                </div>

                {/* Active Indicator Bar */}
                {isCurrent && (
                  <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
