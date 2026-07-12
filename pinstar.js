(()=>{var p="0.5.0",g="pinstar-root",w="pinstar.camera.deviceId",Y=800,j=200,f=340;var G=(e)=>{try{return localStorage.getItem(e)??""}catch{return""}},W=(e,t)=>{try{localStorage.setItem(e,t)}catch{}},A=()=>({cameraDeviceId:G(w)}),F=(e)=>{W(w,e)};class b{preview;stream=null;devices=[];selectedDeviceId="";constructor(e){this.preview=e}get ready(){return Boolean(this.stream?.getVideoTracks()[0])}get currentDeviceId(){return this.selectedDeviceId}async start(e){if(!navigator.mediaDevices?.getUserMedia)throw Error("このSafariではカメラAPIを使用できません。");this.stop();let t=e||this.selectedDeviceId,i=t?{deviceId:{exact:t},width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:30,max:30}}:{facingMode:{ideal:"environment"},width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:30,max:30}};this.stream=await navigator.mediaDevices.getUserMedia({video:i,audio:!1}),this.preview.srcObject=this.stream,await this.preview.play();let a=this.stream.getVideoTracks()[0];if(this.selectedDeviceId=a?.getSettings().deviceId??t??"",this.selectedDeviceId)F(this.selectedDeviceId);await this.refreshDevices()}stop(){this.stream?.getTracks().forEach((e)=>e.stop()),this.stream=null,this.preview.srcObject=null}async refreshDevices(){let e=await navigator.mediaDevices.enumerateDevices();return this.devices=e.filter((t)=>t.kind==="videoinput"),[...this.devices]}async switchToNext(){if(this.devices.length<2)await this.refreshDevices();if(this.devices.length<2)throw Error("切替可能なカメラがありません。");let e=Math.max(0,this.devices.findIndex((i)=>i.deviceId===this.selectedDeviceId)),t=this.devices[(e+1)%this.devices.length];if(!t)throw Error("次のカメラを選択できませんでした。");await this.start(t.deviceId)}}var x=(e)=>{if(!Number.isFinite(e)||e<0)return"--:--";let t=Math.floor(e),i=Math.floor(t/3600),a=Math.floor(t%3600/60),s=t%60;return i>0?`${i}:${String(a).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${a}:${String(s).padStart(2,"0")}`},u=(e)=>{if(e instanceof DOMException)return`${e.name}: ${e.message}`;if(e instanceof Error)return`${e.name}: ${e.message}`;return String(e)};var q=String.raw`
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
`;var o=(e,t={},i)=>{let a=document.createElement(e);for(let[s,n]of Object.entries(t))if(s==="class")a.className=n;else a.setAttribute(s,n);if(i!==void 0)a.textContent=i;return a},r=(e,t,i,a)=>o("button",{id:e,class:i,type:"button","aria-label":a??t},t),K=()=>{document.getElementById(g)?.remove();let e=o("div",{id:g});Object.assign(e.style,{position:"fixed",zIndex:"2147483647",margin:"0",padding:"0",overflow:"hidden",pointerEvents:"auto"});let t=e.attachShadow({mode:"open"}),i=o("style");i.textContent=q,t.append(i);let a=o("div",{id:"app"}),s=o("video",{id:"camera",autoplay:"",muted:"",playsinline:""});s.muted=!0,a.append(s,o("div",{id:"shade"}));let n=o("div",{id:"tap-layer","aria-label":"タップでUI表示切替、左右をダブルタップして5秒移動"}),d=o("div",{id:"tap-left",class:"tap-zone"}),l=o("div",{id:"tap-right",class:"tap-zone"});n.append(d,l),a.append(n);let c=o("div",{id:"topbar"}),L=o("div",{id:"brand",class:"glass"}),k=o("span",{id:"status-dot"}),E=o("span",{id:"status-text"},"初期化中");L.append(k,o("span",{},"Pinstar"),E);let m=o("select",{id:"camera-select",class:"glass","aria-label":"カメラ入力"});m.append(new Option("カメラ",""));let M=r("switch-camera","↻","icon-button glass","カメラ切替"),S=r("logs","≡","icon-button glass","動作ログ"),I=r("close","×","icon-button glass","閉じる");c.append(L,m,M,S,I),a.append(c);let h=o("div",{id:"center-card",class:"glass"});h.append(o("h1",{},"カメラを開始"),o("p",{},"カメラ映像を表示します。画面をタップすると操作UIを非表示にできます。"));let D=r("start-camera","カメラを許可して開始","");h.append(D),a.append(h);let P=o("div",{id:"playback-controls",class:"glass"}),C=r("back","−5","control-button glass"),H=r("play","再生","control-button"),_=r("forward","+5","control-button glass"),B=o("input",{id:"seek",type:"range",min:"0",max:"1000",value:"0",step:"1","aria-label":"再生位置"}),V=o("span",{id:"clock"},"--:-- / --:--");P.append(C,H,_,B,V),a.append(P);let O=o("div",{id:"toast"});a.append(O);let v=o("div",{id:"log-modal",class:"hidden"}),$=o("div",{id:"log-panel",class:"glass"}),N=o("div",{id:"log-head"}),z=r("copy-logs","コピー","control-button glass"),R=r("close-logs","閉じる","control-button glass");N.append(o("strong",{},"動作ログ"),z,R);let U=o("div",{id:"log-list"});return $.append(N,U),v.append($),a.append(v),t.append(a),document.documentElement.append(e),{host:e,shadow:t,app:a,camera:s,statusDot:k,statusText:E,cameraSelect:m,switchCamera:M,logsButton:S,closeButton:I,centerCard:h,startCamera:D,tapLeft:d,tapRight:l,back:C,play:H,forward:_,seek:B,clock:V,toast:O,logModal:v,logList:U,copyLogs:z,closeLogs:R}};var J=["video.html5-main-video","#movie_player video","ytm-player video","video"];class y{video=null;refresh(){for(let e of J){let t=document.querySelector(e);if(t)return t.playsInline=!0,this.video=t,t}return this.video=null,null}get current(){return this.video??this.refresh()}async togglePlayback(){let e=this.requireVideo();if(e.paused)await e.play();else e.pause()}seekBy(e){let t=this.requireVideo(),i=Number.isFinite(t.duration)?t.duration:Number.POSITIVE_INFINITY;t.currentTime=Math.max(0,Math.min(i,t.currentTime+e))}seekToFraction(e){let t=this.requireVideo();if(!Number.isFinite(t.duration)||t.duration<=0)return;t.currentTime=Math.max(0,Math.min(1,e))*t.duration}setupTapGestures(e,t,i,a){let s=0,n=0,d=(l)=>{l.preventDefault(),l.stopPropagation();let c=performance.now();if(c-s<=f)window.clearTimeout(n),s=0,this.seekBy(t),a();else s=c,n=window.setTimeout(()=>{s=0,i()},f)};return e.addEventListener("pointerup",d),()=>{window.clearTimeout(n),e.removeEventListener("pointerup",d)}}requireVideo(){let e=this.current;if(!e)throw Error("YouTube動画のvideo要素が見つかりません。");return e}}class T{view=K();youtube=new y;camera=new b(this.view.camera);logs=[];cleanup=[];settings=A();toastTimer=0;youtubePoll=0;uiTimer=0;destroyed=!1;originalDocumentOverflow=document.documentElement.style.overflow;originalBodyOverflow=document.body?.style.overflow??"";start(){if(document.documentElement.style.overflow="hidden",document.body)document.body.style.overflow="hidden";if(this.syncViewport(),this.bindEvents(),this.refreshYouTube(),this.renderPlayback(),this.renderStatus(),this.renderLogs(),this.youtubePoll=window.setInterval(()=>this.refreshYouTube(),Y),this.uiTimer=window.setInterval(()=>this.renderPlayback(),j),this.log("info",`Pinstar v${p}を開始しました。`,location.href),!/^(www\.|m\.)?youtube\.com$/i.test(location.hostname))this.log("warn","YouTube以外のページで実行されています。",location.hostname)}destroy(){if(this.destroyed)return;if(this.destroyed=!0,this.camera.stop(),window.clearInterval(this.youtubePoll),window.clearInterval(this.uiTimer),window.clearTimeout(this.toastTimer),this.cleanup.splice(0).forEach((e)=>e()),document.documentElement.style.overflow=this.originalDocumentOverflow,document.body)document.body.style.overflow=this.originalBodyOverflow;this.view.host.remove()}bindEvents(){if(this.bind(window,"resize",()=>this.syncViewport()),window.visualViewport)this.bind(window.visualViewport,"resize",()=>this.syncViewport()),this.bind(window.visualViewport,"scroll",()=>this.syncViewport());this.bind(this.view.startCamera,"click",()=>void this.startCamera(this.settings.cameraDeviceId||void 0)),this.bind(this.view.switchCamera,"click",()=>void this.switchCamera()),this.bind(this.view.cameraSelect,"change",()=>{if(this.view.cameraSelect.value)this.startCamera(this.view.cameraSelect.value)}),this.bind(this.view.closeButton,"click",()=>this.destroy()),this.bind(this.view.logsButton,"click",()=>this.view.logModal.classList.remove("hidden")),this.bind(this.view.closeLogs,"click",()=>this.view.logModal.classList.add("hidden")),this.bind(this.view.copyLogs,"click",()=>void this.copyLogs()),this.bind(this.view.back,"click",()=>this.seekBy(-5)),this.bind(this.view.forward,"click",()=>this.seekBy(5)),this.bind(this.view.play,"click",()=>void this.togglePlayback()),this.bind(this.view.seek,"input",()=>{this.youtube.seekToFraction(Number(this.view.seek.value)/1000)}),this.cleanup.push(this.youtube.setupTapGestures(this.view.tapLeft,-5,()=>this.toggleUi(),()=>this.showToast("5秒戻る"))),this.cleanup.push(this.youtube.setupTapGestures(this.view.tapRight,5,()=>this.toggleUi(),()=>this.showToast("5秒進む")))}bind(e,t,i){e.addEventListener(t,i),this.cleanup.push(()=>e.removeEventListener(t,i))}syncViewport(){let e=window.visualViewport,t=e?.offsetLeft??0,i=e?.offsetTop??0,a=e?.width??window.innerWidth,s=e?.height??window.innerHeight;Object.assign(this.view.host.style,{left:`${t}px`,top:`${i}px`,width:`${a}px`,height:`${s}px`})}refreshYouTube(){let e=Boolean(this.youtube.current),t=this.youtube.refresh();if(!e&&t)this.log("info","YouTubeのvideo要素を検出しました。");this.renderStatus()}async startCamera(e){try{this.log("info","カメラ権限を要求しています。"),await this.camera.start(e),await this.populateCameraSelect(),this.view.centerCard.classList.add("hidden"),this.log("info","カメラを開始しました。",this.camera.currentDeviceId),this.showToast("カメラ開始")}catch(t){this.log("error","カメラを開始できませんでした。",t),this.showToast("カメラ開始失敗")}this.renderStatus()}async populateCameraSelect(){let e=await this.camera.refreshDevices();if(this.view.cameraSelect.replaceChildren(),e.length===0){this.view.cameraSelect.append(new Option("カメラなし",""));return}e.forEach((t,i)=>{this.view.cameraSelect.append(new Option(t.label||`カメラ ${i+1}`,t.deviceId))}),this.view.cameraSelect.value=this.camera.currentDeviceId}async switchCamera(){try{await this.camera.switchToNext(),await this.populateCameraSelect(),this.showToast("カメラ切替")}catch(e){this.log("warn","カメラを切り替えられませんでした。",e),this.showToast("カメラ切替失敗")}}async togglePlayback(){try{await this.youtube.togglePlayback()}catch(e){this.log("error","再生操作に失敗しました。",e),this.showToast("再生できません")}}seekBy(e){try{this.youtube.seekBy(e),this.showToast(e<0?"5秒戻る":"5秒進む")}catch(t){this.log("error","シーク操作に失敗しました。",t),this.showToast("シークできません")}}renderPlayback(){let e=this.youtube.current;if(!e){this.view.play.textContent="再生",this.view.seek.disabled=!0,this.view.clock.textContent="--:-- / --:--";return}this.view.play.textContent=e.paused?"再生":"停止";let t=Number.isFinite(e.duration)&&e.duration>0;if(this.view.seek.disabled=!t,t&&!this.view.seek.matches(":active"))this.view.seek.value=String(Math.round(e.currentTime/e.duration*1000));this.view.clock.textContent=`${x(e.currentTime)} / ${x(e.duration)}`}toggleUi(){this.view.app.classList.toggle("ui-hidden")}renderStatus(){this.view.statusDot.className="";let e=Boolean(this.youtube.current);if(this.logs.some((t)=>t.level==="error"))this.view.statusDot.classList.add("error");else if(e&&this.camera.ready)this.view.statusDot.classList.add("ready");if(!e)this.view.statusText.textContent="YouTube待機";else if(!this.camera.ready)this.view.statusText.textContent="カメラ待機";else this.view.statusText.textContent="準備完了"}log(e,t,i){if(this.logs.push({at:new Date().toLocaleTimeString("ja-JP",{hour12:!1}),level:e,message:t,detail:i===void 0?void 0:u(i)}),this.logs.length>100)this.logs.shift();this.renderLogs(),this.renderStatus(),console[e==="error"?"error":e==="warn"?"warn":"info"](`[Pinstar] ${t}`,i??"")}renderLogs(){if(this.view.logList.replaceChildren(),this.logs.length===0){this.view.logList.textContent="ログはありません。";return}for(let e of this.logs){let t=document.createElement("div");t.className=`log-row ${e.level}`,t.textContent=`[${e.at}] ${e.message}${e.detail?`
${e.detail}`:""}`,this.view.logList.append(t)}}async copyLogs(){let e=this.logs.map((t)=>`[${t.at}] ${t.level.toUpperCase()} ${t.message}${t.detail?`
${t.detail}`:""}`).join(`
`);try{await navigator.clipboard.writeText(e),this.showToast("ログをコピーしました")}catch(t){this.log("warn","ログをコピーできませんでした。",t)}}showToast(e,t=1300){window.clearTimeout(this.toastTimer),this.view.toast.textContent=e,this.view.toast.classList.add("show"),this.toastTimer=window.setTimeout(()=>this.view.toast.classList.remove("show"),t)}}try{window.__PINSTAR__?.destroy();let e=new T;e.start(),window.__PINSTAR__={version:p,destroy:()=>{if(e.destroy(),window.__PINSTAR__?.version===p)delete window.__PINSTAR__}}}catch(e){console.error("[Pinstar] fatal",e),alert(`Pinstarの起動に失敗しました。
${u(e)}`)}})();
