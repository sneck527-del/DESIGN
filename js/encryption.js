// 简单的数据混淆模块（非真正加密，仅用于基本混淆）
var Encryption = {
  // 固定密钥（在实际应用中，这应该更复杂或由用户提供）
  _key: 'banma-jingzhuang-2025-encryption-key',
  
  // 简单的XOR加密
  _xorEncrypt: function(text, key) {
    var result = '';
    for (var i = 0; i < text.length; i++) {
      var charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  },
  
  // 混淆数据：base64编码 + XOR
  obfuscate: function(text) {
    if (!text) return '';
    try {
      // 先进行XOR加密
      var xored = this._xorEncrypt(text, this._key);
      // 然后base64编码
      return btoa(xored);
    } catch (e) {
      console.error('混淆失败:', e);
      return '';
    }
  },
  
  // 解混淆数据
  deobfuscate: function(obfuscated) {
    if (!obfuscated) return '';
    try {
      // 先base64解码
      var decoded = atob(obfuscated);
      // 然后XOR解密（XOR加密和解密是相同的操作）
      return this._xorEncrypt(decoded, this._key);
    } catch (e) {
      console.error('解混淆失败:', e);
      return '';
    }
  },
  
  // 检查是否是混淆数据（简单启发式方法）
  isObfuscated: function(text) {
    if (!text) return false;
    // 检查是否是有效的base64字符串
    var base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    return base64Regex.test(text) && text.length % 4 === 0;
  },
  
  // 加密敏感字段（用于设置对象）
  encryptSensitiveFields: function(settings) {
    var encrypted = Object.assign({}, settings);
    
    // 需要加密的字段
    var sensitiveFields = [
      'bossPassword',
      'aiApiKey'
    ];
    
    sensitiveFields.forEach(function(field) {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        encrypted[field] = this.obfuscate(encrypted[field]);
      }
    }, this);
    
    return encrypted;
  },
  
  // 解密敏感字段
  decryptSensitiveFields: function(settings) {
    var decrypted = Object.assign({}, settings);
    
    // 需要解密的字段
    var sensitiveFields = [
      'bossPassword',
      'aiApiKey'
    ];
    
    sensitiveFields.forEach(function(field) {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        // 检查是否需要解密（可能是旧数据或已经解密）
        if (this.isObfuscated(decrypted[field])) {
          decrypted[field] = this.deobfuscate(decrypted[field]);
        }
      }
    }, this);
    
    return decrypted;
  }
};