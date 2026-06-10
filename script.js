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
    mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'monospace',
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

function applyCustomCss(css) {
    styleTag.textContent = css;
    localStorage.setItem('customCss', css);
}

if (customCssEditor) {
    customCssEditor.addEventListener('input', (e) => {
        applyCustomCss(e.target.value);
    });
}

const cssPresetStyles = {
    default: `/* TECHNICAL (CAD) */
.markdown-body {
    font-family: 'JetBrains Mono', monospace;
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
    modern: `/* BLUEPRINT (ENGINEERING) */
.markdown-body {
    font-family: 'Segoe UI', system-ui, sans-serif;
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
    classic: `/* DOCUMENT (REPORT) */
.markdown-body {
    font-family: 'Georgia', serif;
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
}`
};

if (cssPresets) {
    cssPresets.addEventListener('change', (e) => {
        const preset = e.target.value;
        if (preset in cssPresetStyles) {
            customCssEditor.value = cssPresetStyles[preset];
            applyCustomCss(cssPresetStyles[preset]);
        }
    });
}

const savedCss = localStorage.getItem('customCss');
if (savedCss && customCssEditor) {
    customCssEditor.value = savedCss;
    applyCustomCss(savedCss);
}

// Mermaid templates
const mermaidTemplates = {
    flowchart: 'graph TD\n    A[START] --> B{CHECK}\n    B -- YES --> C[OK]\n    B -- NO --> D[ERR]',
    sequence: 'sequenceDiagram\n    Alice->>Bob: Hello Bob, how are you?\n    Bob-->>Alice: Jolly good!',
    gantt: 'gantt\n    title A Gantt Diagram\n    section Section\n    A task           :a1, 2023-01-01, 30d\n    Another task     :after a1  , 20d',
    class: 'classDiagram\n    Animal <|-- Duck\n    Animal <|-- Fish\n    Animal <|-- Zebra\n    class Animal{\n        +int age\n        +String gender\n        +isMammal()\n        +mate()\n    }',
    state: 'stateDiagram-v2\n    [*] --> Still\n    Still --> [*]\n    Still --> Moving\n    Moving --> Still\n    Moving --> Crash\n    Crash --> [*]',
    er: 'erDiagram\n    CUSTOMER ||--o{ ORDER : places\n    ORDER ||--|{ LINE-ITEM : contains\n    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses',
    pie: 'pie title Pets adopted by volunteers\n    "Dogs" : 386\n    "Cats" : 85\n    "Rats" : 15',
    journey: 'journey\n    title My working day\n    section Go to work\n      Make tea: 5: Me\n      Go upstairs: 3: Me\n      Do work: 1: Me, Cat\n    section Go home\n      Go downstairs: 5: Me\n      Sit down: 5: Me',
    git: 'gitGraph\n    commit\n    commit\n    branch develop\n    checkout develop\n    commit\n    commit\n    checkout main\n    merge develop\n    commit',
    mindmap: 'mindmap\n  root((mindmap))\n    Origins\n      Long history\n      ::icon(fa fa-book)\n      Popularisation\n        British popular psychology author Tony Buzan\n    Research\n      On effectiveness and features\n      On Oveview and Detail\n    Tools\n      Pen and paper\n      Mermaid',
    timeline: 'timeline\n    title History of Social Media Platform\n    2002 : LinkedIn\n    2004 : Facebook : Google\n    2005 : Youtube\n    2006 : Twitter',
    quadrant: 'quadrantChart\n    title Reach and engagement of campaigns\n    x-axis Low Reach --> High Reach\n    y-axis Low Engagement --> High Engagement\n    quadrant-1 We should expand\n    quadrant-2 Need to promote\n    quadrant-3 Re-evaluate\n    quadrant-4 May be improved\n    Campaign A: [0.3, 0.6]\n    Campaign B: [0.45, 0.23]\n    Campaign C: [0.57, 0.69]\n    Campaign D: [0.78, 0.34]\n    Campaign E: [0.40, 0.34]\n    Campaign F: [0.58, 0.14]'
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

// Markdown templates
const markdownTemplates = {
    checklist_3: '- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3',
    checklist_5: '- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3\n- [ ] Item 4\n- [ ] Item 5',
    bullet_3: '- Item 1\n- Item 2\n- Item 3',
    bullet_nested: '- Parent 1\n    - Child 1.1\n    - Child 1.2\n- Parent 2\n    - Child 2.1',
    table_3x3: '| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Cell 1-1 | Cell 1-2 | Cell 1-3 |\n| Cell 2-1 | Cell 2-2 | Cell 2-3 |\n| Cell 3-1 | Cell 3-2 | Cell 3-3 |',
    table_5x5: '| H1 | H2 | H3 | H4 | H5 |\n| --- | --- | --- | --- | --- |\n| C1-1 | C1-2 | C1-3 | C1-4 | C1-5 |\n| C2-1 | C2-2 | C2-3 | C2-4 | C2-5 |\n| C3-1 | C3-2 | C3-3 | C3-4 | C3-5 |\n| C4-1 | C4-2 | C4-3 | C4-4 | C4-5 |\n| C5-1 | C5-2 | C5-3 | C5-4 | C5-5 |',
    table_header_only: '| Header 1 | Header 2 |\n| --- | --- |',
    hr: '\n---\n',
    math: '$$\nL = \\frac{1}{2} \\rho v^2 S C_L\n$$',
    callout_info: '> [!INFO]\n> This is an informational callout.',
    callout_warn: '> [!WARNING]\n> This is a warning callout.',
    details: '<details>\n<summary>Click to expand</summary>\n\nContent here...\n</details>'
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
        else if (e.key === 's') { e.preventDefault(); document.getElementById('btn-pdf').click(); }
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

// PDF Export
const btnPdf = document.getElementById('btn-pdf');
if (btnPdf) {
    btnPdf.addEventListener('click', () => {
        const element = document.getElementById('preview');
        const isDarkMode = document.body.classList.contains('dark-mode') || !document.body.classList.contains('light-mode');

        const opt = {
            margin: 10,
            filename: 'markdown-export.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                useCORS: true
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        if (typeof html2pdf !== 'undefined') {
            html2pdf().set(opt).from(element).save();
        }
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
    saveStatus.textContent = "SAVING...";
    saveStatus.style.opacity = "1";

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        localStorage.setItem('editorContent', editor.value);
        const assetObj = {};
        AssetStore.assets.forEach((v, k) => assetObj[k] = v);
        localStorage.setItem('assetStore', JSON.stringify(assetObj));

        saveStatus.textContent = "SAVED";
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
