// script.js
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
let markdownParser;
let mermaidCounter = 0;

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

// Update preview function
async function updatePreview() {
    if (!markdownParser) return;

    const content = editor.value;
    if (!content) {
        preview.innerHTML = '';
        return;
    }

    try {
        const encoder = new TextEncoder();
        const contentBytes = encoder.encode(content);
        const output = markdownParser.parse(contentBytes);

        // If output is Uint8Array, decode it back to string
        const html = (output instanceof Uint8Array)
            ? new TextDecoder().decode(output)
            : output;

        preview.innerHTML = html;
        await renderMermaid();
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
const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark for CAD look
initMermaid().then(() => {
    setTheme(savedTheme);
    loadMarkdownWasm();
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

// Helper to insert text at cursor
function insertAtCursor(before, after = '') {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selection = text.substring(start, end);
    const replacement = before + selection + after;
    editor.value = text.substring(0, start) + replacement + text.substring(end);
    editor.focus();
    const newCursorPos = start + before.length + selection.length + after.length;
    editor.setSelectionRange(newCursorPos, newCursorPos);
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

// Editor enhancements
editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 4;
        updatePreview();
    }
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b') { e.preventDefault(); insertAtCursor('**', '**'); }
        else if (e.key === 'i') { e.preventDefault(); insertAtCursor('*', '*'); }
        else if (e.key === 's') { e.preventDefault(); document.getElementById('btn-pdf').click(); }
    }
});

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

editor.addEventListener('input', () => updatePreview());

// Image drag and drop
editor.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    editor.classList.add('drag-active');
});

editor.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    editor.classList.remove('drag-active');
});

editor.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    editor.classList.remove('drag-active');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64Data = event.target.result;
                    const imageMarkdown = `\n![${file.name}](${base64Data})\n`;
                    insertAtCursor(imageMarkdown);
                };
                reader.readAsDataURL(file);
            }
        });
    }
});
