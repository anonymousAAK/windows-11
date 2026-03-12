// ===== TOAST NOTIFICATIONS =====
function showToast(title, body, actions) {
  if (OS.dndMode) return;
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-body">${body}</div>
    ${actions ? `<div class="toast-actions">${actions.map(a => `<button onclick="this.closest('.toast').remove()">${a}</button>`).join('')}</div>` : ''}`;
  container.appendChild(toast);
  toast.addEventListener('click', () => toast.remove());
  OS.notifications.push({ title, body, time: new Date().toLocaleTimeString() });
  if (OS.notifications.length > 50) OS.notifications.shift();
  localStorage.setItem('win11_notifications', JSON.stringify(OS.notifications));
  OS.notifBadge++;
  updateNotifBadge();
  setTimeout(() => { toast.classList.add('out'); setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300); }, 4500);
}

function toggleDND(btn) {
  OS.dndMode = !OS.dndMode;
  if (btn) btn.classList.toggle('active', OS.dndMode);
  if (!OS.dndMode) showToast('Focus Assist', 'Do Not Disturb disabled');
}

// ===== NOTIFICATION CENTER =====
function toggleNotifCenter() {
  const nc = document.getElementById('notification-center');
  const open = !nc.classList.contains('hidden');
  closeAllPanels();
  if (!open) {
    nc.classList.remove('hidden');
    renderNotifications();
    OS.notifBadge = 0;
    updateNotifBadge();
  }
}

function renderNotifications() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  if (OS.notifications.length === 0) {
    list.innerHTML = '<div style="padding:12px;font-size:12px;color:var(--text2);text-align:center">No notifications</div>';
    return;
  }
  list.innerHTML = OS.notifications.slice().reverse().map(n => `
    <div class="notif-item">
      <div class="notif-item-title">${n.title}</div>
      <div class="notif-item-body">${n.body}</div>
      <div class="notif-item-time">${n.time}</div>
    </div>`).join('');
}

function clearNotifications() {
  OS.notifications = []; OS.notifBadge = 0;
  updateNotifBadge(); renderNotifications();
  localStorage.removeItem('win11_notifications');
}

function updateNotifBadge() {
  const badge = document.getElementById('systray-badge');
  if (!badge) return;
  if (OS.notifBadge > 0) { badge.textContent = OS.notifBadge; badge.classList.remove('hidden'); }
  else badge.classList.add('hidden');
}
