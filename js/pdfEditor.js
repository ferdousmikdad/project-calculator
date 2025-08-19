// Rich text editor module

class RichTextEditor {
    constructor() {
        this.editor = null;
        this.toolbar = null;
        this.initializeEditor();
    }

    initializeEditor() {
        this.editor = document.getElementById('rich-editor');
        this.toolbar = document.querySelector('.editor-toolbar');
        this.setupToolbarEvents();
    }

    setupToolbarEvents() {
        // Format buttons
        const formatButtons = this.toolbar.querySelectorAll('.format-btn');
        formatButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const command = button.dataset.command;
                if (command) {
                    this.executeCommand(command);
                }
            });
        });
    }

    executeCommand(command, value = null) {
        document.execCommand(command, false, value);
        this.editor.focus();
        this.updateToolbarState();
    }

    updateToolbarState() {
        // Update active states of toolbar buttons
        const commands = ['bold', 'italic', 'underline'];
        commands.forEach(command => {
            const button = this.toolbar.querySelector(`[data-command="${command}"]`);
            if (button) {
                if (document.queryCommandState(command)) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            }
        });
    }

    // Text formatting functions
    formatText(command, value = null) {
        this.executeCommand(command, value);
    }

    // Insert horizontal rule
    insertHorizontalRule() {
        const hrHtml = '<hr style="margin: 15px 0; border: none; border-top: 2px solid #e5e7eb; width: 100%;">';
        this.executeCommand('insertHTML', hrHtml);
    }

    // Insert table
    insertTable(rows = 3, cols = 3) {
        let tableHtml = '<table style="border-collapse: collapse; width: 100%; margin: 15px 0; border: 1px solid #d1d5db;">';
        
        // Create header row
        tableHtml += '<thead><tr style="background-color: #f9fafb;">';
        for (let j = 0; j < cols; j++) {
            tableHtml += `<th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-weight: 600;">Header ${j + 1}</th>`;
        }
        tableHtml += '</tr></thead>';
        
        // Create body rows
        tableHtml += '<tbody>';
        for (let i = 0; i < rows - 1; i++) {
            tableHtml += '<tr>';
            for (let j = 0; j < cols; j++) {
                tableHtml += `<td style="border: 1px solid #d1d5db; padding: 12px;">Cell ${i + 1}-${j + 1}</td>`;
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table><p><br></p>';
        
        this.executeCommand('insertHTML', tableHtml);
    }

    // Insert icons/emojis
    insertIcon() {
        const icons = [
            '✓', '✗', '★', '⭐', '⚡', '💡', '📈', '📊', '🎯', '⚠️', 
            '🔥', '💰', '🚀', '🎉', '👍', '❤️', '🔔', '📅', '📝', '🏆'
        ];
        
        // Create icon picker popup
        const iconPicker = this.createIconPicker(icons);
        document.body.appendChild(iconPicker);
        
        // Position near cursor
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            iconPicker.style.position = 'fixed';
            iconPicker.style.left = `${rect.left}px`;
            iconPicker.style.top = `${rect.bottom + 10}px`;
            iconPicker.style.zIndex = '1000';
        }
    }

    createIconPicker(icons) {
        const picker = document.createElement('div');
        picker.className = 'icon-picker bg-white border border-gray-300 rounded-lg shadow-lg p-3 grid grid-cols-5 gap-2';
        picker.style.maxWidth = '200px';
        
        icons.forEach(icon => {
            const iconBtn = document.createElement('button');
            iconBtn.textContent = icon;
            iconBtn.className = 'w-8 h-8 text-lg hover:bg-gray-100 rounded cursor-pointer';
            iconBtn.addEventListener('click', () => {
                this.executeCommand('insertHTML', ` ${icon} `);
                document.body.removeChild(picker);
            });
            picker.appendChild(iconBtn);
        });
        
        // Close picker when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeIconPicker(e) {
                if (!picker.contains(e.target)) {
                    if (document.body.contains(picker)) {
                        document.body.removeChild(picker);
                    }
                    document.removeEventListener('click', closeIconPicker);
                }
            });
        }, 100);
        
        return picker;
    }

    // Set text color
    setTextColor(color) {
        this.executeCommand('foreColor', color);
    }

    // Get editor content
    getContent() {
        return this.editor.innerHTML;
    }

    // Set editor content
    setContent(content) {
        this.editor.innerHTML = content;
    }

    // Clear editor
    clearContent() {
        this.editor.innerHTML = `
            <h3>Project Description</h3>
            <p>Enter your project details, terms, and conditions here...</p>
            <br>
            <p><strong>Key Features:</strong></p>
            <ul>
                <li>Feature 1</li>
                <li>Feature 2</li>
                <li>Feature 3</li>
            </ul>
            <br>
            <p><strong>Timeline:</strong> Project completion estimated in X weeks</p>
            <br>
            <p><strong>Terms & Conditions:</strong></p>
            <p>Payment terms and project conditions...</p>
        `;
    }

    // Insert custom content
    insertContent(html) {
        this.executeCommand('insertHTML', html);
    }

    // Save current cursor position
    saveSelection() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            return selection.getRangeAt(0);
        }
        return null;
    }

    // Restore cursor position
    restoreSelection(range) {
        if (range) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
}

// Global editor functions for toolbar buttons
function formatText(command, value = null) {
    if (window.richTextEditor) {
        window.richTextEditor.formatText(command, value);
    }
}

function insertHorizontalRule() {
    if (window.richTextEditor) {
        window.richTextEditor.insertHorizontalRule();
    }
}

function insertTable() {
    if (window.richTextEditor) {
        window.richTextEditor.insertTable();
    }
}

function insertIcon() {
    if (window.richTextEditor) {
        window.richTextEditor.insertIcon();
    }
}