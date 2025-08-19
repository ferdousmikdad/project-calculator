// PDF Generator module

class PDFGenerator {
    constructor() {
        this.modal = document.getElementById('pdf-modal');
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('close-modal').addEventListener('click', () => this.closePdfModal());
        document.getElementById('save-pdf').addEventListener('click', () => this.savePdf());
        document.getElementById('download-pdf').addEventListener('click', () => this.downloadPdf());
        
        // Generate PDF button from main calculator
        document.getElementById('generate-pdf-btn').addEventListener('click', () => this.openPdfEditor());
    }

    openPdfEditor() {
        if (!AppState.currentCalculation) {
            Utils.showNotification('Please calculate costs first', 'error');
            return;
        }

        this.modal.classList.remove('hidden');
        
        // Set PDF metadata
        document.getElementById('pdf-date').textContent = Utils.formatDate(new Date());
        document.getElementById('pdf-project-id').textContent = Utils.generateProjectId();

        // Populate cost summary in PDF
        this.populateCostSummary();
        
        // Initialize rich text editor if not already done
        if (!window.richTextEditor) {
            window.richTextEditor = new RichTextEditor();
        }
    }

    closePdfModal() {
        this.modal.classList.add('hidden');
    }

    populateCostSummary() {
        const calc = AppState.currentCalculation;
        
        let costTableHtml = `
            <table class="w-full text-sm border-collapse">
                <thead>
                    <tr class="border-b bg-gray-100">
                        <th class="text-left py-3 px-2 font-semibold">Category</th>
                        <th class="text-right py-3 px-2 font-semibold">Percentage</th>
                        <th class="text-right py-3 px-2 font-semibold">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b">
                        <td class="py-2 px-2">Development</td>
                        <td class="text-right py-2 px-2">40.5%</td>
                        <td class="text-right py-2 px-2 font-medium">${Utils.formatCurrency(calc.costs.development)}</td>
                    </tr>
                    <tr class="border-b">
                        <td class="py-2 px-2">UI/UX Design</td>
                        <td class="text-right py-2 px-2">26.5%</td>
                        <td class="text-right py-2 px-2 font-medium">${Utils.formatCurrency(calc.costs.design)}</td>
                    </tr>
                    <tr class="border-b">
                        <td class="py-2 px-2">Client Communication</td>
                        <td class="text-right py-2 px-2">7.5%</td>
                        <td class="text-right py-2 px-2 font-medium">${Utils.formatCurrency(calc.costs.communication)}</td>
                    </tr>
                    <tr class="border-b">
                        <td class="py-2 px-2">Project Management & QA</td>
                        <td class="text-right py-2 px-2">7.5%</td>
                        <td class="text-right py-2 px-2 font-medium">${Utils.formatCurrency(calc.costs.management)}</td>
                    </tr>
                    <tr class="border-b">
                        <td class="py-2 px-2">Agency Overhead & Profit</td>
                        <td class="text-right py-2 px-2">10%</td>
                        <td class="text-right py-2 px-2 font-medium">${Utils.formatCurrency(calc.costs.overhead)}</td>
                    </tr>
                    <tr class="border-b">
                        <td class="py-2 px-2">Broker Fee</td>
                        <td class="text-right py-2 px-2">8%</td>
                        <td class="text-right py-2 px-2 font-medium">${Utils.formatCurrency(calc.costs.broker)}</td>
                    </tr>
                    <tr class="border-t-2 bg-gray-50">
                        <td class="py-3 px-2 font-semibold">Subtotal</td>
                        <td class="text-right py-3 px-2"></td>
                        <td class="text-right py-3 px-2 font-semibold">${Utils.formatCurrency(calc.subtotal)}</td>
                    </tr>
                    <tr class="text-red-600">
                        <td class="py-2 px-2">TDS (10%)</td>
                        <td class="text-right py-2 px-2"></td>
                        <td class="text-right py-2 px-2 font-medium">-${Utils.formatCurrency(calc.tdsAmount)}</td>
                    </tr>`;

        if (calc.discount > 0) {
            costTableHtml += `
                    <tr class="text-green-600">
                        <td class="py-2 px-2">Discount (${calc.discount}%)</td>
                        <td class="text-right py-2 px-2"></td>
                        <td class="text-right py-2 px-2 font-medium">-${Utils.formatCurrency(calc.discountAmount)}</td>
                    </tr>`;
        }

        costTableHtml += `
                    <tr class="border-t-2 bg-green-100">
                        <td class="py-4 px-2 text-lg font-bold">FINAL PAYABLE</td>
                        <td class="text-right py-4 px-2"></td>
                        <td class="text-right py-4 px-2 text-lg font-bold text-green-700">${Utils.formatCurrency(calc.finalAmount)}</td>
                    </tr>
                </tbody>
            </table>
        `;

        document.getElementById('pdf-cost-table').innerHTML = costTableHtml;
    }

