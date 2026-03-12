// ========== MAIL ==========
function initMail(body, win) {
  const mails = [
    { from:'Microsoft','subject':'Welcome to Windows 11 Web!',preview:'Thank you for using our web-based simulation...','body':'Thank you for using Windows 11 Web! We hope you enjoy all the features.',date:'Mar 11',unread:true,folder:'inbox'},
    { from:'GitHub','subject':'New activity on your repositories',preview:'Someone starred your project...',body:'You have new activity on GitHub. Check it out.',date:'Mar 10',unread:true,folder:'inbox'},
    { from:'Boss','subject':'Meeting tomorrow at 9am',preview:'Please join the standup...',body:'Hi,\n\nPlease join the standup tomorrow at 9am.\n\nThanks',date:'Mar 9',unread:false,folder:'inbox'},
    { from:'Newsletter','subject':'Your weekly digest',preview:'Top stories this week...',body:'Here are the top stories this week.',date:'Mar 8',unread:false,folder:'inbox'},
  ];
  const state = { folder:'inbox', selected:0, composing:false };
  function render() {
    const filtered = mails.filter(m=>m.folder===state.folder);
    const sel = filtered[state.selected];
    body.innerHTML = `<div class="mail-app">
      <div class="mail-sidebar">
        <button class="mail-compose-btn" onclick="this.closest('.window').__app.compose()"><i class="fas fa-pen"></i> New mail</button>
        ${[['inbox','fa-inbox','Inbox',mails.filter(m=>m.folder==='inbox'&&m.unread).length],['sent','fa-paper-plane','Sent',0],['drafts','fa-file-alt','Drafts',0],['trash','fa-trash','Trash',0]].map(([f,icon,label,badge])=>`
          <div class="mail-folder ${state.folder===f?'active':''}" onclick="this.closest('.window').__app.setFolder('${f}')">
            <i class="fas ${icon}"></i>${label}${badge?`<span class="badge">${badge}</span>`:''}
          </div>`).join('')}
      </div>
      <div class="mail-list">
        ${filtered.map((m,i)=>`<div class="mail-item ${i===state.selected?'active':''} ${m.unread?'unread':''}" onclick="this.closest('.window').__app.select(${i})">
          <div class="mail-item-from">${m.from}</div>
          <div class="mail-item-subject">${m.subject}</div>
          <div class="mail-item-preview">${m.preview}</div>
          <div class="mail-item-date">${m.date}</div>
        </div>`).join('')}
      </div>
      <div class="mail-detail">
        ${state.composing ? `<div style="display:flex;flex-direction:column;gap:8px">
          <h2>New Message</h2>
          <input placeholder="To:" style="padding:8px;border:1px solid var(--border);border-radius:4px;background:var(--input-bg);color:var(--text);font-size:13px;outline:none">
          <input placeholder="Subject:" style="padding:8px;border:1px solid var(--border);border-radius:4px;background:var(--input-bg);color:var(--text);font-size:13px;outline:none">
          <textarea placeholder="Message..." style="flex:1;min-height:200px;padding:8px;border:1px solid var(--border);border-radius:4px;background:var(--input-bg);color:var(--text);font-size:13px;outline:none;resize:none"></textarea>
          <div style="display:flex;gap:8px">
            <button style="padding:8px 20px;background:var(--accent);color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px" onclick="this.closest('.window').__app.sendMail()"><i class="fas fa-paper-plane"></i> Send</button>
            <button style="padding:8px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:13px;color:var(--text)" onclick="this.closest('.window').__app.compose()">Discard</button>
          </div>
        </div>` : sel ? `<h2>${sel.subject}</h2>
          <div class="mail-meta">From: <strong>${sel.from}</strong> | ${sel.date}</div>
          <div class="mail-body" style="white-space:pre-wrap">${sel.body}</div>
          <div style="margin-top:16px;display:flex;gap:8px">
            <button style="padding:8px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:13px;color:var(--text)" onclick="this.closest('.window').__app.compose()"><i class="fas fa-reply"></i> Reply</button>
            <button style="padding:8px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:13px;color:var(--text)"><i class="fas fa-trash"></i> Delete</button>
          </div>` : '<div style="color:var(--text2);text-align:center;padding:40px">Select a message</div>'}
      </div>
    </div>`;
    win.__app = {
      setFolder: (f) => { state.folder = f; state.selected = 0; state.composing = false; render(); },
      select: (i) => { state.selected = i; state.composing = false; const m = filtered[i]; if (m && m.unread) m.unread = false; render(); },
      compose: () => { state.composing = !state.composing; render(); },
      sendMail: () => { state.composing = false; if (typeof showToast === 'function') showToast('Mail', 'Message sent'); render(); }
    };
  }
  render();
}
