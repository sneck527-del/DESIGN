// 工具函数模块
var FLOOR_ORDER = ['一楼', '二楼', '三楼', '四楼', '五楼', '负一楼', '负二楼', '阁楼'];
var _collapseState = {};

function floorSortKey(f) {
  if (typeof S !== 'undefined' && S.floorOrder && S.floorOrder.length > 0) {
    var i = S.floorOrder.indexOf(f);
    if (i >= 0) return i;
  }
  var i = FLOOR_ORDER.indexOf(f);
  return i >= 0 ? i : 999;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function fmt(n) {
  return isNaN(n) ? '0' : Math.round(Number(n)).toString();
}

function fmtK(n) {
  return n >= 10000 ? Math.round(n / 10000) + '万' : fmt(n);
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() {
    t.classList.remove('show');
  }, 2000);
}

function formatDate(ts) {
  if (!ts) return '';
  var d = new Date(ts);
  return d.getFullYear() + '-' + 
         String(d.getMonth() + 1).padStart(2, '0') + '-' + 
         String(d.getDate()).padStart(2, '0') + ' ' + 
         String(d.getHours()).padStart(2, '0') + ':' + 
         String(d.getMinutes()).padStart(2, '0');
}

function closeAllMenus() {
  document.querySelectorAll('.export-menu').forEach(function(m) {
    m.classList.remove('show');
  });
}

// 防抖函数，用于优化频繁触发的事件
function debounce(func, wait) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      func.apply(context, args);
    }, wait);
  };
}

// 节流函数，用于限制事件触发频率
function throttle(func, limit) {
  var inThrottle;
  return function() {
    var context = this, args = arguments;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(function() {
        inThrottle = false;
      }, limit);
    }
  };
}

// 实时计算反馈：显示计算中的状态
function showCalculatingIndicator() {
  var el = document.getElementById('calculatingIndicator');
  if (!el) {
    el = document.createElement('div');
    el.id = 'calculatingIndicator';
    el.style.cssText = 'position:fixed;bottom:20px;right:20px;background:var(--accent);color:white;padding:8px 16px;border-radius:8px;z-index:1000;font-size:12px;display:none;';
    document.body.appendChild(el);
  }
  el.textContent = '计算中...';
  el.style.display = 'block';
  setTimeout(function() {
    el.style.display = 'none';
  }, 500);
}