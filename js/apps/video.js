// ========== VIDEO PLAYER ==========
function initVideoPlayer(body, win) {
  const state = { playing: false, progress: 0, fullscreen: false };
  body.innerHTML = `<div class="video-player">
    <div class="video-display"><i class="fas fa-film"></i></div>
    <div class="video-controls">
      <div class="video-progress" id="vid-prog-${win.id}" onclick="vidSeek(event,${win.id})"><div class="video-progress-fill" id="vid-fill-${win.id}"></div></div>
      <div class="video-btn-row">
        <button onclick="vidToggle(${win.id})"><i class="fas fa-play" id="vid-ico-${win.id}"></i></button>
        <button><i class="fas fa-volume-up"></i></button>
        <input type="range" min="0" max="100" value="80" style="width:80px;accent-color:var(--accent)">
        <span style="color:#fff;font-size:12px;margin-left:auto">0:00 / 0:00</span>
        <button onclick="vidFullscreen(${win.id})"><i class="fas fa-expand"></i></button>
      </div>
    </div>
  </div>`;
  window[`vidState_${win.id}`] = state;
  window[`vidToggle`] = (id) => {};
  window[`vidSeek`] = (e, id) => {};
  window[`vidFullscreen`] = (id) => {};
}
