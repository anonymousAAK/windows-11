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
