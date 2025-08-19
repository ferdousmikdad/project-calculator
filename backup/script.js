// script.js - Project Price Calculator Logic

// State management
const state = {
    basePrice: 0,
    categories: {
        development: { name: 'Development', percent: 40.5, amount: 0 },
        design: { name: 'UI/UX Design', percent: 26.5, amount: 0 },
        communication: { name: 'Client Communication', percent: 7.5, amount: 0 },
        pm: { name: 'Project Management & QA', percent: 7.5, amount: 0 },
        overhead: { name: 'Agency Overhead & Profit', percent: 10, amount: 0 },
        broker: { name: 'Broker Fee', percent: 8, amount: 0 }
    },
    tdsPercent: -10.0, // Changed from 10 to -10.0
    discountPercent: 0,
    subtotal: 0,
    tdsAmount: 0,
    discountAmount: 0,
    finalAmount: 0
};

// DOM Elements
const elements = {
    basePrice: document.getElementById('basePrice'),
    devPercent: document.getElementById('devPercent'),
    designPercent: document.getElementById('designPercent'),
    commPercent: document.getElementById('commPercent'),
    pmPercent: document.getElementById('pmPercent'),
    overheadPercent: document.getElementById('overheadPercent'),
    brokerPercent: document.getElementById('brokerPercent'),
    tdsPercent: document.getElementById('tdsPercent'),
    discountPercent: document.getElementById('discountPercent'),
    totalPercent: document.getElementById('totalPercent'),
    percentWarning: document.getElementById('percentWarning'),
    breakdownTable: document.getElementById('breakdownTable'),
    subtotalAmount: document.getElementById('subtotalAmount'),
    afterTDS: document.getElementById('afterTDS'),
    discountAmount: document.getElementById('discountAmount'),
    finalAmount: document.getElementById('finalAmount'),
    flowBase: document.getElementById('flowBase'),
    flowTDS: document.getElementById('flowTDS'),
    flowTDSPercent: document.getElementById('flowTDSPercent'),
    flowDiscount: document.getElementById('flowDiscount'),
    flowDiscountPercent: document.getElementById('flowDiscountPercent'),
    flowFinal: document.getElementById('flowFinal')
};

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

function parsePercentage(value) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
}

function highlightChange(element) {
    element.classList.add('input-changed');
    setTimeout(() => {
        element.classList.remove('input-changed');
    }, 1000);
}

// Calculation functions
function updateCategoryPercentages() {
    state.categories.development.percent = parsePercentage(elements.devPercent.value);
    state.categories.design.percent = parsePercentage(elements.designPercent.value);
    state.categories.communication.percent = parsePercentage(elements.commPercent.value);
    state.categories.pm.percent = parsePercentage(elements.pmPercent.value);
    state.categories.overhead.percent = parsePercentage(elements.overheadPercent.value);
    state.categories.broker.percent = parsePercentage(elements.brokerPercent.value);
    
    validatePercentages();
}

function validatePercentages() {
    const total = Object.values(state.categories).reduce((sum, cat) => sum + cat.percent, 0);
    const isValid = Math.abs(total - 100) < 0.01; // Allow for floating point precision
    
    elements.totalPercent.textContent = total.toFixed(1) + '%';
    
    if (!isValid) {
        elements.percentWarning.classList.remove('hidden');
        elements.totalPercent.classList.add('text-red-600');
        elements.totalPercent.classList.remove('text-green-600');
        
        // Add invalid styling to percentage inputs
        [elements.devPercent, elements.designPercent, elements.commPercent, 
         elements.pmPercent, elements.overheadPercent, elements.brokerPercent].forEach(el => {
            el.classList.add('percent-invalid');
            el.classList.remove('percent-valid');
        });
    } else {
        elements.percentWarning.classList.add('hidden');
        elements.totalPercent.classList.remove('text-red-600');
        elements.totalPercent.classList.add('text-green-600');
        
        // Add valid styling to percentage inputs
        [elements.devPercent, elements.designPercent, elements.commPercent, 
         elements.pmPercent, elements.overheadPercent, elements.brokerPercent].forEach(el => {
            el.classList.remove('percent-invalid');
            el.classList.add('percent-valid');
        });
    }
    
    return isValid;
}

