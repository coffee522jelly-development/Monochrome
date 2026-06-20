// script.js
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
let markdownParser;
let mermaidCounter = 0;

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

// Update preview function
async function updatePreview() {
    if (!markdownParser) return;

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

        const html = (output instanceof Uint8Array)
            ? new TextDecoder().decode(output)
            : output;

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
    updateStats();
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
    'btn-code': ['`', '`']
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
        if (!name) { alert("プリセット名を入力してください。"); return; }
        const css = customCssEditor.value;
        CSSStore.save(name, css);
        document.getElementById('css-presets').value = `user:${name}`;
        localStorage.setItem('lastCssPreset', `user:${name}`);
        alert(`プリセット "${name}" を保存しました。`);
    });
}

const btnDeleteCss = document.getElementById('btn-delete-preset');
if (btnDeleteCss) {
    btnDeleteCss.addEventListener('click', () => {
        const val = document.getElementById('css-presets').value;
        if (!val.startsWith('user:')) { alert("システム標準プリセットは削除できません。"); return; }
        const name = val.replace('user:', '');
        if (confirm(`プリセット "${name}" を削除しますか？`)) {
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

// Markdown templates (Localized)
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
    saveStatus.textContent = "保存中...";
    saveStatus.style.opacity = "1";

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        localStorage.setItem('editorContent', editor.value);
        const assetObj = {};
        AssetStore.assets.forEach((v, k) => assetObj[k] = v);
        localStorage.setItem('assetStore', JSON.stringify(assetObj));

        saveStatus.textContent = "保存済み";
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
        let toc = "\n## 目次\n\n";
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
            alert("目次を作成するには、## 以上の見出しが必要です。");
        }
    });
}

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
