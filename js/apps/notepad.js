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
