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
