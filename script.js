// script.js

/**
 * APP STATE MANAGEMENT
 */
const AppState = {
    viewMode: 'doc', // 'doc', 'slide', 'board'
    selectedAssetId: null,
    language: localStorage.getItem('lang') || (navigator.language.startsWith('ja') ? 'ja' : 'en'),
    theme: localStorage.getItem('theme') || 'dark',
    markdownParser: null,
    mermaidCounter: 0,
    isScrolling: false,
    renderTimeout: null,
    saveTimeout: null,
    updateTimeout: null, // For debouncing preview
};

/**
 * CONSTANTS & TEMPLATES
 */
const translations = {
    ja: {
        p_flowchart: "フローチャート",
        p_sequence: "シーケンス図",
        p_gantt: "ガントチャート",
        p_class: "クラス図",
        p_state: "状態遷移図",
        p_er: "ER図",
        p_pie: "パイチャート",
        p_journey: "ユーザージャーニー",
        p_git: "Gitグラフ",
        p_mindmap: "マインドマップ",
        p_timeline: "タイムライン",
        p_quadrant: "クアドラントチャート",
        group_list: "リスト",
        group_table: "テーブル",
        group_other: "その他",
        p_checklist_3: "チェックリスト (3個)",
        p_checklist_5: "チェックリスト (5個)",
        p_bullet_3: "箇条書き (3個)",
        p_bullet_nested: "箇条書き (ネスト)",
        p_table_3x3: "テーブル (3x3)",
        p_table_5x5: "テーブル (5x5)",
        p_table_header_only: "テーブル (ヘッダーのみ)",
        p_hr: "水平線 (HR)",
        p_math: "数式ブロック (LaTeX)",
        p_callout_info: "注釈 (Info)",
        p_callout_warn: "注釈 (Warning)",
        p_details: "折りたたみ (Details)",
        file: "ファイル",
        input: "入力",
        view: "表示",
        settings: "設定",
        save_pdf: "PDF保存",
        save_html: "HTML保存",
        save_images: "スライド画像保存 (ZIP)",
        export_portable: "外部保存 (Portable MD)",
        bold: "太字",
        italic: "斜体",
        header: "見出し",
        list: "リスト",
        link: "リンク",
        quote: "引用",
        code: "コード",
        mermaid_presets: "Mermaid プリセット...",
        md_presets: "Markdown プリセット...",
        create_toc: "目次作成",
        view_doc: "文書モード",
        view_slide: "スライドモード",
        view_board: "ボードモード",
        start_present: "プレゼン開始",
        theme_toggle: "テーマ切り替え",
        settings_title: "外観・フォント設定",
        css_presets_label: "CSS プリセット",
        sys_standard: "--- システム標準 ---",
        p_technical: "TECHNICAL (テクニカル)",
        p_corporate: "CORPORATE (コーポレート)",
        p_modern_dark: "MODERN DARK (モダン・ダーク)",
        p_startup: "STARTUP (スタートアップ)",
        p_blueprint: "BLUEPRINT (設計図)",
        p_paper: "PAPER (報告書・白)",
        p_minimal: "CLEAN MINIMAL (シンプル・ミニマル)",
        p_solarized: "SOLARIZED (落ち着いた配色)",
        p_academia: "DARK ACADEMIA (アカデミック)",
        p_contrast: "HIGH CONTRAST (高コントラスト)",
        user_defined: "--- ユーザー定義 ---",
        save_as_preset: "新規プリセットとして保存",
        preset_name_placeholder: "プリセット名を入力...",
        save: "保存",
        font_label: "プレビュー用フォント & サイズ",
        slide_print_label: "スライド印刷設定",
        print_1up: "標準 (1枚/ページ)",
        print_2up: "配布資料 (2枚/ページ - A4縦)",
        css_editor_label: "CSS エディター",
        css_editor_placeholder: "/* CSSを入力してください */",
        properties: "プロパティ",
        no_selection: "選択されていません",
        alt_text: "代替テキスト (Alt)",
        alt_placeholder: "画像の説明...",
        size: "サイズ",
        alignment: "配置",
        align_left: "左寄せ",
        align_center: "中央",
        align_right: "右寄せ",
        asset_id: "アセットID",
        lines: "行",
        words: "単語",
        chars: "文字",
        saving: "保存中...",
        saved: "保存済み",
        help: "ヘルプ",
        shortcuts_title: "キーボードショートカット",
        shortcut_bold: "太字",
        shortcut_italic: "斜体",
        shortcut_undo: "元に戻す (Undo)",
        shortcut_redo: "やり直し (Redo)",
        shortcut_pdf: "PDF保存",
        shortcut_tab: "4スペース挿入",
        shortcut_md_drop: "Markdownインポート",
        shortcut_img_drop: "画像インポート",
        gen_images: "画像生成中...",
        gen_images_progress: "画像生成中 ({curr}/{total})...",
        export_failed: "画像のエクスポートに失敗しました。詳細はコンソールを確認してください。",
        editor_not_ready: "エディターがまだ準備できていません。",
        no_slides_to_export: "エクスポートするスライドがありません。",
        toc_title: "目次",
        toc_error: "目次を作成するには、## 以上の見出しが必要です。",
        delete_preset_confirm: "プリセット \"{name}\" を削除しますか？",
        sys_preset_no_delete: "システム標準プリセットは削除できません。",
        preset_name_empty: "プリセット名を入力してください。",
        lang_label: "言語 (Language)",
        slide_layouts: "スライド・レイアウト...",
        pres_templates: "プレゼン・テンプレート...",
        group_layouts: "レイアウト",
        l_title: "タイトルスライド",
        l_2col: "2カラム (左右分割)",
        l_img_text: "画像 + 説明",
        l_focus_mermaid: "図面フォーカス",
        l_code: "コード強調",
        l_quote: "強調引用",
        l_timeline: "タイムライン",
        l_checklist: "チェックリスト",
        l_quad: "クアドラント",
        l_closing: "クロージング",
        group_structs: "構成テンプレート",
        t_pitch: "ピッチデック",
        t_project: "プロジェクト提案",
        t_system: "システム設計書",
        t_roadmap: "ロードマップ",
        t_lecture: "講義/チュートリアル",
        t_report: "月次報告書",
        t_brainstorm: "ブレインストーミング",
        t_qa: "Q&Aセッション",
        t_case: "ケーススタディ",
        t_update: "リリースノート"
    },
    en: {
        p_flowchart: "Flowchart",
        p_sequence: "Sequence Diagram",
        p_gantt: "Gantt Chart",
        p_class: "Class Diagram",
        p_state: "State Diagram",
        p_er: "ER Diagram",
        p_pie: "Pie Chart",
        p_journey: "User Journey",
        p_git: "Git Graph",
        p_mindmap: "Mindmap",
        p_timeline: "Timeline",
        p_quadrant: "Quadrant Chart",
        group_list: "List",
        group_table: "Table",
        group_other: "Other",
        p_checklist_3: "Checklist (3)",
        p_checklist_5: "Checklist (5)",
        p_bullet_3: "Bullet List (3)",
        p_bullet_nested: "Nested List",
        p_table_3x3: "Table (3x3)",
        p_table_5x5: "Table (5x5)",
        p_table_header_only: "Table (Header only)",
        p_hr: "Horizontal Rule",
        p_math: "Math Block (LaTeX)",
        p_callout_info: "Callout (Info)",
        p_callout_warn: "Callout (Warning)",
        p_details: "Details (Folding)",
        file: "File",
        input: "Input",
        view: "View",
        settings: "Settings",
        save_pdf: "Save as PDF",
        save_html: "Save as HTML",
        save_images: "Save Slides as Images (ZIP)",
        export_portable: "Export Portable MD",
        bold: "Bold",
        italic: "Italic",
        header: "Heading",
        list: "List",
        link: "Link",
        quote: "Quote",
        code: "Code",
        mermaid_presets: "Mermaid Presets...",
        md_presets: "Markdown Presets...",
        create_toc: "Create TOC",
        view_doc: "Document Mode",
        view_slide: "Slide Mode",
        view_board: "Board Mode",
        start_present: "Start Presentation",
        theme_toggle: "Toggle Theme",
        settings_title: "Appearance & Font Settings",
        css_presets_label: "CSS Presets",
        sys_standard: "--- System Standard ---",
        p_technical: "TECHNICAL (Engineering)",
        p_corporate: "CORPORATE (Simple/Business)",
        p_modern_dark: "MODERN DARK (Sleek/Dark)",
        p_startup: "STARTUP (Casual/Modern)",
        p_blueprint: "BLUEPRINT (Engineering Blue)",
        p_paper: "PAPER (White Report)",
        p_minimal: "CLEAN MINIMAL (Modern/Simple)",
        p_solarized: "SOLARIZED (Subtle/Dark)",
        p_academia: "DARK ACADEMIA (Serif/Dark)",
        p_contrast: "HIGH CONTRAST (Accessibility)",
        user_defined: "--- User Defined ---",
        save_as_preset: "Save as New Preset",
        preset_name_placeholder: "Enter preset name...",
        save: "Save",
        font_label: "Preview Font & Size",
        slide_print_label: "Slide Print Settings",
        print_1up: "Standard (1 slide/page)",
        print_2up: "Handout (2 slides/page - A4 Portrait)",
        css_editor_label: "CSS Editor",
        css_editor_placeholder: "/* Enter CSS here */",
        properties: "Properties",
        no_selection: "No selection",
        alt_text: "Alt Text",
        alt_placeholder: "Image description...",
        size: "Size",
        alignment: "Alignment",
        align_left: "Left",
        align_center: "Center",
        align_right: "Right",
        asset_id: "Asset ID",
        lines: "Lines",
        words: "Words",
        chars: "Chars",
        saving: "Saving...",
        saved: "Saved",
        help: "Help",
        shortcuts_title: "Keyboard Shortcuts",
        shortcut_bold: "Bold",
        shortcut_italic: "Italic",
        shortcut_undo: "Undo",
        shortcut_redo: "Redo",
        shortcut_pdf: "Save PDF",
        shortcut_tab: "Insert 4 spaces",
        shortcut_md_drop: "Markdown Import",
        shortcut_img_drop: "Image Import",
        gen_images: "Generating images...",
        gen_images_progress: "Generating images ({curr}/{total})...",
        export_failed: "Image export failed. Check console for details.",
        editor_not_ready: "Editor is not ready yet.",
        no_slides_to_export: "No slides to export.",
        toc_title: "Table of Contents",
        toc_error: "Header (## or higher) is required to create a TOC.",
        delete_preset_confirm: "Delete preset \"{name}\"?",
        sys_preset_no_delete: "System presets cannot be deleted.",
        preset_name_empty: "Please enter a preset name.",
        lang_label: "Language",
        slide_layouts: "Slide Layouts...",
        pres_templates: "Presentation Templates...",
        group_layouts: "Layouts",
        l_title: "Title Slide",
        l_2col: "2-Column",
        l_img_text: "Image + Text",
        l_focus_mermaid: "Focus: Mermaid",
        l_code: "Code Focus",
        l_quote: "Big Quote",
        l_timeline: "Timeline",
        l_checklist: "Checklist",
        l_quad: "Quadrant Chart",
        l_closing: "Closing Slide",
        group_structs: "Structures",
        t_pitch: "Pitch Deck",
        t_project: "Project Proposal",
        t_system: "System Architecture",
        t_roadmap: "Product Roadmap",
        t_lecture: "Lecture/Educational",
        t_report: "Monthly Report",
        t_brainstorm: "Brainstorming",
        t_qa: "Q&A Session",
        t_case: "Case Study",
        t_update: "Release Notes"
    }
};

