/* ============================================
   WINDOWS 11 WEB - MAIN SCRIPT
   ============================================ */

// ============== STATE ==============
let windowId = 0;
let activeWindows = {};
let focusedWindow = null;
let zCounter = 100;
let isDarkMode = true;
let calcValue = '0';
let calcExpression = '';
let calcNewNumber = true;
let calcOperator = null;
let calcPrevValue = null;

// Paint state
let paintTool = 'brush';
let paintColor = '#000000';
let paintBrushSize = 4;
let paintCtx = null;
let painting = false;
let paintStartX, paintStartY;
let paintSnapshot;

// ============== BOOT SEQUENCE ==============
window.addEventListener('load', () => {
  updateClock();
  setInterval(updateClock, 1000);

  // Boot animation -> Lock screen
  setTimeout(() => {
    switchScreen('boot-screen', 'lock-screen');
  }, 3000);
});

function switchScreen(from, to) {
  const f = document.getElementById(from);
  const t = document.getElementById(to);
  if (f) f.classList.remove('active');
  if (t) t.classList.add('active');
}

// ============== LOCK SCREEN ==============
document.getElementById('lock-screen').addEventListener('click', () => {
  switchScreen('lock-screen', 'login-screen');
  setTimeout(() => document.getElementById('login-password')?.focus(), 200);
});
document.getElementById('lock-screen').addEventListener('keydown', () => {
  switchScreen('lock-screen', 'login-screen');
  setTimeout(() => document.getElementById('login-password')?.focus(), 200);
});

// ============== LOGIN ==============
document.getElementById('login-btn').addEventListener('click', doLogin);
document.getElementById('login-password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doLogin();
});

function doLogin() {
  switchScreen('login-screen', 'desktop');
  document.getElementById('desktop').classList.add('active');
}

// ============== CLOCK ==============
function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  const lockTimeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const lockDateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const tt = document.getElementById('taskbar-time');
  const td = document.getElementById('taskbar-date');
  const lt = document.getElementById('lock-time');
  const ld = document.getElementById('lock-date');
  if (tt) tt.textContent = timeStr;
  if (td) td.textContent = dateStr;
  if (lt) lt.textContent = lockTimeStr;
  if (ld) ld.textContent = lockDateStr;
}

// ============== WINDOW MANAGEMENT ==============
function openApp(appName) {
  closeStartMenu();
  closeSearch();
  closeWidgets();

  const def = APP_DEFS[appName];
  if (!def) return;

  const id = 'win-' + (++windowId);
  const offsetX = (windowId % 8) * 30 + 60;
  const offsetY = (windowId % 6) * 30 + 40;

  const win = document.createElement('div');
  win.className = 'app-window';
  win.id = id;
  win.dataset.app = appName;
  win.style.width = def.width + 'px';
  win.style.height = def.height + 'px';
  win.style.left = offsetX + 'px';
  win.style.top = offsetY + 'px';

  win.innerHTML = `
    <div class="window-titlebar" onmousedown="startDrag(event, '${id}')">
      <div class="window-titlebar-icon">${def.icon}</div>
      <div class="window-title">${def.title}</div>
      <div class="window-controls">
        <button class="win-ctrl-btn" onclick="minimizeWindow('${id}')"><i class="fas fa-minus" style="font-size:10px"></i></button>
        <button class="win-ctrl-btn" onclick="maximizeWindow('${id}')"><i class="far fa-square" style="font-size:10px"></i></button>
        <button class="win-ctrl-btn close-btn" onclick="closeWindow('${id}')"><i class="fas fa-times" style="font-size:12px"></i></button>
      </div>
    </div>
    <div class="window-body">${def.content()}</div>
    <div class="resize-handle n"></div>
    <div class="resize-handle s"></div>
    <div class="resize-handle e"></div>
    <div class="resize-handle w"></div>
    <div class="resize-handle ne"></div>
    <div class="resize-handle nw"></div>
    <div class="resize-handle se"></div>
    <div class="resize-handle sw"></div>
  `;

  document.getElementById('windows-container').appendChild(win);
  activeWindows[id] = { appName, minimized: false, maximized: false };
  focusWindow(id);
  updateTaskbarApps();

  // Setup resize
  win.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', (e) => startResize(e, id, handle));
  });

  // Double-click titlebar to maximize
  win.querySelector('.window-titlebar').addEventListener('dblclick', () => maximizeWindow(id));

  // Click to focus
  win.addEventListener('mousedown', () => focusWindow(id));

  // Run onOpen callback
  if (def.onOpen) setTimeout(def.onOpen, 50);
}

