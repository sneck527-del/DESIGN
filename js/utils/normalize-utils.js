/**
 * 名称标准化工具模块
 * 处理楼层、房间名称的标准化
 */
var NormalizeUtils = (function() {
  /**
   * 标准化楼层名称
   * @param {string} name - 原始楼层名称
   * @returns {string} 标准化后的楼层名称
   */
  function normalizeFloorName(name) {
    if (!name) return name;

    var floorMap = {
      '一层': '一楼',
      '二层': '二楼',
      '三层': '三楼',
      '四层': '四楼',
      '五层': '五楼',
      '负一层': '负一楼',
      '负二层': '负二楼',
      '地下室': '负一楼',
      '地下一层': '负一楼',
      '地下二层': '负二楼',
      '1层': '一楼',
      '2层': '二楼',
      '3层': '三楼',
      '4层': '四楼',
      '5层': '五楼',
      '-1层': '负一楼',
      '-2层': '负二楼'
    };

    var normalized = name.replace(/\s+/g, '');
    return floorMap[normalized] || name;
  }

  /**
   * 标准化房间名称
   * @param {string} name - 原始房间名称
   * @returns {string} 标准化后的房间名称
   */
  function normalizeRoomName(name) {
    if (!name) return name;

    var roomMap = {
      '起居室': '客厅',
      '会客室': '客厅',
      '大厅': '客厅',
      '主卧房': '主卧',
      '主卧室': '主卧',
      '次卧房': '次卧',
      '次卧室': '次卧',
      '儿童房': '儿童房',
      '小孩房': '儿童房',
      '书房': '书房',
      '书室': '书房',
      '厨房': '厨房',
      '厨房间': '厨房',
      '卫生间': '卫生间',
      '洗手间': '卫生间',
      '浴室': '卫生间',
      '阳台': '阳台',
      '露台': '阳台',
      '餐厅': '餐厅',
      '饭厅': '餐厅'
    };

    var normalized = name.replace(/\s+/g, '');
    return roomMap[normalized] || name;
  }

  return {
    normalizeFloorName: normalizeFloorName,
    normalizeRoomName: normalizeRoomName
  };
})();
