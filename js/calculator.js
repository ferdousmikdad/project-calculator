// Calculator module for cost calculations

class CostCalculator {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.devCostInput = document.getElementById('dev-cost');
        this.designCostInput = document.getElementById('design-cost');
        this.discountInput = document.getElementById('discount');
        this.projectNameInput = document.getElementById('project-name');
        this.calculateBtn = document.getElementById('calculate-btn');
        this.generatePdfBtn = document.getElementById('generate-pdf-btn');
    }

    setupEventListeners() {
        // Input field listeners for mutual exclusion
        this.devCostInput.addEventListener('input', () => {
            if (this.devCostInput.value) {
                this.designCostInput.value = '';
                this.designCostInput.disabled = true;
            } else {
                this.designCostInput.disabled = false;
            }
        });

        this.designCostInput.addEventListener('input', () => {
            if (this.designCostInput.value) {
                this.devCostInput.value = '';
                this.devCostInput.disabled = true;
            } else {
                this.devCostInput.disabled = false;
            }
        });

        // Calculate button
        this.calculateBtn.addEventListener('click', () => this.calculateCosts());
    }

    calculateCosts() {
        const devCost = parseFloat(this.devCostInput.value) || 0;
        const designCost = parseFloat(this.designCostInput.value) || 0;
        const discount = parseFloat(this.discountInput.value) || 0;

        // Validation
        if (!devCost && !designCost) {
            Utils.showNotification('Please enter either Development or UI/UX Design cost', 'error');
            return;
        }

        if (discount < 0 || discount > 100) {
            Utils.showNotification('Discount must be between 0 and 100%', 'error');
            return;
        }

        let totalProjectCost;
        let costs = {};

        // Calculate based on input type
        if (devCost > 0) {
            totalProjectCost = devCost / (CONFIG.costRatios.development / 100);
            costs.development = devCost;
            costs.design = totalProjectCost * (CONFIG.costRatios.design / 100);
        } else {
            totalProjectCost = designCost / (CONFIG.costRatios.design / 100);
            costs.design = designCost;
            costs.development = totalProjectCost * (CONFIG.costRatios.development / 100);
        }

        // Calculate all other costs
        costs.communication = totalProjectCost * (CONFIG.costRatios.communication / 100);
        costs.management = totalProjectCost * (CONFIG.costRatios.management / 100);
        costs.overhead = totalProjectCost * (CONFIG.costRatios.overhead / 100);
        costs.broker = totalProjectCost * (CONFIG.costRatios.broker / 100);

        // Calculate totals
        const subtotal = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
        const tdsAmount = subtotal * (CONFIG.tdsPercentage / 100);
        const afterTds = subtotal - tdsAmount;
        const discountAmount = afterTds * (discount / 100);
        const finalAmount = afterTds - discountAmount;

        // Update UI
        this.updateCostDisplay(costs, subtotal, tdsAmount, discountAmount, finalAmount, discount);

        // Store calculation in global state
        AppState.currentCalculation = {
            costs,
            subtotal,
            tdsAmount,
            discountAmount,
            finalAmount,
            discount,
            projectName: this.projectNameInput.value || CONFIG.defaultProjectName,
            timestamp: new Date().toISOString()
        };

        // Enable PDF generation
        this.generatePdfBtn.disabled = false;
        
        Utils.showNotification('Costs calculated successfully!', 'success');
    }

    updateCostDisplay(costs, subtotal, tdsAmount, discountAmount, finalAmount, discount) {
        // Update cost amounts
        document.getElementById('dev-amount').textContent = Utils.formatCurrency(costs.development);
        document.getElementById('design-amount').textContent = Utils.formatCurrency(costs.design);
        document.getElementById('comm-amount').textContent = Utils.formatCurrency(costs.communication);
        document.getElementById('pm-amount').textContent = Utils.formatCurrency(costs.management);
        document.getElementById('overhead-amount').textContent = Utils.formatCurrency(costs.overhead);
        document.getElementById('broker-amount').textContent = Utils.formatCurrency(costs.broker);
        
        // Update totals
        document.getElementById('subtotal').textContent = Utils.formatCurrency(subtotal);
        document.getElementById('tds-amount').textContent = `-${Utils.formatCurrency(tdsAmount)}`;
        document.getElementById('final-amount').textContent = Utils.formatCurrency(finalAmount);

        // Handle discount display
        const discountRow = document.getElementById('discount-row');
        if (discount > 0) {
            discountRow.style.display = 'flex';
            document.getElementById('discount-amount').textContent = `-${Utils.formatCurrency(discountAmount)}`;
        } else {
            discountRow.style.display = 'none';
        }

        // Add animation to final amount
        const finalAmountElement = document.getElementById('final-amount');
        finalAmountElement.style.transform = 'scale(1.05)';
        setTimeout(() => {
            finalAmountElement.style.transform = 'scale(1)';
        }, 200);
    }

    resetCalculator() {
        this.devCostInput.value = '';
        this.designCostInput.value = '';
        this.discountInput.value = '0';
        this.projectNameInput.value = '';
        
        this.devCostInput.disabled = false;
        this.designCostInput.disabled = false;
        this.generatePdfBtn.disabled = true;

        // Reset display
        const amountElements = ['dev-amount', 'design-amount', 'comm-amount', 'pm-amount', 
                               'overhead-amount', 'broker-amount', 'subtotal', 'tds-amount', 'final-amount'];
        
        amountElements.forEach(id => {
            document.getElementById(id).textContent = '$0.00';
        });

        document.getElementById('discount-row').style.display = 'none';
        AppState.currentCalculation = null;
    }

    getCalculationSummary() {
        if (!AppState.currentCalculation) return null;

        const calc = AppState.currentCalculation;
        return {
            projectName: calc.projectName,
            totalCost: calc.finalAmount,
            breakdown: calc.costs,
            discount: calc.discount,
            tdsAmount: calc.tdsAmount,
            timestamp: calc.timestamp
        };
    }
}