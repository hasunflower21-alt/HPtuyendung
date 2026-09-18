import React from "react";
import { ShieldCheck, AlertTriangle, Clock, Shuffle, Key } from "lucide-react";

interface SafetyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyGuideModal: React.FC<SafetyGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Cẩm Nang & Nguyên Tắc Bảo Vệ Nick Facebook Cá Nhân
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1.5 rounded-lg"
          >
            ✕ Đóng
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
            <strong>Mục tiêu tối thượng:</strong> Bảo vệ tài khoản chính của bạn hoạt động lâu dài, không bị Facebook khóa tính năng đăng bài hay yêu cầu xác minh danh tính (checkpoint).
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>1. Tần suất 2 ca/ngày (Sáng & Tối)</span>
              </div>
              <p className="text-slate-600">
                Đăng 2 lần/ngày tương đương với hành vi của người dùng thực sự (ca sáng trước giờ làm việc và ca tối giải trí). Tuyệt đối không tăng lên 4–5 lần/ngày dồn dập từ 1 tài khoản cá nhân.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>2. Giãn cách ngẫu nhiên 4 – 8 phút</span>
              </div>
              <p className="text-slate-600">
                Giữa các nhóm trong cùng một ca bắt buộc phải có thời gian nghỉ từ 4 đến 8 phút. Khoảng nghỉ cố định 2-3 phút rất dễ bị AI phát hiện chu kỳ máy móc. Hãy để bot chạy ngầm từ từ.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <Shuffle className="w-4 h-4 text-blue-600" />
                <span>3. Bắt buộc dùng Spintax</span>
              </div>
              <p className="text-slate-600">
                Bộ lọc chống spam của Facebook tính toán mã băm (hash) của văn bản. Khi gửi cùng một nội dung giống 100% vào 20 nhóm, thuật toán sẽ cắm cờ spam ngay. Spintax giúp tạo 20 phiên bản câu từ khác biệt hoàn toàn nhưng vẫn giữ chuẩn văn phong gốc.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-indigo-900">
                <Key className="w-4 h-4 text-indigo-600" />
                <span>4. Tham gia nhóm bằng tay một lần</span>
              </div>
              <p className="text-slate-600">
                Tự động tìm kiếm và xin vào hàng chục nhóm bằng bot là hành động bị quét checkpoint gắt gao nhất. Hãy tự dùng tay tham gia các nhóm chất lượng, trả lời câu hỏi admin đầy đủ rồi mới lưu link nhóm vào app.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
