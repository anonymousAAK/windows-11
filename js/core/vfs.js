// ========== VIRTUAL FILE SYSTEM ==========
const VFS = {
  data: JSON.parse(localStorage.getItem('win11_vfs') || 'null') || {
    'C:': {
      type: 'folder', children: {
        'Users': { type: 'folder', children: {
          'User': { type: 'folder', children: {
            'Desktop': { type: 'folder', children: {
              'New Folder': { type: 'folder', children: {} }
            }},
            'Documents': { type: 'folder', children: {
              'readme.txt': { type: 'file', content: 'Welcome to Windows 11!\nThis is a text file.', size: 42 },
              'notes.txt': { type: 'file', content: 'My notes go here...', size: 19 },
              'report.docx': { type: 'file', content: '[Word Document]', size: 24500 }
            }},
            'Downloads': { type: 'folder', children: {
              'setup.exe': { type: 'file', content: '', size: 5242880 },
              'photo.jpg': { type: 'file', content: '', size: 2048000 },
              'data.csv': { type: 'file', content: 'Name,Age,City\nAlice,30,NYC\nBob,25,LA', size: 38 }
            }},
            'Pictures': { type: 'folder', children: {
              'vacation.jpg': { type: 'file', content: '', size: 3145728 },
              'screenshot.png': { type: 'file', content: '', size: 1048576 }
            }},
            'Music': { type: 'folder', children: {
              'song1.mp3': { type: 'file', content: '', size: 4194304 },
              'song2.mp3': { type: 'file', content: '', size: 3670016 }
            }},
            'Videos': { type: 'folder', children: {
              'clip.mp4': { type: 'file', content: '', size: 10485760 }
            }}
          }}
        }},
        'Windows': { type: 'folder', children: {
          'System32': { type: 'folder', children: {
            'cmd.exe': { type: 'file', content: '', size: 289792 },
            'notepad.exe': { type: 'file', content: '', size: 201216 },
            'drivers': { type: 'folder', children: {} }
          }},
          'Fonts': { type: 'folder', children: {} }
        }},
        'Program Files': { type: 'folder', children: {
          'Microsoft Edge': { type: 'folder', children: {} },
          'Windows Defender': { type: 'folder', children: {} }
        }}
      }
    }
  },
  save() { localStorage.setItem('win11_vfs', JSON.stringify(this.data)); },
  resolve(path) {
    const parts = path.replace(/\\/g, '/').split('/').filter(Boolean);
    let node = this.data;
    for (const p of parts) {
      if (!node || !node.children && !node[p]) {
        if (node && node[p]) { node = node[p]; continue; }
        return null;
      }
      node = node.children ? node.children[p] : node[p];
    }
    return node;
  },
  resolvePath(path) {
    const parts = path.replace(/\\/g, '/').split('/').filter(Boolean);
    let node = this.data;
    for (let i = 0; i < parts.length - 1; i++) {
      node = node.children ? node.children[parts[i]] : node[parts[i]];
      if (!node) return null;
    }
    return { parent: node, name: parts[parts.length - 1] };
  },
  list(path) {
    const node = this.resolve(path);
    if (!node || !node.children) return [];
    return Object.entries(node.children).map(([name, item]) => ({
      name, type: item.type, size: item.size || 0,
      children: item.children ? Object.keys(item.children).length : 0
    }));
  },
  read(path) {
    const node = this.resolve(path);
    return node && node.type === 'file' ? (node.content || '') : null;
  },
  write(path, content) {
    const r = this.resolvePath(path);
    if (!r) return false;
    const parent = r.parent.children || r.parent;
    if (!parent[r.name]) parent[r.name] = { type: 'file', content: '', size: 0 };
    parent[r.name].content = content;
    parent[r.name].size = content.length;
    this.save();
    return true;
  },
  mkdir(path) {
    const r = this.resolvePath(path);
    if (!r) return false;
    const parent = r.parent.children || r.parent;
    if (parent[r.name]) return false;
    parent[r.name] = { type: 'folder', children: {} };
    this.save();
    return true;
  },
  remove(path) {
    const r = this.resolvePath(path);
    if (!r) return false;
    const parent = r.parent.children || r.parent;
    if (!parent[r.name]) return false;
    delete parent[r.name];
    this.save();
    return true;
  },
  rename(path, newName) {
    const r = this.resolvePath(path);
    if (!r) return false;
    const parent = r.parent.children || r.parent;
    if (!parent[r.name] || parent[newName]) return false;
    parent[newName] = parent[r.name];
    delete parent[r.name];
    this.save();
    return true;
  },
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
};
