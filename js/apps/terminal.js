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
