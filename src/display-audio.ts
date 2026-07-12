type DisplayMediaDevices = MediaDevices & {
  getDisplayMedia?: (options?: DisplayMediaStreamOptions) => Promise<MediaStream>;
};

export class DisplayAudioCapture {
  private sourceStream: MediaStream | null = null;

  get active(): boolean {
    return this.sourceStream?.getAudioTracks().some((track) => track.readyState === "live") ?? false;
  }

  async requestAudioTrack(): Promise<MediaStreamTrack> {
    this.stop();

    const mediaDevices = navigator.mediaDevices as DisplayMediaDevices | undefined;
    if (!mediaDevices?.getDisplayMedia) {
      throw new Error("このSafariでは画面・タブ音声共有の許可APIを使用できません。");
    }

    const stream = await mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) {
      stream.getTracks().forEach((track) => track.stop());
      throw new Error("共有した画面またはタブから音声トラックを取得できませんでした。音声共有を有効にしてください。");
    }

    this.sourceStream = stream;
    const stopWhenSharingEnds = (): void => {
      if (this.sourceStream === stream) this.stop();
    };
    stream.getVideoTracks()[0]?.addEventListener("ended", stopWhenSharingEnds, { once: true });
    audioTrack.addEventListener("ended", stopWhenSharingEnds, { once: true });

    return audioTrack.clone();
  }

  stop(): void {
    this.sourceStream?.getTracks().forEach((track) => track.stop());
    this.sourceStream = null;
  }
}