function focusWindow(id) {
  document.querySelectorAll('.app-window').forEach(w => w.classList.remove('focused'));
  const win = document.getElementById(id);
  if (win) {
    win.classList.add('focused');
    win.style.zIndex = ++zCounter;
    focusedWindow = id;
  }
}

function minimizeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.classList.add('minimized');
  activeWindows[id].minimized = true;
  updateTaskbarApps();
}

function maximizeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  if (win.classList.contains('maximized')) {
    win.classList.remove('maximized');
    activeWindows[id].maximized = false;
  } else {
    win.classList.add('maximized');
    activeWindows[id].maximized = true;
  }
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (win) {
    win.style.animation = 'none';
    win.style.opacity = '0';
    win.style.transform = 'scale(0.95)';
    win.style.transition = 'opacity 0.15s, transform 0.15s';
    setTimeout(() => win.remove(), 150);
  }
  delete activeWindows[id];
  updateTaskbarApps();
}

function showDesktop() {
  const allMinimized = Object.keys(activeWindows).every(id => activeWindows[id].minimized);
  Object.keys(activeWindows).forEach(id => {
    const win = document.getElementById(id);
    if (!win) return;
    if (allMinimized) {
      win.classList.remove('minimized');
      activeWindows[id].minimized = false;
    } else {
      win.classList.add('minimized');
      activeWindows[id].minimized = true;
    }
  });
}

function updateTaskbarApps() {
  const container = document.getElementById('taskbar-apps');
  container.innerHTML = '';
  const seen = new Set();
  Object.keys(activeWindows).forEach(id => {
    const info = activeWindows[id];
    const def = APP_DEFS[info.appName];
    if (!def || seen.has(info.appName)) return;
    seen.add(info.appName);
    const btn = document.createElement('button');
    btn.className = 'taskbar-btn active';
    btn.innerHTML = def.icon;
    btn.title = def.title;
    btn.onclick = () => {
      const win = document.getElementById(id);
      if (!win) return;
      if (info.minimized) {
        win.classList.remove('minimized');
        info.minimized = false;
        focusWindow(id);
      } else if (focusedWindow === id) {
        minimizeWindow(id);
      } else {
        focusWindow(id);
      }
    };
    container.appendChild(btn);
  });
}

// ============== DRAGGING ==============
let dragState = null;

function startDrag(e, winId) {
  const win = document.getElementById(winId);
  if (!win || win.classList.contains('maximized')) return;
  e.preventDefault();
  focusWindow(winId);
  dragState = {
    winId,
    startX: e.clientX,
    startY: e.clientY,
    origLeft: win.offsetLeft,
    origTop: win.offsetTop
  };
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', endDrag);
}

function onDrag(e) {
  if (!dragState) return;
  const win = document.getElementById(dragState.winId);
  if (!win) return;
  const dx = e.clientX - dragState.startX;
  const dy = e.clientY - dragState.startY;
  win.style.left = (dragState.origLeft + dx) + 'px';
  win.style.top = (dragState.origTop + dy) + 'px';
}

function endDrag() {
  dragState = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', endDrag);
}

// ============== RESIZING ==============
let resizeState = null;

function startResize(e, winId, handle) {
  const win = document.getElementById(winId);
  if (!win || win.classList.contains('maximized')) return;
  e.preventDefault();
  e.stopPropagation();
  focusWindow(winId);

  const dir = [...handle.classList].find(c => c !== 'resize-handle');
  resizeState = {
    winId, dir,
    startX: e.clientX,
    startY: e.clientY,
    origLeft: win.offsetLeft,
    origTop: win.offsetTop,
    origWidth: win.offsetWidth,
    origHeight: win.offsetHeight
  };
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', endResize);
}

