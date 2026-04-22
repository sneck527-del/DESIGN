// 导出模块

/**
 * 显示进度提示框
 */
function showProgressToast(message) {
  var toast = document.getElementById('toast');
  if (toast) {
    toast.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px"><span class="spinner"></span>' + esc(message) + '</span>';
    toast.classList.add('show');
  }
}

function exportPDF(version) {
  if (typeof License !== 'undefined') {
    var restriction = License.checkFeatureRestriction('export_pdf');
    if (!restriction.allowed) {
      showToast(restriction.message || '功能受限');
      License.showPurchaseModal();
      return;
    }
  }

  if (!S.currentFileId) {
    showToast('请先打开报价文件');
    return;
  }

  var ci = S.customerInfo;
  var labels = { luxury: '奢享全案', premium: '优享精造' };
  var totals = calcQuoteTotal();
  var pageW = 970;

  var contentHTML;
  if (version === 'simple') {
    contentHTML = simpleExportHTML(ci, labels, totals);
  } else {
    contentHTML = detailedExportHTML(ci, labels, totals);
  }

  if (!contentHTML || contentHTML.trim() === '') {
    showToast('导出内容为空，请检查报价数据');
    return;
  }

  var oldOverlay = document.getElementById('pdf-overlay');
  if (oldOverlay && oldOverlay.parentNode) oldOverlay.parentNode.removeChild(oldOverlay);

  var overlay = document.createElement('div');
  overlay.id = 'pdf-overlay';
  overlay.style.cssText = 'position:fixed;left:-9999px;top:0;width:'+pageW+'px;background:#fff;z-index:999999;overflow:visible;';

  var container = document.createElement('div');
  container.id = 'pdf-export-container';
  container.style.cssText = 'width:'+pageW+'px;background:#fff;padding:20px;margin:0 auto;font-family:"Microsoft YaHei",sans-serif;color:#222;box-sizing:border-box;line-height:1.6;';

  container.innerHTML = contentHTML;
  var collapsedRows = container.querySelectorAll('.collapsed');
  collapsedRows.forEach(function(row) { row.classList.remove('collapsed') });

  overlay.appendChild(container);
  document.body.appendChild(overlay);

  // 显示进度提示
  showProgressToast('正在准备导出内容...');

  setTimeout(function() {
    if (typeof html2pdf === 'undefined' && !window.html2pdf) {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      showToast('PDF组件未加载，请刷新页面重试');
      return;
    }

    showProgressToast('正在生成PDF，可能需要几秒钟...');

    var opt = {
      margin: [10, 1, 10, 20],
      filename: '报价单-' + (version === 'simple' ? '简约' : '合同') + '版.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        logging: false,
        onclone: function() {
          showProgressToast('正在渲染页面...');
        }
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'landscape'
      }
    };

    html2pdf().set(opt).from(container).save().then(function() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      showToast('✅ PDF导出成功！');
    }).catch(function(error) {
      console.error('PDF导出错误:', error);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      showToast('❌ PDF导出失败，请重试');
    });
  }, 500); // 减少延迟时间
}

function printQuote(version) {
  if (!S.currentFileId) {
    showToast('请先打开报价文件');
    return;
  }
  var ci = S.customerInfo;
  var labels = { luxury: '奢享全案', premium: '优享精造' };
  var totals = calcQuoteTotal();
  var html;
  if (version === 'simple') html = simpleExportHTML(ci, labels, totals);
  else html = detailedExportHTML(ci, labels, totals);
  html = '<div style="position:fixed;top:0;right:10px"><button onclick="window.print()" style="padding:8px 16px;border:1px solid #ccc;background:#fff;cursor:pointer;border-radius:6px;font-size:14px">打印</button></div>' + html;
  var w = window.open('', '_blank');
  w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>报价单</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:"Microsoft YaHei",sans-serif;padding:20px;color:#222}</style></head><body>' + html);
  w.document.close();
}

