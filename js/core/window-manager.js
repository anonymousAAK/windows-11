// ===== WINDOW MANAGEMENT =====
function openApp(appId, opts) {
  const def = APP_DEFS[appId];
  if (!def) return;
  if (!opts || !opts.file) {
    for (const [id, w] of OS.windows) {
      if (w.appId === appId && w.desktop === OS.currentDesktop) {
        if (w.minimized) { w.minimized = false; w.el.classList.remove('minimized'); }
        focusWindow(id);
        return;
      }
    }
  }
  OS.recentApps = OS.recentApps.filter(id => id !== appId);
  OS.recentApps.unshift(appId);
  if (OS.recentApps.length > 8) OS.recentApps.pop();
  const winId = ++OS.windowCounter;
  const w = parseInt(def.width) || 700, h = parseInt(def.height) || 480;
  const x = 40 + (winId % 10) * 30;
  const y = 40 + (winId % 8) * 25;
  const el = document.createElement('div');
  el.className = 'window';
  el.id = `win-${winId}`;
  el.tabIndex = -1;
  el.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;z-index:${++OS.zCounter}`;
  el.innerHTML = `
    <div class="resize-handle rh-n" data-dir="n"></div><div class="resize-handle rh-s" data-dir="s"></div>
    <div class="resize-handle rh-e" data-dir="e"></div><div class="resize-handle rh-w" data-dir="w"></div>
    <div class="resize-handle rh-nw" data-dir="nw"></div><div class="resize-handle rh-ne" data-dir="ne"></div>
    <div class="resize-handle rh-sw" data-dir="sw"></div><div class="resize-handle rh-se" data-dir="se"></div>
    <div class="titlebar" id="titlebar-${winId}">
      <div class="titlebar-icon"><i class="${def.icon}" style="color:${def.color}"></i></div>
      <div class="titlebar-title">${def.title}</div>
      <div class="titlebar-controls">
        <button class="titlebar-btn minimize-btn" onclick="minimizeWindow(${winId})"><i class="fas fa-minus"></i></button>
        <button class="titlebar-btn maximize-btn" onmouseenter="showSnapLayout(${winId},this)" onmouseleave="scheduleHideSnap(${winId})" onclick="toggleMaximize(${winId})"><i class="fas fa-square" style="font-size:9px"></i></button>
        <button class="titlebar-btn close-btn" onclick="closeWindow(${winId})"><i class="fas fa-times"></i></button>
      </div>
    </div>
    <div class="window-body" id="winbody-${winId}"></div>`;
  document.getElementById('windows-container').appendChild(el);
  const winObj = { id: winId, appId, title: def.title, el, minimized: false, maximized: false, desktop: OS.currentDesktop, prevGeom: null };
  OS.windows.set(winId, winObj);
  const body = el.querySelector(`#winbody-${winId}`);
  if (def.init) {
    try { def.init(body, el, opts); }
    catch (e) { console.error('App init error:', appId, e); body.innerHTML = `<div style="padding:20px;color:red">Error loading app: ${e.message}</div>`; }
  }
  setupWindowDrag(el, winId);
  setupWindowResize(el, winId);
  focusWindow(winId);
  updateTaskbarApps();
  return winId;
}

function closeWindow(winId) {
  const w = OS.windows.get(winId);
  if (!w) return;
  w.el.classList.add('closing');
  w.el.dispatchEvent(new Event('remove'));
  setTimeout(() => {
    w.el.remove();
    OS.windows.delete(winId);
    if (OS.activeWindow === winId) {
      const remaining = [...OS.windows.values()].filter(w => !w.minimized && w.desktop === OS.currentDesktop);
      OS.activeWindow = remaining.length ? remaining[remaining.length - 1].id : null;
      if (OS.activeWindow) focusWindow(OS.activeWindow);
    }
    updateTaskbarApps();
  }, 150);
  document.getElementById('start-menu')?.classList.add('hidden');
}

function minimizeWindow(winId) {
  const w = OS.windows.get(winId);
  if (!w) return;
  w.minimized = true;
  w.el.classList.add('minimized');
  if (OS.activeWindow === winId) {
    const remaining = [...OS.windows.values()].filter(w => !w.minimized && w.desktop === OS.currentDesktop);
    OS.activeWindow = remaining.length ? remaining[remaining.length - 1].id : null;
    if (OS.activeWindow) focusWindow(OS.activeWindow);
  }
  updateTaskbarApps();
}

