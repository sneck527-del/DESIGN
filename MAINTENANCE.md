# 项目维护指南

## 优化概述

本次优化从后期维护角度对系统进行了以下改进：

---

## 已完成的优化

### 1. 🔐 安全优化 - encryption.js

**问题：**
- 硬编码密钥暴露在代码中
- `sensitiveFields` 数组重复定义
- 缺少清晰的安全警示

**优化方案：**
- 使用 IIFE 模式封装内部变量
- 统一管理 `_SENSITIVE_FIELDS` 常量
- 添加详细的 JSDoc 注释
- 明确标注这是"混淆"而非"加密"

**文件位置：** `js/encryption.js`

---

### 2. 📦 模块化重构 - 工具函数提取

**问题：**
- main.js 文件过大（333KB）
- 日期工具、名称标准化等函数混杂在主文件中
- 代码复用性差

**优化方案：**

#### 新增 `js/utils/date-utils.js`
- `CHINA_HOLIDAYS` - 节假日数据
- `isHoliday()` - 节假日检查
- `addBusinessDays()` - 工作日计算
- `getTodayString()` - 获取今天日期

#### 新增 `js/utils/normalize-utils.js`
- `normalizeFloorName()` - 楼层名称标准化
- `normalizeRoomName()` - 房间名称标准化

#### 新增 `js/utils/state-utils.js`
- `deepClone()` - 状态深拷贝（支持 structuredClone）
- `mergeState()` - 状态合并
- `isValidState()` - 状态验证

**向后兼容：** main.js 中保留了全局函数包装器，确保现有代码正常工作。

---

### 3. 📄 项目配置 - package.json

**新增文件：** `package.json`
- 项目元数据
- 脚本命令占位
- 依赖管理框架

---

### 4. 🔗 HTML 更新 - quotation.html

**更新内容：**
- 添加新工具模块的脚本引用
- 保持原有脚本加载顺序

```html
<script src="js/utils/date-utils.js"></script>
<script src="js/utils/normalize-utils.js"></script>
<script src="js/utils/state-utils.js"></script>
```

---

## 📂 新的文件结构

```
DESIGN-main/
├── js/
│   ├── utils/
│   │   ├── date-utils.js       # 日期和节假日工具
│   │   ├── normalize-utils.js  # 名称标准化工具
│   │   └── state-utils.js      # 状态管理工具
│   ├── encryption.js           # 已优化的混淆模块
│   ├── main.js                 # 已瘦身的主文件
│   └── ...
├── quotation.html              # 已更新脚本引用
├── package.json                # 新增项目配置
└── MAINTENANCE.md              # 本文档
```

---

## 🎯 后续优化建议

### 高优先级（建议尽快处理）

1. **继续拆分 main.js**
   - 目标：将 333KB 的文件拆分为 < 500 行的模块
   - 建议拆分方向：
     - `js/ui/quote-table.js` - 报价表格渲染
     - `js/ui/room-manager.js` - 房间管理UI
     - `js/ui/modal-dialogs.js` - 模态对话框
     - `js/services/file-service.js` - 文件操作

2. **错误处理改进**
   - 查找空的 catch 块
   - 添加用户友好的错误提示
   - 实现错误边界

3. **添加测试**
   - 为计算逻辑添加单元测试
   - 为工具函数添加测试用例

### 中优先级（3-6个月内）

4. **引入构建工具**
   - 使用 Vite 或 Webpack
   - 配置 ES modules
   - 添加代码压缩

5. **TypeScript 迁移**
   - 逐步添加类型定义
   - 提升代码可维护性

6. **状态管理优化**
   - 将全局 S 对象拆分为多个状态切片
   - 考虑使用简单的状态管理库

### 低优先级（长期）

7. **CI/CD 配置**
   - 添加自动化测试
   - 配置自动部署

8. **性能监控**
   - 添加性能埋点
   - 优化渲染性能

---

## 🛠️ 开发指南

### 添加新的工具函数

1. 在 `js/utils/` 下创建新文件
2. 使用 IIFE 模式封装
3. 在 `quotation.html` 中添加脚本引用
4. 如需在 main.js 中使用，可添加兼容包装器

### 节假日数据更新

每年更新 `js/utils/date-utils.js` 中的 `CHINA_HOLIDAYS` 数组。

---

## 📝 注意事项

- 所有优化保持了向后兼容性
- 现有功能无需修改即可正常工作
- 建议逐步测试各个功能模块
