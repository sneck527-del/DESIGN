// AI 配置文件
// 存储 AI 提示词和 API 配置信息

(function() {

  // 默认提示词配置
  window.AI_CONFIG = {
    // 施工明细优化提示词
    constructionPrompt: '你是一位资深室内装饰工艺专家。请优化以下施工明细说明，严格遵循室内装饰行业规范，仅标注核心专业信息，无营销冗余表述。施工明细明确施工工序、工艺标准、人工规范、隐蔽工程做法及验收节点。保持原有核心信息，补充缺失的专业参数，修正不规范的表述，使说明更加专业、完整、合规。直接输出优化后的施工明细，不要加前缀说明。100-200字',

    // 产品说明优化提示词
    productPrompt: '你是一位资深室内装饰材料专家。请优化以下产品说明，严格遵循室内装饰行业规范，仅标注核心专业信息，无营销冗余表述。材料明细标注主材/辅材品牌、型号、规格、环保等级（ENF/E0/E1级、无醛添加）、材质参数及国家环保检测标准；设备明细列明品牌、型号、功率、尺寸、安装规范与质保参数；软装明细标注材质、面料、填充物环保等级、尺寸及工艺标准。保持原有核心信息，补充缺失的专业参数，修正不规范的表述，使说明更加专业、完整、合规。直接输出优化后的产品说明，不要加前缀说明。100-200字',

    // AI审核系统提示词
    auditSystemPrompt: '你是专业的装修报价审核专家，请用中文回复，条理清晰。',

    // AI审核用户提示词模板
    auditUserPromptTemplate: '你是一位专业的装修报价审核专家。请仔细审核以下报价数据，重点检查：\n1. 漏项：是否有常见的装修项目遗漏（如某房间缺少墙面/地面/顶面处理、缺少踢脚线、缺少门套窗套等）\n2. 单价不统一：相同或类似项目在不同房间的单价是否一致\n3. 数量异常：数量是否与房间尺寸匹配（如墙面面积是否合理、踢脚线长度是否合理）\n4. 逻辑错误：如有门但无门套、有窗但无窗套、卫生间缺防水等\n5. 价格合理性：单价是否在合理区间\n\n请用中文逐项列出发现的问题，每条包含：问题类型、具体项目、所在房间、问题描述、建议修正。\n如果没有发现问题，说明报价整体合理。',

    // API提供商预设配置
    providerPresets: {
      ollama: {
        url: 'http://localhost:11434',
        model: 'qwen2.5',
        hint: '如 qwen2.5、llama3 等'
      },
      deepseek: {
        url: 'https://api.deepseek.com',
        model: 'deepseek-chat',
        hint: '如 deepseek-chat 等'
      },
      openai: {
        url: 'https://api.openai.com',
        model: 'gpt-4o-mini',
        hint: '如 gpt-4o-mini 等'
      },
      zhipu: {
        url: 'https://open.bigmodel.cn/api/paas',
        model: 'glm-4-flash',
        hint: '如 glm-4-flash 等'
      },
      doubao: {
        url: 'https://ark.cn-beijing.volces.com/api/v3',
        model: 'ep-xxxxxxxxx-xxxxx',
        hint: '填写火山方舟推理接入点ID，如 ep-20240604xxxxx-xxxxx'
      }
    }
  };

  // 从配置中获取提示词（优先使用 S 中保存的，否则使用默认）
  window.getConstructionPrompt = function() {
    return S && S.aiOptimizeConstructionPrompt
      ? S.aiOptimizeConstructionPrompt
      : AI_CONFIG.constructionPrompt;
  };

  window.getProductPrompt = function() {
    return S && S.aiOptimizeProductPrompt
      ? S.aiOptimizeProductPrompt
      : AI_CONFIG.productPrompt;
  };

  window.getAuditSystemPrompt = function() {
    return AI_CONFIG.auditSystemPrompt;
  };

  window.getAuditUserPromptTemplate = function() {
    return AI_CONFIG.auditUserPromptTemplate;
  };

  // 获取提供商预设
  window.getProviderPreset = function(provider) {
    return AI_CONFIG.providerPresets[provider] || null;
  };

  // 重置为默认提示词
  window.resetDefaultPrompts = function() {
    if (S) {
      S.aiOptimizeConstructionPrompt = AI_CONFIG.constructionPrompt;
      S.aiOptimizeProductPrompt = AI_CONFIG.productPrompt;
    }
  };

  console.log('✅ AI 配置文件已加载');
})();
