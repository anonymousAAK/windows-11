// ========== VIRTUAL FILE SYSTEM ==========
const VFS = {
  data: JSON.parse(localStorage.getItem('win11_vfs') || 'null') || {
    'C:': {
      type: 'folder', children: {
        'Users': { type: 'folder', children: {
          'User': { type: 'folder', children: {
            'Desktop': { type: 'folder', children: {
              'New Folder': { type: 'folder', children: {} }
            }},
            'Documents': { type: 'folder', children: {
              'readme.txt': { type: 'file', content: 'Welcome to Windows 11!\nThis is a text file.', size: 42 },
              'notes.txt': { type: 'file', content: 'My notes go here...', size: 19 },
              'report.docx': { type: 'file', content: '[Word Document]', size: 24500 }
            }},
            'Downloads': { type: 'folder', children: {
              'setup.exe': { type: 'file', content: '', size: 5242880 },
              'photo.jpg': { type: 'file', content: '', size: 2048000 },
              'data.csv': { type: 'file', content: 'Name,Age,City\nAlice,30,NYC\nBob,25,LA', size: 38 }
            }},
            'Pictures': { type: 'folder', children: {
              'vacation.jpg': { type: 'file', content: '', size: 3145728 },
              'screenshot.png': { type: 'file', content: '', size: 1048576 }
            }},
            'Music': { type: 'folder', children: {
              'song1.mp3': { type: 'file', content: '', size: 4194304 },
              'song2.mp3': { type: 'file', content: '', size: 3670016 }
            }},
            'Videos': { type: 'folder', children: {
              'clip.mp4': { type: 'file', content: '', size: 10485760 }
            }}
          }}
        }},
        'Windows': { type: 'folder', children: {
          'System32': { type: 'folder', children: {
            'cmd.exe': { type: 'file', content: '', size: 289792 },
            'notepad.exe': { type: 'file', content: '', size: 201216 },
            'drivers': { type: 'folder', children: {} }
          }},
          'Fonts': { type: 'folder', children: {} }
        }},
        'Program Files': { type: 'folder', children: {
          'Microsoft Edge': { type: 'folder', children: {} },
          'Windows Defender': { type: 'folder', children: {} }
        }}
      }
    }
  },
  save() { localStorage.setItem('win11_vfs', JSON.stringify(this.data)); },
  resolve(path) {
    const parts = path.replace(/\\/g, '/').split('/').filter(Boolean);
    let node = this.data;
    for (const p of parts) {
      if (!node || !node.children && !node[p]) {
        if (node && node[p]) { node = node[p]; continue; }
        return null;
      }
      node = node.children ? node.children[p] : node[p];
    }
    return node;
  },
  resolvePath(path) {
    const parts = path.replace(/\\/g, '/').split('/').filter(Boolean);
    let node = this.data;
    for (let i = 0; i < parts.length - 1; i++) {
      node = node.children ? node.children[parts[i]] : node[parts[i]];
      if (!node) return null;
    }
    return { parent: node, name: parts[parts.length - 1] };
  },
  list(path) {
    const node = this.resolve(path);
    if (!node || !node.children) return [];
    return Object.entries(node.children).map(([name, item]) => ({
      name, type: item.type, size: item.size || 0,
      children: item.children ? Object.keys(item.children).length : 0
    }));
  },
  read(path) {
    const node = this.resolve(path);
    return node && node.type === 'file' ? (node.content || '') : null;
  },
  write(path, content) {
    const r = this.resolvePath(path);
    if (!r) return false;
    const parent = r.parent.children || r.parent;
    if (!parent[r.name]) parent[r.name] = { type: 'file', content: '', size: 0 };
    parent[r.name].content = content;
    parent[r.name].size = content.length;
    this.save();
    return true;
  },
  mkdir(path) {
    const r = this.resolvePath(path);
    if (!r) return false;
    const parent = r.parent.children || r.parent;
    if (parent[r.name]) return false;
    parent[r.name] = { type: 'folder', children: {} };
    this.save();
    return true;
  },
  remove(path) {
    const r = this.resolvePath(path);
    if (!r) return false;
    const parent = r.parent.children || r.parent;
    if (!parent[r.name]) return false;
    delete parent[r.name];
    this.save();
    return true;
  },
  rename(path, newName) {
    const r = this.resolvePath(path);
    if (!r) return false;
    const parent = r.parent.children || r.parent;
    if (!parent[r.name] || parent[newName]) return false;
    parent[newName] = parent[r.name];
    delete parent[r.name];
    this.save();
    return true;
  },
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
};

// ========== APP DEFINITIONS ==========
const APP_DEFS = {
  explorer: {
    title: 'File Explorer', icon: 'fas fa-folder', color: '#ffb900',
    width: 900, height: 550, pinned: true, pinnedOrder: 0,
    init: initExplorer
  },
  notepad: {
    title: 'Notepad', icon: 'fas fa-file-alt', color: '#6b69d6',
    width: 700, height: 500, pinned: true, pinnedOrder: 6,
    init: initNotepad
  },
  calculator: {
    title: 'Calculator', icon: 'fas fa-calculator', color: '#1a1a1a',
    width: 340, height: 520, pinned: true, pinnedOrder: 7,
    init: initCalculator
  },
  terminal: {
    title: 'Terminal', icon: 'fas fa-terminal', color: '#0c0c0c',
    width: 750, height: 480, pinned: true, pinnedOrder: 2,
    init: initTerminal
  },
  edge: {
    title: 'Microsoft Edge', icon: 'fas fa-globe', color: '#0078d4',
    width: 1000, height: 650, pinned: true, pinnedOrder: 1,
    init: initEdge
  },
  settings: {
    title: 'Settings', icon: 'fas fa-cog', color: '#0078d4',
    width: 850, height: 560, pinned: true, pinnedOrder: 8,
    init: initSettings
  },
  music: {
    title: 'Music Player', icon: 'fas fa-music', color: '#e91e63',
    width: 400, height: 600, pinned: true, pinnedOrder: 3,
    init: initMusicPlayer
  },
  video: {
    title: 'Video Player', icon: 'fas fa-video', color: '#ff5722',
    width: 700, height: 480, pinned: false,
    init: initVideoPlayer
  },
  calendar: {
    title: 'Calendar', icon: 'fas fa-calendar-alt', color: '#0078d4',
    width: 400, height: 440, pinned: true, pinnedOrder: 4,
    init: initCalendar
  },
  mail: {
    title: 'Mail', icon: 'fas fa-envelope', color: '#0078d4',
    width: 900, height: 560, pinned: true, pinnedOrder: 5,
    init: initMail
  },
  stickynotes: {
    title: 'Sticky Notes', icon: 'fas fa-sticky-note', color: '#fff9c4',
    width: 600, height: 450, pinned: false,
    init: initStickyNotes
  },
  snippingtool: {
    title: 'Snipping Tool', icon: 'fas fa-crop-alt', color: '#607d8b',
    width: 400, height: 350, pinned: false,
    init: initSnippingTool
  },
  taskmanager: {
    title: 'Task Manager', icon: 'fas fa-tasks', color: '#2e7d32',
    width: 700, height: 500, pinned: false,
    init: initTaskManager
  },
  minesweeper: {
    title: 'Minesweeper', icon: 'fas fa-bomb', color: '#607d8b',
    width: 440, height: 540, pinned: false,
    init: initMinesweeper
  },
  snake: {
    title: 'Snake', icon: 'fas fa-gamepad', color: '#4caf50',
    width: 440, height: 540, pinned: false,
    init: initSnake
  },
  clock: {
    title: 'Clock', icon: 'fas fa-clock', color: '#0078d4',
    width: 400, height: 500, pinned: false,
    init: initClock
  },
  todo: {
    title: 'To-Do', icon: 'fas fa-check-circle', color: '#5b5fc7',
    width: 400, height: 500, pinned: false,
    init: initTodo
  },
  whiteboard: {
    title: 'Whiteboard', icon: 'fas fa-paint-brush', color: '#00bcd4',
    width: 800, height: 550, pinned: false,
    init: initWhiteboard
  },
  registry: {
    title: 'Registry Editor', icon: 'fas fa-database', color: '#795548',
    width: 750, height: 450, pinned: false,
    init: initRegistry
  },
  controlpanel: {
    title: 'Control Panel', icon: 'fas fa-sliders-h', color: '#0078d4',
    width: 700, height: 480, pinned: false,
    init: initControlPanel
  },
  diskcleanup: {
    title: 'Disk Cleanup', icon: 'fas fa-broom', color: '#607d8b',
    width: 380, height: 400, pinned: false,
    init: initDiskCleanup
  }
};

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

