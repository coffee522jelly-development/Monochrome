// script.js
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
let markdownParser;
let mermaidCounter = 0;

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

const I18n = {
    lang: localStorage.getItem('lang') || (navigator.language.startsWith('ja') ? 'ja' : 'en'),
    t(key) {
        return translations[this.lang][key] || key;
    },
    setLang(lang) {
        this.lang = lang;
        localStorage.setItem('lang', lang);
        this.updateUI();
    },
    updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (el.tagName === 'INPUT' && el.type === 'text') {
                 el.placeholder = this.t(key);
            } else if (el.tagName === 'TEXTAREA') {
                 el.placeholder = this.t(key);
            } else {
                 // Check if it has an icon child
                 const icon = el.querySelector('i');
                 if (icon) {
                     // Keep icon, update text node
                     const textNode = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
                     if (textNode) {
                         textNode.textContent = ' ' + this.t(key);
                     } else {
                         el.appendChild(document.createTextNode(' ' + this.t(key)));
                     }
                 } else {
                     el.textContent = this.t(key);
                 }
            }
        });

        document.querySelectorAll('[data-i18n-label]').forEach(el => {
            el.label = this.t(el.getAttribute('data-i18n-label'));
        });

        // Update tooltips if needed
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = this.t(el.getAttribute('data-i18n-title'));
        });

        // Localize presets specifically if they have text
        document.getElementById('editor').placeholder = this.lang === 'ja' ? '入力を待機中...' : 'Waiting for input...';

        updateStats();
        updatePreview();
    }
};

// Asset Store for images
const AssetStore = {
    assets: new Map(),
    nextId: 1,
    add(base64) {
        const id = `img-${this.nextId++}`;
        this.assets.set(id, base64);
        return id;
    },
    get(id) {
        return this.assets.get(id);
    }
};

// Initialize Mermaid
async function initMermaid() {
    if (typeof mermaid === 'undefined') return;
    const isDark = document.body.classList.contains('dark-mode') || !document.body.classList.contains('light-mode');

    // Get current preview settings
    const font = getComputedStyle(document.documentElement).getPropertyValue('--preview-font').trim().replace(/['"]/g, '') || 'monospace';
    const fontSize = getComputedStyle(document.documentElement).getPropertyValue('--preview-font-size').trim() || '14px';

    mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: font,
        fontSize: parseInt(fontSize),
        themeVariables: {
            fontFamily: font,
            fontSize: fontSize
        }
    });
}

// Pre-process Markdown for assets
function preprocessMarkdown(text) {
    // Regex to match ![alt|w=...|a=...](asset:id)
    const assetRegex = /!\[([^\]|]*)(\|[^\]]*)?\]\(asset:([^)]+)\)/g;

    return text.replace(assetRegex, (match, alt, params, id) => {
        const base64 = AssetStore.get(id);
        if (!base64) return match;

        let width = "";
        let align = "left";

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

// View Mode
let currentViewMode = 'doc'; // 'doc', 'slide', or 'board'

// Update preview function
async function updatePreview() {
    if (!markdownParser) return;

    document.body.classList.toggle('slide-preview-mode', currentViewMode === 'slide');
    document.body.classList.toggle('board-preview-mode', currentViewMode === 'board');

    const content = editor.value;
    if (!content) {
        preview.innerHTML = '';
        return;
    }

    try {
        const processedContent = preprocessMarkdown(content);
        const encoder = new TextEncoder();
        const contentBytes = encoder.encode(processedContent);
        const output = markdownParser.parse(contentBytes);

        let html = (output instanceof Uint8Array)
            ? new TextDecoder().decode(output)
            : output;

        if (currentViewMode === 'slide') {
            const slideHtmls = html.split(/<hr[^>]*>/i);
            html = slideHtmls.map((s, i) => `
                <div class="slide-card" data-slide-num="${i + 1}">
                    <div class="markdown-body">${s}</div>
                </div>
            `).join('');

            const printLayout = localStorage.getItem('printLayout') || '1-up';
            document.body.classList.toggle('print-2-up', printLayout === '2-up');
        } else if (currentViewMode === 'board') {
            const boardHtmls = html.split(/<hr[^>]*>/i);
            html = `
                <div class="board-grid">
                    ${boardHtmls.map((s, i) => `
                        <div class="board-card">
                            <div class="markdown-body">${s}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            document.body.classList.remove('print-2-up');
        } else {
            document.body.classList.remove('print-2-up');
        }

        preview.innerHTML = html;
        await renderMermaid();
        attachImageListeners();
    } catch (err) {
        console.error('Markdown parse error:', err);
    }
}

// Theme switching
const btnTheme = document.getElementById('btn-theme');
const themeIcon = btnTheme ? btnTheme.querySelector('i') : null;

async function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun', 'fa-adjust');
            themeIcon.classList.add('fa-moon');
        }
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon', 'fa-adjust');
            themeIcon.classList.add('fa-sun');
        }
    }
    localStorage.setItem('theme', theme);
    await initMermaid();
    await updatePreview();
}

// Load markdown-wasm
async function loadMarkdownWasm() {
    try {
        if (window['markdown'] && window['markdown'].ready) {
            markdownParser = await window['markdown'].ready;
            await updatePreview();
        } else if (window['markdown']) {
            markdownParser = window['markdown'];
            await updatePreview();
        }
    } catch (err) {
        console.error('Failed to load markdown-wasm:', err);
    }
}

// Init everything
const savedTheme = localStorage.getItem('theme') || 'dark';
const savedContent = localStorage.getItem('editorContent');
const savedAssets = localStorage.getItem('assetStore');

