export const styles = String.raw`
  :host { all: initial; }
  *, *::before, *::after { box-sizing: border-box; }
  button, select, input { font: inherit; }
  button, select { -webkit-tap-highlight-color: transparent; }

  #app {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    color: #fff;
    background: #000;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
    -webkit-user-select: none;
    user-select: none;
    touch-action: manipulation;
  }

  #camera {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #000;
  }

  #shade {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(0,0,0,.55), transparent 24%, transparent 65%, rgba(0,0,0,.72));
    transition: opacity .16s ease;
  }

  #tap-layer {
    position: absolute;
    z-index: 2;
    top: 58px;
    bottom: 92px;
    left: 0;
    right: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .tap-zone {
    min-width: 0;
    min-height: 0;
    background: transparent;
    touch-action: manipulation;
  }

  #topbar {
    position: absolute;
    z-index: 5;
    top: max(8px, env(safe-area-inset-top));
    left: max(8px, env(safe-area-inset-left));
    right: max(8px, env(safe-area-inset-right));
    display: grid;
    grid-template-columns: auto minmax(72px, 1fr) auto auto auto;
    gap: 6px;
    align-items: center;
    min-width: 0;
    transition: opacity .16s ease;
  }

  .glass {
    border: 1px solid rgba(255,255,255,.22);
    background: rgba(4,7,15,.68);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow: 0 8px 28px rgba(0,0,0,.22);
  }

  #brand {
    display: flex;
    align-items: center;
    gap: 7px;
    height: 38px;
    padding: 0 11px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 750;
    white-space: nowrap;
  }

  #status-dot {
    width: 9px;
    height: 9px;
    flex: none;
    border-radius: 50%;
    background: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245,158,11,.2);
  }
  #status-dot.ready { background: #34c759; box-shadow: 0 0 0 3px rgba(52,199,89,.2); }
  #status-dot.error { background: #ff3b30; box-shadow: 0 0 0 3px rgba(255,59,48,.2); }
  #status-text { overflow: hidden; text-overflow: ellipsis; }

  #camera-select {
    min-width: 0;
    height: 38px;
    padding: 0 28px 0 10px;
    border-radius: 12px;
    color: #fff;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .icon-button,
  .control-button {
    height: 38px;
    border-radius: 12px;
    color: #fff;
    font-weight: 700;
  }

  .icon-button { width: 38px; padding: 0; font-size: 18px; }
  .control-button { min-width: 44px; padding: 0 10px; }
  button:disabled, select:disabled { opacity: .42; }
  button:active:not(:disabled) { transform: scale(.96); }
  #play { background: rgba(44,111,246,.92); }

  #center-card {
    position: absolute;
    z-index: 7;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: min(340px, calc(100% - 32px));
    padding: 18px;
    border-radius: 20px;
    text-align: center;
  }
  #center-card.hidden { display: none; }
  #center-card h1 { margin: 0 0 7px; font-size: 20px; }
  #center-card p { margin: 0 0 14px; color: #d1d5db; font-size: 12px; line-height: 1.55; }
  #start-camera {
    width: 100%;
    min-height: 44px;
    border: 0;
    border-radius: 13px;
    color: #fff;
    background: #0a84ff;
    font-weight: 800;
  }

  #playback-controls {
    position: absolute;
    z-index: 5;
    left: max(8px, env(safe-area-inset-left));
    right: max(8px, env(safe-area-inset-right));
    bottom: max(8px, env(safe-area-inset-bottom));
    display: grid;
    grid-template-columns: auto auto auto minmax(72px, 1fr) auto;
    gap: 6px;
    align-items: center;
    min-width: 0;
    padding: 7px;
    border-radius: 16px;
    transition: opacity .16s ease;
  }
  #seek { width: 100%; min-width: 0; accent-color: #fff; }
  #clock { min-width: 82px; font-size: 11px; text-align: center; font-variant-numeric: tabular-nums; white-space: nowrap; }

  #app.ui-hidden #shade,
  #app.ui-hidden #topbar,
  #app.ui-hidden #center-card,
  #app.ui-hidden #playback-controls {
    opacity: 0;
    pointer-events: none;
  }

  #app.ui-hidden #tap-layer { inset: 0; }

  #toast {
    position: absolute;
    z-index: 12;
    left: 50%;
    top: 18%;
    transform: translate(-50%, -8px);
    opacity: 0;
    max-width: min(82%, 520px);
    padding: 9px 13px;
    border-radius: 12px;
    background: rgba(0,0,0,.78);
    font-size: 13px;
    font-weight: 700;
    text-align: center;
    transition: .16s ease;
    pointer-events: none;
  }
  #toast.show { opacity: 1; transform: translate(-50%, 0); }

  #log-modal {
    position: absolute;
    z-index: 14;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 16px;
    background: rgba(0,0,0,.66);
  }
  #log-modal.hidden { display: none; }
  #log-panel {
    width: min(520px, 94%);
    max-height: min(78%, 430px);
    overflow: hidden;
    border-radius: 18px;
    background: #111827;
  }
  #log-head { display: flex; gap: 8px; align-items: center; padding: 11px; border-bottom: 1px solid rgba(255,255,255,.1); }
  #log-head strong { flex: 1; }
  #log-list { max-height: 310px; overflow: auto; padding: 10px 12px 16px; }
  .log-row { padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,.08); font-size: 11px; line-height: 1.45; }
  .log-row.error { color: #fecaca; }
  .log-row.warn { color: #fde68a; }

  @media (orientation: portrait) {
    #topbar { grid-template-columns: auto minmax(64px, 1fr) auto auto auto; }
    #status-text { display: none; }
    #playback-controls {
      right: max(8px, env(safe-area-inset-right));
      grid-template-columns: 40px 52px 40px minmax(45px, 1fr);
      padding: 6px;
    }
    #clock { display: none; }
    #tap-layer { bottom: 68px; }
  }

  @media (max-width: 430px) {
    #brand { padding: 0 8px; }
    #camera-select { padding-left: 8px; }
    .icon-button { width: 36px; }
    #topbar, #playback-controls { gap: 4px; }
    .control-button { padding: 0 7px; }
  }
`;