    savePdf() {
        if (!AppState.currentCalculation) {
            Utils.showNotification('No calculation data available', 'error');
            return;
        }

        const projectId = document.getElementById('pdf-project-id').textContent;
        const projectName = AppState.currentCalculation.projectName;
        const editorContent = window.richTextEditor ? window.richTextEditor.getContent() : '';

        const project = {
            id: projectId,
            name: projectName,
            date: new Date().toISOString(),
            calculation: AppState.currentCalculation,
            content: editorContent,
            status: 'saved'
        };

        AppState.addProject(project);
        Utils.showNotification('Project saved successfully!', 'success');
        this.closePdfModal();
        
        // Refresh projects list if it's currently visible
        if (window.projectManager) {
            window.projectManager.loadProjects();
        }
    }

    async downloadPdf() {
        if (!AppState.currentCalculation) {
            Utils.showNotification('No calculation data available', 'error');
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Set up PDF styling
            this.setupPdfStyling(doc);
            
            // Add header with letterhead background
            this.addPdfHeader(doc);
            
            // Add cost breakdown
            this.addCostBreakdown(doc);
            
            // Add project content (simplified text version)
            this.addProjectContent(doc);
            
            // Download the PDF
            const fileName = `${AppState.currentCalculation.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Estimate.pdf`;
            doc.save(fileName);
            
            Utils.showNotification('PDF downloaded successfully!', 'success');
            
        } catch (error) {
            console.error('PDF generation error:', error);
            Utils.showNotification('Error generating PDF. Please try again.', 'error');
        }
    }

    setupPdfStyling(doc) {
        // Set default font
        doc.setFont('helvetica');
    }

    addPdfHeader(doc) {
        const calc = AppState.currentCalculation;
        
        // Header background
        doc.setFillColor(102, 126, 234);
        doc.rect(0, 0, 210, 40, 'F');
        
        // Header text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('PROJECT ESTIMATE', 20, 25);
        
        // Project details
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${Utils.formatDate(new Date())}`, 150, 15);
        doc.text(`Project: ${calc.projectName}`, 150, 22);
        doc.text(`ID: ${document.getElementById('pdf-project-id').textContent}`, 150, 29);
        
        // Reset text color
        doc.setTextColor(0, 0, 0);
    }

    addCostBreakdown(doc) {
        const calc = AppState.currentCalculation;
        let yPos = 60;
        
        // Section title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Cost Breakdown', 20, yPos);
        
        yPos += 15;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        // Cost items
        const costItems = [
            ['Development (40.5%)', Utils.formatCurrency(calc.costs.development)],
            ['UI/UX Design (26.5%)', Utils.formatCurrency(calc.costs.design)],
            ['Client Communication (7.5%)', Utils.formatCurrency(calc.costs.communication)],
            ['Project Management & QA (7.5%)', Utils.formatCurrency(calc.costs.management)],
            ['Agency Overhead & Profit (10%)', Utils.formatCurrency(calc.costs.overhead)],
            ['Broker Fee (8%)', Utils.formatCurrency(calc.costs.broker)],
            ['', ''],
            ['Subtotal', Utils.formatCurrency(calc.subtotal)],
            ['TDS (10%)', `-${Utils.formatCurrency(calc.tdsAmount)}`]
        ];

        if (calc.discount > 0) {
            costItems.push([`Discount (${calc.discount}%)`, `-${Utils.formatCurrency(calc.discountAmount)}`]);
        }

        costItems.push(['', '']);
        costItems.push(['FINAL PAYABLE', Utils.formatCurrency(calc.finalAmount)]);

        // Draw cost table
        costItems.forEach(([label, amount]) => {
            if (label === '' && amount === '') {
                yPos += 5;
                return;
            }
            
            if (label === 'FINAL PAYABLE') {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                // Add background for final amount
                doc.setFillColor(220, 252, 231);
                doc.rect(18, yPos - 4, 174, 8, 'F');
            }
            
            doc.text(label, 20, yPos);
            doc.text(amount, 190, yPos, { align: 'right' });
            yPos += 10;
            
            // Reset font for next items
            if (label === 'FINAL PAYABLE') {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
            }
        });
    }

    addProjectContent(doc) {
        let yPos = 180;
        
        // Section title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Project Details', 20, yPos);
        
        yPos += 15;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        // Get simplified text content from rich editor
        const editorElement = document.getElementById('rich-editor');
        const textContent = this.extractTextFromHtml(editorElement.innerHTML);
        
        // Split text into lines that fit the page width
        const lines = doc.splitTextToSize(textContent, 170);
        
        // Add lines to PDF
        lines.forEach(line => {
            if (yPos > 270) { // Check if we need a new page
                doc.addPage();
                yPos = 20;
            }
            doc.text(line, 20, yPos);
            yPos += 5;
        });
    }

    extractTextFromHtml(html) {
        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Extract text content while preserving some structure
        let text = tempDiv.textContent || tempDiv.innerText || '';
        
        // Clean up extra whitespace
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }

    // Preview PDF in modal before saving
    previewPdf() {
        // This could be enhanced to show a preview canvas
        Utils.showNotification('PDF preview will be available in future version', 'info');
    }
}