import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  Users,
  Clock,
  Terminal,
  ShieldCheck,
  Zap,
  HelpCircle,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Laptop,
  Flame,
  FileCode,
  Save,
  Image as ImageIcon,
} from "lucide-react";

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScriptModal?: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenScriptModal,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const steps = [
    {
      id: "overview",
      title: "Tổng Quan & Cách Hoạt Động",
      shortTitle: "Nguyên Lý",
      icon: Sparkles,
      iconColor: "text-blue-600",
    },
    {
      id: "step1",
      title: "1. Soạn Bài & Lưu Bản Nháp",
      shortTitle: "Soạn & Lưu Bài",
      icon: Save,
      iconColor: "text-amber-500",
    },
    {
      id: "step2",
      title: "2. Chọn Nhóm & Gắn Profile",
      shortTitle: "Quản Lý Nhóm",
      icon: Users,
      iconColor: "text-indigo-600",
    },
    {
      id: "step3",
      title: "3. Cài Đặt Giãn Cách An Toàn",
      shortTitle: "Lập Lịch An Toàn",
      icon: Clock,
      iconColor: "text-emerald-600",
    },
    {
      id: "step4",
      title: "4. Tự Động Đăng 100% Bằng Script",
      shortTitle: "Chạy Tự Động",
      icon: Terminal,
      iconColor: "text-purple-600",
    },
    {
      id: "faq",
      title: "Câu Hỏi Thường Gặp (FAQ)",
      shortTitle: "Hỏi Đáp FAQ",
      icon: HelpCircle,
      iconColor: "text-rose-500",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                Hướng Dẫn Sử Dụng FB Đẩy Bài Toàn Diện
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  Dành Cho Người Mới
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Hiểu rõ cách vận hành, tự động lưu bài viết & kích hoạt tự động đăng an toàn 100%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2 rounded-xl text-xs font-bold transition-colors"
          >
            ✕ Đóng
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 bg-white px-3 sm:px-5 py-2 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${s.iconColor}`} />
                <span>{s.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/50 flex-1">
          {/* TAB 0: OVERVIEW */}
          {activeStep === 0 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Flame className="w-4 h-4 text-blue-600" />
                  <span>Mô Hình 2 Tầng: An Toàn Tuyệt Đối Cho Nick Facebook</span>
                </div>
                <p className="text-xs leading-relaxed text-blue-800">
                  Facebook quét rất gắt các website bên ngoài tự ý đăng nhập tài khoản. Để bảo vệ nick của bạn không bị checkpoint hay khóa vĩnh viễn, hệ thống được thiết kế thành 2 thành phần phối hợp:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">
                      1
                    </span>
                    <span>Bàn Điều Khiển Trên Web (App này)</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Nơi bạn soạn nội dung, tải ảnh, viết cú pháp trộn Spintax, quản lý 19+ nhóm Facebook, lưu trữ các bản nháp và định hình ca đăng (sáng / tối, nghỉ 4–8 phút). Toàn bộ được <strong>tự động lưu vĩnh viễn</strong> trên trình duyệt của bạn.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                    <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs">
                      2
                    </span>
                    <span>Script Tự Động Đăng Trên Máy (Playwright)</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    File kịch bản tự động mở Google Chrome của chính bạn (nơi bạn đã đăng nhập nick Facebook sẵn). Script tự động nhận toàn bộ bài viết, ảnh và danh sách nhóm từ App web sang để tự gõ phím, tự đính kèm ảnh và bấm đăng 100% không cần bạn can thiệp.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Tại sao mô hình này an toàn hơn các tool web khác?</span>
                </div>
                <p className="text-xs text-emerald-800">
                  Bạn <strong>không bao giờ phải giao mật khẩu, Cookie hay mã 2FA</strong> cho máy chủ web. Facebook nhìn nhận thao tác đăng bài xuất phát từ chính máy tính và trình duyệt hàng ngày của bạn với IP quen thuộc, hoàn toàn giống người thật 100%.
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: COMPOSE & SAVE */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Save className="w-4 h-4 text-amber-500" />
                  Tự Động Lưu Bài Viết & Ảnh Đính Kèm
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
                  <li>
                    <strong>Tự động lưu tức thì:</strong> Mọi chữ bạn gõ, các thẻ Spintax và toàn bộ ảnh bạn tải lên đều được tự động lưu vào bộ nhớ đệm (IndexedDB). Khi bạn tải lại trang (F5) hoặc mở lại hôm sau, bài viết và ảnh vẫn nguyên vẹn 100%.
                  </li>
                  <li>
                    <strong>Nút "Lưu Bài Viết Mẫu / Bản Nháp":</strong> Bạn có thể lưu nhiều bài viết mẫu khác nhau (ví dụ: Bài Bất Động Sản, Bài Tuyển Dụng, Bài Giảm Giá...) để chuyển đổi linh hoạt.
                  </li>
                  <li>
                    <strong>Nút "Khôi Phục Bài Trước":</strong> Giúp bạn lấy lại nội dung và ảnh đính kèm đã soạn ở phiên làm việc trước đó chỉ bằng 1 cú nhấp chuột.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Spintax Là Gì & Tại Sao Bắt Buộc Phải Dùng?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Facebook có thuật toán quét mã băm nội dung (Hash check). Nếu bạn đăng 1 đoạn văn bản y hệt nhau vào 15 nhóm, nick sẽ bị gắn cờ "Spam hàng loạt". Spintax sử dụng cú pháp <code>{"{từ 1|từ 2|từ 3}"}</code> để tự động biến hóa câu chữ:
                </p>
                <div className="p-3 bg-slate-100 rounded-lg text-xs font-mono text-slate-800 border border-slate-300">
                  {"{Chào anh chị|Hello cả nhà|Em chào mọi người}"}, bên em hiện đang {"{cho thuê|cung cấp}"} căn hộ...
                </div>
                <p className="text-xs text-slate-500">
                  ➔ Mỗi nhóm Facebook sẽ nhận một bài viết với câu từ khác nhau hoàn toàn nhưng nội dung cốt lõi vẫn giữ nguyên vẹn 95%.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  Tối Ưu Ảnh Tỉ Lệ Vàng 4:3
                </h4>
                <p className="text-xs text-slate-600">
                  Nên bật tính năng <strong>"Tự động chuẩn hóa tỉ lệ 4:3"</strong> trong ứng dụng để hình ảnh khi hiển thị trên bảng tin Facebook không bị cắt cụt đầu đuôi và có độ tương tác cao nhất.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: GROUPS & PROFILES */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Quản Lý Danh Sách Nhóm Mục Tiêu
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Thêm & Nhập Nhóm:</strong> Bạn có thể thêm từng nhóm bằng link Facebook hoặc bấm nút "Nhập File CSV / Excel" để nạp hàng chục nhóm cùng lúc.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Phân Loại Nhóm Tự Duyệt vs Chờ Duyệt:</strong> Nhóm có huy hiệu "Duyệt Tự Động (Live)" là nhóm bài viết sẽ hiện ngay sau khi đăng. Nhóm "Chờ Duyệt" cần admin duyệt tay. Bạn có thể dùng bộ lọc "Chỉ chọn nhóm Live" để tối ưu tỷ lệ hiển thị.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Gán Profile Facebook (Nick Chính / Nick Phụ):</strong> Nếu bạn nuôi nhiều nick, bạn có thể chỉ định nhóm A cho Nick Chính đăng, nhóm B cho Nick Phụ đăng để tránh quá tải cho 1 tài khoản.</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <strong>Lời khuyên vàng:</strong> Hãy tự tay dùng nick của bạn tham gia vào các nhóm Facebook này ít nhất 1–2 ngày trước khi tiến hành đẩy bài tự động, giúp tài khoản có độ uy tín trong nhóm.
              </div>
            </div>
          )}

          {/* TAB 3: SCHEDULE & SAFETY */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Quy Tắc Giãn Cách Chống Khóa Nick (Anti-Checkpoint)
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 text-xs">1. Giãn cách ngẫu nhiên 4 – 8 phút</div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Tuyệt đối không đăng liên tục từng phút. Khoảng cách nghỉ 4–8 phút là thời gian tự nhiên của người thật lướt Facebook.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 text-xs">2. Phân bố 2 ca/ngày (Sáng & Tối)</div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Ca sáng (khoảng 08:45) và Ca tối (khoảng 19:30). Mỗi ca đăng tối đa 10–20 nhóm. Không nên đăng dồn dập 50 nhóm cùng một lúc.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 text-xs">3. Mô phỏng gõ phím & Cuộn bảng tin</div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Script sẽ tự động gõ từng ký tự với độ trễ 60–150ms và cuộn xem 2-3 bài viết của nhóm trước khi bấm đăng để vượt qua các thuật toán phát hiện bot của Facebook.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUTOMATION WITH PLAYWRIGHT */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Terminal className="w-4 h-4 text-purple-600" />
                  <span>Cách Kích Hoạt Tự Động Đăng 100% Bằng Script (Chỉ 3 Bước)</span>
                </div>
                <p className="text-xs text-purple-800">
                  Bạn chỉ cần cài đặt công cụ 1 lần đầu tiên trên máy tính. Các lần sau chỉ cần tải file script từ app về và bấm chạy!
                </p>
              </div>

              <div className="space-y-3">
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      Bước 1: Cài đặt Node.js (Chỉ làm 1 lần duy nhất)
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      1 lần duy nhất
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Nếu máy tính chưa có Node.js, hãy tải và cài đặt miễn phí tại{" "}
                    <a
                      href="https://nodejs.org"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline font-bold"
                    >
                      nodejs.org
                    </a>{" "}
                    (bản LTS).
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    Bước 2: Tải File Script Từ App Web
                  </span>
                  <p className="text-xs text-slate-600">
                    Sau khi soạn bài và chọn nhóm ưng ý trên web, bạn bấm nút{" "}
                    <strong>"Script Node.js"</strong> ở góc trên ➔ Bấm{" "}
                    <strong>"Tải File Script (fb_auto_post.js)"</strong> về máy tính.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    Bước 3: Mở Terminal/Command Prompt & Chạy Lệnh
                  </span>
                  <p className="text-xs text-slate-600">
                    Mở thư mục chứa file vừa tải về và chạy lệnh:
                  </p>
                  <div className="flex items-center justify-between bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-xs">
                    <code>node fb_auto_post.js</code>
                    <button
                      onClick={() => handleCopy("node fb_auto_post.js")}
                      className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px] bg-slate-800 px-2 py-1 rounded"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? "Đã chép" : "Sao chép"}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 italic">
                    ➔ Trình duyệt Chrome sẽ tự động mở lên, truy cập từng nhóm, gõ phím, đính kèm ảnh và đăng bài hoàn toàn tự động!
                  </p>
                </div>
              </div>

              {onOpenScriptModal && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenScriptModal();
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Mở Bảng Xuất Script Playwright Ngay</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FAQ */}
          {activeStep === 5 && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm text-blue-700">
                  Q: Tôi có cần giữ tab web này mở khi script đang chạy trên máy tính không?
                </h4>
                <p className="text-xs text-slate-600">
                  <strong>Không cần thiết.</strong> Khi bạn đã xuất file script và chạy trên máy tính, script hoạt động độc lập và tự điều khiển Chrome. Bạn có thể đóng tab web này bất cứ lúc nào.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm text-blue-700">
                  Q: Nếu tôi tắt máy tính thì có đăng tiếp được không?
                </h4>
                <p className="text-xs text-slate-600">
                  Vì đây là kịch bản chạy trên máy cá nhân để giữ IP quen thuộc (chống checkpoint), máy tính cần bật trong lúc ca đăng đang diễn ra (hoặc để chế độ Sleep nhẹ).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm text-blue-700">
                  Q: Làm sao để đăng cùng lúc nhiều Nick Facebook khác nhau?
                </h4>
                <p className="text-xs text-slate-600">
                  Vào mục <strong>"Quản Lý Profile Facebook"</strong> trên thanh menu. Mỗi Profile tương ứng với một người dùng (Profile Chrome) trên máy tính. Bạn có thể tạo Chrome Profile 1, Profile 2 và gán từng nhóm cho từng nick tương ứng.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm text-blue-700">
                  Q: Bài viết của tôi có bị mất khi tôi tắt trình duyệt không?
                </h4>
                <p className="text-xs text-slate-600">
                  <strong>Tuyệt đối không!</strong> Tất cả nội dung văn bản, cú pháp Spintax và hình ảnh đính kèm đều được lưu tự động vĩnh viễn vào bộ nhớ cục bộ IndexedDB trên trình duyệt của bạn. Bạn cũng có thể bấm "Lưu bản nháp" để tạo nhiều bài viết khác nhau.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Bước {activeStep + 1} / {steps.length}: {steps[activeStep].title}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {activeStep > 0 && (
              <button
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
              >
                Quay lại
              </button>
            )}
            {activeStep < steps.length - 1 ? (
              <button
                onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <span>Tiếp theo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                Bắt Đầu Ngay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
