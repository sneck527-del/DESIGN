// 数据持久化模块
function loadState() {
  try {
    var f = localStorage.getItem('dq_files');
    if (f) S.files = JSON.parse(f);
    var r = localStorage.getItem('dq_recent');
    if (r) S.recentFileIds = JSON.parse(r);
    var s = localStorage.getItem('dq_settings');
    if (s) {
      var d = JSON.parse(s);
      // 解密敏感字段（如果加密模块可用）
      if (typeof Encryption !== 'undefined') {
        d = Encryption.decryptSensitiveFields(d);
      }
      Object.keys(d).forEach(function(k) {
        S[k] = d[k];
      });
    }
    var p = localStorage.getItem('dq_products');
    if (p) S.products = JSON.parse(p);
    loadTemplatesFromStorage();
    migrateOldData();
    initDefaults();
  } catch (e) {
    console.error(e);
    initDefaults();
  }
}

function saveSettings() {
  try {
    var settings = {
      currentPlan: S.currentPlan,
      currentTheme: S.currentTheme,
      managementFeeRate: S.managementFeeRate,
      taxRate: S.taxRate,
      garbageFee: S.garbageFee,
      protectionFee: S.protectionFee,
      watermarkEnabled: S.watermarkEnabled,
      watermarkText: S.watermarkText,
      colWidths: S.colWidths,
      materials: S.materials,
      spaceTypes: S.spaceTypes,
      bossPassword: S.bossPassword,
      costRates: S.costRates,
      ollamaUrl: S.ollamaUrl,
      ollamaModel: S.ollamaModel,
      aiProvider: S.aiProvider,
      aiApiKey: S.aiApiKey,
      aiApiUrl: S.aiApiUrl,
      aiOptimizeConstructionPrompt: S.aiOptimizeConstructionPrompt,
      aiOptimizeProductPrompt: S.aiOptimizeProductPrompt
    };
    
    // 加密敏感字段（如果加密模块可用）
    if (typeof Encryption !== 'undefined') {
      settings = Encryption.encryptSensitiveFields(settings);
    }
    
    localStorage.setItem('dq_settings', JSON.stringify(settings));
  } catch (e) {}
}

function saveFilesToStorage() {
  try {
    localStorage.setItem('dq_files', JSON.stringify(S.files));
    localStorage.setItem('dq_recent', JSON.stringify(S.recentFileIds));
  } catch (e) {}
}

function saveProductsToStorage() {
  try {
    localStorage.setItem('dq_products', JSON.stringify(S.products));
  } catch (e) {
    showToast('存储空间不足');
  }
}

