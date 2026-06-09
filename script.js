// script.js
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

// Initialize Mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
});

// Initialize markdown-wasm
let markdownParser;
// Use await if ready is a promise, or check how it's exposed
if (window['markdown'] && window['markdown'].ready) {
    if (typeof window['markdown'].ready.then === 'function') {
        window['markdown'].ready.then(m => {
            markdownParser = m;
            updatePreview();
        });
    } else {
        // If it's not a promise, maybe it's already ready or has another way
        markdownParser = window['markdown'];
        updatePreview();
    }
}

// Throttle for rendering
let renderTimeout;

// Update preview function
function updatePreview() {
    if (!markdownParser) return;

    const content = editor.value;
    const html = markdownParser.parse(content);
    preview.innerHTML = html;

    // Handle Mermaid diagrams
    renderMermaid();
}

async function renderMermaid() {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(async () => {
        // Find code blocks with class "language-mermaid"
        const mermaidBlocks = preview.querySelectorAll('pre > code.language-mermaid');

        for (let i = 0; i < mermaidBlocks.length; i++) {
            const block = mermaidBlocks[i];
            const pre = block.parentElement;
            const code = block.textContent;

            // Create a unique ID for mermaid to render
            const id = `mermaid-${Date.now()}-${i}`;

            try {
                // Render mermaid
                const { svg } = await mermaid.render(id, code);
                pre.insertAdjacentHTML('afterend', svg);
                pre.style.display = 'none'; // Hide the original code block
            } catch (err) {
                console.error('Mermaid render error:', err);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'mermaid-error';
                errorDiv.textContent = 'Mermaid Error: ' + err.message;
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

    // Set cursor position
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
    // Tab key
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 4;
        updatePreview();
    }

    // Keyboard shortcuts
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

    // New Promise-based usage:
    html2pdf().set(opt).from(element).save();
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

// Event listener for real-time parsing
editor.addEventListener('input', () => {
    updatePreview();
});
