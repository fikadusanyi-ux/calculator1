const screen = document.querySelector('#screen');
const memory = document.querySelector('#memory');
let current = '0';
let previous = null;
let operator = null;
let waiting = false;

const show = () => {
  screen.textContent = current;
  memory.textContent = previous !== null && operator ? `${previous} ${operator}` : '';
};

const tidy = number => Number.isFinite(number)
  ? String(Number(number.toPrecision(12)))
  : 'Error';

function enterDigit(digit) {
  if (current === 'Error' || waiting) {
    current = digit;
    waiting = false;
  } else {
    current = current === '0' ? digit : current.length < 16 ? current + digit : current;
  }
  show();
}

function calculate(left, right, operation) {
  switch (operation) {
    case '+': return left + right;
    case '−': return left - right;
    case '×': return left * right;
    case '÷': return right === 0 ? NaN : left / right;
    default: return right;
  }
}

function chooseOperator(nextOperator) {
  if (current === 'Error') return;
  const value = Number(current);
  if (previous !== null && operator && !waiting) {
    current = tidy(calculate(Number(previous), value, operator));
    previous = current;
  } else {
    previous = current;
  }
  operator = nextOperator;
  waiting = true;
  show();
}

function equals() {
  if (previous === null || !operator || current === 'Error') return;
  const right = Number(current);
  const result = tidy(calculate(Number(previous), right, operator));
  memory.textContent = `${previous} ${operator} ${current} =`;
  current = result;
  previous = null;
  operator = null;
  waiting = true;
  show();
}

function performAction(action) {
  if (action === 'clear') {
    current = '0';
    previous = null;
    operator = null;
    waiting = false;
  } else if (action === 'sign' && current !== '0' && current !== 'Error') {
    current = current.startsWith('-') ? current.slice(1) : `-${current}`;
  } else if (action === 'percent' && current !== 'Error') {
    current = tidy(Number(current) / 100);
  } else if (action === 'decimal' && current !== 'Error') {
    if (waiting) {
      current = '0.';
      waiting = false;
    } else if (!current.includes('.')) {
      current += '.';
    }
  } else if (action === 'equals') {
    equals();
    return;
  }
  show();
}

document.querySelector('.keys').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.digit !== undefined) enterDigit(button.dataset.digit);
  else if (button.dataset.op) chooseOperator(button.dataset.op);
  else performAction(button.dataset.action);
});

document.addEventListener('keydown', event => {
  if (/^[0-9]$/.test(event.key)) enterDigit(event.key);
  else if (event.key === '.' || event.key === ',') performAction('decimal');
  else if (event.key === 'Enter' || event.key === '=') {
    event.preventDefault();
    equals();
  } else if (event.key === 'Escape') performAction('clear');
  else if (event.key === 'Backspace') {
    if (!waiting && current !== 'Error') current = current.length > 1 ? current.slice(0, -1) : '0';
    show();
  } else if (['+', '-', '*', '/'].includes(event.key)) {
    chooseOperator(({ '+': '+', '-': '−', '*': '×', '/': '÷' })[event.key]);
  } else if (event.key === '%') performAction('percent');
});