if (savedContent) {
    editor.value = savedContent;
}

if (savedAssets) {
    try {
        const parsed = JSON.parse(savedAssets);
        Object.entries(parsed).forEach(([id, data]) => {
            AssetStore.assets.set(id, data);
            const num = parseInt(id.replace('img-', ''));
            if (num >= AssetStore.nextId) AssetStore.nextId = num + 1;
        });
    } catch (e) { console.error("Asset restore error", e); }
}

initMermaid().then(() => {
    setTheme(savedTheme);
    loadMarkdownWasm();
    I18n.updateUI(); // Initial translation
});

if (btnTheme) {
    btnTheme.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('light-mode');
        setTheme(isDark ? 'light' : 'dark');
    });
}

// Throttle for Mermaid rendering
let renderTimeout;

async function renderMermaid() {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(async () => {
        const mermaidBlocks = preview.querySelectorAll('pre > code.language-mermaid');
        if (mermaidBlocks.length === 0) return;

        for (let i = 0; i < mermaidBlocks.length; i++) {
            const block = mermaidBlocks[i];
            const pre = block.parentElement;
            const code = block.textContent.trim();
            const id = `mermaid-svg-${Date.now()}-${mermaidCounter++}`;

            try {
                const nextEl = pre.nextElementSibling;
                if (nextEl && nextEl.classList.contains('mermaid-rendered')) {
                    nextEl.remove();
                }

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
                if (nextEl && nextEl.classList.contains('mermaid-error')) {
                    nextEl.remove();
                }
                const errorDiv = document.createElement('div');
                errorDiv.className = 'mermaid-error';
                errorDiv.textContent = 'ERR: ' + err.message;
                pre.insertAdjacentElement('afterend', errorDiv);
            }
        }
    }, 200);
}

// Image Selection & Sidebar Logic
let selectedAssetId = null;

function attachImageListeners() {
    const images = preview.querySelectorAll('img[data-asset-id]');
    images.forEach(img => {
        img.style.cursor = "pointer";
        if (img.getAttribute('data-asset-id') === selectedAssetId) {
            img.classList.add('selected-asset');
        }
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            selectImage(img);
        });
    });

    // Clear selection when clicking preview background
    preview.addEventListener('click', (e) => {
        if (e.target === preview) clearSelection();
    });
}

function selectImage(img) {
    selectedAssetId = img.getAttribute('data-asset-id');

    // UI Update
    preview.querySelectorAll('img').forEach(i => i.classList.remove('selected-asset'));
    img.classList.add('selected-asset');

    document.getElementById('no-selection-msg').classList.add('hidden');
    document.getElementById('image-properties').classList.remove('hidden');

    // Populate Sidebar
    const altInput = document.getElementById('prop-alt');
    const widthInput = document.getElementById('prop-width');
    const widthDisplay = document.getElementById('width-val');
    const idDisplay = document.getElementById('prop-id');

    altInput.value = img.alt || "";
    const currentWidth = img.getAttribute('width') || img.naturalWidth || 300;
    widthInput.value = currentWidth;
    widthDisplay.textContent = currentWidth;
    idDisplay.textContent = selectedAssetId;

    const currentAlign = img.style.marginLeft === "auto" ? (img.style.marginRight === "auto" ? "center" : "right") : "left";
    document.querySelectorAll('.prop-toggle-group button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-align') === currentAlign);
    });
}

function clearSelection() {
    selectedAssetId = null;
    preview.querySelectorAll('img').forEach(i => i.classList.remove('selected-asset'));
    document.getElementById('no-selection-msg').classList.remove('hidden');
    document.getElementById('image-properties').classList.add('hidden');
}

// Sidebar Event Listeners
const propAlt = document.getElementById('prop-alt');
const propWidth = document.getElementById('prop-width');

if (propAlt) {
    propAlt.addEventListener('input', () => syncProperties());
}

if (propWidth) {
    propWidth.addEventListener('input', (e) => {
        document.getElementById('width-val').textContent = e.target.value;
        syncProperties();
    });
}

document.querySelectorAll('.prop-toggle-group button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.prop-toggle-group button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        syncProperties();
    });
});

function syncProperties() {
    if (!selectedAssetId) return;

    const alt = document.getElementById('prop-alt').value;
    const width = document.getElementById('prop-width').value;
    const align = document.querySelector('.prop-toggle-group button.active').getAttribute('data-align');

    const text = editor.value;
    const regex = new RegExp(`!\\[([^\\]|]*)(\\|[^\\]]*)?\\]\\(asset:${selectedAssetId}\\)`, 'g');

    // Find the first match to replace via execCommand to maintain undo history
    const match = regex.exec(text);
    if (match) {
        const start = match.index;
        const end = start + match[0].length;
        const replacement = `![${alt}|w=${width}|a=${align}](asset:${selectedAssetId})`;

        if (match[0] !== replacement) {
            const savedStart = editor.selectionStart;
            const savedEnd = editor.selectionEnd;

            editor.focus();
            editor.setSelectionRange(start, end);

            try {
                if (!document.execCommand('insertText', false, replacement)) {
                    editor.value = text.substring(0, start) + replacement + text.substring(end);
                    editor.setSelectionRange(savedStart, savedEnd);
                } else {
                    // Try to restore previous selection if it wasn't the image tag
                    if (savedStart > end) {
                        const offset = replacement.length - match[0].length;
                        editor.setSelectionRange(savedStart + offset, savedEnd + offset);
                    } else if (savedStart < start) {
                        editor.setSelectionRange(savedStart, savedEnd);
                    }
                }
            } catch (e) {
                editor.value = text.substring(0, start) + replacement + text.substring(end);
            }
            updatePreview();
        }
    }
}

