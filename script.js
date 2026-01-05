/*
 * Advanced Calculator v3.0
 * Copyright © 2025 Anmol Rekta
 * All Rights Reserved
 */

// Calculator Class with Enhanced Error Messages and History
class Calculator {
    constructor(previousOperandElement, currentOperandElement, errorMessageElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.errorMessageElement = errorMessageElement;
        this.memory = 0;
        this.clear();
        this.history = [];
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.resetFlag = false;
        this.clearError();
    }

    showError(message) {
        this.errorMessageElement.textContent = message;
        this.errorMessageElement.classList.add('show');
        
        setTimeout(() => {
            this.clearError();
        }, 3000);
    }

    clearError() {
        this.errorMessageElement.classList.remove('show');
        setTimeout(() => {
            this.errorMessageElement.textContent = '';
        }, 300);
    }

    delete() {
        if (this.currentOperand === 'Error' || this.resetFlag) {
            this.clear();
            return;
        }
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '' || this.currentOperand === '-') {
            this.currentOperand = '0';
        }
    }

    appendNumber(number) {
        this.animateButton();
        
        if (this.currentOperand === 'Error' || this.resetFlag) {
            this.currentOperand = '0';
            this.resetFlag = false;
            this.clearError();
        }

        if (number === '.' && this.currentOperand.includes('.')) {
            this.showError('Decimal point already exists');
            return;
        }
        
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error') {
            this.clear();
            return;
        }

        if (operation === '%') {
            const current = parseFloat(this.currentOperand);
            
            if (this.previousOperand !== '' && this.operation) {
                const prev = parseFloat(this.previousOperand);
                
                switch (this.operation) {
                    case '+':
                        this.currentOperand = (prev + (prev * current / 100)).toString();
                        this.previousOperand = '';
                        this.operation = undefined;
                        break;
                    case '−':
                        this.currentOperand = (prev - (prev * current / 100)).toString();
                        this.previousOperand = '';
                        this.operation = undefined;
                        break;
                    case '×':
                        this.currentOperand = (prev * current / 100).toString();
                        this.previousOperand = '';
                        this.operation = undefined;
                        break;
                    case '÷':
                        if (current === 0) {
                            this.currentOperand = 'Error';
                            this.showError('Cannot calculate percentage with zero');
                        } else {
                            this.currentOperand = (prev / (current / 100)).toString();
                        }
                        this.previousOperand = '';
                        this.operation = undefined;
                        break;
                }
            } else {
                this.currentOperand = (current / 100).toString();
            }
            this.resetFlag = true;
            return;
        }

        if (operation === '√') {
            const current = parseFloat(this.currentOperand);
            if (current < 0) {
                this.currentOperand = 'Error';
                this.showError('Cannot calculate square root of negative number');
                this.resetFlag = true;
                return;
            }
            this.currentOperand = Math.sqrt(current).toString();
            this.resetFlag = true;
            return;
        }

        if (this.previousOperand !== '') {
            this.compute();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.previousOperand = '';
                    this.operation = undefined;
                    this.resetFlag = true;
                    this.showError('Cannot divide by zero');
                    
                    if (navigator.vibrate) {
                        navigator.vibrate(200);
                    }
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        computation = Math.round(computation * 1000000000000) / 1000000000000;
        
        this.addToHistory(`${prev} ${this.operation} ${current}`, computation);
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.resetFlag = true;
    }

    addToHistory(calculation, result) {
        this.history.unshift({
            calculation: calculation,
            result: result,
            timestamp: new Date().toLocaleTimeString()
        });
        
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<div class="empty-history">No calculations yet</div>';
            return;
        }
        
        historyList.innerHTML = this.history.map(item => `
            <div class="history-item" onclick="calculator.recallHistory('${item.result}')">
                <div class="history-calculation">${item.calculation}</div>
                <div class="history-result">= ${this.getDisplayNumber(item.result.toString())}</div>
            </div>
        `).join('');
    }

    recallHistory(value) {
        this.currentOperand = value.toString();
        this.resetFlag = true;
        this.updateDisplay();
    }

    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;

        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        if (this.currentOperand === 'Error') {
            this.currentOperandElement.innerText = 'Error';
            this.currentOperandElement.classList.add('error');
        } else {
            this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
            this.currentOperandElement.classList.remove('error');
        }

        if (this.operation != null) {
            this.previousOperandElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }

    memoryClear() {
        this.memory = 0;
        this.updateMemoryIndicator();
    }

    memoryRecall() {
        this.currentOperand = this.memory.toString();
        this.resetFlag = true;
    }

    memoryAdd() {
        const current = parseFloat(this.currentOperand);
        if (!isNaN(current)) {
            this.memory += current;
            this.updateMemoryIndicator();
        }
    }

    memorySubtract() {
        const current = parseFloat(this.currentOperand);
        if (!isNaN(current)) {
            this.memory -= current;
            this.updateMemoryIndicator();
        }
    }

    updateMemoryIndicator() {
        const indicator = document.getElementById('memoryIndicator');
        if (this.memory !== 0) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    }

    animateButton() {
        // Animation feedback
    }
}
// Initialize calculator
const previousOperandElement = document.getElementById('previousOperand');
const currentOperandElement = document.getElementById('currentOperand');
const errorMessageElement = document.getElementById('errorMessage');
const calculator = new Calculator(previousOperandElement, currentOperandElement, errorMessageElement);

