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
      if (typeof Encryption !== 'undefined') {
        d = Encryption.decryptSensitiveFields(d);
      }
      Object.keys(d).forEach(function(k) {
        if (k !== 'materials') S[k] = d[k];
      });
    }
    var m = localStorage.getItem('dq_materials');
    if (m) S.materials = JSON.parse(m);
    var p = localStorage.getItem('dq_products');
    if (p) S.products = JSON.parse(p);
    var br = localStorage.getItem('dq_branding');
    if (br) {
      var bd = JSON.parse(br);
      if (bd.logo) S.logo = bd.logo;
      if (bd.systemName) S.systemName = bd.systemName;
    }
    loadTemplatesFromStorage();
    migrateOldData();
    migrateMaterialsToSeparate();
    smartMigrateMaterials();
    smartMigrateSpaceTypes();
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
      fontSizes: S.fontSizes,
      rowHeight: S.rowHeight,
      spaceTypes: S.spaceTypes,
      bossPassword: S.bossPassword,
      licenseKey: S.licenseKey,
      licenseStatus: S.licenseStatus,
      trialStartDate: S.trialStartDate,
      licenseType: S.licenseType,
      costRates: S.costRates,
      ollamaUrl: S.ollamaUrl,
      ollamaModel: S.ollamaModel,
      aiProvider: S.aiProvider,
      aiApiKey: S.aiApiKey,
      aiApiUrl: S.aiApiUrl,
      aiOptimizeConstructionPrompt: S.aiOptimizeConstructionPrompt,
      aiOptimizeProductPrompt: S.aiOptimizeProductPrompt
    };
    
    if (typeof Encryption !== 'undefined') {
      settings = Encryption.encryptSensitiveFields(settings);
    }
    
    localStorage.setItem('dq_settings', JSON.stringify(settings));
  } catch (e) {}
}

function saveMaterialsToStorage() {
  try {
    localStorage.setItem('dq_materials', JSON.stringify(S.materials));
  } catch (e) {
    showToast('材料库存储空间不足');
  }
}

function saveBrandingToStorage() {
  try {
    localStorage.setItem('dq_branding', JSON.stringify({
      logo: S.logo || '',
      systemName: S.systemName || ''
    }));
  } catch (e) {}
}