const cssPresetStyles = {
    'sys:technical': `/* TECHNICAL (エンジニアリング) */
.markdown-body { font-family: var(--preview-font); color: var(--text-color); }
.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
    border-bottom: 1px solid var(--border-color); text-transform: uppercase; font-weight: normal; padding-bottom: 0.2em;
}
.markdown-body table { border-collapse: collapse; width: 100%; margin: 1em 0; }
.markdown-body table th, .markdown-body table td { border: 1px solid var(--border-color); padding: 8px; text-align: left; }
.markdown-body table th { background-color: var(--toolbar-bg); }`,
    'sys:blueprint': `/* BLUEPRINT (ENGINEERING) */
.markdown-body { font-family: var(--preview-font); color: #a0c4ff; background-color: #001524; }
.slide-card .markdown-body { background-color: transparent; }
.markdown-body h1, .markdown-body h2 { color: #fff; border-bottom: 2px solid #577590; font-style: italic; }`,
    'sys:paper': `/* DOCUMENT (REPORT) */
.markdown-body { font-family: var(--preview-font); color: #1a1a1a; background-color: #fdfdfd; padding: 40px !important; line-height: 1.8; }
.slide-card .markdown-body { background-color: transparent; padding: 0 !important; }
.markdown-body h1 { text-align: center; border-bottom: 2px solid #000; }`,
    'sys:minimal': `/* CLEAN MINIMAL */
.markdown-body { font-family: var(--preview-font); max-width: 800px; margin: 0 auto; color: #333; background: #fff; line-height: 2; }
.markdown-body h1, .markdown-body h2 { font-weight: 300; border: none; text-align: center; }`,
    'sys:corporate': `/* CORPORATE (SIMPLE) */
.markdown-body { font-family: var(--preview-font); color: #222; background: #fff; line-height: 1.6; }
.markdown-body h1, .markdown-body h2 { color: #003366; border-bottom: 2px solid #003366; }
.markdown-body table th { background-color: #f2f2f2; color: #003366; }`,
    'sys:modern_dark': `/* MODERN DARK */
.markdown-body { font-family: var(--preview-font); color: #e0e0e0; background: #1a1c1e; }
.markdown-body h1, .markdown-body h2 { color: #fff; border-bottom: 1px solid #333; }
.markdown-body code { background: #2d2d2d; color: #4a9eff; }`,
    'sys:startup': `/* STARTUP (CASUAL MODERN) */
.markdown-body { font-family: var(--preview-font); color: #333; background: #fdfdfd; }
.markdown-body h1 { color: #6366f1; border: none; }
.markdown-body h2 { color: #4f46e5; border-bottom: 1px solid #e5e7eb; }`,
    'sys:solarized': `/* SOLARIZED DARK */
.markdown-body { font-family: var(--preview-font); background: #002b36; color: #839496; }
.markdown-body h1, .markdown-body h2 { color: #268bd2; border-bottom-color: #586e75; }`,
    'sys:academia': `/* DARK ACADEMIA */
.markdown-body { font-family: var(--preview-font); background: #1c1917; color: #d6d3d1; line-height: 1.8; }
.markdown-body h1, .markdown-body h2 { font-family: serif; color: #a8a29e; border-bottom-color: #444; }`,
    'sys:contrast': `/* HIGH CONTRAST */
.markdown-body { font-family: var(--preview-font); background: #fff; color: #000; font-weight: bold; }
.markdown-body h1, .markdown-body h2 { background: #000; color: #fff; padding: 10px; }`
};

