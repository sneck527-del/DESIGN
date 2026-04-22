// 产品数据库模块
// 处理产品数据库管理、产品导入等功能

(function() {

  window.openProductDatabase = function() {
    S.pdbSelectedMainCat = null;
    S.pdbSelectedSubCat = null;
    S.editingProductId = null;
    S.pdbSelectedProductIds = [];
    renderProductDb();
    openModal('productDbModal');
  };

  window.renderProductDb = function() {
    var body = document.getElementById('productDbBody');
    var tree = '<div class="pdb-cat-tree"><div class="pdb-cat-item' + (S.pdbSelectedMainCat === null ? ' active' : '') + '" onclick="pdbSelectCategory(null,null)">全部 (' + S.products.length + ')</div>';
    PRODUCT_MAIN_CATEGORIES.forEach(function(mc) {
      var count = S.products.filter(function(p) { return p.mainCategory === mc.id; }).length;
      tree += '<div class="pdb-cat-main">' + mc.icon + ' ' + mc.name + ' (' + count + ')</div><div class="pdb-sub-list">' + mc.subcategories.map(function(sc) {
        var sc2 = S.products.filter(function(p) { return p.mainCategory === mc.id && p.subCategory === sc.id; }).length;
        return '<div class="pdb-sub-item' + (S.pdbSelectedMainCat === mc.id && S.pdbSelectedSubCat === sc.id ? ' active' : '') + '" onclick="pdbSelectCategory(\'' + mc.id + '\',\'' + sc.id + '\')">' + sc.name + ' (' + sc2 + ')</div>';
      }).join('') + '</div>';
    });
    tree += '</div>';
    var content = '<div style="display:flex;flex-direction:column;gap:10px"><div class="pdb-toolbar"><input id="pdbSearch" placeholder="搜索产品..." oninput="renderProductGrid()" style="width:180px"><select id="pdbMainFilter" onchange="pdbMainFilterChange()"><option value="">全部分类</option>' + PRODUCT_MAIN_CATEGORIES.map(function(mc) { return '<option value="' + mc.id + '"' + (S.pdbSelectedMainCat === mc.id ? ' selected' : '') + '>' + mc.icon + ' ' + mc.name + '</option>'; }).join('') + '</select><select id="pdbSubFilter" onchange="pdbSubFilterChange()"><option value="">全部子类</option>' + (S.pdbSelectedMainCat ? PRODUCT_MAIN_CATEGORIES.find(function(c) { return c.id === S.pdbSelectedMainCat; }).subcategories.map(function(sc) { return '<option value="' + sc.id + '"' + (S.pdbSelectedSubCat === sc.id ? ' selected' : '') + '>' + sc.name + '</option>'; }).join('') : '') + '</select><button class="btn btn-primary btn-sm" onclick="showProductForm()">+ 添加产品</button><button class="btn btn-info btn-sm" onclick="openAiProductSearch()" title="使用AI搜索京东产品">🤖 AI搜索</button><div class="export-dropdown"><button class="btn btn-danger btn-sm" onclick="toggleDeleteMenu(event)">🗑️ 删除产品 ▾</button><div class="export-menu" id="deleteMenu"><button class="export-menu-item" onclick="clearAllProducts()">⚠️ 清空所有产品</button><hr style="margin:4px 0;border:none;border-top:1px solid #ddd"><button class="export-menu-item" onclick="deleteProductsByBrand(\'萨米特\')">删除萨米特瓷砖</button><button class="export-menu-item" onclick="deleteProductsByBrand(\'浪鲸\')">删除浪鲸卫浴</button><button class="export-menu-item" onclick="deleteProductsByBrand(\'凯恩佳美\')">删除凯恩佳美定制</button><button class="export-menu-item" onclick="deleteProductsByBrand(\'七特丽\')">删除七特丽壁布</button><button class="export-menu-item" onclick="deleteProductsByBrand(\'施耐德\')">删除开关插座</button><button class="export-menu-item" onclick="deleteProductsByBrand(\'潜水艇\')">删除潜水艇地漏</button><button class="export-menu-item" onclick="deleteProductsByBrand(\'通用\')">删除橱柜台面</button><button class="export-menu-item" onclick="deleteProductsByBrand(\'易来\')">删除易来智能</button><button class="export-menu-item" onclick="deleteProductsByMainCategory(\'equipment\')">删除设备产品</button><button class="export-menu-item" onclick="deleteProductsByMainCategory(\'soft_furnishing\')">删除软装产品</button><button class="export-menu-item" onclick="deleteProductsByMainCategory(\'ecommerce\')">删除京东产品数据</button></div></div></div><div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #333"><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="pdbSelectAll" onchange="toggleSelectAllProducts()" style="cursor:pointer"> <span>全选</span></label><button class="btn btn-danger btn-sm" onclick="deleteSelectedProducts()" id="pdbDeleteSelectedBtn" disabled style="font-size:11px;padding:3px 8px">🗑️ 删除已选 (<span id="pdbSelectedCount">0</span>)</button><span style="margin-left:auto;color:#888;font-size:12px">点击产品卡片复选框选择</span></div><div id="pdbGridArea" style="flex:1;overflow:auto"></div></div>';
    body.innerHTML = '<div class="pdb-layout">' + tree + content + '</div>';
    renderProductGrid();
  };
  
  window.toggleDeleteMenu = function(e) {
    e.stopPropagation();
    var m = document.getElementById('deleteMenu');
    var i = document.getElementById('importMenu');
    if(i) i.style.display = 'none';
    if(m) m.style.display = (m.style.display === 'block' ? 'none' : 'block');
  };
  
  window.clearAllProducts = function() {
    if(!confirm('确定要清空所有产品吗？此操作不可恢复！')) return;
    var count = S.products.length;
    S.products = [];
    S.productQuoteItems = S.productQuoteItems.filter(function(q) { return !q.productId; });
    saveProductsToStorage();
    renderProductDb();
    renderQuoteTable();
    renderSummary();
    markDirty();
    showToast('已清空 ' + count + ' 个产品');
  };
  
  window.deleteProductsByBrand = function(brand) {
    if(!confirm('确定要删除品牌为"' + brand + '"的所有产品吗？')) return;
    var beforeCount = S.products.length;
    var deletedIds = S.products.filter(function(p) { return (p.brand || '').includes(brand); }).map(function(p) { return p.id; });
    S.products = S.products.filter(function(p) { return !(p.brand || '').includes(brand); });
    S.productQuoteItems = S.productQuoteItems.filter(function(q) { return !deletedIds.includes(q.productId); });
    var deletedCount = beforeCount - S.products.length;
    saveProductsToStorage();
    renderProductDb();
    renderQuoteTable();
    renderSummary();
    markDirty();
    showToast('已删除 ' + deletedCount + ' 个"' + brand + '"产品');
  };
  
  window.deleteProductsByMainCategory = function(mainCat) {
    var mc = PRODUCT_MAIN_CATEGORIES.find(function(c) { return c.id === mainCat; });
    var catName = mc ? mc.name : mainCat;
    if(!confirm('确定要删除' + catName + '类的所有产品吗？')) return;
    var beforeCount = S.products.length;
    var deletedIds = S.products.filter(function(p) { return p.mainCategory === mainCat; }).map(function(p) { return p.id; });
    S.products = S.products.filter(function(p) { return p.mainCategory !== mainCat; });
    S.productQuoteItems = S.productQuoteItems.filter(function(q) { return !deletedIds.includes(q.productId); });
    var deletedCount = beforeCount - S.products.length;
    saveProductsToStorage();
    renderProductDb();
    renderQuoteTable();
    renderSummary();
    markDirty();
    showToast('已删除 ' + deletedCount + ' 个' + catName + '产品');
  };

  window.pdbSelectCategory = function(mc, sc) { S.pdbSelectedMainCat = mc; S.pdbSelectedSubCat = sc; renderProductDb(); };
  window.pdbMainFilterChange = function() { S.pdbSelectedMainCat = document.getElementById('pdbMainFilter').value || null; S.pdbSelectedSubCat = null; renderProductDb(); };
  window.pdbSubFilterChange = function() { S.pdbSelectedSubCat = document.getElementById('pdbSubFilter').value || null; renderProductGrid(); };

  window.getFilteredProducts = function() {
    var p = S.products;
    var s = ((document.getElementById('pdbSearch') || {}).value || '').toLowerCase();
    if(S.pdbSelectedMainCat) p = p.filter(function(x) { return x.mainCategory === S.pdbSelectedMainCat; });
    if(S.pdbSelectedSubCat) p = p.filter(function(x) { return x.subCategory === S.pdbSelectedSubCat; });
    if(s) p = p.filter(function(x) { return (x.name || '').toLowerCase().includes(s) || (x.brand || '').toLowerCase().includes(s) || (x.model || '').toLowerCase().includes(s); });
    return p;
  };

  window.getSubCatLabel = function(mcId, scId) {
    var mc = PRODUCT_MAIN_CATEGORIES.find(function(c) { return c.id === mcId; });
    if(!mc) return scId;
    var s = mc.subcategories.find(function(c) { return c.id === scId; });
    return s ? s.name : scId;
  };

  window.renderProductGrid = function() {
    var prods = getFilteredProducts();
    var el = document.getElementById('pdbGridArea');
    if(!prods.length) { el.innerHTML = '<div class="empty-state"><div class="icon">📦</div><p>暂无产品</p></div>'; return; }
    el.innerHTML = '<div class="pdb-grid">' + prods.map(function(p) {
      var isSelected = S.pdbSelectedProductIds && S.pdbSelectedProductIds.includes(p.id);
      return '<div class="pdb-card" style="position:relative;border:' + (isSelected ? '2px solid #ff4444' : '1px solid #333') + '"><div style="position:absolute;top:8px;left:8px;z-index:10"><input type="checkbox" onclick="event.stopPropagation();toggleProductSelection(\'' + p.id + '\')" ' + (isSelected ? 'checked' : '') + ' style="width:18px;height:18px;cursor:pointer"></div><div class="pdb-card-img" onclick="showProductForm(\'' + p.id + '\')">' + (p.photo ? '<img src="' + p.photo + '">' : '<div class="pdb-no-img">📦</div>') + '</div><div class="pdb-card-body" onclick="showProductForm(\'' + p.id + '\')"><div class="pdb-card-name">' + esc(p.name) + '</div><div class="pdb-card-brand">' + esc(p.brand) + (p.model ? ' · ' + esc(p.model) : '') + '</div><div class="pdb-card-specs">' + esc(p.specifications || '') + '</div><div class="pdb-card-price">¥' + fmt(p.unitPrice) + ' <span>/' + esc(p.unit) + '</span></div><div style="margin-top:4px"><button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteProduct(\'' + p.id + '\')" style="font-size:10px;padding:2px 6px">删除</button></div></div></div>';
    }).join('') + '</div>';
    updateSelectionUI();
  };
  
  window.toggleProductSelection = function(productId) {
    if(!S.pdbSelectedProductIds) S.pdbSelectedProductIds = [];
    var idx = S.pdbSelectedProductIds.indexOf(productId);
    if(idx >= 0) {
      S.pdbSelectedProductIds.splice(idx, 1);
    } else {
      S.pdbSelectedProductIds.push(productId);
    }
    renderProductGrid();
  };
  
  window.toggleSelectAllProducts = function() {
    var prods = getFilteredProducts();
    var checkbox = document.getElementById('pdbSelectAll');
    if(!S.pdbSelectedProductIds) S.pdbSelectedProductIds = [];
    if(checkbox && checkbox.checked) {
      S.pdbSelectedProductIds = prods.map(function(p) { return p.id; });
    } else {
      S.pdbSelectedProductIds = [];
    }
    renderProductGrid();
  };
  
  function updateSelectionUI() {
    var count = (S.pdbSelectedProductIds || []).length;
    var countEl = document.getElementById('pdbSelectedCount');
    var btnEl = document.getElementById('pdbDeleteSelectedBtn');
    var checkbox = document.getElementById('pdbSelectAll');
    var prods = getFilteredProducts();
    if(countEl) countEl.textContent = count;
    if(btnEl) btnEl.disabled = count === 0;
    if(checkbox) checkbox.checked = prods.length > 0 && count === prods.length;
  }
  
  window.deleteSelectedProducts = function() {
    var count = (S.pdbSelectedProductIds || []).length;
    if(!count) {
      showToast('请先选择要删除的产品');
      return;
    }
    if(!confirm('确定要删除已选的 ' + count + ' 个产品吗？')) return;
    var deletedIds = S.pdbSelectedProductIds || [];
    S.products = S.products.filter(function(p) { return !deletedIds.includes(p.id); });
    S.productQuoteItems = S.productQuoteItems.filter(function(q) { return !deletedIds.includes(q.productId); });
    S.pdbSelectedProductIds = [];
    saveProductsToStorage();
    renderProductDb();
    renderQuoteTable();
    renderSummary();
    markDirty();
    showToast('已删除 ' + count + ' 个产品');
  };

  window.openAiProductSearch = function() {
    var catOpts = PRODUCT_MAIN_CATEGORIES.map(function(mc) {
      return '<option value="' + mc.id + '">' + mc.icon + ' ' + mc.name + '</option>';
    }).join('');
    var body = document.getElementById('aiProductSearchBody');
    body.innerHTML = '<div style="margin-bottom:14px"><p style="font-size:12px;color:var(--text-dim);margin-bottom:10px">输入品类和品牌，AI将自动在京东搜索相关产品信息并返回结果。</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">' +
      '<div class="form-group" style="margin:0;flex:1;min-width:120px"><label style="font-size:11px">品类</label><select id="aiPsCategory" style="width:100%"><option value="">请选择品类</option>' + catOpts + '</select></div>' +
      '<div class="form-group" style="margin:0;flex:1;min-width:120px"><label style="font-size:11px">品牌</label><input id="aiPsBrand" placeholder="如：东鹏、TOTO" style="width:100%"></div>' +
      '<div class="form-group" style="margin:0;flex:1;min-width:120px"><label style="font-size:11px">补充描述(可选)</label><input id="aiPsExtra" placeholder="如：智能马桶、800×800" style="width:100%"></div>' +
      '<button class="btn btn-primary btn-sm" onclick="doAiProductSearch()" id="aiPsSearchBtn" style="height:32px;margin-top:16px">🔍 搜索</button>' +
      '</div></div>' +
      '<div id="aiPsResults"></div>';
    openModal('aiProductSearchModal');
  };

  window.doAiProductSearch = function() {
    var mcId = document.getElementById('aiPsCategory').value;
    var brand = document.getElementById('aiPsBrand').value.trim();
    var extra = document.getElementById('aiPsExtra').value.trim();
    if (!mcId && !brand) { showToast('请至少选择品类或输入品牌'); return; }
    if (!S.ollamaModel) { showToast('请先在系统设置中配置AI模型'); return; }

    var mcName = '全部';
    var subCatInfo = '';
    if (mcId) {
      var mc = PRODUCT_MAIN_CATEGORIES.find(function(c) { return c.id === mcId; });
      mcName = mc ? mc.name : mcId;
      if (mc) {
        subCatInfo = mc.subcategories.map(function(sc) { return sc.name; }).join('、');
      }
    }

    var prompt = '你是一个专业的家装建材产品数据库助手。请根据以下条件搜索京东(JD.com)上的真实产品信息：\n\n' +
      '搜索条件：\n' +
      '- 品类：' + mcName + '\n' +
      (brand ? '- 品牌：' + brand + '\n' : '') +
      (extra ? '- 补充描述：' + extra + '\n' : '') +
      '\n该品类下的子分类包括：' + (subCatInfo || '未知') + '\n\n' +
      '请返回5-10个该品牌/品类在京东上最畅销的真实产品，严格按照以下JSON数组格式返回，不要添加任何其他文字说明：\n' +
      '[\n' +
      '  {\n' +
      '    "name": "产品全称",\n' +
      '    "brand": "品牌名",\n' +
      '    "model": "型号",\n' +
      '    "specifications": "规格参数",\n' +
      '    "material": "材质",\n' +
      '    "color": "颜色",\n' +
      '    "unit": "单位(㎡/个/套/桶/卷/盏/张/条/支/袋)",\n' +
      '    "unitPrice": 0,\n' +
      '    "origin": "产地",\n' +
      '    "warranty": "质保",\n' +
      '    "installationMethod": "安装方式",\n' +
      '    "description": "品牌:xxx | 型号:xxx | 规格:xxx | 材质:xxx | 环保:xxx | 安装:xxx | 来源:京东",\n' +
      '    "notes": "补充说明",\n' +
      '    "mainCategory": "' + (mcId || 'main_material') + '",\n' +
      '    "subCategory": "子分类ID"\n' +
      '  }\n' +
      ']\n\n' +
      '重要要求：\n' +
      '1. 价格必须是京东上的真实参考价格(整数)\n' +
      '2. mainCategory必须填: ' + (mcId || 'main_material') + '\n' +
      '3. subCategory必须从以下ID中选择: ' + (mcId && PRODUCT_MAIN_CATEGORIES.find(function(c) { return c.id === mcId; }) ? PRODUCT_MAIN_CATEGORIES.find(function(c) { return c.id === mcId; }).subcategories.map(function(sc) { return sc.id; }).join(', ') : '根据品类选择') + '\n' +
      '4. 只返回JSON，不要有其他文字';

    var btn = document.getElementById('aiPsSearchBtn');
    var origHtml = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> 搜索中...';
    btn.disabled = true;
    document.getElementById('aiPsResults').innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-dim)"><span class="spinner" style="display:inline-block;width:20px;height:20px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle"></span> AI正在搜索京东产品，请稍候...</div>';

    var provider = S.aiProvider;
    var apiUrl = S.aiApiUrl;
    var apiKey = S.aiApiKey;
    var model = S.ollamaModel;
    var fullText = '';

    (async function() {
      try {
        var fetchOpts = { method: 'POST', headers: {} };
        var endpoint = '';
        if (provider === 'ollama') {
          endpoint = apiUrl + '/api/chat';
          fetchOpts.headers['Content-Type'] = 'application/json';
          fetchOpts.body = JSON.stringify({ model: model, messages: [{ role: 'user', content: prompt }], stream: false, options: { temperature: 0.3 } });
        } else {
          var chatPath = provider === 'zhipu' ? '/v4/chat/completions' : (provider === 'doubao' || provider === 'volc_coding') ? '/chat/completions' : '/v1/chat/completions';
          endpoint = apiUrl.replace(/\/+$/, '') + chatPath;
          fetchOpts.headers['Content-Type'] = 'application/json';
          fetchOpts.headers['Authorization'] = 'Bearer ' + apiKey;
          fetchOpts.body = JSON.stringify({ model: model, messages: [{ role: 'user', content: prompt }], stream: false, temperature: 0.3 });
        }
        var resp = await fetch(endpoint, fetchOpts);
        if (!resp.ok) { var errText = ''; try { errText = await resp.text(); } catch(e) {} throw new Error('API请求失败: ' + resp.status + (errText ? ' - ' + errText : '')); }
        var json = await resp.json();
        if (provider === 'ollama') {
          if (json.message && json.message.content) fullText = json.message.content;
        } else {
          if (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) fullText = json.choices[0].message.content;
        }
        if (!fullText) throw new Error('AI未返回结果');

        var jsonMatch = fullText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('AI返回格式不正确，无法解析产品数据');
        var products = JSON.parse(jsonMatch[0]);
        if (!Array.isArray(products) || !products.length) throw new Error('未搜索到产品');

        S._aiSearchResults = products;
        renderAiSearchResults(products);
      } catch(e) {
        document.getElementById('aiPsResults').innerHTML = '<div style="text-align:center;padding:20px;color:var(--danger)">❌ 搜索失败: ' + esc(e.message) + '</div>';
      } finally {
        btn.innerHTML = origHtml;
        btn.disabled = false;
      }
    })();
  };

  function renderAiSearchResults(products) {
    var html = '<div style="margin-bottom:10px;display:flex;align-items:center;gap:8px"><span style="font-size:13px;font-weight:600">搜索结果 (' + products.length + '个产品)</span><button class="btn btn-primary btn-sm" onclick="importAllAiSearchResults()">📥 全部导入</button></div>';
    html += '<div style="max-height:400px;overflow-y:auto">';
    html += '<table class="quote-table" style="font-size:12px"><thead><tr><th style="width:30px"><input type="checkbox" id="aiPsSelectAll" onchange="toggleAllAiSearchResults()" checked style="cursor:pointer"></th><th>产品名称</th><th>品牌</th><th>规格</th><th>单位</th><th>京东参考价</th><th>操作</th></tr></thead><tbody>';
    products.forEach(function(p, i) {
      html += '<tr><td style="text-align:center"><input type="checkbox" class="ai-ps-cb" data-idx="' + i + '" checked style="cursor:pointer"></td>' +
        '<td style="text-align:left;padding:4px 6px">' + esc(p.name || '') + '</td>' +
        '<td>' + esc(p.brand || '') + '</td>' +
        '<td>' + esc(p.specifications || '') + '</td>' +
        '<td>' + esc(p.unit || '') + '</td>' +
        '<td style="font-weight:600">¥' + (p.unitPrice || 0) + '</td>' +
        '<td><button class="btn btn-primary btn-sm" onclick="importSingleAiSearchResult(' + i + ')" style="font-size:10px;padding:2px 8px">导入</button></td></tr>';
    });
    html += '</tbody></table></div>';
    document.getElementById('aiPsResults').innerHTML = html;
  }

  window.toggleAllAiSearchResults = function() {
    var allCb = document.getElementById('aiPsSelectAll');
    var cbs = document.querySelectorAll('.ai-ps-cb');
    cbs.forEach(function(cb) { cb.checked = allCb.checked; });
  };

  window.importSingleAiSearchResult = function(idx) {
    var products = S._aiSearchResults || [];
    if (idx < 0 || idx >= products.length) return;
    var p = products[idx];
    var existing = S.products.find(function(x) { return x.brand === p.brand && x.model === p.model; });
    if (existing) {
      if (!confirm('已存在相同品牌型号的产品"' + existing.name + '"，是否更新？')) return;
      existing.name = p.name || existing.name;
      existing.specifications = p.specifications || existing.specifications;
      existing.unit = p.unit || existing.unit;
      existing.unitPrice = p.unitPrice || existing.unitPrice;
      existing.description = p.description || existing.description;
      existing.notes = p.notes || existing.notes;
      existing.updatedAt = Date.now();
      showToast('已更新: ' + p.name);
    } else {
      S.products.push({
        id: uid(), name: p.name || '', brand: p.brand || '', model: p.model || '',
        mainCategory: p.mainCategory || 'main_material', subCategory: p.subCategory || '',
        specifications: p.specifications || '', material: p.material || '', color: p.color || '',
        unit: p.unit || '个', unitPrice: parseFloat(p.unitPrice) || 0,
        origin: p.origin || '', environmentalRating: '', warranty: p.warranty || '',
        installationMethod: p.installationMethod || '', description: p.description || '',
        notes: p.notes || '', photo: '', createdAt: Date.now(), updatedAt: Date.now()
      });
      showToast('已导入: ' + p.name);
    }
    saveProductsToStorage();
    renderProductDb();
    markDirty();
  };

  window.importAllAiSearchResults = function() {
    var products = S._aiSearchResults || [];
    var cbs = document.querySelectorAll('.ai-ps-cb');
    var selectedIdx = [];
    cbs.forEach(function(cb) { if (cb.checked) selectedIdx.push(parseInt(cb.dataset.idx)); });
    if (!selectedIdx.length) { showToast('请选择要导入的产品'); return; }
    var added = 0, updated = 0;
    selectedIdx.forEach(function(idx) {
      var p = products[idx];
      if (!p) return;
      var existing = S.products.find(function(x) { return x.brand === p.brand && x.model === p.model; });
      if (existing) {
        existing.name = p.name || existing.name;
        existing.specifications = p.specifications || existing.specifications;
        existing.unit = p.unit || existing.unit;
        existing.unitPrice = p.unitPrice || existing.unitPrice;
        existing.description = p.description || existing.description;
        existing.notes = p.notes || existing.notes;
        existing.updatedAt = Date.now();
        updated++;
      } else {
        S.products.push({
          id: uid(), name: p.name || '', brand: p.brand || '', model: p.model || '',
          mainCategory: p.mainCategory || 'main_material', subCategory: p.subCategory || '',
          specifications: p.specifications || '', material: p.material || '', color: p.color || '',
          unit: p.unit || '个', unitPrice: parseFloat(p.unitPrice) || 0,
          origin: p.origin || '', environmentalRating: '', warranty: p.warranty || '',
          installationMethod: p.installationMethod || '', description: p.description || '',
          notes: p.notes || '', photo: '', createdAt: Date.now(), updatedAt: Date.now()
        });
        added++;
      }
    });
    saveProductsToStorage();
    renderProductDb();
    markDirty();
    showToast('✅ 已导入 ' + added + ' 个产品' + (updated ? '，更新 ' + updated + ' 个' : ''));
  };

  // 其他产品相关函数（详见 main.js）
  // showProductForm, saveProduct, deleteProduct, 导入函数等

  console.log('✅ 产品数据库模块已加载');
})();
