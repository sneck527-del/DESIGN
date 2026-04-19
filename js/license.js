// 许可证管理系统
var License = {
  // 试用期天数
  TRIAL_DAYS: 7,
  
  // 初始化许可证状态
  init: function() {
    // 如果没有试用开始日期，设置一个
    if (!S.trialStartDate) {
      S.trialStartDate = Date.now();
      saveSettings();
    }
    
    // 检查许可证状态
    return this.checkLicense();
  },
  
  // 检查许可证状态
  checkLicense: function() {
    // 如果有许可证密钥，验证它
    if (S.licenseKey && S.licenseKey.trim() !== '') {
      var isValid = this.validateLicenseKey(S.licenseKey);
      if (isValid) {
        S.licenseStatus = 'active';
        saveSettings();
        return { valid: true, type: S.licenseType, status: 'active' };
      } else {
        S.licenseStatus = 'expired';
        saveSettings();
      }
    }
    
    // 检查试用期
    return this.checkTrialStatus();
  },
  
  // 检查试用期状态
  checkTrialStatus: function() {
    if (!S.trialStartDate) {
      S.trialStartDate = Date.now();
      saveSettings();
    }
    
    var now = Date.now();
    var trialStart = S.trialStartDate;
    var daysUsed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
    var daysLeft = this.TRIAL_DAYS - daysUsed;
    
    if (daysLeft <= 0) {
      S.licenseStatus = 'expired';
      saveSettings();
      return { 
        valid: false, 
        type: 'trial', 
        status: 'expired', 
        daysLeft: 0,
        message: '试用期已结束，请购买许可证继续使用' 
      };
    }
    
    S.licenseStatus = 'trial';
    S.licenseType = 'trial';
    saveSettings();
    
    return { 
      valid: true, 
      type: 'trial', 
      status: 'trial', 
      daysLeft: daysLeft,
      message: '试用期剩余 ' + daysLeft + ' 天' 
    };
  },
  
  // 验证许可证密钥（简单版本，可升级为服务器验证）
  validateLicenseKey: function(key) {
    if (!key || key.trim() === '') return false;
    
    // 简单验证逻辑 - 在实际应用中应更复杂
    // 这里使用简单的哈希验证
    var hash = this._simpleHash(key);
    
    // 预定义的许可证哈希值（这些应该从服务器获取或更安全地存储）
    var validHashes = [
      this._simpleHash('BANMA-PERSONAL-2025-XXXX'),
      this._simpleHash('BANMA-TEAM-2025-XXXX'),
      this._simpleHash('BANMA-ENTERPRISE-2025-XXXX')
    ];
    
    var isValid = validHashes.indexOf(hash) !== -1;
    
    if (isValid) {
      // 根据密钥前缀设置许可证类型
      if (key.includes('PERSONAL')) {
        S.licenseType = 'personal';
      } else if (key.includes('TEAM')) {
        S.licenseType = 'team';
      } else if (key.includes('ENTERPRISE')) {
        S.licenseType = 'enterprise';
      }
    }
    
    return isValid;
  },
  
  // 简单的哈希函数（用于演示）
  _simpleHash: function(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(16);
  },
  
  // 激活许可证
  activateLicense: function(key) {
    key = key.trim();
    
    if (!key) {
      showToast('请输入许可证密钥');
      return false;
    }
    
    var isValid = this.validateLicenseKey(key);
    
    if (isValid) {
      S.licenseKey = key;
      S.licenseStatus = 'active';
      saveSettings();
      showToast('✅ 许可证激活成功！');
      
      // 重新加载页面以应用所有功能
      setTimeout(function() {
        location.reload();
      }, 1500);
      
      return true;
    } else {
      showToast('❌ 许可证密钥无效，请检查后重试');
      return false;
    }
  },
  
  // 显示购买界面
  showPurchaseModal: function() {
    var licenseStatus = this.checkLicense();
    var daysLeft = licenseStatus.daysLeft || 0;
    
    var html = `
      <div class="purchase-modal-content">
        <div class="purchase-header">
          <h3>升级到专业版</h3>
          <p>${licenseStatus.message || '解锁完整功能，提升工作效率'}</p>
        </div>
        
        <div class="pricing-grid">
          <div class="pricing-card">
            <div class="pricing-header">
              <h4>个人版</h4>
              <div class="price">¥499</div>
              <div class="period">一次性购买</div>
            </div>
            <ul class="features">
              <li>✓ 永久使用，无时间限制</li>
              <li>✓ 无限创建报价单</li>
              <li>✓ 完整产品数据库</li>
              <li>✓ PDF/Excel导出无水印</li>
              <li>✓ AI报价审核功能</li>
              <li>✗ 无团队协作功能</li>
              <li class="feature-compare">➤ 升级团队版可获得：</li>
              <li class="feature-compare">  • 5个用户授权</li>
              <li class="feature-compare">  • 团队协作共享</li>
              <li class="feature-compare">  • 云端模板库</li>
              <li class="feature-compare">  • 高级数据分析</li>
              <li class="feature-compare">  • 优先技术支持</li>
            </ul>
            <button class="btn btn-primary" onclick="License.selectPlan('personal')">选择个人版</button>
          </div>
          
          <div class="pricing-card recommended">
            <div class="badge">最受欢迎</div>
            <div class="pricing-header">
              <h4>团队版</h4>
              <div class="price">¥1,999</div>
              <div class="period">5用户授权</div>
            </div>
            <ul class="features">
              <li>✓ 所有个人版功能</li>
              <li>✓ 5个用户授权</li>
              <li>✓ 团队协作共享</li>
              <li>✓ 云端模板库</li>
              <li>✓ 高级数据分析</li>
              <li>✓ 优先技术支持</li>
              <li class="feature-compare">➤ 升级企业版可获得：</li>
              <li class="feature-compare">  • 无限用户授权</li>
              <li class="feature-compare">  • 定制功能开发</li>
              <li class="feature-compare">  • API接口访问</li>
              <li class="feature-compare">  • 专属客户经理</li>
              <li class="feature-compare">  • 现场培训支持</li>
            </ul>
            <button class="btn btn-primary" onclick="License.selectPlan('team')">选择团队版</button>
          </div>
          
          <div class="pricing-card">
            <div class="pricing-header">
              <h4>企业版</h4>
              <div class="price">¥6,999</div>
              <div class="period">年订阅制</div>
            </div>
            <ul class="features">
              <li>✓ 所有团队版功能</li>
              <li>✓ 无限用户授权</li>
              <li>✓ 定制功能开发</li>
              <li>✓ API接口访问</li>
              <li>✓ 专属客户经理</li>
              <li>✓ 现场培训支持</li>
            </ul>
            <button class="btn btn-outline" onclick="License.selectPlan('enterprise')">咨询企业版</button>
          </div>
        </div>
        
        <div class="purchase-footer">
          <div class="trial-info">
            <strong>试用期剩余: ${daysLeft} 天</strong>
            <p>试用期结束后，导出功能将受限并添加水印</p>
          </div>
          <div class="action-buttons">
            <button class="btn btn-ghost" onclick="License.showActivationForm()">已有许可证？激活</button>
            <button class="btn btn-outline" onclick="closeModal('purchaseModal')">稍后决定</button>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('purchaseModalBody').innerHTML = html;
    openModal('purchaseModal');
  },
  
  // 选择购买计划
  selectPlan: function(plan) {
    var planInfo = {
      personal: { name: '个人版', price: '499', features: ['永久使用', '无水印导出', '完整功能'] },
      team: { name: '团队版', price: '1,999', features: ['5用户授权', '团队协作', '高级功能'] },
      enterprise: { name: '企业版', price: '6,999', features: ['无限用户', '定制开发', '年订阅'] }
    };
    
    var info = planInfo[plan];
    if (!info) return;
    
    var html = `
      <div class="order-form">
        <h4>购买 ${info.name}</h4>
        <p>价格: <strong>¥${info.price}</strong></p>
        
        <div class="form-group">
          <label>联系人姓名</label>
          <input type="text" id="orderName" placeholder="请输入姓名">
        </div>
        
        <div class="form-group">
          <label>联系电话</label>
          <input type="text" id="orderPhone" placeholder="请输入手机号">
        </div>
        
        <div class="form-group">
          <label>电子邮箱</label>
          <input type="email" id="orderEmail" placeholder="用于接收许可证">
        </div>
        
        <div class="form-group">
          <label>公司名称（可选）</label>
          <input type="text" id="orderCompany" placeholder="请输入公司名称">
        </div>
        
        <div class="payment-methods">
          <h5>支付方式</h5>
          <div class="payment-options">
            <label class="payment-option">
              <input type="radio" name="payment" value="wechat" checked>
              <span>微信支付</span>
              <div class="payment-icon">💳</div>
            </label>
            <label class="payment-option">
              <input type="radio" name="payment" value="alipay">
              <span>支付宝</span>
              <div class="payment-icon">💰</div>
            </label>
            <label class="payment-option">
              <input type="radio" name="payment" value="bank">
              <span>银行转账</span>
              <div class="payment-icon">🏦</div>
            </label>
          </div>
        </div>
        
        <div class="order-summary">
          <p><strong>功能包含:</strong> ${info.features.join('、')}</p>
          <p><strong>交付方式:</strong> 许可证密钥将通过邮件发送</p>
          <p><strong>技术支持:</strong> 购买后提供使用指导和问题解答</p>
        </div>
        
        <div class="order-actions">
          <button class="btn btn-primary" onclick="License.submitOrder('${plan}')">提交订单</button>
          <button class="btn btn-outline" onclick="License.showPurchaseModal()">返回</button>
        </div>
      </div>
    `;
    
    document.getElementById('purchaseModalBody').innerHTML = html;
  },
  
  // 提交订单（模拟）
  submitOrder: function(plan) {
    var name = document.getElementById('orderName').value.trim();
    var phone = document.getElementById('orderPhone').value.trim();
    var email = document.getElementById('orderEmail').value.trim();
    
    if (!name || !phone || !email) {
      showToast('请填写完整的联系信息');
      return;
    }
    
    // 在实际应用中，这里应该发送到服务器处理
    // 这里只是模拟订单提交
    showToast('订单已提交，我们的客服将在24小时内联系您！');
    
    // 记录订单信息（实际应用中应发送到服务器）
    var orderData = {
      plan: plan,
      name: name,
      phone: phone,
      email: email,
      company: document.getElementById('orderCompany').value.trim(),
      timestamp: Date.now()
    };
    
    // 存储订单信息（实际应用中应使用服务器）
    localStorage.setItem('last_order', JSON.stringify(orderData));
    
    // 关闭模态框
    closeModal('purchaseModal');
    
    // 显示联系信息
    setTimeout(function() {
      alert('感谢您的订购！\n\n我们的客服人员将通过您提供的联系方式与您确认订单详情并安排付款。\n\n您也可以直接联系：\n微信：banma-design\n电话：138-0000-0000\n邮箱：sales@banma-design.com');
    }, 500);
  },
  
  // 显示许可证激活表单
  showActivationForm: function() {
    var html = `
      <div class="activation-form">
        <h4>激活许可证</h4>
        <p>请输入您收到的许可证密钥</p>
        
        <div class="form-group">
          <label>许可证密钥</label>
          <input type="text" id="licenseKeyInput" placeholder="例如: BANMA-PERSONAL-2025-XXXX-XXXX-XXXX" style="width:100%;padding:10px;font-family:monospace">
        </div>
        
        <div class="activation-info">
          <p><strong>在哪里找到许可证密钥？</strong></p>
          <ul>
            <li>购买成功后收到的邮件中</li>
            <li>客服人员通过微信发送给您</li>
            <li>付款成功后系统自动发放</li>
          </ul>
        </div>
        
        <div class="activation-actions">
          <button class="btn btn-primary" onclick="License.activateLicense(document.getElementById('licenseKeyInput').value)">激活</button>
          <button class="btn btn-outline" onclick="License.showPurchaseModal()">返回购买</button>
          <button class="btn btn-ghost" onclick="closeModal('purchaseModal')">取消</button>
        </div>
      </div>
    `;
    
    document.getElementById('purchaseModalBody').innerHTML = html;
    document.getElementById('licenseKeyInput').focus();
  },
  
  // 检查功能限制（在关键功能处调用）
  checkFeatureRestriction: function(feature) {
    var licenseStatus = this.checkLicense();
    
    // 如果许可证有效，允许所有功能
    if (licenseStatus.valid && S.licenseStatus === 'active') {
      return { allowed: true };
    }
    
    // 试用期用户的功能限制
    if (S.licenseStatus === 'trial') {
      // 试用期允许所有功能，但可能有水印
      return { allowed: true, watermark: true };
    }
    
    // 试用期已过期的功能限制
    if (S.licenseStatus === 'expired') {
      var restrictions = {
        'export_pdf': { allowed: false, message: '试用期已结束，请购买许可证以导出PDF' },
        'export_excel': { allowed: false, message: '试用期已结束，请购买许可证以导出Excel' },
        'save_template': { allowed: false, message: '试用期已结束，请购买许可证以保存模板' },
        'ai_audit': { allowed: false, message: '试用期已结束，请购买许可证以使用AI审核' }
      };
      
      return restrictions[feature] || { allowed: true, watermark: true };
    }
    
    return { allowed: true };
  },
  
  // 在页面加载时检查许可证状态
  checkOnLoad: function() {
    var status = this.init();
    
    // 如果许可证无效，显示提醒
    if (!status.valid) {
      // 延迟显示，让页面先加载
      setTimeout(function() {
        License.showPurchaseModal();
      }, 2000);
      
      // 在页面上添加试用期提醒
      this.showTrialReminder();
    } else if (status.type === 'trial') {
      // 试用期用户显示剩余天数
      this.showTrialReminder();
    }
    
    return status;
  },
  
  // 显示试用期提醒
  showTrialReminder: function() {
    var status = this.checkLicense();
    var message = status.message || '';
    
    // 在页面右上角添加提醒
    var reminder = document.createElement('div');
    reminder.className = 'trial-reminder';
    reminder.id = 'trialReminder';
    reminder.innerHTML = `
      <span>${message}</span>
      <button onclick="License.showPurchaseModal()">升级</button>
    `;
    
    document.body.appendChild(reminder);
    
    // 5秒后自动隐藏提醒
    setTimeout(function() {
      var reminderEl = document.getElementById('trialReminder');
      if (reminderEl) {
        reminderEl.style.opacity = '0';
        reminderEl.style.transform = 'translateX(100%)';
        setTimeout(function() {
          if (reminderEl && reminderEl.parentNode) {
            reminderEl.parentNode.removeChild(reminderEl);
          }
        }, 300);
      }
    }, 5000);
    
    // 添加CSS样式
    if (!document.getElementById('trialReminderStyle')) {
      var style = document.createElement('style');
      style.id = 'trialReminderStyle';
      style.textContent = `
        .trial-reminder {
          position: fixed;
          top: 60px;
          right: 20px;
          background: var(--accent);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 1000;
          box-shadow: var(--shadow);
          animation: slideIn 0.3s ease;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .trial-reminder button {
          background: white;
          color: var(--accent);
          border: none;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
          font-weight: 600;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  },
  
  // 获取水印文本（用于试用版导出）
  getWatermarkText: function() {
    if (S.licenseStatus === 'active') {
      return S.watermarkText || '报价专用';
    } else {
      return '试用版 - ' + (S.watermarkText || '斑马精装报价系统');
    }
  },
  
  // 手动检查许可证（用于管理界面）
  manualCheck: function() {
    var status = this.checkLicense();
    showToast(status.message || '许可证状态: ' + status.status);
    return status;
  }
};