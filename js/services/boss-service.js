// 老板模式/经营看板模块
// 处理成本率设置、品牌设置、系统设置等功能

(function() {

  window.openBossLogin = function() {
    console.log('openBossLogin called');
    checkDirty(function() {
      console.log('checkDirty callback executing');
      S.bossAuthenticated = false;
      document.getElementById('bossPwdBody').innerHTML = '<div class="boss-pwd-wrap"><div class="lock-icon">🔐</div><p style="font-size:13px;color:var(--text-light);margin-bottom:16px">请输入管理密码</p><input type="password" id="bossPwdInput" placeholder="····" onkeydown="if(event.key===\'Enter\')checkBossPwd()"><div style="margin-top:14px;display:flex;gap:8px;justify-content:center"><button class="btn btn-primary" onclick="checkBossPwd()">确认</button><button class="btn btn-outline" onclick="closeModal(\'bossPwdModal\')">取消</button></div><div class="boss-pwd-hint">初始密码: 888888</div></div>';
      console.log('Opening bossPwdModal');
      openModal('bossPwdModal');
      setTimeout(function() { var inp = document.getElementById('bossPwdInput'); if(inp) inp.focus(); }, 100);
    });
  };

  window.checkBossPwd = function() {
    console.log('checkBossPwd called');
    var pwd = document.getElementById('bossPwdInput').value;
    console.log('Password entered:', pwd ? '***' : 'empty');
    if(pwd === S.bossPassword) {
      console.log('Password correct');
      S.bossAuthenticated = true;
      closeModal('bossPwdModal');
      console.log('Rendering boss view');
      renderBossView();
      showView('boss');
    } else {
      console.log('Password incorrect');
      showToast('密码错误');
    }
  };

  window.renderBossView = function() {
    console.log('renderBossView called');
    var quoteFiles = S.files.filter(function(f) { return f.type === 'quotation'; });
    console.log('Found quote files:', quoteFiles.length);
    var totalRevenue = 0; var totalCost = 0; var rate = S.costRates[S.currentPlan] || 0.65;
    var catCosts = {};
    var allStats = [];
    quoteFiles.forEach(function(f) {
      var d = f.data; var items = (d.quoteItems || []).concat(d.productQuoteItems || []);
      var sub = items.reduce(function(s, i) { return s + (i.quantity || 0) * (i.unitPrice || 0); }, 0);
      var cost = sub * rate; totalRevenue += sub; totalCost += cost;
      allStats.push({ name: f.name, date: f.updatedAt, revenue: sub, cost: cost, profit: sub - cost, margin: sub > 0 ? ((sub - cost) / sub * 100) : 0, rooms: (d.rooms || []).length });
    });
    var totalProfit = totalRevenue - totalCost; var totalMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
    var avgMargin = allStats.length ? allStats.reduce(function(s, a) { return s + a.margin; }, 0) / allStats.length : 0;
    allStats.sort(function(a, b) { return b.revenue - a.revenue; });
    var plans = { luxury: '奢享全案', premium: '优享精造' };
    var el = document.getElementById('bossView');
    el.innerHTML = '<div style="display:flex;gap:8px;margin-bottom:16px;align-items:center;flex-wrap:wrap"><h2 style="font-size:16px;color:var(--text);display:flex;align-items:center;gap:6px">🔐 经营看板</h2><span style="font-size:11px;color:var(--text-dim)">当前方案: ' + (plans[S.currentPlan] || '') + '</span><div style="flex:1"></div><button class="btn btn-outline btn-sm" onclick="showDashboard()">数据看板</button><button class="btn btn-ghost btn-sm" onclick="showView(\'welcome\')">返回</button></div>' +
      '<div class="boss-stat-row"><div class="boss-stat"><div class="label">报价总额</div><div class="value">¥' + fmtK(totalRevenue) + '</div><div class="label" style="font-size:10px;color:var(--text-dim)">共 ' + allStats.length + ' 份报价</div></div><div class="boss-stat"><div class="label">预估成本</div><div class="value cost">¥' + fmtK(totalCost) + '</div><div class="label" style="font-size:10px;color:var(--text-dim)">成本率 ' + (rate * 100) + '%</div></div><div class="boss-stat"><div class="label">预估毛利</div><div class="value profit">¥' + fmtK(totalProfit) + '</div><div class="label" style="font-size:10px;color:var(--text-dim)">综合毛利率 ' + totalMargin.toFixed(1) + '%</div></div></div>' +
      '<div class="boss-config"><h4>⚙️ 成本率设置</h4><div class="boss-config-grid"><div class="boss-config-item"><label>奢享全案成本率</label><input type="number" id="bossRateLuxury" value="' + (S.costRates.luxury * 100) + '" min="0" max="100" step="1" onchange="updateBossRate()">%</div><div class="boss-config-item"><label>优享精造成本率</label><input type="number" id="bossRatePremium" value="' + (S.costRates.premium * 100) + '" min="0" max="100" step="1" onchange="updateBossRate()">%</div><div class="boss-config-item"><label>修改密码</label><input type="password" id="bossNewPwd" placeholder="新密码" style="width:100%"></div><div style="margin-top:8px;display:flex;gap:6px"><button class="btn btn-primary btn-sm" onclick="saveBossConfig()">保存设置</button></div></div></div>' +
      '<div class="boss-config" style="margin-top:14px"><h4>🌐 AI接口设置</h4><div class="ai-settings"><div class="form-group"><label>AI 提供商</label><select id="aiProvider" onchange="onAiProviderChange()"><option value="ollama"' + (S.aiProvider === 'ollama' ? ' selected' : '') + '>Ollama (本地)</option><option value="deepseek"' + (S.aiProvider === 'deepseek' ? ' selected' : '') + '>DeepSeek</option><option value="openai"' + (S.aiProvider === 'openai' ? ' selected' : '') + '>OpenAI 兼容</option><option value="zhipu"' + (S.aiProvider === 'zhipu' ? ' selected' : '') + '>智谱 GLM</option><option value="doubao"' + (S.aiProvider === 'doubao' ? ' selected' : '') + '>豆包 (火山方舟)</option></select></div><div class="form-group"><label>API 地址</label><input id="aiApiUrl" value="' + esc(S.aiApiUrl || 'https://api.deepseek.com') + '"></div><div class="form-group"><label>API Key</label><input id="aiApiKey" type="password" value="' + esc(S.aiApiKey || '') + '" placeholder="sk-..."></div><div class="form-group"><label>模型名称</label><input id="aiModel" value="' + esc(S.ollamaModel || '') + '" placeholder="如 deepseek-chat、qwen2.5、glm-4-flash 等"></div></div><div style="margin-top:8px;display:flex;gap:6px"><button class="btn btn-primary btn-sm" onclick="saveAiApiConfig()">保存接口设置</button><button class="btn btn-outline btn-sm" onclick="testAiConnection()">测试连接</button></div></div>' +
      '<div class="boss-config" style="margin-top:14px"><h4>🤖 AI优化提示词设置</h4><div class="boss-config-grid" style="grid-template-columns:1fr"><div class="boss-config-item" style="grid-column:1/-1"><label>施工明细优化提示词</label><textarea id="bossAiConstructionPrompt" rows="4" style="width:100%;min-height:80px;padding:8px;border:1px solid var(--border-strong);border-radius:6px;background:var(--input-bg);color:var(--text);font-size:12px;resize:vertical;font-family:var(--font-family)">' + esc(S.aiOptimizeConstructionPrompt || (window.getConstructionPrompt ? window.getConstructionPrompt() : '') || '') + '</textarea></div><div class="boss-config-item" style="grid-column:1/-1"><label>产品说明优化提示词</label><textarea id="bossAiProductPrompt" rows="4" style="width:100%;min-height:80px;padding:8px;border:1px solid var(--border-strong);border-radius:6px;background:var(--input-bg);color:var(--text);font-size:12px;resize:vertical;font-family:var(--font-family)">' + esc(S.aiOptimizeProductPrompt || (window.getProductPrompt ? window.getProductPrompt() : '') || '') + '</textarea></div></div><div style="margin-top:8px;display:flex;gap:6px"><button class="btn btn-primary btn-sm" onclick="saveAiPromptConfig()">保存提示词</button><button class="btn btn-outline btn-sm" onclick="resetAiPromptConfig()">恢复默认</button></div></div>' +
      '<div class="boss-config" style="margin-top:14px"><h4>🏷️ 品牌设置</h4><div class="boss-config-grid" style="grid-template-columns:1fr 1fr"><div class="boss-config-item"><label>系统名称</label><input id="brandSystemName" value="' + esc(S.systemName || '斑马丨精装报价系统') + '" placeholder="如: 斑马丨精装报价系统"></div><div class="boss-config-item"><label>LOGO图片</label><div style="display:flex;gap:6px;align-items:center"><input id="brandLogoFile" type="file" accept="image/*" style="font-size:11px;flex:1" onchange="previewBrandLogo(event)"><button class="btn btn-outline btn-sm" onclick="resetBrandLogo()" style="font-size:10px;padding:2px 8px">重置</button></div></div></div><div style="margin-top:6px">' + (S.logo ? '<img src="' + S.logo + '" style="height:32px;border-radius:6px;object-fit:contain">' : '<span style="color:var(--text-dim);font-size:11px">未设置自定义LOGO，将使用默认LOGO</span>') + '</div><div style="margin-top:8px;display:flex;gap:6px"><button class="btn btn-primary btn-sm" onclick="saveBrandingConfig()">保存品牌设置</button></div></div>' +
      '<div class="boss-config" style="margin-top:14px"><h4>📥 导入报价模板</h4><div class="form-group"><label>选择Excel文件</label><input type="file" id="quoteTemplateImport" accept=".xlsx,.xls" style="width:100%" onchange="importQuoteTemplate(this)"><div style="margin-top:8px;font-size:11px;color:var(--text-dim)">支持 .xlsx, .xls 格式。Excel应包含列：项目名称、单价、单位、说明</div></div><div style="margin-top:12px"><h4 style="font-size:12px;margin-bottom:8px">📋 Excel模板示例</h4><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr style="background:var(--bg-secondary)"><th style="padding:6px 4px;border:1px solid var(--border)">项目名称</th><th style="padding:6px 4px;border:1px solid var(--border)">单价</th><th style="padding:6px 4px;border:1px solid var(--border)">单位</th><th style="padding:6px 4px;border:1px solid var(--border)">说明</th><th style="padding:6px 4px;border:1px solid var(--border)">类别</th></tr></thead><tbody><tr><td style="padding:6px 4px;border:1px solid var(--border)">地砖铺贴</td><td style="padding:6px 4px;border:1px solid var(--border)">150</td><td style="padding:6px 4px;border:1px solid var(--border)">㎡</td><td style="padding:6px 4px;border:1px solid var(--border)">含人工、辅料</td><td style="padding:6px 4px;border:1px solid var(--border)">泥瓦工程</td></tr></tbody></table></div></div>' +
      '<div class="dash-card"><div class="dash-card-header"><h3>报价利润明细</h3></div><div class="dash-card-body" style="max-height:350px;overflow-y:auto"><table class="dash-table"><thead><tr><th>文件名</th><th>房间</th><th>报价额</th><th>预估成本</th><th>毛利润</th><th>毛利率</th><th>日期</th></tr></thead><tbody>' + allStats.map(function(a) { var marginColor = a.margin >= 30 ? 'var(--success)' : a.margin >= 20 ? 'var(--warning)' : 'var(--danger)'; return '<tr><td style="font-weight:500">' + esc(a.name) + '</td><td>' + a.rooms + '</td><td style="font-weight:600">¥' + fmt(a.revenue) + '</td><td>¥' + fmt(a.cost) + '</td><td style="color:var(--success);font-weight:600">¥' + fmt(a.profit) + '</td><td style="color:' + marginColor + ';font-weight:700">' + a.margin.toFixed(1) + '%</td><td style="color:var(--text-dim)">' + formatDate(a.date) + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="dash-card"><div class="dash-card-header"><h3>利润分析</h3></div><div class="dash-card-body"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px"><div style="text-align:center"><div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">平均毛利率</div><div style="font-size:22px;font-weight:700;color:' + (avgMargin >= 30 ? 'var(--success)' : 'var(--warning)') + '">' + avgMargin.toFixed(1) + '%</div></div><div style="text-align:center"><div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">最高单笔利润</div><div style="font-size:22px;font-weight:700;color:var(--success)">¥' + fmt(allStats[0] ? allStats[0].profit : 0) + '</div></div><div style="text-align:center"><div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">最低毛利率</div><div style="font-size:22px;font-weight:700;color:var(--danger)">' + (allStats.length ? allStats[allStats.length - 1].margin.toFixed(1) : '0') + '%</div></div></div></div></div>';
  };

  window.updateBossRate = function() {
    S.costRates.luxury = (parseFloat(document.getElementById('bossRateLuxury').value) || 65) / 100;
    S.costRates.premium = (parseFloat(document.getElementById('bossRatePremium').value) || 60) / 100;
    renderBossView();
  };

  window.saveBossConfig = function() {
    updateBossRate();
    var newPwd = document.getElementById('bossNewPwd').value;
    if(newPwd && newPwd.length >= 4) {
      S.bossPassword = newPwd;
      showToast('设置已保存，新密码已生效');
    } else if(newPwd && newPwd.length > 0) {
      showToast('密码至少4位');
    }
    saveSettings();
    renderBossView();
    showToast('设置已保存');
  };

  window.saveAiPromptConfig = function() {
    var cp = document.getElementById('bossAiConstructionPrompt');
    var pp = document.getElementById('bossAiProductPrompt');
    if(cp) S.aiOptimizeConstructionPrompt = cp.value.trim();
    if(pp) S.aiOptimizeProductPrompt = pp.value.trim();
    saveSettings();
    showToast('AI优化提示词已保存');
  };

  window.saveStyleConfig = function() {
    var fs = S.fontSizes;
    fs.table = parseInt(document.getElementById('styleTableFont').value) || 12;
    fs.header = parseInt(document.getElementById('styleHeaderFont').value) || 12;
    fs.project = parseInt(document.getElementById('styleProjectFont').value) || 14;
    fs.description = parseInt(document.getElementById('styleDescFont').value) || 11;
    fs.input = parseInt(document.getElementById('styleInputFont').value) || 11;
    S.rowHeight = parseInt(document.getElementById('styleRowHeight').value) || 36;
    saveSettings();
    applyQuoteTableStyles();
    showToast('样式设置已保存');
  };

  window.previewBrandLogo = function(e) {
    var file = e.target.files[0];
    if(!file) return;
    compressImage(file, 128, 0.8, function(b64) {
      S._pendingLogo = b64;
      var preview = e.target.parentElement.parentElement.parentElement.querySelector('img');
      if(preview) {
        preview.src = b64;
      } else {
        var container = e.target.parentElement.parentElement.parentElement.nextElementSibling;
        if(container) container.innerHTML = '<img src="' + b64 + '" style="height:32px;border-radius:6px;object-fit:contain">';
      }
    });
  };

  window.resetBrandLogo = function() {
    S._pendingLogo = '';
    S.logo = '';
    var fileInput = document.getElementById('brandLogoFile');
    if(fileInput) fileInput.value = '';
    saveBrandingToStorage();
    applyBranding();
    renderBossView();
    showToast('LOGO已重置为默认');
  };

  window.saveBrandingConfig = function() {
    var nameEl = document.getElementById('brandSystemName');
    if(nameEl) S.systemName = nameEl.value.trim() || '斑马丨精装报价系统';
    if(S._pendingLogo !== undefined && S._pendingLogo !== null) {
      S.logo = S._pendingLogo;
      S._pendingLogo = null;
    }
    saveBrandingToStorage();
    applyBranding();
    showToast('品牌设置已保存');
  };

  window.resetAiPromptConfig = function() {
    if(window.resetDefaultPrompts) resetDefaultPrompts();
    saveSettings();
    renderBossView();
    showToast('已恢复默认提示词');
  };

  window.saveAiApiConfig = function() {
    var provider = document.getElementById('aiProvider').value;
    var apiUrl = document.getElementById('aiApiUrl').value.trim();
    var apiKey = document.getElementById('aiApiKey').value.trim();
    var model = document.getElementById('aiModel').value.trim();
    S.aiProvider = provider;
    S.aiApiUrl = apiUrl;
    S.aiApiKey = apiKey;
    S.ollamaModel = model;
    if(provider === 'ollama') S.ollamaUrl = apiUrl;
    saveSettings();
    showToast('AI接口设置已保存');
  };

  window.testAiConnection = function() {
    var provider = document.getElementById('aiProvider').value;
    var apiUrl = document.getElementById('aiApiUrl').value.trim();
    var apiKey = document.getElementById('aiApiKey').value.trim();
    var model = document.getElementById('aiModel').value.trim();
    if(!model) { showToast('请先输入模型名称'); return; }
    showToast('正在测试连接...');
    var endpoint = '';
    var fetchOpts = { method: 'POST', headers: { 'Content-Type': 'application/json' } };
    if(provider === 'ollama') {
      endpoint = apiUrl + '/api/chat';
      fetchOpts.body = JSON.stringify({ model: model, messages: [{ role: 'user', content: '你好' }], stream: false });
    } else {
      var chatPath = provider === 'zhipu' ? '/v4/chat/completions' : provider === 'doubao' ? '/chat/completions' : '/v1/chat/completions';
      endpoint = apiUrl.replace(/\/+$/, '') + chatPath;
      fetchOpts.headers['Authorization'] = 'Bearer ' + apiKey;
      fetchOpts.body = JSON.stringify({ model: model, messages: [{ role: 'user', content: '你好' }], stream: false, temperature: 0.3 });
    }
    fetch(endpoint, fetchOpts).then(function(r) {
      if(r.ok) {
        showToast('✅ 连接成功！模型可用');
      } else {
        return r.text().then(function(t) { throw new Error(r.status + ' ' + t); });
      }
    }).catch(function(e) {
      showToast('❌ 连接失败: ' + e.message);
    });
  };

  window.onAiProviderChange = function() {
    var p = document.getElementById('aiProvider').value;
    var urlInput = document.getElementById('aiApiUrl');
    var modelInput = document.getElementById('aiModel');
    var pre = window.getProviderPreset ? window.getProviderPreset(p) : null;
    if(pre) { urlInput.value = pre.url; modelInput.placeholder = pre.hint; }
  };

  window.importQuoteTemplate = function(input) {
    var file = input.files[0];
    if (!file) return;
    
    if (typeof XLSX === 'undefined') {
      showToast('Excel解析库未加载，请刷新页面');
      input.value = '';
      return;
    }
    
    showToast('正在解析Excel文件...');
    
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: 'array' });
        var sheetName = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[sheetName];
        var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          showToast('Excel文件数据过少');
          input.value = '';
          return;
        }
        
        var headers = jsonData[0];
        var nameIndex = headers.indexOf('项目名称');
        var priceIndex = headers.indexOf('单价');
        var unitIndex = headers.indexOf('单位');
        var descIndex = headers.indexOf('说明');
        var catIndex = headers.indexOf('类别');
        
        if (nameIndex === -1 || priceIndex === -1) {
          showToast('Excel缺少必要列：项目名称、单价');
          input.value = '';
          return;
        }
        
        var categoryMap = {
          '防水工程': '防水工程',
          '泥瓦工程': '泥瓦工程',
          '木作工程': '木作工程',
          '油漆工程': '油漆工程',
          '墙面工程': '墙面工程',
          '地面工程': '地面工程',
          '顶面工程': '顶面工程',
          '门窗工程': '门窗工程',
          '暖气改造': '暖气改造',
          '下水改造': '下水改造',
          '安装工程': '安装工程',
          '楼梯工程': '楼梯工程',
          '拆除工程': '拆除工程',
          '砌筑工程': '砌筑工程',
          '设备产品': '设备产品',
          '定制产品': '定制产品',
          '特殊五金': '特殊五金',
          '特殊工艺': '特殊工艺',
          '背景墙': '背景墙',
          '自定义': '自定义'
        };
        
        var keywordCategoryMap = {
          '防水': '防水工程',
          '地砖': '泥瓦工程',
          '墙砖': '泥瓦工程',
          '铺贴': '泥瓦工程',
          '水泥': '泥瓦工程',
          '找平': '泥瓦工程',
          '木': '木作工程',
          '吊顶': '木作工程',
          '衣柜': '木作工程',
          '橱柜': '木作工程',
          '门': '门窗工程',
          '窗': '门窗工程',
          '漆': '油漆工程',
          '涂料': '墙面工程',
          '壁纸': '墙面工程',
          '暖气': '暖气改造',
          '地暖': '暖气改造',
          '下水': '下水改造',
          '水电': '水电工程',
          '电': '水电工程',
          '安装': '安装工程',
          '楼梯': '楼梯工程',
          '拆除': '拆除工程',
          '砸': '拆除工程',
          '砌': '砌筑工程',
          '设备': '设备产品',
          '定制': '定制产品',
          '五金': '特殊五金',
          '工艺': '特殊工艺',
          '背景': '背景墙'
        };
        
        function autoCategorize(name, categoryFromExcel) {
          if (categoryFromExcel && categoryMap[categoryFromExcel]) {
            return categoryMap[categoryFromExcel];
          }
          
          var lowerName = name.toLowerCase();
          for (var keyword in keywordCategoryMap) {
            if (lowerName.indexOf(keyword.toLowerCase()) !== -1) {
              return keywordCategoryMap[keyword];
            }
          }
          
          return '自定义';
        }
        
        var importedItems = [];
        for (var i = 1; i < jsonData.length; i++) {
          var row = jsonData[i];
          var name = row[nameIndex];
          var price = row[priceIndex];
          var unit = unitIndex !== -1 ? row[unitIndex] : '项';
          var desc = descIndex !== -1 ? row[descIndex] : '';
          var cat = catIndex !== -1 ? row[catIndex] : '';
          
          if (!name || !price) continue;
          
          var category = autoCategorize(name, cat);
          
          importedItems.push({
            id: uid(),
            roomId: '__custom__',
            name: String(name),
            quantity: 1,
            unit: String(unit || '项'),
            unitPrice: parseFloat(price) || 0,
            description: String(desc || ''),
            category: category
          });
        }
        
        if (importedItems.length === 0) {
          showToast('未找到有效的报价项目');
          input.value = '';
          return;
        }
        
        checkDirty(function() {
          if (!S.currentFileId) {
            createNewFile('quotation');
          }
          
          pushUndoState();
          importedItems.forEach(function(item) {
            S.quoteItems.push(item);
          });
          
          markDirty();
          showToast('✅ 成功导入 ' + importedItems.length + ' 个报价项目');
          showView('quotation');
          renderQuoteTable();
          renderSummary();
        });
        
      } catch (error) {
        console.error('Excel导入错误:', error);
        showToast('Excel解析失败: ' + error.message);
      }
      
      input.value = '';
    };
    
    reader.readAsArrayBuffer(file);
  };

  console.log('✅ 老板模式模块已加载');
})();
