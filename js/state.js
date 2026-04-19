// 全局状态管理模块
var S = {
  currentFileId: null,
  files: [],
  recentFileIds: [],
  customerInfo: {
    name: '',
    phone: '',
    address: '',
    designer: '',
    designerPhone: '',
    plan: 'luxury',
    quoteMode: 'full',
    date: new Date().toISOString().split('T')[0],
    area: ''
  },
  rooms: [],
  quoteItems: [],
  productQuoteItems: [],
  materials: null,
  spaceTypes: null,
  currentPlan: 'luxury',
  currentTheme: 'dark',
  managementFeeRate: 8,
  taxRate: 3.41,
  garbageFee: 800,
  protectionFee: 500,
  editingRoomId: null,
  editingMaterialId: null,
  editingSpaceTypeId: null,
  watermarkEnabled: false,
  watermarkText: '报价专用',
  colWidths: {num:24,name:100,qty:24,unit:24,price:24,amount:100,desc:180,action:24},
  msProjectName: '',
  msCustomerInfo: {
    name: '',
    phone: '',
    address: '',
    designer: '',
    designerPhone: '',
    plan: 'luxury',
    quoteMode: 'full',
    date: new Date().toISOString().split('T')[0],
    area: ''
  },
  msRooms: [],
  importSelectedFileId: null,
  msEditingRoomId: null,
  products: [],
  workers: [],
  constructionSchedule: [],
  respectHolidays: true,
  pdbSelectedMainCat: null,
  pdbSelectedSubCat: null,
  editingProductId: null,
  addProdSelectedIds: [],
  templates: [],
  customNotes: '',
  bossPassword: '888888',
  licenseKey: '',
  licenseStatus: 'trial', // 'trial', 'active', 'expired'
  trialStartDate: null,
  licenseType: '', // 'trial', 'personal', 'team', 'enterprise'
  costRates: {
    luxury: 0.65,
    premium: 0.60
  },
  fontSizes: {
    table: 12,
    header: 12,
    project: 14,
    description: 11,
    input: 11
  },
  rowHeight: 36,
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: '',
  aiProvider: 'ollama',
  aiApiKey: '',
  aiApiUrl: 'https://api.deepseek.com',
  aiOptimizeConstructionPrompt: '你是一位资深室内装饰工艺专家。请优化以下施工明细说明，严格遵循室内装饰行业规范，仅标注核心专业信息，无营销冗余表述。施工明细明确施工工序、工艺标准、人工规范、隐蔽工程做法及验收节点。保持原有核心信息，补充缺失的专业参数，修正不规范的表述，使说明更加专业、完整、合规。直接输出优化后的施工明细，不要加前缀说明。',
  aiOptimizeProductPrompt: '你是一位资深室内装饰材料专家。请优化以下产品说明，严格遵循室内装饰行业规范，仅标注核心专业信息，无营销冗余表述。材料明细标注主材/辅材品牌、型号、规格、环保等级（ENF/E0/E1级、无醛添加）、材质参数及国家环保检测标准；设备明细列明品牌、型号、功率、尺寸、安装规范与质保参数；软装明细标注材质、面料、填充物环保等级、尺寸及工艺标准。保持原有核心信息，补充缺失的专业参数，修正不规范的表述，使说明更加专业、完整、合规。直接输出优化后的产品说明，不要加前缀说明。',
  dirty: false,
  undoStack: [],
  maxUndoSteps: 50,
  logo: '',
  systemName: ''
};

function markDirty() {
  S.dirty = true;
}

function pushUndoState() {
  if (!S.currentFileId) return;
  var state = {
    customerInfo: JSON.parse(JSON.stringify(S.customerInfo)),
    rooms: JSON.parse(JSON.stringify(S.rooms)),
    quoteItems: JSON.parse(JSON.stringify(S.quoteItems)),
    productQuoteItems: JSON.parse(JSON.stringify(S.productQuoteItems)),
    workers: JSON.parse(JSON.stringify(S.workers)),
    constructionSchedule: JSON.parse(JSON.stringify(S.constructionSchedule)),
    customNotes: S.customNotes,
    managementFeeRate: S.managementFeeRate,
    taxRate: S.taxRate,
    garbageFee: S.garbageFee,
    protectionFee: S.protectionFee,
    respectHolidays: S.respectHolidays
  };
  S.undoStack.push(state);
  if (S.undoStack.length > S.maxUndoSteps) S.undoStack.shift();
}

function undo() {
  if (S.undoStack.length === 0) {
    showToast('没有可撤销的操作');
    return;
  }
  var state = S.undoStack.pop();
  S.customerInfo = state.customerInfo;
  S.rooms = state.rooms;
  S.quoteItems = state.quoteItems;
  S.productQuoteItems = state.productQuoteItems;
  S.workers = state.workers || [];
  S.constructionSchedule = state.constructionSchedule || [];
  S.customNotes = state.customNotes;
  S.managementFeeRate = state.managementFeeRate;
  S.taxRate = state.taxRate;
  S.garbageFee = state.garbageFee;
  S.protectionFee = state.protectionFee;
  S.respectHolidays = state.respectHolidays !== undefined ? state.respectHolidays : true;
  renderCustomerInfo();
  renderRoomList();
  renderQuoteTable();
  renderSummary();
  document.getElementById('customNotes').value = S.customNotes;
  showToast('已撤销');
}

function initDefaults() {
  if (!S.materials) S.materials = JSON.parse(JSON.stringify(DEFAULT_MATERIALS));
  if (!S.spaceTypes) S.spaceTypes = JSON.parse(JSON.stringify(DEFAULT_SPACE_TYPES));
  if (!S.fontSizes) S.fontSizes = {table: 12, header: 12, project: 14, description: 11, input: 11};
  if (!S.rowHeight) S.rowHeight = 36;
  if (!S.colWidths) S.colWidths = {num:24,name:100,qty:24,unit:24,price:24,amount:100,desc:180,action:24};
}