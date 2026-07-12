import { DOUBLE_TAP_MS } from "./config";

interface CapturableVideoElement extends HTMLVideoElement {
  captureStream?: () => MediaStream;
}

const VIDEO_SELECTORS = [
  "video.html5-main-video",
  "#movie_player video",
  "ytm-player video",
  "video",
] as const;

export class YouTubeController {
  private video: CapturableVideoElement | null = null;

  refresh(): CapturableVideoElement | null {
    for (const selector of VIDEO_SELECTORS) {
      const candidate = document.querySelector<CapturableVideoElement>(selector);
      if (candidate) {
        candidate.playsInline = true;
        this.video = candidate;
        return candidate;
      }
    }
    this.video = null;
    return null;
  }

  get current(): CapturableVideoElement | null {
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

  captureAudioTrack(): MediaStreamTrack {
    const video = this.requireVideo();
    if (typeof video.captureStream !== "function") {
      throw new Error("このSafariではHTMLMediaElement.captureStream()を使用できません。");
    }
    const stream = video.captureStream();
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) {
      stream.getTracks().forEach((track) => track.stop());
      throw new Error("YouTubeの再生音声トラックを取得できませんでした。");
    }
    return audioTrack.clone();
  }

  setupDoubleTap(element: HTMLElement, seconds: number, onSeek: () => void): () => void {
    let lastTap = 0;
    const listener = (event: PointerEvent): void => {
      event.preventDefault();
      event.stopPropagation();
      const now = performance.now();
      if (now - lastTap <= DOUBLE_TAP_MS) {
        lastTap = 0;
        this.seekBy(seconds);
        onSeek();
      } else {
        lastTap = now;
      }
    };
    element.addEventListener("pointerup", listener);
    return () => element.removeEventListener("pointerup", listener);
  }

  private requireVideo(): CapturableVideoElement {
    const video = this.current;
    if (!video) throw new Error("YouTube動画のvideo要素が見つかりません。");
    return video;
  }
}
