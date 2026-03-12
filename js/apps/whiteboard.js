// ========== WHITEBOARD ==========
function initWhiteboard(body, win) {
  body.innerHTML = `<div class="whiteboard">
    <div class="wb-toolbar">
      <button id="wb-pen-${win.id}" class="active" onclick="wbTool(${win.id},'pen',this)"><i class="fas fa-pen"></i></button>
      <button onclick="wbTool(${win.id},'eraser',this)"><i class="fas fa-eraser"></i></button>
      <button onclick="wbTool(${win.id},'line',this)"><i class="fas fa-minus"></i></button>
      <button onclick="wbTool(${win.id},'rect',this)"><i class="fas fa-square"></i></button>
      <button onclick="wbTool(${win.id},'circle',this)"><i class="fas fa-circle"></i></button>
      <input type="color" value="#000000" id="wb-color-${win.id}" title="Color">
      <input type="range" min="1" max="20" value="3" id="wb-size-${win.id}" title="Size">
      <button onclick="wbClear(${win.id})"><i class="fas fa-trash"></i></button>
      <button onclick="wbUndo(${win.id})"><i class="fas fa-undo"></i></button>
    </div>
    <canvas class="wb-canvas" id="wb-canvas-${win.id}"></canvas>
  </div>`;
  const canvas = body.querySelector(`#wb-canvas-${win.id}`);
  const ctx = canvas.getContext('2d');
  const state = { tool:'pen', drawing:false, startX:0, startY:0, history:[] };
  function resize() { const r = canvas.parentElement.getBoundingClientRect(); canvas.width=r.width; canvas.height=r.height-4; }
  resize();
  ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
  window[`wbTool`] = (id, tool, el) => {
    if (id !== win.id) return; state.tool = tool;
    body.querySelectorAll('.wb-toolbar button').forEach(b=>b.classList.remove('active')); el.classList.add('active');
  };
  window[`wbClear`] = (id) => { if (id!==win.id) return; ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); state.history=[]; };
  window[`wbUndo`] = (id) => { if (id!==win.id) return; if (state.history.length) { const img=state.history.pop(); ctx.putImageData(img,0,0); } };
  canvas.addEventListener('mousedown', e => {
    state.drawing=true; state.startX=e.offsetX; state.startY=e.offsetY;
    state.history.push(ctx.getImageData(0,0,canvas.width,canvas.height));
    ctx.strokeStyle = body.querySelector(`#wb-color-${win.id}`).value;
    ctx.lineWidth = body.querySelector(`#wb-size-${win.id}`).value;
    ctx.lineCap='round';
    if (state.tool==='pen') { ctx.beginPath(); ctx.moveTo(e.offsetX,e.offsetY); }
  });
  canvas.addEventListener('mousemove', e => {
    if (!state.drawing) return;
    const color = body.querySelector(`#wb-color-${win.id}`).value;
    const size = body.querySelector(`#wb-size-${win.id}`).value;
    if (state.tool==='pen') { ctx.lineTo(e.offsetX,e.offsetY); ctx.stroke(); }
    else if (state.tool==='eraser') {
      ctx.save(); ctx.globalCompositeOperation='destination-out'; ctx.fillStyle='rgba(0,0,0,1)';
      ctx.beginPath(); ctx.arc(e.offsetX,e.offsetY,parseInt(size)*2,0,Math.PI*2); ctx.fill(); ctx.restore();
    } else if (['line','rect','circle'].includes(state.tool)) {
      const snapshot = state.history[state.history.length-1];
      if (snapshot) ctx.putImageData(snapshot,0,0);
      ctx.strokeStyle=color; ctx.lineWidth=size; ctx.beginPath();
      if (state.tool==='line') { ctx.moveTo(state.startX,state.startY); ctx.lineTo(e.offsetX,e.offsetY); ctx.stroke(); }
      else if (state.tool==='rect') { ctx.strokeRect(state.startX,state.startY,e.offsetX-state.startX,e.offsetY-state.startY); }
      else { ctx.ellipse(state.startX,state.startY,Math.abs(e.offsetX-state.startX),Math.abs(e.offsetY-state.startY),0,0,Math.PI*2); ctx.stroke(); }
    }
  });
  canvas.addEventListener('mouseup', () => { state.drawing=false; });
}
