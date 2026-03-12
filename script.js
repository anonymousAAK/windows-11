// ===== GLOBAL STATE =====
window._bootTime = Date.now();
const OS = {
  windows: new Map(),
  windowCounter: 0,
  zCounter: 100,
  activeWindow: null,
  virtualDesktops: [{ id: 0, name: 'Desktop 1', windows: [] }],
  currentDesktop: 0,
  altTabIndex: 0,
  altTabActive: false,
  clipBoard: null,
  dndMode: false,
  pinnedApps: [],
  recentApps: [],
  iconSize: 'normal',
  taskbarAlign: localStorage.getItem('win11_taskbar_align') || 'center',
  notifications: JSON.parse(localStorage.getItem('win11_notifications') || '[]'),
  notifBadge: 0,
  snapState: null,
  wallpapers: [
    'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)',
    'linear-gradient(135deg,#0f3460,#533483,#e94560)',
    'linear-gradient(135deg,#0d0d0d,#1a1a1a,#2d2d2d)',
    'linear-gradient(135deg,#006994,#00b4d8,#90e0ef)',
    'linear-gradient(135deg,#2d6a4f,#40916c,#74c69d)',
    'linear-gradient(135deg,#7b2d8b,#a855f7,#ec4899)',
    'linear-gradient(135deg,#d62828,#f77f00,#fcbf49)',
    'linear-gradient(135deg,#1e3a5f,#2196f3,#64b5f6)',
  ]
};
window._accentColor = localStorage.getItem('win11_accent') || '#0078d4';
window._currentWallpaper = parseInt(localStorage.getItem('win11_wallpaper') || '0');
window._brightness = parseFloat(localStorage.getItem('win11_brightness') || '1');

// ===== BOOT SEQUENCE =====
document.addEventListener('DOMContentLoaded', () => {
  applyAccentColor(window._accentColor);
  if (localStorage.getItem('win11_dark') === 'true') document.body.classList.add('dark');
  document.body.style.filter = `brightness(${window._brightness})`;
  setWallpaperByIndex(window._currentWallpaper);
  setTimeout(() => {
    document.getElementById('boot-screen').classList.remove('active');
    document.getElementById('lock-screen').classList.add('active');
    updateLockTime();
  }, 2200);
  document.getElementById('lock-screen').addEventListener('click', showLoginScreen);
  document.addEventListener('keydown', e => {
    if (document.getElementById('lock-screen').classList.contains('active')) showLoginScreen();
  });
  document.getElementById('login-btn').addEventListener('click', login);
  document.getElementById('login-password').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  setInterval(updateLockTime, 1000);
  setInterval(updateTaskbarClock, 1000);
  initKeyboardShortcuts();
  // Focus window on click anywhere in it
  document.addEventListener('mousedown', focusWindowOnClick);
});

function focusWindowOnClick(e) {
  const win = e.target.closest('.window');
  if (win) {
    const id = parseInt(win.id.replace('win-', ''));
    if (id && OS.windows.has(id)) focusWindow(id);
  }
}

