// 文件管理模块
function createNewFile(type) {
  checkDirty(function() {
    var file = {
      id: uid(),
      name: type === 'quotation' ? '新建报价' : '新建量房',
      type: type,
      data: type === 'quotation' ? {
        customerInfo: {
          name: '',
          phone: '',
          address: '',
          designer: '',
          designerPhone: '',
          plan: 'luxury',
          quoteMode: 'full',
          date: new Date().toISOString().split('T')[0],
          area: ''
        },
        rooms: [],
        quoteItems: [],
        productQuoteItems: [],
        customNotes: ''
      } : {
        projectName: '',
        customerInfo: {
          name: '',
          phone: '',
          address: '',
          designer: '',
          designerPhone: '',
          plan: 'luxury',
          quoteMode: 'full',
          date: new Date().toISOString().split('T')[0],
          area: ''
        },
        rooms: []
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    S.files.push(file);
    openFile(file.id);
    saveFilesToStorage();
    showToast('已创建');
  });
}

function openFile(id) {
  checkDirty(function() {
    var file = S.files.find(function(f) {
      return f.id === id;
    });
    if (!file) return;
    S.currentFileId = id;
    addToRecent(id);
    if (file.type === 'quotation') {
      S.customerInfo = Object.assign({
        name: '',
        phone: '',
        address: '',
        designer: '',
        designerPhone: '',
        plan: 'luxury',
        quoteMode: 'full',
        date: new Date().toISOString().split('T')[0],
        area: ''
      }, file.data.customerInfo || {});
      S.rooms = file.data.rooms || [];
      S.rooms.forEach(function(r) {
        if (!r.floor) r.floor = '一楼';
      });
      S.quoteItems = file.data.quoteItems || [];
      S.productQuoteItems = file.data.productQuoteItems || [];
      S.customNotes = file.data.customNotes || '';
      if (S.customerInfo.plan) S.currentPlan = S.customerInfo.plan;
      showView('quotation');
      renderCustomerInfo();
      renderRoomList();
      renderQuoteTable();
      renderSummary();
      document.getElementById('customNotes').value = S.customNotes;
    } else {
      S.msProjectName = file.data.projectName || '';
      S.msCustomerInfo = Object.assign({
        name: '',
        phone: '',
        address: '',
        designer: '',
        designerPhone: '',
        plan: 'luxury',
        quoteMode: 'full',
        date: new Date().toISOString().split('T')[0],
        area: ''
      }, file.data.customerInfo || {});
      S.msRooms = file.data.rooms || [];
      S.msRooms.forEach(function(r) {
        if (!r.floor) r.floor = '一楼';
      });
      showView('measurement');
      renderMeasurementView();
    }
    S.dirty = false;
    renderSidebar();
    saveFilesToStorage();
  });
}

function saveCurrentFile() {
  if (!S.currentFileId) {
    showSaveFileDialog();
    return;
  }
  var file = S.files.find(function(f) {
    return f.id === S.currentFileId;
  });
  if (!file) return;
  file.updatedAt = Date.now();
  if (file.type === 'quotation') {
    if (S.customerInfo.address) file.name = S.customerInfo.address;
    file.data = {
      customerInfo: S.customerInfo,
      rooms: S.rooms,
      quoteItems: S.quoteItems,
      productQuoteItems: S.productQuoteItems,
      customNotes: S.customNotes
    };
  } else {
    if (S.msProjectName) file.name = S.msProjectName;
    file.data = {
      projectName: S.msProjectName,
      customerInfo: S.msCustomerInfo,
      rooms: S.msRooms
    };
  }
  addToRecent(file.id);
  S.dirty = false;
  saveFilesToStorage();
  saveSettings();
  renderSidebar();
  showToast('已保存');
}

function saveAndExit() {
  saveCurrentFile();
  S.currentFileId = null;
  S.dirty = false;
  showView('welcome');
}

function checkDirty(callback) {
  if (S.dirty) {
    var r = confirm('当前文件未保存，是否保存？');
    if (r) {
      saveCurrentFile();
      callback();
    } else if (r === false) {
      S.dirty = false;
      callback();
    }
  } else {
    callback();
  }
}

function showSaveFileDialog() {
  var file = S.files.find(function(f) {
    return f.id === S.currentFileId;
  });
  if (!file) return;
  document.getElementById('saveFileBody').innerHTML = '<div class="form-group"><label>文件名称</label><input id="saveFileNameInput" value="' + esc(file.name) + '"></div>';
  openModal('saveFileModal');
}

function confirmSaveFile() {
  var n = document.getElementById('saveFileNameInput').value.trim();
  if (!n) return;
  var file = S.files.find(function(f) {
    return f.id === S.currentFileId;
  });
  if (!file) return;
  file.name = n;
  file.updatedAt = Date.now();
  if (file.type === 'quotation') {
    file.data = {
      customerInfo: S.customerInfo,
      rooms: S.rooms,
      quoteItems: S.quoteItems,
      productQuoteItems: S.productQuoteItems,
      customNotes: S.customNotes
    };
  } else {
    file.data = {
      projectName: S.msProjectName,
      customerInfo: S.msCustomerInfo,
      rooms: S.msRooms
    };
  }
  closeModal('saveFileModal');
  saveFilesToStorage();
  saveSettings();
  renderSidebar();
  showToast('已保存');
}

function deleteFile(id) {
  if (!confirm('确定删除？')) return;
  S.files = S.files.filter(function(f) {
    return f.id !== id;
  });
  S.recentFileIds = S.recentFileIds.filter(function(r) {
    return r !== id;
  });
  if (S.currentFileId === id) {
    S.currentFileId = null;
    S.dirty = false;
    showView('welcome');
  }
  saveFilesToStorage();
  renderSidebar();
}

function renameFile(id) {
  var file = S.files.find(function(f) {
    return f.id === id;
  });
  if (!file) return;
  var el = document.querySelector('.sf-item-name[data-id="' + id + '"]');
  if (!el) return;
  var input = document.createElement('input');
  input.className = 'file-rename-input';
  input.value = file.name;
  el.replaceWith(input);
  input.focus();
  input.select();
  function finish() {
    var v = input.value.trim();
    if (v && v !== file.name) {
      file.name = v;
      file.updatedAt = Date.now();
      saveFilesToStorage();
    }
    renderSidebar();
  }
  input.onblur = finish;
  input.onkeydown = function(e) {
    if (e.key === 'Enter') finish();
    if (e.key === 'Escape') renderSidebar();
  };
}

function addToRecent(id) {
  S.recentFileIds = S.recentFileIds.filter(function(r) {
    return r !== id;
  });
  S.recentFileIds.unshift(id);
  if (S.recentFileIds.length > 15) S.recentFileIds = S.recentFileIds.slice(0, 15);
}

function getRecentFiles() {
  return S.recentFileIds.map(function(id) {
    return S.files.find(function(f) {
      return f.id === id;
    });
  }).filter(Boolean);
}

function renderSidebar() {
  var el = document.getElementById('sidebarFileList');
  var recent = getRecentFiles();
  if (!recent.length) {
    el.innerHTML = '<div style="padding:12px;text-align:center;font-size:11px;color:var(--text-dim)">暂无文件</div>';
    return;
  }
  el.innerHTML = recent.map(function(f) {
    var isActive = f.id === S.currentFileId;
    var icon = f.type === 'quotation' ? '📋' : '📐';
    return '<div class="sidebar-file-item' + (isActive ? ' active' : '') + '" onclick="openFile(\'' + f.id + '\')">' +
      '<span class="sf-icon">' + icon + '</span>' +
      '<div class="sf-info">' +
      '<span class="sf-name sf-item-name" data-id="' + f.id + '" ondblclick="event.stopPropagation();renameFile(\'' + f.id + '\')">' + esc(f.name) + '</span>' +
      '<span class="sf-date">' + formatDate(f.updatedAt) + '</span>' +
      '</div>' +
      '<button class="sf-delete" onclick="event.stopPropagation();deleteFile(\'' + f.id + '\')">×</button>' +
      '</div>';
  }).join('');
}

function showView(view) {
  document.querySelectorAll('.view').forEach(function(v) {
    v.classList.remove('active');
  });
  var m = document.getElementById('appMain');
  if (view === 'welcome') {
    document.getElementById('welcomeView').classList.add('active');
    m.classList.add('narrow-main');
  } else if (view === 'measurement') {
    document.getElementById('measurementView').classList.add('active');
    m.classList.add('narrow-main');
  } else if (view === 'quotation') {
    document.getElementById('quotationView').classList.add('active');
    m.classList.remove('narrow-main');
  } else if (view === 'dashboard') {
    document.getElementById('dashboardView').classList.add('active');
    m.classList.remove('narrow-main');
  } else if (view === 'boss') {
    document.getElementById('bossView').classList.add('active');
    m.classList.remove('narrow-main');
  }
}

function onNotesChange() {
  pushUndoState();
  S.customNotes = document.getElementById('customNotes').value;
  markDirty();
}