function migrateOldData() {
  if (S.files.length > 0) return;
  try {
    var o = localStorage.getItem('decorationQuoteV3');
    if (o) {
      var d = JSON.parse(o);
      if (d.rooms && d.rooms.length > 0) {
        var file = {
          id: uid(),
          name: '旧版报价',
          type: 'quotation',
          data: {
            customerInfo: d.customerInfo || S.customerInfo,
            rooms: d.rooms || [],
            quoteItems: d.quoteItems || [],
            productQuoteItems: []
          },
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        S.files.push(file);
        S.recentFileIds = [file.id];
        saveFilesToStorage();
        localStorage.removeItem('decorationQuoteV3');
      }
    }
  } catch (e) {}
}

function compressImage(file, maxW, quality, cb) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var c = document.createElement('canvas');
      var ratio = Math.min(maxW / img.width, 1);
      c.width = Math.round(img.width * ratio);
      c.height = Math.round(img.height * ratio);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/jpeg', quality));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// 数据备份和恢复功能
function exportAllData() {
  try {
    var backup = {
      version: '1.0',
      timestamp: Date.now(),
      files: JSON.parse(localStorage.getItem('dq_files') || '[]'),
      recentFileIds: JSON.parse(localStorage.getItem('dq_recent') || '[]'),
      settings: JSON.parse(localStorage.getItem('dq_settings') || '{}'),
      products: JSON.parse(localStorage.getItem('dq_products') || '[]')
    };
    var dataStr = JSON.stringify(backup, null, 2);
    var dataBlob = new Blob([dataStr], { type: 'application/json' });
    var url = URL.createObjectURL(dataBlob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '斑马精装报价系统备份-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('备份导出成功');
  } catch (e) {
    console.error('导出备份失败:', e);
    showToast('导出备份失败: ' + e.message);
  }
}

function importAllData(file) {
  if (!file || file.type !== 'application/json') {
    showToast('请选择有效的 JSON 备份文件');
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var backup = JSON.parse(e.target.result);
      if (!backup.version) {
        showToast('无效的备份文件格式');
        return;
      }
      if (!confirm('导入备份将覆盖当前所有数据，确定继续吗？')) return;
      if (backup.files) localStorage.setItem('dq_files', JSON.stringify(backup.files));
      if (backup.recentFileIds) localStorage.setItem('dq_recent', JSON.stringify(backup.recentFileIds));
      if (backup.settings) localStorage.setItem('dq_settings', JSON.stringify(backup.settings));
      if (backup.products) localStorage.setItem('dq_products', JSON.stringify(backup.products));
      showToast('备份导入成功，页面将刷新');
      setTimeout(function() {
        location.reload();
      }, 1500);
    } catch (e) {
      console.error('导入备份失败:', e);
      showToast('导入备份失败: ' + e.message);
    }
  };
  reader.readAsText(file);
}

function createAutoBackup() {
  try {
    var backup = {
      version: '1.0',
      timestamp: Date.now(),
      files: JSON.parse(localStorage.getItem('dq_files') || '[]'),
      recentFileIds: JSON.parse(localStorage.getItem('dq_recent') || '[]'),
      settings: JSON.parse(localStorage.getItem('dq_settings') || '{}'),
      products: JSON.parse(localStorage.getItem('dq_products') || '[]')
    };
    var key = 'dq_auto_backup_' + new Date().toISOString().split('T')[0];
    localStorage.setItem(key, JSON.stringify(backup));
    // 保留最近7天的自动备份
    var keys = Object.keys(localStorage).filter(k => k.startsWith('dq_auto_backup_'));
    if (keys.length > 7) {
      keys.sort().slice(0, keys.length - 7).forEach(k => localStorage.removeItem(k));
    }
  } catch (e) {
    console.error('自动备份失败:', e);
  }
}

// 在保存数据时调用自动备份（可选）
function saveFilesToStorageWithBackup() {
  saveFilesToStorage();
  createAutoBackup();
}

// 模板存储功能
function saveTemplatesToStorage() {
  try {
    localStorage.setItem('dq_templates', JSON.stringify(S.templates));
  } catch (e) {
    console.error('保存模板失败:', e);
  }
}

function loadTemplatesFromStorage() {
  try {
    var t = localStorage.getItem('dq_templates');
    if (t) S.templates = JSON.parse(t);
  } catch (e) {
    console.error('加载模板失败:', e);
  }
}

// 模板管理函数
function saveCurrentAsTemplate(name) {
  if (!name) name = '报价模板-' + new Date().toISOString().split('T')[0];
  var template = {
    id: uid(),
    name: name,
    createdAt: Date.now(),
    data: {
      customerInfo: JSON.parse(JSON.stringify(S.customerInfo)),
      rooms: JSON.parse(JSON.stringify(S.rooms)),
      quoteItems: JSON.parse(JSON.stringify(S.quoteItems)),
      productQuoteItems: JSON.parse(JSON.stringify(S.productQuoteItems)),
      customNotes: S.customNotes,
      managementFeeRate: S.managementFeeRate,
      taxRate: S.taxRate,
      garbageFee: S.garbageFee,
      protectionFee: S.protectionFee
    }
  };
  S.templates.push(template);
  saveTemplatesToStorage();
  showToast('模板保存成功: ' + name);
}

function createFromTemplate(templateId) {
  var template = S.templates.find(function(t) {
    return t.id === templateId;
  });
  if (!template) {
    showToast('模板不存在');
    return;
  }
  S.customerInfo = JSON.parse(JSON.stringify(template.data.customerInfo));
  S.rooms = JSON.parse(JSON.stringify(template.data.rooms));
  S.quoteItems = JSON.parse(JSON.stringify(template.data.quoteItems));
  S.productQuoteItems = JSON.parse(JSON.stringify(template.data.productQuoteItems));
  S.customNotes = template.data.customNotes;
  S.managementFeeRate = template.data.managementFeeRate;
  S.taxRate = template.data.taxRate;
  S.garbageFee = template.data.garbageFee;
  S.protectionFee = template.data.protectionFee;
  renderCustomerInfo();
  renderRoomList();
  renderQuoteTable();
  renderSummary();
  document.getElementById('customNotes').value = S.customNotes;
  showToast('从模板创建成功');
}

function deleteTemplate(templateId) {
  if (!confirm('确定删除此模板？')) return;
  S.templates = S.templates.filter(function(t) {
    return t.id !== templateId;
  });
  saveTemplatesToStorage();
  showToast('模板已删除');
}