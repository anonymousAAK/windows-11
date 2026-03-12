// ========== CLOCK ==========
function initClock(body, win) {
  const state = { tab: 'clock', running: false, elapsed: 0, laps: [], timerH: 0, timerM: 5, timerS: 0, timerRemaining: 0, timerRunning: false };
  let interval, timerInterval;
  function pad(n) { return String(Math.floor(n)).padStart(2,'0'); }
  function formatElapsed(ms) { const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000),s=Math.floor((ms%60000)/1000),cs=Math.floor((ms%1000)/10); return h>0?`${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`:`${pad(m)}:${pad(s)}.${pad(cs)}`; }
  function render() {
    const now = new Date();
    let content = '';
    if (state.tab === 'clock') {
      content = `<div class="clock-face">${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}</div>
        <div style="font-size:16px;color:var(--text2)">${now.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>`;
    } else if (state.tab === 'stopwatch') {
      content = `<div class="clock-face">${formatElapsed(state.elapsed)}</div>
        <div class="clock-controls">
          <button class="${state.running?'':'primary'}" onclick="this.closest('.window').__app.swToggle()">${state.running?'Stop':'Start'}</button>
          <button onclick="this.closest('.window').__app.swLap()"${!state.running?' disabled':''}>Lap</button>
          <button onclick="this.closest('.window').__app.swReset()">Reset</button>
        </div>
        <div class="clock-laps">
          ${state.laps.map((l,i)=>`<div class="clock-lap"><span>Lap ${state.laps.length-i}</span><span>${formatElapsed(l)}</span></div>`).reverse().join('')}
        </div>`;
    } else {
      const rem = state.timerRemaining;
      content = `<div class="clock-face">${pad(Math.floor(rem/3600))}:${pad(Math.floor((rem%3600)/60))}:${pad(rem%60)}</div>
        <div class="timer-input">
          <input type="number" min="0" max="23" value="${pad(state.timerH)}" onchange="this.closest('.window').__app.setTimer('h',this.value)"><span>h</span>
          <input type="number" min="0" max="59" value="${pad(state.timerM)}" onchange="this.closest('.window').__app.setTimer('m',this.value)"><span>m</span>
          <input type="number" min="0" max="59" value="${pad(state.timerS)}" onchange="this.closest('.window').__app.setTimer('s',this.value)"><span>s</span>
        </div>
        <div class="clock-controls">
          <button class="${state.timerRunning?'':'primary'}" onclick="this.closest('.window').__app.timerToggle()">${state.timerRunning?'Pause':'Start'}</button>
          <button onclick="this.closest('.window').__app.timerReset()">Reset</button>
        </div>`;
    }
    body.innerHTML = `<div class="clock-app">
      <div class="clock-tabs">
        ${[['clock','Clock'],['stopwatch','Stopwatch'],['timer','Timer']].map(([t,l])=>`<div class="clock-tab ${state.tab===t?'active':''}" onclick="this.closest('.window').__app.setTab('${t}')">${l}</div>`).join('')}
      </div>
      <div class="clock-content">${content}</div>
    </div>`;
    win.__app = {
      setTab: (t) => { state.tab = t; render(); },
      swToggle: () => {
        state.running = !state.running;
        if (state.running) { const start = Date.now() - state.elapsed; interval = setInterval(() => { state.elapsed = Date.now()-start; render(); }, 50); }
        else clearInterval(interval);
        render();
      },
      swLap: () => { if (state.running) { state.laps.push(state.elapsed); render(); } },
      swReset: () => { clearInterval(interval); state.running=false; state.elapsed=0; state.laps=[]; render(); },
      setTimer: (unit, val) => { state['timer'+unit.toUpperCase()] = parseInt(val)||0; state.timerRemaining = state.timerH*3600+state.timerM*60+state.timerS; render(); },
      timerToggle: () => {
        if (!state.timerRemaining && !state.timerRunning) { state.timerRemaining = state.timerH*3600+state.timerM*60+state.timerS; }
        state.timerRunning = !state.timerRunning;
        if (state.timerRunning) { timerInterval = setInterval(() => { if (state.timerRemaining > 0) { state.timerRemaining--; render(); } else { clearInterval(timerInterval); state.timerRunning=false; if (typeof showToast==='function') showToast('Clock','Timer finished!'); render(); } }, 1000); }
        else clearInterval(timerInterval);
        render();
      },
      timerReset: () => { clearInterval(timerInterval); state.timerRunning=false; state.timerRemaining=state.timerH*3600+state.timerM*60+state.timerS; render(); }
    };
    if (state.tab === 'clock') { interval = setTimeout(() => render(), 1000); }
  }
  win.addEventListener('remove', () => { clearInterval(interval); clearInterval(timerInterval); });
  render();
}
