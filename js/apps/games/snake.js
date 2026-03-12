// ========== SNAKE ==========
function initSnake(body, win) {
  const CELL=20, COLS=20, ROWS=18;
  const state = { snake:[{x:10,y:9},{x:9,y:9},{x:8,y:9}], food:{x:15,y:9}, dir:{x:1,y:0}, nextDir:{x:1,y:0}, score:0, running:false, gameOver:false };
  let interval;
  body.innerHTML = `<div class="snake-game">
    <div class="snake-score">Score: <span id="snake-score-${win.id}">0</span></div>
    <canvas class="snake-canvas" id="snake-canvas-${win.id}" width="${COLS*CELL}" height="${ROWS*CELL}"></canvas>
    <div class="snake-controls">
      <button onclick="this.closest('.window').__app.start()" id="snake-start-${win.id}">Start</button>
      <button onclick="this.closest('.window').__app.reset()">Reset</button>
    </div>
    <div class="snake-message" id="snake-msg-${win.id}">Press Start to play!</div>
  </div>`;
  const canvas = body.querySelector(`#snake-canvas-${win.id}`);
  const ctx = canvas.getContext('2d');
  function placeFood() { state.food = { x:Math.floor(Math.random()*COLS), y:Math.floor(Math.random()*ROWS) }; }
  function draw() {
    ctx.fillStyle='#1a1a2e'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#ff4757';
    ctx.beginPath(); ctx.arc((state.food.x+.5)*CELL,(state.food.y+.5)*CELL,CELL*.4,0,Math.PI*2); ctx.fill();
    state.snake.forEach((seg,i) => {
      ctx.fillStyle = i===0?'#2ed573':'#7bed9f';
      ctx.beginPath(); ctx.roundRect(seg.x*CELL+1,seg.y*CELL+1,CELL-2,CELL-2,4); ctx.fill();
    });
  }
  function step() {
    state.dir = state.nextDir;
    const head = { x:state.snake[0].x+state.dir.x, y:state.snake[0].y+state.dir.y };
    if (head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||state.snake.some(s=>s.x===head.x&&s.y===head.y)) {
      state.gameOver=true; state.running=false; clearInterval(interval);
      body.querySelector(`#snake-msg-${win.id}`).textContent=`Game Over! Score: ${state.score}`;
      body.querySelector(`#snake-start-${win.id}`).textContent='Restart';
      return;
    }
    state.snake.unshift(head);
    if (head.x===state.food.x&&head.y===state.food.y) { state.score++; body.querySelector(`#snake-score-${win.id}`).textContent=state.score; placeFood(); }
    else state.snake.pop();
    draw();
  }
  function start() {
    if (state.gameOver) reset();
    state.running=!state.running;
    if (state.running) { interval=setInterval(step,150); body.querySelector(`#snake-start-${win.id}`).textContent='Pause'; body.querySelector(`#snake-msg-${win.id}`).textContent='Use arrow keys!'; }
    else { clearInterval(interval); body.querySelector(`#snake-start-${win.id}`).textContent='Resume'; }
  }
  function reset() {
    clearInterval(interval); state.snake=[{x:10,y:9},{x:9,y:9},{x:8,y:9}]; state.dir={x:1,y:0}; state.nextDir={x:1,y:0}; state.score=0; state.running=false; state.gameOver=false;
    body.querySelector(`#snake-score-${win.id}`).textContent='0';
    body.querySelector(`#snake-start-${win.id}`).textContent='Start';
    body.querySelector(`#snake-msg-${win.id}`).textContent='Press Start to play!';
    draw();
  }
  win.addEventListener('keydown', e => {
    if (!state.running) return;
    const dirs = { ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0}, w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0} };
    const d = dirs[e.key]; if (!d) return; e.preventDefault();
    if (d.x !== -state.dir.x || d.y !== -state.dir.y) state.nextDir = d;
  });
  win.addEventListener('remove', () => clearInterval(interval));
  win.__app = { start, reset };
  draw();
}