function exportHeaderHTML(ci, labels) {
  var modeLabels = { full: '全案落地', light: '轻工辅料' };
  var qm = ci.quoteMode || 'full';
  return '<div style="text-align:center;margin-bottom:16px"><div style="font-size:28px;font-weight:700;letter-spacing:3px">斑马精装报价单</div><div style="font-size:16px;color:#666;margin-top:8px">' + (labels[S.currentPlan] || '') + ' · ' + (modeLabels[qm] || '全案落地') + '</div></div><table style="width:100%;font-size:12px;border-collapse:collapse;margin-bottom:12px;table-layout:fixed"><colgroup><col style="width:16.66%"><col style="width:16.66%"><col style="width:16.66%"><col style="width:16.66%"><col style="width:16.66%"><col style="width:16.66%"></colgroup><tr><td style="padding:6px 4px;border-bottom:1px solid #e0e0e0"><span style="font-weight:700">客户：</span>' + esc(ci.name) + '</td><td style="padding:6px 4px;border-bottom:1px solid #e0e0e0"><span style="font-weight:700">联系方式：</span>' + esc(ci.phone) + '</td><td style="padding:6px 4px;border-bottom:1px solid #e0e0e0"><span style="font-weight:700">设计师：</span>' + esc(ci.designer) + '</td><td style="padding:6px 4px;border-bottom:1px solid #e0e0e0"><span style="font-weight:700">设计师电话：</span>' + esc(ci.designerPhone) + '</td><td style="padding:6px 4px;border-bottom:1px solid #e0e0e0"><span style="font-weight:700">工艺标准：</span>' + (labels[S.currentPlan] || '') + '</td><td style="padding:6px 4px;border-bottom:1px solid #e0e0e0"><span style="font-weight:700">报价模式：</span>' + (modeLabels[qm] || '全案落地') + '</td></tr><tr><td style="padding:6px 4px;border-bottom:1px solid #e0e0e0"><span style="font-weight:700">地址：</span>' + esc(ci.address) + '</td><td style="padding:6px 4px;border-bottom:1px solid #e0e0e0" colspan="3"><span style="font-weight:700">面积：</span>' + esc(ci.area) + '㎡</td><td style="padding:6px 4px;border-bottom:1px solid #e0e0e0" colspan="2"><span style="font-weight:700">日期：</span>' + esc(ci.date) + '</td></tr></table>';
}

function exportSummaryHTML(totals) {
  return '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:14px;table-layout:fixed;page-break-inside:avoid"><colgroup><col style="width:5%"><col style="width:15%"><col style="width:5%"><col style="width:5%"><col style="width:12%"><col style="width:12%"><col style="width:46%"></colgroup><tr style="border-bottom:1px solid #d0d0d0"><td></td><td style="padding:6px 4px;text-align:left">工程报价</td><td></td><td></td><td></td><td></td><td style="padding:6px 4px;text-align:center;font-weight:600;white-space:nowrap">¥' + fmt(totals.engTotal) + '</td></tr>' + (totals.prodTotal > 0 ? '<tr style="border-bottom:1px solid #d0d0d0"><td></td><td style="padding:6px 4px;text-align:left">产品清单</td><td></td><td></td><td></td><td></td><td style="padding:6px 4px;text-align:center;font-weight:600;white-space:nowrap">¥' + fmt(totals.prodTotal) + '</td></tr>' : '') + '<tr style="border-bottom:1px solid #d0d0d0"><td></td><td style="padding:6px 4px;text-align:left">直接费用</td><td></td><td></td><td></td><td></td><td style="padding:6px 4px;text-align:center;font-weight:600;white-space:nowrap">¥' + fmt(totals.subtotal) + '</td></tr><tr style="border-bottom:1px solid #d0d0d0"><td></td><td style="padding:6px 4px;text-align:left">管理费 (' + S.managementFeeRate + '%)</td><td></td><td></td><td></td><td></td><td style="padding:6px 4px;text-align:center;white-space:nowrap">¥' + fmt(totals.mgmt) + '</td></tr><tr style="border-bottom:1px solid #d0d0d0"><td></td><td style="padding:6px 4px;text-align:left">税金 (' + S.taxRate + '%)</td><td></td><td></td><td></td><td></td><td style="padding:6px 4px;text-align:center;white-space:nowrap">¥' + fmt(totals.tax) + '</td></tr><tr style="border-bottom:1px solid #d0d0d0"><td></td><td style="padding:6px 4px;text-align:left">垃圾清运</td><td></td><td></td><td></td><td></td><td style="padding:6px 4px;text-align:center;white-space:nowrap">¥' + fmt(S.garbageFee) + '</td></tr><tr style="border-bottom:1px solid #d0d0d0"><td></td><td style="padding:6px 4px;text-align:left">成品保护</td><td></td><td></td><td></td><td></td><td style="padding:6px 4px;text-align:center;white-space:nowrap">¥' + fmt(S.protectionFee) + '</td></tr><tr><td></td><td style="padding:12px 4px;font-size:20px;font-weight:700;border-top:2px solid #333;text-align:left">报价总计</td><td></td><td></td><td></td><td></td><td style="padding:12px 4px;text-align:center;font-size:24px;font-weight:700;color:#c00;border-top:2px solid #333;white-space:nowrap">¥' + fmt(totals.grandTotal) + '</td></tr></table>';
}