// ========== NOTEPAD ==========
function initNotepad(body, win, opts) {
  const state = { tabs: [{ id: 0, name: 'Untitled', content: '', path: null, modified: false }], activeTab: 0, tabCounter: 1, wordWrap: false, showLineNumbers: true, showFind: false, fontSize: 13 };
  if (opts && opts.file) {
    const content = VFS.read(opts.file);
    if (content !== null) { state.tabs[0] = { id: 0, name: opts.file.split('/').pop(), content, path: opts.file, modified: false }; }
  }
  function render() {
    const tab = state.tabs[state.activeTab];
    const lines = (tab.content || '').split('\n');
    body.innerHTML = `
      <div class="notepad">
        <div class="notepad-tabs">
          ${state.tabs.map((t, i) => `<div class="notepad-tab ${i === state.activeTab ? 'active' : ''}" onclick="this.closest('.window').__app.switchTab(${i})">
            ${t.modified ? '● ' : ''}${t.name}
            ${state.tabs.length > 1 ? `<span class="tab-close" onclick="event.stopPropagation();this.closest('.window').__app.closeTab(${i})">&times;</span>` : ''}
          </div>`).join('')}
          <button class="notepad-tab-add" onclick="this.closest('.window').__app.addTab()">+</button>
        </div>
        <div class="notepad-toolbar">
          <button class="ntb" onclick="this.closest('.window').__app.newFile()"><i class="fas fa-file"></i> New</button>
          <button class="ntb" onclick="this.closest('.window').__app.save()"><i class="fas fa-save"></i> Save</button>
          <span class="ntb-sep"></span>
          <button class="ntb" onclick="this.closest('.window').__app.undo()"><i class="fas fa-undo"></i></button>
          <button class="ntb" onclick="this.closest('.window').__app.redo()"><i class="fas fa-redo"></i></button>
          <span class="ntb-sep"></span>
          <button class="ntb" onclick="this.closest('.window').__app.toggleFind()"><i class="fas fa-search"></i> Find</button>
          <span class="ntb-sep"></span>
          <button class="ntb ${state.wordWrap?'active':''}" onclick="this.closest('.window').__app.toggleWrap()"><i class="fas fa-text-width"></i> Wrap</button>
          <button class="ntb ${state.showLineNumbers?'active':''}" onclick="this.closest('.window').__app.toggleLineNums()"><i class="fas fa-list-ol"></i></button>
          <span class="ntb-sep"></span>
          <select style="background:var(--input-bg);border:1px solid var(--input-border);border-radius:4px;color:var(--text);font-size:11px;padding:2px 4px" onchange="this.closest('.window').__app.setFontSize(this.value)">
            <option ${state.fontSize===11?'selected':''} value="11">11px</option>
            <option ${state.fontSize===13?'selected':''} value="13">13px</option>
            <option ${state.fontSize===15?'selected':''} value="15">15px</option>
            <option ${state.fontSize===18?'selected':''} value="18">18px</option>
            <option ${state.fontSize===22?'selected':''} value="22">22px</option>
          </select>
        </div>
        <div class="notepad-editor-wrap">
          ${state.showFind ? `<div class="notepad-find">
            <input placeholder="Find..." id="np-find-${win.id}" onkeydown="if(event.key==='Enter')this.closest('.window').__app.findNext()">
            <button onclick="this.closest('.window').__app.findNext()">Next</button>
            <input placeholder="Replace..." id="np-replace-${win.id}">
            <button onclick="this.closest('.window').__app.replaceNext()">Replace</button>
            <button onclick="this.closest('.window').__app.replaceAll()">All</button>
            <button onclick="this.closest('.window').__app.toggleFind()">&times;</button>
          </div>` : ''}
          ${state.showLineNumbers ? `<div class="notepad-line-numbers" id="np-lines-${win.id}">${lines.map((_, i) => i + 1).join('\n')}</div>` : ''}
          <textarea class="notepad-editor ${state.wordWrap ? 'word-wrap' : ''}" id="np-editor-${win.id}"
            style="font-size:${state.fontSize}px"
            oninput="this.closest('.window').__app.onInput(this)"
            onscroll="this.closest('.window').__app.syncScroll(this)"
            spellcheck="false">${tab.content || ''}</textarea>
        </div>
        <div class="notepad-statusbar">
          <span>Ln ${1}, Col ${1}</span>
          <span>${lines.length} lines, ${(tab.content || '').split(/\s+/).filter(Boolean).length} words, ${(tab.content || '').length} chars</span>
          <span>UTF-8</span>
        </div>
      </div>`;
    const editor = body.querySelector(`#np-editor-${win.id}`);
    if (editor) {
      editor.addEventListener('click', () => updateStatus(editor));
      editor.addEventListener('keyup', () => updateStatus(editor));
    }
  }
  function updateStatus(editor) {
    const pos = editor.selectionStart;
    const text = editor.value.substring(0, pos);
    const line = text.split('\n').length;
    const col = pos - text.lastIndexOf('\n');
    const sb = body.querySelector('.notepad-statusbar span');
    if (sb) sb.textContent = `Ln ${line}, Col ${col}`;
  }
  function switchTab(i) { saveCurrentContent(); state.activeTab = i; render(); }
  function closeTab(i) { saveCurrentContent(); state.tabs.splice(i, 1); if (state.activeTab >= state.tabs.length) state.activeTab = state.tabs.length - 1; render(); }
  function addTab() { saveCurrentContent(); state.tabs.push({ id: state.tabCounter++, name: 'Untitled', content: '', path: null, modified: false }); state.activeTab = state.tabs.length - 1; render(); }
  function saveCurrentContent() { const ed = body.querySelector(`#np-editor-${win.id}`); if (ed) state.tabs[state.activeTab].content = ed.value; }
  function onInput(el) {
    state.tabs[state.activeTab].content = el.value;
    state.tabs[state.activeTab].modified = true;
    const linesEl = body.querySelector(`#np-lines-${win.id}`);
    if (linesEl) linesEl.textContent = el.value.split('\n').map((_, i) => i + 1).join('\n');
    const sb = body.querySelector('.notepad-statusbar');
    if (sb) {
      const lines = el.value.split('\n');
      const words = el.value.split(/\s+/).filter(Boolean).length;
      sb.children[1].textContent = `${lines.length} lines, ${words} words, ${el.value.length} chars`;
    }
    updateStatus(el);
  }
  function syncScroll(el) { const ln = body.querySelector(`#np-lines-${win.id}`); if (ln) ln.scrollTop = el.scrollTop; }
  function save() {
    saveCurrentContent();
    const tab = state.tabs[state.activeTab];
    if (!tab.path) tab.path = 'C:/Users/User/Documents/' + tab.name;
    VFS.write(tab.path, tab.content);
    tab.modified = false;
    if (typeof showToast === 'function') showToast('Notepad', `Saved ${tab.name}`);
    render();
  }
  function newFile() { addTab(); }
  function toggleWrap() { state.wordWrap = !state.wordWrap; saveCurrentContent(); render(); }
  function toggleLineNums() { state.showLineNumbers = !state.showLineNumbers; saveCurrentContent(); render(); }
  function toggleFind() { state.showFind = !state.showFind; saveCurrentContent(); render(); }
  function setFontSize(v) { state.fontSize = parseInt(v); saveCurrentContent(); render(); }
  function findNext() {
    const input = body.querySelector(`#np-find-${win.id}`);
    const editor = body.querySelector(`#np-editor-${win.id}`);
    if (!input || !editor || !input.value) return;
    const idx = editor.value.indexOf(input.value, editor.selectionEnd);
    if (idx >= 0) { editor.selectionStart = idx; editor.selectionEnd = idx + input.value.length; editor.focus(); }
  }
  function replaceNext() {
    const find = body.querySelector(`#np-find-${win.id}`);
    const repl = body.querySelector(`#np-replace-${win.id}`);
    const editor = body.querySelector(`#np-editor-${win.id}`);
    if (!find || !repl || !editor || !find.value) return;
    const start = editor.selectionStart, end = editor.selectionEnd;
    if (editor.value.substring(start, end) === find.value) {
      editor.value = editor.value.substring(0, start) + repl.value + editor.value.substring(end);
      onInput(editor);
    }
    findNext();
  }
  function replaceAll() {
    const find = body.querySelector(`#np-find-${win.id}`);
    const repl = body.querySelector(`#np-replace-${win.id}`);
    const editor = body.querySelector(`#np-editor-${win.id}`);
    if (!find || !repl || !editor || !find.value) return;
    editor.value = editor.value.split(find.value).join(repl.value);
    onInput(editor);
  }
  function undo() { document.execCommand('undo'); }
  function redo() { document.execCommand('redo'); }
  win.__app = { switchTab, closeTab, addTab, onInput, syncScroll, save, newFile, toggleWrap, toggleLineNums, toggleFind, setFontSize, findNext, replaceNext, replaceAll, undo, redo };
  render();
}

// ========== CALCULATOR ==========
function initCalculator(body, win) {
  const state = { mode: 'standard', display: '0', expression: '', memory: 0, history: [], justEvaluated: false };
  function render() {
    const modes = { standard: 'Standard', scientific: 'Scientific', programmer: 'Programmer' };
    let btns = '';
    if (state.mode === 'standard') {
      btns = `<div class="calc-buttons standard">
        ${['%','CE','C','⌫','1/x','x²','√','÷','7','8','9','×','4','5','6','-','1','2','3','+','±','0','.','='].map(b => {
          let cls = ''; if ('÷×-+'.includes(b)) cls = 'op'; if (b === '=') cls = 'eq'; if (['%','CE','C','⌫','1/x','x²','√'].includes(b)) cls = 'fn';
          return `<button class="calc-btn ${cls}" onclick="this.closest('.window').__app.press('${b}')">${b}</button>`;
        }).join('')}
      </div>`;
    } else if (state.mode === 'scientific') {
      btns = `<div class="calc-buttons scientific">
        ${['sin','cos','tan','π','e','x²','x³','xʸ','√','∛','log','ln','10ˣ','eˣ','n!','%','CE','C','⌫','÷','7','8','9','(','×','4','5','6',')','-','1','2','3','±','+','0','.',',','=',''].map(b => {
          if (!b) return '<button class="calc-btn" disabled></button>';
          let cls = ''; if ('÷×-+'.includes(b)) cls = 'op'; if (b === '=') cls = 'eq'; if (['sin','cos','tan','π','e','log','ln','10ˣ','eˣ','n!','x²','x³','xʸ','√','∛','%','CE','C','⌫','(',')'].includes(b)) cls = 'fn';
          return `<button class="calc-btn ${cls}" onclick="this.closest('.window').__app.press('${b}')">${b}</button>`;
        }).join('')}
      </div>`;
    } else {
      btns = `<div class="calc-buttons programmer">
        ${['AND','OR','XOR','NOT','<<','>>','C','⌫','7','8','9','÷','4','5','6','×','1','2','3','-','0','A-F','.','='].map(b => {
          let cls = ''; if ('÷×-+'.includes(b)) cls = 'op'; if (b === '=') cls = 'eq'; if (['AND','OR','XOR','NOT','<<','>>','C','⌫','A-F'].includes(b)) cls = 'fn';
          return `<button class="calc-btn ${cls}" onclick="this.closest('.window').__app.press('${b}')">${b}</button>`;
        }).join('')}
      </div>`;
    }
    body.innerHTML = `<div class="calculator">
      <div class="calc-mode-bar">
        ${Object.entries(modes).map(([k,v]) => `<button class="calc-mode-btn ${state.mode===k?'active':''}" onclick="this.closest('.window').__app.setMode('${k}')">${v}</button>`).join('')}
      </div>
      <div class="calc-display">
        <div class="calc-expression">${state.expression}</div>
        <div class="calc-result">${state.display}</div>
      </div>
      <div class="calc-memory">
        <button onclick="this.closest('.window').__app.memOp('MC')">MC</button>
        <button onclick="this.closest('.window').__app.memOp('MR')">MR</button>
        <button onclick="this.closest('.window').__app.memOp('M+')">M+</button>
        <button onclick="this.closest('.window').__app.memOp('M-')">M-</button>
      </div>
      ${btns}
      <div class="calc-history">${state.history.slice(-5).reverse().map(h => `<div class="calc-history-item">${h}</div>`).join('')}</div>
    </div>`;
  }
  function press(btn) {
    const num = parseFloat(state.display.replace(/,/g, ''));
    if ('0123456789'.includes(btn)) {
      if (state.display === '0' || state.justEvaluated) { state.display = btn; state.justEvaluated = false; }
      else state.display += btn;
    } else if (btn === '.') {
      if (state.justEvaluated) { state.display = '0.'; state.justEvaluated = false; }
      else if (!state.display.includes('.')) state.display += '.';
    } else if (btn === 'C') { state.display = '0'; state.expression = ''; }
    else if (btn === 'CE') { state.display = '0'; }
    else if (btn === '⌫') { state.display = state.display.length > 1 ? state.display.slice(0, -1) : '0'; }
    else if (btn === '±') { state.display = String(-num); }
    else if (btn === 'x²') { state.expression = `sqr(${num})`; state.display = String(num * num); state.justEvaluated = true; }
    else if (btn === '√') { state.expression = `√(${num})`; state.display = String(Math.sqrt(num)); state.justEvaluated = true; }
    else if (btn === '1/x') { state.expression = `1/(${num})`; state.display = String(1/num); state.justEvaluated = true; }
    else if (btn === '%') { state.display = String(num / 100); }
    else if (btn === 'sin') { state.display = String(Math.sin(num * Math.PI / 180)); state.justEvaluated = true; }
    else if (btn === 'cos') { state.display = String(Math.cos(num * Math.PI / 180)); state.justEvaluated = true; }
    else if (btn === 'tan') { state.display = String(Math.tan(num * Math.PI / 180)); state.justEvaluated = true; }
    else if (btn === 'π') { state.display = String(Math.PI); state.justEvaluated = true; }
    else if (btn === 'e') { state.display = String(Math.E); state.justEvaluated = true; }
    else if (btn === 'log') { state.display = String(Math.log10(num)); state.justEvaluated = true; }
    else if (btn === 'ln') { state.display = String(Math.log(num)); state.justEvaluated = true; }
    else if (btn === 'n!') { let f = 1; for (let i = 2; i <= num; i++) f *= i; state.display = String(f); state.justEvaluated = true; }
    else if (btn === '10ˣ') { state.display = String(Math.pow(10, num)); state.justEvaluated = true; }
    else if (btn === 'eˣ') { state.display = String(Math.exp(num)); state.justEvaluated = true; }
    else if (btn === 'x³') { state.display = String(num ** 3); state.justEvaluated = true; }
    else if (btn === '∛') { state.display = String(Math.cbrt(num)); state.justEvaluated = true; }
    else if ('÷×-+'.includes(btn)) {
      const ops = { '÷': '/', '×': '*', '-': '-', '+': '+' };
      state.expression = state.display + ' ' + btn + ' ';
      state._op = ops[btn]; state._prev = num; state.display = '0'; state.justEvaluated = false;
    } else if (btn === '=') {
      if (state._op) {
        let result;
        try { result = eval(state._prev + state._op + num); } catch { result = 'Error'; }
        state.expression = state._prev + ' ' + state._op + ' ' + num + ' =';
        state.history.push(state.expression + ' ' + result);
        state.display = String(result);
        state._op = null; state.justEvaluated = true;
      }
    }
    render();
  }
  function setMode(m) { state.mode = m; state.display = '0'; state.expression = ''; render(); }
  function memOp(op) {
    const num = parseFloat(state.display);
    if (op === 'MC') state.memory = 0;
    else if (op === 'MR') { state.display = String(state.memory); state.justEvaluated = true; }
    else if (op === 'M+') state.memory += num;
    else if (op === 'M-') state.memory -= num;
    render();
  }
  win.__app = { press, setMode, memOp };
  render();
  win.addEventListener('keydown', e => {
    if ('0123456789'.includes(e.key)) press(e.key);
    else if (e.key === '+') press('+');
    else if (e.key === '-') press('-');
    else if (e.key === '*') press('×');
    else if (e.key === '/') { e.preventDefault(); press('÷'); }
    else if (e.key === 'Enter' || e.key === '=') press('=');
    else if (e.key === 'Backspace') press('⌫');
    else if (e.key === 'Escape') press('C');
    else if (e.key === '.') press('.');
  });
}

