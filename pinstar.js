(()=>{var h="0.4.0",y="pinstar-root",T="pinstar.camera.deviceId",S="pinstar.record.countdown",c="video/mp4;codecs=avc1.42E01E,mp4a.40.2",X=800,Z=200,ee=340;var te=(e)=>{try{return localStorage.getItem(e)??""}catch{return""}},ie=(e,t)=>{try{localStorage.setItem(e,t)}catch{}},de=(e)=>{if(e==="5")return 5;if(e==="10")return 10;return 3},oe=()=>({cameraDeviceId:te(T),countdownSeconds:de(te(S))}),re=(e)=>{ie(T,e)},k=(e)=>{ie(S,String(e))};class E{preview;stream=null;devices=[];selectedDeviceId="";constructor(e){this.preview=e}get ready(){return Boolean(this.stream?.getVideoTracks()[0])}get currentDeviceId(){return this.selectedDeviceId}async start(e){if(!navigator.mediaDevices?.getUserMedia)throw Error("このSafariではカメラAPIを使用できません。");this.stop();let t=e||this.selectedDeviceId,i=t?{deviceId:{exact:t},width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:30,max:30}}:{facingMode:{ideal:"environment"},width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:30,max:30}};this.stream=await navigator.mediaDevices.getUserMedia({video:i,audio:!1}),this.preview.srcObject=this.stream,await this.preview.play();let o=this.stream.getVideoTracks()[0];if(this.selectedDeviceId=o?.getSettings().deviceId??t??"",this.selectedDeviceId)re(this.selectedDeviceId);await this.refreshDevices()}stop(){this.stream?.getTracks().forEach((e)=>e.stop()),this.stream=null,this.preview.srcObject=null}cloneVideoTrack(){let e=this.stream?.getVideoTracks()[0];if(!e)throw Error("カメラ映像トラックがありません。");return e.clone()}async refreshDevices(){let e=await navigator.mediaDevices.enumerateDevices();return this.devices=e.filter((t)=>t.kind==="videoinput"),[...this.devices]}async switchToNext(){if(this.devices.length<2)await this.refreshDevices();if(this.devices.length<2)throw Error("切替可能なカメラがありません。");let e=Math.max(0,this.devices.findIndex((i)=>i.deviceId===this.selectedDeviceId)),t=this.devices[(e+1)%this.devices.length];if(!t)throw Error("次のカメラを選択できませんでした。");await this.start(t.deviceId)}}class L{recorder=null;stream=null;chunks=[];startedAt=0;get active(){return this.recorder?.state==="recording"}get elapsedSeconds(){return this.active?(performance.now()-this.startedAt)/1000:0}start(e,t){if(this.active)throw Error("すでに録画中です。");if(!window.MediaRecorder)throw Error("MediaRecorder APIを使用できません。");if(MediaRecorder.isTypeSupported&&!MediaRecorder.isTypeSupported(c))throw Error(`このSafariは${c}の録画に対応していません。`);this.stream=new MediaStream([e,t]),this.chunks=[],this.recorder=new MediaRecorder(this.stream,{mimeType:c}),this.recorder.addEventListener("dataavailable",(i)=>{if(i.data.size>0)this.chunks.push(i.data)}),this.recorder.start(1000),this.startedAt=performance.now()}async stop(){let e=this.recorder;if(!e||e.state!=="recording")throw Error("録画は開始されていません。");let t=(performance.now()-this.startedAt)/1000;if(await new Promise((a,d)=>{e.addEventListener("stop",()=>a(),{once:!0}),e.addEventListener("error",(l)=>{let u="error"in l?l.error:void 0;d(u??Error("MediaRecorderでエラーが発生しました。"))},{once:!0}),e.stop()}),this.stream?.getTracks().forEach((a)=>a.stop()),this.stream=null,this.recorder=null,this.chunks.length===0)throw Error("録画データが生成されませんでした。");let i=new Blob(this.chunks,{type:c}),o=new Date().toISOString().replace(/[-:]/g,"").replace(/\..+/,"");return{file:new File([i],`Pinstar-${o}.mp4`,{type:c}),durationSeconds:t}}cancel(){if(this.recorder?.state==="recording")this.recorder.stop();this.stream?.getTracks().forEach((e)=>e.stop()),this.stream=null,this.recorder=null,this.chunks=[]}}var p=(e)=>{if(!Number.isFinite(e)||e<0)return"--:--";let t=Math.floor(e),i=Math.floor(t/3600),o=Math.floor(t%3600/60),s=t%60;return i>0?`${i}:${String(o).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${o}:${String(s).padStart(2,"0")}`},w=(e)=>{if(e instanceof DOMException)return`${e.name}: ${e.message}`;if(e instanceof Error)return`${e.name}: ${e.message}`;return String(e)},se=(e)=>new Promise((t)=>window.setTimeout(t,e));var ae=String.raw`
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

  #camera-select,
  #countdown-select {
    min-width: 0;
    height: 38px;
    padding: 0 28px 0 10px;
    border-radius: 12px;
    color: #fff;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .icon-button,
  .control-button,
  #share {
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
    right: max(96px, calc(env(safe-area-inset-right) + 90px));
    bottom: max(8px, env(safe-area-inset-bottom));
    display: grid;
    grid-template-columns: auto auto auto minmax(72px, 1fr) auto;
    gap: 6px;
    align-items: center;
    min-width: 0;
    padding: 7px;
    border-radius: 16px;
  }
  #seek { width: 100%; min-width: 0; accent-color: #fff; }
  #clock { min-width: 82px; font-size: 11px; text-align: center; font-variant-numeric: tabular-nums; white-space: nowrap; }

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

  #record-time {
    display: none;
    align-items: center;
    gap: 7px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(0,0,0,.62);
    font-size: 14px;
    font-weight: 750;
    font-variant-numeric: tabular-nums;
  }
  #record-time.visible { display: flex; }
  #record-time::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ff3b30;
  }

  #record {
    width: 68px;
    height: 68px;
    padding: 5px;
    border: 4px solid rgba(255,255,255,.96);
    border-radius: 50%;
    background: rgba(0,0,0,.22);
    box-shadow: 0 10px 32px rgba(0,0,0,.32);
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
  #record.recording::before {
    width: 52%;
    height: 52%;
    margin: 24%;
    border-radius: 6px;
  }
  #record.countdown::before { animation: pulse .75s infinite alternate; }
  @keyframes pulse { to { opacity: .6; transform: scale(.82); } }

  #countdown-select,
  #share {
    width: 68px;
    min-width: 68px;
    height: 31px;
    border-radius: 999px;
    font-size: 11px;
  }
  #countdown-select { padding: 0 21px 0 8px; }
  #share { padding: 0 7px; }

  #countdown-overlay {
    position: absolute;
    z-index: 10;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(0,0,0,.24);
    pointer-events: none;
  }
  #countdown-overlay.hidden { display: none; }
  #countdown-number {
    min-width: 110px;
    padding: 16px 24px;
    border-radius: 24px;
    background: rgba(0,0,0,.68);
    font-size: clamp(58px, 18vw, 110px);
    font-weight: 850;
    line-height: 1;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

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
      right: max(84px, calc(env(safe-area-inset-right) + 78px));
      grid-template-columns: 40px 52px 40px minmax(45px, 1fr);
      padding: 6px;
    }
    #clock { display: none; }
    #record-dock { right: max(8px, calc(env(safe-area-inset-right) + 6px)); }
    #record { width: 62px; height: 62px; }
    #countdown-select, #share { width: 62px; min-width: 62px; }
    #tap-layer { bottom: 86px; }
  }

  @media (max-width: 430px) {
    #brand { padding: 0 8px; }
    #camera-select { padding-left: 8px; }
    .icon-button { width: 36px; }
    #topbar, #playback-controls { gap: 4px; }
    .control-button { padding: 0 7px; }
  }
`;var r=(e,t={},i)=>{let o=document.createElement(e);for(let[s,a]of Object.entries(t))if(s==="class")o.className=a;else o.setAttribute(s,a);if(i!==void 0)o.textContent=i;return o},n=(e,t,i,o)=>r("button",{id:e,class:i,type:"button","aria-label":o??t},t),ne=()=>{document.getElementById(y)?.remove();let e=r("div",{id:y});Object.assign(e.style,{position:"fixed",zIndex:"2147483647",margin:"0",padding:"0",overflow:"hidden",pointerEvents:"auto"});let t=e.attachShadow({mode:"open"}),i=r("style");i.textContent=ae,t.append(i);let o=r("div",{id:"app"}),s=r("video",{id:"camera",autoplay:"",muted:"",playsinline:""});s.muted=!0,o.append(s,r("div",{id:"shade"}));let a=r("div",{id:"tap-layer","aria-label":"左右をダブルタップして5秒移動"}),d=r("div",{id:"tap-left",class:"tap-zone"}),l=r("div",{id:"tap-right",class:"tap-zone"});a.append(d,l),o.append(a);let u=r("div",{id:"topbar"}),B=r("div",{id:"brand",class:"glass"}),I=r("span",{id:"status-dot"}),D=r("span",{id:"status-text"},"初期化中");B.append(I,r("span",{},"Pinstar"),D);let v=r("select",{id:"camera-select",class:"glass","aria-label":"カメラ入力"});v.append(new Option("カメラ",""));let P=n("switch-camera","↻","icon-button glass","カメラ切替"),R=n("logs","≡","icon-button glass","動作ログ"),H=n("close","×","icon-button glass","閉じる");u.append(B,v,P,R,H),o.append(u);let m=r("div",{id:"center-card",class:"glass"});m.append(r("h1",{},"カメラを開始"),r("p",{},"映像はカメラ、音声はYouTubeのvideo要素から直接取得します。マイクは使用しません。"));let O=n("start-camera","カメラを許可して開始","");m.append(O),o.append(m);let V=r("div",{id:"playback-controls",class:"glass"}),_=n("back","−5","control-button glass"),$=n("play","再生","control-button"),N=n("forward","+5","control-button glass"),z=r("input",{id:"seek",type:"range",min:"0",max:"1000",value:"0",step:"1","aria-label":"再生位置"}),A=r("span",{id:"clock"},"--:-- / --:--");V.append(_,$,N,z,A),o.append(V);let F=r("div",{id:"record-dock"}),Y=r("span",{id:"record-time"},"00:00"),U=n("record","","","録画開始"),g=r("select",{id:"countdown-select",class:"glass","aria-label":"録画開始カウントダウン"});g.append(new Option("3秒","3"),new Option("5秒","5"),new Option("10秒","10"));let b=n("share","共有","glass");b.disabled=!0,F.append(Y,U,g,b),o.append(F);let f=r("div",{id:"countdown-overlay",class:"hidden"}),j=r("div",{id:"countdown-number"},"3");f.append(j),o.append(f);let q=r("div",{id:"toast"});o.append(q);let x=r("div",{id:"log-modal",class:"hidden"}),K=r("div",{id:"log-panel",class:"glass"}),J=r("div",{id:"log-head"}),W=n("copy-logs","コピー","control-button glass"),G=n("close-logs","閉じる","control-button glass");J.append(r("strong",{},"動作ログ"),W,G);let Q=r("div",{id:"log-list"});return K.append(J,Q),x.append(K),o.append(x),t.append(o),document.documentElement.append(e),{host:e,shadow:t,app:o,camera:s,statusDot:I,statusText:D,cameraSelect:v,switchCamera:P,logsButton:R,closeButton:H,centerCard:m,startCamera:O,tapLeft:d,tapRight:l,back:_,play:$,forward:N,seek:z,clock:A,recordButton:U,recordTime:Y,countdownSelect:g,shareButton:b,countdownOverlay:f,countdownNumber:j,toast:q,logModal:x,logList:Q,copyLogs:W,closeLogs:G}};var ce=["video.html5-main-video","#movie_player video","ytm-player video","video"];class M{video=null;refresh(){for(let e of ce){let t=document.querySelector(e);if(t)return t.playsInline=!0,this.video=t,t}return this.video=null,null}get current(){return this.video??this.refresh()}async togglePlayback(){let e=this.requireVideo();if(e.paused)await e.play();else e.pause()}seekBy(e){let t=this.requireVideo(),i=Number.isFinite(t.duration)?t.duration:Number.POSITIVE_INFINITY;t.currentTime=Math.max(0,Math.min(i,t.currentTime+e))}seekToFraction(e){let t=this.requireVideo();if(!Number.isFinite(t.duration)||t.duration<=0)return;t.currentTime=Math.max(0,Math.min(1,e))*t.duration}captureAudioTrack(){let e=this.requireVideo();if(typeof e.captureStream!=="function")throw Error("このSafariではHTMLMediaElement.captureStream()を使用できません。");let t=e.captureStream(),i=t.getAudioTracks()[0];if(!i)throw t.getTracks().forEach((s)=>s.stop()),Error("YouTubeの再生音声トラックを取得できませんでした。");let o=i.clone();return t.getTracks().forEach((s)=>s.stop()),o}setupDoubleTap(e,t,i){let o=0,s=(a)=>{a.preventDefault(),a.stopPropagation();let d=performance.now();if(d-o<=ee)o=0,this.seekBy(t),i();else o=d};return e.addEventListener("pointerup",s),()=>e.removeEventListener("pointerup",s)}requireVideo(){let e=this.current;if(!e)throw Error("YouTube動画のvideo要素が見つかりません。");return e}}class C{view=ne();youtube=new M;camera=new E(this.view.camera);recorder=new L;logs=[];cleanup=[];settings=oe();recorderState="idle";lastFile=null;countdownToken=0;toastTimer=0;youtubePoll=0;uiTimer=0;destroyed=!1;originalDocumentOverflow=document.documentElement.style.overflow;originalBodyOverflow=document.body?.style.overflow??"";start(){if(document.documentElement.style.overflow="hidden",document.body)document.body.style.overflow="hidden";if(this.view.countdownSelect.value=String(this.settings.countdownSeconds),this.syncViewport(),this.bindEvents(),this.refreshYouTube(),this.renderPlayback(),this.renderStatus(),this.renderLogs(),this.youtubePoll=window.setInterval(()=>this.refreshYouTube(),X),this.uiTimer=window.setInterval(()=>{this.renderPlayback(),this.renderRecordingTime()},Z),this.log("info",`Pinstar v${h}を開始しました。`,location.href),!/^(www\.|m\.)?youtube\.com$/i.test(location.hostname))this.log("warn","YouTube以外のページで実行されています。",location.hostname)}destroy(){if(this.destroyed)return;if(this.recorderState!=="idle"){this.showToast("録画を終了してから閉じてください");return}if(this.destroyed=!0,this.camera.stop(),this.recorder.cancel(),window.clearInterval(this.youtubePoll),window.clearInterval(this.uiTimer),window.clearTimeout(this.toastTimer),this.cleanup.splice(0).forEach((e)=>e()),document.documentElement.style.overflow=this.originalDocumentOverflow,document.body)document.body.style.overflow=this.originalBodyOverflow;this.view.host.remove()}bindEvents(){if(this.bind(window,"resize",()=>this.syncViewport()),window.visualViewport)this.bind(window.visualViewport,"resize",()=>this.syncViewport()),this.bind(window.visualViewport,"scroll",()=>this.syncViewport());this.bind(this.view.startCamera,"click",()=>void this.startCamera(this.settings.cameraDeviceId||void 0)),this.bind(this.view.switchCamera,"click",()=>void this.switchCamera()),this.bind(this.view.cameraSelect,"change",()=>{if(this.view.cameraSelect.value)this.startCamera(this.view.cameraSelect.value)}),this.bind(this.view.closeButton,"click",()=>this.destroy()),this.bind(this.view.logsButton,"click",()=>this.view.logModal.classList.remove("hidden")),this.bind(this.view.closeLogs,"click",()=>this.view.logModal.classList.add("hidden")),this.bind(this.view.copyLogs,"click",()=>void this.copyLogs()),this.bind(this.view.back,"click",()=>this.seekBy(-5)),this.bind(this.view.forward,"click",()=>this.seekBy(5)),this.bind(this.view.play,"click",()=>void this.togglePlayback()),this.bind(this.view.seek,"input",()=>{this.youtube.seekToFraction(Number(this.view.seek.value)/1000)}),this.cleanup.push(this.youtube.setupDoubleTap(this.view.tapLeft,-5,()=>this.showToast("5秒戻る"))),this.cleanup.push(this.youtube.setupDoubleTap(this.view.tapRight,5,()=>this.showToast("5秒進む"))),this.bind(this.view.countdownSelect,"change",()=>{let e=Number(this.view.countdownSelect.value);k(e)}),this.bind(this.view.recordButton,"click",()=>void this.handleRecordButton()),this.bind(this.view.shareButton,"click",()=>void this.shareRecording())}bind(e,t,i){e.addEventListener(t,i),this.cleanup.push(()=>e.removeEventListener(t,i))}syncViewport(){let e=window.visualViewport,t=e?.offsetLeft??0,i=e?.offsetTop??0,o=e?.width??window.innerWidth,s=e?.height??window.innerHeight;Object.assign(this.view.host.style,{left:`${t}px`,top:`${i}px`,width:`${o}px`,height:`${s}px`})}refreshYouTube(){let e=Boolean(this.youtube.current),t=this.youtube.refresh();if(!e&&t)this.log("info","YouTubeのvideo要素を検出しました。");this.renderStatus()}async startCamera(e){if(this.recorderState!=="idle"){this.showToast("録画中はカメラを変更できません");return}try{this.log("info","カメラ権限を要求しています。"),await this.camera.start(e),await this.populateCameraSelect(),this.view.centerCard.classList.add("hidden"),this.log("info","カメラを開始しました。",this.camera.currentDeviceId),this.showToast("カメラ開始")}catch(t){this.log("error","カメラを開始できませんでした。",t),this.showToast("カメラ開始失敗")}this.renderStatus()}async populateCameraSelect(){let e=await this.camera.refreshDevices();if(this.view.cameraSelect.replaceChildren(),e.length===0){this.view.cameraSelect.append(new Option("カメラなし",""));return}e.forEach((t,i)=>{this.view.cameraSelect.append(new Option(t.label||`カメラ ${i+1}`,t.deviceId))}),this.view.cameraSelect.value=this.camera.currentDeviceId}async switchCamera(){if(this.recorderState!=="idle")return;try{await this.camera.switchToNext(),await this.populateCameraSelect(),this.showToast("カメラ切替")}catch(e){this.log("warn","カメラを切り替えられませんでした。",e),this.showToast("カメラ切替失敗")}}async togglePlayback(){try{await this.youtube.togglePlayback()}catch(e){this.log("error","再生操作に失敗しました。",e),this.showToast("再生できません")}}seekBy(e){try{this.youtube.seekBy(e),this.showToast(e<0?"5秒戻る":"5秒進む")}catch(t){this.log("error","シーク操作に失敗しました。",t),this.showToast("シークできません")}}renderPlayback(){let e=this.youtube.current;if(!e){this.view.play.textContent="再生",this.view.seek.disabled=!0,this.view.clock.textContent="--:-- / --:--";return}this.view.play.textContent=e.paused?"再生":"停止";let t=Number.isFinite(e.duration)&&e.duration>0;if(this.view.seek.disabled=!t,t&&!this.view.seek.matches(":active"))this.view.seek.value=String(Math.round(e.currentTime/e.duration*1000));this.view.clock.textContent=`${p(e.currentTime)} / ${p(e.duration)}`}async handleRecordButton(){if(this.recorderState==="recording"){await this.stopRecording();return}if(this.recorderState==="countdown"){this.cancelCountdown();return}if(this.recorderState==="encoding")return;await this.startCountdown()}async startCountdown(){if(!this.camera.ready||!this.youtube.current){this.showToast("カメラとYouTubeを準備してください");return}let e;try{e=this.youtube.captureAudioTrack()}catch(o){this.log("error","YouTube音声を取得できませんでした。",o),this.showToast("YouTube音声を取得できません",2200);return}let t=Number(this.view.countdownSelect.value);k(t),this.recorderState="countdown",this.view.recordButton.classList.add("countdown"),this.view.countdownSelect.disabled=!0,this.view.cameraSelect.disabled=!0,this.view.switchCamera.disabled=!0,this.view.countdownOverlay.classList.remove("hidden"),this.renderStatus();let i=++this.countdownToken;try{for(let s=t;s>0;s-=1){if(i!==this.countdownToken){e.stop();return}this.view.countdownNumber.textContent=String(s),await se(1000)}if(i!==this.countdownToken){e.stop();return}let o=this.camera.cloneVideoTrack();this.recorder.start(o,e),this.recorderState="recording",this.view.recordButton.classList.remove("countdown"),this.view.recordButton.classList.add("recording"),this.view.recordButton.setAttribute("aria-label","録画終了"),this.view.recordTime.classList.add("visible"),this.view.countdownOverlay.classList.add("hidden"),this.lastFile=null,this.view.shareButton.disabled=!0,this.log("info","録画を開始しました。音声入力はYouTubeのcaptureStreamです。"),this.showToast("録画開始")}catch(o){e.stop(),this.log("error","録画を開始できませんでした。",o),this.showToast("録画開始失敗",2000),this.resetRecorderUi()}this.renderStatus()}cancelCountdown(){this.countdownToken+=1,this.recorderState="idle",this.view.countdownOverlay.classList.add("hidden"),this.resetRecorderUi(),this.renderStatus(),this.showToast("録画をキャンセルしました")}async stopRecording(){this.recorderState="encoding",this.view.recordButton.disabled=!0,this.view.recordButton.classList.remove("recording"),this.view.recordButton.setAttribute("aria-label","エンコード中"),this.renderStatus(),this.showToast("エンコード中…",1800);try{let e=await this.recorder.stop();this.lastFile=e.file,this.view.shareButton.disabled=!1,this.log("info","MP4の生成が完了しました。",`${(e.file.size/1024/1024).toFixed(1)} MB / ${p(e.durationSeconds)}`),this.showToast("録画を共有できます",1800)}catch(e){this.log("error","録画を終了できませんでした。",e),this.showToast("録画終了失敗",1800)}finally{this.recorderState="idle",this.resetRecorderUi(),this.renderStatus()}}resetRecorderUi(){this.view.recordButton.disabled=!1,this.view.recordButton.classList.remove("recording","countdown"),this.view.recordButton.setAttribute("aria-label","録画開始"),this.view.recordTime.classList.remove("visible"),this.view.recordTime.textContent="00:00",this.view.countdownSelect.disabled=!1,this.view.cameraSelect.disabled=!1,this.view.switchCamera.disabled=!1}renderRecordingTime(){if(this.recorderState!=="recording")return;this.view.recordTime.textContent=p(this.recorder.elapsedSeconds)}async shareRecording(){let e=this.lastFile;if(!e){this.showToast("共有する録画がありません");return}if(!navigator.share||!navigator.canShare?.({files:[e]})){this.log("error","このSafariではMP4ファイル共有を使用できません。"),this.showToast("ファイル共有非対応");return}try{await navigator.share({files:[e],title:"Pinstar録画"}),this.log("info","共有シートへ録画を渡しました。",e.name)}catch(t){if(t instanceof DOMException&&t.name==="AbortError")return;this.log("error","録画を共有できませんでした。",t),this.showToast("共有失敗")}}renderStatus(){this.view.statusDot.className="";let e=Boolean(this.youtube.current);if(this.logs.some((t)=>t.level==="error"))this.view.statusDot.classList.add("error");else if(e&&this.camera.ready)this.view.statusDot.classList.add("ready");if(this.recorderState==="recording")this.view.statusText.textContent="録画中";else if(this.recorderState==="countdown")this.view.statusText.textContent="待機中";else if(this.recorderState==="encoding")this.view.statusText.textContent="処理中";else if(!e)this.view.statusText.textContent="YouTube待機";else if(!this.camera.ready)this.view.statusText.textContent="カメラ待機";else this.view.statusText.textContent="準備完了"}log(e,t,i){if(this.logs.push({at:new Date().toLocaleTimeString("ja-JP",{hour12:!1}),level:e,message:t,detail:i===void 0?void 0:w(i)}),this.logs.length>100)this.logs.shift();this.renderLogs(),this.renderStatus(),console[e==="error"?"error":e==="warn"?"warn":"info"](`[Pinstar] ${t}`,i??"")}renderLogs(){if(this.view.logList.replaceChildren(),this.logs.length===0){this.view.logList.textContent="ログはありません。";return}for(let e of this.logs){let t=document.createElement("div");t.className=`log-row ${e.level}`,t.textContent=`[${e.at}] ${e.message}${e.detail?`
${e.detail}`:""}`,this.view.logList.append(t)}}async copyLogs(){let e=this.logs.map((t)=>`[${t.at}] ${t.level.toUpperCase()} ${t.message}${t.detail?`
${t.detail}`:""}`).join(`
`);try{await navigator.clipboard.writeText(e),this.showToast("ログをコピーしました")}catch(t){this.log("warn","ログをコピーできませんでした。",t)}}showToast(e,t=1300){window.clearTimeout(this.toastTimer),this.view.toast.textContent=e,this.view.toast.classList.add("show"),this.toastTimer=window.setTimeout(()=>this.view.toast.classList.remove("show"),t)}}try{window.__PINSTAR__?.destroy();let e=new C;e.start(),window.__PINSTAR__={version:h,destroy:()=>{if(e.destroy(),window.__PINSTAR__?.version===h)delete window.__PINSTAR__}}}catch(e){console.error("[Pinstar] fatal",e),alert(`Pinstarの起動に失敗しました。
${w(e)}`)}})();