function onResize(e) {
  if (!resizeState) return;
  const win = document.getElementById(resizeState.winId);
  if (!win) return;
  const dx = e.clientX - resizeState.startX;
  const dy = e.clientY - resizeState.startY;
  const dir = resizeState.dir;
  let { origLeft, origTop, origWidth, origHeight } = resizeState;
  const minW = 400, minH = 300;

  if (dir.includes('e')) { win.style.width = Math.max(minW, origWidth + dx) + 'px'; }
  if (dir.includes('w')) {
    const newW = Math.max(minW, origWidth - dx);
    win.style.width = newW + 'px';
    win.style.left = (origLeft + origWidth - newW) + 'px';
  }
  if (dir.includes('s')) { win.style.height = Math.max(minH, origHeight + dy) + 'px'; }
  if (dir.includes('n')) {
    const newH = Math.max(minH, origHeight - dy);
    win.style.height = newH + 'px';
    win.style.top = (origTop + origHeight - newH) + 'px';
  }
}

function endResize() {
  resizeState = null;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', endResize);
}

// ============== START MENU ==============
function toggleStartMenu() {
  const sm = document.getElementById('start-menu');
  const wasHidden = sm.classList.contains('hidden');
  closeAllOverlays();
  if (wasHidden) sm.classList.remove('hidden');
}

function closeStartMenu() {
  document.getElementById('start-menu').classList.add('hidden');
}

// ============== SEARCH ==============
function toggleSearch() {
  let el = document.getElementById('search-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'search-overlay';
    el.className = 'hidden';
    el.innerHTML = `
      <div class="search-header">
        <input type="text" placeholder="Type here to search" id="search-input" oninput="filterSearch(this.value)">
      </div>
      <div class="search-results" id="search-results">
        ${Object.keys(APP_DEFS).map(k => {
          const d = APP_DEFS[k];
          return `<div class="search-result-item" data-name="${d.title.toLowerCase()}" onclick="openApp('${k}')">${d.icon}<span>${d.title}</span></div>`;
        }).join('')}
      </div>
    `;
    document.getElementById('desktop').appendChild(el);
  }
  const wasHidden = el.classList.contains('hidden');
  closeAllOverlays();
  if (wasHidden) {
    el.classList.remove('hidden');
    setTimeout(() => document.getElementById('search-input')?.focus(), 100);
  }
}

function closeSearch() {
  const el = document.getElementById('search-overlay');
  if (el) el.classList.add('hidden');
}

function filterSearch(query) {
  const items = document.querySelectorAll('#search-results .search-result-item');
  query = query.toLowerCase();
  items.forEach(item => {
    item.style.display = item.dataset.name.includes(query) ? 'flex' : 'none';
  });
}

// ============== WIDGETS ==============
function toggleWidgets() {
  const wp = document.getElementById('widget-panel');
  const wasHidden = wp.classList.contains('hidden');
  closeAllOverlays();
  if (wasHidden) wp.classList.remove('hidden');
}

function closeWidgets() {
  document.getElementById('widget-panel').classList.add('hidden');
}

// ============== NOTIFICATION CENTER ==============
function toggleNotifCenter() {
  const nc = document.getElementById('notification-center');
  const wasHidden = nc.classList.contains('hidden');
  closeAllOverlays();
  if (wasHidden) nc.classList.remove('hidden');
}

function clearNotifications() {
  document.getElementById('notif-list').innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px">No new notifications</div>';
}

// ============== CLOSE ALL OVERLAYS ==============
function closeAllOverlays() {
  closeStartMenu();
  closeSearch();
  closeWidgets();
  document.getElementById('notification-center').classList.add('hidden');
  document.getElementById('context-menu').classList.add('hidden');
}

