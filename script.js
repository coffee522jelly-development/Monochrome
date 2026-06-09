// script.js
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
let markdownParser;
let mermaidCounter = 0;

// Initialize Mermaid
async function initMermaid() {
    if (typeof mermaid === 'undefined') return;
    const isDark = document.body.classList.contains('dark-mode');
    mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit',
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
        // Some versions of markdown-wasm have issues with string inputs in certain environments
        // Passing a Uint8Array can be more reliable.
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
const themeIcon = btnTheme.querySelector('i');

async function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        document.body.classList.remove('dark-mode');
        if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
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
const savedTheme = localStorage.getItem('theme') || 'light';
initMermaid().then(() => {
    setTheme(savedTheme);
    loadMarkdownWasm();
});

btnTheme.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    setTheme(isDark ? 'light' : 'dark');
});

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
                // Ensure we don't render the same block multiple times if not needed
                const nextEl = pre.nextElementSibling;
                if (nextEl && nextEl.classList.contains('mermaid-rendered')) {
                    // Check if content changed (optional, here we just replace)
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
                const errorDiv = document.createElement('div');
                errorDiv.className = 'mermaid-error';
                errorDiv.textContent = 'Mermaid Error: ' + err.message;
                // Avoid duplicate error messages
                const nextEl = pre.nextElementSibling;
                if (nextEl && nextEl.classList.contains('mermaid-error')) {
                    nextEl.remove();
                }
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
document.getElementById('btn-bold').addEventListener('click', () => insertAtCursor('**', '**'));
document.getElementById('btn-italic').addEventListener('click', () => insertAtCursor('*', '*'));
document.getElementById('btn-header').addEventListener('click', () => insertAtCursor('# ', ''));
document.getElementById('btn-list').addEventListener('click', () => insertAtCursor('- ', ''));
document.getElementById('btn-link').addEventListener('click', () => insertAtCursor('[', '](url)'));
document.getElementById('btn-quote').addEventListener('click', () => insertAtCursor('> ', ''));
document.getElementById('btn-code').addEventListener('click', () => insertAtCursor('`', '`'));

// Settings panel
const settingsPanel = document.getElementById('settings-panel');
const btnSettings = document.getElementById('btn-settings');
const btnCloseSettings = document.getElementById('btn-close-settings');
const customCssEditor = document.getElementById('custom-css-editor');
const cssPresets = document.getElementById('css-presets');
const styleTag = document.getElementById('user-custom-css');

btnSettings.addEventListener('click', () => {
    settingsPanel.classList.remove('hidden');
});

btnCloseSettings.addEventListener('click', () => {
    settingsPanel.classList.add('hidden');
});

settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) {
        settingsPanel.classList.add('hidden');
    }
});

function applyCustomCss(css) {
    styleTag.textContent = css;
    localStorage.setItem('customCss', css);
}

customCssEditor.addEventListener('input', (e) => {
    applyCustomCss(e.target.value);
});

const cssPresetStyles = {
    default: '',
    modern: `.markdown-body {
    font-family: 'Inter', sans-serif;
    color: #1a202c;
    max-width: 800px;
    margin: 0 auto;
}
.markdown-body h1 {
    color: #2b6cb0;
    font-size: 2.5em;
    border-bottom: 2px solid #ebf8ff;
}
.markdown-body p {
    font-size: 1.1em;
    line-height: 1.8;
}`,
    classic: `.markdown-body {
    font-family: 'Georgia', serif;
    color: #111;
    line-height: 1.4;
    column-count: 1;
}
.markdown-body h1 {
    text-align: center;
    border-bottom: 3px double #000;
    text-transform: uppercase;
}
.markdown-body blockquote {
    font-style: italic;
    border-left: none;
    text-align: center;
    padding: 20px;
}`
};

cssPresets.addEventListener('change', (e) => {
    const preset = e.target.value;
    if (preset in cssPresetStyles) {
        customCssEditor.value = cssPresetStyles[preset];
        applyCustomCss(cssPresetStyles[preset]);
    }
});

const savedCss = localStorage.getItem('customCss');
if (savedCss) {
    customCssEditor.value = savedCss;
    applyCustomCss(savedCss);
}

// Mermaid presets
const mermaidTemplates = {
    flowchart: 'graph TD\n    A[Start] --> B{Is it?}\n    B -- Yes --> C[OK]\n    B -- No --> D[KO]',
    sequence: 'sequenceDiagram\n    Alice->>Bob: Hello Bob, how are you?\n    Bob-->>Alice: Jolly good!',
    gantt: 'gantt\n    title A Gantt Diagram\n    section Section\n    A task           :a1, 2023-01-01, 30d\n    Another task     :after a1  , 20d',
    class: 'classDiagram\n    Animal <|-- Duck\n    Animal <|-- Fish\n    Animal <|-- Zebra\n    class Animal{\n        +int age\n        +String gender\n        +isMammal()\n        +mate()\n    }',
    state: 'stateDiagram-v2\n    [*] --> Still\n    Still --> [*]\n    Still --> Moving\n    Moving --> Still\n    Moving --> Crash\n    Crash --> [*]',
    er: 'erDiagram\n    CUSTOMER ||--o{ ORDER : places\n    ORDER ||--|{ LINE-ITEM : contains\n    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses',
    pie: 'pie title Pets adopted by volunteers\n    "Dogs" : 386\n    "Cats" : 85\n    "Rats" : 15'
};

document.getElementById('btn-insert-mermaid').addEventListener('click', () => {
    const preset = document.getElementById('mermaid-presets').value;
    if (preset && mermaidTemplates[preset]) {
        const template = `\n\`\`\`mermaid\n${mermaidTemplates[preset]}\n\`\`\`\n`;
        insertAtCursor(template);
    }
});

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
        if (e.key === 'b') {
            e.preventDefault();
            insertAtCursor('**', '**');
        } else if (e.key === 'i') {
            e.preventDefault();
            insertAtCursor('*', '*');
        } else if (e.key === 's') {
            e.preventDefault();
            document.getElementById('btn-pdf').click();
        }
    }
});

// PDF Export
document.getElementById('btn-pdf').addEventListener('click', () => {
    const element = document.getElementById('preview');
    const opt = {
        margin:       10,
        filename:     'markdown-export.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(element).save();
    }
});

// Scroll synchronization
let isScrolling = false;
editor.addEventListener('scroll', () => {
    if (isScrolling) {
        isScrolling = false;
        return;
    }
    isScrolling = true;
    const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
    const previewContainer = document.getElementById('preview-container');
    previewContainer.scrollTop = scrollPercentage * (previewContainer.scrollHeight - previewContainer.clientHeight);
});

document.getElementById('preview-container').addEventListener('scroll', (e) => {
    if (isScrolling) {
        isScrolling = false;
        return;
    }
    isScrolling = true;
    const previewContainer = e.target;
    const scrollPercentage = previewContainer.scrollTop / (previewContainer.scrollHeight - previewContainer.clientHeight);
    editor.scrollTop = scrollPercentage * (editor.scrollHeight - editor.clientHeight);
});

editor.addEventListener('input', () => {
    updatePreview();
});