function applyBranding() {
  var logo = S.logo || (typeof LOGO_BASE64 === 'string' ? LOGO_BASE64 : '');
  var name = S.systemName || '斑马丨精装报价系统';
  var headerLogo = document.getElementById('headerLogo');
  var welcomeLogo = document.getElementById('welcomeLogo');
  if (headerLogo) headerLogo.src = logo;
  if (welcomeLogo) welcomeLogo.src = logo;
  var titleEl = document.querySelector('.app-header h1 span:last-child');
  if (titleEl) {
    var parts = name.split('|');
    if (parts.length === 2) {
      titleEl.innerHTML = parts[0] + '<span style="color:var(--accent)">' + parts[1] + '</span>';
    } else {
      titleEl.textContent = name;
    }
  }
  var welcomeH2 = document.querySelector('.welcome-content h2');
  if (welcomeH2) welcomeH2.textContent = name;
  document.title = name;
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

function migrateMaterialsToSeparate() {
  try {
    var existing = localStorage.getItem('dq_materials');
    if (existing) return;
    var s = localStorage.getItem('dq_settings');
    if (!s) return;
    var d = JSON.parse(s);
    if (typeof Encryption !== 'undefined') {
      d = Encryption.decryptSensitiveFields(d);
    }
    if (d.materials) {
      localStorage.setItem('dq_materials', JSON.stringify(d.materials));
      delete d.materials;
      if (typeof Encryption !== 'undefined') {
        d = Encryption.encryptSensitiveFields(d);
      }
      localStorage.setItem('dq_settings', JSON.stringify(d));
    }
  } catch (e) {}
}

function smartMigrateMaterials() {
  try {
    var storedVersion = localStorage.getItem('dq_materials_version');
    if (storedVersion === MATERIAL_DATA_VERSION) {
      return;
    }

    var storedMaterials = null;
    try {
      var m = localStorage.getItem('dq_materials');
      if (m) {
        storedMaterials = JSON.parse(m);
      }
    } catch (e) {
      storedMaterials = null;
    }

    if (!storedMaterials || !Array.isArray(storedMaterials)) {
      S.materials = JSON.parse(JSON.stringify(DEFAULT_MATERIALS));
      localStorage.setItem('dq_materials', JSON.stringify(S.materials));
      localStorage.setItem('dq_materials_version', MATERIAL_DATA_VERSION);
      return;
    }

    var materialMap = {};
    storedMaterials.forEach(function(mat) {
      if (mat && mat.id) {
        materialMap[mat.id] = mat;
      }
    });

    var newMaterials = [];
    var hasChanges = false;

    DEFAULT_MATERIALS.forEach(function(defaultMat) {
      if (materialMap[defaultMat.id]) {
        var storedMat = materialMap[defaultMat.id];
        var isModified = false;
        
        var fieldsToCheck = ['name', 'brand', 'unit', 'description', 'category', 'calcType', 'spaceTypeFilter'];
        fieldsToCheck.forEach(function(field) {
          if (JSON.stringify(storedMat[field]) !== JSON.stringify(defaultMat[field])) {
            isModified = true;
          }
        });
        
        if (storedMat.prices) {
          ['luxury', 'premium', 'standard'].forEach(function(plan) {
            if (storedMat.prices[plan] !== defaultMat.prices[plan]) {
              isModified = true;
            }
          });
        }

        if (isModified) {
          newMaterials.push(storedMat);
        } else {
          newMaterials.push(JSON.parse(JSON.stringify(defaultMat)));
          hasChanges = true;
        }
        delete materialMap[defaultMat.id];
      } else {
        newMaterials.push(JSON.parse(JSON.stringify(defaultMat)));
        hasChanges = true;
      }
    });

    Object.keys(materialMap).forEach(function(id) {
      newMaterials.push(materialMap[id]);
    });

    S.materials = newMaterials;
    
    if (hasChanges || storedVersion !== MATERIAL_DATA_VERSION) {
      localStorage.setItem('dq_materials', JSON.stringify(S.materials));
      localStorage.setItem('dq_materials_version', MATERIAL_DATA_VERSION);
    }
  } catch (e) {
    console.error('材料数据迁移失败:', e);
    S.materials = JSON.parse(JSON.stringify(DEFAULT_MATERIALS));
  }
}

function smartMigrateSpaceTypes() {
  try {
    var storedVersion = localStorage.getItem('dq_spacetypes_version');
    var currentVersion = MATERIAL_DATA_VERSION;
    
    if (storedVersion === currentVersion) {
      return;
    }

    if (!S.spaceTypes || !Array.isArray(S.spaceTypes)) {
      S.spaceTypes = JSON.parse(JSON.stringify(DEFAULT_SPACE_TYPES));
      localStorage.setItem('dq_spacetypes_version', currentVersion);
      return;
    }

    var spaceTypeMap = {};
    S.spaceTypes.forEach(function(st) {
      if (st && st.id) {
        spaceTypeMap[st.id] = st;
      }
    });

    var newSpaceTypes = [];
    var hasChanges = false;

    DEFAULT_SPACE_TYPES.forEach(function(defaultST) {
      if (spaceTypeMap[defaultST.id]) {
        var storedST = spaceTypeMap[defaultST.id];
        var isModified = (storedST.name !== defaultST.name) || (storedST.icon !== defaultST.icon);
        
        if (isModified) {
          newSpaceTypes.push(storedST);
        } else {
          newSpaceTypes.push(JSON.parse(JSON.stringify(defaultST)));
          hasChanges = true;
        }
        delete spaceTypeMap[defaultST.id];
      } else {
        newSpaceTypes.push(JSON.parse(JSON.stringify(defaultST)));
        hasChanges = true;
      }
    });

    Object.keys(spaceTypeMap).forEach(function(id) {
      newSpaceTypes.push(spaceTypeMap[id]);
    });

    S.spaceTypes = newSpaceTypes;
    
    if (hasChanges || storedVersion !== currentVersion) {
      localStorage.setItem('dq_spacetypes_version', currentVersion);
    }
  } catch (e) {
    console.error('空间类型数据迁移失败:', e);
    S.spaceTypes = JSON.parse(JSON.stringify(DEFAULT_SPACE_TYPES));
  }
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
      var isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
      cb(isPng ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', quality));
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