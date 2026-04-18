// 虚拟滚动模块
var VirtualScroll = {
  container: null,
  content: null,
  rows: [],
  rowHeight: 40, // 预估行高
  visibleRows: 0,
  startIndex: 0,
  endIndex: 0,
  paddingTop: 0,
  paddingBottom: 0,
  
  init: function(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    // 设置容器样式
    this.container.style.overflowY = 'auto';
    this.container.style.position = 'relative';
    
    // 创建内容容器
    this.content = document.createElement('div');
    this.content.style.position = 'relative';
    this.container.appendChild(this.content);
    
    // 监听滚动事件
    this.container.addEventListener('scroll', this.onScroll.bind(this));
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.calculateVisibleRows.bind(this));
    
    // 初始计算
    this.calculateVisibleRows();
  },
  
  calculateVisibleRows: function() {
    if (!this.container) return;
    var containerHeight = this.container.clientHeight;
    this.visibleRows = Math.ceil(containerHeight / this.rowHeight) + 2; // 额外渲染2行作为缓冲
    
    // 更新渲染
    this.update();
  },
  
  setRows: function(rows) {
    this.rows = rows;
    this.updateTotalHeight();
    this.update();
  },
  
  updateTotalHeight: function() {
    if (!this.content) return;
    var totalHeight = this.rows.length * this.rowHeight;
    this.content.style.height = totalHeight + 'px';
  },
  
  onScroll: function() {
    if (!this.container) return;
    var scrollTop = this.container.scrollTop;
    this.startIndex = Math.floor(scrollTop / this.rowHeight);
    this.endIndex = Math.min(this.startIndex + this.visibleRows, this.rows.length);
    this.update();
  },
  
  update: function() {
    if (!this.content || !this.rows.length) return;
    
    // 计算可见范围
    this.startIndex = Math.max(0, this.startIndex);
    this.endIndex = Math.min(this.startIndex + this.visibleRows, this.rows.length);
    
    // 计算padding
    this.paddingTop = this.startIndex * this.rowHeight;
    this.paddingBottom = (this.rows.length - this.endIndex) * this.rowHeight;
    
    // 获取可见行
    var visibleRows = this.rows.slice(this.startIndex, this.endIndex);
    
    // 渲染可见行
    this.renderVisibleRows(visibleRows);
  },
  
  renderVisibleRows: function(visibleRows) {
    if (!this.content) return;
    
    // 清空内容
    this.content.innerHTML = '';
    
    // 添加上方padding
    var topPadding = document.createElement('div');
    topPadding.style.height = this.paddingTop + 'px';
    this.content.appendChild(topPadding);
    
    // 添加可见行
    visibleRows.forEach(function(row, index) {
      var rowElement = document.createElement('div');
      rowElement.style.height = this.rowHeight + 'px';
      rowElement.style.position = 'absolute';
      rowElement.style.top = (this.paddingTop + index * this.rowHeight) + 'px';
      rowElement.style.width = '100%';
      rowElement.style.overflow = 'hidden';
      
      // 设置行内容
      if (typeof row.html === 'function') {
        rowElement.innerHTML = row.html();
      } else if (typeof row.html === 'string') {
        rowElement.innerHTML = row.html;
      } else {
        rowElement.innerHTML = row.toString();
      }
      
      this.content.appendChild(rowElement);
    }, this);
    
    // 添加下方padding
    var bottomPadding = document.createElement('div');
    bottomPadding.style.height = this.paddingBottom + 'px';
    this.content.appendChild(bottomPadding);
  },
  
  scrollToIndex: function(index) {
    if (!this.container) return;
    var scrollTop = index * this.rowHeight;
    this.container.scrollTop = scrollTop;
  },
  
  refresh: function() {
    this.calculateVisibleRows();
    this.update();
  }
};

// 报价表格虚拟滚动适配器
var QuoteTableVirtualScroll = {
  virtualScroll: null,
  rowsData: [],
  
  init: function() {
    this.virtualScroll = Object.create(VirtualScroll);
    this.virtualScroll.init('quoteTableWrapper');
    this.virtualScroll.rowHeight = 42; // 报价表格行高
    
    // 初始渲染
    this.collectRows();
    this.virtualScroll.setRows(this.rowsData);
  },
  
  collectRows: function() {
    this.rowsData = [];
    
    // 收集所有行数据
    // 注意：这是一个简化的示例，需要根据实际数据结构实现
    
    // 添加空状态行
    if (!S.rooms.length && !S.quoteItems.length && !S.productQuoteItems.length) {
      this.rowsData.push({
        type: 'empty',
        html: '<div class="empty-state"><div class="icon">📋</div><p>添加房间后自动生成</p></div>'
      });
      return;
    }
    
    // 这里需要调用原始的收集逻辑
    // 暂时使用占位符
    this.rowsData.push({
      type: 'placeholder',
      html: '<div style="padding: 20px; text-align: center;">虚拟滚动功能开发中...</div>'
    });
  },
  
  refresh: function() {
    this.collectRows();
    if (this.virtualScroll) {
      this.virtualScroll.setRows(this.rowsData);
    }
  }
};