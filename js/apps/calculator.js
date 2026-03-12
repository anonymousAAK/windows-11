// ========== CALCULATOR ==========
function initCalculator(body, win) {
  const state = { mode: 'standard', display: '0', expression: '', memory: 0, history: [], justEvaluated: false };
  function render() {
    const modes = { standard: 'Standard', scientific: 'Scientific', programmer: 'Programmer' };
    let btns = '';
    if (state.mode === 'standard') {
      btns = `<div class="calc-buttons standard">
        ${['%','CE','C','⌫','1/x','x²','√','÷','7','8','9','×','4','5','6','-','1','2','3','+','±','0','.','='].map(b => {
          let cls = ''; if ('÷×-+'.includes(b)) cls = 'op'; if (b === '=') cls = 'eq'; if (['%','CE','C','⌫','1/x','x²','√'].includes(b)) cls = 'fn';
          return `<button class="calc-btn ${cls}" onclick="this.closest('.window').__app.press('${b}')">${b}</button>`;
        }).join('')}
      </div>`;
    } else if (state.mode === 'scientific') {
      btns = `<div class="calc-buttons scientific">
        ${['sin','cos','tan','π','e','x²','x³','xʸ','√','∛','log','ln','10ˣ','eˣ','n!','%','CE','C','⌫','÷','7','8','9','(','×','4','5','6',')','-','1','2','3','±','+','0','.',',','=',''].map(b => {
          if (!b) return '<button class="calc-btn" disabled></button>';
          let cls = ''; if ('÷×-+'.includes(b)) cls = 'op'; if (b === '=') cls = 'eq'; if (['sin','cos','tan','π','e','log','ln','10ˣ','eˣ','n!','x²','x³','xʸ','√','∛','%','CE','C','⌫','(',')'].includes(b)) cls = 'fn';
          return `<button class="calc-btn ${cls}" onclick="this.closest('.window').__app.press('${b}')">${b}</button>`;
        }).join('')}
      </div>`;
    } else {
      btns = `<div class="calc-buttons programmer">
        ${['AND','OR','XOR','NOT','<<','>>','C','⌫','7','8','9','÷','4','5','6','×','1','2','3','-','0','A-F','.','='].map(b => {
          let cls = ''; if ('÷×-+'.includes(b)) cls = 'op'; if (b === '=') cls = 'eq'; if (['AND','OR','XOR','NOT','<<','>>','C','⌫','A-F'].includes(b)) cls = 'fn';
          return `<button class="calc-btn ${cls}" onclick="this.closest('.window').__app.press('${b}')">${b}</button>`;
        }).join('')}
      </div>`;
    }
    body.innerHTML = `<div class="calculator">
      <div class="calc-mode-bar">
        ${Object.entries(modes).map(([k,v]) => `<button class="calc-mode-btn ${state.mode===k?'active':''}" onclick="this.closest('.window').__app.setMode('${k}')">${v}</button>`).join('')}
      </div>
      <div class="calc-display">
        <div class="calc-expression">${state.expression}</div>
        <div class="calc-result">${state.display}</div>
      </div>
      <div class="calc-memory">
        <button onclick="this.closest('.window').__app.memOp('MC')">MC</button>
        <button onclick="this.closest('.window').__app.memOp('MR')">MR</button>
        <button onclick="this.closest('.window').__app.memOp('M+')">M+</button>
        <button onclick="this.closest('.window').__app.memOp('M-')">M-</button>
      </div>
      ${btns}
      <div class="calc-history">${state.history.slice(-5).reverse().map(h => `<div class="calc-history-item">${h}</div>`).join('')}</div>
    </div>`;
  }
  function press(btn) {
    const num = parseFloat(state.display.replace(/,/g, ''));
    if ('0123456789'.includes(btn)) {
      if (state.display === '0' || state.justEvaluated) { state.display = btn; state.justEvaluated = false; }
      else state.display += btn;
    } else if (btn === '.') {
      if (state.justEvaluated) { state.display = '0.'; state.justEvaluated = false; }
      else if (!state.display.includes('.')) state.display += '.';
    } else if (btn === 'C') { state.display = '0'; state.expression = ''; }
    else if (btn === 'CE') { state.display = '0'; }
    else if (btn === '⌫') { state.display = state.display.length > 1 ? state.display.slice(0, -1) : '0'; }
    else if (btn === '±') { state.display = String(-num); }
    else if (btn === 'x²') { state.expression = `sqr(${num})`; state.display = String(num * num); state.justEvaluated = true; }
    else if (btn === '√') { state.expression = `√(${num})`; state.display = String(Math.sqrt(num)); state.justEvaluated = true; }
    else if (btn === '1/x') { state.expression = `1/(${num})`; state.display = String(1/num); state.justEvaluated = true; }
    else if (btn === '%') { state.display = String(num / 100); }
    else if (btn === 'sin') { state.display = String(Math.sin(num * Math.PI / 180)); state.justEvaluated = true; }
    else if (btn === 'cos') { state.display = String(Math.cos(num * Math.PI / 180)); state.justEvaluated = true; }
    else if (btn === 'tan') { state.display = String(Math.tan(num * Math.PI / 180)); state.justEvaluated = true; }
    else if (btn === 'π') { state.display = String(Math.PI); state.justEvaluated = true; }
    else if (btn === 'e') { state.display = String(Math.E); state.justEvaluated = true; }
    else if (btn === 'log') { state.display = String(Math.log10(num)); state.justEvaluated = true; }
    else if (btn === 'ln') { state.display = String(Math.log(num)); state.justEvaluated = true; }
    else if (btn === 'n!') { let f = 1; for (let i = 2; i <= num; i++) f *= i; state.display = String(f); state.justEvaluated = true; }
    else if (btn === '10ˣ') { state.display = String(Math.pow(10, num)); state.justEvaluated = true; }
    else if (btn === 'eˣ') { state.display = String(Math.exp(num)); state.justEvaluated = true; }
    else if (btn === 'x³') { state.display = String(num ** 3); state.justEvaluated = true; }
    else if (btn === '∛') { state.display = String(Math.cbrt(num)); state.justEvaluated = true; }
    else if ('÷×-+'.includes(btn)) {
      const ops = { '÷': '/', '×': '*', '-': '-', '+': '+' };
      state.expression = state.display + ' ' + btn + ' ';
      state._op = ops[btn]; state._prev = num; state.display = '0'; state.justEvaluated = false;
    } else if (btn === '=') {
      if (state._op) {
        let result;
        try { result = eval(state._prev + state._op + num); } catch { result = 'Error'; }
        state.expression = state._prev + ' ' + state._op + ' ' + num + ' =';
        state.history.push(state.expression + ' ' + result);
        state.display = String(result);
        state._op = null; state.justEvaluated = true;
      }
    }
    render();
  }
  function setMode(m) { state.mode = m; state.display = '0'; state.expression = ''; render(); }
  function memOp(op) {
    const num = parseFloat(state.display);
    if (op === 'MC') state.memory = 0;
    else if (op === 'MR') { state.display = String(state.memory); state.justEvaluated = true; }
    else if (op === 'M+') state.memory += num;
    else if (op === 'M-') state.memory -= num;
    render();
  }
  win.__app = { press, setMode, memOp };
  render();
  win.addEventListener('keydown', e => {
    if ('0123456789'.includes(e.key)) press(e.key);
    else if (e.key === '+') press('+');
    else if (e.key === '-') press('-');
    else if (e.key === '*') press('×');
    else if (e.key === '/') { e.preventDefault(); press('÷'); }
    else if (e.key === 'Enter' || e.key === '=') press('=');
    else if (e.key === 'Backspace') press('⌫');
    else if (e.key === 'Escape') press('C');
    else if (e.key === '.') press('.');
  });
}