// History Panel Toggle
const historyToggle = document.getElementById('historyToggle');
const historyPanel = document.getElementById('historyPanel');
let historyVisible = false;

historyToggle.addEventListener('click', () => {
    historyVisible = !historyVisible;
    if (historyVisible) {
        historyPanel.classList.add('show');
    } else {
        historyPanel.classList.remove('show');
    }
});

// Clear History
document.getElementById('clearHistory').addEventListener('click', () => {
    calculator.clearHistory();
});

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
let isDarkTheme = true;

themeToggle.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('light-theme');
    const icon = themeToggle.querySelector('.theme-icon');
    icon.textContent = isDarkTheme ? '🌙' : '☀️';
});

// Sound Effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playClickSound(frequency = 800) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function addButtonFeedback(button, soundFreq = 800) {
    playClickSound(soundFreq);
    const originalFilter = button.style.filter || '';
    button.style.filter = 'brightness(1.3)';
    setTimeout(() => {
        button.style.filter = originalFilter;
    }, 150);
}

// Number buttons
document.getElementById('zero').addEventListener('click', function() {
    addButtonFeedback(this, 700);
    calculator.appendNumber('0');
    calculator.updateDisplay();
});

document.getElementById('one').addEventListener('click', function() {
    addButtonFeedback(this, 750);
    calculator.appendNumber('1');
    calculator.updateDisplay();
});

document.getElementById('two').addEventListener('click', function() {
    addButtonFeedback(this, 800);
    calculator.appendNumber('2');
    calculator.updateDisplay();
});

document.getElementById('three').addEventListener('click', function() {
    addButtonFeedback(this, 850);
    calculator.appendNumber('3');
    calculator.updateDisplay();
});

document.getElementById('four').addEventListener('click', function() {
    addButtonFeedback(this, 900);
    calculator.appendNumber('4');
    calculator.updateDisplay();
});

document.getElementById('five').addEventListener('click', function() {
    addButtonFeedback(this, 950);
    calculator.appendNumber('5');
    calculator.updateDisplay();
});

document.getElementById('six').addEventListener('click', function() {
    addButtonFeedback(this, 1000);
    calculator.appendNumber('6');
    calculator.updateDisplay();
});

document.getElementById('seven').addEventListener('click', function() {
    addButtonFeedback(this, 1050);
    calculator.appendNumber('7');
    calculator.updateDisplay();
});

document.getElementById('eight').addEventListener('click', function() {
    addButtonFeedback(this, 1100);
    calculator.appendNumber('8');
    calculator.updateDisplay();
});

document.getElementById('nine').addEventListener('click', function() {
    addButtonFeedback(this, 1150);
    calculator.appendNumber('9');
    calculator.updateDisplay();
});

