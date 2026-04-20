// 材料库模块
// 处理材料库管理、空间类型库等功能

(function() {

  window.openMaterialLib = function() { renderMaterialLib(); openModal('materialLibModal'); };
  window.renderMaterialLib = function() {
    document.getElementById('materialLibBody').innerHTML = '<div class="lib-filter"><select id="matCatFilter" onchange="renderMaterialTable()"><option value="">全部</option>' + CATEGORIES.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join('') + '</select><input id="matSearch" placeholder="搜索..." oninput="renderMaterialTable()"><button class="btn btn-primary btn-sm" onclick="showMaterialForm()">+ 添加</button><button class="btn btn-outline btn-sm" onclick="batchUpdateBrand()">批量改品牌</button></div><div id="matFormArea"></div><div id="matTableArea"></div>';
    renderMaterialTable();
  };
  window.getUniqueBrands = function() {
    var b = [];
    S.materials.forEach(function(m) { if(m.brand && m.brand !== '-' && b.indexOf(m.brand) === -1) b.push(m.brand); });
    return b.sort();
  };
  window.renderMaterialTable = function() {
    var cv = (document.getElementById('matCatFilter') || {}).value;
    var sr = ((document.getElementById('matSearch') || {}).value || '').toLowerCase();
    var m = S.materials;
    if(cv) m = m.filter(function(x) { return x.category === cv; });
    if(sr) m = m.filter(function(x) { return x.name.toLowerCase().includes(sr) || (x.brand || '').toLowerCase().includes(sr); });
    var el = document.getElementById('matTableArea');
    if(!m.length) { el.innerHTML = '<div class="empty-state"><p>暂无</p></div>'; return; }
    el.innerHTML = '<table class="lib-table"><thead><tr><th>名称</th><th>品牌</th><th>单位</th><th>奢享</th><th>优享</th><th>分类</th><th>说明</th><th>操作</th></tr></thead><tbody>' + m.map(function(x) { return '<tr><td>' + esc(x.name) + '</td><td>' + esc(x.brand) + '</td><td>' + esc(x.unit) + '</td><td>' + (x.prices.luxury ? x.prices.luxury + '元' : '-') + '</td><td>' + (x.prices.premium ? x.prices.premium + '元' : '-') + '</td><td>' + esc(x.category) + '</td><td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(x.description) + '</td><td><button class="btn btn-outline btn-sm" onclick="editMaterial(\'' + x.id + '\')">编辑</button> <button class="btn btn-danger btn-sm" onclick="deleteMaterial(\'' + x.id + '\')">删除</button></td></tr>'; }).join('') + '</tbody></table>';
  };
  window.batchUpdateBrand = function() {
    var b = getUniqueBrands();
    document.getElementById('matFormArea').innerHTML = '<div class="mat-form"><div class="form-grid"><div class="form-group"><label>原品牌</label><select id="batchOldBrand">' + b.map(function(x) { return '<option>' + esc(x) + '</option>'; }).join('') + '</select></div><div class="form-group"><label>新品牌</label><input id="batchNewBrand"></div></div><div style="margin-top:6px"><button class="btn btn-primary btn-sm" onclick="doBatchUpdateBrand()">确认</button></div></div>';
  };
  window.doBatchUpdateBrand = function() {
    var o = document.getElementById('batchOldBrand').value;
    var n = document.getElementById('batchNewBrand').value.trim();
    if(!o || !n) return;
    var c = 0;
    S.materials.forEach(function(m) { if(m.brand === o) { m.brand = n; c++; } });
    if(c > 0) {
      document.getElementById('matFormArea').innerHTML = '';
      renderMaterialTable();
      syncPricesFromMaterials();
      renderQuoteTable();
      renderSummary();
      saveMaterialsToStorage();
      showToast('已更新' + c + '个');
    } else {
      showToast('未找到');
    }
  };
  window.onBrandSelectChange = function() {
    var select = document.getElementById('mfBrandSelect');
    var input = document.getElementById('mfBrand');
    if(select && input) { input.value = select.value; }
  };
  window.showMaterialForm = function(mat) {
    S.editingMaterialId = mat ? mat.id : null;
    var area = document.getElementById('matFormArea');
    var pd = mat && mat.processDetail ? mat.processDetail : { luxury: '', premium: '' };
    var brands = getUniqueBrands();
    area.innerHTML = '<div class="mat-form"><div class="form-grid"><div class="form-group"><label>名称</label><input id="mfName" value="' + (mat ? esc(mat.name) : '') + '"></div><div class="form-group"><label>品牌</label><div style="display:flex;gap:4px"><select id="mfBrandSelect" onchange="onBrandSelectChange()">' + brands.map(function(b) { return '<option value="' + esc(b) + '" ' + (mat && mat.brand === b ? 'selected' : '') + '>' + esc(b) + '</option>'; }).join('') + '<option value="" ' + (mat && !mat.brand ? 'selected' : '') + '>- 选择品牌 -</option></select><input id="mfBrand" value="' + (mat ? esc(mat.brand) : '') + '" placeholder="或输入新品牌" style="flex:1"></div></div><div class="form-group"><label>单位</label><input id="mfUnit" value="' + (mat ? esc(mat.unit) : '㎡') + '"></div><div class="form-group"><label>分类</label><select id="mfCategory">' + CATEGORIES.map(function(c) { return '<option value="' + c + '" ' + (mat && mat.category === c ? 'selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div><div class="form-group" style="grid-column:1/-1;display:flex;gap:8px"><div style="flex:1;min-width:120px;display:flex;flex-direction:column;gap:2px"><label style="font-size:12px;color:var(--text-light);font-weight:500">计算</label><select id="mfCalcType" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:12px;outline:none;transition:border-color .2s;background:var(--input-bg);color:var(--text);font-family:var(--font-family)">' + Object.keys(CALC_TYPES).map(function(k) { return '<option value="' + k + '" ' + (mat && mat.calcType === k ? 'selected' : '') + '>' + CALC_TYPES[k] + '</option>'; }).join('') + '</select></div><div style="flex:1;min-width:100px;display:flex;flex-direction:column;gap:2px"><label style="font-size:12px;color:var(--text-light);font-weight:500">奢享</label><input type="number" id="mfPL" value="' + (mat ? mat.prices.luxury : 0) + '" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:12px;outline:none;transition:border-color .2s;background:var(--input-bg);color:var(--text);font-family:var(--font-family)"></div><div style="flex:1;min-width:100px;display:flex;flex-direction:column;gap:2px"><label style="font-size:12px;color:var(--text-light);font-weight:500">优享</label><input type="number" id="mfPP" value="' + (mat ? mat.prices.premium : 0) + '" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:12px;outline:none;transition:border-color .2s;background:var(--input-bg);color:var(--text);font-family:var(--font-family)"></div></div><div class="form-group full"><label>说明</label><div style="display:flex;gap:6px;align-items:center"><input id="mfDesc" value="' + (mat ? esc(mat.description) : '') + '" style="flex:1"><button class="btn btn-info btn-sm" onclick="aiOptimizeField(\'mfDesc\',\'construction\')" title="AI智能优化说明">🤖</button></div></div><div class="form-group full"><label>奢享工艺</label><div style="display:flex;gap:6px;align-items:center"><input id="mfPDL" value="' + esc(pd.luxury) + '" style="flex:1"><button class="btn btn-info btn-sm" onclick="aiOptimizeField(\'mfPDL\',\'construction\')" title="AI智能优化工艺">🤖</button></div></div><div class="form-group full"><label>优享工艺</label><div style="display:flex;gap:6px;align-items:center"><input id="mfPDP" value="' + esc(pd.premium) + '" style="flex:1"><button class="btn btn-info btn-sm" onclick="aiOptimizeField(\'mfPDP\',\'construction\')" title="AI智能优化工艺">🤖</button></div></div></div><div style="margin-top:6px;display:flex;gap:6px"><button class="btn btn-primary btn-sm" onclick="saveMaterial()">保存</button><button class="btn btn-outline btn-sm" onclick="document.getElementById(\'matFormArea\').innerHTML=\'\'">取消</button></div></div>';
  };
  window.editMaterial = function(mid) { var m = S.materials.find(function(x) { return x.id === mid; }); if(m) showMaterialForm(m); };
  window.saveMaterial = function() {
    var n = document.getElementById('mfName').value.trim();
    if(!n) { showToast('请输入名称'); return; }
    var d = {
      id: S.editingMaterialId || uid(),
      name: n,
      brand: document.getElementById('mfBrand').value.trim(),
      unit: document.getElementById('mfUnit').value.trim(),
      prices: {
        luxury: parseFloat(document.getElementById('mfPL').value) || 0,
        premium: parseFloat(document.getElementById('mfPP').value) || 0
      },
      description: document.getElementById('mfDesc').value.trim(),
      category: document.getElementById('mfCategory').value,
      calcType: document.getElementById('mfCalcType').value,
      spaceTypeFilter: [],
      processDetail: {
        luxury: document.getElementById('mfPDL').value.trim(),
        premium: document.getElementById('mfPDP').value.trim()
      }
    };
    if(S.editingMaterialId) {
      var i = S.materials.findIndex(function(x) { return x.id === S.editingMaterialId; });
      if(i >= 0) S.materials[i] = d;
    } else {
      S.materials.push(d);
    }
    S.editingMaterialId = null;
    document.getElementById('matFormArea').innerHTML = '';
    renderMaterialTable();
    syncPricesFromMaterials();
    renderQuoteTable();
    renderSummary();
    saveMaterialsToStorage();
    showToast('已保存');
  };
  window.deleteMaterial = function(mid) {
    if(!confirm('确定删除？')) return;
    S.materials = S.materials.filter(function(m) { return m.id !== mid; });
    S.quoteItems = S.quoteItems.filter(function(q) { return q.materialId !== mid; });
    renderMaterialTable();
    renderQuoteTable();
    renderSummary();
    saveMaterialsToStorage();
    markDirty();
  };

  window.openSpaceTypeLib = function() { renderSpaceTypeLib(); openModal('spaceTypeLibModal'); };
  window.renderSpaceTypeLib = function() {
    document.getElementById('spaceTypeLibBody').innerHTML = '<div style="margin-bottom:10px"><button class="btn btn-primary btn-sm" onclick="showSpaceTypeForm()">+ 添加</button></div><div id="stListArea"></div>';
    renderSpaceTypeList();
  };
  window.renderSpaceTypeList = function() {
    var el = document.getElementById('stListArea');
    if(!S.spaceTypes.length) { el.innerHTML = '<div class="empty-state"><p>暂无</p></div>'; return; }
    el.innerHTML = S.spaceTypes.map(function(st) { return '<div class="st-item"><div class="st-item-header"><span class="st-item-name">' + st.icon + ' ' + esc(st.name) + '</span><div><button class="btn btn-outline btn-sm" onclick="editSpaceType(\'' + st.id + '\')">编辑</button> <button class="btn btn-danger btn-sm" onclick="deleteSpaceType(\'' + st.id + '\')">删除</button></div></div></div>'; }).join('');
  };
  window.showSpaceTypeForm = function(st) {
    S.editingSpaceTypeId = st ? st.id : null;
    var area = document.getElementById('stListArea');
    var emojis = ['🛋️','🍽️','🛏️','🍳','🚿','🌿','🚪','📐','📚','📦','🏠','🏢','🛁','🎮','👶','👗','🧹','🏋️'];
    area.innerHTML = '<div class="mat-form"><div class="form-grid"><div class="form-group"><label>名称</label><input id="stName" value="' + (st ? esc(st.name) : '') + '"></div><div class="form-group"><label>图标</label><select id="stIcon">' + emojis.map(function(e) { return '<option value="' + e + '" ' + (st && st.icon === e ? 'selected' : '') + '>' + e + '</option>'; }).join('') + '</select></div></div><div style="margin-top:6px;display:flex;gap:6px"><button class="btn btn-primary btn-sm" onclick="saveSpaceType()">保存</button><button class="btn btn-outline btn-sm" onclick="renderSpaceTypeList()">取消</button></div></div>';
  };
  window.editSpaceType = function(id) { var st = S.spaceTypes.find(function(s) { return s.id === id; }); if(st) showSpaceTypeForm(st); };
  window.saveSpaceType = function() {
    var n = document.getElementById('stName').value.trim();
    if(!n) return;
    var d = { id: S.editingSpaceTypeId || uid(), name: n, icon: document.getElementById('stIcon').value };
    if(S.editingSpaceTypeId) {
      var i = S.spaceTypes.findIndex(function(s) { return s.id === S.editingSpaceTypeId; });
      if(i >= 0) S.spaceTypes[i] = d;
    } else {
      S.spaceTypes.push(d);
    }
    S.editingSpaceTypeId = null;
    renderSpaceTypeList();
    saveSettings();
  };
  window.deleteSpaceType = function(id) {
    if(!confirm('确定删除？')) return;
    S.spaceTypes = S.spaceTypes.filter(function(s) { return s.id !== id; });
    renderSpaceTypeList();
    saveSettings();
  };

  console.log('✅ 材料库模块已加载');
})();
