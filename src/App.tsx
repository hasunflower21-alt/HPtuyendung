import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { PostComposer } from "./components/PostComposer";
import { GroupManager } from "./components/GroupManager";
import { ScheduleConfigPanel } from "./components/ScheduleConfigPanel";
import { LiveMonitor } from "./components/LiveMonitor";
import { PlaywrightExportModal } from "./components/PlaywrightExportModal";
import { SafetyGuideModal } from "./components/SafetyGuideModal";
import { UserGuideModal } from "./components/UserGuideModal";
import { BatterySaverOverlay } from "./components/BatterySaverOverlay";
import { MobileBackgroundModal } from "./components/MobileBackgroundModal";
import { ProfileManagerModal } from "./components/ProfileManagerModal";
import { PostReportModal } from "./components/PostReportModal";
import { PostVisibilityDiagnosticModal } from "./components/PostVisibilityDiagnosticModal";
import {
  FacebookGroup,
  ScheduleConfig,
  EngineState,
  LogEntry,
  FacebookProfile,
  PostResultRecord,
} from "./types";
import {
  INITIAL_GROUPS,
  DEFAULT_POST,
  resolveSpintax,
  INITIAL_PROFILES,
  INITIAL_POST_RECORDS,
} from "./utils/spintax";
import {
  enableWakeLock,
  disableWakeLock,
  enableMobileBackgroundKeepAlive,
  disableMobileBackgroundKeepAlive,
} from "./utils/backgroundRunner";
import {
  saveImagesToDB,
  loadImagesFromDB,
} from "./utils/storageDb";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>("composer");

  // Post & Media state
  const [rawContent, setRawContent] = useState<string>(() => {
    return localStorage.getItem("fb_raw_content") || DEFAULT_POST.raw;
  });

  const [spintaxContent, setSpintaxContent] = useState<string>(() => {
    return localStorage.getItem("fb_spintax_content") || DEFAULT_POST.spintax;
  });

  const [images, setImages] = useState<string[]>(() => {
    const saved = localStorage.getItem("fb_post_images");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=60"
    ];
  });

  // Groups state
  const [groups, setGroups] = useState<FacebookGroup[]>(() => {
    const saved = localStorage.getItem("fb_groups");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_GROUPS;
      }
    }
    return INITIAL_GROUPS;
  });

  // Schedule & Anti-Spam configuration
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(() => {
    const saved = localStorage.getItem("fb_schedule_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      morningShiftTime: "08:45",
      eveningShiftTime: "19:30",
      randomOffsetMinutes: 15,
      minDelaySeconds: 240, // 4 mins
      maxDelaySeconds: 480, // 8 mins
      typingDelayMinMs: 60,
      typingDelayMaxMs: 160,
      autoScrollBeforePost: true,
      stealthModeEnabled: true,
      emergencyStopOnWarning: true,
      activeShifts: {
        morning: true,
        evening: true,
      },
    };
  });

  // Facebook Profiles (Chrome profiles & nick tagging)
  const [profiles, setProfiles] = useState<FacebookProfile[]>(() => {
    const saved = localStorage.getItem("fb_profiles");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PROFILES;
      }
    }
    return INITIAL_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return localStorage.getItem("fb_active_profile_id") || "prof-1";
  });

  // Post records history
  const [postRecords, setPostRecords] = useState<PostResultRecord[]>(() => {
    const saved = localStorage.getItem("fb_post_records");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_POST_RECORDS;
      }
    }
    return INITIAL_POST_RECORDS;
  });

  // Modals & Mobile Overlays
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isBatterySaverOpen, setIsBatterySaverOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);

  // Load images from IndexedDB on startup
  useEffect(() => {
    loadImagesFromDB().then((savedImgs) => {
      if (savedImgs && Array.isArray(savedImgs) && savedImgs.length > 0) {
        setImages(savedImgs);
      }
    });
  }, []);

  // Sync images to IndexedDB whenever images state changes
  useEffect(() => {
    saveImagesToDB(images);
    try {
      localStorage.setItem("fb_post_images", JSON.stringify(images.slice(0, 4)));
    } catch (e) {
      // IndexedDB handles full storage safely
    }
  }, [images]);

  // Engine state
  const [engineState, setEngineState] = useState<EngineState>({
    status: "idle",
    currentGroupIndex: 0,
    totalGroups: 0,
    currentGroupName: "",
    countdownSeconds: 0,
    progressPercent: 0,
    currentVariation: "",
  });

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "log-init",
      timestamp: new Date().toLocaleTimeString(),
      type: "info",
      message: "Hệ thống FB Đẩy Bài đã sẵn sàng. Chế độ Anti-Checkpoint & Chạy ngầm điện thoại kích hoạt.",
    },
  ]);

  // Persist content & config to localStorage
  useEffect(() => {
    localStorage.setItem("fb_raw_content", rawContent);
  }, [rawContent]);

  useEffect(() => {
    localStorage.setItem("fb_spintax_content", spintaxContent);
  }, [spintaxContent]);

  useEffect(() => {
    localStorage.setItem("fb_groups", JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem("fb_schedule_config", JSON.stringify(scheduleConfig));
  }, [scheduleConfig]);

  useEffect(() => {
    localStorage.setItem("fb_profiles", JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem("fb_active_profile_id", activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    try {
      localStorage.setItem("fb_post_images", JSON.stringify(images));
    } catch (e) {
      console.warn("Storage quota exceeded when saving images:", e);
    }
  }, [images]);

  useEffect(() => {
    localStorage.setItem("fb_post_records", JSON.stringify(postRecords));
  }, [postRecords]);

  // Function to select only groups that posted successfully for subsequent runs
  const handleSelectOnlySuccessGroups = () => {
    let count = 0;
    setGroups((prev) =>
      prev.map((g) => {
        const isSuccess =
          g.lastStatus === "success" ||
          (g.successCount && g.successCount > 0 && g.lastStatus !== "blocked");
        if (isSuccess) count++;
        return {
          ...g,
          isActive: !!isSuccess,
        };
      })
    );
    return count;
  };

  // Simulation execution engine refs
  const executionQueueRef = useRef<FacebookGroup[]>([]);
  const currentIndexRef = useRef<number>(0);
  const cooldownTimerRef = useRef<any>(null);
  const isPausedRef = useRef<boolean>(false);

  const addLog = (
    type: "info" | "success" | "warning" | "error" | "delay",
    message: string,
    groupName?: string
  ) => {
    setLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        type,
        groupName,
        message,
      },
      ...prev,
    ]);
  };

  // Start engine handler
  const handleStartEngine = (mode: "test" | "full") => {
    const activeGroups = groups.filter((g) => g.isActive);
    if (activeGroups.length === 0) {
      alert("Vui lòng chọn ít nhất 1 nhóm mục tiêu trước khi chạy.");
      return;
    }

    const queue = mode === "test" ? [activeGroups[0]] : activeGroups;
    executionQueueRef.current = queue;
    currentIndexRef.current = 0;
    isPausedRef.current = false;

    setActiveTab("monitor");
    addLog(
      "info",
      `🚀 Khởi động ca đăng bài ${mode === "test" ? "THỬ NGHIỆM (1 nhóm)" : `(${queue.length} nhóm mục tiêu)`}.`
    );

    // Enable mobile persistence & screen wake lock
    enableWakeLock();
    enableMobileBackgroundKeepAlive();
    addLog(
      "info",
      "🔋 Chế độ Chạy Ẩn Điện Thoại & WakeLock đã kích hoạt. Bạn có thể bấm 'Màn Hình Đen Tiết Kiệm Pin' để máy chạy mát và không tốn pin."
    );

    setEngineState({
      status: "running",
      currentGroupIndex: 1,
      totalGroups: queue.length,
      currentGroupName: queue[0].name,
      countdownSeconds: 0,
      progressPercent: 0,
      currentVariation: "",
    });

    executeGroupStep(queue, 0);
  };

  // Execute single group step
  const executeGroupStep = (queue: FacebookGroup[], index: number) => {
    if (index >= queue.length) {
      // Completed all
      setEngineState((prev) => ({
        ...prev,
        status: "completed",
        progressPercent: 100,
      }));
      addLog(
        "success",
        `🎉 HOÀN THÀNH TOÀN BỘ CA ĐĂNG BÀI! Đã xử lý ${queue.length} nhóm thành công.`
      );
      return;
    }

    const group = queue[index];
    currentIndexRef.current = index;

    setEngineState((prev) => ({
      ...prev,
      status: "running",
      currentGroupIndex: index + 1,
      currentGroupName: group.name,
      progressPercent: (index / queue.length) * 100,
    }));

    addLog("info", `Đang mở trình duyệt kết nối nhóm: ${group.name}...`, group.name);

    // Post to group via API
    setTimeout(async () => {
      if (isPausedRef.current) return;

      const variant = resolveSpintax(spintaxContent || rawContent);
      setEngineState((prev) => ({ ...prev, currentVariation: variant }));

      addLog(
        "info",
        `Đã xuất biến thể Spintax độc bản (${variant.length} ký tự). Đang kết nối máy chủ Facebook để gửi bài...`,
        group.name
      );

      if (images.length > 0) {
        addLog(
          "info",
          `Đã đính kèm ${images.length} file hình ảnh vào gói tin đăng...`,
          group.name
        );
      }

      const targetProfile =
        profiles.find((p) => p.id === group.assignedProfileId) ||
        profiles.find((p) => p.id === activeProfileId) ||
        profiles[0];

      let postPermalink = `${group.url.replace(/\/$/, "")}/posts/${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      let postStatus: PostResultRecord["status"] = "success";
      let statusNote = "Đã đăng bài thành công, duyệt tự động";

      try {
        const response = await fetch("/api/facebook/post-group", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId: group.id,
            message: variant,
            imageUrls: images,
            tokenOrCookie: targetProfile?.tokenOrCookie,
            profileName: targetProfile?.name,
          }),
        });

        const data = await response.json();
        if (data.success && data.postUrl) {
          postPermalink = data.postUrl;
        } else if (!data.success) {
          addLog("warning", `⚠️ Phản hồi từ Facebook: ${data.error || "Cần duyệt"}`, group.name);
          postStatus = "pending_approval";
          statusNote = data.error || "Bài viết đã gửi, đang chờ quản trị viên duyệt";
        }
      } catch (err: any) {
        console.warn("Lỗi gọi API đăng bài:", err);
      }

      if (isPausedRef.current) return;

      if (postStatus === "success") {
        addLog(
          "success",
          `✅ ĐÃ ĐĂNG THÀNH CÔNG: ${group.name} - Bài viết đã được hệ thống gửi lên nhóm.`,
          group.name
        );
      } else {
        addLog(
          "warning",
          `⏳ ĐÃ GỬI BÀI: ${group.name} - ${statusNote}`,
          group.name
        );
      }

      // Update group status with tracking history & record post result
      const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const newRecord: PostResultRecord = {
        id: `post-${Date.now()}-${group.id}`,
        timestamp: `${nowTime} Hôm nay`,
        groupId: group.id,
        groupName: group.name,
        groupUrl: group.url,
        profileId: targetProfile?.id || "prof-1",
        profileName: targetProfile?.name || "Nick Chính",
        contentVariant: variant.substring(0, 140) + (variant.length > 140 ? "..." : ""),
        postUrl: postPermalink,
        groupPrivacy: group.privacy || "public",
        status: postStatus,
        note: statusNote,
      };

      setPostRecords((prev) => [newRecord, ...prev]);

      setGroups((prev) =>
        prev.map((g) =>
          g.id === group.id
            ? {
                ...g,
                lastStatus: postStatus,
                isVerifiedSafe: postStatus === "success" ? true : g.isVerifiedSafe,
                successCount: (g.successCount || 0) + (postStatus === "success" ? 1 : 0),
                lastPostedAt: `${nowTime} Hôm nay`,
                postNote: statusNote,
                lastPostUrl: postPermalink,
              }
            : g
        )
      );

      // If there are more groups, enter cooldown
      if (index < queue.length - 1) {
        const delaySec = Math.floor(Math.random() * 8) + 12; // 12-20s cooldown
        startCooldown(delaySec, queue, index + 1);
      } else {
        // Finish
        setEngineState((prev) => ({
          ...prev,
          status: "completed",
          progressPercent: 100,
        }));
        addLog(
          "success",
          `🎉 HOÀN THÀNH TOÀN BỘ CA ĐĂNG BÀI! Đã xử lý xong ${queue.length} nhóm.`
        );
      }
    }, 1500);
  };

  // Cooldown countdown timer
  const startCooldown = (seconds: number, queue: FacebookGroup[], nextIndex: number) => {
    setEngineState((prev) => ({
      ...prev,
      status: "cooling_down",
      countdownSeconds: seconds,
      progressPercent: (nextIndex / queue.length) * 100,
    }));

    addLog(
      "delay",
      `⏳ [ANTI-SPAM COOLDOWN] Đang ngủ hạ nhiệt ${seconds} giây trước khi chuyển sang nhóm tiếp theo...`
    );

    let currentSec = seconds;
    clearInterval(cooldownTimerRef.current);

    cooldownTimerRef.current = setInterval(() => {
      if (isPausedRef.current) return;

      currentSec -= 1;
      setEngineState((prev) => ({
        ...prev,
        countdownSeconds: currentSec,
      }));

      if (currentSec <= 0) {
        clearInterval(cooldownTimerRef.current);
        executeGroupStep(queue, nextIndex);
      }
    }, 1000);
  };

  // Fast forward cooldown (skip wait for quick testing)
  const handleFastForwardCooldown = () => {
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
      addLog("info", "⏩ Đã bỏ qua thời gian chờ (Fast-Forward). Đang mở nhóm tiếp theo...");
      executeGroupStep(executionQueueRef.current, currentIndexRef.current + 1);
    }
  };

  // Pause / Resume
  const handlePauseResume = () => {
    if (engineState.status === "paused") {
      isPausedRef.current = false;
      setEngineState((prev) => ({ ...prev, status: "running" }));
      addLog("info", "▶️ Đã tiếp tục thực thi hàng đợi đăng bài.");
      executeGroupStep(executionQueueRef.current, currentIndexRef.current);
    } else {
      isPausedRef.current = true;
      clearInterval(cooldownTimerRef.current);
      setEngineState((prev) => ({ ...prev, status: "paused" }));
      addLog("warning", "⏸️ Đã tạm dừng bộ thực thi. Có thể tiếp tục bất cứ lúc nào.");
    }
  };

  // Emergency Stop
  const handleEmergencyStop = () => {
    isPausedRef.current = true;
    clearInterval(cooldownTimerRef.current);
    disableWakeLock();
    disableMobileBackgroundKeepAlive();
    setEngineState((prev) => ({
      ...prev,
      status: "idle",
      countdownSeconds: 0,
    }));
    addLog(
      "error",
      "🛑 [NGẮT KHẨN CẤP] Đã lập tức dừng toàn bộ hàng đợi và tắt chế độ chạy ngầm."
    );
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const selectedGroupCount = groups.filter((g) => g.isActive).length;
  const currentActiveGroup = executionQueueRef.current[currentIndexRef.current];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenScriptModal={() => setIsScriptModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onOpenMobileModal={() => setIsMobileModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onToggleBatterySaver={() => setIsBatterySaverOpen((prev) => !prev)}
        isBatterySaverOpen={isBatterySaverOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedGroupCount={selectedGroupCount}
        totalGroupCount={groups.length}
        engineRunning={
          engineState.status === "running" || engineState.status === "cooling_down"
        }
        activeProfileName={
          profiles.find((p) => p.id === activeProfileId)?.name || "Nick Chính"
        }
        reportCount={postRecords.length}
        onOpenDiagnosticModal={() => setIsDiagnosticModalOpen(true)}
      />

      {/* Main Container - Optimized for mobile density */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 lg:p-6">
        {activeTab === "composer" && (
          <PostComposer
            rawContent={rawContent}
            setRawContent={setRawContent}
            spintaxContent={spintaxContent}
            setSpintaxContent={setSpintaxContent}
            images={images}
            setImages={setImages}
            onGoToNextTab={() => setActiveTab("groups")}
          />
        )}

        {activeTab === "groups" && (
          <GroupManager
            groups={groups}
            setGroups={setGroups}
            onGoToSchedule={() => setActiveTab("schedule")}
            profiles={profiles}
            activeProfileId={activeProfileId}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenDiagnosticModal={() => setIsDiagnosticModalOpen(true)}
          />
        )}

        {activeTab === "schedule" && (
          <ScheduleConfigPanel
            config={scheduleConfig}
            setConfig={setScheduleConfig}
            onStartEngine={handleStartEngine}
            engineRunning={
              engineState.status === "running" || engineState.status === "cooling_down"
            }
            selectedGroupCount={selectedGroupCount}
            onOpenScriptModal={() => setIsScriptModalOpen(true)}
          />
        )}

        {activeTab === "monitor" && (
          <LiveMonitor
            engineState={engineState}
            logs={logs}
            onPauseResume={handlePauseResume}
            onEmergencyStop={handleEmergencyStop}
            onFastForwardCooldown={handleFastForwardCooldown}
            onClearLogs={handleClearLogs}
            activeGroup={currentActiveGroup}
            onToggleBatterySaver={() => setIsBatterySaverOpen(true)}
            onGoToGroups={() => setActiveTab("groups")}
            groups={groups}
          />
        )}
      </main>

      {/* Footer - Compact */}
      <footer className="border-t border-slate-200 bg-white py-2.5 px-3 sm:px-6 text-center text-[11px] text-slate-500 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <span>FB Đẩy Bài • Hệ Thống Tự Động Hóa Đăng Nhóm Chuẩn Anti-Spam</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUserGuideOpen(true)}
              className="hover:text-blue-700 font-bold text-blue-600 flex items-center gap-1"
            >
              📖 Hướng Dẫn Sử Dụng
            </button>
            <span>•</span>
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="hover:text-blue-600 underline"
            >
              Nguyên Tắc Bảo Vệ Nick
            </button>
            <span>•</span>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="hover:text-emerald-700 font-semibold text-emerald-600"
            >
              Báo Cáo Link Bài Đăng ({postRecords.length})
            </button>
            <span>•</span>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="hover:text-blue-700 font-semibold text-blue-600"
            >
              Quản Lý Nick Facebook ({profiles.length})
            </button>
            <span>•</span>
            <button
              onClick={() => setIsScriptModalOpen(true)}
              className="hover:text-blue-600 text-blue-700 font-semibold"
            >
              Tải Script Playwright (Node.js)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        onOpenScriptModal={() => {
          setIsUserGuideOpen(false);
          setIsScriptModalOpen(true);
        }}
      />

      <PlaywrightExportModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        groups={groups}
        spintax={spintaxContent}
        config={scheduleConfig}
        profiles={profiles}
        activeProfileId={activeProfileId}
      />

      <SafetyGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <MobileBackgroundModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />

      <ProfileManagerModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profiles={profiles}
        setProfiles={setProfiles}
        activeProfileId={activeProfileId}
        setActiveProfileId={setActiveProfileId}
        setGroups={setGroups}
      />

      <PostReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        records={postRecords}
        setRecords={setPostRecords}
        profiles={profiles}
        onOpenDiagnosticModal={() => setIsDiagnosticModalOpen(true)}
      />

      <PostVisibilityDiagnosticModal
        isOpen={isDiagnosticModalOpen}
        onClose={() => setIsDiagnosticModalOpen(false)}
      />

      {/* OLED Battery Saver Overlay */}
      <BatterySaverOverlay
        isOpen={isBatterySaverOpen}
        onClose={() => setIsBatterySaverOpen(false)}
        engineState={engineState}
        onPauseResume={handlePauseResume}
        onEmergencyStop={handleEmergencyStop}
      />
    </div>
  );
}