// ========== TERMINAL ==========
function initTerminal(body, win) {
  const state = { tabs: [{ id: 0, history: [], cmdHistory: [], histIdx: -1, cwd: 'C:/Users/User' }], activeTab: 0, tabCounter: 1, env: { PATH: '/usr/bin', HOME: 'C:/Users/User', USER: 'user', SHELL: '/bin/bash', TERM: 'xterm-256color' }, aliases: { ll: 'ls -la', cls: 'clear', '.': 'cd ..', '~': 'cd ~' } };
  const COMMANDS = {
    help: () => `Available commands: help, ls, cd, pwd, cat, echo, mkdir, rmdir, rm, touch, cp, mv, clear, whoami, hostname, date, uname, neofetch, ping, env, export, alias, history, tree, find, grep, wc, head, tail, sort, uniq, wget, curl, which, man, exit, hexdump, cowsay, sl, fortune, cal`,
    ls: (args, cwd) => {
      const path = args[0] ? (args[0].startsWith('C:') ? args[0] : cwd + '/' + args[0]) : cwd;
      const items = VFS.list(path);
      if (!items) return `<span class="error-text">ls: cannot access '${args[0]}': No such file or directory</span>`;
      const showAll = args.includes('-la') || args.includes('-l') || args.includes('-a');
      return items.map(i => {
        const color = i.type === 'folder' ? 'info-text' : 'output-text';
        if (args.includes('-l') || args.includes('-la')) {
          return `<span class="${color}">${i.type === 'folder' ? 'd' : '-'}rwxr-xr-x  1 user user  ${String(i.size).padStart(8)}  Mar 11 12:00  ${i.name}</span>`;
        }
        return `<span class="${color}">${i.name}</span>`;
      }).join(args.includes('-l') || args.includes('-la') ? '\n' : '  ') || '<span class="output-text">(empty)</span>';
    },
    cd: (args, cwd) => {
      let target = args[0] || 'C:/Users/User';
      if (target === '~') target = 'C:/Users/User';
      else if (target === '..') { const parts = cwd.split('/'); parts.pop(); target = parts.join('/') || 'C:'; }
      else if (target === '/') target = 'C:';
      else if (!target.startsWith('C:')) target = cwd + '/' + target;
      const node = VFS.resolve(target);
      if (!node || node.type !== 'folder') return `<span class="error-text">cd: no such directory: ${args[0]}</span>`;
      state.tabs[state.activeTab].cwd = target;
      return '';
    },
    pwd: (_, cwd) => cwd,
    cat: (args, cwd) => {
      if (!args[0]) return '<span class="error-text">cat: missing operand</span>';
      const path = args[0].startsWith('C:') ? args[0] : cwd + '/' + args[0];
      const content = VFS.read(path);
      return content !== null ? content : `<span class="error-text">cat: ${args[0]}: No such file</span>`;
    },
    echo: (args) => args.join(' ').replace(/^["']|["']$/g, ''),
    mkdir: (args, cwd) => { if (!args[0]) return '<span class="error-text">mkdir: missing operand</span>'; VFS.mkdir(cwd + '/' + args[0]); return ''; },
    rmdir: (args, cwd) => { if (!args[0]) return '<span class="error-text">rmdir: missing operand</span>'; VFS.remove(cwd + '/' + args[0]); return ''; },
    rm: (args, cwd) => { if (!args[0]) return '<span class="error-text">rm: missing operand</span>'; const target = args.filter(a => !a.startsWith('-')); target.forEach(t => VFS.remove(cwd + '/' + t)); return ''; },
    touch: (args, cwd) => { if (!args[0]) return '<span class="error-text">touch: missing operand</span>'; VFS.write(cwd + '/' + args[0], ''); return ''; },
    mv: (args, cwd) => { if (args.length < 2) return '<span class="error-text">mv: missing operand</span>'; VFS.rename(cwd + '/' + args[0], args[1]); return ''; },
    clear: () => { state.tabs[state.activeTab].history = []; return '__CLEAR__'; },
    whoami: () => 'user',
    hostname: () => 'DESKTOP-WIN11',
    date: () => new Date().toString(),
    uname: (args) => args.includes('-a') ? 'Windows-11-Web 11.0.0 DESKTOP-WIN11 x86_64' : 'Windows-11-Web',
    cal: () => {
      const d = new Date(), y = d.getFullYear(), m = d.getMonth();
      const first = new Date(y, m, 1).getDay(), days = new Date(y, m+1, 0).getDate();
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      let cal = `     ${months[m]} ${y}\nSu Mo Tu We Th Fr Sa\n`;
      cal += '   '.repeat(first);
      for (let i = 1; i <= days; i++) { cal += String(i).padStart(2) + (((first + i) % 7 === 0) ? '\n' : ' '); }
      return cal;
    },
    neofetch: () => `<span class="info-text">
        ████████████████  ████████████████   <span class="success-text">user</span>@<span class="success-text">DESKTOP-WIN11</span>
        ████████████████  ████████████████   ─────────────────
        ████████████████  ████████████████   <span class="info-text">OS:</span> Windows 11 Web Edition
        ████████████████  ████████████████   <span class="info-text">Host:</span> Browser VM
                                             <span class="info-text">Kernel:</span> WebKit 537.36
        ████████████████  ████████████████   <span class="info-text">Uptime:</span> ${Math.floor((Date.now() - (window._bootTime || Date.now())) / 60000)} mins
        ████████████████  ████████████████   <span class="info-text">Shell:</span> web-bash 5.1
        ████████████████  ████████████████   <span class="info-text">Resolution:</span> ${window.innerWidth}x${window.innerHeight}
        ████████████████  ████████████████   <span class="info-text">Theme:</span> ${document.body.classList.contains('dark') ? 'Dark' : 'Light'}
                                             <span class="info-text">Memory:</span> ${Math.round(performance.memory?.usedJSHeapSize/1048576||128)}MB / ${Math.round(performance.memory?.jsHeapSizeLimit/1048576||512)}MB</span>`,
    ping: (args) => { const host = args[0] || 'localhost'; return `PING ${host}: 64 bytes, time=<1ms\nPING ${host}: 64 bytes, time=<1ms\nPING ${host}: 64 bytes, time=<1ms\n--- ${host} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss`; },
    env: () => Object.entries(state.env).map(([k,v]) => `${k}=${v}`).join('\n'),
    export: (args) => { const [k, v] = (args[0] || '').split('='); if (k && v) { state.env[k] = v; return ''; } return '<span class="error-text">export: usage: export KEY=VALUE</span>'; },
    alias: (args) => { if (!args[0]) return Object.entries(state.aliases).map(([k,v]) => `alias ${k}='${v}'`).join('\n'); const [k,v] = args[0].split('='); if (k && v) { state.aliases[k] = v.replace(/'/g, ''); return ''; } return ''; },
    history: () => state.tabs[state.activeTab].cmdHistory.map((c, i) => `  ${i + 1}  ${c}`).join('\n'),
    tree: (args, cwd) => {
      function buildTree(path, prefix) {
        const items = VFS.list(path);
        return items.map((item, i) => {
          const isLast = i === items.length - 1;
          const line = prefix + (isLast ? '└── ' : '├── ') + item.name;
          if (item.type === 'folder') return line + '\n' + buildTree(path + '/' + item.name, prefix + (isLast ? '    ' : '│   '));
          return line;
        }).join('\n');
      }
      return (args[0] || cwd.split('/').pop()) + '\n' + buildTree(args[0] ? (cwd + '/' + args[0]) : cwd, '');
    },
    find: (args, cwd) => {
      const results = []; const target = args[0] || '.';
      function search(path) {
        VFS.list(path).forEach(item => { results.push(path + '/' + item.name); if (item.type === 'folder') search(path + '/' + item.name); });
      }
      search(target === '.' ? cwd : (target.startsWith('C:') ? target : cwd + '/' + target));
      return results.join('\n') || 'No results';
    },
    grep: (args, cwd) => {
      if (args.length < 2) return '<span class="error-text">grep: usage: grep PATTERN FILE</span>';
      const pattern = args[0], file = args[1];
      const content = VFS.read(file.startsWith('C:') ? file : cwd + '/' + file);
      if (content === null) return `<span class="error-text">grep: ${file}: No such file</span>`;
      return content.split('\n').filter(l => l.includes(pattern)).map(l => l.replace(new RegExp(pattern, 'g'), `<span class="warn-text">${pattern}</span>`)).join('\n') || 'No matches';
    },
    wc: (args, cwd) => {
      if (!args[0]) return '<span class="error-text">wc: missing operand</span>';
      const content = VFS.read(args[0].startsWith('C:') ? args[0] : cwd + '/' + args[0]);
      if (content === null) return `<span class="error-text">wc: ${args[0]}: No such file</span>`;
      const lines = content.split('\n').length, words = content.split(/\s+/).filter(Boolean).length;
      return `  ${lines}  ${words}  ${content.length} ${args[0]}`;
    },
    head: (args, cwd) => { const n = 10, content = VFS.read((args[0]||'').startsWith('C:') ? args[0] : cwd + '/' + (args[0]||'')); return content ? content.split('\n').slice(0, n).join('\n') : '<span class="error-text">head: error</span>'; },
    tail: (args, cwd) => { const n = 10, content = VFS.read((args[0]||'').startsWith('C:') ? args[0] : cwd + '/' + (args[0]||'')); return content ? content.split('\n').slice(-n).join('\n') : '<span class="error-text">tail: error</span>'; },
    sort: (args, cwd) => { const content = VFS.read((args[0]||'').startsWith('C:') ? args[0] : cwd + '/' + (args[0]||'')); return content ? content.split('\n').sort().join('\n') : '<span class="error-text">sort: error</span>'; },
    wget: (args) => `<span class="info-text">--${new Date().toISOString()}--  ${args[0] || 'http://example.com'}\nResolving... connecting... HTTP request sent.\n200 OK\nSaved 'index.html' [1256/1256]</span>`,
    curl: (args) => `<span class="output-text">&lt;!DOCTYPE html&gt;\n&lt;html&gt;&lt;head&gt;&lt;title&gt;Example&lt;/title&gt;&lt;/head&gt;\n&lt;body&gt;&lt;h1&gt;Hello from ${args[0] || 'localhost'}&lt;/h1&gt;&lt;/body&gt;&lt;/html&gt;</span>`,
    which: (args) => args[0] ? `/usr/bin/${args[0]}` : '<span class="error-text">which: missing argument</span>',
    man: (args) => args[0] ? `<span class="info-text">${args[0].toUpperCase()}(1)\n\nNAME\n    ${args[0]} - ${args[0]} command\n\nDESCRIPTION\n    The ${args[0]} utility performs operations.\n    See 'help' for available commands.</span>` : '<span class="error-text">What manual page do you want?</span>',
    cowsay: (args) => { const msg = args.join(' ') || 'Moo!'; const line = '-'.repeat(msg.length + 2); return ` ${line}\n< ${msg} >\n ${line}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`; },
    fortune: () => { const fortunes = ['The best way to predict the future is to create it.','A journey of a thousand miles begins with a single step.','Stay hungry, stay foolish.','In the middle of difficulty lies opportunity.','The only way to do great work is to love what you do.']; return fortunes[Math.floor(Math.random()*fortunes.length)]; },
    hexdump: (args, cwd) => { const content = VFS.read((args[0]||'').startsWith('C:') ? args[0] : cwd + '/' + (args[0]||'')); if (!content) return '<span class="error-text">hexdump: error</span>'; let hex = ''; for (let i = 0; i < Math.min(content.length, 128); i += 16) { const row = content.slice(i, i+16); hex += i.toString(16).padStart(8,'0') + '  ' + [...row].map(c => c.charCodeAt(0).toString(16).padStart(2,'0')).join(' ') + '\n'; } return hex; },
    exit: () => { if (typeof closeWindow === 'function') closeWindow(win.id); return ''; },
    bsod: () => { if (typeof triggerBSOD === 'function') triggerBSOD(); return ''; }
  };
  function render() {
    const tab = state.tabs[state.activeTab];
    body.innerHTML = `
      <div class="terminal">
        <div class="terminal-tabs">
          ${state.tabs.map((t, i) => `<div class="terminal-tab ${i === state.activeTab ? 'active' : ''}" onclick="this.closest('.window').__app.switchTab(${i})">
            <i class="fas fa-terminal" style="font-size:11px"></i> Terminal ${t.id + 1}
            ${state.tabs.length > 1 ? `<span class="tab-close" onclick="event.stopPropagation();this.closest('.window').__app.closeTab(${i})">&times;</span>` : ''}
          </div>`).join('')}
          <button class="terminal-tab-add" onclick="this.closest('.window').__app.addTab()">+</button>
        </div>
        <div class="terminal-output" id="term-out-${win.id}">
          <span class="info-text">Windows 11 Web Terminal [Version 11.0.0]</span>
          <span class="info-text">(c) Windows 11 Web. All rights reserved.</span>
          <span></span>
          ${tab.history.join('\n')}
        </div>
        <div class="terminal-input-line">
          <span class="prompt">${tab.cwd.replace('C:/Users/User', '~')} $</span>
          <input class="terminal-input" id="term-in-${win.id}" autofocus autocomplete="off" spellcheck="false">
        </div>
      </div>`;
    const input = body.querySelector(`#term-in-${win.id}`);
    const output = body.querySelector(`#term-out-${win.id}`);
    if (input) {
      input.focus();
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const cmd = input.value.trim();
          if (cmd) {
            tab.cmdHistory.push(cmd);
            tab.histIdx = tab.cmdHistory.length;
            const result = executeCmd(cmd, tab);
            if (result !== '__CLEAR__') {
              tab.history.push(`<span class="prompt">${tab.cwd.replace('C:/Users/User', '~')} $</span> <span class="cmd-text">${cmd}</span>`);
              if (result) tab.history.push(`<span class="output-text">${result}</span>`);
            }
          }
          render();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (tab.histIdx > 0) { tab.histIdx--; input.value = tab.cmdHistory[tab.histIdx]; }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (tab.histIdx < tab.cmdHistory.length - 1) { tab.histIdx++; input.value = tab.cmdHistory[tab.histIdx]; } else { tab.histIdx = tab.cmdHistory.length; input.value = ''; }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const val = input.value;
          const parts = val.split(' ');
          const last = parts[parts.length - 1];
          if (last) {
            const cmds = Object.keys(COMMANDS);
            const match = cmds.find(c => c.startsWith(last));
            if (match && parts.length === 1) input.value = match + ' ';
            else {
              const items = VFS.list(tab.cwd);
              const fileMatch = items.find(i => i.name.toLowerCase().startsWith(last.toLowerCase()));
              if (fileMatch) { parts[parts.length - 1] = fileMatch.name; input.value = parts.join(' '); }
            }
          }
        } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); COMMANDS.clear(); render(); }
      });
    }
    if (output) output.scrollTop = output.scrollHeight;
  }
  function executeCmd(cmdStr, tab) {
    // Handle pipes
    if (cmdStr.includes('|')) {
      const parts = cmdStr.split('|').map(s => s.trim());
      let output = '';
      for (const part of parts) { output = executeCmd(part + (output ? ' ' + output : ''), tab); }
      return output;
    }
    // Handle redirect
    if (cmdStr.includes('>')) {
      const [cmd, file] = cmdStr.split('>').map(s => s.trim());
      const output = executeCmd(cmd, tab);
      if (file) VFS.write(tab.cwd + '/' + file, output.replace(/<[^>]+>/g, ''));
      return '';
    }
    // Alias expansion
    const parts = cmdStr.split(/\s+/);
    let cmd = parts[0];
    if (state.aliases[cmd]) { const expanded = state.aliases[cmd].split(/\s+/); cmd = expanded[0]; parts.splice(0, 1, ...expanded); }
    const args = parts.slice(1);
    // Env var expansion
    args.forEach((a, i) => { if (a.startsWith('$')) { const v = a.slice(1); args[i] = state.env[v] || ''; } });
    if (COMMANDS[cmd]) return COMMANDS[cmd](args, tab.cwd);
    return `<span class="error-text">${cmd}: command not found. Type 'help' for available commands.</span>`;
  }
  function switchTab(i) { state.activeTab = i; render(); }
  function closeTab(i) { state.tabs.splice(i, 1); if (state.activeTab >= state.tabs.length) state.activeTab = state.tabs.length - 1; render(); }
  function addTab() { state.tabs.push({ id: state.tabCounter++, history: [], cmdHistory: [], histIdx: -1, cwd: 'C:/Users/User' }); state.activeTab = state.tabs.length - 1; render(); }
  win.__app = { switchTab, closeTab, addTab };
  render();
}

