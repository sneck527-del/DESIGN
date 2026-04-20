// 数据看板模块
// 处理数据统计、图表展示等功能

(function() {

  window.showDashboard = function() {
    checkDirty(function() {
      S.bossAuthenticated = false;
      renderDashboard();
      showView('dashboard');
    });
  };

  window.renderDashboard = function() {
    var quoteFiles = S.files.filter(function(f) { return f.type === 'quotation'; });
    var allItems = []; var totalRevenue = 0; var totalCount = quoteFiles.length;
    quoteFiles.forEach(function(f) {
      var d = f.data; var items = (d.quoteItems || []).concat(d.productQuoteItems || []);
      var sub = items.reduce(function(s, i) { return s + (i.quantity || 0) * (i.unitPrice || 0); }, 0);
      totalRevenue += sub; allItems.push({ name: f.name, date: f.updatedAt, total: sub, rooms: (d.rooms || []).length });
    });
    var avgValue = totalCount > 0 ? totalRevenue / totalCount : 0;
    var msFiles = S.files.filter(function(f) { return f.type === 'measurement'; }).length;
    var totalProducts = S.products.length;
    // Monthly data
    var months = {}; quoteFiles.forEach(function(f) {
      var d = f.updatedAt; var key = new Date(d).getFullYear() + '-' + String(new Date(d).getMonth() + 1).padStart(2, '0');
      if(!months[key]) months[key] = { count: 0, revenue: 0 };
      months[key].count++;
      months[key].revenue += f.data ? (f.data.quoteItems || []).concat(f.data.productQuoteItems || []).reduce(function(s, i) { return s + (i.quantity || 0) * (i.unitPrice || 0); }, 0) : 0;
    });
    var monthKeys = Object.keys(months).sort().slice(-6);
    var maxRev = Math.max.apply(null, monthKeys.map(function(k) { return months[k].revenue; })) || 1;
    var topFiles = allItems.slice().sort(function(a, b) { return b.total - a.total; }).slice(0, 8);
    var el = document.getElementById('dashboardView');
    el.innerHTML = '<div class="dash-nav"><button class="dash-nav-btn active">📊 数据概览</button><div style="flex:1"></div><button class="btn btn-outline btn-sm" onclick="showView(\'welcome\')">返回</button></div>' +
      '<div class="dash-stats"><div class="dash-stat-card"><div class="dash-stat-icon" style="background:var(--accent-dim);color:var(--accent)">📋</div><div class="dash-stat-value">' + totalCount + '</div><div class="dash-stat-label">报价总数</div></div>' +
      '<div class="dash-stat-card"><div class="dash-stat-icon" style="background:rgba(16,185,129,0.12);color:var(--success)">💰</div><div class="dash-stat-value">¥' + fmtK(totalRevenue) + '</div><div class="dash-stat-label">报价总额</div></div>' +
      '<div class="dash-stat-card"><div class="dash-stat-icon" style="background:rgba(245,158,11,0.12);color:var(--warning)">📈</div><div class="dash-stat-value">¥' + fmtK(avgValue) + '</div><div class="dash-stat-label">平均报价</div></div>' +
      '<div class="dash-stat-card"><div class="dash-stat-icon" style="background:rgba(139,92,246,0.12);color:#8b5cf6">📦</div><div class="dash-stat-value">' + totalProducts + '</div><div class="dash-stat-label">产品数量</div></div></div>' +
      '<div class="dash-grid"><div class="dash-card"><div class="dash-card-header"><h3>月度营收趋势</h3></div><div class="dash-card-body">' + monthKeys.map(function(k) { var m = months[k]; var pct = Math.round(m.revenue / maxRev * 100); return '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>' + k + '</span><span style="color:var(--text-light)">¥' + fmtK(m.revenue) + ' (' + m.count + '单)</span></div><div class="dash-bar"><div class="dash-bar-fill" style="width:' + pct + '%;background:var(--accent)"></div></div></div>'; }).join('') + '</div></div>' +
      '<div class="dash-card"><div class="dash-card-header"><h3>报价明细</h3><span style="font-size:11px;color:var(--text-dim)">共 ' + quoteFiles.length + ' 份</span></div><div class="dash-card-body" style="max-height:320px;overflow-y:auto"><table class="dash-table"><thead><tr><th>文件名</th><th>房间</th><th>金额</th><th>日期</th><th>操作</th></tr></thead><tbody>' + topFiles.map(function(f) { var qf = quoteFiles.find(function(q) { return q.name === f.name; }); return '<tr><td style="font-weight:500">' + esc(f.name) + '</td><td>' + f.rooms + '</td><td style="color:var(--accent);font-weight:600">¥' + fmt(f.total) + '</td><td style="color:var(--text-dim)">' + formatDate(f.date) + '</td><td>' + (qf ? '<button class="btn btn-outline btn-sm" onclick="openFile(\'' + qf.id + '\')">打开</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div></div></div>';
  };

  console.log('✅ 数据看板模块已加载');
})();
