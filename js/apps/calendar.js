// ========== CALENDAR ==========
function initCalendar(body, win) {
  const state = { year: new Date().getFullYear(), month: new Date().getMonth(), events: JSON.parse(localStorage.getItem('win11_cal_events')||'{}') };
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  function render() {
    const first = new Date(state.year, state.month, 1).getDay();
    const daysInMonth = new Date(state.year, state.month+1, 0).getDate();
    const today = new Date();
    let cells = '';
    for (let i = 0; i < first; i++) cells += `<div></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = today.getDate()===d && today.getMonth()===state.month && today.getFullYear()===state.year;
      const key = `${state.year}-${state.month+1}-${d}`;
      const hasEvent = state.events[key];
      cells += `<div class="cal-day ${isToday?'today':''}" onclick="this.closest('.window').__app.clickDay(${d})" title="${hasEvent||''}">${d}${hasEvent?'<span style="display:block;width:4px;height:4px;border-radius:50%;background:${isToday?\'#fff\':\'var(--accent)\'};margin:0 auto"></span>':''}</div>`;
    }
    body.innerHTML = `<div class="calendar-app">
      <div class="cal-header">
        <button onclick="this.closest('.window').__app.prevMonth()"><i class="fas fa-chevron-left"></i></button>
        <h2>${MONTHS[state.month]} ${state.year}</h2>
        <button onclick="this.closest('.window').__app.nextMonth()"><i class="fas fa-chevron-right"></i></button>
        <button onclick="this.closest('.window').__app.goToday()" style="font-size:12px">Today</button>
      </div>
      <div class="cal-grid">
        ${DAYS.map(d=>`<div class="cal-day-header">${d}</div>`).join('')}
        ${cells}
      </div>
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">
        <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:8px">Upcoming Events</div>
        ${Object.entries(state.events).filter(([k])=>k.startsWith(`${state.year}-${state.month+1}`)).map(([k,v])=>`<div style="padding:6px 0;font-size:12px;border-bottom:1px solid var(--border);color:var(--text)"><span style="color:var(--text2)">${k}: </span>${v}</div>`).join('') || '<div style="font-size:12px;color:var(--text2)">No events this month</div>'}
      </div>
    </div>`;
    win.__app = {
      prevMonth: () => { state.month--; if (state.month < 0) { state.month = 11; state.year--; } render(); },
      nextMonth: () => { state.month++; if (state.month > 11) { state.month = 0; state.year++; } render(); },
      goToday: () => { state.year = new Date().getFullYear(); state.month = new Date().getMonth(); render(); },
      clickDay: (d) => {
        const key = `${state.year}-${state.month+1}-${d}`;
        const ev = prompt(`Event for ${MONTHS[state.month]} ${d}:`, state.events[key]||'');
        if (ev !== null) { if (ev) state.events[key] = ev; else delete state.events[key]; localStorage.setItem('win11_cal_events', JSON.stringify(state.events)); render(); }
      }
    };
  }
  render();
}