const mermaidTemplates = {
    flowchart: 'graph TD\n    A[開始] --> B{判定}\n    B -- はい --> C[正常終了]\n    B -- いいえ --> D[エラー終了]',
    sequence: 'sequenceDiagram\n    アリス->>ボブ: こんにちは、ボブ！元気？\n    ボブ-->>アリス: 絶好調だよ！',
    gantt: 'gantt\n    title ガントチャートの例\n    section セクション1\n    タスクA           :a1, 2023-01-01, 30d\n    タスクB           :after a1  , 20d',
    class: 'classDiagram\n    動物 <|-- アヒル\n    動物 <|-- 魚\n    動物 <|-- シマウマ\n    class 動物{\n        +int 年齢\n        +String 性別\n        +哺乳類か()\n        +交尾する()\n    }',
    state: 'stateDiagram-v2\n    [*] --> 停止中\n    停止中 --> [*]\n    停止中 --> 移動中\n    移動中 --> 停止中\n    移動中 --> 衝突\n    衝突 --> [*]',
    er: 'erDiagram\n    顧客 ||--o{ 注文 : 行う\n    注文 ||--|{ 注文項目 : 含む\n    顧客 }|..|{ 配送先住所 : 使用する',
    pie: 'pie title 飼っているペット\n    "イヌ" : 386\n    "ネコ" : 85\n    "ネズミ" : 15',
    journey: 'journey\n    title ある一日の流れ\n    section 出勤\n      お茶を淹れる: 5: 自分\n      階段を上る: 3: 自分\n      仕事をする: 1: 自分, 猫\n    section 帰宅\n      階段を下りる: 5: 自分\n      座る: 5: 自分',
    git: 'gitGraph\n    commit\n    commit\n    branch develop\n    checkout develop\n    commit\n    commit\n    checkout main\n    merge develop\n    commit',
    mindmap: 'mindmap\n  root((マインドマップ))\n    起源\n      長い歴史\n      ::icon(fa fa-book)\n      普及\n        英国の心理学著者 トニー・ブザン\n    研究\n      有効性と特徴について\n      全体像と詳細について\n    ツール\n      ペンと紙\n      Mermaid',
    timeline: 'timeline\n    title ソーシャルメディアの歴史\n    2002 : LinkedIn\n    2004 : Facebook : Google\n    2005 : Youtube\n    2006 : Twitter',
    quadrant: 'quadrantChart\n    title キャンペーンの到達度とエンゲージメント\n    x-axis 低到達 --> 高到達\n    y-axis 低エンゲージメント --> 高エンゲージメント\n    quadrant-1 拡大すべき\n    quadrant-2 促進が必要\n    quadrant-3 再評価が必要\n    quadrant-4 改善の余地あり\n    キャンペーンA: [0.3, 0.6]\n    キャンペーンB: [0.45, 0.23]\n    キャンペーンC: [0.57, 0.69]\n    キャンペーンD: [0.78, 0.34]\n    キャンペーンE: [0.40, 0.34]\n    キャンペーンF: [0.58, 0.14]'
};

const slideLayouts = {
    l_title: "# プレゼンテーション・タイトル\n## サブタイトルまたは発表者名\n### 2024年X月X日",
    l_2col: "# 左右分割レイアウト\n\n<div class=\"grid-2-col\">\n<div>\n\n### 左カラム\n- 項目 A\n- 項目 B\n- 項目 C\n\n</div>\n<div>\n\n### 右カラム\n- 詳細 1\n- 詳細 2\n- 詳細 3\n\n</div>\n</div>",
    l_img_text: "# 画像と説明のレイアウト\n\n<div class=\"grid-2-col\">\n<div>\n\n![サンプル画像](https://via.placeholder.com/600x400)\n\n</div>\n<div>\n\n### 解説\nここに画像の詳しい説明や、注目すべきポイントを記述します。箇条書きも利用可能です。\n\n</div>\n</div>",
    l_focus_mermaid: "# 図面フォーカス・レイアウト\n\n```mermaid\ngraph TD\n    Start --> Process\n    Process --> End\n```\n\n> 上記の図は、主要なワークフローを示しています。",
    l_code: "# コード強調レイアウト\n\n```javascript\n// サンプルコード\nfunction helloWorld() {\n    console.log(\"Hello, TECH-MD!\");\n}\n```\n\n- 実装のポイント 1\n- 実装のポイント 2",
    l_quote: "# 強調引用レイアウト\n\n<div style=\"text-align:center; padding: 40px;\">\n\n> \"複雑なものをシンプルにすることは、世界で最も難しいことの一つだ。\"\n\n<cite>— スティーブ・ジョブズ</cite>\n\n</div>",
    l_timeline: "# タイムライン・レイアウト\n\n```mermaid\ntimeline\n    title プロジェクトの歴史\n    2022 : 企画立案 : 市場調査\n    2023 : 開発開始 : ベータ版リリース\n    2024 : 正式リリース : グローバル展開\n```",
    l_checklist: "# チェックリスト・レイアウト\n\n- [x] マイルストーン 1 完了\n- [x] マイルストーン 2 完了\n- [ ] マイルストーン 3 進行中\n- [ ] 最終評価 予定",
    l_quad: "# クアドラント分析\n\n```mermaid\nquadrantChart\n    title 優先順位分析\n    x-axis 低コスト --> 高コスト\n    y-axis 低価値 --> 高価値\n    quadrant-1 投資すべき\n    quadrant-2 検討が必要\n    quadrant-3 無視してよい\n    quadrant-4 効率化が必要\n    プロジェクトA: [0.3, 0.8]\n    プロジェクトB: [0.7, 0.4]\n```",
    l_closing: "# ご清聴ありがとうございました\n\n## 質疑応答 (Q&A)\n\n### 連絡先\n- Email: info@example.com\n- Web: https://example.com"
};

