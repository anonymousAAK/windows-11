// ===== SETTINGS API =====
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  localStorage.setItem('win11_dark', document.body.classList.contains('dark'));
}

function setBrightness(val) {
  const v = val / 100;
  window._brightness = v;
  document.body.style.filter = `brightness(${v})`;
  localStorage.setItem('win11_brightness', v);
}

function applyAccentColor(color) {
  window._accentColor = color;
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--accent-light', color + '99');
  localStorage.setItem('win11_accent', color);
}

function setAccentColor(color) { applyAccentColor(color); }

function setWallpaperByIndex(i) {
  const desktop = document.getElementById('desktop');
  if (desktop) { desktop.style.background = OS.wallpapers[i % OS.wallpapers.length]; desktop.style.backgroundSize = 'cover'; }
}

function setWallpaper(i) {
  window._currentWallpaper = i;
  localStorage.setItem('win11_wallpaper', i);
  setWallpaperByIndex(i);
}

function changeWallpaper() { openApp('settings'); }