function updateLockTime() {
  const now = new Date();
  const el = document.getElementById('lock-time');
  const el2 = document.getElementById('lock-date');
  if (el) el.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (el2) el2.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function updateTaskbarClock() {
  const now = new Date();
  const te = document.getElementById('taskbar-time');
  const de = document.getElementById('taskbar-date');
  if (te) te.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (de) de.textContent = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
}

function showLoginScreen() {
  document.getElementById('lock-screen').classList.remove('active');
  document.getElementById('login-screen').classList.add('active');
  setTimeout(() => document.getElementById('login-password').focus(), 100);
}

function login() {
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('desktop').classList.add('active');
  loadDesktop();
  setTimeout(() => {
    showToast('Windows 11', 'Welcome back, User!', ['View notifications']);
  }, 800);
}

// ===== DESKTOP INIT =====
function loadDesktop() {
  setupTaskbar();
  loadDesktopIcons();
  initVirtualDesktops();
  updateTaskbarClock();
}

// ===== WALLPAPER =====
function setWallpaperByIndex(i) {
  const desktop = document.getElementById('desktop');
  if (desktop) { desktop.style.background = OS.wallpapers[i % OS.wallpapers.length]; desktop.style.backgroundSize = 'cover'; }
}
function setWallpaper(i) {
  window._currentWallpaper = i;
  localStorage.setItem('win11_wallpaper', i);
  setWallpaperByIndex(i);
}
function changeWallpaper() { openApp('settings'); }

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
    return `<button class="taskbar-btn ${active ? 'active' : ''}" id="tb-app-${w.id}"
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

// ===== DESKTOP ICONS =====
const DESKTOP_ICONS = [
  { id: 'explorer', label: 'File Explorer', icon: 'fas fa-folder', color: '#ffb900', app: 'explorer' },
  { id: 'edge', label: 'Edge', icon: 'fas fa-globe', color: '#0078d4', app: 'edge' },
  { id: 'recycle', label: 'Recycle Bin', icon: 'fas fa-trash', color: '#0078d4', app: null },
  { id: 'user-docs', label: 'Documents', icon: 'fas fa-file-alt', color: '#0078d4', app: 'explorer' },
  { id: 'minesweeper', label: 'Minesweeper', icon: 'fas fa-bomb', color: '#607d8b', app: 'minesweeper' },
  { id: 'snake', label: 'Snake', icon: 'fas fa-gamepad', color: '#4caf50', app: 'snake' },
];

function loadDesktopIcons() {
  const area = document.getElementById('desktop-area');
  if (!area) return;
  area.innerHTML = '';
  const icons = DESKTOP_ICONS;
  icons.forEach((icon, i) => {
    const el = document.createElement('div');
    el.className = 'desktop-icon';
    el.dataset.id = icon.id;
    el.dataset.app = icon.app || '';
    el.innerHTML = `<span class="icon"><i class="${icon.icon}" style="color:${icon.color}"></i></span>
      <span class="icon-label">${icon.label}</span>`;
    const col = Math.floor(i / 6), row = i % 6;
    el.style.left = (8 + col * 88) + 'px';
    el.style.top = (8 + row * 90) + 'px';
    el.addEventListener('click', (e) => { e.stopPropagation(); selectIcon(el); });
    el.addEventListener('dblclick', () => { if (icon.app) openApp(icon.app); });
    el.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); showIconContextMenu(e, icon, el); });
    makeDraggable(el, area);
    area.appendChild(el);
  });
  setupDesktopContextMenu();
}

function selectIcon(el) {
  document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
  el.classList.add('selected');
}

function makeDraggable(el, container) {
  let startX, startY, startLeft, startTop, dragging = false;
  el.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    startX = e.clientX; startY = e.clientY;
    startLeft = parseInt(el.style.left) || 0; startTop = parseInt(el.style.top) || 0;
    dragging = false;
    const onMove = ev => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (!dragging && Math.sqrt(dx * dx + dy * dy) > 5) { dragging = true; el.classList.add('dragging'); }
      if (dragging) {
        el.style.left = Math.max(0, startLeft + dx) + 'px';
        el.style.top = Math.max(0, startTop + dy) + 'px';
      }
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      el.classList.remove('dragging');
      if (dragging) snapToGrid(el);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

function snapToGrid(el) {
  const gridSize = 88;
  const left = Math.round(parseInt(el.style.left) / gridSize) * gridSize;
  const top = Math.round(parseInt(el.style.top) / 90) * 90;
  el.style.left = Math.max(8, left) + 'px';
  el.style.top = Math.max(8, top) + 'px';
}

function sortDesktopIcons() {
  const area = document.getElementById('desktop-area');
  if (!area) return;
  const icons = [...area.querySelectorAll('.desktop-icon')];
  icons.sort((a, b) => a.querySelector('.icon-label').textContent.localeCompare(b.querySelector('.icon-label').textContent));
  icons.forEach((icon, i) => {
    icon.style.left = (8 + Math.floor(i / 6) * 88) + 'px';
    icon.style.top = (8 + (i % 6) * 90) + 'px';
  });
}

function autoArrangeIcons() {
  const area = document.getElementById('desktop-area');
  if (!area) return;
  area.querySelectorAll('.desktop-icon').forEach((icon, i) => {
    icon.style.left = (8 + Math.floor(i / 6) * 88) + 'px';
    icon.style.top = (8 + (i % 6) * 90) + 'px';
  });
}

function cycleIconSize() {
  const sizes = ['normal', 'small', 'large'];
  const desktop = document.getElementById('desktop');
  const cur = sizes.indexOf(OS.iconSize);
  OS.iconSize = sizes[(cur + 1) % sizes.length];
  // remove old size classes, keep active
  desktop.classList.remove('icon-size-normal', 'icon-size-small', 'icon-size-large');
  if (OS.iconSize !== 'normal') desktop.classList.add('icon-size-' + OS.iconSize);
}

function createNewFolder() {
  VFS.mkdir('C:/Users/User/Desktop/New Folder');
  const icon = { id: 'folder-' + Date.now(), label: 'New Folder', icon: 'fas fa-folder', color: '#ffb900', app: 'explorer' };
  DESKTOP_ICONS.push(icon);
  loadDesktopIcons();
}

function createNewTextFile() {
  VFS.write('C:/Users/User/Desktop/New Text Document.txt', '');
  const icon = { id: 'file-' + Date.now(), label: 'New Text Document.txt', icon: 'fas fa-file-alt', color: '#0078d4', app: 'notepad' };
  DESKTOP_ICONS.push(icon);
  loadDesktopIcons();
}

function refreshDesktop() { loadDesktopIcons(); showToast('Desktop', 'Refreshed'); }

// ===== CONTEXT MENUS =====
function setupDesktopContextMenu() {
  const area = document.getElementById('desktop-area');
  if (!area) return;
  area.addEventListener('contextmenu', e => { e.preventDefault(); showContextMenu(e.clientX, e.clientY); });
  document.addEventListener('click', () => {
    document.getElementById('context-menu')?.classList.add('hidden');
    document.getElementById('icon-context-menu')?.classList.add('hidden');
  });
}

function showContextMenu(x, y) {
  const menu = document.getElementById('context-menu');
  if (!menu) return;
  menu.style.left = x + 'px'; menu.style.top = y + 'px';
  menu.classList.remove('hidden');
  document.getElementById('icon-context-menu')?.classList.add('hidden');
  requestAnimationFrame(() => {
    const r = menu.getBoundingClientRect();
    if (r.right > window.innerWidth) menu.style.left = (x - r.width) + 'px';
    if (r.bottom > window.innerHeight) menu.style.top = (y - r.height) + 'px';
  });
}

function showIconContextMenu(e, icon, el) {
  const menu = document.getElementById('icon-context-menu');
  if (!menu) return;
  menu.style.left = e.clientX + 'px'; menu.style.top = e.clientY + 'px';
  menu.classList.remove('hidden');
  document.getElementById('context-menu')?.classList.add('hidden');
  menu.querySelector('#ctx-open-item').onclick = () => { if (icon.app) openApp(icon.app); menu.classList.add('hidden'); };
  menu.querySelector('#ctx-rename-item').onclick = () => { renameIcon(el); menu.classList.add('hidden'); };
  menu.querySelector('#ctx-delete-item').onclick = () => { el.remove(); menu.classList.add('hidden'); };
  menu.querySelector('#ctx-pin-taskbar').onclick = () => { showToast('Taskbar', `${icon.label} pinned to taskbar`); menu.classList.add('hidden'); };
}

function renameIcon(el) {
  const label = el.querySelector('.icon-label');
  label.contentEditable = true; label.focus();
  const range = document.createRange();
  range.selectNodeContents(label);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  label.onblur = () => { label.contentEditable = false; };
  label.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); label.blur(); } };
}

// ===== WINDOW MANAGEMENT =====
function openApp(appId, opts) {
  const def = APP_DEFS[appId];
  if (!def) return;
  // Single-instance check (not for notepad which can open files)
  if (!opts || !opts.file) {
    for (const [id, w] of OS.windows) {
      if (w.appId === appId && w.desktop === OS.currentDesktop) {
        if (w.minimized) { w.minimized = false; w.el.classList.remove('minimized'); }
        focusWindow(id);
        return;
      }
    }
  }
  OS.recentApps = OS.recentApps.filter(id => id !== appId);
  OS.recentApps.unshift(appId);
  if (OS.recentApps.length > 8) OS.recentApps.pop();
  const winId = ++OS.windowCounter;
  const w = parseInt(def.width) || 700, h = parseInt(def.height) || 480;
  const x = 40 + (winId % 10) * 30;
  const y = 40 + (winId % 8) * 25;
  const el = document.createElement('div');
  el.className = 'window';
  el.id = `win-${winId}`;
  el.tabIndex = -1;
  el.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;z-index:${++OS.zCounter}`;
  el.innerHTML = `
    <div class="resize-handle rh-n" data-dir="n"></div><div class="resize-handle rh-s" data-dir="s"></div>
    <div class="resize-handle rh-e" data-dir="e"></div><div class="resize-handle rh-w" data-dir="w"></div>
    <div class="resize-handle rh-nw" data-dir="nw"></div><div class="resize-handle rh-ne" data-dir="ne"></div>
    <div class="resize-handle rh-sw" data-dir="sw"></div><div class="resize-handle rh-se" data-dir="se"></div>
    <div class="titlebar" id="titlebar-${winId}">
      <div class="titlebar-icon"><i class="${def.icon}" style="color:${def.color}"></i></div>
      <div class="titlebar-title">${def.title}</div>
      <div class="titlebar-controls">
        <button class="titlebar-btn minimize-btn" onclick="minimizeWindow(${winId})"><i class="fas fa-minus"></i></button>
        <button class="titlebar-btn maximize-btn" onmouseenter="showSnapLayout(${winId},this)" onmouseleave="scheduleHideSnap(${winId})" onclick="toggleMaximize(${winId})"><i class="fas fa-square" style="font-size:9px"></i></button>
        <button class="titlebar-btn close-btn" onclick="closeWindow(${winId})"><i class="fas fa-times"></i></button>
      </div>
    </div>
    <div class="window-body" id="winbody-${winId}"></div>`;
  document.getElementById('windows-container').appendChild(el);
  const winObj = { id: winId, appId, title: def.title, el, minimized: false, maximized: false, desktop: OS.currentDesktop, prevGeom: null };
  OS.windows.set(winId, winObj);
  const body = el.querySelector(`#winbody-${winId}`);
  if (def.init) {
    try { def.init(body, el, opts); }
    catch (e) { console.error('App init error:', appId, e); body.innerHTML = `<div style="padding:20px;color:red">Error loading app: ${e.message}</div>`; }
  }
  setupWindowDrag(el, winId);
  setupWindowResize(el, winId);
  focusWindow(winId);
  updateTaskbarApps();
  return winId;
}

