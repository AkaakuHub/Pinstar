# Pinstar

Pinstarは、iPhoneのSafariで開いた通常のYouTube動画ページへ、カメラ映像、再生操作、録画機能を追加するブックマークレットです。

## 固定ブックマークレット

次の1行をSafariのブックマークURLへそのまま登録します。ブックマークレット自体はビルドで生成せず、このREADMEに固定しています。

```javascript
javascript:void(async()=>{try{const u="https://raw.githubusercontent.com/AkaakuHub/Pinstar/js/pinstar.js",t=window.trustedTypes,p=t?(t.defaultPolicy||t.createPolicy("default",{createScript:v=>v})):null,r=await fetch(u,{cache:"no-store",credentials:"omit"});if(!r.ok)throw new Error("GitHub raw HTTP "+r.status);const c=await r.text();(0,eval)(p?p.createScript(c):c)}catch(e){alert("Pinstarの読み込みに失敗しました。\n"+(e&&e.message?e.message:String(e)))}})()
```

参照する外部URLは次の1つだけです。

```text
https://raw.githubusercontent.com/AkaakuHub/Pinstar/js/pinstar.js
```

CDN、別URL、インライン版への切り替えはありません。取得または実行に失敗した場合は、エラーを表示して終了します。

## Safariへの登録

1. Safariで任意のページをブックマークします。
2. 上の`javascript:`から始まる1行をコピーします。
3. 作成したブックマークを編集し、URL欄をコピーした内容へ置き換えます。
4. Safariで通常のYouTube動画ページを開きます。
5. 作成したブックマークを実行します。
6. 「カメラを許可して開始」を押します。

## 実装内容

- カメラ映像をSafariの表示領域全体へ表示します。
- YouTubeページ内の`video`要素を直接操作し、再生、停止、シークを行います。
- 左右のダブルタップで5秒戻し、5秒送りを行います。1回だけのタップでは表示も処理も行いません。
- 前回選択したカメラと録画カウントダウンを`localStorage`へ保存します。
- 録画開始前のカウントダウンを3秒、5秒、10秒から選択できます。
- 録画開始と録画終了は同じ赤いボタンで操作します。
- 録画中は赤いインジケーターと経過時間を表示します。
- カメラ映像トラックと、ユーザーが許可した画面・タブ共有の音声トラックを`MediaRecorder`へ渡し、MP4を生成します。
- 録画停止後はWeb Share APIでMP4を共有します。
- マイクは要求しません。

## 音声取得

録画ボタンを押した直後に、次のAPIをユーザー操作のイベント内から呼び出します。

```typescript
await navigator.mediaDevices.getDisplayMedia({
  video: true,
  audio: true,
});
```

SafariまたはOSが表示する共有許可画面で、現在の画面またはタブと音声共有を許可します。Pinstarは返された`MediaStream`の音声トラックだけを録画へ追加します。共有側の映像トラックは共有セッションを維持するため保持しますが、生成するMP4には追加しません。

画面・タブ共有の許可は保存せず、録画を開始するたびに要求します。共有を終了した場合は録画も終了します。

`HTMLMediaElement.captureStream()`、Web Audio、マイク、画面収録、別URL、外部サーバーへの切り替えは行いません。`getDisplayMedia()`から音声トラックが返らない場合は録画を開始せず、画面内ログへエラーを表示します。

## ソース構成

```text
src/
  index.ts          エントリーポイント
  app.ts            画面全体の状態管理とイベント処理
  camera.ts         カメラ取得と入力切替
  display-audio.ts  画面・タブ音声共有の許可と音声トラック管理
  youtube.ts        YouTube video要素の検出、再生、シーク
  recorder.ts       MediaRecorderによるMP4生成
  storage.ts        前回設定の保存と復元
  config.ts         定数
  types.ts          共通型
  utils.ts          共通関数
  ui/
    view.ts          DOM構築
    styles.ts        UIスタイル
scripts/
  build.ts          Bunによる全体ビルド
```

一時的なパッチ適用スクリプトや差分変換処理は使用しません。`src`をそのままGit管理し、毎回エントリーポイントから全体をビルドします。

## ブランチ構成

- `main`: TypeScriptソース、README、テスト、GitHub Actions
- `js`: GitHub Actionsが生成した`pinstar.js`

`js`ブランチは通常のGit履歴を維持します。Actionsは生成物が変わった場合だけコミットし、通常のpushを行います。

## ビルド

```bash
bun run check
bun run build
bun test
```

`main`へpushするとGitHub ActionsがTypeScript全体を検査し、全体ビルド後にテストを実行し、`dist/pinstar.js`を`js`ブランチへコミットします。

## 依存関係

録画、カメラ、共有、YouTube要素の操作はWeb標準APIを直接使用します。第三者ライブラリを追加してもブラウザーの画面・タブ音声共有権限を変更できないため、実行時依存関係は追加していません。
