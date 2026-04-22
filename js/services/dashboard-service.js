// 数据看板模块
// 处理数据统计、图表展示等功能

(function() {

  var currentChartInstance1 = null;
  var currentChartInstance2 = null;
  var selectedQuoteId = 'all';

  window.showDashboard = function() {
    checkDirty(function() {
      S.bossAuthenticated = false;
      selectedQuoteId = 'all';
      renderDashboard();
      showView('dashboard');
    });
  };

  function calculateQuoteStats(quoteData) {
    var d = quoteData;
    var items = (d.quoteItems || []);
    var products = (d.productQuoteItems || []);

    var categoryTotals = {};
    items.forEach(function(i) {
      var cat = i.category || '其他';
      if (!categoryTotals[cat]) categoryTotals[cat] = 0;
      categoryTotals[cat] += (i.quantity || 0) * (i.unitPrice || 0);
    });

    var mainCategoryTotals = {
      '主材': 0,
      '设备': 0,
      '软装': 0,
      '辅料': 0
    };
    products.forEach(function(p) {
      var mc = p.mainCategory;
      var amount = (p.quantity || 0) * (p.unitPrice || 0);
      if (mc === 'main_material') mainCategoryTotals['主材'] += amount;
      else if (mc === 'equipment') mainCategoryTotals['设备'] += amount;
      else if (mc === 'soft_furnishing') mainCategoryTotals['软装'] += amount;
      else if (mc === 'auxiliary') mainCategoryTotals['辅料'] += amount;
    });

    return {
      categoryTotals: categoryTotals,
      mainCategoryTotals: mainCategoryTotals
    };
  }

  window.renderDashboard = function() {
    var quoteFiles = S.files.filter(function(f) { return f.type === 'quotation'; });
    var allItems = [];
    var totalRevenue = 0;
    var totalCount = quoteFiles.length;

    quoteFiles.forEach(function(f) {
      var d = f.data;
      var items = (d.quoteItems || []).concat(d.productQuoteItems || []);
      var sub = items.reduce(function(s, i) { return s + (i.quantity || 0) * (i.unitPrice || 0); }, 0);
      totalRevenue += sub;
      allItems.push({
        id: f.id,
        name: f.name,
        date: f.updatedAt,
        total: sub,
        rooms: (d.rooms || []).length,
        data: d
      });
    });

    var avgValue = totalCount > 0 ? totalRevenue / totalCount : 0;
    var msFiles = S.files.filter(function(f) { return f.type === 'measurement'; }).length;
    var totalProducts = S.products.length;

    var months = {};
    quoteFiles.forEach(function(f) {
      var d = f.updatedAt;
      var key = new Date(d).getFullYear() + '-' + String(new Date(d).getMonth() + 1).padStart(2, '0');
      if(!months[key]) months[key] = { count: 0, revenue: 0 };
      months[key].count++;
      months[key].revenue += f.data ? (f.data.quoteItems || []).concat(f.data.productQuoteItems || []).reduce(function(s, i) { return s + (i.quantity || 0) * (i.unitPrice || 0); }, 0) : 0;
    });
    var monthKeys = Object.keys(months).sort().slice(-6);
    var maxRev = Math.max.apply(null, monthKeys.map(function(k) { return months[k].revenue; })) || 1;
    var topFiles = allItems.slice().sort(function(a, b) { return b.total - a.total; }).slice(0, 8);

    var categoryTotals = {};
    var mainCategoryTotals = { '主材': 0, '设备': 0, '软装': 0, '辅料': 0 };

    if (selectedQuoteId === 'all') {
      quoteFiles.forEach(function(f) {
        var stats = calculateQuoteStats(f.data);
        Object.keys(stats.categoryTotals).forEach(function(cat) {
          if (!categoryTotals[cat]) categoryTotals[cat] = 0;
          categoryTotals[cat] += stats.categoryTotals[cat];
        });
        Object.keys(stats.mainCategoryTotals).forEach(function(mc) {
          mainCategoryTotals[mc] += stats.mainCategoryTotals[mc];
        });
      });
    } else {
      var selectedFile = quoteFiles.find(function(f) { return f.id === selectedQuoteId; });
      if (selectedFile) {
        var stats = calculateQuoteStats(selectedFile.data);
        categoryTotals = stats.categoryTotals;
        mainCategoryTotals = stats.mainCategoryTotals;
      }
    }

    var el = document.getElementById('dashboardView');
    el.innerHTML = '<div class="dash-nav"><button class="dash-nav-btn active">📊 数据概览</button><div style="flex:1"></div>' +
      '<div style="display:flex;align-items:center;gap:8px">' +
      '<label style="font-size:12px;color:var(--text-light)">选择报价:</label>' +
      '<select id="quoteSelector" onchange="onQuoteSelectChange(this.value)" style="padding:6px 10px;border:1px solid var(--border-strong);border-radius:6px;background:var(--input-bg);color:var(--text);font-size:12px">' +
      '<option value="all"' + (selectedQuoteId === 'all' ? ' selected' : '') + '>所有报价汇总</option>' +
      quoteFiles.map(function(f) { return '<option value="' + f.id + '"' + (selectedQuoteId === f.id ? ' selected' : '') + '>' + esc(f.name) + '</option>'; }).join('') +
      '</select></div>' +
      '<button class="btn btn-outline btn-sm" onclick="showView(\'welcome\')">返回</button></div>' +
      '<div class="dash-stats"><div class="dash-stat-card"><div class="dash-stat-icon" style="background:var(--accent-dim);color:var(--accent)">📋</div><div class="dash-stat-value">' + totalCount + '</div><div class="dash-stat-label">报价总数</div></div>' +
      '<div class="dash-stat-card"><div class="dash-stat-icon" style="background:rgba(16,185,129,0.12);color:var(--success)">💰</div><div class="dash-stat-value">¥' + fmtK(totalRevenue) + '</div><div class="dash-stat-label">报价总额</div></div>' +
      '<div class="dash-stat-card"><div class="dash-stat-icon" style="background:rgba(245,158,11,0.12);color:var(--warning)">📈</div><div class="dash-stat-value">¥' + fmtK(avgValue) + '</div><div class="dash-stat-label">平均报价</div></div>' +
      '<div class="dash-stat-card"><div class="dash-stat-icon" style="background:rgba(139,92,246,0.12);color:#8b5cf6">📦</div><div class="dash-stat-value">' + totalProducts + '</div><div class="dash-stat-label">产品数量</div></div></div>' +
      '<div class="dash-grid">' +
      '<div class="dash-card"><div class="dash-card-header"><h3>工种分布</h3></div><div class="dash-card-body"><canvas id="categoryChart" height="250"></canvas></div></div>' +
      '<div class="dash-card"><div class="dash-card-header"><h3>主材/设备/软装</h3></div><div class="dash-card-body"><canvas id="productChart" height="250"></canvas></div></div>' +
      '</div>' +
      '<div class="dash-grid"><div class="dash-card"><div class="dash-card-header"><h3>月度营收趋势</h3></div><div class="dash-card-body">' + monthKeys.map(function(k) { var m = months[k]; var pct = Math.round(m.revenue / maxRev * 100); return '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>' + k + '</span><span style="color:var(--text-light)">¥' + fmtK(m.revenue) + ' (' + m.count + '单)</span></div><div class="dash-bar"><div class="dash-bar-fill" style="width:' + pct + '%;background:var(--accent)"></div></div></div>'; }).join('') + '</div></div>' +
      '<div class="dash-card"><div class="dash-card-header"><h3>报价明细</h3><span style="font-size:11px;color:var(--text-dim)">共 ' + quoteFiles.length + ' 份</span></div><div class="dash-card-body" style="max-height:320px;overflow-y:auto"><table class="dash-table"><thead><tr><th>文件名</th><th>房间</th><th>金额</th><th>日期</th><th>操作</th></tr></thead><tbody>' + topFiles.map(function(f) { var qf = quoteFiles.find(function(q) { return q.id === f.id; }); return '<tr><td style="font-weight:500">' + esc(f.name) + '</td><td>' + f.rooms + '</td><td style="color:var(--accent);font-weight:600">¥' + fmt(f.total) + '</td><td style="color:var(--text-dim)">' + formatDate(f.date) + '</td><td>' + (qf ? '<button class="btn btn-outline btn-sm" onclick="openFile(\'' + qf.id + '\')">打开</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div></div></div>';

    setTimeout(function() {
      renderCharts(categoryTotals, mainCategoryTotals);
    }, 50);
  };

  window.onQuoteSelectChange = function(quoteId) {
    selectedQuoteId = quoteId;
    renderDashboard();
  };

  function renderCharts(categoryTotals, mainCategoryTotals) {
    if (currentChartInstance1) {
      currentChartInstance1.destroy();
    }
    if (currentChartInstance2) {
      currentChartInstance2.destroy();
    }

    var ctx1 = document.getElementById('categoryChart');
    var ctx2 = document.getElementById('productChart');

    if (!ctx1 || !ctx2 || typeof Chart === 'undefined') return;

    var catLabels = Object.keys(categoryTotals);
    var catValues = catLabels.map(function(l) { return Math.round(categoryTotals[l]); });

    var colors = [
      '#d4af37', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#ec4899', '#6366f1', '#14b8a6', '#f97316'
    ];

    currentChartInstance1 = new Chart(ctx1, {
      type: 'pie',
      data: {
        labels: catLabels,
        datasets: [{
          data: catValues,
          backgroundColor: catLabels.map(function(_, i) { return colors[i % colors.length]; }),
          borderWidth: 2,
          borderColor: 'var(--bg)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: 'var(--text)',
              font: { size: 11 },
              padding: 10
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                var label = context.label || '';
                var value = context.raw || 0;
                var total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                var pct = total > 0 ? Math.round(value / total * 100) : 0;
                return label + ': ¥' + fmtInt(value) + ' (' + pct + '%)';
              }
            }
          }
        }
      }
    });

    var prodLabels = Object.keys(mainCategoryTotals).filter(function(k) { return mainCategoryTotals[k] > 0; });
    var prodValues = prodLabels.map(function(l) { return Math.round(mainCategoryTotals[l]); });
    var prodColors = {
      '主材': '#d4af37',
      '设备': '#10b981',
      '软装': '#8b5cf6',
      '辅料': '#f59e0b'
    };

    currentChartInstance2 = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: prodLabels,
        datasets: [{
          data: prodValues,
          backgroundColor: prodLabels.map(function(l) { return prodColors[l]; }),
          borderWidth: 2,
          borderColor: 'var(--bg)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: 'var(--text)',
              font: { size: 11 },
              padding: 10
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                var label = context.label || '';
                var value = context.raw || 0;
                var total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                var pct = total > 0 ? Math.round(value / total * 100) : 0;
                return label + ': ¥' + fmtInt(value) + ' (' + pct + '%)';
              }
            }
          }
        }
      }
    });
  }

  console.log('✅ 数据看板模块已加载');
})();
