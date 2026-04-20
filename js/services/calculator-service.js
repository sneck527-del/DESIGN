// AI 计算器模块
// 处理 AI 计算器功能

(function() {

  window.showAICalculator = function() {
    if (document.getElementById('aiCalculatorWindow')) {
      document.getElementById('aiCalculatorWindow').style.display = 'flex';
      return;
    }

    var calcWindow = document.createElement('div');
    calcWindow.id = 'aiCalculatorWindow';
    calcWindow.className = 'ai-calculator-window';
    calcWindow.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 340px;
      background: var(--card);
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      z-index: 2000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Microsoft YaHei', sans-serif;
    `;

    // 标题栏
    var header = document.createElement('div');
    header.className = 'calc-header';
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: var(--accent);
      color: white;
      cursor: move;
      user-select: none;
    `;
    header.innerHTML = `
      <div style="font-weight: 600; font-size: 14px;">🤖 AI 计算器</div>
      <div style="display: flex; gap: 6px;">
        <button class="calc-btn-minimize" style="background: transparent; border: none; color: white; font-size: 16px; cursor: pointer;">─</button>
        <button class="calc-btn-close" style="background: transparent; border: none; color: white; font-size: 16px; cursor: pointer;">×</button>
      </div>
    `;

    // 内容区域
    var content = document.createElement('div');
    content.className = 'calc-content';
    content.style.cssText = `
      padding: 16px;
      flex: 1;
      overflow-y: auto;
    `;

    // 添加计算器按钮样式
    var style = document.createElement('style');
    style.textContent = `
      .calc-btn {
        aspect-ratio: 1 / 1;
        border-radius: 4px;
        border: none;
        background: var(--input-bg);
        color: var(--text);
        font-size: 16px;
        font-weight: 400;
        cursor: pointer;
        transition: background 0.1s;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 0;
      }
      .calc-btn:hover { background: var(--hover-bg); }
      .calc-btn:active { background: var(--border-strong); }
      .result-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 13px; }
      .result-label { color: var(--text-dim); min-width: 40px; }
      .result-value { font-weight: 600; color: var(--accent); background: var(--hover-bg); padding: 2px 6px; border-radius: 4px; font-family: monospace; user-select: all; cursor: text; }
    `;
    content.appendChild(style);

    // 标签页
    var tabs = document.createElement('div');
    tabs.className = 'calc-tabs';
    tabs.style.cssText = `
      display: flex;
      border-bottom: 1px solid var(--border-strong);
      margin-bottom: 16px;
      gap: 2px;
    `;

    var tabTitles = ['基础计算', '面积计算', '瓷砖计算', '单位换算'];
    var tabContents = [];

    tabTitles.forEach(function(title, index) {
      var tab = document.createElement('button');
      tab.className = 'calc-tab';
      tab.textContent = title;
      tab.style.cssText = `
        flex: 1;
        padding: 10px 6px;
        background: transparent;
        border: none;
        border-bottom: 3px solid transparent;
        font-size: 11px;
        cursor: pointer;
        color: var(--text-dim);
        font-weight: 500;
        transition: all 0.2s;
      `;
      tab.addEventListener('click', function() {
        document.querySelectorAll('.calc-tab').forEach(function(t) {
          t.style.borderBottomColor = 'transparent';
          t.style.color = 'var(--text-dim)';
        });
        tab.style.borderBottomColor = 'var(--accent)';
        tab.style.color = 'var(--text)';

        document.querySelectorAll('.calc-tab-content').forEach(function(c) {
          c.style.display = 'none';
        });
        document.getElementById('calc-tab-' + index).style.display = 'block';
      });
      tabs.appendChild(tab);

      var tabContent = document.createElement('div');
      tabContent.className = 'calc-tab-content';
      tabContent.id = 'calc-tab-' + index;
      tabContent.style.cssText = `display: ${index === 0 ? 'block' : 'none'}`;
      tabContents.push(tabContent);
    });

    // 第一个标签页：基础计算器
    tabContents[0].innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="padding: 8px 12px; margin-bottom: 8px; text-align: right; color: var(--text-dim); font-size: 14px; min-height: 24px; line-height: 24px;" id="calcHistory"></div>
        <input type="text" id="calcDisplay" readonly style="width:100%;padding: 16px 12px;font-size: 36px;text-align:right;border:none;border-radius:8px;background:transparent;color:var(--text);margin-bottom:8px;font-weight:400;box-shadow:none;" value="0">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;">
          <button class="calc-btn" data-op="memory-clear" style="background:var(--hover-bg);color:var(--text);font-size:12px;">MC</button>
          <button class="calc-btn" data-op="memory-recall" style="background:var(--hover-bg);color:var(--text);font-size:12px;">MR</button>
          <button class="calc-btn" data-op="memory-add" style="background:var(--hover-bg);color:var(--text);font-size:12px;">M+</button>
          <button class="calc-btn" data-op="memory-subtract" style="background:var(--hover-bg);color:var(--text);font-size:12px;">M-</button>
          <button class="calc-btn" data-op="percent" style="background:var(--hover-bg);color:var(--text);font-size:14px;">%</button>
          <button class="calc-btn" data-op="clear-entry" style="background:var(--hover-bg);color:var(--text);font-size:14px;">CE</button>
          <button class="calc-btn" data-op="clear" style="background:var(--hover-bg);color:var(--text);font-size:14px;">C</button>
          <button class="calc-btn" data-op="backspace" style="background:var(--hover-bg);color:var(--text);font-size:14px;">⌫</button>
          <button class="calc-btn" data-op="reciprocal" style="background:var(--hover-bg);color:var(--text);font-size:14px;">1/x</button>
          <button class="calc-btn" data-op="square" style="background:var(--hover-bg);color:var(--text);font-size:14px;">x²</button>
          <button class="calc-btn" data-op="square-root" style="background:var(--hover-bg);color:var(--text);font-size:14px;">√x</button>
          <button class="calc-btn" data-op="/" style="background:var(--hover-bg);color:var(--text);font-size:14px;">/</button>
          <button class="calc-btn" data-op="7">7</button>
          <button class="calc-btn" data-op="8">8</button>
          <button class="calc-btn" data-op="9">9</button>
          <button class="calc-btn" data-op="*" style="background:var(--hover-bg);color:var(--text);font-size:14px;">×</button>
          <button class="calc-btn" data-op="4">4</button>
          <button class="calc-btn" data-op="5">5</button>
          <button class="calc-btn" data-op="6">6</button>
          <button class="calc-btn" data-op="-" style="background:var(--hover-bg);color:var(--text);font-size:14px;">-</button>
          <button class="calc-btn" data-op="1">1</button>
          <button class="calc-btn" data-op="2">2</button>
          <button class="calc-btn" data-op="3">3</button>
          <button class="calc-btn" data-op="+" style="background:var(--hover-bg);color:var(--text);font-size:14px;">+</button>
          <button class="calc-btn" data-op="sign" style="background:var(--hover-bg);color:var(--text);font-size:14px;">+/-</button>
          <button class="calc-btn" data-op="0">0</button>
          <button class="calc-btn" data-op=".">.</button>
          <button class="calc-btn" data-op="equals" style="background:var(--accent);color:white;font-size:16px;">=</button>
        </div>
      </div>
    `;

    // 组装计算器
    tabContents.forEach(function(tc) { content.appendChild(tc); });
    calcWindow.appendChild(header);
    calcWindow.appendChild(content);
    document.body.appendChild(calcWindow);

    // 设置第一个标签页激活状态
    document.querySelectorAll('.calc-tab')[0].style.borderBottomColor = 'var(--accent)';
    document.querySelectorAll('.calc-tab')[0].style.color = 'var(--text)';

    // 添加关闭按钮事件
    header.querySelector('.calc-btn-close').addEventListener('click', function() {
      calcWindow.style.display = 'none';
    });
  };

  console.log('✅ AI 计算器模块已加载');
})();