function simpleExportHTML(ci, labels, totals) {
  return '<div style="padding:12px 16px">' + exportHeaderHTML(ci, labels) + (S.customNotes ? '<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:600;margin-bottom:4px">备注信息</div><div style="font-size:11px;white-space:pre-wrap;line-height:1.8;color:#555">' + esc(S.customNotes) + '</div></div>' : '') + exportSimpleTable() + exportSummaryHTML(totals) + '</div>';
}

function detailedExportHTML(ci, labels, totals) {
  return '<div style="padding:12px 16px">' + exportHeaderHTML(ci, labels) + exportDetailedTable() + exportSummaryHTML(totals) + '</div>';
}

function exportSimpleTable() {
  var items = S.quoteItems.concat(S.productQuoteItems);
  var seq = 1;
  var fg = {};
  S.rooms.forEach(function(r) {
    var f = r.floor || '一楼';
    if (!fg[f]) fg[f] = [];
    fg[f].push(r);
  });
  var floors = Object.keys(fg).sort(function(a, b) {
    return floorSortKey(a) - floorSortKey(b);
  });
  var h = '<table style="width:100%;border-collapse:collapse;font-size:11px;margin-top:10px;table-layout:fixed"><colgroup><col style="width:8%"><col style="width:62%"><col style="width:30%"></colgroup><thead><tr style="border-bottom:2px solid #bbb"><th style="padding:6px 4px;text-align:center;vertical-align:middle">序号</th><th style="padding:6px 4px;text-align:left;vertical-align:middle">项目</th><th style="padding:6px 4px;text-align:center;white-space:nowrap;vertical-align:middle">金额</th></tr></thead><tbody>';
  floors.forEach(function(fl) {
    var rooms = fg[fl];
    var fi = items.filter(function(q) {
      return rooms.some(function(r) {
        return r.id === q.roomId;
      });
    });
    if (!fi.length) return;
    var fT = fi.reduce(function(s, q) {
      return s + q.quantity * q.unitPrice;
    }, 0);
    h += '<tr><td colspan="3" style="padding:7px 4px;font-weight:600;font-size:12px;border-bottom:1px solid #e0e0e0;vertical-align:middle">🏗️ ' + esc(fl) + '<span style="float:right;white-space:nowrap">¥' + fmt(fT) + '</span></td></tr>';
    rooms.forEach(function(room) {
      var ri = fi.filter(function(q) {
        return q.roomId === room.id;
      });
      if (!ri.length) return;
      var rT = ri.reduce(function(s, q) {
        return s + q.quantity * q.unitPrice;
      }, 0);
      h += '<tr><td colspan="3" style="padding:5px 4px 5px 16px;font-weight:600;border-bottom:1px solid #f0f0f0;vertical-align:middle">📍 ' + esc(room.name) + '<span style="float:right;white-space:nowrap">¥' + fmt(rT) + '</span></td></tr>';
      ri.forEach(function(qi) {
        h += '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:5px;text-align:center;vertical-align:middle">' + seq + '</td><td style="padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;vertical-align:middle">' + esc(qi.name) + '</td><td style="padding:5px;text-align:center;font-weight:500;white-space:nowrap;vertical-align:middle">¥' + fmt(qi.quantity * qi.unitPrice) + '</td></tr>';
        seq++;
      });
    });
  });
  var ui = items.filter(function(q) {
    return q.roomId === '__utility__';
  });
  if (ui.length) {
    var uT = ui.reduce(function(s, q) {
      return s + q.quantity * q.unitPrice;
    }, 0);
    h += '<tr><td colspan="3" style="padding:7px 4px;font-weight:600;font-size:12px;border-bottom:1px solid #e0e0e0;vertical-align:middle">⚡ 水电暖气下水<span style="float:right;white-space:nowrap">¥' + fmt(uT) + '</span></td></tr>';
    ui.forEach(function(q) {
      h += '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:5px;text-align:center;vertical-align:middle">' + seq + '</td><td style="padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;vertical-align:middle">' + esc(q.name) + '</td><td style="padding:5px;text-align:center;font-weight:500;white-space:nowrap;vertical-align:middle">¥' + fmt(q.quantity * q.unitPrice) + '</td></tr>';
      seq++;
    });
  }
  var citems = items.filter(function(q) {
    return q.roomId === '__custom__';
  });
  if (citems.length) {
    h += '<tr><td colspan="3" style="padding:7px 4px;font-weight:600;font-size:12px;border-bottom:1px solid #e0e0e0;vertical-align:middle">📝 自定义</td></tr>';
    citems.forEach(function(q) {
      h += '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:5px;text-align:center;vertical-align:middle">' + seq + '</td><td style="padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;vertical-align:middle">' + esc(q.name) + '</td><td style="padding:5px;text-align:center;font-weight:500;white-space:nowrap;vertical-align:middle">¥' + fmt(q.quantity * q.unitPrice) + '</td></tr>';
      seq++;
    });
  }
  if (S.productQuoteItems.length) {
    var qm = S.customerInfo.quoteMode || 'full';
    var exCats = qm === 'full' ? PRODUCT_MAIN_CATEGORIES : PRODUCT_MAIN_CATEGORIES.filter(function(mc) {
      return mc.id !== 'equipment' && mc.id !== 'soft_furnishing';
    });
    exCats.forEach(function(mc) {
      var pi = S.productQuoteItems.filter(function(q) {
        return q.mainCategory === mc.id;
      });
      if (!pi.length) return;
      var pT = pi.reduce(function(s, q) {
        return s + q.quantity * q.unitPrice;
      }, 0);
      h += '<tr><td colspan="3" style="padding:7px 4px;font-weight:600;font-size:12px;border-bottom:1px solid #e0e0e0;vertical-align:middle">' + mc.icon + ' ' + mc.name + '<span style="float:right;white-space:nowrap">¥' + fmt(pT) + '</span></td></tr>';
      pi.forEach(function(q) {
        h += '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:5px;text-align:center;vertical-align:middle">' + seq + '</td><td style="padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;vertical-align:middle">' + esc(q.name) + '</td><td style="padding:5px;text-align:center;font-weight:500;white-space:nowrap;vertical-align:middle">¥' + fmt(q.quantity * q.unitPrice) + '</td></tr>';
        seq++;
      });
    });
  }
  h += '</tbody></table>';
  return h;
}

