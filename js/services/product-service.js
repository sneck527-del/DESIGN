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
    var content = '<div style="display:flex;flex-direction:column;gap:10px"><div class="pdb-toolbar"><input id="pdbSearch" placeholder="搜索产品..." oninput="renderProductGrid()" style="width:180px"><select id="pdbMainFilter" onchange="pdbMainFilterChange()"><option value="">全部分类</option>' + PRODUCT_MAIN_CATEGORIES.map(function(mc) { return '<option value="' + mc.id + '"' + (S.pdbSelectedMainCat === mc.id ? ' selected' : '') + '>' + mc.icon + ' ' + mc.name + '</option>'; }).join('') + '</select><select id="pdbSubFilter" onchange="pdbSubFilterChange()"><option value="">全部子类</option>' + (S.pdbSelectedMainCat ? PRODUCT_MAIN_CATEGORIES.find(function(c) { return c.id === S.pdbSelectedMainCat; }).subcategories.map(function(sc) { return '<option value="' + sc.id + '"' + (S.pdbSelectedSubCat === sc.id ? ' selected' : '') + '>' + sc.name + '</option>'; }).join('') : '') + '</select><button class="btn btn-primary btn-sm" onclick="showProductForm()">+ 添加产品</button><div class="export-dropdown"><button class="btn btn-info btn-sm" onclick="toggleImportMenu(event)">📥 导入产品 ▾</button><div class="export-menu" id="importMenu"><button class="export-menu-item" onclick="importSummitTileProducts()">🧱 萨米特瓷砖</button><button class="export-menu-item" onclick="importLangjingSanitaryProducts()">🚿 浪鲸卫浴</button><button class="export-menu-item" onclick="importKaienjiaCustomProducts()">🛋️ 凯恩佳美定制</button><button class="export-menu-item" onclick="importQiteliWallFabricProducts()">🎨 七特丽壁布</button><button class="export-menu-item" onclick="importSchneiderBullSwitchProducts()">⚡ 开关插座</button><button class="export-menu-item" onclick="importSubmarineProducts()">🔩 潜水艇地漏</button><button class="export-menu-item" onclick="importCountertopProducts()">🪟 橱柜台面</button><button class="export-menu-item" onclick="importYeelightSmartProducts()">💡 易来智能</button><button class="export-menu-item" onclick="importEquipmentProducts()">⚙️ 设备产品</button><button class="export-menu-item" onclick="importSoftFurnishingProducts()">🛋️ 软装产品</button><button class="export-menu-item" onclick="importEcommerceProducts()">📦 京东产品数据</button></div></div><div class="export-dropdown"><button class="btn btn-danger btn-sm" onclick="toggleDeleteMenu(event)">🗑️ 删除产品 ▾</button><div class="export-menu" id="deleteMenu"><button class="export-menu-item" onclick="clearAllProducts()">⚠️ 清空所有产品</button><hr style="margin:4px 0;border:none;border-top:1px solid #ddd"><button class="export-menu-item" onclick="deleteProductsByBrand(\'萨米特\')">删除萨米特瓷砖</button><button class="export-menu-item" onclick="deleteProductsByBrand(\'浪鲸\')">删除浪鲸卫浴</button><button class="export-menu-item" onclick="deleteProductsByBrand(\'凯恩佳美\')">删除凯恩佳美定制</button><button class="export-menu-item" onclick="deleteProductsByBrand(\'七特丽\')">删除七特丽壁布</button><button class="export-menu-item" onclick="deleteProductsByBrand(\'施耐德\')">删除开关插座</button><button class="export-menu-item" onclick="deleteProductsByBrand(\'潜水艇\')">删除潜水艇地漏</button><button class="export-menu-item" onclick="deleteProductsByBrand(\'通用\')">删除橱柜台面</button><button class="export-menu-item" onclick="deleteProductsByBrand(\'易来\')">删除易来智能</button><button class="export-menu-item" onclick="deleteProductsByMainCategory(\'equipment\')">删除设备产品</button><button class="export-menu-item" onclick="deleteProductsByMainCategory(\'soft_furnishing\')">删除软装产品</button><button class="export-menu-item" onclick="deleteProductsByMainCategory(\'ecommerce\')">删除京东产品数据</button></div></div></div><div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #333"><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="pdbSelectAll" onchange="toggleSelectAllProducts()" style="cursor:pointer"> <span>全选</span></label><button class="btn btn-danger btn-sm" onclick="deleteSelectedProducts()" id="pdbDeleteSelectedBtn" disabled style="font-size:11px;padding:3px 8px">🗑️ 删除已选 (<span id="pdbSelectedCount">0</span>)</button><span style="margin-left:auto;color:#888;font-size:12px">点击产品卡片复选框选择</span></div><div id="pdbGridArea" style="flex:1;overflow:auto"></div></div>';
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

  // 其他产品相关函数（详见 main.js）
  // showProductForm, saveProduct, deleteProduct, 导入函数等

  console.log('✅ 产品数据库模块已加载');
})();
