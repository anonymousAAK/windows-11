// ========== MINESWEEPER ==========
function initMinesweeper(body, win) {
  const LEVELS = { beginner:{cols:9,rows:9,mines:10}, intermediate:{cols:16,rows:16,mines:40}, expert:{cols:30,rows:16,mines:99} };
  const state = { level:'beginner', grid:[], revealed:[], flagged:[], mineCount:10, gameOver:false, won:false, startTime:null, elapsed:0, firstClick:true };
  let timerInterval;
  function init(level) {
    clearInterval(timerInterval);
    const {cols,rows,mines} = LEVELS[level];
    state.level=level; state.mineCount=mines; state.gameOver=false; state.won=false; state.firstClick=true; state.elapsed=0; state.startTime=null;
    state.grid = Array(rows).fill(null).map(()=>Array(cols).fill(0));
    state.revealed = Array(rows).fill(null).map(()=>Array(cols).fill(false));
    state.flagged = Array(rows).fill(null).map(()=>Array(cols).fill(false));
    render();
  }
  function placeMines(skipR, skipC) {
    const {cols,rows,mines} = LEVELS[state.level];
    let placed=0;
    while (placed < mines) {
      const r=Math.floor(Math.random()*rows), c=Math.floor(Math.random()*cols);
      if (state.grid[r][c]===9) continue;
      if (Math.abs(r-skipR)<=1 && Math.abs(c-skipC)<=1) continue;
      state.grid[r][c]=9; placed++;
    }
    for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
      if (state.grid[r][c]===9) continue;
      let count=0;
      for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
        const nr=r+dr, nc=c+dc;
        if (nr>=0&&nr<rows&&nc>=0&&nc<cols&&state.grid[nr][nc]===9) count++;
      }
      state.grid[r][c]=count;
    }
  }
  function reveal(r, c) {
    const {cols,rows} = LEVELS[state.level];
    if (r<0||r>=rows||c<0||c>=cols||state.revealed[r][c]||state.flagged[r][c]) return;
    if (state.firstClick) {
      state.firstClick=false; placeMines(r,c);
      state.startTime=Date.now();
      timerInterval=setInterval(()=>{state.elapsed=Math.floor((Date.now()-state.startTime)/1000);render();},1000);
    }
    state.revealed[r][c]=true;
    if (state.grid[r][c]===9) { state.gameOver=true; clearInterval(timerInterval); for(let i=0;i<rows;i++)for(let j=0;j<cols;j++)if(state.grid[i][j]===9)state.revealed[i][j]=true; render(); return; }
    if (state.grid[r][c]===0) { for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) reveal(r+dr,c+dc); }
    const {rows:R,cols:C,mines:M}=LEVELS[state.level];
    const unrev=state.revealed.flat().filter(v=>!v).length;
    if (unrev===M) { state.won=true; clearInterval(timerInterval); }
    render();
  }
  function flag(r, c) {
    if (state.revealed[r][c]||state.gameOver) return;
    state.flagged[r][c]=!state.flagged[r][c]; render();
  }
  function render() {
    const {cols,rows} = LEVELS[state.level];
    const flagCount = state.flagged.flat().filter(Boolean).length;
    body.innerHTML = `<div class="minesweeper">
      <div class="mine-difficulty">
        ${Object.keys(LEVELS).map(l=>`<button class="${state.level===l?'active':''}" onclick="this.closest('.window').__app.initLevel('${l}')">${l.charAt(0).toUpperCase()+l.slice(1)}</button>`).join('')}
      </div>
      <div class="mine-header">
        <div class="mine-counter">${String(state.mineCount-flagCount).padStart(3,'0')}</div>
        <div class="mine-reset" onclick="this.closest('.window').__app.initLevel('${state.level}')">${state.gameOver?'😵':state.won?'😎':'🙂'}</div>
        <div class="mine-timer">${String(state.elapsed).padStart(3,'0')}</div>
      </div>
      <div class="mine-grid" style="grid-template-columns:repeat(${cols},28px)">
        ${Array(rows).fill(null).map((_,r)=>Array(cols).fill(null).map((_,c)=>{
          const rev=state.revealed[r][c], flg=state.flagged[r][c], val=state.grid[r][c];
          const isMine=val===9;
          return `<div class="mine-cell${rev?' revealed':''}${rev&&isMine?' mine':''}" ${val>0&&rev?`data-n="${val}"`:''} onclick="this.closest('.window').__app.reveal(${r},${c})" oncontextmenu="event.preventDefault();this.closest('.window').__app.flag(${r},${c})">${flg&&!rev?'🚩':rev&&isMine?'💣':rev&&val>0?val:''}</div>`;
        }).join('')).join('')}
      </div>
      ${state.gameOver?'<div style="margin-top:12px;font-size:16px;color:#e81123;font-weight:600">💥 Game Over!</div>':''}
      ${state.won?'<div style="margin-top:12px;font-size:16px;color:#7fba00;font-weight:600">🎉 You Won!</div>':''}
    </div>`;
    win.__app = { reveal, flag, initLevel: (l) => { init(l); } };
  }
  win.addEventListener('remove', () => clearInterval(timerInterval));
  init('beginner');
}