const presentationTemplates = {
    t_pitch: "# Startup Pitch Deck\n---\n# Problem\nSolving X for Y users.\n---\n# Solution\nOur platform Z.\n---\n# Market Size\n$10B Opportunity.\n---\n# Business Model\nSaaS Subscription.\n---\n# Team\nExperts in A and B.",
    t_project: "# プロジェクト提案書\n---\n# 目的\nプロジェクトの背景と達成すべきゴール。\n---\n# スコープ\n実施内容の詳細。\n---\n# スケジュール\n2024年第1四半期の予定。\n---\n# 予算\n概算見積もり。",
    t_system: "# システム構成設計\n---\n# アーキテクチャ\n```mermaid\ngraph LR\n    LB[Load Balancer] --> App1[App Server 1]\n    LB --> App2[App Server 2]\n    App1 --> DB[(Database)]\n    App2 --> DB\n```\n---\n# データベース設計\nテーブル構造とリレーションシップ。\n---\n# セキュリティ\n認証・認可の仕組み。",
    t_roadmap: "# ロードマップ\n---\n# Q1\nFeature A, B\n---\n# Q2\nFeature C, D\n---\n# Q3\nExpansion",
    t_lecture: "# 第1講: Markdown基礎\n---\n# Markdownとは？\n軽量マークアップ言語の一つです。\n---\n# 基本的な記法\n# 見出し\n- リスト\n**太字**\n---\n# 実習\n実際に書いてみましょう。",
    t_report: "# 月次報告 (2024年X月)\n---\n# 今月の成果\n主要KPIの達成状況。\n---\n# 課題と対策\n直面した問題と今後の計画。\n---\n# 来月の目標\n具体的な数値目標。",
    t_brainstorm: "# アイデア・ブレインストーミング\n---\n# テーマ\n新機能 A について。\n---\n# アイデア 1\n詳細内容...\n---\n# アイデア 2\n詳細内容...",
    t_qa: "# Q&Aセッション\n---\n# Q1: よくある質問\n回答内容...\n---\n# Q2: 技術的な詳細\n回答内容...",
    t_case: "# 事例紹介: 株式会社A様\n---\n# 導入前の課題\n効率化が課題だった。\n---\n# 解決策\nTECH-MDエディターの導入。\n---\n# 導入後の効果\n生産性が50%向上。",
    t_update: "# リリースノート v2.0\n---\n# 新機能\n- ボードモードの追加\n- 多言語対応\n---\n# 改善点\n- PDF出力の安定性向上\n---\n# バグ修正\n- UIの微調整"
};

const markdownTemplates = {
    checklist_3: '- [ ] 項目 1\n- [ ] 項目 2\n- [ ] 項目 3',
    checklist_5: '- [ ] 項目 1\n- [ ] 項目 2\n- [ ] 項目 3\n- [ ] 項目 4\n- [ ] 項目 5',
    bullet_3: '- 項目 1\n- 項目 2\n- 項目 3',
    bullet_nested: '- 親要素 1\n    - 子要素 1.1\n    - 子要素 1.2\n- 親要素 2\n    - 子要素 2.1',
    table_3x3: '| ヘッダー 1 | ヘッダー 2 | ヘッダー 3 |\n| --- | --- | --- |\n| セル 1-1 | セル 1-2 | セル 1-3 |\n| セル 2-1 | セル 2-2 | セル 2-3 |\n| セル 3-1 | セル 3-2 | セル 3-3 |',
    table_5x5: '| H1 | H2 | H3 | H4 | H5 |\n| --- | --- | --- | --- | --- |\n| C1-1 | C1-2 | C1-3 | C1-4 | C1-5 |\n| C2-1 | C2-2 | C2-3 | C2-4 | C2-5 |\n| C3-1 | C3-2 | C3-3 | C3-4 | C3-5 |\n| C4-1 | C4-2 | C4-3 | C4-4 | C4-5 |\n| C5-1 | C5-2 | C5-3 | C5-4 | C5-5 |',
    table_header_only: '| ヘッダー 1 | ヘッダー 2 |\n| --- | --- |',
    hr: '\n---\n',
    math: '$$\nL = \\frac{1}{2} \\rho v^2 S C_L\n$$',
    callout_info: '> [!INFO]\n> これは情報コールアウトです。',
    callout_warn: '> [!WARNING]\n> これは警告コールアウトです。',
    details: '<details>\n<summary>クリックで展開</summary>\n\n内容をここに入力...\n</details>'
};

/**
 * HELPER OBJECTS
 */
const I18n = {
    t(key) { return translations[AppState.language][key] || key; },
    setLang(lang) {
        AppState.language = lang;
        localStorage.setItem('lang', lang);
        this.updateUI();
    },
    updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = this.t(key);
            else {
                const icon = el.querySelector('i');
                if (icon) {
                    const textNode = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
                    if (textNode) textNode.textContent = ' ' + this.t(key);
                    else el.appendChild(document.createTextNode(' ' + this.t(key)));
                } else el.textContent = this.t(key);
            }
        });
        document.querySelectorAll('[data-i18n-label]').forEach(el => el.label = this.t(el.getAttribute('data-i18n-label')));
        document.querySelectorAll('[data-i18n-title]').forEach(el => el.title = this.t(el.getAttribute('data-i18n-title')));
        editor.placeholder = AppState.language === 'ja' ? '入力を待機中...' : 'Waiting for input...';
        updateStats();
        debouncedUpdatePreview();
    }
};

const AssetStore = {
    assets: new Map(),
    nextId: 1,
    add(base64) {
        const id = `img-${this.nextId++}`;
        this.assets.set(id, base64);
        return id;
    },
    get(id) { return this.assets.get(id); }
};

const CSSStore = {
    userPresets: {},
    load() {
        const saved = localStorage.getItem('userCssPresets');
        if (saved) this.userPresets = JSON.parse(saved);
        this.refreshDropdown();
    },
    save(name, css) {
        this.userPresets[name] = css;
        localStorage.setItem('userCssPresets', JSON.stringify(this.userPresets));
        this.refreshDropdown();
    },
    delete(name) {
        delete this.userPresets[name];
        localStorage.setItem('userCssPresets', JSON.stringify(this.userPresets));
        this.refreshDropdown();
    },
    refreshDropdown() {
        const dropdown = document.getElementById('css-presets');
        let foundSeparator = false;
        Array.from(dropdown.options).forEach(opt => {
            if (opt.disabled && opt.textContent.includes('ユーザー定義')) { foundSeparator = true; return; }
            if (foundSeparator) dropdown.removeChild(opt);
        });
        Object.keys(this.userPresets).forEach(name => {
            const opt = document.createElement('option');
            opt.value = `user:${name}`;
            opt.textContent = name;
            dropdown.appendChild(opt);
        });
    }
};

/**
 * CORE LOGIC
 */
async function initMermaid() {
    if (typeof mermaid === 'undefined') return;
    const isDark = document.body.classList.contains('dark-mode');
    const font = getComputedStyle(document.documentElement).getPropertyValue('--preview-font').trim().replace(/['"]/g, '') || 'monospace';
    const fontSize = getComputedStyle(document.documentElement).getPropertyValue('--preview-font-size').trim() || '14px';

    mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: font,
        fontSize: parseInt(fontSize),
        themeVariables: { fontFamily: font, fontSize: fontSize }
    });
}

function preprocessMarkdown(text) {
    const assetRegex = /!\[([^\]|]*)(\|[^\]]*)?\]\(asset:([^)]+)\)/g;
    return text.replace(assetRegex, (match, alt, params, id) => {
        const base64 = AssetStore.get(id);
        if (!base64) return match;
        let width = "", align = "left";
        if (params) {
            const wMatch = params.match(/w=(\d+)/);
            if (wMatch) width = `width="${wMatch[1]}"`;
            if (params.includes("a=center")) align = "center";
            if (params.includes("a=right")) align = "right";
        }
        const style = align === "center" ? 'style="display:block; margin-left:auto; margin-right:auto;"' :
                      align === "right"  ? 'style="display:block; margin-left:auto;"' : "";
        return `<img src="${base64}" alt="${alt}" ${width} ${style} data-asset-id="${id}">`;
    });
}

