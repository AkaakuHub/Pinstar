# Pinstar

Pinstarは、iPhoneのSafariで開いた通常のYouTube動画ページへ、カメラ映像・シーク操作・録画機能を追加するブックマークレットです。

## ブランチ構成

`main`ブランチには、TypeScriptソース、固定ブックマークレット、テスト、GitHub Actions、説明文を置きます。

`js`ブランチには、GitHub ActionsがBunで生成した次の1ファイルだけを置きます。

```text
pinstar.js
```

ブックマークレット、HTML、説明文、ショートカット用ローダー、フォールバック用ファイルは`js`ブランチへ配置しません。

## 固定ブックマークレット

ブックマークレットは`main`ブランチの[`bookmarklet.txt`](./bookmarklet.txt)に固定しています。ビルド時に生成または変更しません。

ブックマークレットが参照する外部URLは次の1つだけです。

```text
https://raw.githubusercontent.com/AkaakuHub/Pinstar/js/pinstar.js
```

YouTubeページではTrusted Typesが有効な場合があるため、固定ブックマークレットは`script.src`へ文字列を代入しません。GitHub rawから`pinstar.js`を取得し、Trusted Typesの`default`ポリシーで`TrustedScript`として実行します。

CDN、別URL、インライン版へのフォールバックはありません。取得または実行に失敗した場合は、エラーを表示して終了します。

## Safariへの登録

1. Safariで任意のページをブックマークします。
2. `main`ブランチの`bookmarklet.txt`を開き、1行すべてをコピーします。
3. 作成したブックマークを編集し、URL欄をコピーした内容へ置き換えます。
4. Safariで通常のYouTube動画ページを開きます。
5. 作成したブックマークを実行します。
6. Pinstarの「カメラを許可して開始」を押します。

## 実装内容

- カメラ映像を画面全体へ表示します。
- YouTubeの`video`要素を直接操作し、再生・停止・シークを行います。
- 左右のダブルタップで5秒戻し・5秒送りを行います。1回だけのタップでは表示も処理も行いません。
- `visualViewport`を使い、Safariの表示領域へオーバーレイを合わせます。
- 前回選択したカメラと録画カウントダウンを`localStorage`へ保存します。
- 録画開始前のカウントダウンを3秒・5秒・10秒から選択できます。
- マイクは使用しません。
- カメラ映像をCanvasへ描画し、`canvas.captureStream()`で録画用映像トラックを作成します。
- YouTube音声は`MediaElementAudioSourceNode`から`MediaStreamAudioDestinationNode`へ接続します。
- 映像と音声を`MediaRecorder`でMP4へエンコードします。
- 録画停止後はWeb Share APIでMP4ファイルを共有します。

画面収録は使用しません。Safariのツールバーや「YouTubeアプリで開く」表示は、生成されるMP4には入りません。

## 録画手順

1. YouTube動画を再生できる状態にします。
2. カメラを開始します。
3. 3秒・5秒・10秒のいずれかを選びます。
4. 「録画」を押します。
5. カウントダウン終了後に録画が開始します。
6. 「停止」を押すとMP4を生成します。
7. 「共有」を押してiOSの共有シートを開きます。

## 技術上の条件

Safariが`MediaRecorder`、Canvas Capture、Web Audio、Web Shareの各APIを提供している必要があります。PinstarはMP4以外の形式へ切り替えません。

Web Audioの仕様により、ブラウザーがYouTubeの再生メディアをCORS-cross-originと判定した場合、録画音声が無音になる可能性があります。その場合に別経路へ切り替える処理は実装していません。

## ビルド

```bash
bun run check
bun run build
bun test
```

`main`へpushするとGitHub Actionsが次の処理を行います。

1. TypeScriptのコンパイル確認
2. Bunによる単一IIFEファイルの生成
3. テスト
4. 親を持たない新しいコミットを作成し、`js`ブランチを`pinstar.js`だけの状態へforce-push
