import { readFile, writeFile } from "node:fs/promises";

const path = "src/index.ts";
let source = await readFile(path, "utf8");

const replaceRequired = (from: string | RegExp, to: string, label: string): void => {
  const next = source.replace(from, to);
  if (next === source) throw new Error(`patch target not found: ${label}`);
  source = next;
};

replaceRequired('const VERSION = "0.2.0";', 'const VERSION = "0.3.0";', "version");
replaceRequired('const RECORDING_MIME = "video/mp4";', 'const RECORDING_MIME = "video/mp4;codecs=avc1.42E01E,mp4a.40.2";', "recording mime");

replaceRequired(
  /\n  @media \(orientation: portrait\) \{[\s\S]*?\n  @media \(max-height: 390px\) and \(orientation: landscape\) \{[\s\S]*?\n  \}\n`;/,
  String.raw`

  /* v0.3 recorder layout overrides */
  #controls {
    right: max(96px, calc(env(safe-area-inset-right) + 90px));
    grid-template-columns: auto auto auto minmax(72px, 1fr) auto;
  }
  #record-dock {
    position: absolute;
    z-index: 6;
    right: max(12px, calc(env(safe-area-inset-right) + 10px));
    bottom: max(8px, env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  #record {
    width: 68px;
    height: 68px;
    min-width: 68px;
    padding: 5px;
    border: 4px solid rgba(255,255,255,.96);
    border-radius: 50%;
    background: rgba(0,0,0,.24);
    color: transparent;
    box-shadow: 0 10px 32px rgba(0,0,0,.34);
    animation: none;
  }
  #record::before {
    content: "";
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #ff3b30;
    transition: .16s ease;
  }
  #record.recording { animation: none; }
  #record.recording::before {
    width: 52%;
    height: 52%;
    margin: 24%;
    border-radius: 6px;
  }
  #record.counting::before { animation: record-pulse .8s infinite alternate; }
  @keyframes record-pulse { to { opacity: .65; transform: scale(.82); } }
  #rec-clock {
    display: none;
    min-width: 0;
    padding: 6px 10px;
    border-radius: 999px;
    color: #fff;
    background: rgba(0,0,0,.64);
    font-size: 14px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  #rec-clock.visible { display: flex; align-items: center; gap: 7px; }
  #rec-clock::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ff3b30;
  }
  #countdown-select { width: 68px; height: 31px; padding: 0 22px 0 7px; font-size: 11px; }
  #share { width: 68px; height: 31px; min-width: 68px; padding: 0 6px; border-radius: 999px; font-size: 11px; }
  #stop { display: none !important; }

  @media (orientation: portrait) {
    #topbar { grid-template-columns: auto minmax(68px, 1fr) auto auto auto; }
    #status-text { display: none; }
    #controls {
      right: max(84px, calc(env(safe-area-inset-right) + 78px));
      grid-template-columns: 40px 52px 40px minmax(48px, 1fr);
      padding: 6px;
    }
    #clock { display: none; }
    #record-dock { right: max(8px, calc(env(safe-area-inset-right) + 6px)); }
    #record { width: 62px; height: 62px; min-width: 62px; }
    #countdown-select, #share { width: 62px; min-width: 62px; }
    #tap-layer { bottom: 86px; }
  }
  @media (max-width: 430px) {
    .brand { padding: 0 8px; }
    #camera-select { padding-left: 8px; }
    .icon-button { width: 36px; }
    #topbar { gap: 4px; }
    #controls { gap: 4px; }
    .action-button { padding: 0 7px; }
  }
  @media (max-height: 390px) and (orientation: landscape) {
    #topbar { top: max(4px, env(safe-area-inset-top)); }
    #controls { bottom: max(4px, env(safe-area-inset-bottom)); padding: 5px; }
    .brand, #camera-select, .icon-button, .action-button { height: 34px; }
    #record-dock { bottom: max(4px, env(safe-area-inset-bottom)); }
    #record { width: 58px; height: 58px; min-width: 58px; }
    #countdown-select, #share { width: 58px; min-width: 58px; height: 28px; }
    #tap-layer { top: 46px; bottom: 72px; }
  }
