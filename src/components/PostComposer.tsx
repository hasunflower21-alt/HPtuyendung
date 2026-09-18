import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Eye,
  Shuffle,
  Trash2,
  Check,
  Upload,
  Layers,
  Edit3,
  Sliders,
  Smartphone,
  Monitor,
  AlertTriangle,
  Crop,
  ShieldCheck,
  Maximize2,
  Zap,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Type,
  Smile,
  Minus,
  ListOrdered,
  Heading1,
  Heading2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  GripVertical,
  RotateCcw,
  Sparkle,
  Copy,
  CheckCheck,
  ArrowLeftRight,
  Save,
  FolderOpen,
  History,
  PlusCircle,
  Clock,
  FileText,
  X,
  BookOpen,
} from "lucide-react";
import { resolveSpintax, calculateCombinations } from "../utils/spintax";
import {
  optimizeImage,
  isImageVerticalOrTooTall,
  ImageOptimizationOptions,
} from "../utils/imageOptimizer";
import {
  convertToUnicodeFont,
  applyUnderline,
  applyStrikethrough,
  stripUnicodeStyles,
  SYMBOL_CATEGORIES,
  POST_DIVIDERS,
} from "../utils/textFormatter";
import {
  saveDraftToDB,
  getAllDraftsFromDB,
  deleteDraftFromDB,
  SavedDraft,
} from "../utils/storageDb";