async function updatePreview() {
    if (!AppState.markdownParser) return;

    document.body.classList.toggle('slide-preview-mode', AppState.viewMode === 'slide');
    document.body.classList.toggle('board-preview-mode', AppState.viewMode === 'board');

    const content = editor.value;
    if (!content) { preview.innerHTML = ''; return; }

    try {
        const processedContent = preprocessMarkdown(content);
        const encoder = new TextEncoder();
        const output = AppState.markdownParser.parse(encoder.encode(processedContent));
        let html = (output instanceof Uint8Array) ? new TextDecoder().decode(output) : output;

        if (AppState.viewMode === 'slide') {
            html = html.split(/<hr[^>]*>/i).map((s, i) => `
                <div class="slide-card" data-slide-num="${i + 1}"><div class="markdown-body">${s}</div></div>
            `).join('');
            document.body.classList.toggle('print-2-up', (localStorage.getItem('printLayout') || '1-up') === '2-up');
        } else if (AppState.viewMode === 'board') {
            html = `<div class="board-grid">${html.split(/<hr[^>]*>/i).map(s => `
                <div class="board-card"><div class="markdown-body">${s}</div></div>
            `).join('')}</div>`;
            document.body.classList.remove('print-2-up');
        } else {
            document.body.classList.remove('print-2-up');
        }

        preview.innerHTML = html;
        await renderMermaid();
        attachImageListeners();
    } catch (err) { console.error('Markdown parse error:', err); }
}

function debouncedUpdatePreview() {
    clearTimeout(AppState.updateTimeout);
    AppState.updateTimeout = setTimeout(updatePreview, 150);
}

async function renderMermaid() {
    clearTimeout(AppState.renderTimeout);
    AppState.renderTimeout = setTimeout(async () => {
        const blocks = preview.querySelectorAll('pre > code.language-mermaid');
        for (const block of blocks) {
            const pre = block.parentElement;
            const code = block.textContent.trim();
            const id = `mermaid-svg-${Date.now()}-${AppState.mermaidCounter++}`;
            try {
                const nextEl = pre.nextElementSibling;
                if (nextEl && nextEl.classList.contains('mermaid-rendered')) nextEl.remove();
                const { svg } = await mermaid.render(id, code);
                const wrapper = document.createElement('div');
                wrapper.className = 'mermaid-rendered';
                wrapper.innerHTML = svg;
                pre.style.display = 'none';
                pre.insertAdjacentElement('afterend', wrapper);
            } catch (err) {
                console.error('Mermaid render error:', err);
                pre.style.display = 'block';
                const nextEl = pre.nextElementSibling;
                if (nextEl && nextEl.classList.contains('mermaid-error')) nextEl.remove();
                const errorDiv = document.createElement('div');
                errorDiv.className = 'mermaid-error';
                errorDiv.textContent = 'ERR: ' + err.message;
                pre.insertAdjacentElement('afterend', errorDiv);
            }
        }
    }, 200);
}

/**
 * IMAGE MANAGEMENT & SIDEBAR
 */
function attachImageListeners() {
    const images = preview.querySelectorAll('img[data-asset-id]');
    images.forEach(img => {
        img.style.cursor = "pointer";
        if (img.getAttribute('data-asset-id') === AppState.selectedAssetId) img.classList.add('selected-asset');
        img.onclick = (e) => { e.stopPropagation(); selectImage(img); };
    });
    preview.onclick = (e) => { if (e.target === preview) clearSelection(); };
}

function selectImage(img) {
    AppState.selectedAssetId = img.getAttribute('data-asset-id');
    preview.querySelectorAll('img').forEach(i => i.classList.remove('selected-asset'));
    img.classList.add('selected-asset');

    document.getElementById('no-selection-msg').classList.add('hidden');
    document.getElementById('image-properties').classList.remove('hidden');

    document.getElementById('prop-alt').value = img.alt || "";
    const currentWidth = img.getAttribute('width') || img.naturalWidth || 300;
    document.getElementById('prop-width').value = currentWidth;
    document.getElementById('width-val').textContent = currentWidth;
    document.getElementById('prop-id').textContent = AppState.selectedAssetId;

    const currentAlign = img.style.marginLeft === "auto" ? (img.style.marginRight === "auto" ? "center" : "right") : "left";
    document.querySelectorAll('.prop-toggle-group button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-align') === currentAlign);
    });
}

function clearSelection() {
    AppState.selectedAssetId = null;
    preview.querySelectorAll('img').forEach(i => i.classList.remove('selected-asset'));
    document.getElementById('no-selection-msg').classList.remove('hidden');
    document.getElementById('image-properties').classList.add('hidden');
}

function syncProperties() {
    if (!AppState.selectedAssetId) return;
    const alt = document.getElementById('prop-alt').value;
    const width = document.getElementById('prop-width').value;
    const align = document.querySelector('.prop-toggle-group button.active').getAttribute('data-align');

    const text = editor.value;
    const regex = new RegExp(`!\\[([^\\]|]*)(\\|[^\\]]*)?\\\]\\(asset:${AppState.selectedAssetId}\\)`, 'g');
    const replacement = `![${alt}|w=${width}|a=${align}](asset:${AppState.selectedAssetId})`;

    if (text.match(regex)) {
        const savedStart = editor.selectionStart;
        const savedEnd = editor.selectionEnd;
        const newText = text.replace(regex, replacement);

        if (text !== newText) {
            // Using execCommand for undo history if possible (though global replace is hard with it)
            // For better UX, we try to preserve cursor relative to content
            editor.value = newText;
            editor.setSelectionRange(savedStart, savedEnd);
            debouncedUpdatePreview();
            autoSave();
        }
    }
}

/**
 * TEXT EDITING UTILS
 */
function insertAtCursor(before, after = '') {
    editor.focus();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selection = text.substring(start, end);
    const replacement = before + selection + after;

    try {
        if (!document.execCommand('insertText', false, replacement)) {
            editor.value = text.substring(0, start) + replacement + text.substring(end);
            editor.setSelectionRange(start + replacement.length, start + replacement.length);
        } else {
            if (after.length > 0 && selection.length === 0) {
                editor.setSelectionRange(start + before.length, start + before.length);
            }
        }
    } catch (e) {
        editor.value = text.substring(0, start) + replacement + text.substring(end);
    }
    debouncedUpdatePreview();
    updateStats();
    autoSave();
}

/**
 * EVENT LISTENERS & INITIALIZATION
 */