// Click outside to close overlays
document.addEventListener('mousedown', (e) => {
  const target = e.target;
  const overlays = ['start-menu', 'search-overlay', 'widget-panel', 'notification-center', 'context-menu'];
  const taskbar = document.getElementById('taskbar');
  if (taskbar && taskbar.contains(target)) return;

  let clickedOverlay = false;
  overlays.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.contains(target)) clickedOverlay = true;
  });
  if (!clickedOverlay) closeAllOverlays();
});

// ============== CONTEXT MENU ==============
document.getElementById('desktop-area').addEventListener('contextmenu', (e) => {
  e.preventDefault();
  closeAllOverlays();
  const cm = document.getElementById('context-menu');
  cm.classList.remove('hidden');
  cm.style.left = Math.min(e.clientX, window.innerWidth - 220) + 'px';
  cm.style.top = Math.min(e.clientY, window.innerHeight - 300) + 'px';
});

// ============== DARK/LIGHT MODE ==============
function toggleDarkMode() {
  document.body.classList.toggle('light-mode');
  isDarkMode = !document.body.classList.contains('light-mode');
}

// ============== WALLPAPER ==============
const wallpapers = [
  'linear-gradient(135deg, #0078D4 0%, #005a9e 30%, #004578 60%, #002050 100%)',
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)',
];
let wallpaperIndex = 0;

function changeWallpaper() {
  wallpaperIndex = (wallpaperIndex + 1) % wallpapers.length;
  document.getElementById('desktop').style.backgroundImage = wallpapers[wallpaperIndex];
  closeAllOverlays();
}

function refreshDesktop() {
  closeAllOverlays();
}

// ============== CALCULATOR ==============
function calcPress(btn) {
  const resultEl = document.getElementById('calc-result');
  const exprEl = document.getElementById('calc-expression');
  if (!resultEl || !exprEl) return;

  if (btn >= '0' && btn <= '9') {
    if (calcNewNumber) { calcValue = btn; calcNewNumber = false; }
    else calcValue = calcValue === '0' ? btn : calcValue + btn;
    resultEl.textContent = calcValue;
  } else if (btn === '.') {
    if (calcNewNumber) { calcValue = '0.'; calcNewNumber = false; }
    else if (!calcValue.includes('.')) calcValue += '.';
    resultEl.textContent = calcValue;
  } else if (btn === '±') {
    calcValue = String(-parseFloat(calcValue));
    resultEl.textContent = calcValue;
  } else if (['+', '-', '×', '÷'].includes(btn)) {
    if (calcOperator && !calcNewNumber) {
      calcPrevValue = calcEval(parseFloat(calcPrevValue), parseFloat(calcValue), calcOperator);
      resultEl.textContent = formatCalc(calcPrevValue);
    } else {
      calcPrevValue = parseFloat(calcValue);
    }
    calcOperator = btn;
    exprEl.textContent = formatCalc(calcPrevValue) + ' ' + btn;
    calcNewNumber = true;
  } else if (btn === '=') {
    if (calcOperator) {
      const result = calcEval(parseFloat(calcPrevValue), parseFloat(calcValue), calcOperator);
      exprEl.textContent = formatCalc(calcPrevValue) + ' ' + calcOperator + ' ' + formatCalc(parseFloat(calcValue)) + ' =';
      calcValue = String(result);
      resultEl.textContent = formatCalc(result);
      calcOperator = null;
      calcPrevValue = null;
      calcNewNumber = true;
    }
  } else if (btn === 'C') {
    calcValue = '0'; calcExpression = ''; calcOperator = null; calcPrevValue = null; calcNewNumber = true;
    resultEl.textContent = '0'; exprEl.textContent = '';
  } else if (btn === 'CE') {
    calcValue = '0'; calcNewNumber = true;
    resultEl.textContent = '0';
  } else if (btn === '⌫') {
    calcValue = calcValue.length > 1 ? calcValue.slice(0, -1) : '0';
    resultEl.textContent = calcValue;
  } else if (btn === '%') {
    calcValue = String(parseFloat(calcValue) / 100);
    resultEl.textContent = formatCalc(parseFloat(calcValue));
  } else if (btn === 'x²') {
    calcValue = String(Math.pow(parseFloat(calcValue), 2));
    resultEl.textContent = formatCalc(parseFloat(calcValue));
    calcNewNumber = true;
  } else if (btn === '√') {
    calcValue = String(Math.sqrt(parseFloat(calcValue)));
    resultEl.textContent = formatCalc(parseFloat(calcValue));
    calcNewNumber = true;
  } else if (btn === '1/x') {
    calcValue = String(1 / parseFloat(calcValue));
    resultEl.textContent = formatCalc(parseFloat(calcValue));
    calcNewNumber = true;
  }
}

