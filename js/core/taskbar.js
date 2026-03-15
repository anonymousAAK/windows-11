// ===== TASKBAR =====
function setupTaskbar() {
  applyTaskbarAlign(OS.taskbarAlign);
  const pinned = document.getElementById('taskbar-pinned');
  if (!pinned) return;
  const pinnedApps = Object.entries(APP_DEFS).filter(([, a]) => a.pinned).sort((a, b) => a[1].pinnedOrder - b[1].pinnedOrder);
  pinned.innerHTML = pinnedApps.map(([id, app]) => `
    <button class="taskbar-btn" id="tb-pinned-${id}" data-app="${id}" title="${app.title}"
      onclick="openApp('${id}')"
      onmouseenter="showThumbnail(event,'${id}')"
      onmouseleave="hideThumbnail()">
      <i class="${app.icon}" style="color:${app.color}"></i>
    </button>`).join('');
  const taskbar = document.getElementById('taskbar');
  if (taskbar) {
    taskbar.addEventListener('mouseenter', () => taskbar.classList.add('show'));
    taskbar.addEventListener('mouseleave', () => taskbar.classList.remove('show'));
  }
}

function applyTaskbarAlign(align) {
  OS.taskbarAlign = align;
  localStorage.setItem('win11_taskbar_align', align);
  const taskbar = document.getElementById('taskbar');
  const center = document.getElementById('taskbar-center');
  if (!taskbar || !center) return;
  if (align === 'center') {
    taskbar.style.justifyContent = '';
    center.style.cssText = 'display:flex;align-items:center;gap:2px;margin:0 auto';
    taskbar.classList.remove('align-left');
  } else {
    taskbar.style.justifyContent = 'flex-start';
    center.style.cssText = 'display:flex;align-items:center;gap:2px;';
    taskbar.classList.add('align-left');
  }
}

function setTaskbarAlign(align) { applyTaskbarAlign(align); }

function toggleAutoHide() {
  const taskbar = document.getElementById('taskbar');
  if (taskbar) taskbar.classList.toggle('auto-hide');
}

function updateTaskbarPinned() { setupTaskbar(); }

function updateTaskbarApps() {
  const container = document.getElementById('taskbar-apps');
  if (!container) return;
  const windows = [...OS.windows.values()].filter(w => w.desktop === OS.currentDesktop);
  container.innerHTML = windows.map(w => {
    const app = APP_DEFS[w.appId];
    const active = w.id === OS.activeWindow && !w.minimized;
    return `<button class="taskbar-btn ${active ? 'active' : 'running'}" id="tb-app-${w.id}"
      title="${w.title}"
      onclick="toggleWindowFromTaskbar(${w.id})"
      onmouseenter="showThumbnail(event,'',${w.id})"
      onmouseleave="hideThumbnail()">
      <i class="${app?.icon || 'fas fa-window-maximize'}" style="color:${app?.color || 'var(--accent)'}"></i>
    </button>`;
  }).join('');
}

// ===== THUMBNAIL PREVIEW =====
let thumbTimeout;
function showThumbnail(e, appId, winId) {
  hideThumbnail();
  thumbTimeout = setTimeout(() => {
    const existing = document.querySelector('.thumbnail-preview');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.className = 'thumbnail-preview';
    let title = appId ? (APP_DEFS[appId]?.title || appId) : '';
    let preview = '';
    if (winId) {
      const w = OS.windows.get(winId);
      if (w) {
        title = w.title;
        preview = `<i class="${APP_DEFS[w.appId]?.icon || 'fas fa-window-maximize'}" style="font-size:32px;color:${APP_DEFS[w.appId]?.color || 'var(--accent)'}"></i>`;
      }
    } else {
      const app = APP_DEFS[appId];
      if (app) preview = `<i class="${app.icon}" style="font-size:32px;color:${app.color}"></i>`;
    }
    div.innerHTML = `<div class="thumb-img">${preview}</div><div class="thumb-title">${title}</div>`;
    const rect = e.currentTarget.getBoundingClientRect();
    div.style.left = Math.max(4, rect.left + rect.width / 2 - 100) + 'px';
    document.body.appendChild(div);
    if (winId) {
      div.querySelector('.thumb-img').style.cursor = 'pointer';
      div.querySelector('.thumb-img').onclick = () => { focusWindow(winId); hideThumbnail(); };
    }
  }, 500);
}

function hideThumbnail() {
  clearTimeout(thumbTimeout);
  const el = document.querySelector('.thumbnail-preview');
  if (el) el.remove();
}

// ===== SYSTRAY =====
function toggleSysTray() {
  const expanded = document.getElementById('systray-expanded');
  if (!expanded) return;
  const isHidden = expanded.classList.contains('hidden');
  closeAllPanels();
  if (isHidden) expanded.classList.remove('hidden');
}
