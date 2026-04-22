/**
 * 数据混淆模块
 * 注意：这只是基础混淆，不是真正的加密，仅用于防止明文显示
 * 如需真正的安全加密，请使用 Web Crypto API
 */
var Encryption = (function() {
  // 混淆密钥 - 仅用于基础混淆，不保证安全性
  var _OBFUSCATION_KEY = 'banma-jingzhuang-2025-encryption-key';

  // 需要混淆的敏感字段列表 - 统一管理
  var _SENSITIVE_FIELDS = [
    'bossPassword',
    'aiApiKey',
    'licenseKey',
    'aiOptimizeConstructionPrompt',
    'aiOptimizeProductPrompt'
  ];

  /**
   * 简单的XOR混淆
   * @param {string} text - 输入文本
   * @param {string} key - 混淆密钥
   * @returns {string} 混淆后的文本
   */
  function _xorObfuscate(text, key) {
    var result = '';
    for (var i = 0; i < text.length; i++) {
      var charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  }

  /**
   * UTF-8字符串转字节数组
   * @param {string} str - UTF-8字符串
   * @returns {number[]} 字节数组
   */
  function _utf8ToBytes(str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      if (code < 0x80) {
        bytes.push(code);
      } else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      } else if (code >= 0xd800 && code <= 0xdbff) {
        var hi = code;
        var lo = str.charCodeAt(++i);
        var cp = ((hi - 0xd800) << 10) + (lo - 0xdc00) + 0x10000;
        bytes.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
      } else {
        bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      }
    }
    return bytes;
  }

  /**
   * 字节数组转UTF-8字符串
   * @param {number[]} bytes - 字节数组
   * @returns {string} UTF-8字符串
   */
  function _bytesToUtf8(bytes) {
    var str = '';
    for (var i = 0; i < bytes.length; i++) {
      var b = bytes[i];
      if (b < 0x80) {
        str += String.fromCharCode(b);
      } else if (b >= 0xc0 && b < 0xe0) {
        str += String.fromCharCode(((b & 0x1f) << 6) | (bytes[++i] & 0x3f));
      } else if (b >= 0xe0 && b < 0xf0) {
        str += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[++i] & 0x3f) << 6) | (bytes[++i] & 0x3f));
      } else if (b >= 0xf0) {
        var cp = ((b & 0x07) << 18) | ((bytes[++i] & 0x3f) << 12) | ((bytes[++i] & 0x3f) << 6) | (bytes[++i] & 0x3f);
        cp -= 0x10000;
        str += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
      }
    }
    return str;
  }

  return {
    /**
     * 混淆文本
     * @param {string} text - 原始文本
     * @returns {string} 混淆后的base64字符串
     */
    obfuscate: function(text) {
      if (!text) return '';
      try {
        var xored = _xorObfuscate(text, _OBFUSCATION_KEY);
        var bytes = _utf8ToBytes(xored);
        var binary = '';
        for (var i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      } catch (e) {
        console.error('[Encryption] 混淆失败:', e);
        return '';
      }
    },

    /**
     * 解混淆文本
     * @param {string} obfuscated - 混淆后的base64字符串
     * @returns {string} 原始文本
     */
    deobfuscate: function(obfuscated) {
      if (!obfuscated) return '';
      try {
        var binary = atob(obfuscated);
        var bytes = [];
        for (var i = 0; i < binary.length; i++) {
          bytes.push(binary.charCodeAt(i));
        }
        var decoded = _bytesToUtf8(bytes);
        return _xorObfuscate(decoded, _OBFUSCATION_KEY);
      } catch (e) {
        console.error('[Encryption] 解混淆失败:', e);
        return '';
      }
    },

    /**
     * 检查是否是混淆数据
     * @param {string} text - 待检查文本
     * @returns {boolean} 是否为混淆数据
     */
    isObfuscated: function(text) {
      if (!text) return false;
      var base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
      return base64Regex.test(text) && text.length % 4 === 0;
    },

    /**
     * 混淆设置对象中的敏感字段
     * @param {Object} settings - 设置对象
     * @returns {Object} 敏感字段已混淆的新对象
     */
    encryptSensitiveFields: function(settings) {
      var encrypted = Object.assign({}, settings);

      _SENSITIVE_FIELDS.forEach(function(field) {
        if (encrypted[field] && typeof encrypted[field] === 'string') {
          encrypted[field] = this.obfuscate(encrypted[field]);
        }
      }, this);

      return encrypted;
    },

    /**
     * 解混淆设置对象中的敏感字段
     * @param {Object} settings - 设置对象
     * @returns {Object} 敏感字段已解混淆的新对象
     */
    decryptSensitiveFields: function(settings) {
      var decrypted = Object.assign({}, settings);

      _SENSITIVE_FIELDS.forEach(function(field) {
        if (decrypted[field] && typeof decrypted[field] === 'string') {
          if (this.isObfuscated(decrypted[field])) {
            decrypted[field] = this.deobfuscate(decrypted[field]);
          }
        }
      }, this);

      return decrypted;
    }
  };
})();