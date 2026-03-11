/* ============================================
   WINDOWS 11 WEB - APP DEFINITIONS
   ============================================ */

const APP_DEFS = {
  fileexplorer: {
    title: 'File Explorer',
    icon: '<i class="fas fa-folder" style="color:#FFB900"></i>',
    width: 800, height: 500,
    content: () => {
      const folders = [
        { name: 'Desktop', icon: 'fas fa-desktop', color: '#0078D4' },
        { name: 'Documents', icon: 'fas fa-file-alt', color: '#FFB900' },
        { name: 'Downloads', icon: 'fas fa-download', color: '#0078D4' },
        { name: 'Music', icon: 'fas fa-music', color: '#E74856' },
        { name: 'Pictures', icon: 'fas fa-image', color: '#ff6f61' },
        { name: 'Videos', icon: 'fas fa-video', color: '#7fba00' },
      ];
      const files = [
        { name: 'Welcome.txt', icon: 'fas fa-file-alt', color: '#5B9BD5' },
        { name: 'Notes.docx', icon: 'fas fa-file-word', color: '#2B579A' },
        { name: 'Budget.xlsx', icon: 'fas fa-file-excel', color: '#217346' },
        { name: 'Presentation.pptx', icon: 'fas fa-file-powerpoint', color: '#B7472A' },
        { name: 'Photo.jpg', icon: 'fas fa-file-image', color: '#ff6f61' },
        { name: 'Song.mp3', icon: 'fas fa-file-audio', color: '#E74856' },
        { name: 'Backup.zip', icon: 'fas fa-file-archive', color: '#FFB900' },
        { name: 'App.exe', icon: 'fas fa-cog', color: '#888' },
      ];
      return `
        <div class="fe-toolbar">
          <button class="fe-toolbar-btn"><i class="fas fa-arrow-left"></i></button>
          <button class="fe-toolbar-btn"><i class="fas fa-arrow-right"></i></button>
          <button class="fe-toolbar-btn"><i class="fas fa-arrow-up"></i></button>
          <input class="fe-path" value="C:\\Users\\User" readonly>
          <button class="fe-toolbar-btn"><i class="fas fa-search"></i></button>
        </div>
        <div style="display:flex;flex:1;overflow:hidden">
          <div class="fe-sidebar">
            <div class="fe-sidebar-header">Quick access</div>
            ${folders.map(f => `<div class="fe-sidebar-item"><i class="${f.icon}" style="color:${f.color}"></i>${f.name}</div>`).join('')}
            <div class="fe-sidebar-header">This PC</div>
            <div class="fe-sidebar-item"><i class="fas fa-hdd" style="color:#888"></i>Local Disk (C:)</div>
            <div class="fe-sidebar-item"><i class="fas fa-hdd" style="color:#888"></i>Data (D:)</div>
            <div class="fe-sidebar-header">Network</div>
            <div class="fe-sidebar-item"><i class="fas fa-network-wired" style="color:#888"></i>Network</div>
          </div>
          <div class="fe-content">
            <div class="fe-grid">
              ${folders.map(f => `<div class="fe-item"><i class="${f.icon}" style="color:${f.color}"></i><span>${f.name}</span></div>`).join('')}
              ${files.map(f => `<div class="fe-item"><i class="${f.icon}" style="color:${f.color}"></i><span>${f.name}</span></div>`).join('')}
            </div>
          </div>
        </div>`;
    }
  },

  notepad: {
    title: 'Notepad',
    icon: '<i class="fas fa-file-alt" style="color:#5B9BD5"></i>',
    width: 650, height: 450,
    content: () => `
      <div class="notepad-menu">
        <button class="notepad-menu-btn">File</button>
        <button class="notepad-menu-btn">Edit</button>
        <button class="notepad-menu-btn">View</button>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;overflow:hidden">
        <textarea class="notepad-textarea" spellcheck="false" placeholder="Start typing...">Welcome to Windows 11 Web Edition!

This is a fully interactive desktop experience running in your browser.

Features:
- Draggable and resizable windows
- Working calculator
- Terminal with commands
- File Explorer
- Paint with drawing tools
- Settings with dark/light mode
- And much more!

Try right-clicking the desktop for more options.</textarea>
      </div>
      <div class="notepad-status">
        <span>Ln 1, Col 1</span>
        <span>UTF-8</span>
      </div>
    `
  },

  calculator: {
    title: 'Calculator',
    icon: '<i class="fas fa-calculator" style="color:#7fba00"></i>',
    width: 320, height: 480,
    content: () => {
      const buttons = [
        ['%', 'CE', 'C', '⌫'],
        ['1/x', 'x²', '√', '÷'],
        ['7', '8', '9', '×'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['±', '0', '.', '=']
      ];
      return `
        <div class="calc-display">
          <div class="calc-expression" id="calc-expression"></div>
          <div class="calc-result" id="calc-result">0</div>
        </div>
        <div class="calc-buttons">
          ${buttons.map(row => row.map(b => {
            let cls = 'calc-btn';
            if (b === '=') cls += ' equals';
            else if (['+', '-', '×', '÷', '%', '1/x', 'x²', '√'].includes(b)) cls += ' operator';
            return `<button class="${cls}" onclick="calcPress('${b}')">${b}</button>`;
          }).join('')).join('')}
        </div>`;
    }
  },

  terminal: {
    title: 'Terminal',
    icon: '<i class="fas fa-terminal" style="color:#ccc"></i>',
    width: 700, height: 450,
    content: () => `
      <div class="terminal-tab-bar">
        <div class="terminal-tab active"><i class="fas fa-terminal" style="font-size:10px"></i> PowerShell</div>
        <button class="terminal-tab-add">+</button>
      </div>
      <div class="terminal-body" id="terminal-body" onclick="focusTerminal()">
        <div class="terminal-output" id="terminal-output">Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

Try the new cross-platform PowerShell https://aka.ms/pscore6

</div>
        <div class="terminal-input-line">
          <span class="terminal-prompt">PS C:\\Users\\User&gt; </span>
          <input class="terminal-input" id="terminal-input" type="text" autofocus onkeydown="handleTerminalKey(event)">
        </div>
      </div>
    `
  },

  edge: {
    title: 'Microsoft Edge',
    icon: '<i class="fas fa-globe" style="color:#0078D4"></i>',
    width: 900, height: 600,
    content: () => `
      <div class="edge-toolbar">
        <button class="edge-nav-btn"><i class="fas fa-arrow-left"></i></button>
        <button class="edge-nav-btn"><i class="fas fa-arrow-right"></i></button>
        <button class="edge-nav-btn"><i class="fas fa-redo"></i></button>
        <input class="edge-url-bar" id="edge-url" value="edge://newtab" onkeydown="if(event.key==='Enter')navigateEdge(this.value)">
        <button class="edge-nav-btn"><i class="fas fa-star"></i></button>
        <button class="edge-nav-btn"><i class="fas fa-ellipsis-h"></i></button>
      </div>
      <div class="edge-content">
        <div class="edge-new-tab">
          <div class="edge-logo"><i class="fas fa-globe"></i></div>
          <input class="edge-search-box" placeholder="Search the web" onkeydown="if(event.key==='Enter')navigateEdge(this.value)">
          <div class="edge-shortcuts">
            <div class="edge-shortcut" onclick="navigateEdge('https://github.com')">
              <div class="edge-shortcut-icon"><i class="fab fa-github"></i></div>
              <span>GitHub</span>
            </div>
            <div class="edge-shortcut" onclick="navigateEdge('https://youtube.com')">
              <div class="edge-shortcut-icon"><i class="fab fa-youtube" style="color:#f00"></i></div>
              <span>YouTube</span>
            </div>
            <div class="edge-shortcut" onclick="navigateEdge('https://reddit.com')">
              <div class="edge-shortcut-icon"><i class="fab fa-reddit" style="color:#FF4500"></i></div>
              <span>Reddit</span>
            </div>
            <div class="edge-shortcut" onclick="navigateEdge('https://wikipedia.org')">
              <div class="edge-shortcut-icon"><i class="fab fa-wikipedia-w"></i></div>
              <span>Wikipedia</span>
            </div>
          </div>
        </div>
      </div>
    `
  },

  settings: {
    title: 'Settings',
    icon: '<i class="fas fa-cog" style="color:#aaa"></i>',
    width: 800, height: 550,
    content: () => `
      <div class="settings-layout">
        <div class="settings-nav">
          <div class="settings-nav-item active"><i class="fas fa-home"></i> System</div>
          <div class="settings-nav-item"><i class="fas fa-bluetooth-b"></i> Bluetooth</div>
          <div class="settings-nav-item"><i class="fas fa-network-wired"></i> Network</div>
          <div class="settings-nav-item" onclick="toggleDarkMode()"><i class="fas fa-palette"></i> Personalization</div>
          <div class="settings-nav-item"><i class="fas fa-shield-alt"></i> Privacy</div>
          <div class="settings-nav-item"><i class="fas fa-sync"></i> Windows Update</div>
          <div class="settings-nav-item"><i class="fas fa-info-circle"></i> About</div>
        </div>
        <div class="settings-content">
          <div class="settings-title">System</div>
          <div class="settings-card">
            <div class="settings-row">
              <div>
                <div class="settings-row-label">Display</div>
                <div class="settings-row-desc">Brightness, resolution, and orientation</div>
              </div>
              <i class="fas fa-chevron-right" style="color:var(--text-secondary)"></i>
            </div>
            <div class="settings-row">
              <div>
                <div class="settings-row-label">Sound</div>
                <div class="settings-row-desc">Volume, output, and input devices</div>
              </div>
              <i class="fas fa-chevron-right" style="color:var(--text-secondary)"></i>
            </div>
            <div class="settings-row">
              <div>
                <div class="settings-row-label">Notifications</div>
                <div class="settings-row-desc">Alerts from apps and system</div>
              </div>
              <div class="toggle-switch active" onclick="this.classList.toggle('active')"></div>
            </div>
          </div>
          <div class="settings-card">
            <div class="settings-row">
              <div>
                <div class="settings-row-label">Dark mode</div>
                <div class="settings-row-desc">Switch between light and dark themes</div>
              </div>
              <div class="toggle-switch ${document.body.classList.contains('light-mode') ? '' : 'active'}" onclick="this.classList.toggle('active'); toggleDarkMode()"></div>
            </div>
            <div class="settings-row">
              <div>
                <div class="settings-row-label">Transparency effects</div>
                <div class="settings-row-desc">Enable acrylic and mica effects</div>
              </div>
              <div class="toggle-switch active" onclick="this.classList.toggle('active')"></div>
            </div>
          </div>
          <div class="settings-card">
            <div class="settings-row">
              <div>
                <div class="settings-row-label">About</div>
                <div class="settings-row-desc">Windows 11 Web Edition — Built with HTML, CSS, and JavaScript</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  },

  photos: {
    title: 'Photos',
    icon: '<i class="fas fa-image" style="color:#ff6f61"></i>',
    width: 700, height: 500,
    content: () => {
      const colors = ['#E74856','#0078D4','#7fba00','#FFB900','#845ec2','#ff6f61','#00b4d8','#2B579A','#217346','#B7472A','#f472b6','#22d3ee'];
      const patterns = ['linear-gradient(135deg,#E74856,#FFB900)','linear-gradient(135deg,#0078D4,#00b4d8)','linear-gradient(135deg,#7fba00,#FFB900)','linear-gradient(135deg,#845ec2,#ff6f61)','linear-gradient(135deg,#0078D4,#845ec2)','linear-gradient(45deg,#E74856,#845ec2)','radial-gradient(circle,#FFB900,#E74856)','radial-gradient(circle,#00b4d8,#0078D4)','linear-gradient(135deg,#22d3ee,#7fba00)','linear-gradient(135deg,#f472b6,#FFB900)','linear-gradient(135deg,#217346,#00b4d8)','linear-gradient(135deg,#B7472A,#FFB900)'];
      return `
        <div style="padding:16px 24px;border-bottom:1px solid var(--border-color);background:var(--bg-secondary)">
          <h3 style="font-size:16px;color:var(--text-primary)">Collection</h3>
        </div>
        <div class="photos-grid">
          ${patterns.map((p, i) => `<div class="photo-item" style="background:${p}"><i class="fas fa-image" style="color:rgba(255,255,255,0.3)"></i></div>`).join('')}
        </div>`;
    }
  },

  store: {
    title: 'Microsoft Store',
    icon: '<i class="fas fa-shopping-bag" style="color:#0078D4"></i>',
    width: 800, height: 550,
    content: () => {
      const apps = [
        { name: 'Spotify', icon: 'fab fa-spotify', color: '#1DB954' },
        { name: 'Discord', icon: 'fab fa-discord', color: '#5865F2' },
        { name: 'WhatsApp', icon: 'fab fa-whatsapp', color: '#25D366' },
        { name: 'Telegram', icon: 'fab fa-telegram', color: '#0088cc' },
        { name: 'Netflix', icon: 'fas fa-film', color: '#E50914' },
        { name: 'VS Code', icon: 'fas fa-code', color: '#007ACC' },
        { name: 'Slack', icon: 'fab fa-slack', color: '#4A154B' },
        { name: 'Twitter/X', icon: 'fab fa-twitter', color: '#1DA1F2' },
        { name: 'TikTok', icon: 'fab fa-tiktok', color: '#000' },
        { name: 'Zoom', icon: 'fas fa-video', color: '#2D8CFF' },
        { name: 'Teams', icon: 'fas fa-users', color: '#6264A7' },
        { name: 'Paint 3D', icon: 'fas fa-cube', color: '#0078D4' },
      ];
      return `
        <div class="store-header">
          <h2>Microsoft Store</h2>
          <p>Discover apps, games, and more</p>
        </div>
        <div class="store-grid">
          ${apps.map(a => `<div class="store-app"><div class="store-app-icon"><i class="${a.icon}" style="color:${a.color}"></i></div><div class="store-app-name">${a.name}</div><div class="store-app-cat">Free</div></div>`).join('')}
        </div>`;
    }
  },

  paint: {
    title: 'Paint',
    icon: '<i class="fas fa-palette" style="color:#E74856"></i>',
    width: 800, height: 550,
    content: () => {
      const colors = ['#000000','#ffffff','#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff','#ff6600','#6600ff','#888888','#FFB900'];
      return `
        <div class="paint-toolbar">
          <button class="paint-tool-btn active" data-tool="brush" onclick="setPaintTool(this,'brush')"><i class="fas fa-paint-brush"></i></button>
          <button class="paint-tool-btn" data-tool="eraser" onclick="setPaintTool(this,'eraser')"><i class="fas fa-eraser"></i></button>
          <button class="paint-tool-btn" data-tool="line" onclick="setPaintTool(this,'line')"><i class="fas fa-minus"></i></button>
          <button class="paint-tool-btn" data-tool="rect" onclick="setPaintTool(this,'rect')"><i class="far fa-square"></i></button>
          <button class="paint-tool-btn" data-tool="circle" onclick="setPaintTool(this,'circle')"><i class="far fa-circle"></i></button>
          <button class="paint-tool-btn" onclick="fillCanvas()"><i class="fas fa-fill-drip"></i></button>
          <span style="color:var(--text-secondary);margin:0 6px">|</span>
          ${colors.map((c,i) => `<button class="paint-color-btn ${i===0?'active':''}" style="background:${c}" onclick="setPaintColor(this,'${c}')"></button>`).join('')}
          <span style="color:var(--text-secondary);margin:0 6px">|</span>
          <select id="paint-size" onchange="paintBrushSize=parseInt(this.value)" style="background:var(--bg-tertiary);color:var(--text-primary);border:1px solid var(--border-color);padding:4px;border-radius:4px">
            <option value="2">2px</option>
            <option value="4" selected>4px</option>
            <option value="8">8px</option>
            <option value="16">16px</option>
            <option value="32">32px</option>
          </select>
          <button class="paint-tool-btn" onclick="clearCanvas()" title="Clear"><i class="fas fa-trash"></i></button>
        </div>
        <div class="paint-canvas-wrap">
          <canvas id="paint-canvas" width="760" height="440"></canvas>
        </div>`;
    },
    onOpen: () => { initPaint(); }
  },

  weather: {
    title: 'Weather',
    icon: '<i class="fas fa-cloud-sun" style="color:#68B9E6"></i>',
    width: 500, height: 450,
    content: () => `
      <div class="weather-app">
        <div class="weather-app-icon"><i class="fas fa-cloud-sun"></i></div>
        <div class="weather-app-temp">72°F</div>
        <div class="weather-app-desc">Partly Cloudy — Redmond, WA</div>
        <div class="weather-app-details">
          <div class="weather-detail"><div class="weather-detail-val">65%</div><div class="weather-detail-label">Humidity</div></div>
          <div class="weather-detail"><div class="weather-detail-val">8 mph</div><div class="weather-detail-label">Wind</div></div>
          <div class="weather-detail"><div class="weather-detail-val">10 mi</div><div class="weather-detail-label">Visibility</div></div>
          <div class="weather-detail"><div class="weather-detail-val">30.1"</div><div class="weather-detail-label">Pressure</div></div>
        </div>
      </div>
    `
  },

  clock: {
    title: 'Clock',
    icon: '<i class="fas fa-clock" style="color:#FFB900"></i>',
    width: 400, height: 350,
    content: () => `
      <div class="clock-app">
        <div class="clock-app-face" id="clock-app-time">00:00:00</div>
        <div class="clock-app-date" id="clock-app-date"></div>
      </div>
    `,
    onOpen: () => {
      function updateClockApp() {
        const el = document.getElementById('clock-app-time');
        const del = document.getElementById('clock-app-date');
        if (el) {
          const now = new Date();
          el.textContent = now.toLocaleTimeString();
          if (del) del.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          requestAnimationFrame(updateClockApp);
        }
      }
      updateClockApp();
    }
  },

  camera: {
    title: 'Camera',
    icon: '<i class="fas fa-camera" style="color:#888"></i>',
    width: 500, height: 400,
    content: () => `
      <div class="camera-app">
        <i class="fas fa-camera"></i>
        <span>Camera access requires a real device</span>
        <span style="margin-top:8px;color:#333;font-size:12px">This is a simulated environment</span>
      </div>
    `
  }
};
