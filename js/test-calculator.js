// 核心计算函数单元测试
(function() {
  console.log('开始测试 calcQuoteTotal...');
  
  // 模拟全局状态 S
  var S = {
    customerInfo: {
      quoteMode: 'full'
    },
    quoteItems: [
      { quantity: 10, unitPrice: 100 },
      { quantity: 2, unitPrice: 50 },
      { quantity: -5, unitPrice: 30 }, // 负数数量
      { quantity: 3, unitPrice: -20 }, // 负数单价
      { quantity: 'abc', unitPrice: 10 }, // 非数字数量
      { quantity: 4, unitPrice: null } // 空单价
    ],
    productQuoteItems: [
      { mainCategory: 'equipment', quantity: 1, unitPrice: 500 },
      { mainCategory: 'custom', quantity: 2, unitPrice: 200 },
      { mainCategory: 'soft_furnishing', quantity: 3, unitPrice: 150 }
    ],
    managementFeeRate: 8,
    taxRate: 3.41,
    garbageFee: 800,
    protectionFee: 500
  };
  
  // 保存原始 S，测试后恢复
  var originalS = window.S;
  window.S = S;
  
  try {
    // 调用 calcQuoteTotal（假设已在全局作用域定义）
    var result = calcQuoteTotal();
    
    // 验证结果
    console.assert(result.engTotal === 1140, '工程报价计算错误: ' + result.engTotal);
    console.assert(result.prodTotal === 650, '产品清单计算错误: ' + result.prodTotal);
    console.assert(result.subtotal === 1790, '直接费用合计错误: ' + result.subtotal);
    console.assert(result.mgmt === 143.2, '管理费计算错误: ' + result.mgmt);
    console.assert(result.tax === 61.019, '税金计算错误: ' + result.tax);
    console.assert(result.grandTotal === 3294.219, '总计计算错误: ' + result.grandTotal);
    
    console.log('所有测试通过！');
    console.log('结果:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('测试失败:', e);
  } finally {
    // 恢复原始 S
    window.S = originalS;
  }
})();