// ========== SNIPPING TOOL ==========
function initSnippingTool(body, win) {
  let mode = 'rectangle';
  body.innerHTML = `<div class="snipping-tool">
    <h3 style="color:var(--text)">Snipping Tool</h3>
    <div class="snipping-modes">
      <div class="snipping-mode active" onclick="this.closest('.window').__app.setMode('rectangle',this)">Rectangle</div>
      <div class="snipping-mode" onclick="this.closest('.window').__app.setMode('window',this)">Window</div>
      <div class="snipping-mode" onclick="this.closest('.window').__app.setMode('fullscreen',this)">Full screen</div>
    </div>
    <button onclick="this.closest('.window').__app.snip()"><i class="fas fa-cut"></i> New Snip</button>
    <div id="snip-preview-${win.id}" style="width:100%;text-align:center;color:var(--text2);font-size:13px">Capture area will appear here</div>
  </div>`;
  win.__app = {
    setMode: (m, el) => { mode = m; body.querySelectorAll('.snipping-mode').forEach(e => e.classList.remove('active')); el.classList.add('active'); },
    snip: () => {
      const preview = body.querySelector(`#snip-preview-${win.id}`);
      if (preview) {
        preview.innerHTML = `<div style="width:100%;height:200px;background:linear-gradient(135deg,var(--bg),var(--bg2));border:1px solid var(--border);border-radius:4px;display:flex;align-items:center;justify-content:center;color:var(--text2);font-size:13px"><i class="fas fa-image" style="font-size:32px;opacity:.3"></i></div><p style="font-size:11px;color:var(--text2);margin-top:8px">Snip captured (${mode})</p>`;
        if (typeof showToast === 'function') showToast('Snipping Tool', 'Snip captured to clipboard');
      }
    }
  };
}
