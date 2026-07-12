(()=>{var{defineProperty:Vj,getOwnPropertyNames:lj,getOwnPropertyDescriptor:uj}=Object,ij=Object.prototype.hasOwnProperty;function cj(K){return this[K]}var sj=(K)=>{var M=(xj??=new WeakMap).get(K),q;if(M)return M;if(M=Vj({},"__esModule",{value:!0}),K&&typeof K==="object"||typeof K==="function"){for(var L of lj(K))if(!ij.call(M,L))Vj(M,L,{get:cj.bind(K,L),enumerable:!(q=uj(K,L))||q.enumerable})}return xj.set(K,M),M},xj;var aj={};var Qj=(K)=>{if(!Number.isFinite(K)||K<0)return"--:--";let M=Math.floor(K),q=Math.floor(M/3600),L=Math.floor(M%3600/60),Q=M%60;return q>0?`${q}:${String(L).padStart(2,"0")}:${String(Q).padStart(2,"0")}`:`${L}:${String(Q).padStart(2,"0")}`},Dj=(K)=>{if(K instanceof DOMException)return`${K.name}: ${K.message}`;if(K instanceof Error)return`${K.name}: ${K.message}`;return String(K)},Bj=(K)=>{try{return localStorage.getItem(K)??""}catch{return""}},Zj=(K,M)=>{try{localStorage.setItem(K,M)}catch{}},nj=String.raw`
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
    color: #f8fafc;
    background: #020617;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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
  #record-canvas { display: none; }
  #shade {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(2,6,23,.68) 0, transparent 23%, transparent 69%, rgba(2,6,23,.84) 100%);
  }
  #tap-layer {
    position: absolute;
    z-index: 2;
    top: 54px;
    bottom: 90px;
    left: 0;
    right: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    pointer-events: auto;
    touch-action: manipulation;
  }
  .tap-zone {
    min-width: 0;
    min-height: 0;
    background: transparent;
    color: transparent;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  #topbar {
    position: absolute;
    z-index: 4;
    top: max(7px, env(safe-area-inset-top));
    left: max(8px, env(safe-area-inset-left));
    right: max(8px, env(safe-area-inset-right));
    display: grid;
    grid-template-columns: auto minmax(86px, 1fr) auto auto auto;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    height: 38px;
    padding: 0 10px;
    border: 1px solid rgba(255,255,255,.17);
    border-radius: 13px;
    background: rgba(2,6,23,.76);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    font-size: 12px;
    font-weight: 750;
    white-space: nowrap;
  }
  #status-dot { width: 8px; height: 8px; flex: 0 0 auto; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,.17); }
  #status-dot.ok { background: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,.17); }
  #status-dot.error { background: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.17); }
  #status-text { max-width: 18vw; overflow: hidden; text-overflow: ellipsis; }
  #camera-select, #countdown-select {
    min-width: 0;
    height: 38px;
    padding: 0 28px 0 10px;
    color: #f8fafc;
    border: 1px solid rgba(255,255,255,.17);
    border-radius: 12px;
    background: rgba(2,6,23,.76);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .icon-button, .action-button {
    height: 38px;
    border: 1px solid rgba(255,255,255,.17);
    border-radius: 12px;
    color: #f8fafc;
    background: rgba(2,6,23,.76);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    font-size: 13px;
    font-weight: 750;
    box-shadow: 0 8px 28px rgba(0,0,0,.18);
  }
  .icon-button { width: 38px; padding: 0; font-size: 18px; }
  .action-button { min-width: 42px; padding: 0 10px; }
  .icon-button:disabled, .action-button:disabled, select:disabled { opacity: .42; }
  .icon-button:active, .action-button:active { transform: scale(.97); }
  #center-card {
    position: absolute;
    z-index: 5;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: min(340px, calc(100% - 32px));
    padding: 18px;
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 20px;
    background: rgba(2,6,23,.88);
    box-shadow: 0 24px 80px rgba(0,0,0,.45);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    text-align: center;
  }
  #center-card.hidden { display: none; }
  #center-card h1 { margin: 0 0 7px; font-size: 19px; }
  #center-card p { margin: 0 0 14px; color: #cbd5e1; font-size: 12px; line-height: 1.55; }
  .primary {
    width: 100%;
    min-height: 44px;
    border: 0;
    border-radius: 13px;
    color: white;
    background: #2563eb;
    font-weight: 800;
    font-size: 14px;
  }
  #controls {
    position: absolute;
    z-index: 4;
    left: max(8px, env(safe-area-inset-left));
    right: max(8px, env(safe-area-inset-right));
    bottom: max(7px, env(safe-area-inset-bottom));
    display: grid;
    grid-template-columns: auto auto auto minmax(72px, 1fr) auto auto auto auto auto auto;
    gap: 6px;
    align-items: center;
    min-width: 0;
    padding: 7px;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 15px;
    background: rgba(2,6,23,.78);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }
  #play { min-width: 52px; background: rgba(37,99,235,.96); }
  #record { background: rgba(220,38,38,.96); border-color: rgba(248,113,113,.72); }
  #record.recording { animation: pulse 1s infinite; }
  @keyframes pulse { 50% { opacity: .62; } }
  #seek { width: 100%; min-width: 0; accent-color: #60a5fa; }
  #clock, #rec-clock {
    min-width: 78px;
    color: #dbeafe;
    font-variant-numeric: tabular-nums;
    font-size: 11px;
    text-align: center;
    white-space: nowrap;
  }
  #rec-clock { min-width: 58px; color: #fecaca; }
  #countdown-select { width: 74px; padding-left: 8px; }
  #toast {
    position: absolute;
    z-index: 8;
    left: 50%;
    top: 17%;
    transform: translate(-50%, -8px);
    opacity: 0;
    max-width: min(82%, 520px);
    padding: 9px 13px;
    border-radius: 12px;
    color: white;
    background: rgba(15,23,42,.94);
    font-size: 13px;
    font-weight: 750;
    text-align: center;
    transition: .16s ease;
    pointer-events: none;
  }
  #toast.show { opacity: 1; transform: translate(-50%, 0); }
  #countdown-overlay {
    position: absolute;
    z-index: 9;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(2,6,23,.34);
    pointer-events: none;
  }
  #countdown-overlay.hidden { display: none; }
  #countdown-number {
    min-width: 110px;
    padding: 16px 24px;
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 24px;
    background: rgba(2,6,23,.78);
    color: #fff;
    font-size: clamp(54px, 18vw, 110px);
    font-weight: 850;
    line-height: 1;
    text-align: center;
    font-variant-numeric: tabular-nums;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .modal {
    position: absolute;
    z-index: 10;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 16px;
    background: rgba(2,6,23,.72);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .modal.hidden { display: none; }
  .panel {
    width: min(520px, 94%);
    max-height: min(78%, 430px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 18px;
    background: #0f172a;
    box-shadow: 0 30px 90px rgba(0,0,0,.5);
  }
  .panel-head { display: flex; align-items: center; gap: 8px; padding: 11px; border-bottom: 1px solid rgba(255,255,255,.1); }
  .panel-head strong { flex: 1; font-size: 14px; }
  #log-list { max-height: 300px; overflow: auto; padding: 9px 11px 15px; -webkit-overflow-scrolling: touch; }
  .log-row { padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,.08); font-size: 11px; line-height: 1.45; }
  .log-row.error { color: #fecaca; }
  .log-row.warn { color: #fde68a; }
  .log-time { color: #94a3b8; margin-right: 7px; }
  @media (orientation: portrait) {
    #topbar { grid-template-columns: auto minmax(70px, 1fr) auto auto auto; }
    #status-text { display: none; }
    #controls {
      grid-template-columns: 42px 54px 42px minmax(62px, 1fr) 70px;
      grid-template-areas:
        "back play forward seek clock"
        "record record countdown stop share";
      padding: 6px;
    }
    #back { grid-area: back; }
    #play { grid-area: play; }
    #forward { grid-area: forward; }
    #seek { grid-area: seek; }
    #clock { grid-area: clock; min-width: 0; }
    #record { grid-area: record; }
    #countdown-select { grid-area: countdown; width: 100%; }
    #stop { grid-area: stop; }
    #share { grid-area: share; }
    #rec-clock { display: none; }
    #tap-layer { bottom: 124px; }
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
    .brand, #camera-select, #countdown-select, .icon-button, .action-button { height: 34px; }
    #tap-layer { top: 46px; bottom: 72px; }
  }
`;var dj=()=>{window.__PINSTAR__?.destroy(),document.getElementById("pinstar-root")?.remove();let K=document.createElement("div");K.id="pinstar-root",Object.assign(K.style,{position:"fixed",zIndex:"2147483647",margin:"0",padding:"0",overflow:"hidden",pointerEvents:"auto"});let M=K.attachShadow({mode:"open"}),q=document.createElement("style");q.textContent=nj,M.append(q);let L=document.createElement("div");L.innerHTML=`
  <div id="app">
    <video id="camera" autoplay muted playsinline></video>
    <canvas id="record-canvas"></canvas>
    <div id="shade"></div>
    <div id="tap-layer" aria-label="左右をダブルタップして5秒移動">
      <div class="tap-zone" id="tap-left"></div>
      <div class="tap-zone" id="tap-right"></div>
    </div>

    <div id="topbar">
      <div class="brand"><span id="status-dot"></span><span>Pinstar</span><span id="status-text">初期化中</span></div>
      <select id="camera-select" aria-label="カメラ入力"><option value="">カメラ</option></select>
      <button class="icon-button" id="switch-camera" aria-label="カメラ切替">↻</button>
      <button class="icon-button" id="logs" aria-label="動作ログ">≡</button>
      <button class="icon-button" id="close" aria-label="閉じる">×</button>
    </div>

    <div id="center-card">
      <h1>カメラを開始</h1>
      <p>録画映像にはカメラだけを入れます。音声はYouTubeのvideo要素からWeb Audioで取得し、マイクは使用しません。</p>
      <button class="primary" id="start-camera">カメラを許可して開始</button>
    </div>

    <div id="toast"></div>
    <div id="countdown-overlay" class="hidden"><div id="countdown-number">3</div></div>

    <div id="controls">
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
    </div>

    <div class="modal hidden" id="log-modal">
      <div class="panel">
        <div class="panel-head"><strong>動作ログ</strong><button class="action-button" id="copy-logs">コピー</button><button class="action-button" id="close-logs">閉じる</button></div>
        <div id="log-list"></div>
      </div>
    </div>
  </div>
`,M.append(...Array.from(L.childNodes)),document.documentElement.append(K);let Q=(j)=>{let z=M.getElementById(j);if(!z)throw Error(`UI element not found: ${j}`);return z},E=Q("camera"),A=Q("record-canvas"),U=Q("camera-select"),P=Q("countdown-select"),_j=Q("center-card"),I=Q("seek"),i=Q("play"),f=Q("record"),D=Q("stop"),c=Q("share"),Cj=Q("close"),$j=Q("clock"),Gj=Q("rec-clock"),s=Q("status-dot"),b=Q("status-text"),n=Q("toast"),d=Q("countdown-overlay"),Mj=Q("countdown-number"),Xj=Q("log-modal"),Ej=Q("log-list"),C=[],S=[],Rj=document.documentElement.style.overflow,kj=document.body?.style.overflow??"";if(document.documentElement.style.overflow="hidden",document.body)document.body.style.overflow="hidden";let R=null,p=null,H=[],O=Bj("pinstar.camera.deviceId"),a=0,Nj=0,Lj=0,Uj=0,w=0,y=0,t=!1,Y=!1,g=!1,W=!1,F=!1,V=null,l=null,u=[],Hj=0,T=null,r=null,Oj=null,Pj=Bj("pinstar.record.countdown");if(["3","5","10"].includes(Pj))P.value=Pj;let k=()=>{let j=window.visualViewport,z=j?.offsetLeft??0,J=j?.offsetTop??0,Z=j?.width??window.innerWidth,$=j?.height??window.innerHeight;K.style.left=`${z}px`,K.style.top=`${J}px`,K.style.width=`${Z}px`,K.style.height=`${$}px`};k(),window.visualViewport?.addEventListener("resize",k),window.visualViewport?.addEventListener("scroll",k),window.addEventListener("resize",k),S.push(()=>window.visualViewport?.removeEventListener("resize",k)),S.push(()=>window.visualViewport?.removeEventListener("scroll",k)),S.push(()=>window.removeEventListener("resize",k));let N=()=>{if(s.className="",C.some((j)=>j.level==="error"))s.classList.add("error");else if(Y&&g)s.classList.add("ok");if(W)b.textContent="録画中";else if(F)b.textContent="待機中";else if(!g)b.textContent="YouTube待機";else if(!Y)b.textContent="カメラ待機";else b.textContent="準備完了"},Wj=()=>{if(C.length===0){Ej.textContent="ログはありません。";return}Ej.replaceChildren(...C.map((j)=>{let z=document.createElement("div");z.className=`log-row ${j.level}`;let J=document.createElement("span");if(J.className="log-time",J.textContent=j.at,z.append(J,document.createTextNode(j.message)),j.detail)z.append(document.createElement("br"),document.createTextNode(j.detail));return z}))},_=(j,z,J)=>{let Z={at:new Date().toLocaleTimeString("ja-JP",{hour12:!1}),level:j,message:z,detail:J===void 0?void 0:Dj(J)};if(C.push(Z),C.length>100)C.shift();Wj(),N(),console[j==="error"?"error":j==="warn"?"warn":"info"](`[Pinstar] ${z}`,J??"")},G=(j,z=1300)=>{window.clearTimeout(a),n.textContent=j,n.classList.add("show"),a=window.setTimeout(()=>n.classList.remove("show"),z)},X=(j,z,J,Z)=>{j.addEventListener(z,J,Z),S.push(()=>j.removeEventListener(z,J,Z))},Ij=()=>document.querySelector("video.html5-main-video")??document.querySelector("#movie_player video")??document.querySelector("ytm-player video")??document.querySelector("video"),Sj=(j)=>{if(j===p)return;p=j,g=!0,j.playsInline=!0,_("info","YouTubeのvideo要素を検出しました。",`readyState=${j.readyState}`),N()},o=()=>{let j=Ij();if(j)Sj(j);else if(g)p=null,g=!1,_("warn","YouTubeのvideo要素が置き換えられました。再検出します。"),N()},m=()=>{if(o(),!p)return G("YouTube動画が見つかりません"),_("error","YouTube動画を操作できません。","動画ページを開き、ページの読み込み完了後に実行してください。"),null;return p},e=(j)=>{let z=m();if(!z)return;let J=Number.isFinite(z.duration)?z.duration:Number.POSITIVE_INFINITY;z.currentTime=Math.max(0,Math.min(J,z.currentTime+j)),G(j<0?`${Math.abs(j)}秒戻る`:`${j}秒進む`)},pj=async()=>{let j=m();if(!j)return;try{if(j.paused)await j.play();else j.pause()}catch(z){_("error","再生操作に失敗しました。",z),G("再生できません")}},qj=()=>{let j=p;if(!j){i.textContent="再生",$j.textContent="--:-- / --:--",I.disabled=!0;return}i.textContent=j.paused?"再生":"停止";let z=j.duration,J=Number.isFinite(z)&&z>0;if(I.disabled=!J,J&&!I.matches(":active"))I.value=String(Math.round(j.currentTime/z*1000));$j.textContent=`${Qj(j.currentTime)} / ${Qj(z)}`},jj=async()=>{try{if(H=(await navigator.mediaDevices.enumerateDevices()).filter((z)=>z.kind==="videoinput"),U.replaceChildren(),H.length===0){U.append(new Option("カメラなし",""));return}if(H.forEach((z,J)=>{U.append(new Option(z.label||`カメラ ${J+1}`,z.deviceId))}),O&&H.some((z)=>z.deviceId===O))U.value=O;else{let z=R?.getVideoTracks()[0]?.getSettings().deviceId;if(z)O=z,U.value=z}_("info",`${H.length}台のカメラを検出しました。`)}catch(j){_("warn","カメラ一覧を取得できませんでした。",j)}},Aj=()=>{R?.getTracks().forEach((j)=>j.stop()),R=null,E.srcObject=null,Y=!1,N()},zj=async(j)=>{if(!navigator.mediaDevices?.getUserMedia){_("error","このSafariではカメラAPIを使用できません。","HTTPSの通常のSafariページで実行してください。"),G("カメラAPI非対応");return}if(W||F){G("録画中はカメラを変更できません");return}Aj();let z=j||O,J=z?{deviceId:{exact:z},width:{ideal:1280},height:{ideal:720},frameRate:{ideal:30,max:30}}:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720},frameRate:{ideal:30,max:30}};try{_("info","カメラ権限を要求しています。"),R=await navigator.mediaDevices.getUserMedia({video:J,audio:!1}),E.srcObject=R,await E.play();let Z=R.getVideoTracks()[0];if(O=Z.getSettings().deviceId??z??"",O)Zj("pinstar.camera.deviceId",O);Y=!0,_j.classList.add("hidden"),await jj(),N(),_("info","カメラを開始しました。",Z.label||"camera"),G("カメラ開始"),Z.addEventListener("ended",()=>{Y=!1,N(),_("warn","カメラが停止しました。")},{once:!0})}catch(Z){Y=!1,_j.classList.remove("hidden"),N(),_("error","カメラを開始できませんでした。",Z),G("カメラ開始失敗")}},Tj=async()=>{if(H.length<2)await jj();if(H.length<2){G("切替可能なカメラがありません");return}let j=Math.max(0,H.findIndex((J)=>J.deviceId===O)),z=H[(j+1)%H.length];if(!z)return;await zj(z.deviceId)},hj=async(j)=>{let z=window.AudioContext??window.webkitAudioContext;if(!z)throw Error("Web Audio APIを使用できません。");let J=window.__PINSTAR_AUDIO_BRIDGES__??=new WeakMap,Z=J.get(j);if(Z){if(Z.context.state==="suspended")await Z.context.resume();return Z}let $=new z,x=$.createMediaElementSource(j),v=$.createMediaStreamDestination(),B=$.createAnalyser();B.fftSize=512,x.connect(v),x.connect(B),B.connect($.destination);let h={context:$,source:x,destination:v,analyser:B};if(J.set(j,h),$.state==="suspended")await $.resume();return _("info","YouTube音声をWeb Audioへ接続しました。"),h},bj=()=>{let j=K.clientWidth>=K.clientHeight;A.width=j?1280:720,A.height=j?720:1280},Jj=()=>{if(!W||t)return;let j=A.getContext("2d",{alpha:!1});if(!j||E.videoWidth<=0||E.videoHeight<=0){w=window.requestAnimationFrame(Jj);return}let{width:z,height:J}=A,Z=E.videoWidth/E.videoHeight,$=z/J,x=0,v=0,B=E.videoWidth,h=E.videoHeight;if(Z>$)B=E.videoHeight*$,x=(E.videoWidth-B)/2;else h=E.videoWidth/$,v=(E.videoHeight-h)/2;j.drawImage(E,x,v,B,h,0,0,z,J),w=window.requestAnimationFrame(Jj)},fj=()=>{let j=W?(performance.now()-Hj)/1000:0;Gj.textContent=`REC ${Qj(j)}`},wj=()=>{if(window.cancelAnimationFrame(w),w=0,l?.getVideoTracks().forEach((J)=>J.stop()),l=null,W=!1,V=null,f.classList.remove("recording"),f.disabled=!1,D.disabled=!0,P.disabled=!1,U.disabled=!1,Q("switch-camera").disabled=!1,Gj.textContent="REC 00:00",N(),u.length===0){_("error","録画データが生成されませんでした。"),G("録画データなし");return}let j=new Blob(u,{type:"video/mp4"}),z=new Date().toISOString().replace(/[-:]/g,"").replace(/\..+/,"");T=new File([j],`Pinstar-${z}.mp4`,{type:"video/mp4"}),c.disabled=!1,_("info","MP4のエンコードが完了しました。",`${(j.size/1024/1024).toFixed(1)} MB`),G("録画を共有できます",1800)},yj=async()=>{let j=m();if(!j||!R||!Y)throw Error("カメラとYouTube動画の準備が必要です。");if(!window.MediaRecorder)throw Error("MediaRecorder APIを使用できません。");if(!HTMLCanvasElement.prototype.captureStream)throw Error("Canvas Capture APIを使用できません。");if(MediaRecorder.isTypeSupported&&!MediaRecorder.isTypeSupported("video/mp4"))throw Error("このSafariはMP4録画に対応していません。");if(!r||Oj!==j)throw Error("YouTube音声の録画経路が準備されていません。録画を押し直してください。");bj();let J=A.captureStream(30).getVideoTracks()[0],Z=r.destination.stream.getAudioTracks()[0];if(!J)throw Error("カメラ映像の録画トラックを作成できません。");if(!Z)throw Error("YouTube音声の録画トラックを作成できません。");l=new MediaStream([J,Z]),u=[],T=null,c.disabled=!0,V=new MediaRecorder(l,{mimeType:"video/mp4"}),V.addEventListener("dataavailable",($)=>{if($.data.size>0)u.push($.data)}),V.addEventListener("error",($)=>{let x="error"in $?$.error:void 0;_("error","録画処理でエラーが発生しました。",x??$.type)}),V.addEventListener("stop",wj,{once:!0}),W=!0,Hj=performance.now(),f.classList.add("recording"),f.disabled=!0,D.disabled=!1,P.disabled=!0,U.disabled=!0,Q("switch-camera").disabled=!0,N(),Jj(),V.start(1000),_("info","MP4録画を開始しました。",`${A.width}×${A.height}`),G("録画開始")},gj=async()=>{if(W||F)return;let j=m();if(!j||!Y){G("カメラとYouTubeを準備してください");return}try{r=await hj(j),Oj=j}catch(Z){_("error","YouTube音声を録画用に準備できませんでした。",Z),G("音声準備失敗",1800);return}let z=Number(P.value);Zj("pinstar.record.countdown",String(z)),F=!0,f.disabled=!0,D.disabled=!1,P.disabled=!0,N();let J=++y;d.classList.remove("hidden");try{for(let Z=z;Z>0;Z-=1){if(J!==y)return;Mj.textContent=String(Z),await new Promise(($)=>window.setTimeout($,1000))}if(J!==y)return;Mj.textContent="REC",await yj()}catch(Z){_("error","録画を開始できませんでした。",Z),G("録画開始失敗",1800),f.disabled=!1,D.disabled=!0,P.disabled=!1}finally{if(J===y)F=!1,d.classList.add("hidden"),N()}},mj=()=>{if(F){y+=1,F=!1,d.classList.add("hidden"),f.disabled=!1,D.disabled=!0,P.disabled=!1,N(),G("録画をキャンセルしました");return}if(!W||!V)return;D.disabled=!0,V.stop(),_("info","録画を停止し、MP4を生成しています。"),G("エンコード中…",1800)},vj=async()=>{if(!T){G("共有する録画がありません");return}if(!navigator.share||!navigator.canShare?.({files:[T]})){_("error","このSafariではMP4ファイルを共有できません。"),G("ファイル共有非対応");return}try{await navigator.share({files:[T],title:"Pinstar録画"}),_("info","共有シートへ録画ファイルを渡しました。",T.name)}catch(j){if(j instanceof DOMException&&j.name==="AbortError")return;_("error","録画ファイルを共有できませんでした。",j),G("共有失敗")}},Yj=(j,z)=>{let J=0;X(j,"pointerup",(Z)=>{Z.preventDefault(),Z.stopPropagation();let $=performance.now();if($-J<=340)J=0,e(z);else J=$})};X(Q("start-camera"),"click",()=>void zj(O||void 0)),X(Q("switch-camera"),"click",()=>void Tj()),X(U,"change",()=>{if(U.value)zj(U.value)}),X(P,"change",()=>Zj("pinstar.record.countdown",P.value)),X(Q("back"),"click",()=>e(-5)),X(Q("forward"),"click",()=>e(5)),X(i,"click",()=>void pj()),X(I,"input",()=>{let j=m();if(!j||!Number.isFinite(j.duration)||j.duration<=0)return;j.currentTime=Number(I.value)/1000*j.duration}),Yj(Q("tap-left"),-5),Yj(Q("tap-right"),5),X(f,"click",()=>void gj()),X(D,"click",mj),X(c,"click",()=>void vj()),X(Q("logs"),"click",()=>Xj.classList.remove("hidden")),X(Q("close-logs"),"click",()=>Xj.classList.add("hidden")),X(Q("copy-logs"),"click",()=>{let j=C.map((z)=>`[${z.at}] ${z.level.toUpperCase()} ${z.message}${z.detail?`
${z.detail}`:""}`).join(`
`);navigator.clipboard?.writeText(j).then(()=>G("ログをコピーしました"),(z)=>_("warn","ログをコピーできませんでした。",z))});let Fj=()=>{jj()};navigator.mediaDevices?.addEventListener?.("devicechange",Fj),S.push(()=>navigator.mediaDevices?.removeEventListener?.("devicechange",Fj));let Kj=()=>{if(t)return;if(W||F){G("録画を停止してから閉じてください");return}if(t=!0,Aj(),window.clearInterval(Nj),window.clearInterval(Lj),window.clearInterval(Uj),window.clearTimeout(a),window.cancelAnimationFrame(w),S.splice(0).forEach((j)=>j()),document.documentElement.style.overflow=Rj,document.body)document.body.style.overflow=kj;if(K.remove(),window.__PINSTAR__?.destroy===Kj)delete window.__PINSTAR__;console.info("[Pinstar] stopped v0.2.0")};if(X(Cj,"click",Kj),Nj=window.setInterval(o,800),Lj=window.setInterval(qj,200),Uj=window.setInterval(fj,200),o(),qj(),fj(),Wj(),N(),_("info",`Pinstar v${"0.2.0"}を開始しました。`,location.href),!/^(www\.|m\.)?youtube\.com$/i.test(location.hostname))_("warn","YouTube以外のページで実行されています。",location.hostname);return{version:"0.2.0",destroy:Kj}};try{window.__PINSTAR__=dj()}catch(K){console.error("[Pinstar] fatal",K),alert(`Pinstarの起動に失敗しました。
${Dj(K)}`)}})();