function calculateAmounts() {
    // Get base price
    state.basePrice = parseFloat(elements.basePrice.value) || 0;
    
    // Calculate category amounts
    Object.values(state.categories).forEach(category => {
        category.amount = (state.basePrice * category.percent) / 100;
    });
    
    // Calculate subtotal (should equal base price if percentages are correct)
    state.subtotal = Object.values(state.categories).reduce((sum, cat) => sum + cat.amount, 0);
    
    // Get TDS and discount percentages
    state.tdsPercent = parsePercentage(elements.tdsPercent.value);
    state.discountPercent = parsePercentage(elements.discountPercent.value);
    
    // Calculate TDS amount (on subtotal) as a deduction
    state.tdsAmount = (state.subtotal * state.tdsPercent) / 100; // Removed * -1 since tdsPercent is negative
    const afterTDS = state.subtotal + state.tdsAmount; // This will now subtract TDS
    
    // Calculate discount amount (on amount after TDS)
    state.discountAmount = (afterTDS * state.discountPercent) / 100;
    
    // Calculate final amount
    state.finalAmount = afterTDS - state.discountAmount;
    
    updateUI();
}

function updateUI() {
    // Update breakdown table
    const tableRows = [
        { ...state.categories.development, key: 'development' },
        { ...state.categories.design, key: 'design' },
        { ...state.categories.communication, key: 'communication' },
        { ...state.categories.pm, key: 'pm' },
        { ...state.categories.overhead, key: 'overhead' },
        { ...state.categories.broker, key: 'broker' }
    ];
    
    elements.breakdownTable.innerHTML = tableRows.map(cat => `
        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td class="py-3 px-4 text-gray-800">${cat.name}</td>
            <td class="text-center py-3 px-4 text-gray-600">${cat.percent.toFixed(1)}%</td>
            <td class="text-right py-3 px-4 font-medium text-gray-800">${formatCurrency(cat.amount)}</td>
        </tr>
    `).join('');
    
    // Update subtotal
    elements.subtotalAmount.textContent = formatCurrency(state.subtotal);
    
    // Update summary cards
    const afterTDS = state.subtotal + state.tdsAmount;
    elements.afterTDS.textContent = formatCurrency(afterTDS);
    elements.discountAmount.textContent = formatCurrency(state.discountAmount);
    elements.finalAmount.textContent = formatCurrency(state.finalAmount);
    
    // Update calculation flow
    elements.flowBase.textContent = formatCurrency(state.basePrice);
    elements.flowTDS.textContent = formatCurrency(state.tdsAmount);
    elements.flowTDSPercent.textContent = state.tdsPercent.toFixed(1);
    elements.flowDiscount.textContent = formatCurrency(state.discountAmount);
    elements.flowDiscountPercent.textContent = state.discountPercent.toFixed(1);
    elements.flowFinal.textContent = formatCurrency(state.finalAmount);
}