// Helper to insert text at cursor (supporting Undo/Redo)
function insertAtCursor(before, after = '') {
    editor.focus();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selection = text.substring(start, end);
    const replacement = before + selection + after;

    // Use execCommand to preserve Undo stack
    try {
        if (!document.execCommand('insertText', false, replacement)) {
            // Fallback for browsers that don't support insertText in textarea
            editor.value = text.substring(0, start) + replacement + text.substring(end);
            editor.setSelectionRange(start + replacement.length, start + replacement.length);
        } else {
            // Adjust cursor position if wrapping selection (e.g. bolding)
            if (after.length > 0 && selection.length > 0) {
                // If it was a wrapping operation, the cursor usually ends up at the end of 'after'.
                // If there was no selection, we might want it in between, but for presets, end is fine.
            }
        }
    } catch (e) {
        editor.value = text.substring(0, start) + replacement + text.substring(end);
    }

    updatePreview();
}

// Formatting buttons
const btnMap = {
    'btn-bold': ['**', '**'],
    'btn-italic': ['*', '*'],
    'btn-header': ['# ', ''],
    'btn-list': ['- ', ''],
    'btn-link': ['[', '](url)'],
    'btn-quote': ['> ', ''],
    'btn-code': ['`', '`'],
    'btn-hr': ['\n---\n', '']
};

Object.entries(btnMap).forEach(([id, [before, after]]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => insertAtCursor(before, after));
});

// Settings panel
const settingsPanel = document.getElementById('settings-panel');
const btnSettings = document.getElementById('btn-settings');
const btnCloseSettings = document.getElementById('btn-close-settings');
const customCssEditor = document.getElementById('custom-css-editor');
const cssPresets = document.getElementById('css-presets');
const styleTag = document.getElementById('user-custom-css');

if (btnSettings) btnSettings.addEventListener('click', () => settingsPanel.classList.remove('hidden'));
if (btnCloseSettings) btnCloseSettings.addEventListener('click', () => settingsPanel.classList.add('hidden'));

if (settingsPanel) {
    settingsPanel.addEventListener('click', (e) => {
        if (e.target === settingsPanel) {
            settingsPanel.classList.add('hidden');
        }
    });
}

// CSS Preset Management
const cssPresetStyles = {
    'sys:technical': `/* TECHNICAL (CAD) */
.markdown-body {
    font-family: var(--preview-font);
    color: var(--text-color);
}
.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
    border-bottom: 1px solid var(--border-color);
    text-transform: uppercase;
    font-weight: normal;
    padding-bottom: 0.2em;
}
.markdown-body table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
}
.markdown-body table th, .markdown-body table td {
    border: 1px solid var(--border-color);
    padding: 8px;
    text-align: left;
}
.markdown-body table th {
    background-color: var(--toolbar-bg);
}
.markdown-body input[type="checkbox"] {
    accent-color: var(--btn-success-bg);
    margin-right: 8px;
}`,
    'sys:blueprint': `/* BLUEPRINT (ENGINEERING) */
.markdown-body {
    font-family: var(--preview-font);
    color: #a0c4ff;
    background-color: #001524;
}
.slide-card .markdown-body { background-color: transparent; }
.markdown-body h1, .markdown-body h2 {
    color: #fff;
    border-bottom: 2px solid #577590;
    font-style: italic;
}
.markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
    color: #90be6d;
}
.markdown-body table {
    border: 1px solid #577590;
}
.markdown-body table th {
    background-color: #577590;
    color: #fff;
}
.markdown-body input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: crosshair;
}`,
    'sys:paper': `/* DOCUMENT (REPORT) */
.markdown-body {
    font-family: var(--preview-font);
    color: #1a1a1a;
    background-color: #fdfdfd;
    padding: 40px !important;
    line-height: 1.8;
}
.slide-card .markdown-body { background-color: transparent; padding: 0 !important; }
.markdown-body h1 {
    text-align: center;
    border-bottom: 2px solid #000;
}
.markdown-body h2 {
    border-left: 5px solid #000;
    padding-left: 15px;
}
.markdown-body table {
    border-top: 2px solid #000;
    border-bottom: 2px solid #000;
}
.markdown-body table th {
    border-bottom: 1px solid #000;
}
.markdown-body input[type="checkbox"] {
    transform: scale(1.2);
    vertical-align: middle;
}`,
    'sys:minimal': `/* CLEAN MINIMAL */
.markdown-body {
    font-family: var(--preview-font);
    max-width: 800px;
    margin: 0 auto;
    color: #333;
    background: #fff;
    line-height: 2;
}
.slide-card .markdown-body { background-color: transparent; }
.markdown-body h1, .markdown-body h2 {
    font-weight: 300;
    border: none;
    text-align: center;
}
.markdown-body blockquote {
    border: none;
    font-style: italic;
    text-align: center;
    color: #999;
}`,
    'sys:terminal': `/* RETRO TERMINAL */
.markdown-body {
    font-family: var(--preview-font);
    background: #0a0a0a;
    color: #0f0;
    text-shadow: 0 0 5px #0f0;
}
.slide-card .markdown-body { background-color: transparent; }
.markdown-body h1, .markdown-body h2 {
    color: #0f0;
    border-color: #0f0;
    text-transform: uppercase;
}
.markdown-body code {
    background: #000;
    color: #0f0;
    border: 1px solid #0f0;
}`,
    'sys:cyberpunk': `/* NEON CYBERPUNK */
.markdown-body {
    font-family: var(--preview-font);
    background: #0d0221;
    color: #00ffcc;
}
.slide-card .markdown-body { background-color: transparent; }
.markdown-body h1 {
    color: #ff00ff;
    text-shadow: 2px 2px #00ffff;
    border-bottom: 3px double #ff00ff;
}
.markdown-body blockquote {
    background: #1a1a2e;
    border-left: 5px solid #e94560;
    color: #e94560;
}`,
    'sys:solarized': `/* SOLARIZED DARK */
.markdown-body {
    font-family: var(--preview-font);
    background: #002b36;
    color: #839496;
}
.slide-card .markdown-body { background-color: transparent; }
.markdown-body h1, .markdown-body h2 {
    color: #268bd2;
    border-bottom-color: #586e75;
}
.markdown-body a { color: #2aa198; }
.markdown-body code { background: #073642; }`,
    'sys:academia': `/* DARK ACADEMIA */
.markdown-body {
    font-family: var(--preview-font);
    background: #1c1917;
    color: #d6d3d1;
    line-height: 1.8;
}
.slide-card .markdown-body { background-color: transparent; }
.markdown-body h1, .markdown-body h2 {
    font-family: serif;
    color: #a8a29e;
    border-bottom-color: #444;
}
.markdown-body blockquote {
    border-color: #78716c;
    font-style: italic;
}`,
    'sys:neon': `/* NEON NIGHT */
.markdown-body {
    font-family: var(--preview-font);
    background: #000;
    color: #fff;
}
.slide-card .markdown-body { background-color: transparent; }
.markdown-body h1 {
    color: #fff;
    text-shadow: 0 0 10px #fff, 0 0 20px #f0f, 0 0 30px #f0f;
}
.markdown-body a {
    color: #0ff;
    text-shadow: 0 0 5px #0ff;
}`,
    'sys:contrast': `/* HIGH CONTRAST */
.markdown-body {
    font-family: var(--preview-font);
    background: #fff;
    color: #000;
    font-weight: bold;
}
.slide-card .markdown-body { background-color: transparent; }
.markdown-body h1, .markdown-body h2 {
    background: #000;
    color: #fff;
    padding: 10px;
}
.markdown-body table, .markdown-body th, .markdown-body td {
    border: 2px solid #000;
}`
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
        // Clear user-defined options (anything after the disabled separator)
        let foundSeparator = false;
        Array.from(dropdown.options).forEach(opt => {
            if (opt.disabled && opt.textContent.includes('ユーザー定義')) {
                foundSeparator = true;
                return;
            }
            if (foundSeparator) dropdown.removeChild(opt);
        });

        // Add user presets
        Object.keys(this.userPresets).forEach(name => {
            const opt = document.createElement('option');
            opt.value = `user:${name}`;
            opt.textContent = name;
            dropdown.appendChild(opt);
        });
    }
};