function calcEval(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b !== 0 ? a / b : 'Error';
    default: return b;
  }
}

function formatCalc(n) {
  if (typeof n === 'string') return n;
  if (Number.isInteger(n)) return n.toLocaleString();
  return parseFloat(n.toPrecision(12)).toString();
}

// ============== TERMINAL ==============
const FS = {
  'C:': {
    'Users': {
      'User': {
        'Desktop': { 'Welcome.txt': 'file', 'Notes.docx': 'file' },
        'Documents': { 'Report.pdf': 'file', 'Budget.xlsx': 'file' },
        'Downloads': { 'Setup.exe': 'file', 'Image.jpg': 'file' },
        'Music': {},
        'Pictures': { 'Photo.jpg': 'file', 'Screenshot.png': 'file' },
        'Videos': {},
      }
    },
    'Windows': { 'System32': { 'cmd.exe': 'file', 'notepad.exe': 'file' } },
    'Program Files': { 'Edge': {}, 'Windows Defender': {} },
  }
};
let termCwd = ['C:', 'Users', 'User'];

function getDir(path) {
  let node = FS;
  for (const p of path) {
    if (node[p] && typeof node[p] === 'object') node = node[p];
    else return null;
  }
  return node;
}

function handleTerminalKey(e) {
  if (e.key !== 'Enter') return;
  const input = document.getElementById('terminal-input');
  const output = document.getElementById('terminal-output');
  const cmd = input.value.trim();
  input.value = '';

  const prompt = `PS ${termCwd.join('\\')}> `;
  output.textContent += prompt + cmd + '\n';

  if (cmd) {
    const result = executeCommand(cmd);
    if (result) output.textContent += result + '\n';
  }
  output.textContent += '\n';

  // Update prompt
  const promptEl = document.querySelector('.terminal-prompt');
  if (promptEl) promptEl.textContent = `PS ${termCwd.join('\\')}> `;

  // Scroll to bottom
  const body = document.getElementById('terminal-body');
  if (body) body.scrollTop = body.scrollHeight;
}