function closeWindow(winId) {
  const w = OS.windows.get(winId);
  if (!w) return;
  w.el.classList.add('closing');
  w.el.dispatchEvent(new Event('remove'));
  setTimeout(() => {
    w.el.remove();
    OS.windows.delete(winId);
    if (OS.activeWindow === winId) {
      const remaining = [...OS.windows.values()].filter(w => !w.minimized && w.desktop === OS.currentDesktop);
      OS.activeWindow = remaining.length ? remaining[remaining.length - 1].id : null;
      if (OS.activeWindow) focusWindow(OS.activeWindow);
    }
    updateTaskbarApps();
  }, 150);
  document.getElementById('start-menu')?.classList.add('hidden');
}

function minimizeWindow(winId) {
  const w = OS.windows.get(winId);
  if (!w) return;
  w.minimized = true;
  w.el.classList.add('minimized');
  if (OS.activeWindow === winId) {
    const remaining = [...OS.windows.values()].filter(w => !w.minimized && w.desktop === OS.currentDesktop);
    OS.activeWindow = remaining.length ? remaining[remaining.length - 1].id : null;
    if (OS.activeWindow) focusWindow(OS.activeWindow);
  }
  updateTaskbarApps();
}

function toggleMaximize(winId) {
  const w = OS.windows.get(winId);
  if (!w) return;
  if (w.maximized) {
    w.maximized = false;
    w.el.classList.remove('maximized');
    if (w.prevGeom) {
      const { left, top, width, height, zIndex } = w.prevGeom;
      w.el.style.cssText = `left:${left}px;top:${top}px;width:${width}px;height:${height}px;z-index:${zIndex || OS.zCounter}`;
    }
  } else {
    w.prevGeom = {
      left: parseInt(w.el.style.left), top: parseInt(w.el.style.top),
      width: parseInt(w.el.style.width), height: parseInt(w.el.style.height),
      zIndex: parseInt(w.el.style.zIndex)
    };
    w.maximized = true;
    w.el.classList.add('maximized');
    w.el.style.left = '0'; w.el.style.top = '0';
    w.el.style.width = '100vw'; w.el.style.height = 'calc(100vh - 48px)';
  }
  focusWindow(winId);
}

