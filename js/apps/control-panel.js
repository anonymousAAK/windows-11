// ========== CONTROL PANEL ==========
function initControlPanel(body, win) {
  const items = [
    { icon:'fa-desktop', label:'Display', click:"openApp('settings')" },
    { icon:'fa-volume-up', label:'Sound', click:"openApp('settings')" },
    { icon:'fa-shield-alt', label:'Security', click:"openApp('settings')" },
    { icon:'fa-wifi', label:'Network', click:"openApp('settings')" },
    { icon:'fa-users', label:'User Accounts', click:"openApp('settings')" },
    { icon:'fa-clock', label:'Date & Time', click:"openApp('clock')" },
    { icon:'fa-keyboard', label:'Keyboard', click:"openApp('settings')" },
    { icon:'fa-mouse', label:'Mouse', click:"openApp('settings')" },
    { icon:'fa-folder', label:'Folder Options', click:"openApp('explorer')" },
    { icon:'fa-power-off', label:'Power Options', click:"openApp('settings')" },
    { icon:'fa-trash', label:'Disk Cleanup', click:"openApp('diskcleanup')" },
    { icon:'fa-database', label:'Registry', click:"openApp('registry')" },
  ];
  body.innerHTML = `<div style="padding:16px">
    <h2 style="font-size:18px;color:var(--text);margin-bottom:16px">Control Panel</h2>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
      ${items.map(i=>`<div onclick="${i.click}" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px;border-radius:8px;cursor:pointer;border:1px solid var(--border);background:var(--card-bg)">
        <i class="fas ${i.icon}" style="font-size:28px;color:var(--accent)"></i>
        <span style="font-size:12px;color:var(--text);text-align:center">${i.label}</span>
      </div>`).join('')}
    </div>
  </div>`;
}
