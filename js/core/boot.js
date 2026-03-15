// ===== BOOT SEQUENCE =====
document.addEventListener('DOMContentLoaded', () => {
  applyAccentColor(window._accentColor);
  if (localStorage.getItem('win11_dark') === 'true') document.body.classList.add('dark');
  document.body.style.filter = `brightness(${window._brightness})`;
  setWallpaperByIndex(window._currentWallpaper);
  setTimeout(() => {
    document.getElementById('boot-screen').classList.remove('active');
    document.getElementById('lock-screen').classList.add('active');
    updateLockTime();
  }, 2200);
  document.getElementById('lock-screen').addEventListener('click', showLoginScreen);
  document.addEventListener('keydown', e => {
    if (document.getElementById('lock-screen').classList.contains('active')) showLoginScreen();
  });
  document.getElementById('login-btn').addEventListener('click', login);
  document.getElementById('login-password').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  setInterval(updateLockTime, 1000);
  setInterval(updateTaskbarClock, 1000);
  initKeyboardShortcuts();
  document.addEventListener('mousedown', focusWindowOnClick);
});

function updateLockTime() {
  const now = new Date();
  const el = document.getElementById('lock-time');
  const el2 = document.getElementById('lock-date');
  if (el) el.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (el2) el2.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function updateTaskbarClock() {
  const now = new Date();
  const te = document.getElementById('taskbar-time');
  const de = document.getElementById('taskbar-date');
  if (te) te.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (de) de.textContent = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
}

function showLoginScreen() {
  document.getElementById('lock-screen').classList.remove('active');
  document.getElementById('login-screen').classList.add('active');
  setTimeout(() => document.getElementById('login-password').focus(), 100);
}

function login() {
  const loginScreen = document.getElementById('login-screen');
  const desktop = document.getElementById('desktop');
  loginScreen.style.transition = 'opacity 0.4s ease';
  loginScreen.style.opacity = '0';
  setTimeout(() => {
    loginScreen.classList.remove('active');
    loginScreen.style.opacity = '';
    loginScreen.style.transition = '';
    desktop.classList.add('active');
    desktop.style.animation = 'fadeIn 0.5s ease';
    loadDesktop();
    setTimeout(() => {
      showToast('Windows 11', 'Welcome back, User!', ['View notifications']);
      desktop.style.animation = '';
    }, 800);
  }, 350);
}

function loadDesktop() {
  setupTaskbar();
  loadDesktopIcons();
  initVirtualDesktops();
  updateTaskbarClock();
}

// ===== CTRL+ALT+DEL =====
function showCad() { document.getElementById('cad-screen').classList.add('active'); }
function hideCad() { document.getElementById('cad-screen').classList.remove('active'); }

// ===== POWER =====
function shutDown() {
  closeAllPanels(); hideCad();
  const desktop = document.getElementById('desktop');
  const ss = document.getElementById('shutdown-screen');
  const st = document.getElementById('shutdown-text');
  // Fade out desktop first
  desktop.style.transition = 'opacity 0.6s ease';
  desktop.style.opacity = '0';
  setTimeout(() => {
    desktop.classList.remove('active');
    desktop.style.opacity = ''; desktop.style.transition = '';
    // Close all windows
    OS.windows.forEach((w, id) => { w.el.remove(); });
    OS.windows.clear(); OS.activeWindow = null;
    ss.classList.add('active');
    if (st) st.textContent = 'Shutting down...';
    setTimeout(() => {
      document.getElementById('boot-screen').classList.add('active');
      ss.classList.remove('active');
      setTimeout(() => {
        document.getElementById('boot-screen').classList.remove('active');
        document.getElementById('lock-screen').classList.add('active');
      }, 2200);
    }, 1200);
  }, 600);
}

function restartPC() {
  const ss = document.getElementById('shutdown-screen');
  const st = document.getElementById('shutdown-text');
  ss.classList.add('active');
  if (st) st.textContent = 'Restarting...';
  setTimeout(shutDown, 1500);
}

function lockPC() {
  closeAllPanels(); hideCad();
  document.getElementById('desktop').classList.remove('active');
  document.getElementById('lock-screen').classList.add('active');
}

function signOut() { hideCad(); lockPC(); }

// ===== BSOD =====
function triggerBSOD() {
  const bsod = document.getElementById('bsod-screen');
  bsod.classList.add('active');
  const pct = document.getElementById('bsod-percent');
  let p = 0;
  const iv = setInterval(() => {
    p += Math.floor(Math.random() * 5) + 1;
    if (p >= 100) {
      p = 100; clearInterval(iv);
      setTimeout(() => { bsod.classList.remove('active'); restartPC(); }, 2000);
    }
    if (pct) pct.textContent = `${p}% complete`;
  }, 150);
}