function focusWindow(winId) {
  OS.windows.forEach(w => { w.el.classList.remove('focused'); });
  const w = OS.windows.get(winId);
  if (w) {
    w.el.classList.add('focused');
    w.el.style.zIndex = ++OS.zCounter;
    w.el.focus();
    OS.activeWindow = winId;
  }
  updateTaskbarApps();
}

function toggleWindowFromTaskbar(winId) {
  const w = OS.windows.get(winId);
  if (!w) return;
  if (w.minimized) { w.minimized = false; w.el.classList.remove('minimized'); focusWindow(winId); }
  else if (OS.activeWindow === winId) minimizeWindow(winId);
  else focusWindow(winId);
}

// ===== WINDOW DRAG =====
function setupWindowDrag(el, winId) {
  const titlebar = el.querySelector('.titlebar');
  let startX, startY, startLeft, startTop, dragging = false;
  titlebar.addEventListener('mousedown', e => {
    if (e.target.closest('.titlebar-controls')) return;
    if (e.button !== 0) return;
    focusWindow(winId);
    const w = OS.windows.get(winId);
    if (w?.maximized) return;
    startX = e.clientX; startY = e.clientY;
    startLeft = parseInt(el.style.left) || 0; startTop = parseInt(el.style.top) || 0;
    dragging = false;
    const onMove = ev => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (!dragging && Math.sqrt(dx * dx + dy * dy) > 5) dragging = true;
      if (dragging) {
        el.style.left = Math.max(0, startLeft + dx) + 'px';
        el.style.top = Math.max(0, startTop + dy) + 'px';
        checkSnapZone(ev.clientX, ev.clientY);
        if (Math.abs(dx) > 200 && Math.abs(dy) < 30) checkAeroShake(winId);
      }
    };
    const onUp = ev => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (dragging) applySnap(winId, ev.clientX, ev.clientY);
      hideSnapPreview();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
  titlebar.addEventListener('dblclick', e => {
    if (e.target.closest('.titlebar-controls')) return;
    toggleMaximize(winId);
  });
  // Touch drag support
  titlebar.addEventListener('touchstart', e => {
    if (e.target.closest('.titlebar-controls')) return;
    const w = OS.windows.get(winId);
    if (w?.maximized) return;
    const touch = e.touches[0];
    startX = touch.clientX; startY = touch.clientY;
    startLeft = parseInt(el.style.left) || 0; startTop = parseInt(el.style.top) || 0;
    focusWindow(winId);
  }, { passive: true });
  titlebar.addEventListener('touchmove', e => {
    const touch = e.touches[0];
    const dx = touch.clientX - startX, dy = touch.clientY - startY;
    el.style.left = Math.max(0, startLeft + dx) + 'px';
    el.style.top = Math.max(0, startTop + dy) + 'px';
  }, { passive: true });
}

// ===== SNAP =====
function checkSnapZone(x, y) {
  const W = window.innerWidth, H = window.innerHeight - 48;
  const preview = document.getElementById('snap-preview');
  if (!preview) return;
  preview.classList.add('hidden');
  preview.style.cssText = '';
  if (x <= 10) {
    preview.style.cssText = `left:0;top:0;width:50%;height:${H}px`;
    preview.classList.remove('hidden');
  } else if (x >= W - 10) {
    preview.style.cssText = `left:50%;top:0;width:50%;height:${H}px`;
    preview.classList.remove('hidden');
  } else if (y <= 5) {
    preview.style.cssText = `left:0;top:0;width:100%;height:${H}px`;
    preview.classList.remove('hidden');
  }
}

function applySnap(winId, x, y) {
  const W = window.innerWidth, H = window.innerHeight - 48;
  const w = OS.windows.get(winId);
  if (!w) return;
  const z = parseInt(w.el.style.zIndex) || OS.zCounter;
  if (x <= 10) {
    w.el.style.cssText = `left:0;top:0;width:50%;height:${H}px;z-index:${z}`;
    w.el.classList.add('snapping'); setTimeout(() => w.el.classList.remove('snapping'), 200);
  } else if (x >= W - 10) {
    w.el.style.cssText = `left:50%;top:0;width:50%;height:${H}px;z-index:${z}`;
    w.el.classList.add('snapping'); setTimeout(() => w.el.classList.remove('snapping'), 200);
  } else if (y <= 5) {
    if (!w.maximized) toggleMaximize(winId);
  }
  hideSnapPreview();
}

function hideSnapPreview() {
  const p = document.getElementById('snap-preview');
  if (p) { p.style.cssText = ''; p.classList.add('hidden'); }
}

// Snap Layout popup
let snapHideTimeout;
function showSnapLayout(winId, btn) {
  clearTimeout(snapHideTimeout);
  let popup = document.getElementById(`snap-popup-${winId}`);
  if (!popup) {
    popup = document.createElement('div');
    popup.id = `snap-popup-${winId}`;
    popup.className = 'snap-layout-popup';
    popup.innerHTML = `
      <div class="snap-layout-option" onclick="snapWindow(${winId},'left')" title="Left half">
        <div style="grid-template-columns:1fr 1fr;display:grid;gap:2px;width:60px;height:40px">
          <div style="background:var(--accent);border-radius:2px"></div><div style="background:var(--border);border-radius:2px"></div>
        </div></div>
      <div class="snap-layout-option" onclick="snapWindow(${winId},'right')" title="Right half">
        <div style="grid-template-columns:1fr 1fr;display:grid;gap:2px;width:60px;height:40px">
          <div style="background:var(--border);border-radius:2px"></div><div style="background:var(--accent);border-radius:2px"></div>
        </div></div>
      <div class="snap-layout-option" onclick="snapWindow(${winId},'full')" title="Full screen">
        <div style="width:60px;height:40px;background:var(--accent);border-radius:2px"></div></div>`;
    popup.addEventListener('mouseenter', () => clearTimeout(snapHideTimeout));
    popup.addEventListener('mouseleave', () => scheduleHideSnap(winId));
    btn.closest('.titlebar').appendChild(popup);
  }
  popup.style.display = 'flex';
}
function scheduleHideSnap(winId) {
  snapHideTimeout = setTimeout(() => {
    const p = document.getElementById(`snap-popup-${winId}`);
    if (p) p.style.display = 'none';
  }, 300);
}
function snapWindow(winId, pos) {
  const H = window.innerHeight - 48;
  const w = OS.windows.get(winId);
  if (!w) return;
  const z = parseInt(w.el.style.zIndex) || OS.zCounter;
  const geoms = {
    left: `left:0;top:0;width:50%;height:${H}px`,
    right: `left:50%;top:0;width:50%;height:${H}px`,
    full: `left:0;top:0;width:100%;height:${H}px`
  };
  if (geoms[pos]) {
    w.el.style.cssText = geoms[pos] + `;z-index:${z}`;
    w.el.classList.remove('maximized');
    w.maximized = (pos === 'full');
  }
  const p = document.getElementById(`snap-popup-${winId}`);
  if (p) p.style.display = 'none';
  focusWindow(winId);
}

// ===== WINDOW RESIZE =====
function setupWindowResize(el, winId) {
  el.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', e => {
      e.preventDefault(); e.stopPropagation();
      const w = OS.windows.get(winId);
      if (w?.maximized) return;
      const dir = handle.dataset.dir;
      const startX = e.clientX, startY = e.clientY;
      const rect = el.getBoundingClientRect();
      const origL = rect.left, origT = rect.top, origW = rect.width, origH = rect.height;
      focusWindow(winId);
      const onMove = ev => {
        const dx = ev.clientX - startX, dy = ev.clientY - startY;
        let l = origL, t = origT, wd = origW, ht = origH;
        if (dir.includes('e')) wd = Math.max(320, origW + dx);
        if (dir.includes('s')) ht = Math.max(200, origH + dy);
        if (dir.includes('w')) { wd = Math.max(320, origW - dx); l = origL + (origW - wd); }
        if (dir.includes('n')) { ht = Math.max(200, origH - dy); t = origT + (origH - ht); }
        el.style.left = l + 'px'; el.style.top = t + 'px';
        el.style.width = wd + 'px'; el.style.height = ht + 'px';
      };
      const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  });
}

