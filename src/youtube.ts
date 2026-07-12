import { DOUBLE_TAP_MS } from "./config";

const VIDEO_SELECTORS = [
  "video.html5-main-video",
  "#movie_player video",
  "ytm-player video",
  "video",
] as const;

export class YouTubeController {
  private video: HTMLVideoElement | null = null;

  refresh(): HTMLVideoElement | null {
    for (const selector of VIDEO_SELECTORS) {
      const candidate = document.querySelector<HTMLVideoElement>(selector);
      if (candidate) {
        candidate.playsInline = true;
        this.video = candidate;
        return candidate;
      }
    }
    this.video = null;
    return null;
  }

  get current(): HTMLVideoElement | null {
    return this.video ?? this.refresh();
  }

  async togglePlayback(): Promise<void> {
    const video = this.requireVideo();
    if (video.paused) await video.play();
    else video.pause();
  }

  seekBy(seconds: number): void {
    const video = this.requireVideo();
    const duration = Number.isFinite(video.duration) ? video.duration : Number.POSITIVE_INFINITY;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  }

  seekToFraction(fraction: number): void {
    const video = this.requireVideo();
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    video.currentTime = Math.max(0, Math.min(1, fraction)) * video.duration;
  }

  setupTapGestures(
    element: HTMLElement,
    seconds: number,
    onSingleTap: () => void,
    onSeek: () => void,
  ): () => void {
    let lastTap = 0;
    let singleTapTimer = 0;
    const listener = (event: PointerEvent): void => {
      event.preventDefault();
      event.stopPropagation();
      const now = performance.now();
      if (now - lastTap <= DOUBLE_TAP_MS) {
        window.clearTimeout(singleTapTimer);
        lastTap = 0;
        this.seekBy(seconds);
        onSeek();
      } else {
        lastTap = now;
        singleTapTimer = window.setTimeout(() => {
          lastTap = 0;
          onSingleTap();
        }, DOUBLE_TAP_MS);
      }
    };
    element.addEventListener("pointerup", listener);
    return () => {
      window.clearTimeout(singleTapTimer);
      element.removeEventListener("pointerup", listener);
    };
  }

  private requireVideo(): HTMLVideoElement {
    const video = this.current;
    if (!video) throw new Error("YouTube動画のvideo要素が見つかりません。");
    return video;
  }
}
