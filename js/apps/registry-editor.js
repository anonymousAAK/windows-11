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
