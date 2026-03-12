// ========== APP DEFINITIONS ==========
const APP_DEFS = {
  explorer: {
    title: 'File Explorer', icon: 'fas fa-folder', color: '#ffb900',
    width: 900, height: 550, pinned: true, pinnedOrder: 0,
    get init() { return initExplorer; }
  },
  notepad: {
    title: 'Notepad', icon: 'fas fa-file-alt', color: '#6b69d6',
    width: 700, height: 500, pinned: true, pinnedOrder: 6,
    get init() { return initNotepad; }
  },
  calculator: {
    title: 'Calculator', icon: 'fas fa-calculator', color: '#1a1a1a',
    width: 340, height: 520, pinned: true, pinnedOrder: 7,
    get init() { return initCalculator; }
  },
  terminal: {
    title: 'Terminal', icon: 'fas fa-terminal', color: '#0c0c0c',
    width: 750, height: 480, pinned: true, pinnedOrder: 2,
    get init() { return initTerminal; }
  },
  edge: {
    title: 'Microsoft Edge', icon: 'fas fa-globe', color: '#0078d4',
    width: 1000, height: 650, pinned: true, pinnedOrder: 1,
    get init() { return initEdge; }
  },
  settings: {
    title: 'Settings', icon: 'fas fa-cog', color: '#0078d4',
    width: 850, height: 560, pinned: true, pinnedOrder: 8,
    get init() { return initSettings; }
  },
  music: {
    title: 'Music Player', icon: 'fas fa-music', color: '#e91e63',
    width: 400, height: 600, pinned: true, pinnedOrder: 3,
    get init() { return initMusicPlayer; }
  },
  video: {
    title: 'Video Player', icon: 'fas fa-video', color: '#ff5722',
    width: 700, height: 480, pinned: false,
    get init() { return initVideoPlayer; }
  },
  calendar: {
    title: 'Calendar', icon: 'fas fa-calendar-alt', color: '#0078d4',
    width: 400, height: 440, pinned: true, pinnedOrder: 4,
    get init() { return initCalendar; }
  },
  mail: {
    title: 'Mail', icon: 'fas fa-envelope', color: '#0078d4',
    width: 900, height: 560, pinned: true, pinnedOrder: 5,
    get init() { return initMail; }
  },
  stickynotes: {
    title: 'Sticky Notes', icon: 'fas fa-sticky-note', color: '#fff9c4',
    width: 600, height: 450, pinned: false,
    get init() { return initStickyNotes; }
  },
  snippingtool: {
    title: 'Snipping Tool', icon: 'fas fa-crop-alt', color: '#607d8b',
    width: 400, height: 350, pinned: false,
    get init() { return initSnippingTool; }
  },
  taskmanager: {
    title: 'Task Manager', icon: 'fas fa-tasks', color: '#2e7d32',
    width: 700, height: 500, pinned: false,
    get init() { return initTaskManager; }
  },
  minesweeper: {
    title: 'Minesweeper', icon: 'fas fa-bomb', color: '#607d8b',
    width: 440, height: 540, pinned: false,
    get init() { return initMinesweeper; }
  },
  snake: {
    title: 'Snake', icon: 'fas fa-gamepad', color: '#4caf50',
    width: 440, height: 540, pinned: false,
    get init() { return initSnake; }
  },
  clock: {
    title: 'Clock', icon: 'fas fa-clock', color: '#0078d4',
    width: 400, height: 500, pinned: false,
    get init() { return initClock; }
  },
  todo: {
    title: 'To-Do', icon: 'fas fa-check-circle', color: '#5b5fc7',
    width: 400, height: 500, pinned: false,
    get init() { return initTodo; }
  },
  whiteboard: {
    title: 'Whiteboard', icon: 'fas fa-paint-brush', color: '#00bcd4',
    width: 800, height: 550, pinned: false,
    get init() { return initWhiteboard; }
  },
  registry: {
    title: 'Registry Editor', icon: 'fas fa-database', color: '#795548',
    width: 750, height: 450, pinned: false,
    get init() { return initRegistry; }
  },
  controlpanel: {
    title: 'Control Panel', icon: 'fas fa-sliders-h', color: '#0078d4',
    width: 700, height: 480, pinned: false,
    get init() { return initControlPanel; }
  },
  diskcleanup: {
    title: 'Disk Cleanup', icon: 'fas fa-broom', color: '#607d8b',
    width: 380, height: 400, pinned: false,
    get init() { return initDiskCleanup; }
  }
};
