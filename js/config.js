// Configuration file for Project Calculator Dashboard

// Cost Distribution Ratios
const CONFIG = {
    costRatios: {
        development: 40.5,
        design: 26.5,
        communication: 7.5,
        management: 7.5,
        overhead: 10,
        broker: 8
    },
    
    // TDS and other default values
    tdsPercentage: 10,
    defaultProjectName: 'Untitled Project',
    
    // Local storage keys
    storageKeys: {
        projects: 'projects'
    },
    
    // PDF configuration
    pdfConfig: {
        pageWidth: 210,
        pageHeight: 297,
        headerHeight: 40,
        margin: 20
    }
};

// Application State
const AppState = {
    currentCalculation: null,
    projects: JSON.parse(localStorage.getItem(CONFIG.storageKeys.projects)) || [],
    
    // Update projects in storage
    updateProjects: function(projects) {
        this.projects = projects;
        localStorage.setItem(CONFIG.storageKeys.projects, JSON.stringify(projects));
    },
    
    // Add new project
    addProject: function(project) {
        this.projects.push(project);
        this.updateProjects(this.projects);
    },
    
    // Delete project
    deleteProject: function(projectId) {
        this.projects = this.projects.filter(p => p.id !== projectId);
        this.updateProjects(this.projects);
    },
    
    // Get project by ID
    getProject: function(projectId) {
        return this.projects.find(p => p.id === projectId);
    }
};

// Utility functions
const Utils = {
    // Generate unique project ID
    generateProjectId: function() {
        return 'PRJ-' + Date.now().toString(36).toUpperCase();
    },
    
    // Format currency - CHANGED FROM USD TO BDT
    formatCurrency: function(amount) {
        return `BDT ${amount.toFixed(2)}`;
    },
    
    // Format date
    formatDate: function(date) {
        return new Date(date).toLocaleDateString();
    },
    
    // Show notification
    showNotification: function(message, type = 'info') {
        // Simple alert for now, can be enhanced with toast notifications
        alert(message);
    }
};