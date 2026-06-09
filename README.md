# Markdown WASM Editor

`markdown-wasm` を使用した、高速で高機能な Web ベースの Markdown エディターです。

## 特徴

- **リアルタイム・パース:** WebAssembly 版の Markdown パーサー（`markdown-wasm`）により、入力と同時に極めて高速なプレビューが可能です。
- **Mermaid 対応:** フローチャート、シーケンス図、ガントチャートなどの Mermaid ダイアグラムをサポートしています。
    - 標準的な Mermaid プリセットを選択して、簡単にテンプレートを挿入できる機能を備えています。
- **PDF エクスポート:** 編集した内容をスタイルを維持したまま PDF ファイルとして保存できます。
- **テーマ切り替え:** ライトモードとダークモードの切り替えに対応しており、Mermaid の図もテーマに合わせて自動的に再描画されます。
- **CSS カスタマイズ:** プレビュー画面の CSS を自由に編集できます。また、3 つのスタイルプリセット（GitHub風、モダン、クラシック）から選択することも可能です。
- **編集支援機能:**
    - 太字、斜体、見出し、リストなどの書式設定ボタンを搭載。
    - キーボードショートカット対応（Ctrl+B: 太字, Ctrl+I: 斜体, Ctrl+S: PDF保存）。
    - Tab キーによるインデント挿入。
    - エディターとプレビューのスクロール同期。

## 使い方

1. `index.html` をブラウザで開きます。
2. 左側のエディターに Markdown を入力します。
3. 右側のプレビューエリアに即座に結果が表示されます。
4. ツールバーのボタンを使用して、書式の設定や Mermaid テンプレートの挿入が行えます。
5. 設定アイコン（歯車）から、プレビューの CSS スタイルをカスタマイズできます。
6. 「PDFで保存」ボタンをクリックすると、現在のプレビュー内容を PDF としてダウンロードできます。

## 使用テクノロジー

- **Markdown パーサー:** [markdown-wasm](https://github.com/rsms/markdown-wasm)
- **図解エンジン:** [mermaid.js](https://mermaid.js.org/)
- **PDF 生成:** [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/)
- **アイコン:** [Font Awesome](https://fontawesome.com/)
- **UI:** HTML5, CSS3 (CSS Variables 対応), JavaScript (Vanilla JS)

## ライセンス

MIT License
