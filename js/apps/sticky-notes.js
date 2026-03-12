// ========== STICKY NOTES ==========
function initStickyNotes(body, win) {
  const colors = ['yellow','green','pink','blue','purple'];
  const state = { notes: JSON.parse(localStorage.getItem('win11_sticky')||'[{"color":"yellow","text":"Hello! I am a sticky note."}]') };
  function save() { localStorage.setItem('win11_sticky', JSON.stringify(state.notes)); }
  function render() {
    body.innerHTML = `<div class="sticky-notes">
      ${state.notes.map((n,i)=>`<div class="sticky-note ${n.color}">
        <div class="sticky-note-header">
          ${colors.map(c=>`<button onclick="this.closest('.window').__app.setColor(${i},'${c}')" style="width:12px;height:12px;border-radius:50%;background:var(--sn-${c},${c==='yellow'?'#fff9c4':c==='green'?'#c8e6c9':c==='pink'?'#f8bbd0':c==='blue'?'#bbdefb':'#e1bee7'});border:1px solid rgba(0,0,0,.2);cursor:pointer;padding:0"></button>`).join('')}
          <button onclick="this.closest('.window').__app.del(${i})"><i class="fas fa-times"></i></button>
        </div>
        <textarea oninput="this.closest('.window').__app.update(${i},this.value)" style="flex:1;background:transparent;border:none;resize:none;font-size:13px;line-height:1.5;color:#333;outline:none;width:100%">${n.text||''}</textarea>
      </div>`).join('')}
      <div class="sticky-add" onclick="this.closest('.window').__app.add()"><i class="fas fa-plus"></i></div>
    </div>`;
    win.__app = {
      add: () => { state.notes.push({ color: colors[Math.floor(Math.random()*colors.length)], text: '' }); save(); render(); },
      del: (i) => { state.notes.splice(i,1); save(); render(); },
      setColor: (i,c) => { state.notes[i].color = c; save(); render(); },
      update: (i,v) => { state.notes[i].text = v; save(); }
    };
  }
  render();
}