// ===== AERO SHAKE =====
function checkAeroShake(activeId) {
  const others = [...OS.windows.values()].filter(w => w.id !== activeId && !w.minimized);
  if (others.length > 0) others.forEach(w => minimizeWindow(w.id));
}

// ===== START MENU =====
function toggleStartMenu() {
  const menu = document.getElementById('start-menu');
  const open = !menu.classList.contains('hidden');
  closeAllPanels();
  if (!open) {
    menu.classList.remove('hidden');
    renderStartMenu();
    // Apply alignment
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

// ===== NOTIFICATION CENTER =====
function toggleNotifCenter() {
  const nc = document.getElementById('notification-center');
  const open = !nc.classList.contains('hidden');
  closeAllPanels();
  if (!open) {
    nc.classList.remove('hidden');
    renderNotifications();
    OS.notifBadge = 0;
    updateNotifBadge();
  }
}

function renderNotifications() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  if (OS.notifications.length === 0) {
    list.innerHTML = '<div style="padding:12px;font-size:12px;color:var(--text2);text-align:center">No notifications</div>';
    return;
  }
  list.innerHTML = OS.notifications.slice().reverse().map(n => `
    <div class="notif-item">
      <div class="notif-item-title">${n.title}</div>
      <div class="notif-item-body">${n.body}</div>
      <div class="notif-item-time">${n.time}</div>
    </div>`).join('');
}

function clearNotifications() {
  OS.notifications = []; OS.notifBadge = 0;
  updateNotifBadge(); renderNotifications();
  localStorage.removeItem('win11_notifications');
}

function updateNotifBadge() {
  const badge = document.getElementById('systray-badge');
  if (!badge) return;
  if (OS.notifBadge > 0) { badge.textContent = OS.notifBadge; badge.classList.remove('hidden'); }
  else badge.classList.add('hidden');
}

// ===== TOAST NOTIFICATIONS =====
function showToast(title, body, actions) {
  if (OS.dndMode) return;
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-body">${body}</div>
    ${actions ? `<div class="toast-actions">${actions.map(a => `<button onclick="this.closest('.toast').remove()">${a}</button>`).join('')}</div>` : ''}`;
  container.appendChild(toast);
  toast.addEventListener('click', () => toast.remove());
  OS.notifications.push({ title, body, time: new Date().toLocaleTimeString() });
  if (OS.notifications.length > 50) OS.notifications.shift();
  localStorage.setItem('win11_notifications', JSON.stringify(OS.notifications));
  OS.notifBadge++;
  updateNotifBadge();
  setTimeout(() => { toast.classList.add('out'); setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300); }, 4500);
}

function toggleDND(btn) {
  OS.dndMode = !OS.dndMode;
  if (btn) btn.classList.toggle('active', OS.dndMode);
  // Don't show toast when enabling DND since that defeats the purpose
  if (!OS.dndMode) showToast('Focus Assist', 'Do Not Disturb disabled');
}

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
  // Make sure index is valid
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

// ===== KEYBOARD SHORTCUTS =====
function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    // Ctrl+Alt+Del
    if (e.ctrlKey && e.altKey && e.key === 'Delete') { e.preventDefault(); showCad(); return; }
    // Alt+Tab
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault();
      const wins = [...OS.windows.values()].filter(w => w.desktop === OS.currentDesktop);
      if (wins.length === 0) return;
      if (!OS.altTabActive) {
        OS.altTabIndex = 1 % wins.length;
        showAltTab();
      } else {
        OS.altTabIndex = (e.shiftKey ? OS.altTabIndex - 1 + wins.length : OS.altTabIndex + 1) % wins.length;
        showAltTab();
      }
      return;
    }
    // Release alt-tab on Alt up is handled in keyup
    if (OS.altTabActive && e.key === 'Escape') { hideAltTab(); return; }
    // Windows key shortcuts
    if (e.metaKey) {
      if (e.key === 'd') { e.preventDefault(); showDesktop(); }
      else if (e.key === 'e') { e.preventDefault(); openApp('explorer'); }
      else if (e.key === 'r') { e.preventDefault(); openApp('terminal'); }
      else if (e.key === 'Tab') { e.preventDefault(); showTaskView(); }
    }
    // Close panels on Escape
    if (e.key === 'Escape') closeAllPanels();
  });
  document.addEventListener('keyup', e => {
    if (!e.altKey && OS.altTabActive) {
      const wins = [...OS.windows.values()].filter(w => w.desktop === OS.currentDesktop);
      if (wins[OS.altTabIndex]) selectAltTab(wins[OS.altTabIndex].id);
      else hideAltTab();
    }
  });
  // Close panels on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('#start-menu') && !e.target.closest('.start-btn') && !e.target.closest('.search-btn')) {
      document.getElementById('start-menu')?.classList.add('hidden');
    }
    if (!e.target.closest('#notification-center') && !e.target.closest('.systray') && !e.target.closest('.taskbar-clock')) {
      document.getElementById('notification-center')?.classList.add('hidden');
    }
    if (!e.target.closest('#widget-panel') && !e.target.closest('.widget-btn')) {
      document.getElementById('widget-panel')?.classList.add('hidden');
    }
    if (!e.target.closest('#search-overlay') && !e.target.closest('.search-btn')) {
      document.getElementById('search-overlay')?.classList.add('hidden');
    }
    hideThumbnail();
  });
}

function closeAllPanels() {
  ['start-menu', 'notification-center', 'widget-panel', 'search-overlay', 'systray-expanded'].forEach(id => {
    document.getElementById(id)?.classList.add('hidden');
  });
  document.getElementById('task-view')?.classList.add('hidden');
}

// ===== SYSTRAY =====
function toggleSysTray() {
  const expanded = document.getElementById('systray-expanded');
  if (!expanded) return;
  const isHidden = expanded.classList.contains('hidden');
  closeAllPanels();
  if (isHidden) expanded.classList.remove('hidden');
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

// ===== SETTINGS FUNCTIONS =====
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  localStorage.setItem('win11_dark', document.body.classList.contains('dark'));
}

function setBrightness(val) {
  const v = val / 100;
  window._brightness = v;
  document.body.style.filter = `brightness(${v})`;
  localStorage.setItem('win11_brightness', v);
}

function applyAccentColor(color) {
  window._accentColor = color;
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--accent-light', color + '99');
  localStorage.setItem('win11_accent', color);
}

function setAccentColor(color) { applyAccentColor(color); }

// ===== CTRL+ALT+DEL =====
function showCad() { document.getElementById('cad-screen').classList.add('active'); }
function hideCad() { document.getElementById('cad-screen').classList.remove('active'); }

// ===== POWER =====
function shutDown() {
  closeAllPanels(); hideCad();
  const ss = document.getElementById('shutdown-screen');
  const st = document.getElementById('shutdown-text');
  ss.classList.add('active');
  if (st) st.textContent = 'Shutting down...';
  setTimeout(() => {
    document.getElementById('desktop').classList.remove('active');
    setTimeout(() => {
      document.getElementById('boot-screen').classList.add('active');
      ss.classList.remove('active');
      setTimeout(() => {
        document.getElementById('boot-screen').classList.remove('active');
        document.getElementById('lock-screen').classList.add('active');
      }, 2200);
    }, 500);
  }, 1500);
}

function restartPC() {
  const ss = document.getElementById('shutdown-screen');
  const st = document.getElementById('shutdown-text');
  ss.classList.add('active');
  if (st) st.textContent = 'Restarting...';
  setTimeout(shutDown, 1500);
}

function lockPC() {
  closeAllPanels(); hideCad();
  document.getElementById('desktop').classList.remove('active');
  document.getElementById('lock-screen').classList.add('active');
}

function signOut() { hideCad(); lockPC(); }

// ===== BSOD =====
function triggerBSOD() {
  const bsod = document.getElementById('bsod-screen');
  bsod.classList.add('active');
  const pct = document.getElementById('bsod-percent');
  let p = 0;
  const iv = setInterval(() => {
    p += Math.floor(Math.random() * 5) + 1;
    if (p >= 100) {
      p = 100; clearInterval(iv);
      setTimeout(() => { bsod.classList.remove('active'); restartPC(); }, 2000);
    }
    if (pct) pct.textContent = `${p}% complete`;
  }, 150);
}