function applyCustomCss(css) {
    styleTag.textContent = css;
    localStorage.setItem('customCss', css);
}

if (customCssEditor) {
    customCssEditor.addEventListener('input', (e) => {
        applyCustomCss(e.target.value);
    });
}

if (cssPresets) {
    cssPresets.addEventListener('change', (e) => {
        const val = e.target.value;
        let css = "";
        if (val.startsWith('sys:')) {
            css = cssPresetStyles[val];
        } else if (val.startsWith('user:')) {
            const name = val.replace('user:', '');
            css = CSSStore.userPresets[name];
        }

        if (css) {
            customCssEditor.value = css;
            applyCustomCss(css);
            localStorage.setItem('lastCssPreset', val);
        }
    });
}

const btnSaveCss = document.getElementById('btn-save-preset');
if (btnSaveCss) {
    btnSaveCss.addEventListener('click', () => {
        const name = document.getElementById('preset-name').value.trim();
        if (!name) { alert(I18n.t('preset_name_empty')); return; }
        const css = customCssEditor.value;
        CSSStore.save(name, css);
        document.getElementById('css-presets').value = `user:${name}`;
        localStorage.setItem('lastCssPreset', `user:${name}`);
        // No alert needed for simple save
    });
}

const btnDeleteCss = document.getElementById('btn-delete-preset');
if (btnDeleteCss) {
    btnDeleteCss.addEventListener('click', () => {
        const val = document.getElementById('css-presets').value;
        if (!val.startsWith('user:')) { alert(I18n.t('sys_preset_no_delete')); return; }
        const name = val.replace('user:', '');
        if (confirm(I18n.t('delete_preset_confirm').replace('{name}', name))) {
            CSSStore.delete(name);
            document.getElementById('css-presets').value = "sys:technical";
            document.getElementById('css-presets').dispatchEvent(new Event('change'));
        }
    });
}

// Font selection & size logic
const fontSelector = document.getElementById('font-selector');
const fontSizeInput = document.getElementById('font-size-input');

if (fontSelector) {
    fontSelector.addEventListener('change', (e) => {
        const font = e.target.value;
        document.documentElement.style.setProperty('--preview-font', font);
        localStorage.setItem('previewFont', font);
        initMermaid().then(() => updatePreview());
    });
}

const printLayoutSelector = document.getElementById('print-layout-selector');
if (printLayoutSelector) {
    printLayoutSelector.addEventListener('change', (e) => {
        localStorage.setItem('printLayout', e.target.value);
        updatePreview();
    });
}

if (fontSizeInput) {
    fontSizeInput.addEventListener('input', (e) => {
        const size = e.target.value + "px";
        document.documentElement.style.setProperty('--preview-font-size', size);
        localStorage.setItem('previewFontSize', e.target.value);
        // Refresh mermaid to prevent text overflow in SVGs
        initMermaid().then(() => updatePreview());
    });
}

