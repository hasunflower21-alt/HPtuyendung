/**
 * Background Execution & Ultra-Low Battery Runner for Mobile Phones
 * Enables continuous background running on iOS Safari & Android Chrome
 * while consuming minimal CPU and battery power.
 */

class BackgroundRunnerService {
  private wakeLockSentinel: any = null;
  private audioContext: AudioContext | null = null;
  private silentOscillator: OscillatorNode | null = null;
  private silentGain: GainNode | null = null;
  private worker: Worker | null = null;
  private isRunning: boolean = false;
  private isKeepAliveActive: boolean = false;

  // Initialize Web Worker for un-throttled background clock
  public createBackgroundWorker(onTick: () => void): Worker | null {
    try {
      const workerCode = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (timer) clearInterval(timer);
            timer = setInterval(() => {
              self.postMessage('tick');
            }, 1000);
          } else if (e.data === 'stop') {
            if (timer) {
              clearInterval(timer);
              timer = null;
            }
          }
        };
      `;
      const blob = new Blob([workerCode], { type: "application/javascript" });
      const worker = new Worker(URL.createObjectURL(blob));
      worker.onmessage = (e) => {
        if (e.data === "tick") {
          onTick();
        }
      };
      this.worker = worker;
      return worker;
    } catch (err) {
      console.warn("Web Worker not supported in this environment:", err);
      return null;
    }
  }

  public startWorkerTicker() {
    if (this.worker) {
      this.worker.postMessage("start");
    }
  }

  public stopWorkerTicker() {
    if (this.worker) {
      this.worker.postMessage("stop");
    }
  }

  // Request Screen Wake Lock to prevent mobile phone from auto-locking/sleeping
  public async enableWakeLock(): Promise<boolean> {
    if (typeof window === "undefined" || !("wakeLock" in navigator)) {
      return false;
    }
    try {
      this.wakeLockSentinel = await (navigator as any).wakeLock.request("screen");
      this.wakeLockSentinel.addEventListener("release", () => {
        // Released
      });

      // Auto re-acquire if visibility changes
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
      return true;
    } catch (err) {
      console.warn("Wake lock could not be acquired:", err);
      return false;
    }
  }

  private handleVisibilityChange = async () => {
    if (this.wakeLockSentinel !== null && document.visibilityState === "visible") {
      try {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request("screen");
      } catch (e) {
        // ignore
      }
    }
  };

  public releaseWakeLock() {
    try {
      if (this.wakeLockSentinel) {
        this.wakeLockSentinel.release();
        this.wakeLockSentinel = null;
      }
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Starts an inaudible background audio stream.
   * Mobile OS (iOS & Android) prioritizes tabs playing media, preventing
   * JavaScript throttling and network disconnection when backgrounded or locked.
   */
  public enableMobileBackgroundKeepAlive(): boolean {
    if (typeof window === "undefined") return false;
    if (this.isKeepAliveActive) return true;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return false;

      this.audioContext = new AudioCtx();
      
      // In iOS Safari, AudioContext starts suspended until user gesture
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }

      // Create ultra-low frequency oscillator (almost zero CPU, zero audible sound)
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      // Inaudible frequency and zero amplitude
      osc.frequency.setValueAtTime(20, this.audioContext.currentTime); // 20Hz
      gain.gain.setValueAtTime(0.00001, this.audioContext.currentTime); // Inaudible

      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start();

      this.silentOscillator = osc;
      this.silentGain = gain;
      this.isKeepAliveActive = true;

      // Register Media Session for mobile lock screen integration
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: "FB Đẩy Bài - Tự Động Chạy Ẩn",
          artist: "Anti-Checkpoint Engine",
          album: "Chế Độ Tiết Kiệm Pin Điện Thoại",
        });

        navigator.mediaSession.playbackState = "playing";
      }

      return true;
    } catch (err) {
      console.warn("Background audio keep-alive not available:", err);
      return false;
    }
  }

  public disableMobileBackgroundKeepAlive() {
    try {
      if (this.silentOscillator) {
        this.silentOscillator.stop();
        this.silentOscillator.disconnect();
        this.silentOscillator = null;
      }
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
      this.isKeepAliveActive = false;

      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "none";
      }
    } catch (e) {
      // ignore
    }
  }

  public cleanUp() {
    this.releaseWakeLock();
    this.disableMobileBackgroundKeepAlive();
    this.stopWorkerTicker();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export const backgroundRunner = new BackgroundRunnerService();

export const enableWakeLock = () => backgroundRunner.enableWakeLock();
export const disableWakeLock = () => backgroundRunner.releaseWakeLock();
export const enableMobileBackgroundKeepAlive = () => backgroundRunner.enableMobileBackgroundKeepAlive();
export const disableMobileBackgroundKeepAlive = () => backgroundRunner.disableMobileBackgroundKeepAlive();
