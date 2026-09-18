import React, { useState } from "react";
import {
  Users,
  Plus,
  Trash2,
  ExternalLink,
  CheckSquare,
  Square,
  MinusSquare,
  Upload,
  Download,
  Search,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Ban,
  RotateCcw,
  Sparkles,
  Check,
  ChevronDown,
  ChevronRight,
  User,
  Globe,
  Lock,
  EyeOff,
} from "lucide-react";
import { FacebookGroup, FacebookProfile } from "../types";
import { INITIAL_GROUPS } from "../utils/spintax";
import {
  downloadSampleCsvTemplate,
  exportGroupsToCsv,
  parseImportedDataToGroups,
} from "../utils/csvGroupTemplate";

interface GroupManagerProps {
  groups: FacebookGroup[];
  setGroups: React.Dispatch<React.SetStateAction<FacebookGroup[]>>;
  onGoToSchedule: () => void;
  profiles?: FacebookProfile[];
  activeProfileId?: string;
  onOpenProfileModal?: () => void;
  onOpenReportModal?: () => void;
  onOpenDiagnosticModal?: () => void;
}

export const GroupManager: React.FC<GroupManagerProps> = ({
  groups,
  setGroups,
  onGoToSchedule,
  profiles = [],
  activeProfileId,
  onOpenProfileModal,
  onOpenReportModal,
  onOpenDiagnosticModal,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterShift, setFilterShift] = useState<"all" | "morning" | "evening">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "safe" | "pending" | "blocked" | "ready">("all");
  const [filterProfile, setFilterProfile] = useState<string>("all");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form states for adding single group
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupUrl, setNewGroupUrl] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState<"discussion" | "marketplace">("discussion");
  const [newGroupShift, setNewGroupShift] = useState<"all" | "morning" | "evening">("all");
  const [newGroupProfileId, setNewGroupProfileId] = useState<string>(activeProfileId || (profiles[0]?.id ?? ""));

  // Form states for bulk import
  const [importText, setImportText] = useState("");

  // Quick status popover tracking
  const [activeStatusMenuId, setActiveStatusMenuId] = useState<string | null>(null);
  const [activeProfileMenuId, setActiveProfileMenuId] = useState<string | null>(null);

  // Computed metrics
  const safeCount = groups.filter(
    (g) => g.lastStatus === "success" || (g.isVerifiedSafe && g.lastStatus !== "blocked")
  ).length;

  const pendingCount = groups.filter((g) => g.lastStatus === "pending_approval").length;
  const blockedCount = groups.filter((g) => g.lastStatus === "blocked" || g.lastStatus === "error").length;
  const readyCount = groups.filter((g) => g.lastStatus === "ready" || (!g.lastStatus && g.lastStatus !== "success" && g.lastStatus !== "blocked" && g.lastStatus !== "pending_approval")).length;
  const selectedCount = groups.filter((g) => g.isActive).length;

  const isAllSelected = groups.length > 0 && selectedCount === groups.length;
  const isSomeSelected = selectedCount > 0 && selectedCount < groups.length;

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, 3500);
  };

  const handleToggleGroup = (id: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isActive: !g.isActive } : g))
    );
  };

  const handleToggleAll = (active: boolean) => {
    setGroups((prev) => prev.map((g) => ({ ...g, isActive: active })));
    showToast(active ? `Đã chọn toàn bộ ${groups.length} nhóm.` : "Đã bỏ chọn tất cả các nhóm.");
  };

  // Master checkbox toggle for current filtered view or all
  const handleMasterCheckboxClick = () => {
    if (isAllSelected) {
      handleToggleAll(false);
    } else {
      handleToggleAll(true);
    }
  };

  // Focus only on safe / unblocked groups
  const handleFocusSafeGroups = () => {
    let count = 0;
    setGroups((prev) =>
      prev.map((g) => {
        const isSafe = g.lastStatus === "success" || (g.isVerifiedSafe === true && g.lastStatus !== "blocked");
        if (isSafe) count++;
        return {
          ...g,
          isActive: isSafe,
        };
      })
    );
    setFilterStatus("safe");
    showToast(
      `🎯 ĐÃ CHỌN ${count} NHÓM THÀNH CÔNG KHÔNG BỊ CHẶN! Đã tự động bỏ qua các nhóm bị chặn hoặc chờ duyệt.`
    );
  };

  // Select only groups that succeeded in posting (for next posting run)
  const handleSelectOnlySuccessGroups = () => {
    let count = 0;
    setGroups((prev) =>
      prev.map((g) => {
        const isSuccess =
          g.lastStatus === "success" ||
          (g.successCount && g.successCount > 0 && g.lastStatus !== "blocked" && g.lastStatus !== "pending_approval");
        if (isSuccess) count++;
        return {
          ...g,
          isActive: !!isSuccess,
        };
      })
    );
    setFilterStatus("safe");
    showToast(
      `🎯 ĐÃ CHỌN ${count} NHÓM ĐÃ ĐĂNG THÀNH CÔNG ĐỂ TIẾP TỤC ĐĂNG CA SAU! Bỏ qua các nhóm chờ duyệt/chặn.`
    );
  };

  // Select only pending approval groups
  const handleSelectOnlyPendingGroups = () => {
    let count = 0;
    setGroups((prev) =>
      prev.map((g) => {
        const isPending = g.lastStatus === "pending_approval";
        if (isPending) count++;
        return {
          ...g,
          isActive: isPending,
        };
      })
    );
    setFilterStatus("pending");
    showToast(`🟡 ĐÃ CHỌN ${count} NHÓM ĐANG CHỜ PHÊ DUYỆT!`);
  };

  // Select only Public Groups to ensure 100% visible posts
  const handleSelectOnlyPublicGroups = () => {
    let count = 0;
    setGroups((prev) =>
      prev.map((g) => {
        const isPublic = g.privacy !== "private";
        if (isPublic) count++;
        return {
          ...g,
          isActive: isPublic,
        };
      })
    );
    showToast(
      `🌐 ĐÃ CHỌN ${count} NHÓM CÔNG KHAI (PUBLIC)! Đảm bảo 100% ai có link cũng xem được bài.`
    );
  };

  const handleDeleteSingleGroup = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhóm này khỏi danh sách?")) {
      setGroups((prev) => prev.filter((g) => g.id !== id));
      showToast("Đã xóa 1 nhóm khỏi danh sách.");
    }
  };

  // Execute bulk delete for all currently checked groups
  const handleConfirmDeleteSelected = () => {
    const deletedAmount = selectedCount;
    setGroups((prev) => prev.filter((g) => !g.isActive));
    setShowDeleteModal(false);
    showToast(`Đã xóa thành công ${deletedAmount} nhóm khỏi danh sách.`);
  };

  // Restore sample default groups if deleted or requested
  const handleRestoreDefaultGroups = () => {
    if (confirm("Khôi phục lại 20 nhóm Facebook mẫu chuẩn có sẵn dữ liệu theo dõi thành công?")) {
      setGroups(INITIAL_GROUPS);
      showToast("Đã khôi phục lại 20 nhóm Facebook chuẩn.");
    }
  };

  // Manually update status of a group
  const handleUpdateGroupStatus = (
    id: string,
    status: "success" | "pending_approval" | "blocked" | "ready",
    note?: string
  ) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        return {
          ...g,
          lastStatus: status,
          isVerifiedSafe: status === "success",
          successCount: status === "success" ? (g.successCount || 0) + 1 : g.successCount,
          blockedCount: status === "blocked" ? (g.blockedCount || 0) + 1 : g.blockedCount,
          postNote: note || (status === "success" ? "Đăng mượt, không bị chặn" : status === "blocked" ? "Bị chặn / cấm đăng" : status === "pending_approval" ? "Chờ admin duyệt" : "Sẵn sàng"),
          lastPostedAt: status === "success" ? "Vừa xong" : g.lastPostedAt,
        };
      })
    );
    setActiveStatusMenuId(null);
    showToast("Đã cập nhật trạng thái theo dõi của nhóm.");
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupUrl.trim()) return;

    const newGroup: FacebookGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      url: newGroupUrl.trim(),
      isActive: true,
      category: newGroupCategory,
      shift: newGroupShift,
      lastStatus: "ready",
      successCount: 0,
      blockedCount: 0,
      isVerifiedSafe: false,
      assignedProfileId: newGroupProfileId || activeProfileId || (profiles[0]?.id ?? ""),
    };

    setGroups((prev) => [newGroup, ...prev]);
    setNewGroupName("");
    setNewGroupUrl("");
    setShowAddModal(false);
    showToast(`Đã thêm nhóm "${newGroup.name}" vào danh sách.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const { groups: newItems, count } = parseImportedDataToGroups(content, groups.length);
      if (count > 0) {
        setGroups((prev) => [...prev, ...newItems]);
        setShowImportModal(false);
        setImportText("");
        showToast(`Đã nạp thành công ${count} nhóm từ tệp "${file.name}"!`);
      } else {
        setImportText(content);
        showToast("Không tìm thấy link nhóm hợp lệ trong file. Bạn có thể kiểm tra nội dung bên dưới.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleBatchImport = () => {
    const trimmedInput = importText.trim();
    if (!trimmedInput) return;

    const { groups: newItems, count } = parseImportedDataToGroups(trimmedInput, groups.length);
    if (count > 0) {
      setGroups((prev) => [...prev, ...newItems]);
      setImportText("");
      setShowImportModal(false);
      showToast(`Đã nạp thành công ${count} nhóm mới vào danh sách!`);
    } else {
      showToast("Không nhận diện được đường link nhóm Facebook hợp lệ.");
    }
  };

  // Filter groups
  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.url.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesShift =
      filterShift === "all" || g.shift === "all" || g.shift === filterShift;

    let matchesStatus = true;
    if (filterStatus === "safe") {
      matchesStatus = g.lastStatus === "success" || (g.isVerifiedSafe === true && g.lastStatus !== "blocked");
    } else if (filterStatus === "pending") {
      matchesStatus = g.lastStatus === "pending_approval";
    } else if (filterStatus === "blocked") {
      matchesStatus = g.lastStatus === "blocked" || g.lastStatus === "error";
    } else if (filterStatus === "ready") {
      matchesStatus = g.lastStatus === "ready" || (!g.lastStatus);
    }

    const matchesProfile =
      filterProfile === "all" ||
      g.assignedProfileId === filterProfile ||
      (!g.assignedProfileId && filterProfile === (profiles[0]?.id || "prof-1"));

    return matchesSearch && matchesShift && matchesStatus && matchesProfile;
  });

  const handleAssignProfile = (groupId: string, profileId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, assignedProfileId: profileId } : g))
    );
    setActiveProfileMenuId(null);
    const pName = profiles.find((p) => p.id === profileId)?.name || "Nick";
    showToast(`Đã gán nhóm cho nick "${pName}".`);
  };

  const handleBulkAssignProfile = (profileId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.isActive ? { ...g, assignedProfileId: profileId } : g))
    );
    const pName = profiles.find((p) => p.id === profileId)?.name || "Nick";
    showToast(`Đã gán ${selectedCount} nhóm đã chọn cho nick "${pName}".`);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Toast Notification Banner */}
      {actionNotice && (
        <div className="p-2.5 px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center justify-between shadow-md transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-white/80 hover:text-white text-xs ml-3 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Quản Lý & Lọc Nhóm Mục Tiêu ({groups.length} nhóm)
            </h2>
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200">
              Đang chọn: {selectedCount}/{groups.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Theo dõi tỷ lệ đăng mượt, lưu trữ nhóm không bị chặn và tự động lọc nhóm uy tín cho ca đăng tiếp theo.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 w-full md:w-auto flex-wrap">
          {onOpenProfileModal && (
            <button
              onClick={onOpenProfileModal}
              className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
              title="Quản lý danh sách Nick Facebook & Profile Chrome"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Gán Nick Facebook ({profiles.length})</span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Nhóm</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Nhập File / Dán Link</span>
          </button>
          <button
            onClick={() => exportGroupsToCsv(groups)}
            className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
            title="Xuất danh sách nhóm kèm trạng thái ra file Excel (.CSV UTF-8)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất Excel (.CSV)</span>
          </button>
          <button
            onClick={downloadSampleCsvTemplate}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
            title="Tải tệp mẫu Excel chuẩn để điền và nhập nhóm"
          >
            <Tag className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">File Mẫu CSV</span>
          </button>
          <button
            onClick={() => {
              const dataStr =
                "data:text/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify(groups, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", "facebook_groups_config.json");
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
            title="Xuất file JSON sao lưu"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">JSON</span>
          </button>
        </div>
      </div>

      {/* SAFETY & SUCCESS TRACKING BANNER - TẬP TRUNG ĐĂNG BÀI NHÓM THÀNH CÔNG */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-blue-50 border border-emerald-200/80 rounded-xl p-3 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Lọc Nhóm Thành Công & Kiểm Soát Phê Duyệt
                </h3>
                <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {safeCount}/{groups.length} thành công ({Math.round(groups.length > 0 ? (safeCount / groups.length) * 100 : 0)}%)
                </span>
                {pendingCount > 0 && (
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    {pendingCount} chờ duyệt
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600">
                Chỉ chọn các trang/nhóm đã đăng tải thành công để tiếp tục đăng ca sau. Tự động loại trừ nhóm bị chặn hoặc cấm link.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto flex-wrap">
            <button
              onClick={handleSelectOnlySuccessGroups}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
              title="Chỉ chọn các trang/nhóm đã đăng tải thành công để chạy ca sau"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>🎯 Đăng Tiếp {safeCount} Nhóm Thành Công</span>
            </button>

            <button
              onClick={handleSelectOnlyPublicGroups}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
              title="Chỉ chọn nhóm Công Khai để đảm bảo bất kỳ ai có link cũng xem được bài"
            >
              <Globe className="w-3.5 h-3.5 text-yellow-300" />
              <span>🌐 Nhóm Công Khai</span>
            </button>

            {pendingCount > 0 && (
              <button
                onClick={handleSelectOnlyPendingGroups}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all whitespace-nowrap"
                title="Lọc và chọn các nhóm đang chờ admin duyệt bài"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>⏳ Chờ Duyệt ({pendingCount})</span>
              </button>
            )}

            {onOpenDiagnosticModal && (
              <button
                onClick={onOpenDiagnosticModal}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all whitespace-nowrap"
                title="Hướng dẫn xử lý lỗi Bạn hiện không xem được nội dung này"
              >
                <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Không Xem Được Bài?</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Metrics cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-emerald-100/70 text-xs">
          <button
            onClick={() => setFilterStatus("safe")}
            className={`p-2 rounded-lg text-left transition-all border ${
              filterStatus === "safe"
                ? "bg-white border-emerald-400 shadow-2xs ring-1 ring-emerald-400"
                : "bg-white/70 border-emerald-200/60 hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-emerald-800 text-[10px] font-bold">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Thành Công / Không Chặn
              </span>
              <span className="text-xs font-black">{safeCount}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Duyệt tự động, không cấm link</div>
          </button>

          <button
            onClick={() => setFilterStatus("pending")}
            className={`p-2 rounded-lg text-left transition-all border ${
              filterStatus === "pending"
                ? "bg-white border-amber-400 shadow-2xs ring-1 ring-amber-400"
                : "bg-white/70 border-slate-200 hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-amber-800 text-[10px] font-bold">
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Chờ Admin Duyệt
              </span>
              <span className="text-xs font-black">{pendingCount}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Bài gửi đi đang đợi phê duyệt</div>
          </button>

          <button
            onClick={() => setFilterStatus("blocked")}
            className={`p-2 rounded-lg text-left transition-all border ${
              filterStatus === "blocked"
                ? "bg-white border-red-400 shadow-2xs ring-1 ring-red-400"
                : "bg-white/70 border-slate-200 hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-red-800 text-[10px] font-bold">
              <span className="flex items-center gap-1">
                <Ban className="w-3.5 h-3.5 text-red-600" />
                Bị Chặn / Lỗi Link
              </span>
              <span className="text-xs font-black">{blockedCount}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Bị cấm hoặc vi phạm nhóm</div>
          </button>

          <button
            onClick={() => setFilterStatus("ready")}
            className={`p-2 rounded-lg text-left transition-all border ${
              filterStatus === "ready"
                ? "bg-white border-blue-400 shadow-2xs ring-1 ring-blue-400"
                : "bg-white/70 border-slate-200 hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-slate-700 text-[10px] font-bold">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Chưa Đăng / Sẵn Sàng
              </span>
              <span className="text-xs font-black">{readyCount}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Nhóm mới sẵn sàng test ca</div>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar with BULK DELETE FUNCTION */}
      <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên nhóm hoặc đường link..."
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Shift Filter buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              Ca:
            </span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setFilterShift("all")}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all whitespace-nowrap ${
                  filterShift === "all" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tất Cả ({groups.length})
              </button>
              <button
                onClick={() => setFilterShift("morning")}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all whitespace-nowrap ${
                  filterShift === "morning" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Ca Sáng
              </button>
              <button
                onClick={() => setFilterShift("evening")}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all whitespace-nowrap ${
                  filterShift === "evening" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Ca Tối
              </button>
            </div>
          </div>

          {/* Profile Filter */}
          {profiles.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <User className="w-3 h-3 text-blue-600" />
                Nick FB:
              </span>
              <select
                value={filterProfile}
                onChange={(e) => setFilterProfile(e.target.value)}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-800 cursor-pointer focus:outline-none"
              >
                <option value="all">Tất cả nick ({groups.length})</option>
                {profiles.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name} {prof.chromeProfile ? `(${prof.chromeProfile})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Sub-toolbar: Status Filter Pills + Selection & BULK DELETE WHEN ALL SELECTED */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full text-[11px]">
            <span className="text-slate-400 font-semibold text-[10px] mr-0.5">Lọc:</span>
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-2 py-0.5 rounded-full font-semibold transition-colors whitespace-nowrap border ${
                filterStatus === "all"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Tất Cả ({groups.length})
            </button>
            <button
              onClick={() => setFilterStatus("safe")}
              className={`px-2 py-0.5 rounded-full font-semibold transition-colors whitespace-nowrap border ${
                filterStatus === "safe"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              🟢 Thành Công ({safeCount})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-2 py-0.5 rounded-full font-semibold transition-colors whitespace-nowrap border ${
                filterStatus === "pending"
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
              }`}
            >
              🟡 Chờ Duyệt ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus("blocked")}
              className={`px-2 py-0.5 rounded-full font-semibold transition-colors whitespace-nowrap border ${
                filterStatus === "blocked"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
              }`}
            >
              🔴 Bị Chặn ({blockedCount})
            </button>
            <button
              onClick={() => setFilterStatus("ready")}
              className={`px-2 py-0.5 rounded-full font-semibold transition-colors whitespace-nowrap border ${
                filterStatus === "ready"
                  ? "bg-slate-700 text-white border-slate-700"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              ⚪ Chưa Đăng ({readyCount})
            </button>
          </div>

          {/* Action Row: Selection buttons & BULK DELETE BUTTON */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
            <button
              onClick={() => handleToggleAll(true)}
              className="text-blue-600 hover:text-blue-700 font-bold px-2 py-1 rounded bg-blue-50/70 hover:bg-blue-100 text-[11px] transition-colors"
              title="Chọn tất cả nhóm trong danh sách"
            >
              Chọn Hết ({groups.length})
            </button>
            <button
              onClick={() => handleToggleAll(false)}
              className="text-slate-500 hover:text-slate-700 font-medium px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] transition-colors"
              title="Bỏ chọn toàn bộ"
            >
              Bỏ Chọn
            </button>

            {/* BULK DELETE BUTTON - Prominently shown when selected */}
            {selectedCount > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs ${
                  isAllSelected
                    ? "bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-300"
                    : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-300"
                }`}
                title={
                  isAllSelected
                    ? "Xóa toàn bộ các nhóm khi đã chọn hết"
                    : `Xóa ${selectedCount} nhóm đang được chọn`
                }
              >
                <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  {isAllSelected
                    ? `Xóa Khi Chọn Hết (${selectedCount} nhóm)`
                    : `Xóa Đã Chọn (${selectedCount})`}
                </span>
              </button>
            )}

            {groups.length === 0 && (
              <button
                onClick={handleRestoreDefaultGroups}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold flex items-center gap-1 border border-blue-200"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Khôi Phục Nhóm Mẫu</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* NOTICE: REAL GROUPS GUIDANCE */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-900 shadow-2xs">
        <div className="flex items-start sm:items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="leading-relaxed">
            <span className="font-bold text-amber-950">Lưu ý để bài viết đăng được thật lên Facebook:</span> Các nhóm bên dưới là danh sách mẫu mô phỏng. Hãy bấm <strong>"Thêm Nhóm"</strong> hoặc <strong>"Nhập Hàng Loạt"</strong> để thay bằng các link nhóm Facebook THẬT mà tài khoản của bạn ĐÃ THAM GIA!
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowImportModal(true)}
          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs whitespace-nowrap shadow-2xs cursor-pointer flex-shrink-0"
        >
          + Nhập Danh Sách Nhóm Thật
        </button>
      </div>

      {/* TABLE & MOBILE VIEW */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table/List Subheader with Master Checkbox & Count */}
        <div className="bg-slate-50 p-2.5 px-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleMasterCheckboxClick}
              className="text-blue-600 hover:text-blue-700 p-0.5 flex items-center gap-1.5 font-bold"
              title={isAllSelected ? "Bỏ chọn tất cả" : "Chọn toàn bộ nhóm"}
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : isSomeSelected ? (
                <MinusSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-[11px] text-slate-700 hidden sm:inline">
                {isAllSelected ? "Đã chọn tất cả" : "Chọn tất cả"}
              </span>
            </button>
            <span className="text-slate-400 text-[11px] hidden sm:inline">•</span>
            <span className="text-[11px] text-slate-600">
              Hiển thị <strong className="text-slate-900 font-bold">{filteredGroups.length}</strong> / {groups.length} nhóm
              {filterStatus !== "all" && (
                <span className="ml-1 text-blue-600 font-semibold">(Đang lọc)</span>
              )}
            </span>
          </div>

          {/* If items are selected, show delete reminder badge */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-medium">
                Đang tích chọn: <strong className="text-blue-700">{selectedCount}</strong>
              </span>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-0.5"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa {selectedCount} nhóm</span>
              </button>
            </div>
          )}
        </div>

        {/* MOBILE VIEW (<640px) */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {filteredGroups.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-slate-400 text-xs font-medium">
                Không tìm thấy nhóm nào phù hợp với bộ lọc hiện tại.
              </p>
              {groups.length === 0 && (
                <button
                  onClick={handleRestoreDefaultGroups}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục 20 nhóm mẫu</span>
                </button>
              )}
            </div>
          ) : (
            filteredGroups.map((group, index) => {
              const isGroupSafe =
                group.lastStatus === "success" || (group.isVerifiedSafe && group.lastStatus !== "blocked");

              return (
                <div
                  key={group.id}
                  className={`p-3 transition-colors ${
                    group.isActive ? "bg-white" : "bg-slate-50/70 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Left: Checkbox + Group Info */}
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <button
                        onClick={() => handleToggleGroup(group.id)}
                        className="mt-0.5 text-blue-600 p-0.5 flex-shrink-0"
                        aria-label="Chọn nhóm này"
                      >
                        {group.isActive ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        {/* Name & Index */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            #{index + 1}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {group.name}
                          </h4>
                          {group.privacy === "private" ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Lock className="w-2.5 h-2.5" />
                              Nhóm Kín
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Globe className="w-2.5 h-2.5" />
                              Công Khai
                            </span>
                          )}
                          {group.memberCount && (
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({group.memberCount})
                            </span>
                          )}
                        </div>

                        {/* URL */}
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-blue-600 font-mono">
                          <a
                            href={group.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline truncate max-w-[200px]"
                          >
                            {group.url}
                          </a>
                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 text-slate-400" />
                        </div>

                        {/* Badges row: Category, Shift, Track record */}
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {/* Category */}
                          <span
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold whitespace-nowrap ${
                              group.category === "discussion"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                          >
                            <Tag className="w-2.5 h-2.5" />
                            <span>{group.category === "discussion" ? "Thảo luận" : "Mua bán"}</span>
                          </span>

                          {/* Shift */}
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                            <Clock className="w-2.5 h-2.5 text-slate-500" />
                            <span>
                              {group.shift === "all"
                                ? "Cả 2 ca"
                                : group.shift === "morning"
                                ? "Ca sáng"
                                : "Ca tối"}
                            </span>
                          </span>

                          {/* Safety Status & Success Count Badge */}
                          {group.lastStatus === "success" ? (
                            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[9px] font-bold whitespace-nowrap">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>
                                Đăng mượt {group.successCount || 1} lần • An toàn
                              </span>
                            </span>
                          ) : group.lastStatus === "blocked" ? (
                            <span className="inline-flex items-center gap-1 text-red-800 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 text-[9px] font-bold whitespace-nowrap">
                              <Ban className="w-3 h-3 text-red-600" />
                              <span>Bị chặn / Lỗi link</span>
                            </span>
                          ) : group.lastStatus === "pending_approval" ? (
                            <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[9px] font-bold whitespace-nowrap">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <span>Chờ admin duyệt</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-slate-500 text-[9px] whitespace-nowrap">
                              • Sẵn sàng
                            </span>
                          )}

                          {group.lastPostedAt && (
                            <span className="text-[9px] text-slate-400 font-mono">
                              ({group.lastPostedAt})
                            </span>
                          )}

                          {/* Profile Tag Badge */}
                          {profiles.length > 0 && (
                            <div className="relative inline-block">
                              <button
                                onClick={() =>
                                  setActiveProfileMenuId(
                                    activeProfileMenuId === group.id ? null : group.id
                                  )
                                }
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 whitespace-nowrap"
                                title="Bấm để đổi Nick Facebook phụ trách nhóm này"
                              >
                                <User className="w-2.5 h-2.5 text-blue-600" />
                                <span>
                                  {profiles.find((p) => p.id === group.assignedProfileId)?.name ||
                                    profiles[0]?.name ||
                                    "Nick mặc định"}
                                </span>
                                <ChevronDown className="w-2 h-2 text-blue-400" />
                              </button>

                              {activeProfileMenuId === group.id && (
                                <div className="absolute left-0 top-6 z-30 bg-white border border-slate-200 rounded-lg shadow-xl p-1.5 w-44 space-y-0.5 text-[10px]">
                                  <div className="font-bold text-slate-400 px-1 py-0.5 uppercase tracking-wider text-[8px]">
                                    Gán Nick Đăng Bài
                                  </div>
                                  {profiles.map((prof) => {
                                    const isCurrent =
                                      (group.assignedProfileId || profiles[0]?.id) === prof.id;
                                    return (
                                      <button
                                        key={prof.id}
                                        onClick={() => handleAssignProfile(group.id, prof.id)}
                                        className={`w-full text-left px-1.5 py-1 rounded flex items-center justify-between ${
                                          isCurrent
                                            ? "bg-blue-50 text-blue-900 font-bold"
                                            : "hover:bg-slate-50 text-slate-700"
                                        }`}
                                      >
                                        <span className="truncate">{prof.name}</span>
                                        {isCurrent && (
                                          <Check className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Last Post URL link if available */}
                          {group.lastPostUrl && (
                            <a
                              href={group.lastPostUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:underline whitespace-nowrap"
                              title="Bấm để xem bài viết vừa đăng trên Facebook"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span>Link Bài Đã Đăng</span>
                            </a>
                          )}
                        </div>

                        {group.postNote && (
                          <div className="mt-1 text-[10px] text-slate-500 italic">
                            Ghi chú: {group.postNote}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Quick status changer button & Delete button */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveStatusMenuId(
                              activeStatusMenuId === group.id ? null : group.id
                            )
                          }
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="Đổi trạng thái theo dõi"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Mini Status Popover Menu */}
                        {activeStatusMenuId === group.id && (
                          <div className="absolute right-0 top-7 z-20 bg-white border border-slate-200 rounded-lg shadow-xl p-1.5 w-44 space-y-1 text-[10px]">
                            <div className="font-bold text-slate-500 px-1.5 py-0.5 uppercase tracking-wider text-[9px]">
                              Đổi Trạng Thái
                            </div>
                            <button
                              onClick={() => handleUpdateGroupStatus(group.id, "success")}
                              className="w-full text-left px-2 py-1 rounded hover:bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-1.5"
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Thành công (Không chặn)</span>
                            </button>
                            <button
                              onClick={() => handleUpdateGroupStatus(group.id, "pending_approval")}
                              className="w-full text-left px-2 py-1 rounded hover:bg-amber-50 text-amber-800 font-semibold flex items-center gap-1.5"
                            >
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <span>Chờ admin duyệt</span>
                            </button>
                            <button
                              onClick={() => handleUpdateGroupStatus(group.id, "blocked")}
                              className="w-full text-left px-2 py-1 rounded hover:bg-red-50 text-red-800 font-semibold flex items-center gap-1.5"
                            >
                              <Ban className="w-3 h-3 text-red-600" />
                              <span>Bị chặn / Cấm đăng</span>
                            </button>
                            <button
                              onClick={() => handleUpdateGroupStatus(group.id, "ready")}
                              className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1.5"
                            >
                              <RotateCcw className="w-3 h-3 text-slate-400" />
                              <span>Đặt lại (Chưa đăng)</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteSingleGroup(group.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Xóa nhóm này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* TABLE VIEW (>=640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider">
              <tr className="whitespace-nowrap">
                <th className="py-2.5 px-3 w-10 text-center">
                  <button
                    onClick={handleMasterCheckboxClick}
                    className="p-0.5 inline-flex items-center justify-center text-blue-600 hover:text-blue-700"
                    title={isAllSelected ? "Bỏ chọn tất cả" : "Chọn toàn bộ"}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : isSomeSelected ? (
                      <MinusSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-2.5 px-3">Tên Nhóm & Đường Dẫn Facebook</th>
                {profiles.length > 0 && (
                  <th className="py-2.5 px-3 w-36">Nick FB Phụ Trách</th>
                )}
                <th className="py-2.5 px-3 w-28">Phân Loại</th>
                <th className="py-2.5 px-3 w-24">Ca Đăng</th>
                <th className="py-2.5 px-3 w-48">Theo Dõi Thành Công & Trạng Thái</th>
                <th className="py-2.5 px-3 w-12 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={profiles.length > 0 ? 7 : 6} className="text-center py-10 text-slate-400 font-medium text-xs">
                    <div className="space-y-2">
                      <p>Không tìm thấy nhóm nào phù hợp với bộ lọc hiện tại.</p>
                      {groups.length === 0 && (
                        <button
                          onClick={handleRestoreDefaultGroups}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Khôi phục 20 nhóm mẫu ban đầu</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group, index) => {
                  return (
                    <tr
                      key={group.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        group.isActive ? "bg-white" : "opacity-50 bg-slate-50/40"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleToggleGroup(group.id)}
                          className="text-blue-600 hover:text-blue-700 p-0.5 inline-flex items-center justify-center transition-transform active:scale-95"
                          aria-label="Tích chọn nhóm"
                        >
                          {group.isActive ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* Name & URL */}
                      <td className="py-2 px-3 min-w-[220px]">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                          <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                            #{index + 1}
                          </span>
                          <span className="truncate max-w-xs md:max-w-md" title={group.name}>
                            {group.name}
                          </span>
                          {group.privacy === "private" ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Lock className="w-2.5 h-2.5" />
                              Nhóm Kín
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Globe className="w-2.5 h-2.5" />
                              Công Khai
                            </span>
                          )}
                          {group.memberCount && (
                            <span className="text-[10px] text-slate-500 font-normal whitespace-nowrap flex-shrink-0">
                              ({group.memberCount})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-blue-600 font-mono">
                          <a
                            href={group.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline truncate max-w-xs"
                          >
                            {group.url}
                          </a>
                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 text-slate-400" />
                        </div>
                        {group.lastPostUrl && (
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-emerald-700 font-semibold font-mono">
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Bài đã đăng:
                            </span>
                            <a
                              href={group.lastPostUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline truncate max-w-xs flex items-center gap-0.5"
                            >
                              <span>{group.lastPostUrl}</span>
                              <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                            </a>
                          </div>
                        )}
                        {group.postNote && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5">
                            {group.postNote}
                          </div>
                        )}
                      </td>

                      {/* Assigned Profile Tag */}
                      {profiles.length > 0 && (
                        <td className="py-2 px-3 whitespace-nowrap">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveProfileMenuId(
                                  activeProfileMenuId === group.id ? null : group.id
                                )
                              }
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-colors"
                              title="Bấm để đổi Nick Facebook phụ trách nhóm này"
                            >
                              <User className="w-2.5 h-2.5 text-blue-600" />
                              <span className="truncate max-w-[90px]">
                                {profiles.find((p) => p.id === group.assignedProfileId)?.name ||
                                  profiles[0]?.name ||
                                  "Mặc định"}
                              </span>
                              <ChevronDown className="w-2.5 h-2.5 text-blue-400" />
                            </button>

                            {activeProfileMenuId === group.id && (
                              <div className="absolute left-0 top-7 z-30 bg-white border border-slate-200 rounded-lg shadow-xl p-1.5 w-48 space-y-0.5 text-[11px]">
                                <div className="font-bold text-slate-400 px-1 py-0.5 uppercase tracking-wider text-[9px]">
                                  Gán Nick FB Đăng Bài
                                </div>
                                {profiles.map((prof) => {
                                  const isCurrent =
                                    (group.assignedProfileId || profiles[0]?.id) === prof.id;
                                  return (
                                    <button
                                      key={prof.id}
                                      onClick={() => handleAssignProfile(group.id, prof.id)}
                                      className={`w-full text-left px-2 py-1 rounded flex items-center justify-between text-xs ${
                                        isCurrent
                                          ? "bg-blue-50 text-blue-900 font-bold"
                                          : "hover:bg-slate-50 text-slate-700"
                                      }`}
                                    >
                                      <span className="truncate">{prof.name}</span>
                                      {isCurrent && (
                                        <Check className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Category */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                            group.category === "discussion"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          <Tag className="w-2.5 h-2.5" />
                          <span>{group.category === "discussion" ? "Thảo luận" : "Rao vặt/Bán"}</span>
                        </span>
                      </td>

                      {/* Shift */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                          <Clock className="w-2.5 h-2.5 text-slate-500" />
                          <span>
                            {group.shift === "all"
                              ? "Cả 2 ca"
                              : group.shift === "morning"
                              ? "Ca sáng"
                              : "Ca tối"}
                          </span>
                        </span>
                      </td>

                      {/* Status & Safe Tracking */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {group.lastStatus === "success" ? (
                            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] font-bold whitespace-nowrap">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Đăng mượt {group.successCount || 1} lần • An toàn</span>
                            </span>
                          ) : group.lastStatus === "blocked" ? (
                            <span className="inline-flex items-center gap-1 text-red-800 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 text-[10px] font-bold whitespace-nowrap">
                              <Ban className="w-3 h-3 text-red-600" />
                              <span>Bị chặn / Cấm đăng</span>
                            </span>
                          ) : group.lastStatus === "pending_approval" ? (
                            <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px] font-bold whitespace-nowrap">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <span>Chờ admin duyệt</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 text-[10px] whitespace-nowrap">
                              <span>• Sẵn sàng</span>
                            </span>
                          )}

                          {/* Mini interactive status selector */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveStatusMenuId(
                                  activeStatusMenuId === group.id ? null : group.id
                                )
                              }
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              title="Thay đổi trạng thái theo dõi"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {activeStatusMenuId === group.id && (
                              <div className="absolute left-0 sm:right-0 sm:left-auto top-6 z-20 bg-white border border-slate-200 rounded-lg shadow-xl p-1.5 w-44 space-y-1 text-[10px]">
                                <div className="font-bold text-slate-500 px-1.5 py-0.5 uppercase tracking-wider text-[9px]">
                                  Đổi Trạng Thái
                                </div>
                                <button
                                  onClick={() => handleUpdateGroupStatus(group.id, "success")}
                                  className="w-full text-left px-2 py-1 rounded hover:bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-1.5"
                                >
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>Thành công (Không chặn)</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateGroupStatus(group.id, "pending_approval")}
                                  className="w-full text-left px-2 py-1 rounded hover:bg-amber-50 text-amber-800 font-semibold flex items-center gap-1.5"
                                >
                                  <AlertCircle className="w-3 h-3 text-amber-600" />
                                  <span>Chờ admin duyệt</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateGroupStatus(group.id, "blocked")}
                                  className="w-full text-left px-2 py-1 rounded hover:bg-red-50 text-red-800 font-semibold flex items-center gap-1.5"
                                >
                                  <Ban className="w-3 h-3 text-red-600" />
                                  <span>Bị chặn / Cấm đăng</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateGroupStatus(group.id, "ready")}
                                  className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1.5"
                                >
                                  <RotateCcw className="w-3 h-3 text-slate-400" />
                                  <span>Đặt lại (Chưa đăng)</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteSingleGroup(group.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Xóa nhóm này khỏi danh sách"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & next button */}
        <div className="p-2.5 sm:p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="text-slate-600 text-center sm:text-left text-[11px] flex items-center gap-2 flex-wrap">
            <span>
              Đang chọn <strong className="text-blue-700 font-bold">{selectedCount}</strong> / {groups.length} nhóm.
            </span>
            {selectedCount > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 hover:text-red-700 font-semibold hover:underline flex items-center gap-0.5"
              >
                <Trash2 className="w-3 h-3" />
                <span>
                  {isAllSelected
                    ? `Xóa khi chọn hết (${selectedCount})`
                    : `Xóa ${selectedCount} nhóm đã chọn`}
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onGoToSchedule}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Tiếp Tục ➔ Lên Lịch & 1-Click Tự Đăng (Bước 3)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRM BULK DELETE MODAL (XÓA KHI CHỌN HẾT / XÓA ĐÃ CHỌN) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm p-4 space-y-3 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {isAllSelected
                    ? `Xác Nhận Xóa Toàn Bộ ${selectedCount} Nhóm?`
                    : `Xác Nhận Xóa ${selectedCount} Nhóm Đã Chọn?`}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {isAllSelected
                    ? "Bạn đang chọn toàn bộ danh sách. Hành động này sẽ xóa tất cả nhóm mục tiêu hiện có. Bạn có thể khôi phục danh sách nhóm mẫu bất kỳ lúc nào."
                    : `Bạn có chắc chắn muốn xóa ${selectedCount} nhóm đang được tích chọn không? Sau khi xóa, danh sách còn lại ${
                        groups.length - selectedCount
                      } nhóm.`}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSelected}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {isAllSelected ? "Xóa Khi Chọn Hết Ngay" : `Xóa ${selectedCount} Nhóm`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Single Group Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-2xs">
          <form
            onSubmit={handleAddGroup}
            className="bg-white border border-slate-200 rounded-xl w-full max-w-sm p-4 space-y-3 shadow-2xl"
          >
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              Thêm Nhóm Facebook Mới
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tên Nhóm:
              </label>
              <input
                type="text"
                required
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="VD: Hội Xây Dựng & Cơ Điện Hà Nội"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Đường Dẫn URL Nhóm (Facebook):
              </label>
              <input
                type="url"
                required
                value={newGroupUrl}
                onChange={(e) => setNewGroupUrl(e.target.value)}
                placeholder="https://www.facebook.com/groups/..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Phân Loại:
                </label>
                <select
                  value={newGroupCategory}
                  onChange={(e) => setNewGroupCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="discussion">Thảo luận</option>
                  <option value="marketplace">Mua bán / Rao vặt</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ca Đăng:
                </label>
                <select
                  value={newGroupShift}
                  onChange={(e) => setNewGroupShift(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Cả 2 ca</option>
                  <option value="morning">Chỉ ca Sáng</option>
                  <option value="evening">Chỉ ca Tối</option>
                </select>
              </div>
            </div>

            {profiles.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-blue-600" />
                  Nick Facebook Phụ Trách (Profile Tagging):
                </label>
                <select
                  value={newGroupProfileId}
                  onChange={(e) => setNewGroupProfileId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                >
                  {profiles.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.name} {prof.chromeProfileName ? `(${prof.chromeProfileName})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
              >
                Lưu Nhóm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batch Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-4 sm:p-5 space-y-3.5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Nhập Hàng Loạt Nhóm (Không Giới Hạn)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Thêm 50, 100, 200+ nhóm bằng cách dán danh sách hoặc tải tệp lên
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 rounded-md hover:bg-slate-100"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-2.5 text-[11px] text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span>Không giới hạn số lượng nhóm lưu trữ:</span>
              </div>
              <p className="text-slate-600">
                Hệ thống hỗ trợ lưu hàng trăm nhóm. Bạn có thể chia thành <strong>Ca Sáng</strong> và <strong>Ca Tối</strong>, lọc nhóm <strong>An toàn không bị chặn</strong> để luân phiên đăng bài mà không lo bị Facebook khóa nick.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <label className="text-xs font-bold text-slate-700">
                  Dán Danh Sách Link Hoặc Tải File:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={downloadSampleCsvTemplate}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5"
                  >
                    <Download className="w-3 h-3" />
                    <span>Tải File Mẫu Excel (.CSV)</span>
                  </button>
                  <span className="text-slate-300">|</span>
                  <label className="cursor-pointer text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Chọn tệp .csv / .json / .txt</span>
                    <input
                      type="file"
                      accept=".txt,.csv,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <textarea
                rows={7}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="https://www.facebook.com/groups/dan.cu.ecopark&#10;Hội Cư Dân Ecopark, https://www.facebook.com/groups/dan.cu.ecopark, public, ready&#10;Hội Cơ Điện Hà Nội | https://www.facebook.com/groups/codien.hanoi&#10;Gia Đình Smart City, https://www.facebook.com/groups/smartcity&#10;..."
                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
              ></textarea>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                <span>Hỗ trợ: Copy-paste từ Excel (.csv), đường link đơn lẻ, <code>Tên | URL</code> hoặc <code>Tên, URL, public/private</code></span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-600 font-medium">
                Đã nhận diện: <strong className="text-blue-700 font-bold">{importText.split("\n").filter((l) => l.trim()).length}</strong> nhóm
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleBatchImport}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Nạp Vào Danh Sách
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
