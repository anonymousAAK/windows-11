// ========== TO-DO ==========
function initTodo(body, win) {
  const state = { todos: JSON.parse(localStorage.getItem('win11_todos')||'[{"text":"Buy groceries","done":false},{"text":"Read a book","done":true}]') };
  function save() { localStorage.setItem('win11_todos', JSON.stringify(state.todos)); }
  function render() {
    body.innerHTML = `<div class="todo-app">
      <div class="todo-add">
        <input placeholder="Add a task..." id="todo-input-${win.id}" onkeydown="if(event.key==='Enter')this.closest('.window').__app.add()">
        <button onclick="this.closest('.window').__app.add()"><i class="fas fa-plus"></i> Add</button>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <span style="font-size:12px;color:var(--text2)">${state.todos.filter(t=>!t.done).length} remaining • ${state.todos.filter(t=>t.done).length} done</span>
        <button style="font-size:11px;background:none;border:none;color:var(--accent);cursor:pointer;margin-left:auto" onclick="this.closest('.window').__app.clearDone()">Clear done</button>
      </div>
      <div class="todo-list">
        ${state.todos.map((t,i)=>`<div class="todo-item ${t.done?'done':''}">
          <input type="checkbox" ${t.done?'checked':''} onchange="this.closest('.window').__app.toggle(${i})">
          <span class="todo-text" contenteditable="true" onblur="this.closest('.window').__app.edit(${i},this.textContent)">${t.text}</span>
          <button class="todo-del" onclick="this.closest('.window').__app.del(${i})"><i class="fas fa-times"></i></button>
        </div>`).join('')}
      </div>
    </div>`;
    win.__app = {
      add: () => { const input = body.querySelector(`#todo-input-${win.id}`); if (!input?.value.trim()) return; state.todos.unshift({text:input.value.trim(),done:false}); save(); render(); },
      toggle: (i) => { state.todos[i].done = !state.todos[i].done; save(); render(); },
      del: (i) => { state.todos.splice(i,1); save(); render(); },
      edit: (i,v) => { state.todos[i].text = v.trim(); save(); },
      clearDone: () => { state.todos = state.todos.filter(t=>!t.done); save(); render(); }
    };
  }
  render();
}
