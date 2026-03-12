// ===== TASK VIEW =====
function showTaskView() {
  const tv = document.getElementById('task-view');
  if (!tv.classList.contains('hidden')) { tv.classList.add('hidden'); return; }
  tv.classList.remove('hidden');
  const winsEl = document.getElementById('task-view-windows');
  const wins = [...OS.windows.values()].filter(w => !w.minimized && w.desktop === OS.currentDesktop);
  winsEl.innerHTML = wins.map(w => {
    const app = APP_DEFS[w.appId];
    return `<div class="tv-window-item ${w.id === OS.activeWindow ? 'selected' : ''}" onclick="focusWindow(${w.id});document.getElementById('task-view').classList.add('hidden')">
      <div class="tv-preview"><i class="${app?.icon || 'fas fa-window-maximize'}" style="color:${app?.color || 'var(--accent)'}"></i></div>
      <div class="tv-title">${w.title}</div>
    </div>`;
  }).join('');
  renderVirtualDesktops();
  setTimeout(() => {
    tv.addEventListener('click', e => { if (e.target === tv) tv.classList.add('hidden'); }, { once: true });
  }, 0);
}

// ===== SHOW DESKTOP =====
function showDesktop() {
  const anyVisible = [...OS.windows.values()].some(w => !w.minimized && w.desktop === OS.currentDesktop);
  if (anyVisible) {
    OS.windows.forEach(w => { if (w.desktop === OS.currentDesktop && !w.minimized) minimizeWindow(w.id); });
  } else {
    OS.windows.forEach(w => { if (w.desktop === OS.currentDesktop && w.minimized) { w.minimized = false; w.el.classList.remove('minimized'); } });
  }
  updateTaskbarApps();
}

// ===== VIRTUAL DESKTOPS =====
function initVirtualDesktops() { renderVirtualDesktops(); }

function renderVirtualDesktops() {
  const list = document.getElementById('vd-list');
  if (!list) return;
  list.innerHTML = OS.virtualDesktops.map((vd, i) => `
    <div class="vd-thumb ${i === OS.currentDesktop ? 'active' : ''}" onclick="switchDesktop(${i})">
      <span>Desktop ${i + 1}</span>
      ${OS.virtualDesktops.length > 1 ? `<span class="vd-close" onclick="event.stopPropagation();removeDesktop(${i})">&times;</span>` : ''}
    </div>`).join('');
}

function addVirtualDesktop() {
  OS.virtualDesktops.push({ id: OS.virtualDesktops.length, name: `Desktop ${OS.virtualDesktops.length + 1}`, windows: [] });
  renderVirtualDesktops();
}

function switchDesktop(i) {
  OS.windows.forEach(w => { if (w.desktop === OS.currentDesktop) w.el.style.display = 'none'; });
  OS.currentDesktop = i;
  OS.windows.forEach(w => { if (w.desktop === OS.currentDesktop) w.el.style.display = ''; });
  document.getElementById('task-view').classList.add('hidden');
  const ind = document.getElementById('vdesktop-indicator');
  const indText = document.getElementById('vdesktop-indicator-text');
  if (ind && indText) {
    indText.textContent = `Desktop ${i + 1}`;
    ind.classList.remove('hidden');
    setTimeout(() => ind.classList.add('hidden'), 1500);
  }
  updateTaskbarApps();
  renderVirtualDesktops();
}

function removeDesktop(i) {
  if (OS.virtualDesktops.length <= 1) return;
  OS.windows.forEach(w => { if (w.desktop === i) w.desktop = 0; });
  OS.virtualDesktops.splice(i, 1);
  if (OS.currentDesktop >= OS.virtualDesktops.length) OS.currentDesktop = OS.virtualDesktops.length - 1;
  switchDesktop(OS.currentDesktop);
}

// ===== ALT+TAB =====
function showAltTab() {
  const overlay = document.getElementById('alt-tab-overlay');
  const grid = document.getElementById('alt-tab-grid');
  const wins = [...OS.windows.values()].filter(w => w.desktop === OS.currentDesktop);
  if (wins.length === 0) return;
  if (OS.altTabIndex >= wins.length) OS.altTabIndex = 0;
  grid.innerHTML = wins.map((w, i) => {
    const app = APP_DEFS[w.appId];
    return `<div class="alt-tab-item ${i === OS.altTabIndex ? 'selected' : ''}" onclick="selectAltTab(${w.id})">
      <div class="at-preview"><i class="${app?.icon || 'fas fa-window-maximize'}" style="color:${app?.color || 'var(--accent)'}"></i></div>
      <div class="at-title">${w.title}</div>
    </div>`;
  }).join('');
  overlay.classList.remove('hidden');
  OS.altTabActive = true;
}

function hideAltTab() {
  document.getElementById('alt-tab-overlay').classList.add('hidden');
  OS.altTabActive = false;
}

function selectAltTab(winId) {
  hideAltTab();
  const w = OS.windows.get(winId);
  if (w?.minimized) { w.minimized = false; w.el.classList.remove('minimized'); }
  focusWindow(winId);
  updateTaskbarApps();
}
