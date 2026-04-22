/**
 * 状态管理工具模块
 * 提供状态深拷贝、验证等功能
 */
var StateUtils = (function() {
  /**
   * 深拷贝状态对象
   * 使用 structuredClone 优先，回退到 JSON 方法
   * @param {*} obj - 要拷贝的对象
   * @returns {*} 拷贝后的新对象
   */
  function deepClone(obj) {
    if (typeof structuredClone === 'function') {
      try {
        return structuredClone(obj);
      } catch (e) {
        console.warn('[StateUtils] structuredClone 失败，回退到 JSON 方法');
      }
    }
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * 安全的状态合并
   * @param {Object} target - 目标对象
   * @param {Object} source - 源对象
   * @returns {Object} 合并后的新对象
   */
  function mergeState(target, source) {
    var result = Object.assign({}, target);
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = mergeState(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    return result;
  }

  /**
   * 验证状态对象是否有效
   * @param {Object} state - 状态对象
   * @returns {boolean} 是否有效
   */
  function isValidState(state) {
    return state && typeof state === 'object';
  }

  return {
    deepClone: deepClone,
    mergeState: mergeState,
    isValidState: isValidState
  };
})();
