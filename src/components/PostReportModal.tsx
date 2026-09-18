import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Copy,
  ExternalLink,
  Check,
  Search,
  Filter,
  Trash2,
  Edit3,
  ShieldCheck,
  AlertCircle,
  Ban,
  Clock,
  User,
  Plus,
} from "lucide-react";
import { PostResultRecord, FacebookProfile } from "../types";

interface PostReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: PostResultRecord[];
  setRecords: React.Dispatch<React.SetStateAction<PostResultRecord[]>>;
  profiles: FacebookProfile[];
}

export const PostReportModal: React.FC<PostReportModalProps> = ({
  isOpen,
  onClose,
  records,
  setRecords,
  profiles,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProfile, setFilterProfile] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [copiedLinks, setCopiedLinks] = useState(false);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);

  // Edit link modal/input state
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState<string>("");
  const [editingStatus, setEditingStatus] = useState<PostResultRecord["status"]>("success");

  if (!isOpen) return null;

  // Filtered records
  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.profileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.postUrl && rec.postUrl.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProfile =
      filterProfile === "all" || rec.profileId === filterProfile || rec.profileName === filterProfile;

    const matchesStatus = filterStatus === "all" || rec.status === filterStatus;

    return matchesSearch && matchesProfile && matchesStatus;
  });

  // Export to CSV (Excel compatible with UTF-8 BOM)
  const handleExportCSV = () => {
    if (records.length === 0) {
      alert("Chưa có bản ghi bài đăng nào để xuất.");
      return;
    }

    const headers = [
      "STT",
      "Thời Gian",
      "Tên Nhóm Facebook",
      "Link Nhóm",
      "Nick Facebook Đăng",
      "Trạng Thái",
      "Link Bài Viết Trực Tiếp",
      "Nội Dung Biến Thể Spintax",
      "Ghi Chú",
    ];

    const rows = records.map((r, i) => [
      i + 1,
      `"${r.timestamp}"`,
      `"${r.groupName.replace(/"/g, '""')}"`,
      `"${r.groupUrl}"`,
      `"${r.profileName.replace(/"/g, '""')}"`,
      `"${
        r.status === "success"
          ? "Đăng thành công"
          : r.status === "pending_approval"
          ? "Chờ duyệt"
          : "Bị chặn"
      }"`,
      `"${r.postUrl || r.groupUrl}"`,
      `"${r.contentVariant.replace(/"/g, '""').replace(/\n/g, " ")}"`,
      `"${(r.note || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `bao_cao_link_dang_fb_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `fb_post_reports_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Copy all links
  const handleCopyAllLinks = () => {
    const textList = filteredRecords
      .map(
        (r, idx) =>
          `${idx + 1}. [${r.profileName}] ${r.groupName}: ${r.postUrl || r.groupUrl} (${
            r.status === "success" ? "Đã đăng" : "Chờ duyệt"
          })`
      )
      .join("\n");

    navigator.clipboard.writeText(textList);
    setCopiedLinks(true);
    setTimeout(() => setCopiedLinks(false), 2000);
  };

  // Copy single row text/link
  const handleCopyRow = (rec: PostResultRecord) => {
    navigator.clipboard.writeText(rec.postUrl || rec.groupUrl);
    setCopiedRowId(rec.id);
    setTimeout(() => setCopiedRowId(null), 2000);
  };

  // Save edit url
  const handleSaveEditUrl = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, postUrl: editingUrl.trim(), status: editingStatus } : r
      )
    );
    setEditingRecordId(null);
  };

  // Delete single record
  const handleDeleteRecord = (id: string) => {
    if (confirm("Bạn có muốn xóa bản ghi này?")) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Clear all records
  const handleClearAll = () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử bài đăng?")) {
      setRecords([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                Báo Cáo & Xuất Danh Sách Link Bài Viết Đã Đăng
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  {records.length} bài đăng
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Lưu trữ bằng chứng bài viết, link trực tiếp, tài khoản Facebook đăng bài và xuất file báo cáo
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

        {/* Toolbar: Search, Filters & Export Buttons */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          {/* Left: Search & Filter selects */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm nhóm, link..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Profile Filter */}
            <div className="flex items-center gap-1 text-xs">
              <User className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
              <select
                value={filterProfile}
                onChange={(e) => setFilterProfile(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-medium"
              >
                <option value="all">Tất cả nick FB</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-medium"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="success">🟢 Đã đăng mượt</option>
              <option value="pending_approval">🟡 Chờ admin duyệt</option>
              <option value="blocked">🔴 Bị chặn/Lỗi</option>
            </select>
          </div>

          {/* Right: Export & Copy Actions */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end flex-wrap">
            <button
              onClick={handleCopyAllLinks}
              disabled={filteredRecords.length === 0}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs disabled:opacity-50"
              title="Sao chép toàn bộ link bài viết"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copiedLinks ? "Đã Chép!" : "Chép Toàn Bộ Link"}</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={records.length === 0}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors disabled:opacity-50"
              title="Xuất file Excel CSV kèm đầy đủ thông tin"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Báo Cáo Excel (CSV)</span>
            </button>

            {records.length > 0 && (
              <button
                onClick={handleClearAll}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-200"
                title="Xóa toàn bộ lịch sử"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table list */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">
                {records.length === 0
                  ? "Chưa có bài đăng nào được ghi nhận."
                  : "Không tìm thấy kết quả phù hợp với bộ lọc."}
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Khi bạn chạy ca đăng bài hoặc bấm vào nhóm để đăng, hệ thống sẽ tự động tổng hợp danh sách link bài viết và tài khoản Facebook tương ứng tại đây.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 border-collapse">
                  <thead className="bg-slate-100/80 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Nhóm Facebook Mục Tiêu</th>
                      <th className="py-2.5 px-3">Nick FB Đăng Bài</th>
                      <th className="py-2.5 px-3">Thời Gian</th>
                      <th className="py-2.5 px-3">Trạng Thái</th>
                      <th className="py-2.5 px-3">Link Bài Viết / Nhóm</th>
                      <th className="py-2.5 px-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredRecords.map((rec, index) => {
                      const isEditing = editingRecordId === rec.id;

                      return (
                        <tr
                          key={rec.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* Index */}
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 text-center">
                            {index + 1}
                          </td>

                          {/* Group Name & Category */}
                          <td className="py-2.5 px-3 min-w-[160px]">
                            <div className="font-bold text-slate-900 leading-tight">
                              {rec.groupName}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                              {rec.groupUrl}
                            </div>
                          </td>

                          {/* Profile Tag */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              <User className="w-2.5 h-2.5" />
                              {rec.profileName}
                            </span>
                          </td>

                          {/* Timestamp */}
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {rec.timestamp}
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {rec.status === "success" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                Đã Đăng Mượt
                              </span>
                            ) : rec.status === "pending_approval" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                Chờ Admin Duyệt
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-800 border border-red-200">
                                <Ban className="w-3 h-3 text-red-600" />
                                Bị Chặn / Lỗi
                              </span>
                            )}
                          </td>

                          {/* Direct Link or Edit Link Box */}
                          <td className="py-2.5 px-3 min-w-[220px]">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  placeholder="Dán link bài viết trực tiếp..."
                                  value={editingUrl}
                                  onChange={(e) => setEditingUrl(e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-blue-400 rounded bg-white"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveEditUrl(rec.id)}
                                  className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold"
                                >
                                  Lưu
                                </button>
                                <button
                                  onClick={() => setEditingRecordId(null)}
                                  className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px]"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 font-mono text-[11px] text-blue-600">
                                <a
                                  href={rec.postUrl || rec.groupUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:underline truncate max-w-[200px]"
                                  title={rec.postUrl || rec.groupUrl}
                                >
                                  {rec.postUrl || rec.groupUrl}
                                </a>
                                <a
                                  href={rec.postUrl || rec.groupUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 text-slate-400 hover:text-blue-600"
                                  title="Mở tab mới kiểm tra"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleCopyRow(rec)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                                title="Sao chép link này"
                              >
                                {copiedRowId === rec.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  setEditingRecordId(rec.id);
                                  setEditingUrl(rec.postUrl || "");
                                  setEditingStatus(rec.status);
                                }}
                                className="p-1 text-slate-400 hover:text-amber-600 rounded hover:bg-slate-100"
                                title="Cập nhật link bài viết thật hoặc ghi chú"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteRecord(rec.id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                                title="Xóa bản ghi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-slate-500 text-[11px] flex items-center gap-2">
            <span>
              Đang hiển thị: <strong>{filteredRecords.length}/{records.length}</strong> bài
            </span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">
              {records.filter((r) => r.status === "success").length} thành công
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs text-xs"
          >
            Đóng Báo Cáo
          </button>
        </div>
      </div>
    </div>
  );
};