async function setTheme(theme) {
    AppState.theme = theme;
    document.body.classList.toggle('dark-mode', theme === 'dark');
    document.body.classList.toggle('light-mode', theme === 'light');
    const icon = document.querySelector('#btn-theme i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
    localStorage.setItem('theme', theme);
    await initMermaid();
    debouncedUpdatePreview();
}

function applyCustomCss(css) {
    document.getElementById('user-custom-css').textContent = css;
    localStorage.setItem('customCss', css);
}

// Auto-save logic
function autoSave() {
    const status = document.getElementById('save-status');
    status.textContent = I18n.t('saving');
    status.style.opacity = "1";
    clearTimeout(AppState.saveTimeout);
    AppState.saveTimeout = setTimeout(() => {
        localStorage.setItem('editorContent', editor.value);
        const assets = {};
        AssetStore.assets.forEach((v, k) => assets[k] = v);
        localStorage.setItem('assetStore', JSON.stringify(assets));
        status.textContent = I18n.t('saved');
        status.style.opacity = "0.7";
    }, 1000);
}

function updateStats() {
    const text = editor.value;
    document.getElementById('stat-lines').textContent = text ? text.split('\n').length : 0;
    document.getElementById('stat-words').textContent = text ? text.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
    document.getElementById('stat-chars').textContent = text.length;
}

// Initialization
window.addEventListener('DOMContentLoaded', async () => {
    // Load data
    editor.value = localStorage.getItem('editorContent') || '';
    const savedAssets = localStorage.getItem('assetStore');
    if (savedAssets) {
        try {
            const parsed = JSON.parse(savedAssets);
            Object.entries(parsed).forEach(([id, data]) => {
                AssetStore.assets.set(id, data);
                const num = parseInt(id.replace('img-', ''));
                if (num >= AssetStore.nextId) AssetStore.nextId = num + 1;
            });
        } catch (e) {}
    }

    // Load Markdown Parser
    if (window.markdown) {
        AppState.markdownParser = await (window.markdown.ready || window.markdown);
    }

    // Settings
    CSSStore.load();
    await setTheme(AppState.theme);

    const lastCss = localStorage.getItem('customCss');
    if (lastCss) {
        applyCustomCss(lastCss);
        document.getElementById('custom-css-editor').value = lastCss;
    }

    const font = localStorage.getItem('previewFont');
    if (font) {
        document.getElementById('font-selector').value = font;
        document.documentElement.style.setProperty('--preview-font', font);
    }
    const fontSize = localStorage.getItem('previewFontSize');
    if (fontSize) {
        document.getElementById('font-size-input').value = fontSize;
        document.documentElement.style.setProperty('--preview-font-size', fontSize + 'px');
    }

    I18n.updateUI();

    // Listeners
    setupEventListeners();
});

function setupEventListeners() {
    editor.oninput = () => { debouncedUpdatePreview(); updateStats(); autoSave(); };

    // Formatting
    const fmt = { 'btn-bold':['**','**'], 'btn-italic':['*','*'], 'btn-header':['# ',''],
                  'btn-list':['- ',''], 'btn-link':['[','](url)'], 'btn-quote':['> ',''],
                  'btn-code':['`','`'], 'btn-hr':['\n---\n',''] };
    Object.entries(fmt).forEach(([id, [b, a]]) => document.getElementById(id).onclick = () => insertAtCursor(b, a));

    // View Modes
    document.getElementById('btn-view-doc').onclick = () => { AppState.viewMode = 'doc'; updatePreview(); };
    document.getElementById('btn-view-slide').onclick = () => { AppState.viewMode = 'slide'; updatePreview(); };
    document.getElementById('btn-view-board').onclick = () => { AppState.viewMode = 'board'; updatePreview(); };

    // UI Panels
    document.getElementById('btn-theme').onclick = () => setTheme(AppState.theme === 'dark' ? 'light' : 'dark');
    document.getElementById('btn-settings').onclick = () => document.getElementById('settings-panel').classList.remove('hidden');
    document.getElementById('btn-close-settings').onclick = () => document.getElementById('settings-panel').classList.add('hidden');
    document.getElementById('btn-help').onclick = () => document.getElementById('help-overlay').classList.remove('hidden');
    document.getElementById('btn-close-help').onclick = () => document.getElementById('help-overlay').classList.add('hidden');

    // Image Properties
    document.getElementById('prop-alt').oninput = syncProperties;
    document.getElementById('prop-width').oninput = (e) => {
        document.getElementById('width-val').textContent = e.target.value;
        syncProperties();
    };
    document.querySelectorAll('.prop-toggle-group button').forEach(btn => btn.onclick = () => {
        document.querySelectorAll('.prop-toggle-group button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        syncProperties();
    });

    // Presets
    document.getElementById('mermaid-presets').onchange = (e) => {
        if (e.target.value) {
            insertAtCursor(`\n\`\`\`mermaid\n${mermaidTemplates[e.target.value]}\n\`\`\`\n`);
            e.target.value = "";
        }
    };
    document.getElementById('md-presets').onchange = (e) => {
        if (e.target.value) {
            insertAtCursor(markdownTemplates[e.target.value]);
            e.target.value = "";
        }
    };
    document.getElementById('slide-layouts').onchange = (e) => {
        if (e.target.value) {
            insertAtCursor(slideLayouts[e.target.value] + "\n\n---\n\n");
            e.target.value = "";
        }
    };
    document.getElementById('pres-templates').onchange = (e) => {
        if (e.target.value) {
            editor.value = presentationTemplates[e.target.value];
            updatePreview(); updateStats(); autoSave();
            e.target.value = "";
        }
    };

    // Exports
    document.getElementById('btn-print').onclick = () => window.print();
    document.getElementById('btn-export-portable').onclick = exportPortable;
    document.getElementById('btn-export-html').onclick = exportStandaloneHTML;
    document.getElementById('btn-export-images').onclick = exportSlidesAsImages;
    document.getElementById('btn-present').onclick = initPresentation;

    // Settings adjustments
    document.getElementById('lang-selector').onchange = (e) => I18n.setLang(e.target.value);
    document.getElementById('font-selector').onchange = (e) => {
        document.documentElement.style.setProperty('--preview-font', e.target.value);
        localStorage.setItem('previewFont', e.target.value);
        initMermaid().then(debouncedUpdatePreview);
    };
    document.getElementById('font-size-input').oninput = (e) => {
        document.documentElement.style.setProperty('--preview-font-size', e.target.value + 'px');
        localStorage.setItem('previewFontSize', e.target.value);
        initMermaid().then(debouncedUpdatePreview);
    };
    document.getElementById('css-presets').onchange = (e) => {
        const val = e.target.value;
        const css = val.startsWith('sys:') ? cssPresetStyles[val] : CSSStore.userPresets[val.replace('user:', '')];
        if (css) {
            document.getElementById('custom-css-editor').value = css;
            applyCustomCss(css);
            localStorage.setItem('lastCssPreset', val);
        }
    };
    document.getElementById('btn-save-preset').onclick = () => {
        const name = document.getElementById('preset-name').value.trim();
        if (!name) return alert(I18n.t('preset_name_empty'));
        CSSStore.save(name, document.getElementById('custom-css-editor').value);
        document.getElementById('css-presets').value = `user:${name}`;
    };
    document.getElementById('btn-delete-preset').onclick = () => {
        const val = document.getElementById('css-presets').value;
        if (!val.startsWith('user:')) return alert(I18n.t('sys_preset_no_delete'));
        if (confirm(I18n.t('delete_preset_confirm').replace('{name}', val.replace('user:', '')))) {
            CSSStore.delete(val.replace('user:', ''));
            document.getElementById('css-presets').value = "sys:technical";
            document.getElementById('css-presets').dispatchEvent(new Event('change'));
        }
    };
    document.getElementById('custom-css-editor').oninput = (e) => applyCustomCss(e.target.value);
    document.getElementById('print-layout-selector').onchange = (e) => {
        localStorage.setItem('printLayout', e.target.value);
        updatePreview();
    };
    document.getElementById('btn-toc').onclick = createTOC;

    // Paste handler for Document mode
    editor.onpaste = (e) => {
        if (AppState.viewMode === 'doc') {
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            if (pastedText) {
                e.preventDefault();

                // Smart single-newline to double-newline converter
                // We want to avoid double-spacing things that shouldn't be:
                // - Lines inside code blocks (```...```)
                // - List items (- , * , 1. )
                // - Blockquotes (> )
                // - Headers (# )

                let isCodeBlock = false;
                const lines = pastedText.split('\n');
                const formattedLines = [];

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const trimmedLine = line.trim();

                    if (trimmedLine.startsWith('```')) {
                        isCodeBlock = !isCodeBlock;
                        formattedLines.push(line);
                        continue;
                    }

                    formattedLines.push(line);

                    // If we are not at the last line, and we are not in a code block,
                    // and the current line is not empty, and the next line is not empty,
                    // and we're not dealing with lists, blockquotes, or headers.
                    if (i < lines.length - 1 && !isCodeBlock) {
                        const nextLine = lines[i + 1].trim();
                        const isEmpty = trimmedLine === '';
                        const nextIsEmpty = nextLine === '';

                        // Check if current or next line is a markdown element that shouldn't be separated
                        const isList = /^[*\-+] /.test(trimmedLine) || /^\d+\. /.test(trimmedLine);
                        const nextIsList = /^[*\-+] /.test(nextLine) || /^\d+\. /.test(nextLine);
                        const isQuote = /^>/.test(trimmedLine);
                        const nextIsQuote = /^>/.test(nextLine);
                        const isHeader = /^#+ /.test(trimmedLine);
                        const nextIsHeader = /^#+ /.test(nextLine);

                        // If it's a standard text line transitioning to another standard text line, add a gap.
                        if (!isEmpty && !nextIsEmpty) {
                            // Don't add gap if we are in the middle of a list or quote block
                            if ((isList && nextIsList) || (isQuote && nextIsQuote)) {
                                // Keep single newline
                            } else {
                                // Add an extra newline for a paragraph break
                                formattedLines.push('');
                            }
                        }
                    }
                }

                document.execCommand('insertText', false, formattedLines.join('\n'));
            }
        }
    };

    // Keydown enhancements
    editor.onkeydown = (e) => {
        if (e.key === 'Tab') { e.preventDefault(); insertAtCursor('    '); }
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'b') { e.preventDefault(); insertAtCursor('**', '**'); }
            if (e.key === 'i') { e.preventDefault(); insertAtCursor('*', '*'); }
            if (e.key === 's') { e.preventDefault(); window.print(); }
        }
        const pairs = { '"':'"', "'":"'", '(':')', '[':']', '{':'}', '`':'`' };
        if (pairs[e.key] && editor.selectionStart !== editor.selectionEnd) {
            e.preventDefault(); insertAtCursor(e.key, pairs[e.key]);
        }
    };

    // Scroll sync
    editor.onscroll = () => {
        if (AppState.isScrolling) return AppState.isScrolling = false;
        AppState.isScrolling = true;
        const pc = document.getElementById('preview-container');
        pc.scrollTop = (editor.scrollTop / (editor.scrollHeight - editor.clientHeight)) * (pc.scrollHeight - pc.clientHeight);
    };
    document.getElementById('preview-container').onscroll = (e) => {
        if (AppState.isScrolling) return AppState.isScrolling = false;
        AppState.isScrolling = true;
        editor.scrollTop = (e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight)) * (editor.scrollHeight - editor.clientHeight);
    };

    // Drag and Drop
    const prevent = (e) => { e.preventDefault(); e.stopPropagation(); };
    [editor, preview].forEach(el => {
        el.ondragover = (e) => { prevent(e); el.classList.add('drag-active'); };
        el.ondragleave = () => el.classList.remove('drag-active');
        el.ondrop = handleDrop;
    });

    // Universal Dropdown
    document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
        trigger.onclick = (e) => {
            prevent(e);
            const content = trigger.nextElementSibling;
            document.querySelectorAll('.dropdown-content').forEach(c => { if (c !== content) c.classList.add('hidden'); });
            content.classList.toggle('hidden');
        };
    });
    window.onclick = (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-content').forEach(c => c.classList.add('hidden'));
        }
        if (e.target.closest('.dropdown-content button:not(.no-close)')) {
             e.target.closest('.dropdown-content').classList.add('hidden');
        }
    };
}

