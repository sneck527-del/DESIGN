/**
 * 日期工具模块
 * 处理节假日、工作日计算等功能
 */
var DateUtils = (function() {
  /**
   * 中国法定节假日列表（简化版）
   * 注意：每年需要更新节假日数据
   */
  var CHINA_HOLIDAYS = [
    '2025-01-01',
    '2025-02-01', '2025-02-02', '2025-02-03',
    '2025-02-10', '2025-02-11', '2025-02-12', '2025-02-13', '2025-02-14', '2025-02-15', '2025-02-16',
    '2025-04-04', '2025-04-05', '2025-04-06',
    '2025-05-01', '2025-05-02', '2025-05-03', '2025-05-04', '2025-05-05',
    '2025-06-08', '2025-06-09', '2025-06-10',
    '2025-09-15', '2025-09-16', '2025-09-17',
    '2025-10-01', '2025-10-02', '2025-10-03', '2025-10-04', '2025-10-05', '2025-10-06', '2025-10-07'
  ];

  /**
   * 检查日期是否为节假日
   * @param {string} dateStr - 日期字符串 (YYYY-MM-DD)
   * @param {boolean} respectHolidays - 是否遵守节假日设置
   * @returns {boolean} 是否为节假日
   */
  function isHoliday(dateStr, respectHolidays) {
    if (respectHolidays === false) {
      return false;
    }

    var date = new Date(dateStr);
    var day = date.getDay();

    if (day === 0 || day === 6) {
      return true;
    }

    if (CHINA_HOLIDAYS.includes(dateStr)) {
      return true;
    }

    return false;
  }

  /**
   * 添加工作日天数，跳过节假日
   * @param {string} startDateStr - 开始日期 (YYYY-MM-DD)
   * @param {number} days - 要添加的工作日天数
   * @param {boolean} respectHolidays - 是否遵守节假日设置
   * @returns {string} 结果日期 (YYYY-MM-DD)
   */
  function addBusinessDays(startDateStr, days, respectHolidays) {
    if (respectHolidays === false) {
      var date = new Date(startDateStr);
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    }

    var date = new Date(startDateStr);
    var added = 0;

    while (added < days) {
      date.setDate(date.getDate() + 1);
      var dateStr = date.toISOString().split('T')[0];
      if (!isHoliday(dateStr, respectHolidays)) {
        added++;
      }
    }

    return date.toISOString().split('T')[0];
  }

  /**
   * 获取今天的日期字符串
   * @returns {string} 今天的日期 (YYYY-MM-DD)
   */
  function getTodayString() {
    return new Date().toISOString().split('T')[0];
  }

  return {
    CHINA_HOLIDAYS: CHINA_HOLIDAYS,
    isHoliday: isHoliday,
    addBusinessDays: addBusinessDays,
    getTodayString: getTodayString
  };
})();
