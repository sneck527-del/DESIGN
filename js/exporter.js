// 导出模块
function exportPDF(version) {
  if (!S.currentFileId) {
    showToast('请先打开报价文件');
    return;
  }
  var ci = S.customerInfo;
  var labels = { luxury: '奢享全案', premium: '优享精造' };
  var totals = calcQuoteTotal();
  var el = document.createElement('div');
  el.style.cssText = 'position:absolute;left:-9999px;top:0;padding:0;margin:0;font-family:"Microsoft YaHei",sans-serif;color:#222;background:#fff;width:794px';
  if (version === 'simple') {
    el.innerHTML = simpleExportHTML(ci, labels, totals);
  } else {
    el.innerHTML = detailedExportHTML(ci, labels, totals);
  }
  document.body.appendChild(el);
  html2pdf().set({
    margin: [8, 5, 8, 5],
    filename: '报价单-' + (version === 'simple' ? '简约' : '详细') + '版.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, width: 794, windowWidth: 794 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).from(el).save().then(function() {
    document.body.removeChild(el);
  }).catch(function(e) {
    console.error(e);
    document.body.removeChild(el);
  });
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
  return '<div style="text-align:center;margin-bottom:16px"><div style="font-size:22px;font-weight:700;letter-spacing:2px">斑马精装报价单</div><div style="font-size:12px;color:#888;margin-top:2px">' + (labels[S.currentPlan] || '') + ' · ' + (modeLabels[qm] || '全案落地') + '</div></div><table style="width:100%;font-size:12px;border-collapse:collapse;margin-bottom:12px"><tr><td style="width:25%;padding:4px 0;border-bottom:1px solid #e0e0e0"><b>客户：</b>' + esc(ci.name) + '</td><td style="width:25%;padding:4px 0;border-bottom:1px solid #e0e0e0"><b>联系方式：</b>' + esc(ci.phone) + '</td><td style="width:25%;padding:4px 0;border-bottom:1px solid #e0e0e0"><b>设计师：</b>' + esc(ci.designer) + '</td><td style="width:25%;padding:4px 0;border-bottom:1px solid #e0e0e0"><b>设计师电话：</b>' + esc(ci.designerPhone) + '</td></tr><tr><td colspan="2" style="padding:4px 0;border-bottom:1px solid #e0e0e0"><b>地址：</b>' + esc(ci.address) + '</td><td style="padding:4px 0;border-bottom:1px solid #e0e0e0"><b>工艺标准：</b>' + (labels[S.currentPlan] || '') + '</td><td style="padding:4px 0;border-bottom:1px solid #e0e0e0"><b>报价模式：</b>' + (modeLabels[qm] || '全案落地') + '</td></tr><tr><td colspan="2" style="padding:4px 0"><b>面积：</b>' + esc(ci.area) + '㎡</td><td style="padding:4px 0"><b>日期：</b>' + esc(ci.date) + '</td><td></td></tr></table>';
}

