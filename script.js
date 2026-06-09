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
        const html = markdownParser.parse(contentBytes);
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
    default: '',
    modern: `.markdown-body { font-family: sans-serif; color: #add8e6; }`,
    classic: `.markdown-body { font-family: serif; color: #f5deb3; line-height: 1.2; }`
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
    sequence: 'sequenceDiagram\n    USR->>SYS: REQ\n    SYS-->>USR: RSP',
    gantt: 'gantt\n    section S1\n    T1: 2023-01-01, 10d',
    class: 'classDiagram\n    C1 <|-- C2',
    state: 'stateDiagram-v2\n    S1 --> S2',
    er: 'erDiagram\n    E1 ||--o{ E2 : R1',
    pie: 'pie title T1\n    "V1" : 50\n    "V2" : 50'
};

const btnInsertMermaid = document.getElementById('btn-insert-mermaid');
if (btnInsertMermaid) {
    btnInsertMermaid.addEventListener('click', () => {
        const preset = document.getElementById('mermaid-presets').value;
        if (preset && mermaidTemplates[preset]) {
            const template = `\n\`\`\`mermaid\n${mermaidTemplates[preset]}\n\`\`\`\n`;
            insertAtCursor(template);
        }
    });
}

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
        const opt = {
            margin: 0,
            filename: 'export.pdf',
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, backgroundColor: '#000000' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        if (typeof html2pdf !== 'undefined') html2pdf().set(opt).from(element).save();
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