document.getElementById('decimal').addEventListener('click', function() {
    addButtonFeedback(this, 650);
    calculator.appendNumber('.');
    calculator.updateDisplay();
});

// Operation buttons
document.getElementById('add').addEventListener('click', function() {
    addButtonFeedback(this, 1200);
    calculator.chooseOperation('+');
    calculator.updateDisplay();
});

document.getElementById('subtract').addEventListener('click', function() {
    addButtonFeedback(this, 1100);
    calculator.chooseOperation('−');
    calculator.updateDisplay();
});

document.getElementById('multiply').addEventListener('click', function() {
    addButtonFeedback(this, 1000);
    calculator.chooseOperation('×');
    calculator.updateDisplay();
});

document.getElementById('divide').addEventListener('click', function() {
    addButtonFeedback(this, 900);
    calculator.chooseOperation('÷');
    calculator.updateDisplay();
});

document.getElementById('percentage').addEventListener('click', function() {
    addButtonFeedback(this, 1300);
    calculator.chooseOperation('%');
    calculator.updateDisplay();
});

document.getElementById('squareRoot').addEventListener('click', function() {
    addButtonFeedback(this, 1400);
    calculator.chooseOperation('√');
    calculator.updateDisplay();
});

// Function buttons
document.getElementById('equals').addEventListener('click', function() {
    addButtonFeedback(this, 1500);
    calculator.compute();
    calculator.updateDisplay();
});

document.getElementById('clear').addEventListener('click', function() {
    addButtonFeedback(this, 500);
    calculator.clear();
    calculator.updateDisplay();
});

document.getElementById('backspace').addEventListener('click', function() {
    addButtonFeedback(this, 600);
    calculator.delete();
    calculator.updateDisplay();
});

// Memory buttons
document.getElementById('memoryClear').addEventListener('click', function() {
    addButtonFeedback(this, 1250);
    calculator.memoryClear();
});

document.getElementById('memoryRecall').addEventListener('click', function() {
    addButtonFeedback(this, 1350);
    calculator.memoryRecall();
    calculator.updateDisplay();
});

document.getElementById('memoryAdd').addEventListener('click', function() {
    addButtonFeedback(this, 1450);
    calculator.memoryAdd();
});

document.getElementById('memorySubtract').addEventListener('click', function() {
    addButtonFeedback(this, 1550);
    calculator.memorySubtract();
});
// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        playClickSound(700 + parseInt(e.key) * 50);
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    
    if (e.key === '.') {
        playClickSound(650);
        calculator.appendNumber('.');
        calculator.updateDisplay();
    }
    
    if (e.key === '+') {
        playClickSound(1200);
        calculator.chooseOperation('+');
        calculator.updateDisplay();
    }
    
    if (e.key === '-') {
        playClickSound(1100);
        calculator.chooseOperation('−');
        calculator.updateDisplay();
    }
    
    if (e.key === '*') {
        playClickSound(1000);
        calculator.chooseOperation('×');
        calculator.updateDisplay();
    }
    
    if (e.key === '/') {
        e.preventDefault();
        playClickSound(900);
        calculator.chooseOperation('÷');
        calculator.updateDisplay();
    }
    
    if (e.key === '%') {
        playClickSound(1300);
        calculator.chooseOperation('%');
        calculator.updateDisplay();
    }
    
    if (e.key === 'Enter' || e.key === '=') {
        playClickSound(1500);
        calculator.compute();
        calculator.updateDisplay();
    }
    
    if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        playClickSound(500);
        calculator.clear();
        calculator.updateDisplay();
    }
    
    if (e.key === 'Backspace') {
        playClickSound(600);
        calculator.delete();
        calculator.updateDisplay();
    }
});

// Ripple effect
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Initial display update
calculator.updateDisplay();

// Copyright notice in console
console.log('%c© 2025 Anmol Rekta - Advanced Calculator v3.0', 'color: #667eea; font-size: 14px; font-weight: bold;');
console.log('%cAll Rights Reserved', 'color: #94a3b8; font-size: 12px;');