// ========== EDGE BROWSER ==========
function initEdge(body, win) {
  const state = { tabs: [{ id: 0, url: 'edge://newtab', title: 'New Tab', content: 'newtab' }], activeTab: 0, tabCounter: 1, bookmarks: ['Google','YouTube','GitHub','Reddit','Wikipedia','Stack Overflow'], history: [], showBookmarks: true };
  const PAGES = {
    newtab: () => `<div class="edge-new-tab"><h2>Welcome to Microsoft Edge</h2>
      <div class="edge-search-box"><input placeholder="Search the web" onkeydown="if(event.key==='Enter')this.closest('.window').__app.navigateTo('https://search.example.com?q='+this.value)"></div>
      <div class="edge-shortcuts">
        ${['Google:fab fa-google','YouTube:fab fa-youtube','GitHub:fab fa-github','Reddit:fab fa-reddit','Wikipedia:fab fa-wikipedia-w','StackOverflow:fab fa-stack-overflow','Twitter:fab fa-twitter','LinkedIn:fab fa-linkedin'].map(s => {
          const [name, icon] = s.split(':');
          return `<div class="edge-shortcut" onclick="this.closest('.window').__app.navigateTo('https://${name.toLowerCase()}.com')"><i class="${icon}"></i><span>${name}</span></div>`;
        }).join('')}
      </div></div>`,
    webpage: (url) => `<div class="edge-page"><h1>${new URL('https://' + url.replace(/^https?:\/\//, '')).hostname}</h1>
      <p>This is a simulated web page for <strong>${url}</strong>.</p>
      <p>In this Windows 11 web simulation, actual web browsing is not available, but the browser UI is fully functional with tabs, bookmarks, history, and navigation.</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
      <p><a href="#" onclick="this.closest('.window').__app.navigateTo('edge://newtab');return false">← Back to New Tab</a></p></div>`,
    history: () => `<div class="edge-page"><h1>Browsing History</h1>${state.history.length === 0 ? '<p>No history yet.</p>' : state.history.map(h => `<div style="padding:8px 0;border-bottom:1px solid var(--border)"><a href="#" onclick="this.closest('.window').__app.navigateTo('${h.url}');return false">${h.title}</a><br><small style="color:var(--text2)">${h.url} - ${h.time}</small></div>`).join('')}</div>`,
    bookmarks: () => `<div class="edge-page"><h1>Bookmarks</h1>${state.bookmarks.map(b => `<div style="padding:8px 0;border-bottom:1px solid var(--border)"><a href="#" onclick="this.closest('.window').__app.navigateTo('https://${b.toLowerCase().replace(/ /g,'')}.com');return false"><i class="fas fa-bookmark" style="margin-right:8px;color:var(--accent)"></i>${b}</a></div>`).join('')}</div>`,
    downloads: () => `<div class="edge-page"><h1>Downloads</h1><p>No downloads yet.</p></div>`,
    settings: () => `<div class="edge-page"><h1>Settings</h1><p>Browser settings would go here.</p></div>`
  };
  function render() {
    const tab = state.tabs[state.activeTab];
    let pageContent = '';
    if (tab.content === 'newtab') pageContent = PAGES.newtab();
    else if (tab.content === 'history') pageContent = PAGES.history();
    else if (tab.content === 'bookmarks') pageContent = PAGES.bookmarks();
    else if (tab.content === 'downloads') pageContent = PAGES.downloads();
    else if (tab.content === 'settings') pageContent = PAGES.settings();
    else pageContent = PAGES.webpage(tab.url);
    body.innerHTML = `<div class="edge">
      <div class="edge-tabs">
        ${state.tabs.map((t, i) => `<div class="edge-tab ${i === state.activeTab ? 'active' : ''}" onclick="this.closest('.window').__app.switchTab(${i})">
          <i class="fas fa-globe" style="font-size:11px"></i>
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis">${t.title}</span>
          <span class="tab-close" onclick="event.stopPropagation();this.closest('.window').__app.closeTab(${i})">&times;</span>
        </div>`).join('')}
        <button class="edge-tab-add" onclick="this.closest('.window').__app.addTab()">+</button>
      </div>
      <div class="edge-nav">
        <button onclick="this.closest('.window').__app.goBack()"><i class="fas fa-arrow-left"></i></button>
        <button onclick="this.closest('.window').__app.goForward()"><i class="fas fa-arrow-right"></i></button>
        <button onclick="this.closest('.window').__app.refresh()"><i class="fas fa-redo"></i></button>
        <button onclick="this.closest('.window').__app.navigateTo('edge://newtab')"><i class="fas fa-home"></i></button>
        <input class="edge-url" value="${tab.url}" onkeydown="if(event.key==='Enter')this.closest('.window').__app.navigateTo(this.value)">
        <button onclick="this.closest('.window').__app.addBookmark()" title="Bookmark"><i class="fas fa-star"></i></button>
        <button onclick="this.closest('.window').__app.navigateTo('edge://history')"><i class="fas fa-history"></i></button>
        <button onclick="this.closest('.window').__app.navigateTo('edge://downloads')"><i class="fas fa-download"></i></button>
      </div>
      ${state.showBookmarks ? `<div class="edge-bookmarks-bar">${state.bookmarks.map(b => `<div class="edge-bookmark" onclick="this.closest('.window').__app.navigateTo('https://${b.toLowerCase().replace(/ /g,'')}.com')"><i class="fas fa-globe" style="font-size:10px"></i>${b}</div>`).join('')}</div>` : ''}
      <div class="edge-content">${pageContent}</div>
    </div>`;
  }
  function navigateTo(url) {
    if (!url.includes('://') && !url.startsWith('edge://')) url = 'https://' + url;
    const tab = state.tabs[state.activeTab];
    tab.url = url;
    tab.title = url.startsWith('edge://') ? url.replace('edge://', '').charAt(0).toUpperCase() + url.replace('edge://', '').slice(1) : url.replace(/^https?:\/\//, '').split('/')[0];
    tab.content = url === 'edge://newtab' ? 'newtab' : url === 'edge://history' ? 'history' : url === 'edge://bookmarks' ? 'bookmarks' : url === 'edge://downloads' ? 'downloads' : url === 'edge://settings' ? 'settings' : 'webpage';
    state.history.push({ url, title: tab.title, time: new Date().toLocaleTimeString() });
    render();
  }
  function switchTab(i) { state.activeTab = i; render(); }
  function closeTab(i) { if (state.tabs.length === 1) { if (typeof closeWindow === 'function') closeWindow(win.id); return; } state.tabs.splice(i, 1); if (state.activeTab >= state.tabs.length) state.activeTab = state.tabs.length - 1; render(); }
  function addTab() { state.tabs.push({ id: state.tabCounter++, url: 'edge://newtab', title: 'New Tab', content: 'newtab' }); state.activeTab = state.tabs.length - 1; render(); }
  function goBack() { navigateTo('edge://newtab'); }
  function goForward() {}
  function refresh() { render(); }
  function addBookmark() { const tab = state.tabs[state.activeTab]; if (!state.bookmarks.includes(tab.title)) { state.bookmarks.push(tab.title); if (typeof showToast === 'function') showToast('Edge', 'Bookmark added'); render(); } }
  win.__app = { switchTab, closeTab, addTab, navigateTo, goBack, goForward, refresh, addBookmark };
  render();
}

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

// ========== MUSIC PLAYER ==========
function initMusicPlayer(body, win) {
  const tracks = [
    { title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', color: '#e91e63' },
    { title: 'Shape of You', artist: 'Ed Sheeran', duration: '3:53', color: '#9c27b0' },
    { title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', color: '#2196f3' },
    { title: 'Peaches', artist: 'Justin Bieber', duration: '3:18', color: '#ff9800' },
    { title: 'Good 4 U', artist: 'Olivia Rodrigo', duration: '2:58', color: '#f44336' },
  ];
  const state = { current: 0, playing: false, progress: 0, shuffle: false, repeat: false, volume: 80 };
  let interval = null;
  function render() {
    const t = tracks[state.current];
    body.innerHTML = `<div class="music-player">
      <div class="mp-artwork">
        <div class="mp-artwork-img" style="background:linear-gradient(135deg,${t.color},${t.color}88)">
          <i class="fas fa-music"></i>
        </div>
      </div>
      <div class="mp-info"><div class="mp-title">${t.title}</div><div class="mp-artist">${t.artist}</div></div>
      <div class="mp-progress">
        <div class="mp-progress-bar" onclick="this.closest('.window').__app.seek(event)">
          <div class="mp-progress-fill" style="width:${state.progress}%"></div>
        </div>
        <div class="mp-times"><span>${formatTime(state.progress * 200 / 100)}</span><span>${t.duration}</span></div>
      </div>
      <div class="mp-controls">
        <button onclick="this.closest('.window').__app.toggleShuffle()" style="color:${state.shuffle?'var(--accent-light)':'#fff'}"><i class="fas fa-random"></i></button>
        <button onclick="this.closest('.window').__app.prev()"><i class="fas fa-step-backward"></i></button>
        <button class="mp-play" onclick="this.closest('.window').__app.toggle()"><i class="fas fa-${state.playing?'pause':'play'}"></i></button>
        <button onclick="this.closest('.window').__app.next()"><i class="fas fa-step-forward"></i></button>
        <button onclick="this.closest('.window').__app.toggleRepeat()" style="color:${state.repeat?'var(--accent-light)':'#fff'}"><i class="fas fa-redo"></i></button>
      </div>
      <div class="mp-playlist">
        ${tracks.map((tr,i)=>`<div class="mp-playlist-item ${i===state.current?'active':''}" onclick="this.closest('.window').__app.play(${i})">
          <span class="mpi-num">${i===state.current&&state.playing?'♪':i+1}</span>
          <span class="mpi-title">${tr.title} - ${tr.artist}</span>
          <span class="mpi-dur">${tr.duration}</span>
        </div>`).join('')}
      </div>
    </div>`;
    win.__app = { toggle, prev, next, play, seek, toggleShuffle, toggleRepeat };
  }
  function formatTime(s) { const m = Math.floor(s/60); return `${m}:${String(Math.floor(s%60)).padStart(2,'0')}`; }
  function toggle() {
    state.playing = !state.playing;
    if (state.playing) { interval = setInterval(() => { state.progress = Math.min(100, state.progress + 0.5); if (state.progress >= 100) { if (state.repeat) state.progress = 0; else next(); } render(); }, 100); }
    else clearInterval(interval);
    render();
  }
  function play(i) { clearInterval(interval); state.current = i; state.progress = 0; state.playing = true; render(); interval = setInterval(() => { state.progress = Math.min(100, state.progress + 0.5); if (state.progress >= 100) { if (state.repeat) state.progress = 0; else next(); } render(); }, 100); }
  function prev() { play(state.shuffle ? Math.floor(Math.random()*tracks.length) : (state.current - 1 + tracks.length) % tracks.length); }
  function next() { play(state.shuffle ? Math.floor(Math.random()*tracks.length) : (state.current + 1) % tracks.length); }
  function seek(e) { const r = e.currentTarget.getBoundingClientRect(); state.progress = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)); render(); }
  function toggleShuffle() { state.shuffle = !state.shuffle; render(); }
  function toggleRepeat() { state.repeat = !state.repeat; render(); }
  win.addEventListener('remove', () => clearInterval(interval));
  render();
}

// ========== VIDEO PLAYER ==========
function initVideoPlayer(body, win) {
  const state = { playing: false, progress: 0, fullscreen: false };
  body.innerHTML = `<div class="video-player">
    <div class="video-display"><i class="fas fa-film"></i></div>
    <div class="video-controls">
      <div class="video-progress" id="vid-prog-${win.id}" onclick="vidSeek(event,${win.id})"><div class="video-progress-fill" id="vid-fill-${win.id}"></div></div>
      <div class="video-btn-row">
        <button onclick="vidToggle(${win.id})"><i class="fas fa-play" id="vid-ico-${win.id}"></i></button>
        <button><i class="fas fa-volume-up"></i></button>
        <input type="range" min="0" max="100" value="80" style="width:80px;accent-color:var(--accent)">
        <span style="color:#fff;font-size:12px;margin-left:auto">0:00 / 0:00</span>
        <button onclick="vidFullscreen(${win.id})"><i class="fas fa-expand"></i></button>
      </div>
    </div>
  </div>`;
  window[`vidState_${win.id}`] = state;
  window[`vidToggle`] = (id) => {};
  window[`vidSeek`] = (e, id) => {};
  window[`vidFullscreen`] = (id) => {};
}

// ========== CALENDAR ==========
function initCalendar(body, win) {
  const state = { year: new Date().getFullYear(), month: new Date().getMonth(), events: JSON.parse(localStorage.getItem('win11_cal_events')||'{}') };
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  function render() {
    const first = new Date(state.year, state.month, 1).getDay();
    const daysInMonth = new Date(state.year, state.month+1, 0).getDate();
    const today = new Date();
    let cells = '';
    for (let i = 0; i < first; i++) cells += `<div></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = today.getDate()===d && today.getMonth()===state.month && today.getFullYear()===state.year;
      const key = `${state.year}-${state.month+1}-${d}`;
      const hasEvent = state.events[key];
      cells += `<div class="cal-day ${isToday?'today':''}" onclick="this.closest('.window').__app.clickDay(${d})" title="${hasEvent||''}">${d}${hasEvent?'<span style="display:block;width:4px;height:4px;border-radius:50%;background:${isToday?\'#fff\':\'var(--accent)\'};margin:0 auto"></span>':''}</div>`;
    }
    body.innerHTML = `<div class="calendar-app">
      <div class="cal-header">
        <button onclick="this.closest('.window').__app.prevMonth()"><i class="fas fa-chevron-left"></i></button>
        <h2>${MONTHS[state.month]} ${state.year}</h2>
        <button onclick="this.closest('.window').__app.nextMonth()"><i class="fas fa-chevron-right"></i></button>
        <button onclick="this.closest('.window').__app.goToday()" style="font-size:12px">Today</button>
      </div>
      <div class="cal-grid">
        ${DAYS.map(d=>`<div class="cal-day-header">${d}</div>`).join('')}
        ${cells}
      </div>
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">
        <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:8px">Upcoming Events</div>
        ${Object.entries(state.events).filter(([k])=>k.startsWith(`${state.year}-${state.month+1}`)).map(([k,v])=>`<div style="padding:6px 0;font-size:12px;border-bottom:1px solid var(--border);color:var(--text)"><span style="color:var(--text2)">${k}: </span>${v}</div>`).join('') || '<div style="font-size:12px;color:var(--text2)">No events this month</div>'}
      </div>
    </div>`;
    win.__app = {
      prevMonth: () => { state.month--; if (state.month < 0) { state.month = 11; state.year--; } render(); },
      nextMonth: () => { state.month++; if (state.month > 11) { state.month = 0; state.year++; } render(); },
      goToday: () => { state.year = new Date().getFullYear(); state.month = new Date().getMonth(); render(); },
      clickDay: (d) => {
        const key = `${state.year}-${state.month+1}-${d}`;
        const ev = prompt(`Event for ${MONTHS[state.month]} ${d}:`, state.events[key]||'');
        if (ev !== null) { if (ev) state.events[key] = ev; else delete state.events[key]; localStorage.setItem('win11_cal_events', JSON.stringify(state.events)); render(); }
      }
    };
  }
  render();
}

// ========== MAIL ==========
function initMail(body, win) {
  const mails = [
    { from:'Microsoft','subject':'Welcome to Windows 11 Web!',preview:'Thank you for using our web-based simulation...','body':'Thank you for using Windows 11 Web! We hope you enjoy all the features.',date:'Mar 11',unread:true,folder:'inbox'},
    { from:'GitHub','subject':'New activity on your repositories',preview:'Someone starred your project...',body:'You have new activity on GitHub. Check it out.',date:'Mar 10',unread:true,folder:'inbox'},
    { from:'Boss','subject':'Meeting tomorrow at 9am',preview:'Please join the standup...',body:'Hi,\n\nPlease join the standup tomorrow at 9am.\n\nThanks',date:'Mar 9',unread:false,folder:'inbox'},
    { from:'Newsletter','subject':'Your weekly digest',preview:'Top stories this week...',body:'Here are the top stories this week.',date:'Mar 8',unread:false,folder:'inbox'},
  ];
  const state = { folder:'inbox', selected:0, composing:false };
  function render() {
    const filtered = mails.filter(m=>m.folder===state.folder);
    const sel = filtered[state.selected];
    body.innerHTML = `<div class="mail-app">
      <div class="mail-sidebar">
        <button class="mail-compose-btn" onclick="this.closest('.window').__app.compose()"><i class="fas fa-pen"></i> New mail</button>
        ${[['inbox','fa-inbox','Inbox',mails.filter(m=>m.folder==='inbox'&&m.unread).length],['sent','fa-paper-plane','Sent',0],['drafts','fa-file-alt','Drafts',0],['trash','fa-trash','Trash',0]].map(([f,icon,label,badge])=>`
          <div class="mail-folder ${state.folder===f?'active':''}" onclick="this.closest('.window').__app.setFolder('${f}')">
            <i class="fas ${icon}"></i>${label}${badge?`<span class="badge">${badge}</span>`:''}
          </div>`).join('')}
      </div>
      <div class="mail-list">
        ${filtered.map((m,i)=>`<div class="mail-item ${i===state.selected?'active':''} ${m.unread?'unread':''}" onclick="this.closest('.window').__app.select(${i})">
          <div class="mail-item-from">${m.from}</div>
          <div class="mail-item-subject">${m.subject}</div>
          <div class="mail-item-preview">${m.preview}</div>
          <div class="mail-item-date">${m.date}</div>
        </div>`).join('')}
      </div>
      <div class="mail-detail">
        ${state.composing ? `<div style="display:flex;flex-direction:column;gap:8px">
          <h2>New Message</h2>
          <input placeholder="To:" style="padding:8px;border:1px solid var(--border);border-radius:4px;background:var(--input-bg);color:var(--text);font-size:13px;outline:none">
          <input placeholder="Subject:" style="padding:8px;border:1px solid var(--border);border-radius:4px;background:var(--input-bg);color:var(--text);font-size:13px;outline:none">
          <textarea placeholder="Message..." style="flex:1;min-height:200px;padding:8px;border:1px solid var(--border);border-radius:4px;background:var(--input-bg);color:var(--text);font-size:13px;outline:none;resize:none"></textarea>
          <div style="display:flex;gap:8px">
            <button style="padding:8px 20px;background:var(--accent);color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px" onclick="this.closest('.window').__app.sendMail()"><i class="fas fa-paper-plane"></i> Send</button>
            <button style="padding:8px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:13px;color:var(--text)" onclick="this.closest('.window').__app.compose()">Discard</button>
          </div>
        </div>` : sel ? `<h2>${sel.subject}</h2>
          <div class="mail-meta">From: <strong>${sel.from}</strong> | ${sel.date}</div>
          <div class="mail-body" style="white-space:pre-wrap">${sel.body}</div>
          <div style="margin-top:16px;display:flex;gap:8px">
            <button style="padding:8px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:13px;color:var(--text)" onclick="this.closest('.window').__app.compose()"><i class="fas fa-reply"></i> Reply</button>
            <button style="padding:8px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:13px;color:var(--text)"><i class="fas fa-trash"></i> Delete</button>
          </div>` : '<div style="color:var(--text2);text-align:center;padding:40px">Select a message</div>'}
      </div>
    </div>`;
    win.__app = {
      setFolder: (f) => { state.folder = f; state.selected = 0; state.composing = false; render(); },
      select: (i) => { state.selected = i; state.composing = false; const m = filtered[i]; if (m && m.unread) m.unread = false; render(); },
      compose: () => { state.composing = !state.composing; render(); },
      sendMail: () => { state.composing = false; if (typeof showToast === 'function') showToast('Mail', 'Message sent'); render(); }
    };
  }
  render();
}

// ========== STICKY NOTES ==========
function initStickyNotes(body, win) {
  const colors = ['yellow','green','pink','blue','purple'];
  const state = { notes: JSON.parse(localStorage.getItem('win11_sticky')||'[{"color":"yellow","text":"Hello! I am a sticky note."}]') };
  function save() { localStorage.setItem('win11_sticky', JSON.stringify(state.notes)); }
  function render() {
    body.innerHTML = `<div class="sticky-notes">
      ${state.notes.map((n,i)=>`<div class="sticky-note ${n.color}">
        <div class="sticky-note-header">
          ${colors.map(c=>`<button onclick="this.closest('.window').__app.setColor(${i},'${c}')" style="width:12px;height:12px;border-radius:50%;background:var(--sn-${c},${c==='yellow'?'#fff9c4':c==='green'?'#c8e6c9':c==='pink'?'#f8bbd0':c==='blue'?'#bbdefb':'#e1bee7'});border:1px solid rgba(0,0,0,.2);cursor:pointer;padding:0"></button>`).join('')}
          <button onclick="this.closest('.window').__app.del(${i})"><i class="fas fa-times"></i></button>
        </div>
        <textarea oninput="this.closest('.window').__app.update(${i},this.value)" style="flex:1;background:transparent;border:none;resize:none;font-size:13px;line-height:1.5;color:#333;outline:none;width:100%">${n.text||''}</textarea>
      </div>`).join('')}
      <div class="sticky-add" onclick="this.closest('.window').__app.add()"><i class="fas fa-plus"></i></div>
    </div>`;
    win.__app = {
      add: () => { state.notes.push({ color: colors[Math.floor(Math.random()*colors.length)], text: '' }); save(); render(); },
      del: (i) => { state.notes.splice(i,1); save(); render(); },
      setColor: (i,c) => { state.notes[i].color = c; save(); render(); },
      update: (i,v) => { state.notes[i].text = v; save(); }
    };
  }
  render();
}

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

// ========== TASK MANAGER ==========
function initTaskManager(body, win) {
  const state = { tab: 'processes' };
  let interval;
  const fakeProcesses = [
    { name:'System', cpu:2, mem:180, status:'Running', pid:4 },
    { name:'Explorer.exe', cpu:1, mem:96, status:'Running', pid:1024 },
    { name:'Microsoft Edge', cpu:8, mem:420, status:'Running', pid:2048 },
    { name:'Notepad', cpu:0, mem:12, status:'Running', pid:3072 },
    { name:'Terminal', cpu:0, mem:18, status:'Running', pid:4096 },
    { name:'Task Manager', cpu:3, mem:24, status:'Running', pid:5120 },
  ];
  function getRandomDelta(base, range) { return Math.max(0, base + (Math.random()-0.5)*range); }
  function render() {
    const totalCpu = fakeProcesses.reduce((a,p)=>a+p.cpu,0);
    const totalMem = fakeProcesses.reduce((a,p)=>a+p.mem,0);
    let content = '';
    if (state.tab === 'processes') {
      content = `<div class="task-mgr-header"><span>Name</span><span>PID</span><span>CPU</span><span>Memory</span><span>Status</span></div>
        ${fakeProcesses.map((p,i)=>`<div class="task-mgr-row" onclick="this.classList.toggle('selected')">
          <span>${p.name}</span><span>${p.pid}</span>
          <span class="${p.cpu>5?'high':p.cpu>2?'med':''}">${p.cpu.toFixed(1)}%</span>
          <span>${p.mem} MB</span><span>${p.status}</span>
        </div>`).join('')}`;
    } else if (state.tab === 'performance') {
      content = `<div style="padding:16px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px">CPU</div>
            <div class="perf-graph" style="background:linear-gradient(180deg,rgba(0,120,212,.3),transparent)"><canvas width="200" height="80"></canvas></div>
            <div style="font-size:12px;color:var(--text2)">${totalCpu.toFixed(1)}% utilization</div></div>
          <div><div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px">Memory</div>
            <div class="perf-graph" style="background:linear-gradient(180deg,rgba(120,0,200,.3),transparent)"></div>
            <div style="font-size:12px;color:var(--text2)">${(totalMem/1024).toFixed(1)} GB in use</div></div>
        </div>
      </div>`;
    } else {
      content = `<div style="padding:16px;font-size:13px;color:var(--text2)">Startup apps management coming soon.</div>`;
    }
    body.innerHTML = `<div class="task-mgr">
      <div class="task-mgr-tabs">
        ${[['processes','Processes'],['performance','Performance'],['startup','Startup']].map(([t,l])=>`<div class="task-mgr-tab ${state.tab===t?'active':''}" onclick="this.closest('.window').__app.setTab('${t}')">${l}</div>`).join('')}
      </div>
      <div class="task-mgr-content">${content}</div>
      <div class="task-mgr-footer">
        <button onclick="this.closest('.window').__app.endTask()">End Task</button>
        <span style="font-size:11px;color:var(--text2)">CPU: ${totalCpu.toFixed(1)}% | RAM: ${totalMem}MB</span>
      </div>
    </div>`;
    win.__app = {
      setTab: (t) => { state.tab = t; render(); },
      endTask: () => { if (typeof showToast === 'function') showToast('Task Manager', 'Task ended'); }
    };
  }
  interval = setInterval(() => { fakeProcesses.forEach(p => { p.cpu = Math.max(0, Math.min(100, getRandomDelta(p.cpu, 4))); }); render(); }, 1500);
  win.addEventListener('remove', () => clearInterval(interval));
  render();
}

// ========== CLOCK ==========
function initClock(body, win) {
  const state = { tab: 'clock', running: false, elapsed: 0, laps: [], timerH: 0, timerM: 5, timerS: 0, timerRemaining: 0, timerRunning: false };
  let interval, timerInterval;
  function pad(n) { return String(Math.floor(n)).padStart(2,'0'); }
  function formatElapsed(ms) { const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000),s=Math.floor((ms%60000)/1000),cs=Math.floor((ms%1000)/10); return h>0?`${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`:`${pad(m)}:${pad(s)}.${pad(cs)}`; }
  function render() {
    const now = new Date();
    let content = '';
    if (state.tab === 'clock') {
      content = `<div class="clock-face">${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}</div>
        <div style="font-size:16px;color:var(--text2)">${now.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>`;
    } else if (state.tab === 'stopwatch') {
      content = `<div class="clock-face">${formatElapsed(state.elapsed)}</div>
        <div class="clock-controls">
          <button class="${state.running?'':'primary'}" onclick="this.closest('.window').__app.swToggle()">${state.running?'Stop':'Start'}</button>
          <button onclick="this.closest('.window').__app.swLap()"${!state.running?' disabled':''}>Lap</button>
          <button onclick="this.closest('.window').__app.swReset()">Reset</button>
        </div>
        <div class="clock-laps">
          ${state.laps.map((l,i)=>`<div class="clock-lap"><span>Lap ${state.laps.length-i}</span><span>${formatElapsed(l)}</span></div>`).reverse().join('')}
        </div>`;
    } else {
      const rem = state.timerRemaining;
      content = `<div class="clock-face">${pad(Math.floor(rem/3600))}:${pad(Math.floor((rem%3600)/60))}:${pad(rem%60)}</div>
        <div class="timer-input">
          <input type="number" min="0" max="23" value="${pad(state.timerH)}" onchange="this.closest('.window').__app.setTimer('h',this.value)"><span>h</span>
          <input type="number" min="0" max="59" value="${pad(state.timerM)}" onchange="this.closest('.window').__app.setTimer('m',this.value)"><span>m</span>
          <input type="number" min="0" max="59" value="${pad(state.timerS)}" onchange="this.closest('.window').__app.setTimer('s',this.value)"><span>s</span>
        </div>
        <div class="clock-controls">
          <button class="${state.timerRunning?'':'primary'}" onclick="this.closest('.window').__app.timerToggle()">${state.timerRunning?'Pause':'Start'}</button>
          <button onclick="this.closest('.window').__app.timerReset()">Reset</button>
        </div>`;
    }
    body.innerHTML = `<div class="clock-app">
      <div class="clock-tabs">
        ${[['clock','Clock'],['stopwatch','Stopwatch'],['timer','Timer']].map(([t,l])=>`<div class="clock-tab ${state.tab===t?'active':''}" onclick="this.closest('.window').__app.setTab('${t}')">${l}</div>`).join('')}
      </div>
      <div class="clock-content">${content}</div>
    </div>`;
    win.__app = {
      setTab: (t) => { state.tab = t; render(); },
      swToggle: () => {
        state.running = !state.running;
        if (state.running) { const start = Date.now() - state.elapsed; interval = setInterval(() => { state.elapsed = Date.now()-start; render(); }, 50); }
        else clearInterval(interval);
        render();
      },
      swLap: () => { if (state.running) { state.laps.push(state.elapsed); render(); } },
      swReset: () => { clearInterval(interval); state.running=false; state.elapsed=0; state.laps=[]; render(); },
      setTimer: (unit, val) => { state['timer'+unit.toUpperCase()] = parseInt(val)||0; state.timerRemaining = state.timerH*3600+state.timerM*60+state.timerS; render(); },
      timerToggle: () => {
        if (!state.timerRemaining && !state.timerRunning) { state.timerRemaining = state.timerH*3600+state.timerM*60+state.timerS; }
        state.timerRunning = !state.timerRunning;
        if (state.timerRunning) { timerInterval = setInterval(() => { if (state.timerRemaining > 0) { state.timerRemaining--; render(); } else { clearInterval(timerInterval); state.timerRunning=false; if (typeof showToast==='function') showToast('Clock','Timer finished!'); render(); } }, 1000); }
        else clearInterval(timerInterval);
        render();
      },
      timerReset: () => { clearInterval(timerInterval); state.timerRunning=false; state.timerRemaining=state.timerH*3600+state.timerM*60+state.timerS; render(); }
    };
    if (state.tab === 'clock') { interval = setTimeout(() => render(), 1000); }
  }
  win.addEventListener('remove', () => { clearInterval(interval); clearInterval(timerInterval); });
  render();
}

// ========== TO-DO ==========
function initTodo(body, win) {
  const state = { todos: JSON.parse(localStorage.getItem('win11_todos')||'[{"text":"Buy groceries","done":false},{"text":"Read a book","done":true}]') };
  function save() { localStorage.setItem('win11_todos', JSON.stringify(state.todos)); }
  function render() {
    body.innerHTML = `<div class="todo-app">
      <div class="todo-add">
        <input placeholder="Add a task..." id="todo-input-${win.id}" onkeydown="if(event.key==='Enter')this.closest('.window').__app.add()">
        <button onclick="this.closest('.window').__app.add()"><i class="fas fa-plus"></i> Add</button>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <span style="font-size:12px;color:var(--text2)">${state.todos.filter(t=>!t.done).length} remaining • ${state.todos.filter(t=>t.done).length} done</span>
        <button style="font-size:11px;background:none;border:none;color:var(--accent);cursor:pointer;margin-left:auto" onclick="this.closest('.window').__app.clearDone()">Clear done</button>
      </div>
      <div class="todo-list">
        ${state.todos.map((t,i)=>`<div class="todo-item ${t.done?'done':''}">
          <input type="checkbox" ${t.done?'checked':''} onchange="this.closest('.window').__app.toggle(${i})">
          <span class="todo-text" contenteditable="true" onblur="this.closest('.window').__app.edit(${i},this.textContent)">${t.text}</span>
          <button class="todo-del" onclick="this.closest('.window').__app.del(${i})"><i class="fas fa-times"></i></button>
        </div>`).join('')}
      </div>
    </div>`;
    win.__app = {
      add: () => { const input = body.querySelector(`#todo-input-${win.id}`); if (!input?.value.trim()) return; state.todos.unshift({text:input.value.trim(),done:false}); save(); render(); },
      toggle: (i) => { state.todos[i].done = !state.todos[i].done; save(); render(); },
      del: (i) => { state.todos.splice(i,1); save(); render(); },
      edit: (i,v) => { state.todos[i].text = v.trim(); save(); },
      clearDone: () => { state.todos = state.todos.filter(t=>!t.done); save(); render(); }
    };
  }
  render();
}

// ========== WHITEBOARD ==========
function initWhiteboard(body, win) {
  body.innerHTML = `<div class="whiteboard">
    <div class="wb-toolbar">
      <button id="wb-pen-${win.id}" class="active" onclick="wbTool(${win.id},'pen',this)"><i class="fas fa-pen"></i></button>
      <button onclick="wbTool(${win.id},'eraser',this)"><i class="fas fa-eraser"></i></button>
      <button onclick="wbTool(${win.id},'line',this)"><i class="fas fa-minus"></i></button>
      <button onclick="wbTool(${win.id},'rect',this)"><i class="fas fa-square"></i></button>
      <button onclick="wbTool(${win.id},'circle',this)"><i class="fas fa-circle"></i></button>
      <input type="color" value="#000000" id="wb-color-${win.id}" title="Color">
      <input type="range" min="1" max="20" value="3" id="wb-size-${win.id}" title="Size">
      <button onclick="wbClear(${win.id})"><i class="fas fa-trash"></i></button>
      <button onclick="wbUndo(${win.id})"><i class="fas fa-undo"></i></button>
    </div>
    <canvas class="wb-canvas" id="wb-canvas-${win.id}"></canvas>
  </div>`;
  const canvas = body.querySelector(`#wb-canvas-${win.id}`);
  const ctx = canvas.getContext('2d');
  const state = { tool:'pen', drawing:false, startX:0, startY:0, history:[] };
  function resize() { const r = canvas.parentElement.getBoundingClientRect(); canvas.width=r.width; canvas.height=r.height-4; }
  resize();
  ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
  window[`wbTool`] = (id, tool, el) => {
    if (id !== win.id) return; state.tool = tool;
    body.querySelectorAll('.wb-toolbar button').forEach(b=>b.classList.remove('active')); el.classList.add('active');
  };
  window[`wbClear`] = (id) => { if (id!==win.id) return; ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); state.history=[]; };
  window[`wbUndo`] = (id) => { if (id!==win.id) return; if (state.history.length) { const img=state.history.pop(); ctx.putImageData(img,0,0); } };
  canvas.addEventListener('mousedown', e => {
    state.drawing=true; state.startX=e.offsetX; state.startY=e.offsetY;
    state.history.push(ctx.getImageData(0,0,canvas.width,canvas.height));
    ctx.strokeStyle = body.querySelector(`#wb-color-${win.id}`).value;
    ctx.lineWidth = body.querySelector(`#wb-size-${win.id}`).value;
    ctx.lineCap='round';
    if (state.tool==='pen') { ctx.beginPath(); ctx.moveTo(e.offsetX,e.offsetY); }
  });
  canvas.addEventListener('mousemove', e => {
    if (!state.drawing) return;
    const color = body.querySelector(`#wb-color-${win.id}`).value;
    const size = body.querySelector(`#wb-size-${win.id}`).value;
    if (state.tool==='pen') { ctx.lineTo(e.offsetX,e.offsetY); ctx.stroke(); }
    else if (state.tool==='eraser') {
      ctx.save(); ctx.globalCompositeOperation='destination-out'; ctx.fillStyle='rgba(0,0,0,1)';
      ctx.beginPath(); ctx.arc(e.offsetX,e.offsetY,parseInt(size)*2,0,Math.PI*2); ctx.fill(); ctx.restore();
    } else if (['line','rect','circle'].includes(state.tool)) {
      const snapshot = state.history[state.history.length-1];
      if (snapshot) ctx.putImageData(snapshot,0,0);
      ctx.strokeStyle=color; ctx.lineWidth=size; ctx.beginPath();
      if (state.tool==='line') { ctx.moveTo(state.startX,state.startY); ctx.lineTo(e.offsetX,e.offsetY); ctx.stroke(); }
      else if (state.tool==='rect') { ctx.strokeRect(state.startX,state.startY,e.offsetX-state.startX,e.offsetY-state.startY); }
      else { ctx.ellipse(state.startX,state.startY,Math.abs(e.offsetX-state.startX),Math.abs(e.offsetY-state.startY),0,0,Math.PI*2); ctx.stroke(); }
    }
  });
  canvas.addEventListener('mouseup', () => { state.drawing=false; });
}

// ========== REGISTRY EDITOR ==========
function initRegistry(body, win) {
  const keys = {
    'HKEY_LOCAL_MACHINE': { 'SOFTWARE': { 'Microsoft': { 'Windows NT': { 'CurrentVersion': {} } }, 'Classes': {}, 'RegisteredApplications': {} }, 'SYSTEM': { 'CurrentControlSet': { 'Control': {}, 'Services': {} } } },
    'HKEY_CURRENT_USER': { 'SOFTWARE': { 'Microsoft': { 'Windows': {} } }, 'Control Panel': {}, 'Environment': {} },
    'HKEY_CLASSES_ROOT': { '.txt': {}, '.exe': {}, '.jpg': {} },
    'HKEY_USERS': { '.DEFAULT': {} },
    'HKEY_CURRENT_CONFIG': {}
  };
  const values = {
    'HKEY_LOCAL_MACHINE/SOFTWARE/Microsoft/Windows NT/CurrentVersion': [
      { name:'CurrentVersion', type:'REG_SZ', data:'10.0' },
      { name:'ProductName', type:'REG_SZ', data:'Windows 11 Web Edition' },
      { name:'BuildLab', type:'REG_SZ', data:'22621.web' }
    ]
  };
  let selected = '';
  function buildTree(obj, path, depth) {
    return Object.keys(obj).map(key => {
      const childPath = path ? `${path}/${key}` : key;
      const hasChildren = typeof obj[key]==='object' && Object.keys(obj[key]).length>0;
      return `<div>
        <div class="reg-tree-item ${selected===childPath?'active':''}" style="padding-left:${depth*12+8}px" onclick="this.closest('.window').__app.select('${childPath}')">
          <i class="fas fa-folder${hasChildren?'':'-open'}" style="font-size:11px;color:#ffb900"></i> ${key}
        </div>
        ${hasChildren ? buildTree(obj[key], childPath, depth+1) : ''}
      </div>`;
    }).join('');
  }
  function render() {
    const vals = values[selected] || [{ name:'(Default)', type:'REG_SZ', data:'(value not set)' }];
    body.innerHTML = `<div style="display:flex;height:100%">
      <div class="reg-tree">${buildTree(keys,'',0)}</div>
      <div style="flex:1;overflow-y:auto">
        <div style="padding:4px 8px;background:var(--bg);border-bottom:1px solid var(--border);font-size:11px;color:var(--text2)">
          Computer\\${selected.replace(/\//g,'\\')}
        </div>
        <div class="reg-values">
          <table>
            <tr><th>Name</th><th>Type</th><th>Data</th></tr>
            ${vals.map(v=>`<tr><td>${v.name}</td><td>${v.type}</td><td>${v.data}</td></tr>`).join('')}
          </table>
        </div>
      </div>
    </div>`;
    win.__app = { select: (path) => { selected = path; render(); } };
  }
  render();
}

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

// ========== MINESWEEPER ==========
function initMinesweeper(body, win) {
  const LEVELS = { beginner:{cols:9,rows:9,mines:10}, intermediate:{cols:16,rows:16,mines:40}, expert:{cols:30,rows:16,mines:99} };
  const state = { level:'beginner', grid:[], revealed:[], flagged:[], mineCount:10, gameOver:false, won:false, startTime:null, elapsed:0, firstClick:true };
  let timerInterval;
  function init(level) {
    clearInterval(timerInterval);
    const {cols,rows,mines} = LEVELS[level];
    state.level=level; state.mineCount=mines; state.gameOver=false; state.won=false; state.firstClick=true; state.elapsed=0; state.startTime=null;
    state.grid = Array(rows).fill(null).map(()=>Array(cols).fill(0));
    state.revealed = Array(rows).fill(null).map(()=>Array(cols).fill(false));
    state.flagged = Array(rows).fill(null).map(()=>Array(cols).fill(false));
    render();
  }
  function placeMines(skipR, skipC) {
    const {cols,rows,mines} = LEVELS[state.level];
    let placed=0;
    while (placed < mines) {
      const r=Math.floor(Math.random()*rows), c=Math.floor(Math.random()*cols);
      if (state.grid[r][c]===9) continue;
      if (Math.abs(r-skipR)<=1 && Math.abs(c-skipC)<=1) continue;
      state.grid[r][c]=9; placed++;
    }
    for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
      if (state.grid[r][c]===9) continue;
      let count=0;
      for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
        const nr=r+dr, nc=c+dc;
        if (nr>=0&&nr<rows&&nc>=0&&nc<cols&&state.grid[nr][nc]===9) count++;
      }
      state.grid[r][c]=count;
    }
  }
  function reveal(r, c) {
    const {cols,rows} = LEVELS[state.level];
    if (r<0||r>=rows||c<0||c>=cols||state.revealed[r][c]||state.flagged[r][c]) return;
    if (state.firstClick) {
      state.firstClick=false; placeMines(r,c);
      state.startTime=Date.now();
      timerInterval=setInterval(()=>{state.elapsed=Math.floor((Date.now()-state.startTime)/1000);render();},1000);
    }
    state.revealed[r][c]=true;
    if (state.grid[r][c]===9) { state.gameOver=true; clearInterval(timerInterval); for(let i=0;i<rows;i++)for(let j=0;j<cols;j++)if(state.grid[i][j]===9)state.revealed[i][j]=true; render(); return; }
    if (state.grid[r][c]===0) { for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) reveal(r+dr,c+dc); }
    const {rows:R,cols:C,mines:M}=LEVELS[state.level];
    const unrev=state.revealed.flat().filter(v=>!v).length;
    if (unrev===M) { state.won=true; clearInterval(timerInterval); }
    render();
  }
  function flag(r, c) {
    if (state.revealed[r][c]||state.gameOver) return;
    state.flagged[r][c]=!state.flagged[r][c]; render();
  }
  function render() {
    const {cols,rows} = LEVELS[state.level];
    const flagCount = state.flagged.flat().filter(Boolean).length;
    body.innerHTML = `<div class="minesweeper">
      <div class="mine-difficulty">
        ${Object.keys(LEVELS).map(l=>`<button class="${state.level===l?'active':''}" onclick="this.closest('.window').__app.initLevel('${l}')">${l.charAt(0).toUpperCase()+l.slice(1)}</button>`).join('')}
      </div>
      <div class="mine-header">
        <div class="mine-counter">${String(state.mineCount-flagCount).padStart(3,'0')}</div>
        <div class="mine-reset" onclick="this.closest('.window').__app.initLevel('${state.level}')">${state.gameOver?'😵':state.won?'😎':'🙂'}</div>
        <div class="mine-timer">${String(state.elapsed).padStart(3,'0')}</div>
      </div>
      <div class="mine-grid" style="grid-template-columns:repeat(${cols},28px)">
        ${Array(rows).fill(null).map((_,r)=>Array(cols).fill(null).map((_,c)=>{
          const rev=state.revealed[r][c], flg=state.flagged[r][c], val=state.grid[r][c];
          const isMine=val===9;
          return `<div class="mine-cell${rev?' revealed':''}${rev&&isMine?' mine':''}" ${val>0&&rev?`data-n="${val}"`:''} onclick="this.closest('.window').__app.reveal(${r},${c})" oncontextmenu="event.preventDefault();this.closest('.window').__app.flag(${r},${c})">${flg&&!rev?'🚩':rev&&isMine?'💣':rev&&val>0?val:''}</div>`;
        }).join('')).join('')}
      </div>
      ${state.gameOver?'<div style="margin-top:12px;font-size:16px;color:#e81123;font-weight:600">💥 Game Over!</div>':''}
      ${state.won?'<div style="margin-top:12px;font-size:16px;color:#7fba00;font-weight:600">🎉 You Won!</div>':''}
    </div>`;
    win.__app = { reveal, flag, initLevel: (l) => { init(l); } };
  }
  win.addEventListener('remove', () => clearInterval(timerInterval));
  init('beginner');
}

