# Pinstar

Pinstarは、iPhoneのSafariで開いた通常のYouTube動画ページへ、カメラ映像と動画操作UIを追加する授業課題用ツールです。YouTubeをiframeへ埋め込まず、現在のページに存在する`<video>`要素を再生・停止・シークします。

## できること

- カメラ映像を全画面表示する
- マイクを要求せず、周囲の音を取り込まない
- YouTubeを再生・停止する
- シークバーで再生位置を変更する
- 画面の左右をダブルタップして5秒移動する
- 前面・背面などのカメラ入力を選択する
- iPhoneの横画面内へ収まるUIを表示する
- 読み込み、カメラ、YouTube検出のエラーを画面内ログに表示する

## 動作方式

YouTube動画そのものや音声URLは取得しません。Safariで正常に再生できているYouTubeページの上へ、`getUserMedia({ video: ..., audio: false })`で取得したカメラ映像を重ねます。完成動画はiPhone標準の画面収録で保存します。画面収録のマイクをオフにすることで、周囲の音を追加しません。

Appleは、画面収録で画面と音を記録できる一方、一部のアプリやコンテンツでは音声または映像の収録が許可されない場合があると説明しています。対象動画とiOSバージョンで実機確認が必要です。

## インストール

`main`へpushするとGitHub ActionsがTypeScriptをBunでビルドし、生成物だけを`js`ブランチへforce-pushします。

生成物:

- `pinstar.js`: 実行本体
- `bookmarklet.txt`: GitHub上の最新版を読み込むブックマークレット
- `bookmarklet-inline.txt`: 外部読込を使わない単体版
- `shortcut-loader.js`: iOSショートカットの「WebページでJavaScriptを実行」用
- `index.html`: コピー用ページ

最新版の本体URL:

```text
https://raw.githubusercontent.com/AkaakuHub/Pinstar/js/pinstar.js
```

### Safariブックマークレット

1. Safariで適当なページをブックマークします。
2. ブックマークを編集し、URLを`js`ブランチの`bookmarklet.txt`の内容へ置き換えます。
3. Safariで通常のYouTube動画ページを開きます。
4. 作成したブックマークを実行します。
5. 「カメラを許可して開始」を押します。

ブックマークレットの実行直後に、YouTubeページ上へ読み込み状態を表示します。GitHub rawから取得できない場合はjsDelivrへ自動的に切り替えます。両方とも失敗した場合は、その理由と`bookmarklet-inline.txt`を使用する案内を赤いエラー表示で残します。

`bookmarklet-inline.txt`は外部JavaScriptを読み込みません。その代わり、Pinstarを更新した後はブックマークのURLを新しい内容へ置き換える必要があります。

### iOSショートカット

1. ショートカットで「WebページでJavaScriptを実行」を追加します。
2. `shortcut-loader.js`の内容を貼り付けます。
3. 共有シートへ表示し、入力を「SafariのWebページ」に限定します。
4. 設定で「スクリプトの実行を許可」を有効にします。
5. YouTube動画ページの共有シートから実行します。

## 録画

1. YouTubeを再生できる状態にします。
2. コントロールセンターで画面収録を長押しします。
3. マイクをオフにします。
4. 画面収録を開始し、横画面へ戻ります。
5. PinstarのUIで再生位置を操作します。

ブラウザーのJavaScriptからiOS標準の画面収録を開始・停止することはできません。

## 開発

```bash
bun run check
bun test
bun run build
```

React、Tailwind、フロントエンドフレームワークは使用していません。TypeScriptを単一のIIFE形式へコンパイルします。
