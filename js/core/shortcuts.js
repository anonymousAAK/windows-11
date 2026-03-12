// ===== KEYBOARD SHORTCUTS =====
function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.altKey && e.key === 'Delete') { e.preventDefault(); showCad(); return; }
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault();
      const wins = [...OS.windows.values()].filter(w => w.desktop === OS.currentDesktop);
      if (wins.length === 0) return;
      if (!OS.altTabActive) {
        OS.altTabIndex = 1 % wins.length;
        showAltTab();
      } else {
        OS.altTabIndex = (e.shiftKey ? OS.altTabIndex - 1 + wins.length : OS.altTabIndex + 1) % wins.length;
        showAltTab();
      }
      return;
    }
    if (OS.altTabActive && e.key === 'Escape') { hideAltTab(); return; }
    if (e.metaKey) {
      if (e.key === 'd') { e.preventDefault(); showDesktop(); }
      else if (e.key === 'e') { e.preventDefault(); openApp('explorer'); }
      else if (e.key === 'r') { e.preventDefault(); openApp('terminal'); }
      else if (e.key === 'Tab') { e.preventDefault(); showTaskView(); }
    }
    if (e.key === 'Escape') closeAllPanels();
  });
  document.addEventListener('keyup', e => {
    if (!e.altKey && OS.altTabActive) {
      const wins = [...OS.windows.values()].filter(w => w.desktop === OS.currentDesktop);
      if (wins[OS.altTabIndex]) selectAltTab(wins[OS.altTabIndex].id);
      else hideAltTab();
    }
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('#start-menu') && !e.target.closest('.start-btn') && !e.target.closest('.search-btn')) {
      document.getElementById('start-menu')?.classList.add('hidden');
    }
    if (!e.target.closest('#notification-center') && !e.target.closest('.systray') && !e.target.closest('.taskbar-clock')) {
      document.getElementById('notification-center')?.classList.add('hidden');
    }
    if (!e.target.closest('#widget-panel') && !e.target.closest('.widget-btn')) {
      document.getElementById('widget-panel')?.classList.add('hidden');
    }
    if (!e.target.closest('#search-overlay') && !e.target.closest('.search-btn')) {
      document.getElementById('search-overlay')?.classList.add('hidden');
    }
    hideThumbnail();
  });
}

function closeAllPanels() {
  ['start-menu', 'notification-center', 'widget-panel', 'search-overlay', 'systray-expanded'].forEach(id => {
    document.getElementById(id)?.classList.add('hidden');
  });
  document.getElementById('task-view')?.classList.add('hidden');
}