function executeCommand(cmd) {
  const parts = cmd.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case 'help':
      return `Available commands:
  help        - Show this help
  cls/clear   - Clear screen
  dir/ls      - List directory
  cd          - Change directory
  pwd         - Print working directory
  echo        - Print text
  date        - Show current date/time
  whoami      - Show current user
  hostname    - Show hostname
  ipconfig    - Show network config
  systeminfo  - Show system info
  color       - Show colors
  calc        - Quick calculation
  mkdir       - Create directory
  cat/type    - Read file
  tree        - Show directory tree
  exit        - Close terminal`;

    case 'cls': case 'clear':
      document.getElementById('terminal-output').textContent = '';
      return '';

    case 'dir': case 'ls': {
      const dir = getDir(termCwd);
      if (!dir) return 'Directory not found.';
      let out = `\n    Directory: ${termCwd.join('\\')}\n\n`;
      out += 'Mode          Name\n';
      out += '----          ----\n';
      Object.keys(dir).forEach(k => {
        const isDir = typeof dir[k] === 'object';
        out += `${isDir ? 'd----' : '-a---'}         ${k}\n`;
      });
      return out;
    }

    case 'cd': {
      if (!args[0] || args[0] === '~') { termCwd = ['C:', 'Users', 'User']; return ''; }
      if (args[0] === '..') {
        if (termCwd.length > 1) termCwd.pop();
        return '';
      }
      const target = args[0].replace(/\//g, '\\');
      const newPath = [...termCwd, ...target.split('\\').filter(Boolean)];
      if (getDir(newPath)) { termCwd = newPath; return ''; }
      return `Set-Location: Cannot find path '${args[0]}'`;
    }

    case 'pwd':
      return termCwd.join('\\');

    case 'echo':
      return args.join(' ');

    case 'date':
      return new Date().toString();

    case 'whoami':
      return 'DESKTOP-WIN11\\User';

    case 'hostname':
      return 'DESKTOP-WIN11';

    case 'ipconfig':
      return `Windows IP Configuration

Ethernet adapter Ethernet:
   Connection-specific DNS Suffix  . : localdomain
   IPv4 Address. . . . . . . . . . . : 192.168.1.${Math.floor(Math.random() * 200 + 10)}
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1`;

    case 'systeminfo':
      return `Host Name:           DESKTOP-WIN11
OS Name:             Windows 11 Web Edition
OS Version:          11.0.22631
System Type:         x64-based PC
Processor:           Virtual CPU @ 3.00GHz
Total Physical Memory: 16,384 MB
Available Physical Memory: 8,192 MB`;

    case 'calc':
      try {
        const expr = args.join('').replace(/x/g, '*');
        return String(Function('"use strict"; return (' + expr + ')')());
      } catch { return 'Invalid expression'; }

    case 'mkdir':
      if (!args[0]) return 'Usage: mkdir <name>';
      const parentDir = getDir(termCwd);
      if (parentDir) parentDir[args[0]] = {};
      return '';

    case 'cat': case 'type':
      if (!args[0]) return 'Usage: cat <filename>';
      if (args[0].toLowerCase() === 'welcome.txt') return 'Welcome to Windows 11 Web Edition!\nThis is a fully interactive desktop experience.';
      return `Get-Content: Cannot find path '${args[0]}'`;

    case 'tree': {
      const dir = getDir(termCwd);
      if (!dir) return 'Error.';
      let out = termCwd.join('\\') + '\n';
      function drawTree(node, prefix) {
        const keys = Object.keys(node);
        keys.forEach((k, i) => {
          const isLast = i === keys.length - 1;
          out += prefix + (isLast ? '└── ' : '├── ') + k + '\n';
          if (typeof node[k] === 'object') {
            drawTree(node[k], prefix + (isLast ? '    ' : '│   '));
          }
        });
      }
      drawTree(dir, '');
      return out;
    }

    case 'color':
      return '\x1b[31mColors are not supported in this terminal emulator.\x1b[0m Try changing the desktop theme instead!';

    case 'exit':
      return 'Use the X button to close the terminal.';

    default:
      return `'${command}' is not recognized as a command. Type 'help' for available commands.`;
  }
}

function focusTerminal() {
  document.getElementById('terminal-input')?.focus();
}

// ============== EDGE BROWSER ==============
function navigateEdge(url) {
  if (!url.startsWith('http') && !url.startsWith('edge://')) {
    url = 'https://www.bing.com/search?q=' + encodeURIComponent(url);
  }

  const urlBar = document.getElementById('edge-url');
  if (urlBar) urlBar.value = url;

  const content = urlBar?.closest('.app-window')?.querySelector('.edge-content');
  if (content) {
    if (url.startsWith('http')) {
      content.innerHTML = `<iframe src="${url}" style="width:100%;height:100%;border:none" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>`;
    } else {
      content.innerHTML = `<div class="edge-new-tab"><div class="edge-logo"><i class="fas fa-globe"></i></div><input class="edge-search-box" placeholder="Search the web" onkeydown="if(event.key==='Enter')navigateEdge(this.value)"></div>`;
    }
  }
}

