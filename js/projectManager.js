// Project Manager module for handling project operations

class ProjectManager {
    constructor() {
        this.projectsList = document.getElementById('projects-list');
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('refresh-projects').addEventListener('click', () => this.loadProjects());
    }

    loadProjects() {
        this.projectsList.innerHTML = '';
        
        if (AppState.projects.length === 0) {
            this.showEmptyState();
            return;
        }

        // Sort projects by date (newest first)
        const sortedProjects = AppState.projects.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedProjects.forEach(project => {
            this.createProjectCard(project);
        });
    }

    showEmptyState() {
        this.projectsList.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-folder-open text-4xl mb-4"></i>
                <h3 class="text-lg font-medium mb-2">No Projects Yet</h3>
                <p class="text-sm">Create your first project estimation to see it here</p>
                <button onclick="showSection('calculator')" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Create New Project
                </button>
            </div>
        `;
    }

    createProjectCard(project) {
        const projectCard = document.createElement('div');
        projectCard.className = 'bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow';
        
        projectCard.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-800 mb-1">${project.name}</h4>
                    <p class="text-sm text-gray-600 mb-2">ID: ${project.id}</p>
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span><i class="fas fa-calendar-alt mr-1"></i>${Utils.formatDate(project.date)}</span>
                        <span><i class="fas fa-dollar-sign mr-1"></i>${Utils.formatCurrency(project.calculation.finalAmount)}</span>
                        <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            ${project.status || 'saved'}
                        </span>
                    </div>
                </div>
                <div class="flex space-x-2 ml-4">
                    <button onclick="projectManager.viewProject('${project.id}')" 
                            class="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200">
                        <i class="fas fa-eye mr-1"></i>View
                    </button>
                    <button onclick="projectManager.downloadProjectPdf('${project.id}')" 
                            class="bg-green-100 text-green-600 px-3 py-1 rounded text-sm hover:bg-green-200">
                        <i class="fas fa-download mr-1"></i>PDF
                    </button>
                    <button onclick="projectManager.duplicateProject('${project.id}')" 
                            class="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-200">
                        <i class="fas fa-copy mr-1"></i>Copy
                    </button>
                    <button onclick="projectManager.deleteProject('${project.id}')" 
                            class="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                </div>
            </div>
            
            <div class="mt-3 pt-3 border-t border-gray-100">
                <div class="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                        <span class="font-medium">Development:</span> ${Utils.formatCurrency(project.calculation.costs.development)}
                    </div>
                    <div>
                        <span class="font-medium">Design:</span> ${Utils.formatCurrency(project.calculation.costs.design)}
                    </div>
                </div>
            </div>
        `;
        
        this.projectsList.appendChild(projectCard);
    }

    viewProject(projectId) {
        const project = AppState.getProject(projectId);
        if (!project) {
            Utils.showNotification('Project not found', 'error');
            return;
        }

        // Load project data into calculator
        AppState.currentCalculation = project.calculation;
        
        // Switch to calculator view and populate fields
        showSection('calculator');
        this.populateCalculatorFields(project);
        
        // Update sidebar active state
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('sidebar-active'));
        document.querySelector('[data-section="calculator"]').classList.add('sidebar-active');
        
        Utils.showNotification(`Loaded project: ${project.name}`, 'success');
    }

    populateCalculatorFields(project) {
        const calc = project.calculation;
        
        // Clear and populate input fields
        document.getElementById('dev-cost').value = '';
        document.getElementById('design-cost').value = '';
        document.getElementById('discount').value = calc.discount || 0;
        document.getElementById('project-name').value = project.name;
        
        // Determine which field to populate based on which was originally used
        if (calc.costs.development >= calc.costs.design) {
            document.getElementById('dev-cost').value = calc.costs.development.toFixed(2);
            document.getElementById('design-cost').disabled = true;
        } else {
            document.getElementById('design-cost').value = calc.costs.design.toFixed(2);
            document.getElementById('dev-cost').disabled = true;
        }
        
        // Update cost display
        if (window.calculator) {
            window.calculator.updateCostDisplay(
                calc.costs, 
                calc.subtotal, 
                calc.tdsAmount, 
                calc.discountAmount, 
                calc.finalAmount, 
                calc.discount
            );
        }
        
        // Enable PDF generation
        document.getElementById('generate-pdf-btn').disabled = false;
    }

    downloadProjectPdf(projectId) {
        const project = AppState.getProject(projectId);
        if (!project) {
            Utils.showNotification('Project not found', 'error');
            return;
        }

        // Set current calculation temporarily
        const originalCalculation = AppState.currentCalculation;
        AppState.currentCalculation = project.calculation;
        
        // Set project content in editor temporarily
        const originalContent = window.richTextEditor ? window.richTextEditor.getContent() : '';
        if (window.richTextEditor) {
            window.richTextEditor.setContent(project.content);
        }
        
        // Generate and download PDF
        if (window.pdfGenerator) {
            window.pdfGenerator.downloadPdf();
        }
        
        // Restore original state
        AppState.currentCalculation = originalCalculation;
        if (window.richTextEditor) {
            window.richTextEditor.setContent(originalContent);
        }
    }

    duplicateProject(projectId) {
        const project = AppState.getProject(projectId);
        if (!project) {
            Utils.showNotification('Project not found', 'error');
            return;
        }

        const duplicatedProject = {
            ...project,
            id: Utils.generateProjectId(),
            name: `${project.name} (Copy)`,
            date: new Date().toISOString(),
            status: 'draft'
        };

        AppState.addProject(duplicatedProject);
        this.loadProjects();
        Utils.showNotification(`Project duplicated: ${duplicatedProject.name}`, 'success');
    }

    deleteProject(projectId) {
        const project = AppState.getProject(projectId);
        if (!project) {
            Utils.showNotification('Project not found', 'error');
            return;
        }

        if (confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
            AppState.deleteProject(projectId);
            this.loadProjects();
            Utils.showNotification('Project deleted successfully', 'success');
        }
    }

    // Search and filter functionality
    searchProjects(query) {
        if (!query.trim()) {
            this.loadProjects();
            return;
        }

        const filteredProjects = AppState.projects.filter(project => 
            project.name.toLowerCase().includes(query.toLowerCase()) ||
            project.id.toLowerCase().includes(query.toLowerCase())
        );

        this.displayFilteredProjects(filteredProjects);
    }

    displayFilteredProjects(projects) {
        this.projectsList.innerHTML = '';
        
        if (projects.length === 0) {
            this.projectsList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-search text-3xl mb-3"></i>
                    <p>No projects found matching your search</p>
                </div>
            `;
            return;
        }

        projects.forEach(project => {
            this.createProjectCard(project);
        });
    }

    // Export all projects data
    exportProjects() {
        const dataStr = JSON.stringify(AppState.projects, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `projects_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        Utils.showNotification('Projects exported successfully', 'success');
    }

    // Import projects data
    importProjects(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedProjects = JSON.parse(e.target.result);
                if (Array.isArray(importedProjects)) {
                    AppState.updateProjects([...AppState.projects, ...importedProjects]);
                    this.loadProjects();
                    Utils.showNotification(`Imported ${importedProjects.length} projects`, 'success');
                } else {
                    Utils.showNotification('Invalid file format', 'error');
                }
            } catch (error) {
                Utils.showNotification('Error reading file', 'error');
            }
        };
        reader.readAsText(file);
    }
}