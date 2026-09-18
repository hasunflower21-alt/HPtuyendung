import React, { useState } from "react";
import {
  AlertTriangle,
  Lock,
  Globe,
  UserCheck,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Search,
  FileSpreadsheet,
  Shuffle,
  EyeOff,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { FacebookGroup, FacebookProfile, PostResultRecord } from "../types";

interface PostVisibilityDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: FacebookGroup[];
  setGroups: React.Dispatch<React.SetStateAction<FacebookGroup[]>>;
  profiles: FacebookProfile[];
  onOpenReportModal?: () => void;
  onFilterPublicOnly?: () => void;
}

export const PostVisibilityDiagnosticModal: React.FC<PostVisibilityDiagnosticModalProps> = ({
  isOpen,
  onClose,
  groups,
  setGroups,
  profiles,
  onOpenReportModal,
  onFilterPublicOnly,
}) => {
  const [testUrl, setTestUrl] = useState("");
  const [analysisResult, setAnalysisResult] = useState<{
    status: "valid_post" | "group_only" | "unknown" | "private_suspected";
    message: string;
    details: string[];
    suggestedAction: string;
    cleanUrl?: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"diagnose" | "reasons" | "guide">("diagnose");

  if (!isOpen) return null;

  // URL Analyzer
  const handleAnalyzeUrl = (urlToTest: string) => {
    const trimmed = urlToTest.trim();
    if (!trimmed) {
      setAnalysisResult(null);
      return;
    }

    if (!trimmed.includes("facebook.com") && !trimmed.includes("fb.com") && !trimmed.includes("fb.watch")) {
      setAnalysisResult({
        status: "unknown",
        message: "Đường dẫn không phải liên kết Facebook hợp lệ.",
        details: ["Vui lòng dán link Facebook có dạng https://www.facebook.com/..."],
        suggestedAction: "Kiểm tra lại đường dẫn từ thanh địa chỉ trình duyệt.",
      });
      return;
    }

    // Check if it's a direct post permalink
    const isPostUrl =
      trimmed.includes("/posts/") ||
      trimmed.includes("/permalink/") ||
      trimmed.includes("story_fbid=") ||
      trimmed.includes("/feed_preview/");

    // Check if it's just group home URL
    const isGroupOnly =
      (trimmed.includes("/groups/") || trimmed.includes("facebook.com/group")) && !isPostUrl;

    if (isPostUrl) {
      setAnalysisResult({
        status: "valid_post",
        message: "Link có cấu trúc bài viết trực tiếp (Permalink).",
        details: [
          "✅ Link trỏ trực tiếp đến ID bài viết cụ thể trên Facebook.",
          "⚠️ Nếu vẫn bị báo 'Bạn hiện không xem được nội dung này':",
          "1. Nhóm này là NHÓM KÍN (Private): Trình duyệt đang mở chưa đăng nhập nick đã được duyệt vào nhóm.",
          "2. Bài viết đang CHỜ DUYỆT (Pending): Admin nhóm chưa duyệt nên người ngoài và nick khác chưa thấy.",
          "3. Đang mở trên Cửa sổ Ẩn danh (Incognito) hoặc sai nick Facebook.",
        ],
        suggestedAction: "Mở link này trên cửa sổ Chrome/trình duyệt đang đăng nhập đúng Nick đã đăng bài.",
        cleanUrl: trimmed.split("?")[0],
      });
    } else if (isGroupOnly) {
      setAnalysisResult({
        status: "group_only",
        message: "Đây là Link Trang Chủ Nhóm, không phải Link bài viết trực tiếp.",
        details: [
          "🔍 Link này chỉ dẫn về bảng tin chung của nhóm (facebook.com/groups/...).",
          "📌 Khi nhấp vào, bạn sẽ chỉ thấy đầu trang nhóm, cần kéo xuống hoặc vào mục 'Quản lý bài viết' để tìm bài của mình.",
          "💡 Cách lấy Link bài viết thật: Tìm bài viết vừa đăng -> Nhấp chuột phải vào dòng thời gian (vd: 'Vừa xong' hoặc '5 phút') -> Chọn 'Sao chép địa chỉ liên kết'.",
        ],
        suggestedAction: "Lấy link trực tiếp bằng cách nhấp vào thời gian đăng của bài viết trong nhóm.",
        cleanUrl: trimmed,
      });
    } else {
      setAnalysisResult({
        status: "private_suspected",
        message: "Liên kết Facebook cá nhân / Trang / Watch.",
        details: [
          "Nếu bài đăng ở chế độ Bạn bè hoặc Nhóm kín, bất kỳ ai chưa kết bạn hoặc chưa vào nhóm sẽ nhận thông báo lỗi 'Bạn hiện không xem được nội dung này'.",
        ],
        suggestedAction: "Chuyển quyền riêng tư bài viết thành Công Khai (Public 🌐) hoặc kiểm tra quyền truy cập.",
        cleanUrl: trimmed,
      });
    }
  };

  // Quick fix: Set all groups to Public filter
  const handleSelectAllPublicGroups = () => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        isActive: g.privacy !== "private",
      }))
    );
    if (onFilterPublicOnly) onFilterPublicOnly();
    alert("Đã tự động chọn các nhóm CÔNG KHAI (Public). Các nhóm kín/riêng tư đã được bỏ chọn để đảm bảo 100% ai có link cũng xem được bài!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header with Visual Alert Banner */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-50 via-white to-red-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <EyeOff className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                Trung Tâm Chẩn Đoán & Khắc Phục: "Không Xem Được Bài Đăng"
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-red-100 text-red-800 font-bold border border-red-200">
                  Lỗi Facebook Phổ Biến
                </span>
              </h3>
              <p className="text-[11px] text-slate-600">
                Giải quyết lỗi <em>"Bạn hiện không xem được nội dung này"</em> khi bấm vào link bài đăng Facebook
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

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-3 pt-2 gap-1 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("diagnose")}
            className={`px-3 py-2 font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "diagnose"
                ? "bg-white text-blue-700 border-blue-600 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 border-transparent"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Soi & Kiểm Tra Link Trực Tiếp</span>
          </button>
          <button
            onClick={() => setActiveTab("reasons")}
            className={`px-3 py-2 font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "reasons"
                ? "bg-white text-amber-700 border-amber-600 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 border-transparent"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>5 Nguyên Nhân & Cách Khắc Phục</span>
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-3 py-2 font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "guide"
                ? "bg-white text-emerald-700 border-emerald-600 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 border-transparent"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Quy Chuẩn Đăng 100% Xem Được</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 text-xs text-slate-700">
          {/* TAB 1: DIAGNOSE & LINK INSPECTOR */}
          {activeTab === "diagnose" && (
            <div className="space-y-4">
              {/* Visual Recreation of Facebook Error Screenshot */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-200 text-slate-600 flex-shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-xs">
                    Hiện tượng: Màn hình Facebook thông báo "Bạn hiện không xem được nội dung này"
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Đây là thông báo bảo mật mặc định của Facebook khi một tài khoản cố gắng truy cập bài viết trong <strong>Nhóm Kín (Private Group)</strong> mà chưa được duyệt vào nhóm, hoặc bài viết <strong>đang chờ admin duyệt</strong>, hoặc mở bằng tài khoản khác nick đã đăng.
                  </p>
                </div>
              </div>

              {/* Link Input Box */}
              <div className="space-y-2">
                <label className="font-bold text-slate-900 flex items-center justify-between text-xs">
                  <span>Dán đường link bạn vừa nhấp vào để hệ thống soi & phân tích:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Link bài viết hoặc link nhóm</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Dán link (ví dụ: https://www.facebook.com/groups/.../posts/...)"
                      value={testUrl}
                      onChange={(e) => {
                        setTestUrl(e.target.value);
                        handleAnalyzeUrl(e.target.value);
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <button
                    onClick={() => handleAnalyzeUrl(testUrl)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs whitespace-nowrap shadow-xs"
                  >
                    Kiểm Tra Link
                  </button>
                </div>
              </div>

              {/* Quick Suggestions from History */}
              {profiles.length > 0 && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
                  <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Danh Sách Nick Facebook Hiện Có Trong Tool ({profiles.length} nick):</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-[10px]">
                    {profiles.map((p) => (
                      <span
                        key={p.id}
                        className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-blue-800 font-medium"
                      >
                        👤 {p.name} ({p.chromeProfileName})
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-blue-700">
                    💡 Khi bài đăng được đẩy bằng nick nào, hãy mở đúng Profile Chrome chứa nick đó để xem được toàn bộ bài viết trong nhóm kín và bài chờ duyệt.
                  </p>
                </div>
              )}

              {/* Analysis Result Box */}
              {analysisResult && (
                <div
                  className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                    analysisResult.status === "valid_post"
                      ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                      : analysisResult.status === "group_only"
                      ? "bg-amber-50/80 border-amber-200 text-amber-950"
                      : "bg-red-50/80 border-red-200 text-red-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs flex items-center gap-2">
                      {analysisResult.status === "valid_post" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : analysisResult.status === "group_only" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                      )}
                      <span>{analysisResult.message}</span>
                    </div>

                    {analysisResult.cleanUrl && (
                      <a
                        href={analysisResult.cleanUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-bold font-mono"
                      >
                        <span>Mở Trực Tiếp</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  <ul className="space-y-1 text-[11px] text-slate-700 pl-4 list-disc">
                    {analysisResult.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>

                  <div className="p-2.5 bg-white/90 rounded-lg border border-slate-200/80 text-[11px] font-semibold text-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>{analysisResult.suggestedAction}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Banner: Lọc nhóm công khai ngay */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs flex items-center gap-1.5 text-white">
                    <Globe className="w-4 h-4 text-yellow-300" />
                    Giải Pháp Triệt Để: Chỉ Đăng Vào Nhóm Công Khai (Public)
                  </h4>
                  <p className="text-[11px] text-emerald-100 mt-0.5">
                    Bài đăng trên Nhóm Công Khai thì bất kỳ ai có link (khách hàng, đối tác, bạn bè) đều xem được 100% không lo bị chặn.
                  </p>
                </div>
                <button
                  onClick={handleSelectAllPublicGroups}
                  className="px-3 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold rounded-lg whitespace-nowrap shadow-sm transition-colors"
                >
                  Tự Động Chọn Nhóm Công Khai &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: 5 REASONS & SOLUTIONS */}
          {activeTab === "reasons" && (
            <div className="space-y-3">
              {/* Reason 1: Private Group */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Nguyên nhân 1: Nhóm Kín / Nhóm Riêng Tư (Private Group)</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Facebook có 2 loại nhóm: <strong>Công Khai (Public)</strong> và <strong>Riêng Tư (Private)</strong>. Khi bài viết đăng trong nhóm Riêng Tư, thuật toán Facebook khóa hiển thị đối với tất cả những người chưa tham gia nhóm. Nếu bạn mở bằng nick khác hoặc gửi link cho khách hàng, họ sẽ nhận thông báo lỗi <em>"Bạn hiện không xem được nội dung này"</em>.
                </p>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-semibold">
                  👉 <strong>Khắc phục:</strong> Ưu tiên chọn các <strong>Nhóm Công Khai</strong> trong danh sách. Nếu đăng nhóm kín, hãy yêu cầu người xem tham gia nhóm trước.
                </div>
              </div>

              {/* Reason 2: Pending Approval */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-blue-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Nguyên nhân 2: Bài viết đang "Chờ Quản Trị Viên Duyệt"</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Một số nhóm bật chế độ kiểm duyệt trước khi hiển thị. Sau khi bot hoặc nick bạn bấm Đăng, bài viết được đưa vào hàng đợi chờ Admin/Mod phê duyệt. Lúc này bài viết chưa công khai trên tường nhóm nên link bài sẽ báo lỗi không xem được.
                </p>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-[11px] font-semibold">
                  👉 <strong>Khắc phục:</strong> Dùng chính Nick đã đăng bài, truy cập vào nhóm -&gt; Bấm vào mục <strong>"Nội dung của bạn" (Your Content)</strong> hoặc <strong>"Quản lý bài viết"</strong> để xem trạng thái bài đang chờ duyệt.
                </div>
              </div>

              {/* Reason 3: Opened in Wrong Profile or Incognito */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-indigo-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>Nguyên nhân 3: Mở sai Nick Facebook hoặc Cửa sổ Ẩn danh</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Bạn đăng bài bằng <em>"Nick Phụ 01"</em> trên Chrome Profile 1, nhưng khi bấm mở link trong báo cáo, Windows lại mở bằng trình duyệt mặc định đang đăng nhập <em>"Nick Cá Nhân Chính"</em> (hoặc chưa đăng nhập Facebook).
                </p>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 text-[11px] font-semibold">
                  👉 <strong>Khắc phục:</strong> Nhấp nút <strong>"Sao Chép Link"</strong> trong bảng Báo Cáo, sau đó dán vào đúng cửa sổ Chrome có Profile nick đã thực hiện đăng.
                </div>
              </div>

              {/* Reason 4: Link format is Group URL instead of Post Permalink */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <ExternalLink className="w-4 h-4 text-emerald-600" />
                  <span>Nguyên nhân 4: Link trỏ vào Nhóm chứ chưa có ID Bài Viết thật</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Khi đăng bài tự động, nếu không lưu lại ID bài viết thật dạng <code>/posts/123456789/</code> mà chỉ mở link nhóm chung <code>/groups/startup/</code>, bạn sẽ không thấy ngay bài của mình nếu nhóm có lượng bài đăng lớn.
                </p>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-semibold">
                  👉 <strong>Cách lấy link chuẩn 100%:</strong> Nhấp chuột vào thời gian hiển thị dưới tên bạn (vd: <em>"Vừa xong"</em> hoặc <em>"10 phút"</em>) -&gt; Copy đường link trên thanh URL.
                </div>
              </div>

              {/* Reason 5: Spam Filter / Post Removed */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-rose-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px]">
                    5
                  </span>
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Nguyên nhân 5: Thuật toán Facebook gỡ bài do nghi vấn Spam</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Nếu đăng cùng 1 nội dung giống nhau 100% vào nhiều nhóm liên tục không giãn cách, bộ lọc AI của Facebook sẽ tự động gắn cờ spam và ẩn/gỡ bài ngay sau khi đăng.
                </p>
                <div className="p-2 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 text-[11px] font-semibold">
                  👉 <strong>Khắc phục:</strong> Bắt buộc dùng <strong>Spintax xoay vòng từ ngữ</strong> + Cài đặt <strong>giãn cách nghỉ 4 - 8 phút</strong> trong mục Lập Lịch để hoạt động y như người dùng thật.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STEP BY STEP GUIDE */}
          {activeTab === "guide" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>4 Bước Thực Hiện Chuẩn Để Bài Đăng Luôn Hiển Thị 100%</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Phân Loại Nhóm Trong Quản Lý Nhóm</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Gắn nhãn <strong>Công Khai (Public)</strong> cho các nhóm ai cũng xem được. Đối với nhóm Kín, đảm bảo tài khoản đã tham gia và trả lời câu hỏi của admin trước khi đăng.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Sử Dụng Spintax Biến Thể Tự Nhiên</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Sử dụng mẫu Spintax tạo ra hàng chục ngàn câu từ độc bản giúp mã hash của bài viết hoàn toàn khác nhau, tránh 100% việc bị Facebook quét bài trùng lặp.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Mở Đúng Nick Facebook Phụ Trách</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Khi kiểm tra bài viết hoặc sao chép link, hãy dán vào đúng cửa sổ trình duyệt có cookie của nick đã đăng bài để kiểm tra cả bài đã duyệt và bài đang chờ duyệt.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Cập Nhật Link Bài Viết Thật Trong Báo Cáo</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Trong bảng <strong>Báo Cáo & Link Bài Đăng</strong>, bạn có thể bấm biểu tượng cây bút để sửa/dán link permalink chính xác của bài viết để lưu trữ bằng chứng nghiệm thu lâu dài.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              if (onOpenReportModal) {
                onClose();
                onOpenReportModal();
              }
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mở Bảng Báo Cáo Bài Đăng</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs text-xs"
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