// Initial load
CSSStore.load();
const savedFont = localStorage.getItem('previewFont');
if (savedFont && fontSelector) {
    fontSelector.value = savedFont;
    document.documentElement.style.setProperty('--preview-font', savedFont);
}

const savedFontSize = localStorage.getItem('previewFontSize');
if (savedFontSize && fontSizeInput) {
    fontSizeInput.value = savedFontSize;
    document.documentElement.style.setProperty('--preview-font-size', savedFontSize + "px");
}

const savedPrintLayout = localStorage.getItem('printLayout');
if (savedPrintLayout && printLayoutSelector) {
    printLayoutSelector.value = savedPrintLayout;
}
const lastPreset = localStorage.getItem('lastCssPreset') || 'sys:technical';
const savedCss = localStorage.getItem('customCss');

if (savedCss) {
    customCssEditor.value = savedCss;
    applyCustomCss(savedCss);
    // Try to match dropdown to last preset
    if (document.querySelector(`#css-presets option[value="${lastPreset}"]`)) {
        document.getElementById('css-presets').value = lastPreset;
    }
} else {
    // Default to technical if no saved CSS
    document.getElementById('css-presets').value = 'sys:technical';
    document.getElementById('css-presets').dispatchEvent(new Event('change'));
}

// Mermaid templates (Localized)
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

const mermaidPresets = document.getElementById('mermaid-presets');
const mdPresets = document.getElementById('md-presets');

function handleMermaidSelection() {
    const preset = mermaidPresets.value;
    if (preset && mermaidTemplates[preset]) {
        const template = `\n\`\`\`mermaid\n${mermaidTemplates[preset]}\n\`\`\`\n`;
        insertAtCursor(template);
        mermaidPresets.value = "";
    }
}

function handleMdSelection() {
    const preset = mdPresets.value;
    if (preset && markdownTemplates[preset]) {
        insertAtCursor(markdownTemplates[preset]);
        mdPresets.value = "";
    }
}

if (mermaidPresets) mermaidPresets.addEventListener('change', handleMermaidSelection);
if (mdPresets) mdPresets.addEventListener('change', handleMdSelection);

const layoutPresets = document.getElementById('slide-layouts');
const structPresets = document.getElementById('pres-templates');

function handleLayoutSelection() {
    const val = layoutPresets.value;
    if (val && slideLayouts[val]) {
        insertAtCursor(slideLayouts[val] + "\n\n---\n\n");
        layoutPresets.value = "";
    }
}

function handleStructSelection() {
    const val = structPresets.value;
    if (val && presentationTemplates[val]) {
        editor.value = presentationTemplates[val];
        updatePreview();
        updateStats();
        autoSave();
        structPresets.value = "";
    }
}

if (layoutPresets) layoutPresets.addEventListener('change', handleLayoutSelection);
if (structPresets) structPresets.addEventListener('change', handleStructSelection);

// Markdown templates (Localized)
const slideLayouts = {
    l_title: "# プレゼンテーション・タイトル\n## サブタイトルまたは発表者名\n### 2024年X月X日",
    l_2col: "# 左右分割レイアウト\n\n<div class=\"grid-2-col\">\n<div>\n\n### 左カラム\n- 項目 A\n- 項目 B\n- 項目 C\n\n</div>\n<div>\n\n### 右カラム\n- 詳細 1\n- 詳細 2\n- 詳細 3\n\n</div>\n</div>",
    l_img_text: "# 画像と説明のレイアウト\n\n<div class=\"grid-2-col\">\n<div>\n\n![サンプル画像](https://via.placeholder.com/600x400)\n\n</div>\n<div>\n\n### 解説\nここに画像の詳しい説明や、注目すべきポイントを記述します。箇条書きも利用可能です。\n\n</div>\n</div>",
    l_focus_mermaid: "# 図面フォーカス・レイアウト\n\n```mermaid\ngraph TD\n    Start --> Process\n    Process --> End\n```\n\n> 上記の図は、主要なワークフローを示しています。",
    l_code: "# コード強調レイアウト\n\n```javascript\n// サンプルコード\nfunction helloWorld() {\n    console.log(\"Hello, CAD-MD!\");\n}\n```\n\n- 実装のポイント 1\n- 実装のポイント 2",
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
    t_case: "# 事例紹介: 株式会社A様\n---\n# 導入前の課題\n効率化が課題だった。\n---\n# 解決策\nCAD-MDエディターの導入。\n---\n# 導入後の効果\n生産性が50%向上。",
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

// Editor enhancements
editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        insertAtCursor('    ');
    }
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b') { e.preventDefault(); insertAtCursor('**', '**'); }
        else if (e.key === 'i') { e.preventDefault(); insertAtCursor('*', '*'); }
        else if (e.key === 's') { e.preventDefault(); document.getElementById('btn-print').click(); }
    }
});

