# Pinstar

Pinstarは、iPhoneのSafariで開いた通常のYouTube動画ページへ、カメラ映像と再生操作を追加するブックマークレットです。

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
- 画面を1回タップすると操作UIを非表示にし、再度タップすると表示します。
- 左右のダブルタップで5秒戻し、5秒送りを行います。
- 前回選択したカメラを`localStorage`へ保存します。
- 録画、音声取得、マイク取得は行いません。

## ソース構成

```text
src/
  index.ts          エントリーポイント
  app.ts            画面全体の状態管理とイベント処理
  camera.ts         カメラ取得と入力切替
  youtube.ts        YouTube video要素の検出、再生、シーク
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

カメラとYouTube要素の操作にはWeb標準APIを直接使用し、実行時依存関係は追加していません。
