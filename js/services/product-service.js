// 产品数据库模块
// 处理产品数据库管理、产品导入等功能

(function() {

  window.openProductDatabase = function() {
    S.pdbSelectedMainCat = null;
    S.pdbSelectedSubCat = null;
    S.editingProductId = null;
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
    var content = '<div style="display:flex;flex-direction:column;gap:10px"><div class="pdb-toolbar"><input id="pdbSearch" placeholder="搜索产品..." oninput="renderProductGrid()" style="width:180px"><select id="pdbMainFilter" onchange="pdbMainFilterChange()"><option value="">全部分类</option>' + PRODUCT_MAIN_CATEGORIES.map(function(mc) { return '<option value="' + mc.id + '"' + (S.pdbSelectedMainCat === mc.id ? ' selected' : '') + '>' + mc.icon + ' ' + mc.name + '</option>'; }).join('') + '</select><select id="pdbSubFilter" onchange="pdbSubFilterChange()"><option value="">全部子类</option>' + (S.pdbSelectedMainCat ? PRODUCT_MAIN_CATEGORIES.find(function(c) { return c.id === S.pdbSelectedMainCat; }).subcategories.map(function(sc) { return '<option value="' + sc.id + '"' + (S.pdbSelectedSubCat === sc.id ? ' selected' : '') + '>' + sc.name + '</option>'; }).join('') : '') + '</select><button class="btn btn-primary btn-sm" onclick="showProductForm()">+ 添加产品</button><div class="export-dropdown"><button class="btn btn-info btn-sm" onclick="toggleImportMenu(event)">📥 导入产品 ▾</button><div class="export-menu" id="importMenu"><button class="export-menu-item" onclick="importSummitTileProducts()">🧱 萨米特瓷砖</button><button class="export-menu-item" onclick="importLangjingSanitaryProducts()">🚿 浪鲸卫浴</button><button class="export-menu-item" onclick="importKaienjiaCustomProducts()">🛋️ 凯恩佳美定制</button><button class="export-menu-item" onclick="importQiteliWallFabricProducts()">🎨 七特丽壁布</button><button class="export-menu-item" onclick="importSchneiderBullSwitchProducts()">⚡ 开关插座</button><button class="export-menu-item" onclick="importSubmarineProducts()">🔩 潜水艇地漏</button><button class="export-menu-item" onclick="importCountertopProducts()">🪟 橱柜台面</button><button class="export-menu-item" onclick="importYeelightSmartProducts()">💡 易来智能</button><button class="export-menu-item" onclick="importEquipmentProducts()">⚙️ 设备产品</button><button class="export-menu-item" onclick="importSoftFurnishingProducts()">🛋️ 软装产品</button><button class="export-menu-item" onclick="importEcommerceProducts()">🛒 京东产品数据</button></div></div></div><div id="pdbGridArea"></div></div>';
    body.innerHTML = '<div class="pdb-layout">' + tree + content + '</div>';
    renderProductGrid();
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
      return '<div class="pdb-card" onclick="showProductForm(\'' + p.id + '\')"><div class="pdb-card-img">' + (p.photo ? '<img src="' + p.photo + '">' : '<div class="pdb-no-img">📦</div>') + '</div><div class="pdb-card-body"><div class="pdb-card-name">' + esc(p.name) + '</div><div class="pdb-card-brand">' + esc(p.brand) + (p.model ? ' · ' + esc(p.model) : '') + '</div><div class="pdb-card-specs">' + esc(p.specifications || '') + '</div><div class="pdb-card-price">¥' + fmt(p.unitPrice) + ' <span>/' + esc(p.unit) + '</span></div><div style="margin-top:4px"><button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteProduct(\'' + p.id + '\')" style="font-size:10px;padding:2px 6px">删除</button></div></div></div>';
    }).join('') + '</div>';
  };

  // 其他产品相关函数（详见 main.js）
  // showProductForm, saveProduct, deleteProduct, 导入函数等

  console.log('✅ 产品数据库模块已加载');
})();