// Portable Export (Embed Base64 at end of file)
const btnExportPortable = document.getElementById('btn-export-portable');
if (btnExportPortable) {
    btnExportPortable.addEventListener('click', () => {
        let content = editor.value;
        let references = "\n\n<!-- ASSETS -->\n";

        AssetStore.assets.forEach((data, id) => {
            if (content.includes(`(asset:${id})`)) {
                references += `[${id}]: ${data}\n`;
                // Convert internal asset:id to standard markdown reference [id]
                content = content.replace(new RegExp(`\\(asset:${id}\\)`, 'g'), `[${id}]`);
            }
        });

        const blob = new Blob([content + references], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document_portable.md';
        a.click();
        URL.revokeObjectURL(url);
    });
}


// Scroll sync
let isScrolling = false;
editor.addEventListener('scroll', () => {
    if (isScrolling) { isScrolling = false; return; }
    isScrolling = true;
    const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
    const pc = document.getElementById('preview-container');
    pc.scrollTop = scrollPercentage * (pc.scrollHeight - pc.clientHeight);
});

document.getElementById('preview-container').addEventListener('scroll', (e) => {
    if (isScrolling) { isScrolling = false; return; }
    isScrolling = true;
    const pc = e.target;
    const scrollPercentage = pc.scrollTop / (pc.scrollHeight - pc.clientHeight);
    editor.scrollTop = scrollPercentage * (editor.scrollHeight - editor.clientHeight);
});

editor.addEventListener('input', () => {
    updatePreview();
    updateStats();
    autoSave();
});

// Auto-save logic
let saveTimeout;
function autoSave() {
    const saveStatus = document.getElementById('save-status');
    saveStatus.textContent = I18n.t('saving');
    saveStatus.style.opacity = "1";

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        localStorage.setItem('editorContent', editor.value);
        const assetObj = {};
        AssetStore.assets.forEach((v, k) => assetObj[k] = v);
        localStorage.setItem('assetStore', JSON.stringify(assetObj));

        saveStatus.textContent = I18n.t('saved');
        saveStatus.style.opacity = "0.7";
    }, 1000);
}

// Stats logic
function updateStats() {
    const text = editor.value;
    const lines = text ? text.split('\n').length : 0;
    const words = text ? text.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
    const chars = text.length;

    document.getElementById('stat-lines').textContent = lines;
    document.getElementById('stat-words').textContent = words;
    document.getElementById('stat-chars').textContent = chars;
}

// TOC logic
const btnToc = document.getElementById('btn-toc');
if (btnToc) {
    btnToc.addEventListener('click', () => {
        const text = editor.value;
        const lines = text.split('\n');
        let toc = `\n## ${I18n.t('toc_title')}\n\n`;
        let count = 0;

        lines.forEach(line => {
            const match = line.match(/^(#{2,4})\s+(.+)$/);
            if (match) {
                const level = match[1].length - 2;
                const title = match[2];
                const anchor = title.toLowerCase().replace(/[^\w\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]+/g, '-');
                toc += "  ".repeat(level) + `- [${title}](#${anchor})\n`;
                count++;
            }
        });

        if (count > 0) {
            insertAtCursor(toc + "\n");
        } else {
            alert(I18n.t('toc_error'));
        }
    });
}

// Universal Dropdown Logic
const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const content = dropdown.querySelector('.dropdown-content');

    if (trigger && content) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other dropdowns first
            document.querySelectorAll('.dropdown-content').forEach(c => {
                if (c !== content) c.classList.add('hidden');
            });
            content.classList.toggle('hidden');
        });
    }
});

// Close all dropdowns on click outside or click on a button inside
window.addEventListener('click', (e) => {
    document.querySelectorAll('.dropdown-content').forEach(content => {
        if (!content.contains(e.target)) {
            content.classList.add('hidden');
        }
    });
});

document.querySelectorAll('.dropdown-content button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Don't close if clicking a sub-group or select inside
        if (e.target.tagName !== 'SELECT') {
            btn.closest('.dropdown-content').classList.add('hidden');
        }
    });
});

// Print logic
const btnPrint = document.getElementById('btn-print');
if (btnPrint) {
    btnPrint.addEventListener('click', () => {
        window.print();
    });
}

// Help Overlay logic
const btnHelp = document.getElementById('btn-help');
const helpOverlay = document.getElementById('help-overlay');
const btnCloseHelp = document.getElementById('btn-close-help');

if (btnHelp) btnHelp.addEventListener('click', () => helpOverlay.classList.remove('hidden'));
if (btnCloseHelp) btnCloseHelp.addEventListener('click', () => helpOverlay.classList.add('hidden'));
if (helpOverlay) {
    helpOverlay.addEventListener('click', (e) => {
        if (e.target === helpOverlay) helpOverlay.classList.add('hidden');
    });
}

// Image drag and drop
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    editor.classList.remove('drag-active');
    preview.classList.remove('drag-active');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64Data = event.target.result;
                    const id = AssetStore.add(base64Data);
                    const imageMarkdown = `\n![${file.name}|w=300|a=left](asset:${id})\n`;
                    insertAtCursor(imageMarkdown);
                };
                reader.readAsDataURL(file);
            } else if (file.name.endsWith('.md')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    editor.value = event.target.result;
                    updatePreview();
                    updateStats();
                    autoSave();
                };
                reader.readAsText(file);
            }
        });
    }
}

// Auto-pairing
const pairs = {
    '"': '"',
    "'": "'",
    '(': ')',
    '[': ']',
    '{': '}',
    '`': '`'
};

editor.addEventListener('keydown', (e) => {
    if (pairs[e.key]) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        if (start !== end) {
            e.preventDefault();
            const selection = editor.value.substring(start, end);
            insertAtCursor(e.key, pairs[e.key]);
        }
    }
});

editor.addEventListener('dragover', (e) => { e.preventDefault(); editor.classList.add('drag-active'); });
editor.addEventListener('dragleave', () => { editor.classList.remove('drag-active'); });
editor.addEventListener('drop', handleDrop);

preview.addEventListener('dragover', (e) => { e.preventDefault(); preview.classList.add('drag-active'); });
preview.addEventListener('dragleave', () => { preview.classList.remove('drag-active'); });
preview.addEventListener('drop', handleDrop);

// Presentation Mode Logic
let currentSlideIndex = 0;
let slides = [];

