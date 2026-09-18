import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  Check,
  Star,
  ExternalLink,
  ShieldCheck,
  Info,
  Layers,
} from "lucide-react";
import { FacebookProfile } from "../types";

interface ProfileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: FacebookProfile[];
  setProfiles: React.Dispatch<React.SetStateAction<FacebookProfile[]>>;
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
}

export const ProfileManagerModal: React.FC<ProfileManagerModalProps> = ({
  isOpen,
  onClose,
  profiles,
  setProfiles,
  activeProfileId,
  setActiveProfileId,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState("");
  const [chromeProfileName, setChromeProfileName] = useState("Default");
  const [fbUidOrUsername, setFbUidOrUsername] = useState("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState<FacebookProfile["color"]>("blue");

  if (!isOpen) return null;

  const resetForm = () => {
    setName("");
    setChromeProfileName("Default");
    setFbUidOrUsername("");
    setNotes("");
    setColor("blue");
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Vui lòng nhập tên nick Facebook.");
      return;
    }

    if (editingId) {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name: name.trim(),
                chromeProfileName: chromeProfileName.trim() || "Default",
                fbUidOrUsername: fbUidOrUsername.trim(),
                notes: notes.trim(),
                color,
              }
            : p
        )
      );
    } else {
      const newProfile: FacebookProfile = {
        id: `prof-${Date.now()}`,
        name: name.trim(),
        chromeProfileName: chromeProfileName.trim() || "Default",
        fbUidOrUsername: fbUidOrUsername.trim(),
        notes: notes.trim(),
        color,
        isDefault: profiles.length === 0,
      };
      setProfiles((prev) => [...prev, newProfile]);
      if (profiles.length === 0) {
        setActiveProfileId(newProfile.id);
      }
    }

    resetForm();
  };

  const handleStartEdit = (profile: FacebookProfile) => {
    setEditingId(profile.id);
    setName(profile.name);
    setChromeProfileName(profile.chromeProfileName);
    setFbUidOrUsername(profile.fbUidOrUsername || "");
    setNotes(profile.notes || "");
    setColor(profile.color || "blue");
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (profiles.length <= 1) {
      alert("Cần giữ lại ít nhất 1 nick Facebook trong danh sách.");
      return;
    }
    if (confirm("Bạn có chắc muốn xóa nick này?")) {
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      if (activeProfileId === id) {
        const remaining = profiles.filter((p) => p.id !== id);
        if (remaining.length > 0) {
          setActiveProfileId(remaining[0].id);
        }
      }
    }
  };

  const handleSetDefault = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) => ({
        ...p,
        isDefault: p.id === id,
      }))
    );
    setActiveProfileId(id);
  };

  const getColorClasses = (c?: string) => {
    switch (c) {
      case "purple":
        return {
          bg: "bg-purple-50",
          text: "text-purple-800",
          border: "border-purple-200",
          badge: "bg-purple-100 text-purple-800",
        };
      case "emerald":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-800",
          border: "border-emerald-200",
          badge: "bg-emerald-100 text-emerald-800",
        };
      case "amber":
        return {
          bg: "bg-amber-50",
          text: "text-amber-800",
          border: "border-amber-200",
          badge: "bg-amber-100 text-amber-800",
        };
      case "rose":
        return {
          bg: "bg-rose-50",
          text: "text-rose-800",
          border: "border-rose-200",
          badge: "bg-rose-100 text-rose-800",
        };
      default:
        return {
          bg: "bg-blue-50",
          text: "text-blue-800",
          border: "border-blue-200",
          badge: "bg-blue-100 text-blue-800",
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                Quản Lý Nick Facebook (Profile Tagging)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  {profiles.length} tài khoản
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Gắn nhãn nick nào đang chạy bài, phân quyền nhóm và cấu hình Profile Chrome
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

        {/* Explain Banner */}
        <div className="p-3 bg-blue-50/70 border-b border-blue-100 text-[11px] text-blue-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Xác định Nick đăng bài:</strong> Bằng cách đặt tên nick và Profile Chrome tương ứng, bạn sẽ luôn biết chính xác bài viết trong nhóm được đẩy bởi nick nào. Khi xuất báo cáo hoặc chạy Script Playwright, hệ thống sẽ tự động đồng bộ đúng nick này!
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3">
          {/* Top action: Add new profile toggle */}
          {!showAddForm ? (
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">
                Danh sách nick quản lý:
              </span>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Thêm Nick Facebook</span>
              </button>
            </div>
          ) : (
            /* Add / Edit Form */
            <form
              onSubmit={handleSaveProfile}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 mb-3 animate-in fade-in"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-900">
                  {editingId ? "Chỉnh sửa Nick Facebook" : "Thêm Nick Facebook Mới"}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Hủy
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tên Nick Gợi Nhớ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nick Chính (Lê Nam) / Nick Bán Hàng 01"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Profile Chrome (Trình duyệt máy tính)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Default, Profile 1, Profile 2..."
                    value={chromeProfileName}
                    onChange={(e) => setChromeProfileName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Link Trang Cá Nhân hoặc UID (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: https://facebook.com/nam.le.999"
                    value={fbUidOrUsername}
                    onChange={(e) => setFbUidOrUsername(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Màu Nhãn Đại Diện
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    {(["blue", "purple", "emerald", "amber", "rose"] as const).map(
                      (c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            c === "blue"
                              ? "bg-blue-500"
                              : c === "purple"
                              ? "bg-purple-500"
                              : c === "emerald"
                              ? "bg-emerald-500"
                              : c === "amber"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          } ${
                            color === c
                              ? "border-slate-900 scale-110 shadow-xs"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ghi chú mục đích / Độ uy tín nick
                </label>
                <input
                  type="text"
                  placeholder="VD: Nick nuôi trên 2 năm, chuyên đẩy bài M&E, ít bị chặn..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                >
                  {editingId ? "Cập Nhật Nick" : "Lưu Nick Mới"}
                </button>
              </div>
            </form>
          )}

          {/* List of Profiles */}
          <div className="space-y-2">
            {profiles.map((profile) => {
              const isActive = profile.id === activeProfileId;
              const colorCls = getColorClasses(profile.color);

              return (
                <div
                  key={profile.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isActive
                      ? "bg-blue-50/50 border-blue-300 ring-1 ring-blue-400 shadow-2xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {/* Avatar / Color Badge */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 border ${colorCls.bg} ${colorCls.text} ${colorCls.border}`}
                      >
                        {profile.name.charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900">
                            {profile.name}
                          </h4>
                          {profile.isDefault && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              Mặc định
                            </span>
                          )}
                          {isActive && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-bold flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" />
                              Đang Chọn Thực Thi
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                          <span className="inline-flex items-center gap-1 font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-slate-700">
                            Chrome: {profile.chromeProfileName}
                          </span>
                          {profile.fbUidOrUsername && (
                            <a
                              href={
                                profile.fbUidOrUsername.startsWith("http")
                                  ? profile.fbUidOrUsername
                                  : `https://facebook.com/${profile.fbUidOrUsername}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-0.5 truncate max-w-[180px]"
                            >
                              <span>{profile.fbUidOrUsername}</span>
                              <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                            </a>
                          )}
                        </div>

                        {profile.notes && (
                          <p className="text-[10px] text-slate-500 mt-1 italic">
                            Ghi chú: {profile.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!isActive && (
                        <button
                          onClick={() => setActiveProfileId(profile.id)}
                          className="px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200 transition-colors"
                          title="Chọn nick này để chạy bài"
                        >
                          Chọn Dùng
                        </button>
                      )}

                      {!profile.isDefault && (
                        <button
                          onClick={() => handleSetDefault(profile.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-slate-100"
                          title="Đặt làm nick mặc định"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleStartEdit(profile)}
                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                        title="Chỉnh sửa thông tin nick"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(profile.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-slate-100"
                        title="Xóa nick này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Nick đang thực thi:{" "}
            <strong className="text-slate-900">
              {profiles.find((p) => p.id === activeProfileId)?.name || "Chưa chọn"}
            </strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs text-xs"
          >
            Hoàn Tất
          </button>
        </div>
      </div>
    </div>
  );
};
