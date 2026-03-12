// ===== GLOBAL STATE =====
window._bootTime = Date.now();

const OS = {
  windows: new Map(),
  windowCounter: 0,
  zCounter: 100,
  activeWindow: null,
  virtualDesktops: [{ id: 0, name: 'Desktop 1', windows: [] }],
  currentDesktop: 0,
  altTabIndex: 0,
  altTabActive: false,
  clipBoard: null,
  dndMode: false,
  pinnedApps: [],
  recentApps: [],
  iconSize: 'normal',
  taskbarAlign: localStorage.getItem('win11_taskbar_align') || 'center',
  notifications: JSON.parse(localStorage.getItem('win11_notifications') || '[]'),
  notifBadge: 0,
  snapState: null,
  wallpapers: [
    'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)',
    'linear-gradient(135deg,#0f3460,#533483,#e94560)',
    'linear-gradient(135deg,#0d0d0d,#1a1a1a,#2d2d2d)',
    'linear-gradient(135deg,#006994,#00b4d8,#90e0ef)',
    'linear-gradient(135deg,#2d6a4f,#40916c,#74c69d)',
    'linear-gradient(135deg,#7b2d8b,#a855f7,#ec4899)',
    'linear-gradient(135deg,#d62828,#f77f00,#fcbf49)',
    'linear-gradient(135deg,#1e3a5f,#2196f3,#64b5f6)',
  ]
};

window._accentColor = localStorage.getItem('win11_accent') || '#0078d4';
window._currentWallpaper = parseInt(localStorage.getItem('win11_wallpaper') || '0');
window._brightness = parseFloat(localStorage.getItem('win11_brightness') || '1');