function exportSummaryHTML(totals) {
  return '<div style="margin-top:14px"><table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="border-bottom:1px solid #e0e0e0"><td style="padding:6px 0">工程报价</td><td style="padding:6px 0;text-align:center;font-weight:600;white-space:nowrap">¥' + fmt(totals.engTotal) + '</td></tr>' + (totals.prodTotal > 0 ? '<tr style="border-bottom:1px solid #e0e0e0"><td style="padding:6px 0">产品清单</td><td style="padding:6px 0;text-align:center;font-weight:600;white-space:nowrap">¥' + fmt(totals.prodTotal) + '</td></tr>' : '') + '<tr style="border-bottom:1px solid #e0e0e0"><td style="padding:6px 0">直接费用</td><td style="padding:6px 0;text-align:center;font-weight:600;white-space:nowrap">¥' + fmt(totals.subtotal) + '</td></tr><tr style="border-bottom:1px solid #e0e0e0"><td style="padding:6px 0">管理费 (' + S.managementFeeRate + '%)</td><td style="padding:6px 0;text-align:center;white-space:nowrap">¥' + fmt(totals.mgmt) + '</td></tr><tr style="border-bottom:1px solid #e0e0e0"><td style="padding:6px 0">税金 (' + S.taxRate + '%)</td><td style="padding:6px 0;text-align:center;white-space:nowrap">¥' + fmt(totals.tax) + '</td></tr><tr style="border-bottom:1px solid #e0e0e0"><td style="padding:6px 0">垃圾清运</td><td style="padding:6px 0;text-align:center;white-space:nowrap">¥' + fmt(S.garbageFee) + '</td></tr><tr style="border-bottom:1px solid #e0e0e0"><td style="padding:6px 0">成品保护</td><td style="padding:6px 0;text-align:center;white-space:nowrap">¥' + fmt(S.protectionFee) + '</td></tr><tr><td style="padding:8px 0;font-size:14px;font-weight:700;border-top:2px solid #333">报价总计</td><td style="padding:8px 0;text-align:center;font-size:16px;font-weight:700;color:#c00;border-top:2px solid #333;white-space:nowrap">¥' + fmt(totals.grandTotal) + '</td></tr></table></div>';
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
  var h = '<table style="width:100%;border-collapse:collapse;font-size:11px;margin-top:10px;table-layout:auto"><thead><tr style="border-bottom:2px solid #bbb"><th style="padding:6px 4px;text-align:center;width:32px">序号</th><th style="padding:6px 4px;text-align:center">项目</th><th style="padding:6px 4px;text-align:center;white-space:nowrap;min-width:80px">金额</th></tr></thead><tbody>';
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
    h += '<tr><td colspan="3" style="padding:7px 4px;font-weight:600;font-size:12px;border-bottom:1px solid #e0e0e0">🏗️ ' + esc(fl) + '<span style="float:right;white-space:nowrap">¥' + fmt(fT) + '</span></td></tr>';
    rooms.forEach(function(room) {
      var ri = fi.filter(function(q) {
        return q.roomId === room.id;
      });
      if (!ri.length) return;
      var rT = ri.reduce(function(s, q) {
        return s + q.quantity * q.unitPrice;
      }, 0);
      h += '<tr><td colspan="3" style="padding:5px 4px 5px 16px;font-weight:600;border-bottom:1px solid #f0f0f0">📍 ' + esc(room.name) + '<span style="float:right;white-space:nowrap">¥' + fmt(rT) + '</span></td></tr>';
      ri.forEach(function(qi) {
        h += '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:4px;text-align:center">' + seq + '</td><td style="padding:4px">' + esc(qi.name) + '</td><td style="padding:4px;text-align:center;font-weight:500;white-space:nowrap">¥' + fmt(qi.quantity * qi.unitPrice) + '</td></tr>';
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
    h += '<tr><td colspan="3" style="padding:7px 4px;font-weight:600;font-size:12px;border-bottom:1px solid #e0e0e0">⚡ 水电暖气下水<span style="float:right;white-space:nowrap">¥' + fmt(uT) + '</span></td></tr>';
    ui.forEach(function(q) {
      h += '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:4px;text-align:center">' + seq + '</td><td style="padding:4px">' + esc(q.name) + '</td><td style="padding:4px;text-align:center;font-weight:500;white-space:nowrap">¥' + fmt(q.quantity * q.unitPrice) + '</td></tr>';
      seq++;
    });
  }
  var citems = items.filter(function(q) {
    return q.roomId === '__custom__';
  });
  if (citems.length) {
    h += '<tr><td colspan="3" style="padding:7px 4px;font-weight:600;font-size:12px;border-bottom:1px solid #e0e0e0">📝 自定义</td></tr>';
    citems.forEach(function(q) {
      h += '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:4px;text-align:center">' + seq + '</td><td style="padding:4px">' + esc(q.name) + '</td><td style="padding:4px;text-align:center;font-weight:500;white-space:nowrap">¥' + fmt(q.quantity * q.unitPrice) + '</td></tr>';
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
      h += '<tr><td colspan="3" style="padding:7px 4px;font-weight:600;font-size:12px;border-bottom:1px solid #e0e0e0">' + mc.icon + ' ' + mc.name + '<span style="float:right;white-space:nowrap">¥' + fmt(pT) + '</span></td></tr>';
      pi.forEach(function(q) {
        h += '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:4px;text-align:center">' + seq + '</td><td style="padding:4px">' + esc(q.name) + '</td><td style="padding:4px;text-align:center;font-weight:500;white-space:nowrap">¥' + fmt(q.quantity * q.unitPrice) + '</td></tr>';
        seq++;
      });
    });
  }
  h += '</tbody></table>';
  return h;
}

function exportDetailedTable() {
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
  var h = '<table style="width:100%;border-collapse:collapse;font-size:10px;margin-top:10px;table-layout:fixed"><colgroup><col style="width:32px"><col><col style="width:42px"><col style="width:36px"><col style="width:60px"><col style="width:70px"><col></colgroup><thead><tr style="border-bottom:2px solid #bbb"><th style="padding:5px 3px;text-align:center">序号</th><th style="padding:5px 3px;text-align:center">项目</th><th style="padding:5px 3px;text-align:center">数量</th><th style="padding:5px 3px;text-align:center">单位</th><th style="padding:5px 3px;text-align:center">单价</th><th style="padding:5px 3px;text-align:center">金额</th><th style="padding:5px 3px;text-align:center">说明</th></tr></thead><tbody>';
  function dRow(qi, s) {
    return '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:3px 2px;text-align:center">' + s + '</td><td style="padding:3px 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(qi.name) + '</td><td style="padding:3px 2px;text-align:center">' + qi.quantity + '</td><td style="padding:3px 2px;text-align:center">' + esc(qi.unit) + '</td><td style="padding:3px 2px;text-align:center;white-space:nowrap">¥' + fmt(qi.unitPrice) + '</td><td style="padding:3px 2px;text-align:center;font-weight:600;white-space:nowrap">¥' + fmt(qi.quantity * qi.unitPrice) + '</td><td style="padding:3px 2px;color:#666;font-size:9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(qi.description || '') + '</td></tr>';
  }
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
    h += '<tr><td colspan="5" style="padding:6px 3px;font-weight:600;font-size:11px;border-bottom:1px solid #e0e0e0">🏗️ ' + esc(fl) + '</td><td></td><td style="text-align:right;font-weight:600;white-space:nowrap">¥' + fmt(fT) + '</td></tr>';
    rooms.forEach(function(room) {
      var ri = fi.filter(function(q) {
        return q.roomId === room.id;
      });
      if (!ri.length) return;
      var rT = ri.reduce(function(s, q) {
        return s + q.quantity * q.unitPrice;
      }, 0);
      h += '<tr><td colspan="5" style="padding:4px 3px 4px 14px;font-weight:600;border-bottom:1px solid #f0f0f0">📍 ' + esc(room.name) + '</td><td></td><td style="text-align:right;font-weight:600;white-space:nowrap">¥' + fmt(rT) + '</td></tr>';
      ri.forEach(function(qi) {
        h += dRow(qi, seq++);
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
    h += '<tr><td colspan="7" style="padding:6px 3px;font-weight:600;font-size:11px;border-bottom:1px solid #e0e0e0">⚡ 水电暖气下水<span style="float:right;white-space:nowrap">¥' + fmt(uT) + '</span></td></tr>';
    ui.forEach(function(q) {
      h += dRow(q, seq++);
    });
  }
  var citems = items.filter(function(q) {
    return q.roomId === '__custom__';
  });
  if (citems.length) {
    h += '<tr><td colspan="7" style="padding:6px 3px;font-weight:600;font-size:11px;border-bottom:1px solid #e0e0e0">📝 自定义</td></tr>';
    citems.forEach(function(q) {
      h += dRow(q, seq++);
    });
  }
  if (S.productQuoteItems.length) {
    var qm2 = S.customerInfo.quoteMode || 'full';
    var exCats2 = qm2 === 'full' ? PRODUCT_MAIN_CATEGORIES : PRODUCT_MAIN_CATEGORIES.filter(function(mc) {
      return mc.id !== 'equipment' && mc.id !== 'soft_furnishing';
    });
    exCats2.forEach(function(mc) {
      var pi = S.productQuoteItems.filter(function(q) {
        return q.mainCategory === mc.id;
      });
      if (!pi.length) return;
      var pT = pi.reduce(function(s, q) {
        return s + q.quantity * q.unitPrice;
      }, 0);
      h += '<tr><td colspan="7" style="padding:6px 3px;font-weight:600;font-size:11px;border-bottom:1px solid #e0e0e0">' + mc.icon + ' ' + mc.name + '<span style="float:right;white-space:nowrap">¥' + fmt(pT) + '</span></td></tr>';
      pi.forEach(function(q) {
        h += dRow(q, seq++);
      });
    });
  }
  h += '</tbody></table>';
  return h;
}

function getSubCatLabel(mcId, scId) {
  var mc = PRODUCT_MAIN_CATEGORIES.find(function(c) {
    return c.id === mcId;
  });
  if (!mc) return scId;
  var s = mc.subcategories.find(function(c) {
    return c.id === scId;
  });
  return s ? s.name : scId;
}

function exportExcel() {
  if (!S.currentFileId) {
    showToast('请先打开报价文件');
    return;
  }
  if (typeof XLSX === 'undefined') {
    showToast('Excel组件加载中，请稍后重试');
    return;
  }
  var ci = S.customerInfo;
  var labels = { luxury: '奢享全案', premium: '优享精造' };
  var totals = calcQuoteTotal();
  var rows = [];
  var merges = [];
  var R = 0;
  var COLS = 7;
  function addRow(cells, mergeRange) {
    rows.push(cells);
    if (mergeRange) merges.push(mergeRange);
    R++;
  }
  function mergeRow(r, c1, c2) {
    merges.push({ s: { r: r, c: c1 }, e: { r: r, c: c2 } });
  }
  function emptyRow() {
    addRow(Array(COLS).fill(''));
  }
  function titleRow(text) {
    var r = Array(COLS).fill('');
    r[0] = text;
    addRow(r);
    mergeRow(R - 1, 0, COLS - 1);
  }
  addRow(['斑马精装报价单']);
  mergeRow(0, 0, COLS - 1);
  addRow([labels[S.currentPlan] || '']);
  mergeRow(R - 1, 0, COLS - 1);
  emptyRow();
  addRow(['客户：' + (ci.name || ''), '联系方式：' + (ci.phone || ''), '设计师：' + (ci.designer || ''), '设计师电话：' + (ci.designerPhone || '')]);
  mergeRow(R - 1, 0, 1);
  mergeRow(R - 1, 2, 3);
  mergeRow(R - 1, 4, 6);
  addRow(['地址：' + (ci.address || ''), '', '工艺标准：' + (labels[S.currentPlan] || ''), '日期：' + (ci.date || ''), '面积：' + (ci.area || '') + '㎡']);
  mergeRow(R - 1, 0, 1);
  mergeRow(R - 1, 4, 6);
  emptyRow();
  addRow(['序号', '项目', '数量', '单位', '单价', '金额', '说明']);
  var seq = 1;
  var catOrd = ['防水工程', '泥瓦工程', '木作工程', '油漆工程', '墙面工程', '地面工程', '顶面工程', '门窗工程', '暖气改造', '下水改造', '安装工程', '楼梯工程', '设备产品', '定制产品', '特殊五金', '特殊工艺', '背景墙', '自定义'];
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
      return rooms.some(function(r) {
        return r.id === q.roomId;
      }) && q.category !== '拆除工程' && q.category !== '砌筑工程';
    });
    if (!fi.length) return;
    var fT = fi.reduce(function(s, q) {
      return s + q.quantity * q.unitPrice;
    }, 0);
    var r1 = Array(COLS).fill('');
    r1[0] = '🏗️ ' + fl;
    r1[5] = '¥' + fmt(fT);
    addRow(r1);
    mergeRow(R - 1, 0, 4);
    mergeRow(R - 1, 5, 6);
    rooms.forEach(function(room) {
      var ri = fi.filter(function(q) {
        return q.roomId === room.id;
      });
      if (!ri.length) return;
      var rT = ri.reduce(function(s, q) {
        return s + q.quantity * q.unitPrice;
      }, 0);
      var r2 = Array(COLS).fill('');
      r2[0] = '📍 ' + room.name;
      r2[5] = '¥' + fmt(rT);
      addRow(r2);
      mergeRow(R - 1, 0, 4);
      mergeRow(R - 1, 5, 6);
      catOrd.forEach(function(cat) {
        var cItems = ri.filter(function(q) {
          return q.category === cat;
        });
        if (!cItems.length) return;
        var cT = cItems.reduce(function(s, q) {
          return s + q.quantity * q.unitPrice;
        }, 0);
        var r3 = Array(COLS).fill('');
        r3[1] = '▸ ' + cat;
        r3[5] = '¥' + fmt(cT);
        addRow(r3);
        cItems.forEach(function(qi) {
          addRow([seq, qi.name, qi.quantity, qi.unit, qi.unitPrice, qi.quantity * qi.unitPrice, qi.description || '']);
          seq++;
        });
      });
    });
  });
  var demItems = S.quoteItems.filter(function(q) {
    return q.category === '拆除工程';
  });
  if (demItems.length) {
    var dT = demItems.reduce(function(s, q) {
      return s + q.quantity * q.unitPrice;
    }, 0);
    var rd = Array(COLS).fill('');
    rd[0] = '🔨 拆除工程';
    rd[5] = '¥' + fmt(dT);
    addRow(rd);
    mergeRow(R - 1, 0, 4);
    mergeRow(R - 1, 5, 6);
    demItems.forEach(function(q) {
      addRow([seq, q.name, q.quantity, q.unit, q.unitPrice, q.quantity * q.unitPrice, q.description || '']);
      seq++;
    });
  }
  var masItems = S.quoteItems.filter(function(q) {
    return q.category === '砌筑工程';
  });
  if (masItems.length) {
    var mT = masItems.reduce(function(s, q) {
      return s + q.quantity * q.unitPrice;
    }, 0);
    var rm = Array(COLS).fill('');
    rm[0] = '🧱 砌筑工程';
    rm[5] = '¥' + fmt(mT);
    addRow(rm);
    mergeRow(R - 1, 0, 4);
    mergeRow(R - 1, 5, 6);
    masItems.forEach(function(q) {
      addRow([seq, q.name, q.quantity, q.unit, q.unitPrice, q.quantity * q.unitPrice, q.description || '']);
      seq++;
    });
  }
  var ui = S.quoteItems.filter(function(q) {
    return q.roomId === '__utility__';
  });
  if (ui.length) {
    var uT = ui.reduce(function(s, q) {
      return s + q.quantity * q.unitPrice;
    }, 0);
    var ru = Array(COLS).fill('');
    ru[0] = '⚡ 水电暖气下水';
    ru[5] = '¥' + fmt(uT);
    addRow(ru);
    mergeRow(R - 1, 0, 4);
    mergeRow(R - 1, 5, 6);
    ui.forEach(function(q) {
      addRow([seq, q.name, q.quantity, q.unit, q.unitPrice, q.quantity * q.unitPrice, q.description || '']);
      seq++;
    });
  }
  var ci2 = S.quoteItems.filter(function(q) {
    return q.roomId === '__custom__';
  });
  if (ci2.length) {
    var rc = Array(COLS).fill('');
    rc[0] = '📝 自定义';
    addRow(rc);
    mergeRow(R - 1, 0, COLS - 1);
    ci2.forEach(function(q) {
      addRow([seq, q.name, q.quantity, q.unit, q.unitPrice, q.quantity * q.unitPrice, q.description || '']);
      seq++;
    });
  }
  if (S.productQuoteItems.length) {
    PRODUCT_MAIN_CATEGORIES.forEach(function(mc) {
      var pi = S.productQuoteItems.filter(function(q) {
        return q.mainCategory === mc.id;
      });
      if (!pi.length) return;
      var pT = pi.reduce(function(s, q) {
        return s + q.quantity * q.unitPrice;
      }, 0);
      var rp = Array(COLS).fill('');
      rp[0] = mc.icon + ' ' + mc.name;
      rp[5] = '¥' + fmt(pT);
      addRow(rp);
      mergeRow(R - 1, 0, 4);
      mergeRow(R - 1, 5, 6);
      var subG = {};
      pi.forEach(function(q) {
        if (!subG[q.subCategory]) subG[q.subCategory] = [];
        subG[q.subCategory].push(q);
      });
      Object.keys(subG).forEach(function(subId) {
        var subI = subG[subId];
        var sT = subI.reduce(function(s, q) {
          return s + q.quantity * q.unitPrice;
        }, 0);
        var rs = Array(COLS).fill('');
        rs[1] = '▸ ' + getSubCatLabel(mc.id, subId);
        rs[5] = '¥' + fmt(sT);
        addRow(rs);
        subI.forEach(function(q) {
          addRow([seq, q.name, q.quantity, q.unit, q.unitPrice, q.quantity * q.unitPrice, q.description || '']);
          seq++;
        });
      });
    });
  }
  emptyRow();
  addRow(['工程报价', '', '', '', totals.engTotal, '']);
  mergeRow(R - 1, 0, 4);
  if (totals.prodTotal > 0) {
    addRow(['产品清单', '', '', '', totals.prodTotal, '']);
    mergeRow(R - 1, 0, 4);
    PRODUCT_MAIN_CATEGORIES.forEach(function(mc) {
      var t = S.productQuoteItems.filter(function(q) {
        return q.mainCategory === mc.id;
      }).reduce(function(s, q) {
        return s + q.quantity * q.unitPrice;
      }, 0);
      if (t > 0) {
        addRow(['  ' + mc.icon + ' ' + mc.name, '', '', '', t, '']);
        mergeRow(R - 1, 0, 4);
      }
    });
  }
  addRow(['直接费用合计', '', '', '', totals.subtotal, '']);
  mergeRow(R - 1, 0, 4);
  addRow(['管理费 (' + S.managementFeeRate + '%)', '', '', '', totals.mgmt, '']);
  mergeRow(R - 1, 0, 4);
  addRow(['税金 (' + S.taxRate + '%)', '', '', '', totals.tax, '']);
  mergeRow(R - 1, 0, 4);
  addRow(['垃圾清运', '', '', '', S.garbageFee, '']);
  mergeRow(R - 1, 0, 4);
  addRow(['成品保护', '', '', '', S.protectionFee, '']);
  mergeRow(R - 1, 0, 4);
  addRow(['报价总计', '', '', '', totals.grandTotal, '']);
  mergeRow(R - 1, 0, 4);
  var ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!merges'] = merges;
  ws['!cols'] = [{ wch: 6 }, { wch: 28 }, { wch: 8 }, { wch: 6 }, { wch: 10 }, { wch: 14 }, { wch: 40 }];
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '报价单');
  XLSX.writeFile(wb, '报价单-' + (ci.address || '详细') + '版.xlsx');
  showToast('已导出Excel');
}

function exportCategoryQuote(categoryId) {
  if (!S.currentFileId) {
    showToast('请先打开报价文件');
    return;
  }
  if (typeof XLSX === 'undefined') {
    showToast('Excel组件加载中，请稍后重试');
    return;
  }
  var mc = PRODUCT_MAIN_CATEGORIES.find(function(c) {
    return c.id === categoryId;
  });
  if (!mc) {
    showToast('未找到分类');
    return;
  }
  var ci = S.customerInfo;
  var labels = { luxury: '奢享全案', premium: '优享精造' };
  var products = S.productQuoteItems.filter(function(q) {
    return q.mainCategory === categoryId;
  });
  if (!products.length) {
    showToast(mc.name + '分类暂无产品');
    return;
  }
  var rows = [];
  var merges = [];
  var R = 0;
  var COLS = 10;
  function addRow(cells) {
    rows.push(cells);
    R++;
  }
  function mergeRow(r, c1, c2) {
    merges.push({ s: { r: r, c: c1 }, e: { r: r, c: c2 } });
  }
  function emptyRow() {
    addRow(Array(COLS).fill(''));
  }
  addRow([mc.icon + ' ' + mc.name + '报价单']);
  mergeRow(0, 0, COLS - 1);
  addRow([labels[S.currentPlan] || '']);
  mergeRow(R - 1, 0, COLS - 1);
  emptyRow();
  addRow(['客户：' + (ci.name || ''), '联系方式：' + (ci.phone || ''), '设计师：' + (ci.designer || ''), '设计师电话：' + (ci.designerPhone || '')]);
  mergeRow(R - 1, 0, 1);
  mergeRow(R - 1, 2, 3);
  mergeRow(R - 1, 4, 9);
  addRow(['地址：' + (ci.address || ''), '', '日期：' + (ci.date || ''), '', '面积：' + (ci.area || '') + '㎡']);
  mergeRow(R - 1, 0, 3);
  mergeRow(R - 1, 4, 9);
  emptyRow();
  addRow(['序号', '项目名称', '品牌', '型号', '规格', '数量', '单位', '单价', '金额', '说明']);
  var seq = 1;
  var totalAmount = 0;
  var subG = {};
  products.forEach(function(q) {
    if (!subG[q.subCategory]) subG[q.subCategory] = [];
    subG[q.subCategory].push(q);
  });
  Object.keys(subG).forEach(function(subId) {
    var subI = subG[subId];
    var sT = subI.reduce(function(s, q) {
      return s + q.quantity * q.unitPrice;
    }, 0);
    var r1 = Array(COLS).fill('');
    r1[0] = '▸ ' + getSubCatLabel(categoryId, subId);
    r1[8] = '¥' + fmt(sT);
    addRow(r1);
    mergeRow(R - 1, 0, 7);
    mergeRow(R - 1, 8, 9);
    subI.forEach(function(q) {
      var amt = q.quantity * q.unitPrice;
      totalAmount += amt;
      addRow([seq, q.name, q.brand || '', q.model || '', q.specifications || '', q.quantity, q.unit, q.unitPrice, amt, q.description || '']);
      seq++;
    });
  });
  emptyRow();
  addRow(['合计', '', '', '', '', '', '', '', '¥' + fmt(totalAmount), '']);
  mergeRow(R - 1, 0, 7);
  var ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!merges'] = merges;
  ws['!cols'] = [{ wch: 6 }, { wch: 24 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 8 }, { wch: 6 }, { wch: 10 }, { wch: 12 }, { wch: 30 }];
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, mc.name);
  XLSX.writeFile(wb, mc.name + '报价单-' + (ci.address || '详细') + '版.xlsx');
  showToast('已导出' + mc.name + '报价单');
}