// Event listeners
function attachEventListeners() {
    // Base price input
    elements.basePrice.addEventListener('input', (e) => {
        highlightChange(e.target);
        calculateAmounts();
    });
    
    // Category percentage inputs
    const percentInputs = [
        elements.devPercent,
        elements.designPercent,
        elements.commPercent,
        elements.pmPercent,
        elements.overheadPercent,
        elements.brokerPercent
    ];
    
    percentInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            highlightChange(e.target);
            updateCategoryPercentages();
            calculateAmounts();
        });
        
        // Add blur event to format percentage
        input.addEventListener('blur', (e) => {
            const value = parsePercentage(e.target.value);
            e.target.value = value.toFixed(1);
        });
    });
    
    // TDS percentage input
    elements.tdsPercent.addEventListener('input', (e) => {
        highlightChange(e.target);
        calculateAmounts();
    });
    
    // Discount percentage input
    elements.discountPercent.addEventListener('input', (e) => {
        highlightChange(e.target);
        calculateAmounts();
    });
    
    // Format percentages on blur
    [elements.tdsPercent, elements.discountPercent].forEach(input => {
        input.addEventListener('blur', (e) => {
            const value = parsePercentage(e.target.value);
            e.target.value = value.toFixed(1);
        });
    });
    
    // Prevent negative values
    document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', (e) => {
        if (e.target.id !== 'tdsPercent' && e.target.value < 0) {
            e.target.value = 0;
        }
    });
});
}

// Quick fill for testing
function addQuickFillButton() {
    const header = document.querySelector('header');
    const quickFillBtn = document.createElement('button');
    quickFillBtn.textContent = 'Quick Fill (Demo)';
    quickFillBtn.className = 'ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm';
    quickFillBtn.addEventListener('click', () => {
        elements.basePrice.value = 500000;
        highlightChange(elements.basePrice);
        calculateAmounts();
    });
    header.appendChild(quickFillBtn);
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to calculate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            calculateAmounts();
        }
        
        // Escape to clear all inputs
        if (e.key === 'Escape') {
            if (confirm('Clear all inputs?')) {
                document.querySelectorAll('input[type="number"]').forEach(input => {
                    if (input.id !== 'tdsPercent') { // Keep default TDS
                        input.value = input.id.includes('Percent') ? 
                            (input.dataset.default || 0) : '';
                    }
                });
                
                // Reset to default percentages
                elements.devPercent.value = 40.5;
                elements.designPercent.value = 26.5;
                elements.commPercent.value = 7.5;
                elements.pmPercent.value = 7.5;
                elements.overheadPercent.value = 10;
                elements.brokerPercent.value = 8;
                elements.discountPercent.value = 0;
                
                updateCategoryPercentages();
                calculateAmounts();
            }
        }
    });
}

// Auto-save to localStorage
function setupAutoSave() {
    // Save state to localStorage
    function saveState() {
        const dataToSave = {
            basePrice: elements.basePrice.value,
            percentages: {
                dev: elements.devPercent.value,
                design: elements.designPercent.value,
                comm: elements.commPercent.value,
                pm: elements.pmPercent.value,
                overhead: elements.overheadPercent.value,
                broker: elements.brokerPercent.value,
                tds: elements.tdsPercent.value,
                discount: elements.discountPercent.value
            }
        };
        // Note: localStorage is not available in Claude artifacts, but this code is here for reference
        try {
            // This would work in a regular browser environment
            // localStorage.setItem('projectCalculatorState', JSON.stringify(dataToSave));
        } catch (e) {
            // Silent fail in Claude environment
        }
    }
    
    // Auto-save on input changes
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', saveState);
    });
}

// Print functionality
function setupPrintFunction() {
    const printBtn = document.createElement('button');
    printBtn.innerHTML = '🖨️ Print Report';
    printBtn.className = 'fixed bottom-4 right-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg';
    printBtn.addEventListener('click', () => {
        window.print();
    });
    document.body.appendChild(printBtn);
}

// Initialize the application
function init() {
    // Set default TDS input value
    elements.tdsPercent.value = state.tdsPercent.toFixed(1); // Add this line

    // Set up event listeners
    attachEventListeners();
    
    // Add demo button
    addQuickFillButton();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Set up auto-save (won't work in Claude, but good for production)
    setupAutoSave();
    
    // Add print button
    setupPrintFunction();
    
    // Initial calculation
    updateCategoryPercentages();
    calculateAmounts();
    
    // Focus on base price input
    elements.basePrice.focus();
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}