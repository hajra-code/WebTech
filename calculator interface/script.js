const currentValue = document.getElementById("currentValue");
const previousValue = document.getElementById("previousValue");
const buttons = document.querySelector(".buttons");

let displayValue = "0";
let storedValue = null;
let selectedOperator = null;
let waitingForNumber = false;
let expression = "";
let finishedCalculation = false;

function updateDisplay() {
    currentValue.textContent = displayValue;
    previousValue.textContent = expression;
}

function formatNumber(number) {
    if (!Number.isFinite(number)) {
        return "Error";
    }

    return String(Number(number.toPrecision(12)));
}

function inputNumber(number) {
    if (displayValue === "Error" || waitingForNumber || finishedCalculation) {
        displayValue = number;
        waitingForNumber = false;
        finishedCalculation = false;
    } else if (displayValue === "0") {
        displayValue = number;
    } else if (displayValue === "-0") {
        displayValue = "-" + number;
    } else {
        displayValue += number;
    }

    updateDisplay();
}

function inputDecimal() {
    if (displayValue === "Error" || waitingForNumber || finishedCalculation) {
        displayValue = "0.";
        waitingForNumber = false;
        finishedCalculation = false;
    } else if (!displayValue.includes(".")) {
        displayValue += ".";
    }

    updateDisplay();
}

function clearCalculator() {
    displayValue = "0";
    storedValue = null;
    selectedOperator = null;
    waitingForNumber = false;
    expression = "";
    finishedCalculation = false;

    updateDisplay();
}

function changeSign() {
    if (displayValue === "Error") {
        return;
    }

    if (displayValue !== "0") {
        displayValue = displayValue.startsWith("-")
            ? displayValue.slice(1)
            : "-" + displayValue;
    }

    updateDisplay();
}

function calculate(first, second, operator) {
    switch (operator) {
        case "+":
            return first + second;

        case "-":
            return first - second;

        case "*":
            return first * second;

        case "/":
            if (second === 0) {
                return null;
            }
            return first / second;

        default:
            return second;
    }
}

function chooseOperator(operator) {
    if (displayValue === "Error") {
        return;
    }

    const inputValue = Number(displayValue);

    if (selectedOperator !== null &&
        !waitingForNumber) {

        const result = calculate(
            storedValue,
            inputValue,
            selectedOperator
        );

        if (result === null || !Number.isFinite(result)) {
            displayValue = "Error";
            storedValue = null;
            selectedOperator = null;
            expression = "Cannot divide by zero";
            waitingForNumber = true;
            updateDisplay();
            return;
        }

        displayValue = formatNumber(result);
    }

    storedValue = Number(displayValue);
    selectedOperator = operator;
    expression = displayValue + " " +
        getOperatorSymbol(operator);
    waitingForNumber = true;
    finishedCalculation = false;

    updateDisplay();
}

function getOperatorSymbol(operator) {
    switch (operator) {
        case "+":
            return "+";
        case "-":
            return "−";
        case "*":
            return "×";
        case "/":
            return "÷";
        default:
            return operator;
    }
}

function calculateResult() {
    if (selectedOperator === null ||
        waitingForNumber ||
        displayValue === "Error") {
        return;
    }

    const first = storedValue;
    const second = Number(displayValue);
    const operator = selectedOperator;

    const result = calculate(first, second, operator);

    if (result === null || !Number.isFinite(result)) {
        displayValue = "Error";
        expression = "Cannot divide by zero";
    } else {
        expression = first + " " +
            getOperatorSymbol(operator) + " " +
            second + " =";

        displayValue = formatNumber(result);
    }

    storedValue = null;
    selectedOperator = null;
    waitingForNumber = true;
    finishedCalculation = true;

    updateDisplay();
}

function calculatePercentage() {
    if (displayValue === "Error") {
        return;
    }

    displayValue = formatNumber(Number(displayValue) / 100);
    waitingForNumber = false;
    finishedCalculation = false;

    updateDisplay();
}

buttons.addEventListener("click", function(event) {
    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    if (button.dataset.number !== undefined) {
        inputNumber(button.dataset.number);
        return;
    }

    const action = button.dataset.action;

    switch (action) {
        case "clear":
            clearCalculator();
            break;

        case "sign":
            changeSign();
            break;

        case "percent":
            calculatePercentage();
            break;

        case "decimal":
            inputDecimal();
            break;

        case "operator":
            chooseOperator(button.dataset.operator);
            break;

        case "equals":
            calculateResult();
            break;
    }
});

document.addEventListener("keydown", function(event) {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
        inputNumber(key);
    } else if (key === ".") {
        inputDecimal();
    } else if (["+", "-", "*", "/"].includes(key)) {
        chooseOperator(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculateResult();
    } else if (key === "%") {
        calculatePercentage();
    } else if (key === "Escape") {
        clearCalculator();
    } else if (key === "Backspace") {
        if (displayValue !== "Error" &&
            !waitingForNumber &&
            !finishedCalculation) {

            displayValue = displayValue.length > 1
                ? displayValue.slice(0, -1)
                : "0";

            if (displayValue === "-") {
                displayValue = "0";
            }

            updateDisplay();
        }
    }
});

updateDisplay();