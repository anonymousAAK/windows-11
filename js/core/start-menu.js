// ===== START MENU =====
function toggleStartMenu() {
  const menu = document.getElementById('start-menu');
  const open = !menu.classList.contains('hidden');
  closeAllPanels();
  if (!open) {
    menu.classList.remove('hidden');
    renderStartMenu();
    if (OS.taskbarAlign === 'left') menu.classList.add('align-left');
    else menu.classList.remove('align-left');
    setTimeout(() => document.getElementById('start-search-input')?.focus(), 50);
  }
}

function renderStartMenu() {
  const pinnedGrid = document.getElementById('start-pinned-grid');
  const allList = document.getElementById('start-all-list');
  const rec = document.getElementById('start-recommended');
  if (pinnedGrid) {
    pinnedGrid.innerHTML = Object.entries(APP_DEFS).slice(0, 12).map(([id, app]) => `
      <div class="start-pinned-item" onclick="openApp('${id}');closeAllPanels()">
        <div class="sp-icon"><i class="${app.icon}" style="color:${app.color}"></i></div>
        <div class="sp-label">${app.title}</div>
      </div>`).join('');
  }
  if (allList) {
    const sorted = Object.entries(APP_DEFS).sort((a, b) => a[1].title.localeCompare(b[1].title));
    allList.innerHTML = sorted.map(([id, app]) => `
      <div class="start-all-item" onclick="openApp('${id}');closeAllPanels()">
        <div class="sp-icon"><i class="${app.icon}" style="color:${app.color}"></i></div>
        <div class="sp-label">${app.title}</div>
      </div>`).join('');
  }
  if (rec) {
    const recApps = OS.recentApps.slice(0, 6).map(id => [id, APP_DEFS[id]]).filter(([, a]) => a);
    if (recApps.length === 0) {
      rec.innerHTML = '<div style="padding:8px;font-size:12px;color:var(--text2)">No recent apps</div>';
    } else {
      rec.innerHTML = recApps.map(([id, app]) =>
        `<div class="start-rec-item" onclick="openApp('${id}');closeAllPanels()">
          <div class="sr-icon"><i class="${app.icon}" style="color:${app.color}"></i></div>
          <div class="sr-info"><div class="sr-name">${app.title}</div><div class="sr-detail">Recently opened</div></div>
        </div>`).join('');
    }
  }
}

function filterStartApps(q) {
  q = q.toLowerCase();
  const pinned = document.getElementById('start-pinned-section');
  const all = document.getElementById('start-all-section');
  const rec = document.getElementById('start-recommended-section');
  const toggleBtn = document.getElementById('start-toggle-all');
  if (!q) {
    if (pinned) pinned.style.display = '';
    if (all) all.style.display = 'none';
    if (rec) rec.style.display = '';
    if (toggleBtn) toggleBtn.style.display = '';
    return;
  }
  if (pinned) pinned.style.display = 'none';
  if (rec) rec.style.display = 'none';
  if (toggleBtn) toggleBtn.style.display = 'none';
  if (all) {
    all.style.display = '';
    all.querySelectorAll('.start-all-item').forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }
}

function toggleAllApps() {
  const pinned = document.getElementById('start-pinned-section');
  const all = document.getElementById('start-all-section');
  const rec = document.getElementById('start-recommended-section');
  const showing = all.style.display !== 'none';
  pinned.style.display = showing ? '' : 'none';
  all.style.display = showing ? 'none' : '';
  rec.style.display = showing ? '' : 'none';
}

// ===== WIDGETS =====
function toggleWidgets() {
  const panel = document.getElementById('widget-panel');
  const open = !panel.classList.contains('hidden');
  closeAllPanels();
  if (!open) panel.classList.remove('hidden');
}

// ===== SEARCH =====
function toggleSearch() {
  const overlay = document.getElementById('search-overlay');
  const open = !overlay.classList.contains('hidden');
  closeAllPanels();
  if (!open) {
    overlay.classList.remove('hidden');
    setTimeout(() => document.getElementById('search-input')?.focus(), 50);
    filterSearch('');
  }
}

function filterSearch(q) {
  const results = document.getElementById('search-results');
  if (!results) return;
  q = (q || '').toLowerCase();
  const apps = Object.entries(APP_DEFS).filter(([, a]) => !q || a.title.toLowerCase().includes(q));
  const files = q ? VFS.list('C:/Users/User').filter(f => f.name.toLowerCase().includes(q)) : [];
  let html = '';
  if (!q) html += `<div style="font-size:11px;font-weight:600;color:var(--text2);padding:8px 12px">Apps</div>`;
  html += apps.slice(0, 8).map(([id, app]) =>
    `<div class="search-result-item" onclick="openApp('${id}');closeAllPanels()">
      <i class="${app.icon}" style="color:${app.color}"></i>
      <span>${app.title}</span>
    </div>`).join('');
  if (files.length) {
    html += `<div style="font-size:11px;font-weight:600;color:var(--text2);padding:8px 12px 4px">Files</div>`;
    html += files.slice(0, 4).map(f =>
      `<div class="search-result-item" onclick="openApp('explorer');closeAllPanels()">
        <i class="fas fa-file" style="color:var(--accent)"></i>
        <span>${f.name}</span>
      </div>`).join('');
  }
  results.innerHTML = html;
}
