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
  DESKTOP_ICONS.forEach((icon, i) => {
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