// ========== SNAKE ==========
function initSnake(body, win) {
  const CELL=20, COLS=20, ROWS=18;
  const state = { snake:[{x:10,y:9},{x:9,y:9},{x:8,y:9}], food:{x:15,y:9}, dir:{x:1,y:0}, nextDir:{x:1,y:0}, score:0, running:false, gameOver:false };
  let interval;
  body.innerHTML = `<div class="snake-game">
    <div class="snake-score">Score: <span id="snake-score-${win.id}">0</span></div>
    <canvas class="snake-canvas" id="snake-canvas-${win.id}" width="${COLS*CELL}" height="${ROWS*CELL}"></canvas>
    <div class="snake-controls">
      <button onclick="this.closest('.window').__app.start()" id="snake-start-${win.id}">Start</button>
      <button onclick="this.closest('.window').__app.reset()">Reset</button>
    </div>
    <div class="snake-message" id="snake-msg-${win.id}">Press Start to play!</div>
  </div>`;
  const canvas = body.querySelector(`#snake-canvas-${win.id}`);
  const ctx = canvas.getContext('2d');
  function placeFood() { state.food = { x:Math.floor(Math.random()*COLS), y:Math.floor(Math.random()*ROWS) }; }
  function draw() {
    ctx.fillStyle='#1a1a2e'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#ff4757';
    ctx.beginPath(); ctx.arc((state.food.x+.5)*CELL,(state.food.y+.5)*CELL,CELL*.4,0,Math.PI*2); ctx.fill();
    state.snake.forEach((seg,i) => {
      ctx.fillStyle = i===0?'#2ed573':'#7bed9f';
      ctx.beginPath(); ctx.roundRect(seg.x*CELL+1,seg.y*CELL+1,CELL-2,CELL-2,4); ctx.fill();
    });
  }
  function step() {
    state.dir = state.nextDir;
    const head = { x:state.snake[0].x+state.dir.x, y:state.snake[0].y+state.dir.y };
    if (head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||state.snake.some(s=>s.x===head.x&&s.y===head.y)) {
      state.gameOver=true; state.running=false; clearInterval(interval);
      body.querySelector(`#snake-msg-${win.id}`).textContent=`Game Over! Score: ${state.score}`;
      body.querySelector(`#snake-start-${win.id}`).textContent='Restart';
      return;
    }
    state.snake.unshift(head);
    if (head.x===state.food.x&&head.y===state.food.y) { state.score++; body.querySelector(`#snake-score-${win.id}`).textContent=state.score; placeFood(); }
    else state.snake.pop();
    draw();
  }
  function start() {
    if (state.gameOver) reset();
    state.running=!state.running;
    if (state.running) { interval=setInterval(step,150); body.querySelector(`#snake-start-${win.id}`).textContent='Pause'; body.querySelector(`#snake-msg-${win.id}`).textContent='Use arrow keys!'; }
    else { clearInterval(interval); body.querySelector(`#snake-start-${win.id}`).textContent='Resume'; }
  }
  function reset() {
    clearInterval(interval); state.snake=[{x:10,y:9},{x:9,y:9},{x:8,y:9}]; state.dir={x:1,y:0}; state.nextDir={x:1,y:0}; state.score=0; state.running=false; state.gameOver=false;
    body.querySelector(`#snake-score-${win.id}`).textContent='0';
    body.querySelector(`#snake-start-${win.id}`).textContent='Start';
    body.querySelector(`#snake-msg-${win.id}`).textContent='Press Start to play!';
    draw();
  }
  win.addEventListener('keydown', e => {
    if (!state.running) return;
    const dirs = { ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0}, w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0} };
    const d = dirs[e.key]; if (!d) return; e.preventDefault();
    if (d.x !== -state.dir.x || d.y !== -state.dir.y) state.nextDir = d;
  });
  win.addEventListener('remove', () => clearInterval(interval));
  win.__app = { start, reset };
  draw();
}