const presentationOverlay = document.getElementById('presentation-overlay');
const slideContainer = document.getElementById('slide-container');
const slideNumber = document.getElementById('slide-number');

function initPresentation() {
    slideContainer.innerHTML = '';
    slides = [];

    // Check if we already have slide cards (from Slide View)
    const cards = preview.querySelectorAll('.slide-card');
    let slideHtmls = [];

    if (cards.length > 0) {
        slideHtmls = Array.from(cards).map(card => card.querySelector('.markdown-body').innerHTML);
    } else {
        // Fallback to splitting by HR if in Document View
        const content = preview.innerHTML;
        slideHtmls = content.split(/<hr[^>]*>/i);
    }

    slideHtmls.forEach((html, index) => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        const inner = document.createElement('div');
        inner.className = 'slide-content markdown-body';
        inner.innerHTML = html;
        slide.appendChild(inner);
        slideContainer.appendChild(slide);
        slides.push(slide);
    });

    currentSlideIndex = 0;
    showSlide(0);
    presentationOverlay.classList.remove('hidden');

    // Request fullscreen
    if (presentationOverlay.requestFullscreen) {
        presentationOverlay.requestFullscreen().catch(() => {});
    }
}

function showSlide(index) {
    if (index < 0 || index >= slides.length) return;

    slides.forEach(s => s.classList.remove('active'));
    slides[index].classList.add('active');
    currentSlideIndex = index;
    slideNumber.textContent = `${index + 1} / ${slides.length}`;
}

function nextSlide() { if (currentSlideIndex < slides.length - 1) showSlide(currentSlideIndex + 1); }
function prevSlide() { if (currentSlideIndex > 0) showSlide(currentSlideIndex - 1); }

function exitPresentation() {
    presentationOverlay.classList.add('hidden');
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
}

document.getElementById('btn-present').addEventListener('click', initPresentation);
document.getElementById('btn-exit-present').addEventListener('click', exitPresentation);
document.getElementById('btn-next-slide').addEventListener('click', nextSlide);
document.getElementById('btn-prev-slide').addEventListener('click', prevSlide);

window.addEventListener('keydown', (e) => {
    if (presentationOverlay.classList.contains('hidden')) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            initPresentation();
        }
        return;
    }

    if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'Escape') exitPresentation();
});

