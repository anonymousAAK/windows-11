// ========== SETTINGS ==========
function initSettings(body, win) {
  const state = { section: 'personalization' };
  const WALLPAPERS = [
    'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)',
    'linear-gradient(135deg,#0f3460,#533483,#e94560)',
    'linear-gradient(135deg,#0d0d0d,#1a1a1a,#2d2d2d)',
    'linear-gradient(135deg,#006994,#00b4d8,#90e0ef)',
    'linear-gradient(135deg,#2d6a4f,#40916c,#74c69d)',
    'linear-gradient(135deg,#7b2d8b,#a855f7,#ec4899)',
    'linear-gradient(135deg,#d62828,#f77f00,#fcbf49)',
    'linear-gradient(135deg,#1e3a5f,#2196f3,#64b5f6)',
  ];
  const ACCENTS = ['#0078d4','#e74856','#0099bc','#7a7574','#767676','#ff8c00','#498205','#8764b8'];
  function render() {
    const sections = {
      personalization: `<h2>Personalization</h2>
        <h3>Background</h3>
        <div class="settings-group">
          <div class="wallpaper-grid">${WALLPAPERS.map((w,i)=>`<div class="wallpaper-option ${(window._currentWallpaper||0)===i?'active':''}" style="background:${w}" onclick="setWallpaper(${i})" data-bg="${w}"></div>`).join('')}</div>
        </div>
        <h3>Colors</h3>
        <div class="settings-group">
          <div class="settings-row"><div><div class="sr-label">Dark mode</div><div class="sr-desc">Switch between light and dark</div></div>
            <div class="toggle-switch ${document.body.classList.contains('dark')?'on':''}" onclick="toggleDarkMode();this.classList.toggle('on')"></div></div>
          <div class="settings-row"><div class="sr-label">Accent color</div>
            <div class="settings-color-grid">${ACCENTS.map(c=>`<div class="color-swatch ${(window._accentColor||'#0078d4')===c?'active':''}" style="background:${c}" onclick="setAccentColor('${c}')"></div>`).join('')}</div></div>
        </div>
        <h3>Taskbar</h3>
        <div class="settings-group">
          <div class="settings-row"><div><div class="sr-label">Taskbar alignment</div></div>
            <select style="background:var(--input-bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:4px 8px;font-size:12px" onchange="setTaskbarAlign(this.value)">
              <option value="center" ${(window._taskbarAlign||'center')==='center'?'selected':''}>Center</option>
              <option value="left" ${(window._taskbarAlign||'center')==='left'?'selected':''}>Left</option>
            </select></div>
          <div class="settings-row"><div><div class="sr-label">Auto-hide taskbar</div></div>
            <div class="toggle-switch ${document.querySelector('.taskbar')?.classList.contains('auto-hide')?'on':''}" onclick="toggleAutoHide();this.classList.toggle('on')"></div></div>
        </div>`,
      system: `<h2>System</h2>
        <h3>Display</h3>
        <div class="settings-group">
          <div class="settings-row"><div><div class="sr-label">Brightness</div></div>
            <input type="range" min="20" max="100" value="${Math.round((window._brightness||1)*100)}" style="accent-color:var(--accent)" oninput="setBrightness(this.value)"></div>
          <div class="settings-row"><div class="sr-label">Resolution</div><span style="font-size:12px;color:var(--text2)">${window.innerWidth}×${window.innerHeight}</span></div>
        </div>
        <h3>Sound</h3>
        <div class="settings-group">
          <div class="settings-row"><div><div class="sr-label">System sounds</div></div>
            <div class="toggle-switch on" onclick="this.classList.toggle('on')"></div></div>
          <div class="settings-row"><div class="sr-label">Volume</div>
            <input type="range" min="0" max="100" value="65" style="accent-color:var(--accent)"></div>
        </div>`,
      apps: `<h2>Apps</h2>
        <h3>Startup Apps</h3>
        <div class="settings-group">
          ${Object.entries(APP_DEFS).map(([id,app])=>`<div class="settings-row">
            <div><div class="sr-label">${app.title}</div></div>
            <div class="toggle-switch" onclick="this.classList.toggle('on')"></div>
          </div>`).join('')}
        </div>`,
      accessibility: `<h2>Accessibility</h2>
        <div class="settings-group">
          <div class="settings-row"><div><div class="sr-label">Font size</div></div>
            <select style="background:var(--input-bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:4px 8px;font-size:12px" onchange="document.documentElement.style.fontSize=this.value+'px'">
              <option value="14">Normal (14px)</option><option value="16">Large (16px)</option><option value="18">Extra Large (18px)</option>
            </select></div>
          <div class="settings-row"><div><div class="sr-label">High contrast</div></div>
            <div class="toggle-switch" onclick="this.classList.toggle('on');document.body.classList.toggle('high-contrast')"></div></div>
          <div class="settings-row"><div><div class="sr-label">Cursor size</div></div>
            <input type="range" min="1" max="3" value="1" style="accent-color:var(--accent)" oninput="document.body.style.cursor='default'"></div>
        </div>`,
      about: `<h2>About</h2>
        <div class="settings-group">
          <div class="settings-row"><div class="sr-label">Device name</div><span style="font-size:12px;color:var(--text2)">DESKTOP-WIN11</span></div>
          <div class="settings-row"><div class="sr-label">Edition</div><span style="font-size:12px;color:var(--text2)">Windows 11 Web Edition</span></div>
          <div class="settings-row"><div class="sr-label">Version</div><span style="font-size:12px;color:var(--text2)">22H2 (Build 22621)</span></div>
          <div class="settings-row"><div class="sr-label">Processor</div><span style="font-size:12px;color:var(--text2)">Browser CPU</span></div>
          <div class="settings-row"><div class="sr-label">RAM</div><span style="font-size:12px;color:var(--text2)">${Math.round((performance.memory?.jsHeapSizeLimit||536870912)/1073741824*8)}GB</span></div>
          <div class="settings-row"><div class="sr-label">System type</div><span style="font-size:12px;color:var(--text2)">64-bit OS, x64-based processor</span></div>
        </div>
        <div style="margin-top:16px;display:flex;gap:8px">
          <button style="padding:8px 16px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--text);cursor:pointer;font-size:13px" onclick="triggerBSOD()">Trigger BSOD</button>
        </div>`
    };
    body.innerHTML = `<div class="settings">
      <div class="settings-sidebar">
        ${[['personalization','fa-palette','Personalization'],['system','fa-desktop','System'],['apps','fa-th-large','Apps'],['accessibility','fa-universal-access','Accessibility'],['about','fa-info-circle','About']].map(([id,icon,label])=>`
          <div class="settings-sidebar-item ${state.section===id?'active':''}" onclick="this.closest('.window').__app.setSection('${id}')"><i class="fas ${icon}"></i>${label}</div>`).join('')}
      </div>
      <div class="settings-content">${sections[state.section] || ''}</div>
    </div>`;
    win.__app = { setSection: (s) => { state.section = s; render(); } };
  }
  render();
}
