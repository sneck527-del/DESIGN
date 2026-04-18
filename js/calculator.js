// 计算模块
function calcQuoteTotal() {
  // 验证费率配置
  var managementFeeRate = Number(S.managementFeeRate) || 0;
  if (managementFeeRate < 0) managementFeeRate = 0;
  var taxRate = Number(S.taxRate) || 0;
  if (taxRate < 0) taxRate = 0;
  var garbageFee = Number(S.garbageFee) || 0;
  if (garbageFee < 0) garbageFee = 0;
  var protectionFee = Number(S.protectionFee) || 0;
  if (protectionFee < 0) protectionFee = 0;

  var qm = S.customerInfo.quoteMode || 'full';
  var engTotal = S.quoteItems.reduce(function(s, i) {
    var quantity = Number(i.quantity) || 0;
    if (quantity < 0) quantity = 0;
    var unitPrice = Number(i.unitPrice) || 0;
    if (unitPrice < 0) unitPrice = 0;
    return s + quantity * unitPrice;
  }, 0);
  var visiblePQI = qm === 'full' ? S.productQuoteItems : S.productQuoteItems.filter(function(q) {
    return q.mainCategory !== 'equipment' && q.mainCategory !== 'soft_furnishing';
  });
  var prodTotal = visiblePQI.reduce(function(s, i) {
    var quantity = Number(i.quantity) || 0;
    if (quantity < 0) quantity = 0;
    var unitPrice = Number(i.unitPrice) || 0;
    if (unitPrice < 0) unitPrice = 0;
    return s + quantity * unitPrice;
  }, 0);
  var sub = engTotal + prodTotal;
  var mgmt = sub * managementFeeRate / 100;
  var tax = sub * taxRate / 100;
  var grandTotal = sub + mgmt + tax + garbageFee + protectionFee;
  // 确保结果不为负数
  if (engTotal < 0) engTotal = 0;
  if (prodTotal < 0) prodTotal = 0;
  if (sub < 0) sub = 0;
  if (mgmt < 0) mgmt = 0;
  if (tax < 0) tax = 0;
  if (grandTotal < 0) grandTotal = 0;
  return {
    engTotal: Math.round(engTotal),
    prodTotal: Math.round(prodTotal),
    subtotal: Math.round(sub),
    mgmt: Math.round(mgmt),
    tax: Math.round(tax),
    grandTotal: Math.round(grandTotal)
  };
}