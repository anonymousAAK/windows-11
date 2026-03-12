// ========== MUSIC PLAYER ==========
function initMusicPlayer(body, win) {
  const tracks = [
    { title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', color: '#e91e63' },
    { title: 'Shape of You', artist: 'Ed Sheeran', duration: '3:53', color: '#9c27b0' },
    { title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', color: '#2196f3' },
    { title: 'Peaches', artist: 'Justin Bieber', duration: '3:18', color: '#ff9800' },
    { title: 'Good 4 U', artist: 'Olivia Rodrigo', duration: '2:58', color: '#f44336' },
  ];
  const state = { current: 0, playing: false, progress: 0, shuffle: false, repeat: false, volume: 80 };
  let interval = null;
  function render() {
    const t = tracks[state.current];
    body.innerHTML = `<div class="music-player">
      <div class="mp-artwork">
        <div class="mp-artwork-img" style="background:linear-gradient(135deg,${t.color},${t.color}88)">
          <i class="fas fa-music"></i>
        </div>
      </div>
      <div class="mp-info"><div class="mp-title">${t.title}</div><div class="mp-artist">${t.artist}</div></div>
      <div class="mp-progress">
        <div class="mp-progress-bar" onclick="this.closest('.window').__app.seek(event)">
          <div class="mp-progress-fill" style="width:${state.progress}%"></div>
        </div>
        <div class="mp-times"><span>${formatTime(state.progress * 200 / 100)}</span><span>${t.duration}</span></div>
      </div>
      <div class="mp-controls">
        <button onclick="this.closest('.window').__app.toggleShuffle()" style="color:${state.shuffle?'var(--accent-light)':'#fff'}"><i class="fas fa-random"></i></button>
        <button onclick="this.closest('.window').__app.prev()"><i class="fas fa-step-backward"></i></button>
        <button class="mp-play" onclick="this.closest('.window').__app.toggle()"><i class="fas fa-${state.playing?'pause':'play'}"></i></button>
        <button onclick="this.closest('.window').__app.next()"><i class="fas fa-step-forward"></i></button>
        <button onclick="this.closest('.window').__app.toggleRepeat()" style="color:${state.repeat?'var(--accent-light)':'#fff'}"><i class="fas fa-redo"></i></button>
      </div>
      <div class="mp-playlist">
        ${tracks.map((tr,i)=>`<div class="mp-playlist-item ${i===state.current?'active':''}" onclick="this.closest('.window').__app.play(${i})">
          <span class="mpi-num">${i===state.current&&state.playing?'♪':i+1}</span>
          <span class="mpi-title">${tr.title} - ${tr.artist}</span>
          <span class="mpi-dur">${tr.duration}</span>
        </div>`).join('')}
      </div>
    </div>`;
    win.__app = { toggle, prev, next, play, seek, toggleShuffle, toggleRepeat };
  }
  function formatTime(s) { const m = Math.floor(s/60); return `${m}:${String(Math.floor(s%60)).padStart(2,'0')}`; }
  function toggle() {
    state.playing = !state.playing;
    if (state.playing) { interval = setInterval(() => { state.progress = Math.min(100, state.progress + 0.5); if (state.progress >= 100) { if (state.repeat) state.progress = 0; else next(); } render(); }, 100); }
    else clearInterval(interval);
    render();
  }
  function play(i) { clearInterval(interval); state.current = i; state.progress = 0; state.playing = true; render(); interval = setInterval(() => { state.progress = Math.min(100, state.progress + 0.5); if (state.progress >= 100) { if (state.repeat) state.progress = 0; else next(); } render(); }, 100); }
  function prev() { play(state.shuffle ? Math.floor(Math.random()*tracks.length) : (state.current - 1 + tracks.length) % tracks.length); }
  function next() { play(state.shuffle ? Math.floor(Math.random()*tracks.length) : (state.current + 1) % tracks.length); }
  function seek(e) { const r = e.currentTarget.getBoundingClientRect(); state.progress = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)); render(); }
  function toggleShuffle() { state.shuffle = !state.shuffle; render(); }
  function toggleRepeat() { state.repeat = !state.repeat; render(); }
  win.addEventListener('remove', () => clearInterval(interval));
  render();
}