`,
  "responsive CSS",
);

replaceRequired(
  String.raw`    <div id="controls">
      <button class="action-button" id="back">−5</button>
      <button class="action-button" id="play">再生</button>
      <button class="action-button" id="forward">+5</button>
      <input id="seek" type="range" min="0" max="1000" value="0" step="1" aria-label="再生位置">
      <span id="clock">--:-- / --:--</span>
      <button class="action-button" id="record">録画</button>
      <select id="countdown-select" aria-label="録画開始カウントダウン">
        <option value="3">3秒</option>
        <option value="5">5秒</option>
        <option value="10">10秒</option>
      </select>
      <button class="action-button" id="stop" disabled>停止</button>
      <button class="action-button" id="share" disabled>共有</button>
      <span id="rec-clock">REC 00:00</span>
    </div>`,
  String.raw`    <div id="controls">
      <button class="action-button" id="back">−5</button>
      <button class="action-button" id="play">再生</button>
      <button class="action-button" id="forward">+5</button>
      <input id="seek" type="range" min="0" max="1000" value="0" step="1" aria-label="再生位置">
      <span id="clock">--:-- / --:--</span>
    </div>

    <div id="record-dock">
      <span id="rec-clock">00:00</span>
      <button id="record" aria-label="録画開始"></button>
      <select id="countdown-select" aria-label="録画開始カウントダウン">
        <option value="3">3秒</option>
        <option value="5">5秒</option>
        <option value="10">10秒</option>
      </select>
      <button class="action-button" id="share" disabled>共有</button>
      <button id="stop" hidden disabled></button>
    </div>`,
  "recorder markup",
);

replaceRequired(
  "    source.connect(destination);\n    source.connect(analyser);\n    analyser.connect(context.destination);",
  "    source.connect(destination);\n    source.connect(analyser);\n    source.connect(context.destination);",
  "audio graph",
);

replaceRequired(
  "    configureCanvas();\n    const canvasStream = recordCanvas.captureStream(30);\n    const videoTrack = canvasStream.getVideoTracks()[0];\n    const audioTrack = activeAudioBridge.destination.stream.getAudioTracks()[0];",
  "    const videoTrack = cameraStream.getVideoTracks()[0]?.clone();\n    const audioTrack = activeAudioBridge.destination.stream.getAudioTracks()[0]?.clone();",
  "direct camera track",
);

replaceRequired("    drawCameraFrame();\n", "", "remove canvas draw");
replaceRequired("    recClock.textContent = `REC ${formatTime(elapsed)}`;", "    recClock.textContent = formatTime(elapsed);", "record timer text");
replaceRequired("    recClock.textContent = \"REC 00:00\";", "    recClock.textContent = \"00:00\";\n    recClock.classList.remove(\"visible\");\n    recordButton.setAttribute(\"aria-label\", \"録画開始\");", "record timer reset");

replaceRequired(
  "    recordButton.classList.add(\"recording\");\n    recordButton.disabled = true;\n    stopButton.disabled = false;",
  "    recordButton.classList.remove(\"counting\");\n    recordButton.classList.add(\"recording\");\n    recordButton.setAttribute(\"aria-label\", \"録画終了\");\n    recClock.classList.add(\"visible\");\n    recordButton.disabled = false;\n    stopButton.disabled = false;",
  "recording button state",
);

replaceRequired(
  "    recordButton.disabled = true;\n    stopButton.disabled = false;\n    countdownSelect.disabled = true;",
  "    recordButton.classList.add(\"counting\");\n    recordButton.disabled = false;\n    stopButton.disabled = false;\n    countdownSelect.disabled = true;",
  "countdown button state",
);

replaceRequired(
  "      recordButton.disabled = false;\n      stopButton.disabled = true;\n      countdownSelect.disabled = false;",
  "      recordButton.classList.remove(\"counting\");\n      recordButton.disabled = false;\n      stopButton.disabled = true;\n      countdownSelect.disabled = false;",
  "countdown error state",
);

replaceRequired(
  "      recordButton.disabled = false;\n      stopButton.disabled = true;\n      countdownSelect.disabled = false;\n      renderStatus();\n      showToast(\"録画をキャンセルしました\");",
  "      recordButton.classList.remove(\"counting\");\n      recordButton.disabled = false;\n      stopButton.disabled = true;\n      countdownSelect.disabled = false;\n      renderStatus();\n      showToast(\"録画をキャンセルしました\");",
  "countdown cancel state",
);

replaceRequired(
  "    stopButton.disabled = true;\n    mediaRecorder.stop();",
  "    recordButton.disabled = true;\n    stopButton.disabled = true;\n    mediaRecorder.addEventListener(\"stop\", () => { recordButton.disabled = false; }, { once: true });\n    mediaRecorder.stop();",
  "stop recorder state",
);

replaceRequired(
  "  bind(recordButton, \"click\", () => void startRecordingWithCountdown());\n  bind(stopButton, \"click\", stopRecording);",
  "  bind(recordButton, \"click\", () => {\n    if (recording || countdownRunning) stopRecording();\n    else void startRecordingWithCountdown();\n  });\n  bind(stopButton, \"click\", stopRecording);",
  "record toggle binding",
);

await writeFile(path, source, "utf8");
console.log("Applied recorder UI v3 migration");