// Single HTML Export
async function exportStandaloneHTML() {
    const title = "CAD-MD Presentation: " + (document.querySelector('h1')?.textContent || "Document");
    const css = Array.from(document.styleSheets)
        .map(sheet => {
            try { return Array.from(sheet.cssRules).map(r => r.cssText).join('\n'); }
            catch(e) { return ''; }
        }).join('\n') + '\n' + styleTag.textContent;

    // Bundle assets into the HTML directly by replacing internal links
    let bodyHtml = preview.innerHTML;
    // We need to ensure we have the presentation overlay logic too
    const overlayHtml = presentationOverlay.outerHTML.replace('hidden', 'hidden');

    const fullHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Courier+Prime&family=Fira+Code&family=IBM+Plex+Mono&family=Inter:wght@400;700&family=JetBrains+Mono:wght@400;700&family=Lato&family=Lora&family=Merriweather&family=Noto+Sans+JP:wght@400;700&family=Open+Sans&family=PT+Serif&family=Playfair+Display&family=Press+Start+2P&family=Roboto+Mono&family=Roboto:wght@400;700&family=Space+Mono&display=swap" rel="stylesheet">
    <style>${css}</style>
    <style>
        body { margin: 0; padding: 0; background: var(--bg-color); color: var(--text-color); font-family: var(--preview-font); }
        #standalone-preview { padding: 40px; max-width: 1000px; margin: 0 auto; }
        .export-toolbar { position: fixed; top: 10px; right: 10px; z-index: 2000; display: flex; gap: 10px; }
        .export-toolbar button { background: var(--toolbar-bg, #333); color: #fff; border: 1px solid #555; padding: 5px 15px; cursor: pointer; }
    </style>
</head>
<body class="${document.body.className}">
    <div class="export-toolbar">
        <button onclick="window.print()">PDF出力</button>
        <button onclick="initStandalonePresentation()">プレゼン開始</button>
    </div>
    <div id="standalone-preview" class="markdown-body">${bodyHtml}</div>
    ${overlayHtml}

    <script>
        // Standalone presentation logic
        let currentSlideIndex = 0;
        let slides = [];
        const presentationOverlay = document.getElementById('presentation-overlay');
        const slideContainer = document.getElementById('slide-container');
        const slideNumber = document.getElementById('slide-number');

        function initStandalonePresentation() {
            const previewEl = document.getElementById('standalone-preview');
            const cards = previewEl.querySelectorAll('.slide-card');
            let slideHtmls = [];

            if (cards.length > 0) {
                slideHtmls = Array.from(cards).map(card => card.querySelector('.markdown-body').innerHTML);
            } else {
                const content = previewEl.innerHTML;
                slideHtmls = content.split(/<hr[^>]*>/i);
            }

            slideContainer.innerHTML = '';
            slides = [];
            slideHtmls.forEach((html) => {
                const slide = document.createElement('div');
                slide.className = 'slide';
                const inner = document.createElement('div');
                inner.className = 'slide-content markdown-body';
                inner.innerHTML = html;
                slide.appendChild(inner);
                slideContainer.appendChild(slide);
                slides.push(slide);
            });
            currentSlideIndex = 0;
            showSlide(0);
            presentationOverlay.classList.remove('hidden');
        }

        function showSlide(index) {
            if (index < 0 || index >= slides.length) return;
            slides.forEach(s => s.classList.remove('active'));
            slides[index].classList.add('active');
            currentSlideIndex = index;
            slideNumber.textContent = (index + 1) + ' / ' + slides.length;
        }

        function nextSlide() { if (currentSlideIndex < slides.length - 1) showSlide(currentSlideIndex + 1); }
        function prevSlide() { if (currentSlideIndex > 0) showSlide(currentSlideIndex - 1); }
        function exitPresentation() { presentationOverlay.classList.add('hidden'); }

        document.getElementById('btn-exit-present').onclick = exitPresentation;
        document.getElementById('btn-next-slide').onclick = nextSlide;
        document.getElementById('btn-prev-slide').onclick = prevSlide;

        window.onkeydown = (e) => {
            if (presentationOverlay.classList.contains('hidden')) return;
            if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'Escape') exitPresentation();
        };
    </script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation_export.html';
    a.click();
    URL.revokeObjectURL(url);
}

document.getElementById('btn-export-html').addEventListener('click', exportStandaloneHTML);

// Image Export Logic
async function exportSlidesAsImages() {
    if (!markdownParser) {
        alert(I18n.t('editor_not_ready'));
        return;
    }

    const saveStatus = document.getElementById('save-status');
    const originalStatus = saveStatus.textContent;
    saveStatus.textContent = "画像生成中...";
    saveStatus.style.opacity = "1";

    // Create a hidden container for high-res rendering
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '-2000px'; // Off-screen but not display:none
    container.style.width = '1920px';
    container.style.height = '1080px';
    container.className = 'slide-preview-mode ' + document.body.className; // Maintain theme
    document.body.appendChild(container);

    const card = document.createElement('div');
    card.className = 'slide-card';
    card.style.width = '100%';
    card.style.height = '100%';
    card.style.margin = '0';
    card.style.border = 'none';
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.justifyContent = 'center';

    const body = document.createElement('div');
    body.className = 'markdown-body';
    body.style.width = '100%';
    card.appendChild(body);
    container.appendChild(card);

    try {
        const zip = new JSZip();
        const imgFolder = zip.folder("slides");

        // Use original markdown to split slides reliably
        const content = editor.value;
        const slideMarkdowns = content.split(/\n\s*---\s*\n/);

        for (let i = 0; i < slideMarkdowns.length; i++) {
            saveStatus.textContent = I18n.t('gen_images_progress')
                .replace('{curr}', i + 1)
                .replace('{total}', slideMarkdowns.length);

            // Parse this slide's markdown
            const processedMd = preprocessMarkdown(slideMarkdowns[i]);
            const encoder = new TextEncoder();
            const contentBytes = encoder.encode(processedMd);
            const output = markdownParser.parse(contentBytes);
            const html = (output instanceof Uint8Array) ? new TextDecoder().decode(output) : output;

            body.innerHTML = html;

            // Render Mermaid diagrams
            const mermaidBlocks = body.querySelectorAll('pre > code.language-mermaid');
            for (let j = 0; j < mermaidBlocks.length; j++) {
                const block = mermaidBlocks[j];
                const pre = block.parentElement;
                const code = block.textContent.trim();
                const id = `mermaid-export-${Date.now()}-${i}-${j}`;

                try {
                    const { svg } = await mermaid.render(id, code);
                    const wrapper = document.createElement('div');
                    wrapper.className = 'mermaid-rendered';
                    wrapper.innerHTML = svg;
                    pre.style.display = 'none';
                    pre.insertAdjacentElement('afterend', wrapper);
                } catch (e) {
                    console.error("Mermaid export error", e);
                }
            }

            // Wait for images and fonts
            await new Promise(r => setTimeout(r, 500));

            const dataUrl = await htmlToImage.toPng(card, {
                width: 1920,
                height: 1080,
                pixelRatio: 1, // Stay at 1920x1080
                backgroundColor: getComputedStyle(document.body).backgroundColor
            });

            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
            imgFolder.file(`slide_${String(i + 1).padStart(3, '0')}.png`, base64Data, {base64: true});
        }

        const zipBlob = await zip.generateAsync({type:"blob"});
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'slides_images.zip';
        a.click();
        URL.revokeObjectURL(url);

    } catch (err) {
        console.error("Image export failed:", err);
        alert(I18n.t('export_failed') + "\n" + err.message);
    } finally {
        document.body.removeChild(container);
        saveStatus.textContent = originalStatus;
        saveStatus.style.opacity = "0.7";
    }
}

document.getElementById('btn-export-images').addEventListener('click', exportSlidesAsImages);

// View Mode Listeners
const btnViewDoc = document.getElementById('btn-view-doc');
const btnViewSlide = document.getElementById('btn-view-slide');
const btnViewBoard = document.getElementById('btn-view-board');

function setActiveView(mode) {
    currentViewMode = mode;
    btnViewDoc.classList.toggle('active', mode === 'doc');
    btnViewSlide.classList.toggle('active', mode === 'slide');
    btnViewBoard.classList.toggle('active', mode === 'board');
    updatePreview();
}

if (btnViewDoc) btnViewDoc.addEventListener('click', () => setActiveView('doc'));
if (btnViewSlide) btnViewSlide.addEventListener('click', () => setActiveView('slide'));
if (btnViewBoard) btnViewBoard.addEventListener('click', () => setActiveView('board'));

const langSelector = document.getElementById('lang-selector');
if (langSelector) {
    langSelector.value = I18n.lang;
    langSelector.addEventListener('change', (e) => {
        I18n.setLang(e.target.value);
    });
}

// Expose for testing
window.AssetStore = AssetStore;