function toggleMaximize(winId) {
  const w = OS.windows.get(winId);
  if (!w) return;
  if (w.maximized) {
    w.maximized = false;
    w.el.classList.remove('maximized');
    if (w.prevGeom) {
      const { left, top, width, height, zIndex } = w.prevGeom;
      w.el.style.cssText = `left:${left}px;top:${top}px;width:${width}px;height:${height}px;z-index:${zIndex || OS.zCounter}`;
    }
  } else {
    w.prevGeom = {
      left: parseInt(w.el.style.left), top: parseInt(w.el.style.top),
      width: parseInt(w.el.style.width), height: parseInt(w.el.style.height),
      zIndex: parseInt(w.el.style.zIndex)
    };
    w.maximized = true;
    w.el.classList.add('maximized');
    w.el.style.left = '0'; w.el.style.top = '0';
    w.el.style.width = '100vw'; w.el.style.height = 'calc(100vh - 48px)';
  }
  focusWindow(winId);
}

function focusWindow(winId) {
  OS.windows.forEach(w => { w.el.classList.remove('focused'); });
  const w = OS.windows.get(winId);
  if (w) {
    w.el.classList.add('focused');
    w.el.style.zIndex = ++OS.zCounter;
    w.el.focus();
    OS.activeWindow = winId;
  }
  updateTaskbarApps();
}

function toggleWindowFromTaskbar(winId) {
  const w = OS.windows.get(winId);
  if (!w) return;
  if (w.minimized) { w.minimized = false; w.el.classList.remove('minimized'); focusWindow(winId); }
  else if (OS.activeWindow === winId) minimizeWindow(winId);
  else focusWindow(winId);
}

function focusWindowOnClick(e) {
  const win = e.target.closest('.window');
  if (win) {
    const id = parseInt(win.id.replace('win-', ''));
    if (id && OS.windows.has(id)) focusWindow(id);
  }
}

