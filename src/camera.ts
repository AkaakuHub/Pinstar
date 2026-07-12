import { saveCameraDeviceId } from "./storage";

export class CameraManager {
  private stream: MediaStream | null = null;
  private devices: MediaDeviceInfo[] = [];
  private selectedDeviceId = "";

  constructor(private readonly preview: HTMLVideoElement) {}

  get ready(): boolean {
    return Boolean(this.stream?.getVideoTracks()[0]);
  }

  get currentDeviceId(): string {
    return this.selectedDeviceId;
  }

  async start(deviceId?: string): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("このSafariではカメラAPIを使用できません。");
    }

    this.stop();
    const requestedDeviceId = deviceId || this.selectedDeviceId;
    const constraints: MediaTrackConstraints = requestedDeviceId
      ? {
          deviceId: { exact: requestedDeviceId },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, max: 30 },
        }
      : {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, max: 30 },
        };

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: constraints,
      audio: false,
    });
    this.preview.srcObject = this.stream;
    await this.preview.play();

    const track = this.stream.getVideoTracks()[0];
    this.selectedDeviceId = track?.getSettings().deviceId ?? requestedDeviceId ?? "";
    if (this.selectedDeviceId) saveCameraDeviceId(this.selectedDeviceId);
    await this.refreshDevices();
  }

  stop(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.preview.srcObject = null;
  }

  async refreshDevices(): Promise<MediaDeviceInfo[]> {
    const all = await navigator.mediaDevices.enumerateDevices();
    this.devices = all.filter((device) => device.kind === "videoinput");
    return [...this.devices];
  }

  async switchToNext(): Promise<void> {
    if (this.devices.length < 2) await this.refreshDevices();
    if (this.devices.length < 2) throw new Error("切替可能なカメラがありません。");
    const currentIndex = Math.max(
      0,
      this.devices.findIndex((device) => device.deviceId === this.selectedDeviceId),
    );
    const next = this.devices[(currentIndex + 1) % this.devices.length];
    if (!next) throw new Error("次のカメラを選択できませんでした。");
    await this.start(next.deviceId);
  }
}
