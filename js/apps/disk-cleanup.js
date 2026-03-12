// ========== DISK CLEANUP ==========
function initDiskCleanup(body, win) {
  const items = [
    { name:'Temporary files', size:'342 MB', checked:true },
    { name:'Downloaded program files', size:'12 MB', checked:true },
    { name:'Recycle Bin', size:'0 MB', checked:false },
    { name:'Thumbnails', size:'56 MB', checked:true },
    { name:'Error logs', size:'2 MB', checked:true },
    { name:'Old Windows installations', size:'3.2 GB', checked:false },
  ];
  body.innerHTML = `<div style="padding:20px">
    <h2 style="font-size:16px;color:var(--text);margin-bottom:12px"><i class="fas fa-broom"></i> Disk Cleanup - C:</h2>
    <p style="font-size:12px;color:var(--text2);margin-bottom:12px">You can free up space on your drive by deleting these files:</p>
    <div style="border:1px solid var(--border);border-radius:4px;overflow:hidden;margin-bottom:12px">
      ${items.map((i,idx)=>`<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--border);font-size:12px">
        <input type="checkbox" ${i.checked?'checked':''} id="dc-${idx}" style="accent-color:var(--accent)">
        <label for="dc-${idx}" style="flex:1;color:var(--text);cursor:pointer">${i.name}</label>
        <span style="color:var(--text2)">${i.size}</span>
      </div>`).join('')}
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px">
      <button style="padding:8px 20px;background:var(--accent);color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px" onclick="if(typeof showToast==='function')showToast('Disk Cleanup','Files deleted successfully');this.closest('.window').__app.close()">OK</button>
      <button style="padding:8px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:13px;color:var(--text)" onclick="this.closest('.window').__app.close()">Cancel</button>
    </div>
  </div>`;
  win.__app = { close: () => { if (typeof closeWindow==='function') closeWindow(win.id); } };
}