interface PostComposerProps {
  rawContent: string;
  setRawContent: (val: string) => void;
  spintaxContent: string;
  setSpintaxContent: (val: string) => void;
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  onGoToNextTab: () => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  rawContent,
  setRawContent,
  spintaxContent,
  setSpintaxContent,
  images,
  setImages,
  onGoToNextTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"spintax" | "raw">("spintax");
  const [mobilePane, setMobilePane] = useState<"editor" | "preview" | "both">("both");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [variationIntensity] = useState<"minimal" | "moderate">("minimal");
  const [previewVariations, setPreviewVariations] = useState<string[]>([]);
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Textarea references for text formatting
  const spintaxTextareaRef = useRef<HTMLTextAreaElement>(null);
  const rawTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Text formatting popover states
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSymbolsPopover, setShowSymbolsPopover] = useState(false);
  const [showDividersMenu, setShowDividersMenu] = useState(false);
  const [activeSymbolCategory, setActiveSymbolCategory] = useState(0);
  const [formatToast, setFormatToast] = useState<string | null>(null);

  // Image Reordering / Drag & drop state
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [dragOverImageIndex, setDragOverImageIndex] = useState<number | null>(null);
  const [showReorderModal, setShowReorderModal] = useState(false);

  // Dropzone state for upload
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounterRef = useRef(0);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image Processing & Facebook Engagement Optimization State
  const [targetRatio, setTargetRatio] = useState<"4:3" | "1:1" | "16:9" | "original">("4:3");
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [optimizationMessage, setOptimizationMessage] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  // Drafts & Persistence State
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [draftTitleInput, setDraftTitleInput] = useState("");
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string>("Vừa xong");
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Load all drafts on mount
  useEffect(() => {
    getAllDraftsFromDB().then((list) => {
      setDrafts(list);
    });
  }, []);

  // Debounced auto-save current post content & attached images to IndexedDB
  useEffect(() => {
    if (!rawContent && !spintaxContent && images.length === 0) return;
    const timer = setTimeout(() => {
      const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setLastAutoSavedTime(nowStr);
      saveDraftToDB({
        id: "auto_last_session",
        title: "Bài viết phiên làm việc gần nhất",
        rawContent,
        spintaxContent,
        images,
        updatedAt: new Date().toISOString(),
        isAutoSaved: true,
      }).then(() => {
        getAllDraftsFromDB().then((list) => setDrafts(list));
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [rawContent, spintaxContent, images]);

  const handleSaveNamedDraft = async (customTitle?: string) => {
    const titleToUse =
      (customTitle || draftTitleInput).trim() ||
      `Bài Mẫu ${new Date().toLocaleDateString("vi-VN")} ${new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;

    const newDraft: SavedDraft = {
      id: `draft_${Date.now()}`,
      title: titleToUse,
      rawContent,
      spintaxContent,
      images: [...images],
      updatedAt: new Date().toISOString(),
      isAutoSaved: false,
    };

    await saveDraftToDB(newDraft);
    const updated = await getAllDraftsFromDB();
    setDrafts(updated);
    setShowSaveDraftModal(false);
    setDraftTitleInput("");
    setSaveToast(`Đã lưu bài viết "${titleToUse}" cùng ${images.length} ảnh đính kèm!`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleRestoreDraft = (draft: SavedDraft) => {
    setRawContent(draft.rawContent || "");
    setSpintaxContent(draft.spintaxContent || "");
    setImages(draft.images || []);
    setShowDraftsModal(false);
    setSaveToast(`Đã khôi phục: "${draft.title}" (${(draft.images || []).length} ảnh)!`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleDeleteDraft = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteDraftFromDB(id);
    const updated = await getAllDraftsFromDB();
    setDrafts(updated);
  };

  const handleClearPost = () => {
    if (
      window.confirm(
        "Bạn có muốn xóa trắng khung soạn bài để viết bài mới? Bài cũ vẫn được lưu trong mục Bản Nháp."
      )
    ) {
      setRawContent("");
      setSpintaxContent("");
      setImages([]);
      setSaveToast("Đã tạo bài viết mới!");
      setTimeout(() => setSaveToast(null), 2500);
    }
  };

  const combinations = calculateCombinations(spintaxContent);

  // Global window drag over prevent default to avoid accidental page reload if dropped outside
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("drop", handleWindowDrop);
    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, []);

  // Support Clipboard Paste (Ctrl+V) for images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        await processAndAddFiles(imageFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [targetRatio, fitMode, autoOptimize]);

  // Generate 5 spin samples
  const handleGenerateVariations = () => {
    const samples: string[] = [];
    for (let i = 0; i < 5; i++) {
      samples.push(resolveSpintax(spintaxContent));
    }
    setPreviewVariations(samples);
    setShowVariationsModal(true);
  };

  // AI Generator via backend with minimal variation instruction
  const handleGenerateSpintaxWithAI = async () => {
    if (!rawContent.trim() && !spintaxContent.trim()) {
      alert("Vui lòng nhập nội dung bài viết trước khi tạo Spintax.");
      return;
    }

    setIsGeneratingAI(true);
    setAiMessage(null);
    try {
      const textToTransform = rawContent.trim() || spintaxContent.trim();
      const response = await fetch("/api/ai/spintax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToTransform,
          variationIntensity: variationIntensity,
        }),
      });

      const data = await response.json();
      if (data.spintax) {
        setSpintaxContent(data.spintax);
        setActiveSubTab("spintax");
        setAiMessage(
          data.message ||
            "✅ Đã tạo biến thể nhẹ: Giữ trọn vẹn 95% câu từ và văn phong gốc của bài viết."
        );
      }
    } catch (err: any) {
      console.error(err);
      setAiMessage("Không thể gọi AI, đã sử dụng cấu hình mặc định.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Process files (either from file input, drag-and-drop, or paste)
  const processAndAddFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessingImages(true);
    setOptimizationMessage(null);

    const newImageUrls: string[] = [];
    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;

        if (autoOptimize) {
          const result = await optimizeImage(file, {
            targetRatio,
            fitMode,
            maxDimension: 1200,
            quality: 0.88,
          });
          newImageUrls.push(result.dataUrl);
        } else {
          // Read as standard data URL without resizing
          const reader = new FileReader();
          const p = new Promise<string>((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
          const url = await p;
          newImageUrls.push(url);
        }
      }

      if (newImageUrls.length > 0) {
        setImages((prev) => [...prev, ...newImageUrls]);
        setOptimizationMessage(
          autoOptimize
            ? `✅ Đã tối ưu ${newImageUrls.length} ảnh theo tỷ lệ ${
                targetRatio === "4:3" ? "4:3 (Chuẩn FB)" : targetRatio === "1:1" ? "1:1 (Vuông)" : targetRatio
              }: Vừa vặn tầm mắt, không choán diện tích feed.`
            : `✅ Đã thêm ${newImageUrls.length} ảnh.`
        );
        setTimeout(() => setOptimizationMessage(null), 5000);
      }
    } catch (err) {
      console.error("Error processing images:", err);
      alert("Có lỗi khi xử lý hình ảnh, vui lòng thử lại.");
    } finally {
      setIsProcessingImages(false);
    }
  };

  // Re-optimize all existing images with current selected ratio
  const handleOptimizeAllExistingImages = async () => {
    if (images.length === 0) return;
    setIsProcessingImages(true);
    try {
      const updatedImages: string[] = [];
      for (const imgUrl of images) {
        const result = await optimizeImage(imgUrl, {
          targetRatio,
          fitMode,
          maxDimension: 1200,
          quality: 0.88,
        });
        updatedImages.push(result.dataUrl);
      }
      setImages(updatedImages);
      setOptimizationMessage(
        `⚡ Đã quy chuẩn lại toàn bộ ${images.length} ảnh về tỷ lệ ${targetRatio} (${fitMode === "cover" ? "Cắt gọn" : "Vừa khung"}): Đảm bảo hiển thị trọn vẹn văn bản và thanh tương tác trên Facebook!`
      );
      setTimeout(() => setOptimizationMessage(null), 5000);
    } catch (err) {
      console.error("Error re-optimizing:", err);
    } finally {
      setIsProcessingImages(false);
    }
  };

  // Add sample image with auto-optimization
  const handleAddSampleImage = async (url: string) => {
    if (!images.includes(url)) {
      if (autoOptimize) {
        try {
          const result = await optimizeImage(url, { targetRatio, fitMode, maxDimension: 1200 });
          setImages((prev) => [...prev, result.dataUrl]);
        } catch {
          setImages((prev) => [...prev, url]);
        }
      } else {
        setImages((prev) => [...prev, url]);
      }
    }
  };

  // Handle local file upload via input
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processAndAddFiles(Array.from(files) as File[]);
    }
    // reset input so same file can be re-selected if needed
    e.target.value = "";
  };

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDraggingOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files) as File[];
      const validFiles = fileList.filter((f) => f.type.startsWith("image/"));
      if (validFiles.length > 0) {
        await processAndAddFiles(validFiles);
      } else {
        alert("Vui lòng chỉ kéo thả tệp hình ảnh (JPG, PNG, WebP).");
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Reordering handlers for images / album pages
  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= images.length) return;
    setImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleSetAsCover = (index: number) => {
    if (index === 0 || index >= images.length) return;
    handleMoveImage(index, 0);
    setOptimizationMessage(`⭐ Đã đặt ảnh #${index + 1} làm Trang 1 (Ảnh bìa chính của bài viết)!`);
    setTimeout(() => setOptimizationMessage(null), 4000);
  };

  const handleReverseImages = () => {
    if (images.length <= 1) return;
    setImages((prev) => [...prev].reverse());
    setOptimizationMessage("🔄 Đã đảo ngược thứ tự toàn bộ ảnh / trang trong album!");
    setTimeout(() => setOptimizationMessage(null), 4000);
  };

  // Formatting handlers for text styling, Unicode fonts, and symbols
  const showFormatFeedback = (msg: string) => {
    setFormatToast(msg);
    setTimeout(() => setFormatToast(null), 2500);
  };

  const getActiveTextarea = () =>
    activeSubTab === "spintax" ? spintaxTextareaRef.current : rawTextareaRef.current;

  const getActiveText = () => (activeSubTab === "spintax" ? spintaxContent : rawContent);

  const setActiveText = (val: string) => {
    if (activeSubTab === "spintax") {
      setSpintaxContent(val);
    } else {
      setRawContent(val);
    }
  };

  const handleApplyFormatting = (
    formatType:
      | "bold"
      | "serifBold"
      | "italic"
      | "boldItalic"
      | "bubble"
      | "boxed"
      | "monospace"
      | "blackboard"
      | "underline"
      | "strikethrough"
      | "clear"
      | "h1"
      | "h2"
  ) => {
    const textarea = getActiveTextarea();
    const currentText = getActiveText();
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const hasSelection = start !== end;
    const selectedText = hasSelection ? currentText.substring(start, end) : "";

    let formatted = "";
    if (formatType === "bold") {
      formatted = convertToUnicodeFont(selectedText || "TIÊU ĐỀ IN ĐẬM", "bold");
    } else if (formatType === "serifBold") {
      formatted = convertToUnicodeFont(selectedText || "Tiêu Đề Serif", "serifBold");
    } else if (formatType === "italic") {
      formatted = convertToUnicodeFont(selectedText || "Chữ in nghiêng", "italic");
    } else if (formatType === "boldItalic") {
      formatted = convertToUnicodeFont(selectedText || "Chữ đậm nghiêng", "boldItalic");
    } else if (formatType === "bubble") {
      formatted = convertToUnicodeFont(selectedText || "HOTLINE", "bubble");
    } else if (formatType === "boxed") {
      formatted = convertToUnicodeFont(selectedText || "KHUYEN MAI", "boxed");
    } else if (formatType === "monospace") {
      formatted = convertToUnicodeFont(selectedText || "thong tin ky thuat", "monospace");
    } else if (formatType === "blackboard") {
      formatted = convertToUnicodeFont(selectedText || "TIEU DE", "blackboard");
    } else if (formatType === "underline") {
      formatted = applyUnderline(selectedText || "Văn bản gạch chân");
    } else if (formatType === "strikethrough") {
      formatted = applyStrikethrough(selectedText || "Giá cũ đã giảm");
    } else if (formatType === "clear") {
      formatted = stripUnicodeStyles(selectedText || currentText);
      if (!hasSelection) {
        setActiveText(formatted);
        showFormatFeedback("Đã xóa định dạng, đưa về chữ thường!");
        return;
      }
    } else if (formatType === "h1") {
      const base = selectedText ? selectedText.toUpperCase() : "TIÊU ĐỀ BÀI VIẾT NỔI BẬT";
      const boldTitle = convertToUnicodeFont(base, "bold");
      formatted = `🔥 ${boldTitle} 🔥\n═════════════════════════════\n`;
    } else if (formatType === "h2") {
      const base = selectedText || "Mục Nội Dung";
      const boldSub = convertToUnicodeFont(base, "bold");
      formatted = `\n📌 ${boldSub}:\n`;
    }

    const newContent = currentText.substring(0, start) + formatted + currentText.substring(end);
    setActiveText(newContent);

    setTimeout(() => {
      textarea.focus();
      if (hasSelection) {
        textarea.setSelectionRange(start, start + formatted.length);
      } else {
        textarea.setSelectionRange(start + formatted.length, start + formatted.length);
      }
    }, 0);

    setShowFontMenu(false);
    showFormatFeedback("Đã áp dụng định dạng kiểu chữ!");
  };

  const handleInsertSymbol = (symbol: string) => {
    const textarea = getActiveTextarea();
    const currentText = getActiveText();
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = currentText.substring(0, start) + symbol + currentText.substring(end);
    setActiveText(newContent);

    setTimeout(() => {
      textarea.focus();
      const nextPos = start + symbol.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 0);

    showFormatFeedback(`Đã chèn kí hiệu ${symbol}`);
  };

  const handleInsertDivider = (divider: string) => {
    const textarea = getActiveTextarea();
    const currentText = getActiveText();
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const formattedDivider = `\n${divider}\n`;
    const newContent = currentText.substring(0, start) + formattedDivider + currentText.substring(end);
    setActiveText(newContent);

    setTimeout(() => {
      textarea.focus();
      const nextPos = start + formattedDivider.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 0);

    setShowDividersMenu(false);
    showFormatFeedback("Đã chèn đường phân cách!");
  };

  const currentPreviewSample = resolveSpintax(spintaxContent || rawContent);

  return (
    <div className="space-y-3 sm:space-y-5">
      {/* Mobile View Toggle Bar: Quickly switch between Editor & Preview on mobile to see full overview */}
      <div className="flex sm:hidden items-center justify-between bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-[11px] font-semibold">
        <button
          onClick={() => setMobilePane("both")}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors ${
            mobilePane === "both" ? "bg-blue-50 text-blue-700 shadow-2xs" : "text-slate-600"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Xem Tất Cả</span>
        </button>
        <button
          onClick={() => setMobilePane("editor")}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors ${
            mobilePane === "editor" ? "bg-blue-50 text-blue-700 shadow-2xs" : "text-slate-600"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Soạn Bài</span>
        </button>
        <button
          onClick={() => setMobilePane("preview")}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors ${
            mobilePane === "preview" ? "bg-blue-50 text-blue-700 shadow-2xs" : "text-slate-600"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Mô Phỏng Feed</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
        {/* Left Column: Editor & Media (7 cols on desktop, controlled on mobile) */}
        <div
          className={`lg:col-span-7 space-y-3 sm:space-y-4 ${
            mobilePane === "preview" ? "hidden sm:block" : "block"
          }`}
        >
          {/* Editor Box */}
          <div className="bg-white rounded-xl p-3 sm:p-5 border border-slate-200 shadow-2xs">
            {/* Header row */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                    Nội Dung Bài Viết & Spintax
                  </h2>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                    {combinations > 1 ? `~${combinations.toLocaleString()} biến thể` : "1 biến thể"}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                  Cú pháp <code className="text-blue-700 font-mono bg-blue-50 px-1 py-0.2 rounded font-semibold">{"{từ 1|từ 2}"}</code> đổi nhẹ lời chào, giữ nguyên 95% văn phong.
                </p>
              </div>

              {/* Sub tabs: Spintax vs Raw */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                <button
                  onClick={() => setActiveSubTab("spintax")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all whitespace-nowrap ${
                    activeSubTab === "spintax"
                      ? "bg-white text-blue-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Spintax
                </button>
                <button
                  onClick={() => setActiveSubTab("raw")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all whitespace-nowrap ${
                    activeSubTab === "raw"
                      ? "bg-white text-blue-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Văn Bản Thô
                </button>
              </div>
            </div>

            {/* Drafts & Auto-save Status Bar */}
            <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium truncate">
                  Tự động lưu: <strong className="text-slate-800 font-semibold">{lastAutoSavedTime}</strong>
                </span>
                {images.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 whitespace-nowrap">
                    {images.length} ảnh đã lưu
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowDraftsModal(true)}
                  className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                  title="Xem danh sách bài đã soạn, bài viết gần nhất & khôi phục với 1 click"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Bản Nháp & Khôi Phục ({drafts.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDraftTitleInput("");
                    setShowSaveDraftModal(true);
                  }}
                  className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                  title="Lưu bài viết và toàn bộ ảnh hiện tại thành mẫu"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Bài Này</span>
                </button>

                {(rawContent.trim() || spintaxContent.trim() || images.length > 0) && (
                  <button
                    type="button"
                    onClick={handleClearPost}
                    className="p-1 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 border border-transparent hover:border-red-200 text-[11px] transition-colors"
                    title="Xóa trắng để viết bài mới (bài cũ đã được lưu bản nháp)"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {saveToast && (
              <div className="mt-2 text-[11px] text-emerald-900 bg-emerald-50 border border-emerald-300 p-2 rounded-lg flex items-center gap-1.5 animate-in fade-in duration-200 shadow-2xs">
                <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                <span className="font-semibold">{saveToast}</span>
              </div>
            )}

            {/* AI Assistant Banner - Dense & Compact */}
            <div className="mt-2.5 p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded-md bg-blue-600 text-white flex-shrink-0 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-900 block leading-tight">
                    Tạo Biến Thể Nhẹ Bằng AI
                  </span>
                  <span className="text-[10px] text-slate-600 block truncate">
                    Chỉ đổi nhẹ câu chào và lời kết, giữ nguyên toàn bộ giá & thông tin liên hệ.
                  </span>
                </div>
              </div>

              <button
                id="ai-generate-spintax-btn"
                onClick={handleGenerateSpintaxWithAI}
                disabled={isGeneratingAI}
                className="w-full sm:w-auto px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-2xs flex items-center justify-center gap-1 whitespace-nowrap transition-all disabled:opacity-50 flex-shrink-0"
              >
                {isGeneratingAI ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Tạo Spintax Giữ Văn Phong</span>
                  </>
                )}
              </button>
            </div>

            {aiMessage && (
              <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                <span className="font-medium">{aiMessage}</span>
              </div>
            )}

            {/* Formatting Toolbar - Rich Text, Unicode Fonts, Symbols & Sizes */}
            <div className="mt-3 relative">
              {formatToast && (
                <div className="absolute -top-7 right-0 z-30 bg-slate-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5 animate-in fade-in duration-200">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{formatToast}</span>
                </div>
              )}

              {/* Toolbar Bar */}
              <div className="bg-slate-100/90 border border-slate-200 rounded-t-lg px-2 py-1.5 flex items-center justify-between gap-1 flex-wrap text-xs">
                {/* Left: Basic Styles & Headings */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:inline mr-1">
                    Định Dạng:
                  </span>

                  {/* B - Sans Bold */}
                  <button
                    type="button"
                    onClick={() => handleApplyFormatting("bold")}
                    className="p-1 sm:px-1.5 py-0.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs shadow-2xs hover:text-blue-600 transition-colors"
                    title="In đậm (Bold Sans-Serif) - Bôi đen chữ rồi bấm"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>

                  {/* Serif Bold */}
                  <button
                    type="button"
                    onClick={() => handleApplyFormatting("serifBold")}
                    className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-serif font-bold text-xs shadow-2xs hover:text-blue-600 transition-colors"
                    title="In đậm kiểu báo chí (Serif Bold)"
                  >
                    𝐁
                  </button>

                  {/* I - Italic */}
                  <button
                    type="button"
                    onClick={() => handleApplyFormatting("italic")}
                    className="p-1 sm:px-1.5 py-0.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs shadow-2xs hover:text-blue-600 transition-colors"
                    title="In nghiêng (Italic)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>

                  {/* U - Underline */}
                  <button
                    type="button"
                    onClick={() => handleApplyFormatting("underline")}
                    className="p-1 sm:px-1.5 py-0.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs shadow-2xs hover:text-blue-600 transition-colors"
                    title="Gạch chân (Underline)"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>

                  {/* S - Strikethrough */}
                  <button
                    type="button"
                    onClick={() => handleApplyFormatting("strikethrough")}
                    className="p-1 sm:px-1.5 py-0.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs shadow-2xs hover:text-blue-600 transition-colors"
                    title="Gạch ngang (Strikethrough - gạch giá cũ)"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-slate-300 mx-0.5"></div>

                  {/* Headings / Kích Thước */}
                  <button
                    type="button"
                    onClick={() => handleApplyFormatting("h1")}
                    className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[11px] shadow-2xs hover:text-red-600 transition-colors flex items-center gap-0.5"
                    title="Tiêu Đề Lớn (In Đậm + Icon Lửa + Đường Kẻ)"
                  >
                    <Heading1 className="w-3 h-3 text-red-500" />
                    <span>Tiêu Đề Lớn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyFormatting("h2")}
                    className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-[11px] shadow-2xs hover:text-blue-600 transition-colors flex items-center gap-0.5"
                    title="Tiêu Đề Nhỡ (Phân Mục)"
                  >
                    <Heading2 className="w-3 h-3 text-blue-500" />
                    <span>Mục</span>
                  </button>

                  <div className="h-4 w-px bg-slate-300 mx-0.5"></div>

                  {/* Font Dropdown Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowFontMenu(!showFontMenu);
                        setShowSymbolsPopover(false);
                        setShowDividersMenu(false);
                      }}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-[11px] shadow-2xs hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <Type className="w-3 h-3 text-indigo-600" />
                      <span>Font Chữ FB</span>
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>

                    {showFontMenu && (
                      <div className="absolute left-0 top-7 z-40 bg-white border border-slate-200 rounded-lg shadow-xl p-1.5 w-56 space-y-1 text-xs">
                        <div className="text-[10px] font-bold text-slate-400 px-2 py-0.5 uppercase tracking-wider">
                          Đổi Font Đoạn Bôi Đen:
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyFormatting("bold")}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center justify-between"
                        >
                          <span className="font-bold">𝗧𝗶𝗲̂𝘂 Đ𝗲̂̀ 𝗦𝗮𝗻𝘀 Đ𝗮̣̂𝗺</span>
                          <span className="text-[10px] text-slate-400">Khuyên dùng</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyFormatting("serifBold")}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 font-serif font-bold"
                        >
                          𝐓𝐢𝐞̂𝐮 Đ𝐞̂̀ 𝐒𝐞𝐫𝐢𝐟 Đ𝐚̣̂𝐦
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyFormatting("boldItalic")}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 font-bold italic"
                        >
                          𝘽𝙤𝙡𝙙 𝙄𝙩𝙖𝙡𝙞𝙘 (Đậm Nghiêng)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyFormatting("bubble")}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100"
                        >
                          ⒽⓄⓉⓁⒾⓃⒺ (Chữ Bong Bóng)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyFormatting("boxed")}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100"
                        >
                          🄺🄷🅄🅈🄴🄽 🄼🄰🄸 (Chữ Ô Vuông)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyFormatting("monospace")}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 font-mono"
                        >
                          𝚖𝚊𝚢 𝚍𝚊𝚗𝚑 𝚌𝚑𝚞 (Monospace)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyFormatting("blackboard")}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 font-serif"
                        >
                          𝕋𝕚𝕖̂𝕦 Đ𝕖̂̀ ℝ𝕠̂̃𝕟𝕘 (Blackboard)
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Symbols, Dividers, Clear Format */}
                <div className="flex items-center gap-1 flex-wrap">
                  {/* Kí hiệu & Icon Popover Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSymbolsPopover(!showSymbolsPopover);
                        setShowFontMenu(false);
                        setShowDividersMenu(false);
                      }}
                      className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-[11px] shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <Smile className="w-3 h-3 text-amber-600" />
                      <span>Kí Hiệu & Icon</span>
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>

                    {/* Symbols & Emojis Popover Panel */}
                    {showSymbolsPopover && (
                      <div className="absolute right-0 sm:right-auto sm:left-0 top-7 z-40 bg-white border border-slate-200 rounded-xl shadow-2xl p-2.5 w-72 sm:w-80 space-y-2 text-xs">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                            <Sparkle className="w-3 h-3 text-amber-500" />
                            Kí Hiệu & Emoji Facebook
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowSymbolsPopover(false)}
                            className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Category tabs */}
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-[10px]">
                          {SYMBOL_CATEGORIES.map((cat, cIdx) => (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={() => setActiveSymbolCategory(cIdx)}
                              className={`px-2 py-1 rounded-md whitespace-nowrap font-medium transition-colors flex items-center gap-1 ${
                                activeSymbolCategory === cIdx
                                  ? "bg-blue-600 text-white font-bold shadow-2xs"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              <span>{cat.icon}</span>
                              <span className="hidden xs:inline">{cat.title.split(" ")[0]}</span>
                            </button>
                          ))}
                        </div>

                        {/* Category title */}
                        <div className="text-[10px] text-slate-500 font-semibold">
                          {SYMBOL_CATEGORIES[activeSymbolCategory].title}:
                        </div>

                        {/* Symbol Grid */}
                        <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 p-1 bg-slate-50 rounded-lg max-h-40 overflow-y-auto">
                          {SYMBOL_CATEGORIES[activeSymbolCategory].items.map((sym, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleInsertSymbol(sym)}
                              className="h-8 rounded bg-white hover:bg-blue-50 hover:border-blue-400 border border-slate-200 flex items-center justify-center text-base hover:scale-110 transition-transform shadow-2xs"
                              title={`Chèn ${sym}`}
                            >
                              {sym}
                            </button>
                          ))}
                        </div>

                        <div className="text-[10px] text-slate-400 text-center pt-1 border-t border-slate-100">
                          Bấm vào biểu tượng để chèn ngay vào vị trí con trỏ chuột
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Kẻ Phân Cách Divider Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDividersMenu(!showDividersMenu);
                        setShowFontMenu(false);
                        setShowSymbolsPopover(false);
                      }}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-[11px] shadow-2xs hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <Minus className="w-3 h-3 text-slate-500" />
                      <span>Kẻ Dòng</span>
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>

                    {showDividersMenu && (
                      <div className="absolute right-0 top-7 z-40 bg-white border border-slate-200 rounded-lg shadow-xl p-1.5 w-60 space-y-1 text-xs">
                        <div className="text-[10px] font-bold text-slate-400 px-2 py-0.5 uppercase tracking-wider">
                          Chèn Đường Phân Cách:
                        </div>
                        {POST_DIVIDERS.map((divItem, dIdx) => (
                          <button
                            key={dIdx}
                            type="button"
                            onClick={() => handleInsertDivider(divItem.value)}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex flex-col"
                          >
                            <span className="font-mono text-[11px] text-slate-800 font-bold truncate">
                              {divItem.value}
                            </span>
                            <span className="text-[9px] text-slate-400">{divItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Xóa Định Dạng */}
                  <button
                    type="button"
                    onClick={() => handleApplyFormatting("clear")}
                    className="px-1.5 py-0.5 rounded bg-slate-50 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 text-[10px] font-semibold transition-colors"
                    title="Xóa định dạng unicode, đưa về chữ thường mộc"
                  >
                    Xóa Kiểu
                  </button>
                </div>
              </div>

              {/* Textarea - Connected to Toolbar */}
              {activeSubTab === "spintax" ? (
                <div>
                  <textarea
                    ref={spintaxTextareaRef}
                    id="spintax-editor-textarea"
                    value={spintaxContent}
                    onChange={(e) => setSpintaxContent(e.target.value)}
                    rows={7}
                    placeholder="{Chào mọi người|Xin chào cả nhà}! {Hôm nay bên em|Shop em hiện đang}..."
                    className="w-full bg-slate-50/60 hover:bg-white focus:bg-white border-x border-b border-t-0 border-slate-300 rounded-b-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono leading-relaxed transition-colors"
                  ></textarea>
                </div>
              ) : (
                <div>
                  <textarea
                    ref={rawTextareaRef}
                    id="raw-editor-textarea"
                    value={rawContent}
                    onChange={(e) => setRawContent(e.target.value)}
                    rows={7}
                    placeholder="Nhập bài viết bình thường tại đây rồi dùng các nút định dạng phía trên hoặc bấm 'Tạo Spintax Giữ Văn Phong'..."
                    className="w-full bg-slate-50/60 hover:bg-white focus:bg-white border-x border-b border-t-0 border-slate-300 rounded-b-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed transition-colors"
                  ></textarea>
                </div>
              )}
            </div>

            {/* Quick Actions below textarea */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
              <button
                id="preview-variations-btn"
                onClick={handleGenerateVariations}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
              >
                <Shuffle className="w-3 h-3 text-amber-600" />
                <span>Xem Thử 5 Biến Thể</span>
              </button>

              <span className="text-[10px] text-slate-500">
                Icon ngẫu nhiên: <code className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">{"{🔥|🌟|⚡}"}</code>
              </span>
            </div>
          </div>

          {/* Media / Image Attachments & Facebook Size Optimizer */}
          <div
            ref={dropzoneRef}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`bg-white rounded-xl p-3 sm:p-4 border transition-all duration-200 shadow-2xs relative ${
              isDraggingOver
                ? "border-blue-500 ring-4 ring-blue-100 bg-blue-50/40"
                : "border-slate-200"
            }`}
          >
            {/* Drag Overlay visual cue */}
            {isDraggingOver && (
              <div className="absolute inset-0 z-30 bg-blue-600/90 text-white rounded-xl flex flex-col items-center justify-center backdrop-blur-xs p-4 animate-in fade-in duration-150">
                <Upload className="w-10 h-10 mb-2 animate-bounce" />
                <h4 className="text-sm font-bold">Thả ảnh vào đây để tải lên ngay!</h4>
                <p className="text-xs text-blue-100 text-center mt-1">
                  Hệ thống sẽ tự động tối ưu tỷ lệ {targetRatio} vừa vặn chuẩn Facebook Feed.
                </p>
              </div>
            )}

            {/* Media Header with Title and Optimization Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Hình Ảnh Đính Kèm ({images.length})</span>
                    <span className="text-[9px] font-normal px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Tối ưu tương tác FB
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Kéo thả ảnh trực tiếp, dán (Ctrl+V) hoặc chọn file từ thiết bị
                  </p>
                </div>
              </div>

              {/* Aspect Ratio Selector for Facebook Anti-Loss Engagement */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-semibold self-start sm:self-auto flex-wrap">
                <span className="text-slate-400 px-1">Tỷ lệ:</span>
                <button
                  type="button"
                  onClick={() => setTargetRatio("4:3")}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    targetRatio === "4:3"
                      ? "bg-white text-blue-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="4:3 - Khuyên dùng trên Facebook: Chiều cao vừa vặn, không che mất chữ và nút Thích/Bình luận"
                >
                  4:3 (Chuẩn FB)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetRatio("1:1")}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    targetRatio === "1:1"
                      ? "bg-white text-blue-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="1:1 - Vuông: Chuẩn bài bán hàng, sản phẩm gọn gàng"
                >
                  1:1 (Vuông)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetRatio("16:9")}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    targetRatio === "16:9"
                      ? "bg-white text-blue-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="16:9 - Toàn cảnh: Rất gọn, dành cho báo giá hoặc công trình"
                >
                  16:9 (Gọn)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetRatio("original")}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    targetRatio === "original"
                      ? "bg-white text-blue-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Giữ tỷ lệ gốc"
                >
                  Gốc
                </button>
              </div>
            </div>

            {/* Engagement Optimization Callout Banner */}
            <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 flex-wrap text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span className="text-[10px] sm:text-[11px] leading-tight">
                  <strong className="text-slate-900">Bảo vệ tương tác Facebook:</strong> Ảnh được nén tự động & căn tỷ lệ {targetRatio} giúp người lướt nhìn thấy trọn bài viết & nút bấm mà không bị ảnh quá dài choán màn hình.
                </span>
              </div>

              {images.length > 0 && (
                <button
                  type="button"
                  onClick={handleOptimizeAllExistingImages}
                  disabled={isProcessingImages}
                  className="px-2 py-0.5 rounded-md bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 text-blue-700 text-[10px] font-bold flex items-center gap-1 transition-all whitespace-nowrap shadow-2xs disabled:opacity-50"
                  title="Áp dụng tỷ lệ đã chọn cho toàn bộ ảnh hiện có"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>{isProcessingImages ? "Đang xử lý..." : "Cắt Gọn Toàn Bộ"}</span>
                </button>
              )}
            </div>

            {optimizationMessage && (
              <div className="mt-2 text-[10px] sm:text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                <span className="font-medium">{optimizationMessage}</span>
              </div>
            )}

            {/* Image Drop & Upload Zone + Thumbnails */}
            <div className="mt-2.5 space-y-2">
              {/* Album Reorder Header when images exist */}
              {images.length > 0 && (
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs flex-wrap">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-amber-600 font-bold text-sm">👑</span>
                    <div>
                      <span className="font-bold text-amber-950 text-[11px] block leading-tight">
                        Trang 1 là Ảnh Bìa Chính (Hiển thị to nhất trên Facebook Feed)
                      </span>
                      <span className="text-[10px] text-amber-800/80 block">
                        Kéo thả trực tiếp ảnh hoặc bấm nút ◀ ▶ trên từng ảnh để đổi thứ tự trang
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto">
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={handleReverseImages}
                        className="px-2 py-1 rounded-md bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                        title="Đảo ngược toàn bộ thứ tự trang/ảnh"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-700" />
                        <span>Đảo Ngược</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowReorderModal(true)}
                      className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                      title="Mở bảng sắp xếp chi tiết toàn bộ album"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span>Sắp Xếp Album ({images.length})</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {/* Drag & Drop Upload Button Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center h-24 sm:h-28 border-2 border-dashed border-blue-300 hover:border-blue-600 rounded-xl bg-blue-50/30 hover:bg-blue-50 cursor-pointer transition-all p-2 text-center group select-none shadow-2xs"
                >
                  <Upload className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-[11px] text-blue-900 font-bold leading-tight">
                    Kéo ảnh vào đây
                  </span>
                  <span className="text-[9px] text-slate-500 mt-0.5">hoặc bấm chọn</span>
                  <span className="text-[8px] text-blue-600 font-semibold mt-1 bg-blue-100/80 px-1 rounded">
                    Paste (Ctrl+V)
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>

                {/* Uploaded Image Thumbnails with Drag & Drop, Reorder Arrows & Page Badges */}
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", idx.toString());
                      setDraggedImageIndex(idx);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverImageIndex(idx);
                    }}
                    onDragLeave={() => {
                      if (dragOverImageIndex === idx) setDragOverImageIndex(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedImageIndex !== null) {
                        handleMoveImage(draggedImageIndex, idx);
                        setDraggedImageIndex(null);
                        setDragOverImageIndex(null);
                      }
                    }}
                    onDragEnd={() => {
                      setDraggedImageIndex(null);
                      setDragOverImageIndex(null);
                    }}
                    className={`relative group h-24 sm:h-28 rounded-xl overflow-hidden border transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
                      idx === 0
                        ? "border-amber-400 ring-2 ring-amber-200 bg-amber-50/30"
                        : "border-slate-200 bg-slate-100"
                    } ${
                      dragOverImageIndex === idx
                        ? "scale-105 ring-2 ring-blue-500 border-blue-500 shadow-md"
                        : "shadow-2xs"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Trang ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />

                    {/* Page Badges - Always Visible */}
                    <div className="absolute top-1 left-1 z-10 flex items-center gap-1">
                      {idx === 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[9px] shadow-sm flex items-center gap-0.5">
                          <span>👑</span>
                          <span>Bìa (Trang 1)</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-slate-900/80 text-white font-bold text-[9px] shadow-sm">
                          Trang {idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Bottom Right Dimension Badge */}
                    <span className="absolute bottom-1 right-1 z-10 px-1 py-0.2 rounded bg-black/60 text-[8px] font-medium text-white">
                      {targetRatio}
                    </span>

                    {/* Hover Overlay with Reorder Arrows, Set as Cover, Preview & Delete */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 z-20">
                      {/* Top Action Row */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-white drop-shadow">
                          {idx === 0 ? "Ảnh bìa" : `#${idx + 1}`}
                        </span>

                        <div className="flex items-center gap-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetAsCover(idx);
                              }}
                              className="p-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs"
                              title="Đặt ảnh này làm Trang 1 (Ảnh bìa chính)"
                            >
                              <Star className="w-2.5 h-2.5 fill-current" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            className="p-1 rounded bg-red-600 hover:bg-red-700 text-white shadow-xs"
                            title="Xóa ảnh này"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      {/* Middle Reorder Arrows Bar */}
                      <div className="flex items-center justify-center gap-1.5 my-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveImage(idx, idx - 1);
                          }}
                          disabled={idx === 0}
                          className="p-1 rounded-md bg-white/90 hover:bg-white text-slate-800 disabled:opacity-30 disabled:pointer-events-none shadow-xs"
                          title="Di chuyển sang trước (Trang trước)"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <span className="text-[9px] text-white font-bold px-1 py-0.5 rounded bg-white/20">
                          {idx + 1}/{images.length}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveImage(idx, idx + 1);
                          }}
                          disabled={idx === images.length - 1}
                          className="p-1 rounded-md bg-white/90 hover:bg-white text-slate-800 disabled:opacity-30 disabled:pointer-events-none shadow-xs"
                          title="Di chuyển sang sau (Trang kế)"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bottom Preview Link */}
                      <div className="flex items-center justify-between text-[9px] text-white">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPreviewImage(img);
                          }}
                          className="hover:underline flex items-center gap-0.5 text-slate-200 hover:text-white"
                        >
                          <Eye className="w-2.5 h-2.5" />
                          <span>Phóng to</span>
                        </button>
                        <span className="text-amber-300 font-bold text-[8px]">Kéo để xếp</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sample Photo Chips */}
              <div className="pt-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                <span className="text-[10px] text-slate-400 whitespace-nowrap">Ảnh mẫu chuẩn:</span>
                <button
                  type="button"
                  onClick={() =>
                    handleAddSampleImage(
                      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60"
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-1"
                >
                  <span>+ Cơ Điện (4:3)</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleAddSampleImage(
                      "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=60"
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-1"
                >
                  <span>+ Công Trình (4:3)</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleAddSampleImage(
                      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60"
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-1"
                >
                  <span>+ Báo Giá (16:9)</span>
                </button>
                {images.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setImages([])}
                    className="text-[10px] px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-medium whitespace-nowrap flex-shrink-0 ml-auto"
                  >
                    Xóa hết ảnh ({images.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Next Step Callout */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200 shadow-2xs gap-2">
            <span className="text-[11px] text-slate-600">
              Đã sẵn sàng nội dung và ảnh đính kèm ({images.length} ảnh đã tối ưu).
            </span>
            <button
              onClick={onGoToNextTab}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0"
            >
              <span>Chọn Nhóm</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        {/* Right Column: Facebook Feed Preview with Mobile / Desktop Simulation (5 cols on desktop, toggleable on mobile) */}
        <div
          className={`lg:col-span-5 space-y-2.5 ${
            mobilePane === "editor" ? "hidden sm:block" : "block"
          }`}
        >
          {/* Preview Header & View Mode Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap">
                Mô Phỏng Facebook Feed
              </h3>
            </div>

            {/* Mobile / Desktop Toggle & Shuffle Variation */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1 rounded flex items-center gap-1 ${
                    previewDevice === "mobile"
                      ? "bg-white text-blue-700 font-bold shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Mô phỏng kích thước trên ứng dụng Facebook điện thoại"
                >
                  <Smartphone className="w-3 h-3" />
                  <span className="hidden xs:inline">Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1 rounded flex items-center gap-1 ${
                    previewDevice === "desktop"
                      ? "bg-white text-blue-700 font-bold shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Mô phỏng kích thước trên Facebook máy tính"
                >
                  <Monitor className="w-3 h-3" />
                  <span className="hidden xs:inline">Desktop</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setSpintaxContent((prev) => prev);
                }}
                className="text-[10px] sm:text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200"
                title="Đổi mẫu câu ngẫu nhiên"
              >
                <Shuffle className="w-3 h-3" />
                <span>Đổi Mẫu</span>
              </button>
            </div>
          </div>

          {/* Facebook Mock Post Card - Compact, Balanced, Does Not Swamp Screen */}
          <div
            className={`bg-white text-slate-900 rounded-xl border border-slate-200 shadow-sm overflow-hidden font-sans transition-all duration-200 mx-auto ${
              previewDevice === "mobile" ? "max-w-[400px]" : "w-full"
            }`}
          >
            {/* Simulation Platform Indicator Bar */}
            <div className="bg-slate-100 px-3 py-1 border-b border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                {previewDevice === "mobile" ? (
                  <>
                    <Smartphone className="w-3 h-3 text-slate-600" />
                    <span>Facebook Mobile Feed (Tối ưu vuốt chạm)</span>
                  </>
                ) : (
                  <>
                    <Monitor className="w-3 h-3 text-slate-600" />
                    <span>Facebook Desktop Feed</span>
                  </>
                )}
              </span>
              <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                <span>✓ Vừa vặn tầm nhìn</span>
              </span>
            </div>

            {/* Post Header */}
            <div className="p-2.5 sm:p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-blue-100 flex-shrink-0">
                  FB
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-xs leading-tight">
                    <span className="font-bold text-slate-900 whitespace-nowrap">
                      Nguyễn Văn An
                    </span>
                    <span className="text-blue-600 text-[10px] font-bold">✓</span>
                    <span className="text-[10px] text-slate-400">▶</span>
                    <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[120px] xs:max-w-[160px]">
                      Hội Cơ Điện & Xây Dựng
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
                    <span>Vừa xong</span>
                    <span>•</span>
                    <span>🌐 Công khai</span>
                  </div>
                </div>
              </div>

              <div className="text-slate-400 text-sm font-bold px-1 flex-shrink-0">
                •••
              </div>
            </div>

            {/* Post Content Text */}
            <div className="px-2.5 pb-2.5 sm:px-3 sm:pb-3 text-xs leading-relaxed whitespace-pre-line text-slate-800 break-words">
              {currentPreviewSample || "Nội dung bài viết sẽ hiển thị tại đây khi bạn nhập vào ô soạn thảo..."}
            </div>

            {/* Image Preview - Balanced & Compact Grid that Never Dominates the Entire Screen */}
            {images.length > 0 && (
              <div className="relative bg-slate-900 overflow-hidden border-t border-b border-slate-200">
                {/* 1 Image: Balanced ratio container */}
                {images.length === 1 && (
                  <div
                    className={`w-full overflow-hidden bg-slate-950 flex items-center justify-center ${
                      targetRatio === "16:9"
                        ? "aspect-video max-h-56"
                        : targetRatio === "1:1"
                        ? "aspect-square max-h-64 sm:max-h-72"
                        : "aspect-[4/3] max-h-64 sm:max-h-72"
                    }`}
                  >
                    <img
                      src={images[0]}
                      alt="Preview post 1"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                )}

                {/* 2 Images: 2 columns balanced 50/50 */}
                {images.length === 2 && (
                  <div className="grid grid-cols-2 gap-0.5 max-h-60 sm:max-h-64 aspect-[16/10] overflow-hidden bg-slate-900">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative h-full overflow-hidden bg-slate-800">
                        <img
                          src={img}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 3 Images: 1 large on left, 2 stacked on right */}
                {images.length === 3 && (
                  <div className="grid grid-cols-3 gap-0.5 max-h-60 sm:max-h-64 aspect-[16/10] overflow-hidden bg-slate-900">
                    <div className="col-span-2 relative h-full overflow-hidden bg-slate-800">
                      <img
                        src={images[0]}
                        alt="Preview primary"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="col-span-1 grid grid-rows-2 gap-0.5 h-full">
                      <div className="relative overflow-hidden bg-slate-800">
                        <img
                          src={images[1]}
                          alt="Preview secondary 1"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="relative overflow-hidden bg-slate-800">
                        <img
                          src={images[2]}
                          alt="Preview secondary 2"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4+ Images: Facebook classic multi-grid layout */}
                {images.length >= 4 && (
                  <div className="grid grid-cols-2 gap-0.5 max-h-64 sm:max-h-72 aspect-square overflow-hidden bg-slate-900">
                    {images.slice(0, 4).map((img, idx) => (
                      <div key={idx} className="relative aspect-square overflow-hidden bg-slate-800">
                        <img
                          src={img}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 3 && images.length > 4 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-black text-lg">
                            +{images.length - 3}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Dimension Tag Overlay */}
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-2xs text-[9px] text-white font-medium flex items-center gap-1 shadow-xs">
                  <span>Khung {targetRatio}</span>
                  <span className="text-emerald-400 font-bold">• Vừa vặn</span>
                </div>
              </div>
            )}

            {/* Post Stats & Reactions */}
            <div className="px-2.5 py-1.5 flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-100">
              <span className="flex items-center gap-1">
                <span className="flex -space-x-1">
                  <span className="inline-block w-3.5 h-3.5 rounded-full bg-blue-500 text-[9px] text-white text-center leading-3.5">👍</span>
                  <span className="inline-block w-3.5 h-3.5 rounded-full bg-red-500 text-[9px] text-white text-center leading-3.5">❤️</span>
                </span>
                <span className="font-semibold text-slate-700 ml-0.5">38 tương tác</span>
              </span>
              <span>7 bình luận • 2 chia sẻ</span>
            </div>

            {/* Like, Comment, Share Action Buttons (Always clearly visible in viewport) */}
            <div className="grid grid-cols-3 text-center py-1 text-[11px] font-semibold text-slate-600 divide-x divide-slate-100">
              <button className="hover:bg-slate-50 py-1.5 rounded flex items-center justify-center gap-1">
                <span>👍</span> <span>Thích</span>
              </button>
              <button className="hover:bg-slate-50 py-1.5 rounded flex items-center justify-center gap-1">
                <span>💬</span> <span>Bình luận</span>
              </button>
              <button className="hover:bg-slate-50 py-1.5 rounded flex items-center justify-center gap-1">
                <span>↗️</span> <span>Chia sẻ</span>
              </button>
            </div>
          </div>

          {/* Engagement Guarantee Note */}
          <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200 text-[10px] sm:text-[11px] text-slate-600 leading-relaxed">
            <div className="font-bold text-blue-900 flex items-center gap-1 mb-0.5">
              <Check className="w-3.5 h-3.5 text-blue-600" />
              <span>Tại sao cần chuẩn hóa ảnh trên Facebook?</span>
            </div>
            <p>
              Nếu ảnh quá dài (ảnh dọc 9:16), ảnh sẽ che kín toàn bộ màn hình điện thoại khiến người xem lướt qua mà không thấy nội dung hay thông tin liên hệ. Định dạng <strong>4:3 hoặc 1:1</strong> giữ trọn văn bản và nút <strong>Bình luận/Inbox</strong> ngay trước mắt, tăng mạnh tỷ lệ chuyển đổi.
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox / Full-size Modal */}
      {selectedPreviewImage && (
        <div
          onClick={() => setSelectedPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
        >
          <div className="relative max-w-2xl max-h-[90vh] p-2 bg-white rounded-xl overflow-hidden shadow-2xl">
            <img
              src={selectedPreviewImage}
              alt="Full preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <div className="p-2 flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">Ảnh đã tối ưu định dạng</span>
              <button
                onClick={() => setSelectedPreviewImage(null)}
                className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Album / Page Reorder Modal */}
      {showReorderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold">
                  <ArrowUpDown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    Sắp Xếp Thứ Tự Trang / Ảnh Album ({images.length} ảnh)
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Trang 1 là ảnh bìa chính hiển thị nổi bật nhất trên Facebook Feed
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowReorderModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Notice */}
            <div className="px-4 py-2 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-[11px] text-blue-900">
              <span className="flex items-center gap-1.5">
                <span>💡</span>
                <span>Dùng nút mũi tên hoặc kéo thả từng ảnh để thay đổi thứ tự trang.</span>
              </span>
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={handleReverseImages}
                  className="text-[10px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Đảo Ngược Toàn Bộ</span>
                </button>
              )}
            </div>

            {/* Reorderable Image List */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-2 max-h-[55vh]">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", idx.toString());
                    setDraggedImageIndex(idx);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverImageIndex(idx);
                  }}
                  onDragLeave={() => {
                    if (dragOverImageIndex === idx) setDragOverImageIndex(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedImageIndex !== null) {
                      handleMoveImage(draggedImageIndex, idx);
                      setDraggedImageIndex(null);
                      setDragOverImageIndex(null);
                    }
                  }}
                  onDragEnd={() => {
                    setDraggedImageIndex(null);
                    setDragOverImageIndex(null);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-grab active:cursor-grabbing ${
                    idx === 0
                      ? "bg-amber-50/60 border-amber-300 ring-2 ring-amber-100 shadow-xs"
                      : "bg-white hover:bg-slate-50 border-slate-200 shadow-2xs"
                  } ${
                    dragOverImageIndex === idx
                      ? "border-blue-500 ring-2 ring-blue-200 scale-[1.01]"
                      : ""
                  }`}
                >
                  {/* Left: Drag Handle, Number Badge, Thumbnail */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="text-slate-400 hover:text-slate-700 cursor-grab p-1">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Page Position Badge */}
                    <div className="flex-shrink-0">
                      {idx === 0 ? (
                        <span className="px-2 py-1 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] shadow-2xs flex items-center gap-1 whitespace-nowrap">
                          <span>👑</span>
                          <span>Trang 1 (Bìa)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200 whitespace-nowrap">
                          Trang {idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Thumbnail Image */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                      <img
                        src={img}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Label */}
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {idx === 0 ? "Ảnh bìa hiển thị đầu tiên" : `Ảnh trang phụ thứ ${idx + 1}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Khung hình: {targetRatio}
                      </div>
                    </div>
                  </div>

                  {/* Right: Reorder Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetAsCover(idx)}
                        className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold flex items-center gap-1 transition-colors"
                        title="Đưa ảnh này lên làm Trang 1 (Ảnh bìa)"
                      >
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                        <span className="hidden sm:inline">Làm Bìa</span>
                      </button>
                    )}

                    {/* Move Up */}
                    <button
                      type="button"
                      onClick={() => handleMoveImage(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Di chuyển lên trên"
                    >
                      <ChevronLeft className="w-4 h-4 rotate-90" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      onClick={() => handleMoveImage(idx, idx + 1)}
                      disabled={idx === images.length - 1}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Di chuyển xuống dưới"
                    >
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      title="Xóa ảnh này khỏi bài viết"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Thay đổi được cập nhật trực tiếp vào bản xem trước Facebook
              </span>

              <button
                type="button"
                onClick={() => setShowReorderModal(false)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Xong & Lưu Thứ Tự
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Draft Modal */}
      {showSaveDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Lưu Bài Viết & Toàn Bộ Ảnh Đính Kèm
                </h3>
              </div>
              <button
                onClick={() => setShowSaveDraftModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Đặt tên cho bài viết mẫu / bản nháp này:
                </label>
                <input
                  type="text"
                  value={draftTitleInput}
                  onChange={(e) => setDraftTitleInput(e.target.value)}
                  placeholder={`Ví dụ: Bài Bất Động Sản Ca Sáng - ${new Date().toLocaleDateString("vi-VN")}`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden font-medium"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveNamedDraft();
                  }}
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Ảnh đính kèm sẽ lưu:</span>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {images.length} ảnh
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Trích đoạn:{" "}
                  <span className="text-slate-700 font-mono italic">
                    {(rawContent || spintaxContent).slice(0, 75) || "(Không có chữ)"}...
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSaveDraftModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSaveNamedDraft()}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Bản Nháp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drafts & Previous Post History Modal */}
      {showDraftsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Danh Sách Bản Nháp & Khôi Phục Bài Đã Soạn
                </h3>
              </div>
              <button
                onClick={() => setShowDraftsModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 rounded-lg"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {drafts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                  <FolderOpen className="w-8 h-8 mx-auto text-slate-300" />
                  <p>Chưa có bản nháp nào được lưu. Hãy bấm "Lưu Bài Này" khi soạn bài!</p>
                </div>
              ) : (
                drafts.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/20 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                            {d.title}
                          </h4>
                          {d.isAutoSaved && (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                              ⚡ Tự Động Lưu Phiên Trước
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(d.updatedAt).toLocaleDateString("vi-VN")} lúc{" "}
                            {new Date(d.updatedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleRestoreDraft(d)}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1"
                          title="Nạp toàn bộ nội dung và hình ảnh của bản nháp này vào khung soạn bài"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Khôi Phục Bài Này</span>
                        </button>

                        {!d.isAutoSaved && (
                          <button
                            onClick={(e) => handleDeleteDraft(d.id, e)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            title="Xóa bản nháp này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 line-clamp-2 bg-white p-2 rounded-lg border border-slate-200 font-mono text-[11px]">
                      {d.spintaxContent || d.rawContent || "(Bài viết không có nội dung chữ)"}
                    </div>

                    {d.images && d.images.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        <span className="text-[10px] text-slate-500 font-semibold whitespace-nowrap">
                          {d.images.length} ảnh đính kèm:
                        </span>
                        {d.images.slice(0, 5).map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Preview ${idx}`}
                            className="w-9 h-9 object-cover rounded-md border border-slate-200 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                        {d.images.length > 5 && (
                          <span className="text-[10px] text-slate-500 font-bold px-1.5 py-1 bg-slate-100 rounded">
                            +{d.images.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                Lưu trữ an toàn trên IndexedDB máy tính/điện thoại
              </span>
              <button
                onClick={() => setShowDraftsModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variations Modal */}
      {showVariationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Shuffle className="w-4 h-4 text-amber-600" />
                5 Mẫu Biến Thể Xoay Vòng Thử Nghiệm
              </h3>
              <button
                onClick={() => setShowVariationsModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-2 text-xs divide-y divide-slate-100">
              {previewVariations.map((text, i) => (
                <div key={i} className="pt-2 first:pt-0 space-y-1">
                  <div className="text-[10px] font-bold text-blue-600 uppercase">
                    Mẫu #{i + 1} (Gửi vào nhóm #{i + 1}):
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-800 text-[11px] leading-relaxed whitespace-pre-line font-mono border border-slate-200">
                    {text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowVariationsModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
              >
                Đã Hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