// ============== PAINT ==============
function initPaint() {
  const canvas = document.getElementById('paint-canvas');
  if (!canvas) return;
  paintCtx = canvas.getContext('2d');
  paintCtx.fillStyle = '#ffffff';
  paintCtx.fillRect(0, 0, canvas.width, canvas.height);
  paintCtx.lineCap = 'round';
  paintCtx.lineJoin = 'round';

  canvas.addEventListener('mousedown', paintMouseDown);
  canvas.addEventListener('mousemove', paintMouseMove);
  canvas.addEventListener('mouseup', paintMouseUp);
  canvas.addEventListener('mouseleave', paintMouseUp);
}

function paintMouseDown(e) {
  painting = true;
  const canvas = e.target;
  const rect = canvas.getBoundingClientRect();
  paintStartX = e.clientX - rect.left;
  paintStartY = e.clientY - rect.top;

  if (paintTool === 'brush' || paintTool === 'eraser') {
    paintCtx.beginPath();
    paintCtx.moveTo(paintStartX, paintStartY);
  }
  paintSnapshot = paintCtx.getImageData(0, 0, canvas.width, canvas.height);
}

function paintMouseMove(e) {
  if (!painting) return;
  const canvas = e.target;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (paintTool === 'brush') {
    paintCtx.strokeStyle = paintColor;
    paintCtx.lineWidth = paintBrushSize;
    paintCtx.lineTo(x, y);
    paintCtx.stroke();
  } else if (paintTool === 'eraser') {
    paintCtx.strokeStyle = '#ffffff';
    paintCtx.lineWidth = paintBrushSize * 3;
    paintCtx.lineTo(x, y);
    paintCtx.stroke();
  } else if (['line', 'rect', 'circle'].includes(paintTool)) {
    paintCtx.putImageData(paintSnapshot, 0, 0);
    paintCtx.strokeStyle = paintColor;
    paintCtx.lineWidth = paintBrushSize;
    paintCtx.beginPath();
    if (paintTool === 'line') {
      paintCtx.moveTo(paintStartX, paintStartY);
      paintCtx.lineTo(x, y);
    } else if (paintTool === 'rect') {
      paintCtx.rect(paintStartX, paintStartY, x - paintStartX, y - paintStartY);
    } else if (paintTool === 'circle') {
      const rx = Math.abs(x - paintStartX) / 2;
      const ry = Math.abs(y - paintStartY) / 2;
      const cx = paintStartX + (x - paintStartX) / 2;
      const cy = paintStartY + (y - paintStartY) / 2;
      paintCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    }
    paintCtx.stroke();
  }
}

function paintMouseUp() {
  painting = false;
  paintCtx?.beginPath();
}

function setPaintTool(btn, tool) {
  paintTool = tool;
  document.querySelectorAll('.paint-tool-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function setPaintColor(btn, color) {
  paintColor = color;
  document.querySelectorAll('.paint-color-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function clearCanvas() {
  const canvas = document.getElementById('paint-canvas');
  if (canvas && paintCtx) {
    paintCtx.fillStyle = '#ffffff';
    paintCtx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function fillCanvas() {
  const canvas = document.getElementById('paint-canvas');
  if (canvas && paintCtx) {
    paintCtx.fillStyle = paintColor;
    paintCtx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// ============== SHUTDOWN ==============
function shutDown() {
  closeAllOverlays();
  switchScreen('desktop', 'shutdown-screen');
  document.getElementById('shutdown-screen').classList.add('active');
  document.getElementById('desktop').classList.remove('active');
  setTimeout(() => {
    document.getElementById('shutdown-screen').classList.remove('active');
    // Reset to boot
    setTimeout(() => {
      document.getElementById('boot-screen').classList.add('active');
      setTimeout(() => switchScreen('boot-screen', 'lock-screen'), 3000);
    }, 1000);
  }, 3000);
}

// ============== KEYBOARD SHORTCUTS ==============
document.addEventListener('keydown', (e) => {
  // Windows key (Meta) -> toggle start menu
  if (e.key === 'Meta') {
    e.preventDefault();
    toggleStartMenu();
  }
  // Ctrl+E -> File Explorer
  if (e.ctrlKey && e.key === 'e') {
    e.preventDefault();
    openApp('fileexplorer');
  }
});