/**
 * EXPORT & SPECIAL FUNCTIONS
 */
function createTOC() {
    const lines = editor.value.split('\n');
    let toc = `\n## ${I18n.t('toc_title')}\n\n`, count = 0;
    lines.forEach(line => {
        const match = line.match(/^(#{2,4})\s+(.+)$/);
        if (match) {
            const title = match[2];
            const anchor = title.toLowerCase().replace(/[^\w\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]+/g, '-');
            toc += "  ".repeat(match[1].length - 2) + `- [${title}](#${anchor})\n`;
            count++;
        }
    });
    if (count > 0) insertAtCursor(toc + "\n");
    else alert(I18n.t('toc_error'));
}

function handleDrop(e) {
    e.preventDefault(); e.stopPropagation();
    this.classList.remove('drag-active');
    Array.from(e.dataTransfer.files).forEach(file => {
        const reader = new FileReader();
        if (file.type.startsWith('image/')) {
            reader.onload = (ev) => insertAtCursor(`\n![${file.name}|w=300|a=left](asset:${AssetStore.add(ev.target.result)})\n`);
            reader.readAsDataURL(file);
        } else if (file.name.endsWith('.md')) {
            reader.onload = (ev) => { editor.value = ev.target.result; debouncedUpdatePreview(); updateStats(); autoSave(); };
            reader.readAsText(file);
        }
    });
}

function exportPortable() {
    let content = editor.value, refs = "\n\n<!-- ASSETS -->\n";
    AssetStore.assets.forEach((data, id) => {
        if (content.includes(`(asset:${id})`)) {
            refs += `[${id}]: ${data}\n`;
            content = content.replace(new RegExp(`\\(asset:${id}\\)`, 'g'), `[${id}]`);
        }
    });
    downloadBlob(content + refs, 'document_portable.md', 'text/markdown');
}

function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

// Reuse presentation logic but cleaned up
let presentationState = { currentSlide: 0, slides: [] };

function initPresentation() {
    const container = document.getElementById('slide-container');
    container.innerHTML = '';
    const cards = preview.querySelectorAll('.slide-card');
    const htmls = cards.length > 0 ? Array.from(cards).map(c => c.querySelector('.markdown-body').innerHTML) : preview.innerHTML.split(/<hr[^>]*>/i);

    presentationState.slides = htmls.map(html => {
        const div = document.createElement('div'); div.className = 'slide';
        const inner = document.createElement('div'); inner.className = 'slide-content markdown-body';
        inner.innerHTML = html; div.appendChild(inner); container.appendChild(div);
        return div;
    });
    showSlide(0);
    document.getElementById('presentation-overlay').classList.remove('hidden');
    if (document.getElementById('presentation-overlay').requestFullscreen) document.getElementById('presentation-overlay').requestFullscreen().catch(() => {});
}

function showSlide(index) {
    if (index < 0 || index >= presentationState.slides.length) return;
    presentationState.slides.forEach(s => s.classList.remove('active'));
    presentationState.slides[index].classList.add('active');
    presentationState.currentSlide = index;
    document.getElementById('slide-number').textContent = `${index + 1} / ${presentationState.slides.length}`;
}

// Keyboard for presentation
window.onkeydown = (e) => {
    const overlay = document.getElementById('presentation-overlay');
    if (overlay.classList.contains('hidden')) return;
    if (e.key === 'ArrowRight' || e.key === ' ') showSlide(presentationState.currentSlide + 1);
    if (e.key === 'ArrowLeft') showSlide(presentationState.currentSlide - 1);
    if (e.key === 'Escape') {
        overlay.classList.add('hidden');
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
};

document.getElementById('btn-prev-slide').onclick = () => showSlide(presentationState.currentSlide - 1);
document.getElementById('btn-next-slide').onclick = () => showSlide(presentationState.currentSlide + 1);
document.getElementById('btn-exit-present').onclick = () => {
    document.getElementById('presentation-overlay').classList.add('hidden');
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
};

async function exportStandaloneHTML() {
    const title = "TECH-MD: " + (document.querySelector('h1')?.textContent || "Document");
    const css = Array.from(document.styleSheets).map(s => { try { return Array.from(s.cssRules).map(r => r.cssText).join('\n'); } catch(e) { return ''; }}).join('\n') + '\n' + document.getElementById('user-custom-css').textContent;
    const body = preview.innerHTML;
    const overlay = document.getElementById('presentation-overlay').outerHTML;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>${css}</style><style>body{margin:0;padding:0;background:var(--bg-color);color:var(--text-color);font-family:var(--preview-font);}#standalone-preview{padding:40px;max-width:1000px;margin:0 auto;}.export-toolbar{position:fixed;top:10px;right:10px;z-index:2000;display:flex;gap:10px;}.export-toolbar button{background:#333;color:#fff;border:1px solid #555;padding:5px 15px;cursor:pointer;}</style></head>
    <body class="${document.body.className}"><div class="export-toolbar"><button onclick="window.print()">PDF出力</button><button onclick="initStandalonePresentation()">プレゼン開始</button></div>
    <div id="standalone-preview" class="markdown-body">${body}</div>${overlay}
    <script>let cur=0,slds=[];function show(i){if(i<0||i>=slds.length)return;slds.forEach(s=>s.classList.remove('active'));slds[i].classList.add('active');cur=i;document.getElementById('slide-number').textContent=(i+1)+' / '+slds.length;}
    function initStandalonePresentation(){const p=document.getElementById('standalone-preview');const c=p.querySelectorAll('.slide-card');const h=c.length>0?Array.from(c).map(x=>x.querySelector('.markdown-body').innerHTML):p.innerHTML.split(/<hr[^>]*>/i);const cnt=document.getElementById('slide-container');cnt.innerHTML='';slds=h.map(x=>{const d=document.createElement('div');d.className='slide';const n=document.createElement('div');n.className='slide-content markdown-body';n.innerHTML=x;d.appendChild(n);cnt.appendChild(d);return d;});show(0);document.getElementById('presentation-overlay').classList.remove('hidden');}
    document.getElementById('btn-exit-present').onclick=()=>document.getElementById('presentation-overlay').classList.add('hidden');
    document.getElementById('btn-next-slide').onclick=()=>show(cur+1);document.getElementById('btn-prev-slide').onclick=()=>show(cur-1);
    window.onkeydown=(e)=>{if(document.getElementById('presentation-overlay').classList.contains('hidden'))return;if(e.key==='ArrowRight'||e.key===' ')show(cur+1);if(e.key==='ArrowLeft')show(cur-1);if(e.key==='Escape')document.getElementById('presentation-overlay').classList.add('hidden');};<\/script></body></html>`;
    downloadBlob(html, 'presentation_export.html', 'text/html');
}

async function exportSlidesAsImages() {
    if (!AppState.markdownParser) return alert(I18n.t('editor_not_ready'));
    const status = document.getElementById('save-status');
    const original = status.textContent;
    status.textContent = "画像生成中..."; status.style.opacity = "1";

    const container = document.createElement('div');
    container.style = 'position:fixed;top:0;left:-2000px;width:1920px;height:1080px;';
    container.className = 'slide-preview-mode ' + document.body.className;
    document.body.appendChild(container);
    const card = document.createElement('div'); card.className = 'slide-card'; card.style = 'width:100%;height:100%;margin:0;border:none;display:flex;align-items:center;justify-content:center;';
    const body = document.createElement('div'); body.className = 'markdown-body'; body.style.width = '100%';
    card.appendChild(body); container.appendChild(card);

    try {
        const zip = new JSZip(), imgFolder = zip.folder("slides");
        const slidesMd = editor.value.split(/\n\s*---\s*\n/);
        for (let i = 0; i < slidesMd.length; i++) {
            status.textContent = I18n.t('gen_images_progress').replace('{curr}', i + 1).replace('{total}', slidesMd.length);
            const html = AppState.markdownParser.parse(new TextEncoder().encode(preprocessMarkdown(slidesMd[i])));
            body.innerHTML = (html instanceof Uint8Array) ? new TextDecoder().decode(html) : html;
            const mermaidBlocks = body.querySelectorAll('pre > code.language-mermaid');
            for (let j = 0; j < mermaidBlocks.length; j++) {
                try {
                    const { svg } = await mermaid.render(`mermaid-export-${Date.now()}-${i}-${j}`, mermaidBlocks[j].textContent.trim());
                    const wrap = document.createElement('div'); wrap.className = 'mermaid-rendered'; wrap.innerHTML = svg;
                    mermaidBlocks[j].parentElement.style.display = 'none'; mermaidBlocks[j].parentElement.insertAdjacentElement('afterend', wrap);
                } catch(e) {}
            }
            await new Promise(r => setTimeout(r, 500));
            const dataUrl = await htmlToImage.toPng(card, { width: 1920, height: 1080, pixelRatio: 1, backgroundColor: getComputedStyle(document.body).backgroundColor });
            imgFolder.file(`slide_${String(i + 1).padStart(3, '0')}.png`, dataUrl.replace(/^data:image\/png;base64,/, ""), {base64: true});
        }
        const zipBlob = await zip.generateAsync({type:"blob"});
        downloadBlob(zipBlob, 'slides_images.zip', 'application/zip');
    } catch (err) { alert(I18n.t('export_failed') + "\n" + err.message); }
    finally { document.body.removeChild(container); status.textContent = original; status.style.opacity = "0.7"; }
}

window.AssetStore = AssetStore;
window.AppState = AppState;
