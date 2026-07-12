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
- カメラとYouTube検出のエラーを画面内ログに表示する

## リポジトリ構成

`main`ブランチにはTypeScriptのソースコード、固定ブックマークレット、説明、テスト、GitHub Actionsを置きます。

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

YouTubeページではTrusted Typesが有効な場合があるため、固定ブックマークレットは`script.src`へ文字列を代入しません。GitHub rawから`pinstar.js`を取得し、Trusted Typesの`default`ポリシーで`TrustedScript`として実行します。同じポリシーの`createHTML`は、Pinstar本体がShadow DOMのUIを構築するときにも使用されます。

CDN、別URL、インライン版へのフォールバックはありません。取得または実行に失敗した場合は、エラーを表示して終了します。

## Safariへの登録

1. Safariで任意のページをブックマークします。
2. `main`ブランチの`bookmarklet.txt`を開き、1行すべてをコピーします。
3. 作成したブックマークを編集し、URL欄をコピーした内容へ置き換えます。
4. Safariで通常のYouTube動画ページを開きます。
5. 作成したブックマークを実行します。
6. Pinstarの「カメラを許可して開始」を押します。

## 動作方式

YouTube動画そのものや音声URLは取得しません。Safariで正常に再生できているYouTubeページの上へ、`getUserMedia({ video: ..., audio: false })`で取得したカメラ映像を重ねます。

完成動画はiPhone標準の画面収録で保存します。画面収録のマイクをオフにすることで、周囲の音を追加しません。

## 録画

1. YouTubeを再生できる状態にします。
2. コントロールセンターで画面収録を長押しします。
3. マイクをオフにします。
4. 画面収録を開始し、横画面へ戻ります。
5. PinstarのUIで再生位置を操作します。

ブラウザーのJavaScriptからiOS標準の画面収録を開始・停止することはできません。

## ビルド

`main`へpushするとGitHub Actionsが次の処理を行います。

1. TypeScriptのコンパイル確認
2. Bunによる単一IIFEファイルの生成
3. テスト
4. `js`ブランチを`pinstar.js`だけの状態へforce-push

ローカルでは次を実行します。

```bash
bun run check
bun run build
bun test
```

React、Tailwind、フロントエンドフレームワークは使用していません。UI、CSS、操作処理はすべて`src/index.ts`から`pinstar.js`へまとめてコンパイルします。