function exportDetailedTable() {
  var colWidths = {
    num: '5%',
    name: '15%',
    qty: '5%',
    unit: '5%',
    price: '12%',
    amount: '12%',
    desc: '46%'
  };
  
  var catOrd = ['防水工程','泥瓦工程','木作工程','油漆工程','墙面工程','地面工程','顶面工程','门窗工程','暖气改造','下水改造','安装工程','楼梯工程','设备产品','定制产品','特殊五金','特殊工艺','背景墙','自定义'];
  
  var colgroupHTML = '<colgroup><col style="width:'+colWidths.num+'"><col style="width:'+colWidths.name+'"><col style="width:'+colWidths.qty+'"><col style="width:'+colWidths.unit+'"><col style="width:'+colWidths.price+'"><col style="width:'+colWidths.amount+'"><col style="width:'+colWidths.desc+'"></colgroup>';
  var h = '<table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:10px;table-layout:fixed">' + colgroupHTML + '<thead><tr style="border-bottom:2px solid #bbb;page-break-inside:avoid"><th style="padding:6px 4px;text-align:center;vertical-align:middle;font-weight:700">序号</th><th style="padding:6px 4px;text-align:center;vertical-align:middle;font-weight:700">项目</th><th style="padding:6px 4px;text-align:center;vertical-align:middle;font-weight:700">数量</th><th style="padding:6px 4px;text-align:center;vertical-align:middle;font-weight:700">单位</th><th style="padding:6px 4px;text-align:center;vertical-align:middle;font-weight:700">单价</th><th style="padding:6px 4px;text-align:center;vertical-align:middle;font-weight:700">金额</th><th style="padding:6px 4px;text-align:center;vertical-align:middle;font-weight:700">说明</th></tr></thead><tbody>';
  
  function dRow(qi, s) {
    return '<tr style="border-bottom:1px solid #d0d0d0;page-break-inside:avoid"><td style="padding:4px 3px;text-align:center;vertical-align:middle;font-size:14px">'+s+'</td><td style="padding:4px 3px;text-align:left;word-wrap:break-word;word-break:break-all;vertical-align:middle;font-size:14px">'+esc(qi.name)+'</td><td style="padding:4px 3px;text-align:center;vertical-align:middle;font-size:14px">'+qi.quantity+'</td><td style="padding:4px 3px;text-align:center;vertical-align:middle;font-size:14px">'+esc(qi.unit)+'</td><td style="padding:4px 3px;text-align:center;white-space:nowrap;vertical-align:middle;font-size:14px">¥'+fmt(qi.unitPrice)+'</td><td style="padding:4px 3px;text-align:center;font-weight:600;white-space:nowrap;vertical-align:middle;font-size:14px">¥'+fmt(qi.quantity*qi.unitPrice)+'</td><td style="padding:4px 3px;color:#666;text-align:left;word-wrap:break-word;word-break:break-all;vertical-align:middle;font-size:14px">'+esc(qi.description||'')+'</td></tr>';
  }
  
  var allSections = [];
  var fg = {};
  S.rooms.forEach(function(r) {
    var f = r.floor || '一楼';
    if (!fg[f]) fg[f] = [];
    fg[f].push(r);
  });
  var floors = Object.keys(fg).sort(function(a, b) {
    return floorSortKey(a) - floorSortKey(b);
  });
  
  floors.forEach(function(fl) {
    var rooms = fg[fl];
    var fi = S.quoteItems.filter(function(q) {
      return rooms.some(function(r) { return r.id === q.roomId; }) && q.category !== '拆除工程' && q.category !== '砌筑工程';
    });
    if (fi.length) {
      allSections.push({ type: 'floor', id: 'floor-'+fl, label: '🏗️ '+fl, items: fi, rooms: rooms });
    }
  });
  
  var demItems = S.quoteItems.filter(function(q) { return q.category === '拆除工程'; });
  if (demItems.length) allSections.push({ type: 'section', id: 'demolition', label: '🔨 拆除工程', items: demItems });
  
  var masItems = S.quoteItems.filter(function(q) { return q.category === '砌筑工程'; });
  if (masItems.length) allSections.push({ type: 'section', id: 'masonry', label: '🧱 砌筑工程', items: masItems });
  
  var ui = S.quoteItems.filter(function(q) { return q.roomId === '__utility__'; });
  if (ui.length) allSections.push({ type: 'section', id: 'utility', label: '⚡ 水电暖气下水', items: ui });
  
  allSections.forEach(function(sec) {
    var sT = sec.items.reduce(function(s, q) { return s + q.quantity * q.unitPrice; }, 0);
    h += '<tr class="section-header" style="page-break-inside:avoid"><td colspan="6" style="padding:7px 3px;font-weight:700;font-size:14px;border-bottom:1px solid #d0d0d0;vertical-align:middle;background:#f5f5f5">'+esc(sec.label)+'</td><td style="text-align:center;font-weight:700;font-size:14px;white-space:nowrap;vertical-align:middle;background:#f5f5f5">¥'+fmt(sT)+'</td></tr>';
    
    if (sec.type === 'floor') {
      sec.rooms.forEach(function(room) {
        var ri = sec.items.filter(function(q) { return q.roomId === room.id; });
        if (!ri.length) return;
        var rT = ri.reduce(function(s, q) { return s + q.quantity * q.unitPrice; }, 0);
        h += '<tr class="section-header" style="page-break-inside:avoid"><td colspan="6" style="padding:5px 3px 5px 14px;font-weight:600;font-size:13px;border-bottom:1px solid #d0d0d0;vertical-align:middle;background:#e8e8e8">📍 '+esc(room.name)+'</td><td style="text-align:center;font-weight:600;font-size:13px;white-space:nowrap;vertical-align:middle;background:#e8e8e8">¥'+fmt(rT)+'</td></tr>';
        
        var seq = 1;
        catOrd.forEach(function(cat) {
          var ci = ri.filter(function(q) { return q.category === cat; });
          if (!ci.length) return;
          var cT = ci.reduce(function(s, q) { return s + q.quantity * q.unitPrice; }, 0);
          h += '<tr style="page-break-inside:avoid"><td colspan="7" style="text-align:left;padding-left:20px;font-size:12px;color:#666;border-bottom:1px solid #d0d0d0;vertical-align:middle">▸ '+cat+'</td></tr>';
          ci.forEach(function(qi) {
            h += dRow(qi, seq++);
          });
        });
      });
    } else {
      var seq = 1;
      sec.items.forEach(function(q) {
        h += dRow(q, seq++);
      });
    }
  });
  
  var ci2 = S.quoteItems.filter(function(q) { return q.roomId === '__custom__'; });
  if (ci2.length) {
    h += '<tr style="page-break-inside:avoid"><td colspan="7" style="padding:6px 3px;font-weight:600;font-size:13px;border-bottom:1px solid #d0d0d0;vertical-align:middle;background:#f5f5f5">📝 自定义</td></tr>';
    var cs = 1;
    ci2.forEach(function(q) {
      h += dRow(q, cs++);
    });
  }
  
  if (S.productQuoteItems.length) {
    var qm = S.customerInfo.quoteMode || 'full';
    var showCats = qm === 'full' ? PRODUCT_MAIN_CATEGORIES : PRODUCT_MAIN_CATEGORIES.filter(function(mc) {
      return mc.id !== 'equipment' && mc.id !== 'soft_furnishing';
    });
    
    showCats.forEach(function(mc) {
      var pi = S.productQuoteItems.filter(function(q) { return q.mainCategory === mc.id; });
      if (!pi.length) return;
      var pT = pi.reduce(function(s, q) { return s + q.quantity * q.unitPrice; }, 0);
      h += '<tr style="page-break-inside:avoid"><td colspan="7" style="padding:6px 3px;font-weight:600;font-size:13px;border-bottom:1px solid #d0d0d0;vertical-align:middle;background:#f5f5f5">'+mc.icon+' '+mc.name+'</td></tr>';
      
      var subG = {};
      pi.forEach(function(q) {
        if (!subG[q.subCategory]) subG[q.subCategory] = [];
        subG[q.subCategory].push(q);
      });
      
      var ps = 1;
      Object.keys(subG).forEach(function(subId) {
        var subI = subG[subId];
        var sT = subI.reduce(function(s, q) { return s + q.quantity * q.unitPrice; }, 0);
        h += '<tr style="page-break-inside:avoid"><td colspan="7" style="text-align:left;padding-left:20px;font-size:12px;color:#666;border-bottom:1px solid #d0d0d0;vertical-align:middle">▸ '+getSubCatLabel(mc.id, subId)+'</td></tr>';
        subI.forEach(function(q) {
          h += dRow(q, ps++);
        });
      });
    });
  }
  
  h += '</tbody></table>';
  return h;
}