// ===== WINDOW DRAG =====
function setupWindowDrag(el, winId) {
  const titlebar = el.querySelector('.titlebar');
  let startX, startY, startLeft, startTop, dragging = false;
  titlebar.addEventListener('mousedown', e => {
    if (e.target.closest('.titlebar-controls')) return;
    if (e.button !== 0) return;
    focusWindow(winId);
    const w = OS.windows.get(winId);
    if (w?.maximized) return;
    startX = e.clientX; startY = e.clientY;
    startLeft = parseInt(el.style.left) || 0; startTop = parseInt(el.style.top) || 0;
    dragging = false;
    const onMove = ev => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (!dragging && Math.sqrt(dx * dx + dy * dy) > 5) dragging = true;
      if (dragging) {
        el.style.left = Math.max(0, startLeft + dx) + 'px';
        el.style.top = Math.max(0, startTop + dy) + 'px';
        checkSnapZone(ev.clientX, ev.clientY);
        if (Math.abs(dx) > 200 && Math.abs(dy) < 30) checkAeroShake(winId);
      }
    };
    const onUp = ev => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (dragging) applySnap(winId, ev.clientX, ev.clientY);
      hideSnapPreview();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
  titlebar.addEventListener('dblclick', e => {
    if (e.target.closest('.titlebar-controls')) return;
    toggleMaximize(winId);
  });
  // Touch drag support
  titlebar.addEventListener('touchstart', e => {
    if (e.target.closest('.titlebar-controls')) return;
    const w = OS.windows.get(winId);
    if (w?.maximized) return;
    const touch = e.touches[0];
    startX = touch.clientX; startY = touch.clientY;
    startLeft = parseInt(el.style.left) || 0; startTop = parseInt(el.style.top) || 0;
    focusWindow(winId);
  }, { passive: true });
  titlebar.addEventListener('touchmove', e => {
    const touch = e.touches[0];
    const dx = touch.clientX - startX, dy = touch.clientY - startY;
    el.style.left = Math.max(0, startLeft + dx) + 'px';
    el.style.top = Math.max(0, startTop + dy) + 'px';
  }, { passive: true });
}

// ===== SNAP =====
function checkSnapZone(x, y) {
  const W = window.innerWidth, H = window.innerHeight - 48;
  const preview = document.getElementById('snap-preview');
  if (!preview) return;
  preview.classList.add('hidden');
  preview.style.cssText = '';
  if (x <= 10) {
    preview.style.cssText = `left:0;top:0;width:50%;height:${H}px`;
    preview.classList.remove('hidden');
  } else if (x >= W - 10) {
    preview.style.cssText = `left:50%;top:0;width:50%;height:${H}px`;
    preview.classList.remove('hidden');
  } else if (y <= 5) {
    preview.style.cssText = `left:0;top:0;width:100%;height:${H}px`;
    preview.classList.remove('hidden');
  }
}

function applySnap(winId, x, y) {
  const W = window.innerWidth, H = window.innerHeight - 48;
  const w = OS.windows.get(winId);
  if (!w) return;
  const z = parseInt(w.el.style.zIndex) || OS.zCounter;
  if (x <= 10) {
    w.el.style.cssText = `left:0;top:0;width:50%;height:${H}px;z-index:${z}`;
    w.el.classList.add('snapping'); setTimeout(() => w.el.classList.remove('snapping'), 200);
  } else if (x >= W - 10) {
    w.el.style.cssText = `left:50%;top:0;width:50%;height:${H}px;z-index:${z}`;
    w.el.classList.add('snapping'); setTimeout(() => w.el.classList.remove('snapping'), 200);
  } else if (y <= 5) {
    if (!w.maximized) toggleMaximize(winId);
  }
  hideSnapPreview();
}

function hideSnapPreview() {
  const p = document.getElementById('snap-preview');
  if (p) { p.style.cssText = ''; p.classList.add('hidden'); }
}

let snapHideTimeout;
function showSnapLayout(winId, btn) {
  clearTimeout(snapHideTimeout);
  let popup = document.getElementById(`snap-popup-${winId}`);
  if (!popup) {
    popup = document.createElement('div');
    popup.id = `snap-popup-${winId}`;
    popup.className = 'snap-layout-popup';
    popup.innerHTML = `
      <div class="snap-layout-option" onclick="snapWindow(${winId},'left')" title="Left half">
        <div style="grid-template-columns:1fr 1fr;display:grid;gap:2px;width:60px;height:40px">
          <div style="background:var(--accent);border-radius:2px"></div><div style="background:var(--border);border-radius:2px"></div>
        </div></div>
      <div class="snap-layout-option" onclick="snapWindow(${winId},'right')" title="Right half">
        <div style="grid-template-columns:1fr 1fr;display:grid;gap:2px;width:60px;height:40px">
          <div style="background:var(--border);border-radius:2px"></div><div style="background:var(--accent);border-radius:2px"></div>
        </div></div>
      <div class="snap-layout-option" onclick="snapWindow(${winId},'full')" title="Full screen">
        <div style="width:60px;height:40px;background:var(--accent);border-radius:2px"></div></div>`;
    popup.addEventListener('mouseenter', () => clearTimeout(snapHideTimeout));
    popup.addEventListener('mouseleave', () => scheduleHideSnap(winId));
    btn.closest('.titlebar').appendChild(popup);
  }
  popup.style.display = 'flex';
}

function scheduleHideSnap(winId) {
  snapHideTimeout = setTimeout(() => {
    const p = document.getElementById(`snap-popup-${winId}`);
    if (p) p.style.display = 'none';
  }, 300);
}

function snapWindow(winId, pos) {
  const H = window.innerHeight - 48;
  const w = OS.windows.get(winId);
  if (!w) return;
  const z = parseInt(w.el.style.zIndex) || OS.zCounter;
  const geoms = {
    left: `left:0;top:0;width:50%;height:${H}px`,
    right: `left:50%;top:0;width:50%;height:${H}px`,
    full: `left:0;top:0;width:100%;height:${H}px`
  };
  if (geoms[pos]) {
    w.el.style.cssText = geoms[pos] + `;z-index:${z}`;
    w.el.classList.remove('maximized');
    w.maximized = (pos === 'full');
  }
  const p = document.getElementById(`snap-popup-${winId}`);
  if (p) p.style.display = 'none';
  focusWindow(winId);
}

// ===== WINDOW RESIZE =====
function setupWindowResize(el, winId) {
  el.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', e => {
      e.preventDefault(); e.stopPropagation();
      const w = OS.windows.get(winId);
      if (w?.maximized) return;
      const dir = handle.dataset.dir;
      const startX = e.clientX, startY = e.clientY;
      const rect = el.getBoundingClientRect();
      const origL = rect.left, origT = rect.top, origW = rect.width, origH = rect.height;
      focusWindow(winId);
      const onMove = ev => {
        const dx = ev.clientX - startX, dy = ev.clientY - startY;
        let l = origL, t = origT, wd = origW, ht = origH;
        if (dir.includes('e')) wd = Math.max(320, origW + dx);
        if (dir.includes('s')) ht = Math.max(200, origH + dy);
        if (dir.includes('w')) { wd = Math.max(320, origW - dx); l = origL + (origW - wd); }
        if (dir.includes('n')) { ht = Math.max(200, origH - dy); t = origT + (origH - ht); }
        el.style.left = l + 'px'; el.style.top = t + 'px';
        el.style.width = wd + 'px'; el.style.height = ht + 'px';
      };
      const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  });
}

// ===== AERO SHAKE =====
function checkAeroShake(activeId) {
  const others = [...OS.windows.values()].filter(w => w.id !== activeId && !w.minimized);
  if (others.length > 0) others.forEach(w => minimizeWindow(w.id));
}
