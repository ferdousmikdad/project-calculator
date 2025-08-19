// Main application initialization and global functions

// Global instances
let calculator = null;
let richTextEditor = null;
let pdfGenerator = null;
let projectManager = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    try {
        // Initialize all modules
        calculator = new CostCalculator();
        richTextEditor = new RichTextEditor();
        pdfGenerator = new PDFGenerator();
        projectManager = new ProjectManager();
        
        // Make instances globally available
        window.calculator = calculator;
        window.richTextEditor = richTextEditor;
        window.pdfGenerator = pdfGenerator;
        window.projectManager = projectManager;
        
        // Setup main navigation
        setupNavigation();
        
        // Show default section
        showSection('calculator');
        
        // Load projects
        projectManager.loadProjects();
        
        console.log('Project Calculator Dashboard initialized successfully');
        
    } catch (error) {
        console.error('Error initializing application:', error);
        Utils.showNotification('Error initializing application. Please refresh the page.', 'error');
    }
}

function setupNavigation() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Update active state
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('sidebar-active'));
            this.classList.add('sidebar-active');
        });
    });
    
    // Set initial active state
    document.querySelector('[data-section="calculator"]').classList.add('sidebar-active');
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
        
        // Load section-specific data
        if (sectionName === 'projects') {
            projectManager.loadProjects();
        }
    }
}

// Global utility functions that can be called from HTML
function resetForm() {
    if (calculator) {
        calculator.resetCalculator();
    }
}

function exportAllProjects() {
    if (projectManager) {
        projectManager.exportProjects();
    }
}

function importProjects(input) {
    if (input.files && input.files[0] && projectManager) {
        projectManager.importProjects(input.files[0]);
    }
}

// Enhanced notification system
function showToast(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `
        flex items-center p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full
        ${type === 'success' ? 'bg-green-500 text-white' : ''}
        ${type === 'error' ? 'bg-red-500 text-white' : ''}
        ${type === 'warning' ? 'bg-yellow-500 text-white' : ''}
        ${type === 'info' ? 'bg-blue-500 text-white' : ''}
    `;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon} mr-3"></i>
        <span class="flex-1">${message}</span>
        <button onclick="this.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// Enhanced Utils with toast integration
Utils.showNotification = function(message, type = 'info') {
    showToast(message, type);
};

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+S to save (in PDF modal)
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (!document.getElementById('pdf-modal').classList.contains('hidden')) {
            pdfGenerator.savePdf();
        }
    }
    
    // Ctrl+D to download PDF (in PDF modal)
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        if (!document.getElementById('pdf-modal').classList.contains('hidden')) {
            pdfGenerator.downloadPdf();
        }
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        if (!document.getElementById('pdf-modal').classList.contains('hidden')) {
            pdfGenerator.closePdfModal();
        }
    }
    
    // Ctrl+N for new project (reset calculator)
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        showSection('calculator');
        resetForm();
    }
    
    // Ctrl+P for projects list
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        showSection('projects');
        document.querySelector('[data-section="projects"]').click();
    }
});

// Auto-save functionality for rich text editor
let autoSaveTimer = null;
function setupAutoSave() {
    const editor = document.getElementById('rich-editor');
    if (editor) {
        editor.addEventListener('input', function() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                // Auto-save draft to localStorage
                const draftContent = richTextEditor.getContent();
                localStorage.setItem('editor_draft', draftContent);
                console.log('Draft auto-saved');
            }, 2000);
        });
    }
}

// Load draft content
function loadDraft() {
    const draft = localStorage.getItem('editor_draft');
    if (draft && richTextEditor) {
        richTextEditor.setContent(draft);
    }
}

// Clear draft
function clearDraft() {
    localStorage.removeItem('editor_draft');
}

// Enhanced error handling
window.addEventListener('error', function(e) {
    console.error('Application Error:', e.error);
    Utils.showNotification('An unexpected error occurred. Please try again.', 'error');
});

// Application state management
const ApplicationState = {
    currentTheme: localStorage.getItem('theme') || 'light',
    
    setTheme: function(theme) {
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    },
    
    toggleTheme: function() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
};

// Performance monitoring
const Performance = {
    startTime: Date.now(),
    
    logLoadTime: function() {
        const loadTime = Date.now() - this.startTime;
        console.log(`Application loaded in ${loadTime}ms`);
    },
    
    measureFunction: function(fn, name) {
        return function(...args) {
            const start = Date.now();
            const result = fn.apply(this, args);
            const end = Date.now();
            console.log(`${name} executed in ${end - start}ms`);
            return result;
        };
    }
};

// Initialize performance monitoring
window.addEventListener('load', function() {
    Performance.logLoadTime();
});

// Data validation utilities
const Validation = {
    isValidCost: function(cost) {
        return !isNaN(cost) && cost > 0 && cost <= 10000000; // Max 10M
    },
    
    isValidDiscount: function(discount) {
        return !isNaN(discount) && discount >= 0 && discount <= 100;
    },
    
    isValidProjectName: function(name) {
        return name && name.trim().length >= 2 && name.trim().length <= 100;
    },
    
    sanitizeInput: function(input) {
        return input.toString().trim().replace(/[<>]/g, '');
    }
};

// Backup and restore functionality
const BackupManager = {
    createBackup: function() {
        const backup = {
            projects: AppState.projects,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `project_calculator_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        Utils.showNotification('Backup created successfully', 'success');
    },
    
    restoreBackup: function(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                if (backup.projects && Array.isArray(backup.projects)) {
                    AppState.updateProjects(backup.projects);
                    projectManager.loadProjects();
                    Utils.showNotification('Backup restored successfully', 'success');
                } else {
                    Utils.showNotification('Invalid backup file format', 'error');
                }
            } catch (error) {
                Utils.showNotification('Error restoring backup', 'error');
                console.error('Backup restore error:', error);
            }
        };
        reader.readAsText(file);
    }
};

// Add backup/restore to global scope
window.createBackup = () => BackupManager.createBackup();
window.restoreBackup = (input) => {
    if (input.files && input.files[0]) {
        BackupManager.restoreBackup(input.files[0]);
    }
};

// Initialize enhanced features after DOM load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        setupAutoSave();
        ApplicationState.setTheme(ApplicationState.currentTheme);
    }, 1000);
});

console.log('Project Calculator Dashboard - All modules loaded successfully');