// ========== FILE EXPLORER ==========
function initExplorer(body, win) {
  const state = { path: 'C:/Users/User', tabs: [{ path: 'C:/Users/User', id: 0 }], activeTab: 0, view: 'grid', showPreview: false, tabCounter: 1 };
  function getIcon(name, type) {
    if (type === 'folder') return '<i class="fas fa-folder" style="color:#ffb900"></i>';
    const ext = name.split('.').pop().toLowerCase();
    const icons = { txt: 'fa-file-alt', doc: 'fa-file-word', docx: 'fa-file-word', pdf: 'fa-file-pdf', jpg: 'fa-file-image', jpeg: 'fa-file-image', png: 'fa-file-image', gif: 'fa-file-image', mp3: 'fa-file-audio', wav: 'fa-file-audio', mp4: 'fa-file-video', avi: 'fa-file-video', zip: 'fa-file-archive', rar: 'fa-file-archive', exe: 'fa-cog', csv: 'fa-file-csv', js: 'fa-file-code', html: 'fa-file-code', css: 'fa-file-code' };
    return `<i class="fas ${icons[ext] || 'fa-file'}" style="color:#0078d4"></i>`;
  }
  function render() {
    const tab = state.tabs[state.activeTab];
    state.path = tab.path;
    const items = VFS.list(state.path);
    const parts = state.path.split('/').filter(Boolean);
    body.innerHTML = `
      <div class="explorer">
        <div class="explorer-tabs">
          ${state.tabs.map((t, i) => `<div class="explorer-tab ${i === state.activeTab ? 'active' : ''}" onclick="this.closest('.window').__app.switchTab(${i})">
            <i class="fas fa-folder" style="font-size:12px;color:#ffb900"></i>
            <span>${t.path.split('/').pop() || 'C:'}</span>
            ${state.tabs.length > 1 ? `<span class="tab-close" onclick="event.stopPropagation();this.closest('.window').__app.closeTab(${i})">&times;</span>` : ''}
          </div>`).join('')}
          <button class="explorer-tab-add" onclick="this.closest('.window').__app.addTab()">+</button>
        </div>
        <div class="explorer-toolbar">
          <button class="etb" onclick="this.closest('.window').__app.goUp()"><i class="fas fa-arrow-up"></i></button>
          <button class="etb" onclick="this.closest('.window').__app.goBack()"><i class="fas fa-arrow-left"></i></button>
          <button class="etb" title="New folder" onclick="this.closest('.window').__app.newFolder()"><i class="fas fa-folder-plus"></i></button>
          <button class="etb" title="New file" onclick="this.closest('.window').__app.newFile()"><i class="fas fa-file-medical"></i></button>
          <button class="etb" title="Delete" onclick="this.closest('.window').__app.deleteSelected()"><i class="fas fa-trash"></i></button>
          <button class="etb" title="Rename" onclick="this.closest('.window').__app.renameSelected()"><i class="fas fa-pen"></i></button>
          <div style="flex:1"></div>
          <button class="etb ${state.view==='grid'?'active':''}" onclick="this.closest('.window').__app.setView('grid')"><i class="fas fa-th"></i></button>
          <button class="etb ${state.view==='list'?'active':''}" onclick="this.closest('.window').__app.setView('list')"><i class="fas fa-list"></i></button>
          <button class="etb ${state.view==='details'?'active':''}" onclick="this.closest('.window').__app.setView('details')"><i class="fas fa-th-list"></i></button>
          <button class="etb ${state.showPreview?'active':''}" onclick="this.closest('.window').__app.togglePreview()"><i class="fas fa-eye"></i></button>
        </div>
        <div class="explorer-address">
          <div class="explorer-breadcrumb">
            ${parts.map((p, i) => `<span onclick="this.closest('.window').__app.navigate('${parts.slice(0, i + 1).join('/')}')">${p}</span>${i < parts.length - 1 ? '<span class="bc-sep">›</span>' : ''}`).join('')}
          </div>
          <input class="explorer-search" placeholder="Search" oninput="this.closest('.window').__app.search(this.value)">
        </div>
        <div class="explorer-main">
          <div class="explorer-sidebar">
            <div class="explorer-sidebar-section">Quick access</div>
            <div class="explorer-sidebar-item ${state.path==='C:/Users/User/Desktop'?'active':''}" onclick="this.closest('.window').__app.navigate('C:/Users/User/Desktop')"><i class="fas fa-desktop"></i> Desktop</div>
            <div class="explorer-sidebar-item ${state.path==='C:/Users/User/Documents'?'active':''}" onclick="this.closest('.window').__app.navigate('C:/Users/User/Documents')"><i class="fas fa-file-alt"></i> Documents</div>
            <div class="explorer-sidebar-item ${state.path==='C:/Users/User/Downloads'?'active':''}" onclick="this.closest('.window').__app.navigate('C:/Users/User/Downloads')"><i class="fas fa-download"></i> Downloads</div>
            <div class="explorer-sidebar-item ${state.path==='C:/Users/User/Pictures'?'active':''}" onclick="this.closest('.window').__app.navigate('C:/Users/User/Pictures')"><i class="fas fa-image"></i> Pictures</div>
            <div class="explorer-sidebar-item ${state.path==='C:/Users/User/Music'?'active':''}" onclick="this.closest('.window').__app.navigate('C:/Users/User/Music')"><i class="fas fa-music"></i> Music</div>
            <div class="explorer-sidebar-item ${state.path==='C:/Users/User/Videos'?'active':''}" onclick="this.closest('.window').__app.navigate('C:/Users/User/Videos')"><i class="fas fa-video"></i> Videos</div>
            <div class="explorer-sidebar-section">This PC</div>
            <div class="explorer-sidebar-item ${state.path==='C:'?'active':''}" onclick="this.closest('.window').__app.navigate('C:')"><i class="fas fa-hdd"></i> Local Disk (C:)</div>
          </div>
          <div class="explorer-content ${state.view}-view" id="explorer-files-${win.id}">
            ${state.view === 'details' ? '<div class="explorer-details-header"><span style="flex:2">Name</span><span>Size</span><span>Type</span></div>' : ''}
            ${items.length === 0 ? '<div style="padding:40px;text-align:center;color:var(--text2)">This folder is empty</div>' : ''}
            ${items.map(item => `
              <div class="explorer-file" data-name="${item.name}" data-type="${item.type}"
                   ondblclick="this.closest('.window').__app.open('${item.name}','${item.type}')"
                   onclick="this.closest('.window').__app.select(this,'${item.name}')">
                <span class="ef-icon">${getIcon(item.name, item.type)}</span>
                <span class="ef-name">${item.name}</span>
                <span class="ef-size">${item.type === 'folder' ? `${item.children} items` : VFS.formatSize(item.size)}</span>
                <span class="ef-type">${item.type === 'folder' ? 'Folder' : item.name.split('.').pop().toUpperCase()}</span>
              </div>
            `).join('')}
          </div>
          ${state.showPreview ? `<div class="explorer-preview"><div class="ep-icon"><i class="fas fa-folder-open"></i></div><div class="ep-name">Select a file</div></div>` : ''}
        </div>
        <div class="explorer-statusbar">
          <span>${items.length} items</span>
          <span>${state.path}</span>
        </div>
      </div>`;
    win.__app = { navigate, goUp, goBack, open, select, setView, togglePreview, search, switchTab, closeTab, addTab, newFolder, newFile, deleteSelected, renameSelected, selectedItem: null };
  }
  function navigate(path) { state.tabs[state.activeTab].path = path; state.path = path; render(); }
  function goUp() { const parts = state.path.split('/').filter(Boolean); if (parts.length > 1) { parts.pop(); navigate(parts.join('/')); } }
  function goBack() { goUp(); }
  function open(name, type) {
    if (type === 'folder') navigate(state.path + '/' + name);
    else {
      const ext = name.split('.').pop().toLowerCase();
      if (['txt', 'js', 'html', 'css', 'csv', 'json', 'md'].includes(ext)) {
        openApp('notepad', { file: state.path + '/' + name });
      }
    }
  }
  function select(el, name) {
    body.querySelectorAll('.explorer-file').forEach(f => f.classList.remove('selected'));
    el.classList.add('selected');
    win.__app.selectedItem = name;
    if (state.showPreview) {
      const preview = body.querySelector('.explorer-preview');
      if (preview) {
        const item = VFS.resolve(state.path + '/' + name);
        preview.innerHTML = `<div class="ep-icon"><i class="fas fa-${item && item.type === 'folder' ? 'folder' : 'file'}"></i></div>
          <div class="ep-name">${name}</div>
          <div class="ep-detail">${item ? (item.type === 'folder' ? 'Folder' : VFS.formatSize(item.size || 0)) : ''}</div>`;
      }
    }
  }
  function setView(v) { state.view = v; render(); }
  function togglePreview() { state.showPreview = !state.showPreview; render(); }
  function search(q) {
    const items = body.querySelectorAll('.explorer-file');
    items.forEach(item => { item.style.display = item.dataset.name.toLowerCase().includes(q.toLowerCase()) ? '' : 'none'; });
  }
  function switchTab(i) { state.activeTab = i; render(); }
  function closeTab(i) { state.tabs.splice(i, 1); if (state.activeTab >= state.tabs.length) state.activeTab = state.tabs.length - 1; render(); }
  function addTab() { state.tabs.push({ path: 'C:/Users/User', id: state.tabCounter++ }); state.activeTab = state.tabs.length - 1; render(); }
  function newFolder() {
    const name = 'New Folder';
    let n = name, c = 1;
    while (VFS.resolve(state.path + '/' + n)) n = name + ' (' + (c++) + ')';
    VFS.mkdir(state.path + '/' + n);
    render();
  }
  function newFile() {
    let n = 'New File.txt', c = 1;
    while (VFS.resolve(state.path + '/' + n)) n = 'New File (' + (c++) + ').txt';
    VFS.write(state.path + '/' + n, '');
    render();
  }
  function deleteSelected() {
    if (win.__app.selectedItem) { VFS.remove(state.path + '/' + win.__app.selectedItem); render(); }
  }
  function renameSelected() {
    if (!win.__app.selectedItem) return;
    const el = body.querySelector('.explorer-file.selected .ef-name');
    if (!el) return;
    el.contentEditable = true; el.focus();
    const range = document.createRange(); range.selectNodeContents(el); window.getSelection().removeAllRanges(); window.getSelection().addRange(range);
    el.onblur = () => {
      const newName = el.textContent.trim();
      if (newName && newName !== win.__app.selectedItem) VFS.rename(state.path + '/' + win.__app.selectedItem, newName);
      render();
    };
    el.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); el.blur(); } };
  }
  render();
}
