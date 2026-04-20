// AI 服务模块
// 处理 AI 审核、AI 优化说明、API 调用等功能

(function() {
  // 内部变量
  var _aiAbortController = null;

  // AI 审核相关函数
  window.openAiAudit = function() {
    // 检查许可证限制
    if (typeof License !== 'undefined') {
      var restriction = License.checkFeatureRestriction('ai_audit');
      if (!restriction.allowed) {
        showToast(restriction.message || '功能受限');
        License.showPurchaseModal();
        return;
      }
    }

    if(!S.ollamaModel){showToast('请先在系统设置中配置AI模型');return}
    document.getElementById('aiAuditBody').innerHTML='<div style="margin-bottom:12px;display:flex;gap:8px"><button class="btn btn-primary" onclick="startAiAudit()">开始审核</button><button class="btn btn-outline" onclick="stopAiAudit()">停止</button><span style="font-size:11px;color:var(--text-dim);line-height:32px">当前模型: '+esc(S.aiProvider)+' / '+esc(S.ollamaModel)+'</span></div><div class="ai-result" id="aiResult"></div>';
    openModal('aiAuditModal')
  };

  window.onAiProviderChange = function() {
    var p=document.getElementById('aiProvider').value;
    var urlInput=document.getElementById('aiApiUrl');
    var modelInput=document.getElementById('aiModel');
    var presets={
      ollama:{url:'http://localhost:11434',model:'qwen2.5',hint:'如 qwen2.5、llama3 等'},
      deepseek:{url:'https://api.deepseek.com',model:'deepseek-chat',hint:'如 deepseek-chat 等'},
      openai:{url:'https://api.openai.com',model:'gpt-4o-mini',hint:'如 gpt-4o-mini 等'},
      zhipu:{url:'https://open.bigmodel.cn/api/paas',model:'glm-4-flash',hint:'如 glm-4-flash 等'},
      doubao:{url:'https://ark.cn-beijing.volces.com/api/v3',model:'ep-xxxxxxxxx-xxxxx',hint:'填写火山方舟推理接入点ID，如 ep-20240604xxxxx-xxxxx'}
    };
    var pre=presets[p];
    if(pre){urlInput.value=pre.url;modelInput.placeholder=pre.hint}
  };

  window.closeAiAudit = function() {
    stopAiAudit();
    closeModal('aiAuditModal');
  };

  window.stopAiAudit = function() {
    if(_aiAbortController){
      _aiAbortController.abort();
      _aiAbortController=null;
    }
  };

  window.buildAuditPrompt = function() {
    var ci=S.customerInfo;
    var plans={luxury:'奢享全案',premium:'优享精造'};
    var totals=calcQuoteTotal();
    // Build room summary by floor
    var fg={};
    S.rooms.forEach(function(r){var f=r.floor||'一楼';if(!fg[f])fg[f]=[];fg[f].push(r)});
    var floors=Object.keys(fg).sort(function(a,b){return floorSortKey(a)-floorSortKey(b)});
    var roomText='';
    floors.forEach(function(fl){
      roomText+='\n【'+fl+'】\n';
      fg[fl].forEach(function(r){
        var st=S.spaceTypes.find(function(s){return s.id===r.spaceTypeId});
        roomText+='  房间: '+r.name+(st?' ('+st.name+')':'')+', 面积: '+r.area+'㎡, 周长: '+r.perimeter+'m, 高: '+r.height+'m, 门:'+(r.doors||[]).length+'扇, 窗:'+(r.windows||[]).length+'扇\n';
        var ri=S.quoteItems.filter(function(q){return q.roomId===r.id});
        var catOrd=['拆除工程','砌筑工程','水电工程','防水工程','泥瓦工程','木作工程','油漆工程','墙面工程','地面工程','顶面工程','门窗工程','暖气改造','下水改造','安装工程','楼梯工程','设备产品','定制产品','特殊五金','特殊工艺','背景墙','自定义'];
        catOrd.forEach(function(cat){
          var ci2=ri.filter(function(q){return q.category===cat});
          if(!ci2.length)return;
          roomText+='    '+cat+':\n';
          ci2.forEach(function(q){
            roomText+='      - '+q.name+' | 数量:'+q.quantity+' | 单位:'+q.unit+' | 单价:¥'+q.unitPrice+' | 金额:¥'+fmt(q.quantity*q.unitPrice)+(q.description?' | '+q.description:'')+'\n';
          });
        });
      });
    });
    // Utility items
    var ui=S.quoteItems.filter(function(q){return q.roomId==='__utility__'});
    if(ui.length){
      roomText+='\n【水电暖气下水】\n';
      ui.forEach(function(q){
        roomText+='  - '+q.name+' | 数量:'+q.quantity+' | 单位:'+q.unit+' | 单价:¥'+q.unitPrice+' | 金额:¥'+fmt(q.quantity*q.unitPrice)+'\n';
      });
    }
    // Product items
    if(S.productQuoteItems.length){
      roomText+='\n【产品清单】\n';
      S.productQuoteItems.forEach(function(q){
        roomText+='  - '+q.name+' | 数量:'+q.quantity+' | 单位:'+q.unit+' | 单价:¥'+q.unitPrice+' | 金额:¥'+fmt(q.quantity*q.unitPrice)+'\n';
      });
    }
    var summary='工程报价: ¥'+fmt(totals.engTotal)+'\n产品清单: ¥'+fmt(totals.prodTotal)+'\n直接费用: ¥'+fmt(totals.subtotal)+'\n管理费('+S.managementFeeRate+'%): ¥'+fmt(totals.mgmt)+'\n税金('+S.taxRate+'%): ¥'+fmt(totals.tax)+'\n垃圾清运: ¥'+fmt(S.garbageFee)+'\n成品保护: ¥'+fmt(S.protectionFee)+'\n报价总计: ¥'+fmt(totals.grandTotal);
    return'你是一位专业的装修报价审核专家。请仔细审核以下报价数据，重点检查：\n1. 漏项：是否有常见的装修项目遗漏（如某房间缺少墙面/地面/顶面处理、缺少踢脚线、缺少门套窗套等）\n2. 单价不统一：相同或类似项目在不同房间的单价是否一致\n3. 数量异常：数量是否与房间尺寸匹配（如墙面面积是否合理、踢脚线长度是否合理）\n4. 逻辑错误：如有门但无门套、有窗但无窗套、卫生间缺防水等\n5. 价格合理性：单价是否在合理区间\n\n请用中文逐项列出发现的问题，每条包含：问题类型、具体项目、所在房间、问题描述、建议修正。\n如果没有发现问题，说明报价整体合理。\n\n--- 报价数据 ---\n客户: '+ci.name+' | 地址: '+ci.address+' | 工艺: '+(plans[S.currentPlan]||'')+' | 面积: '+ci.area+'㎡\n\n'+roomText+'\n--- 费用汇总 ---\n'+summary+(S.customNotes?'\n\n备注: '+S.customNotes:'');
  };

  window.startAiAudit = async function() {
    var provider=S.aiProvider;
    var apiUrl=S.aiApiUrl;
    var apiKey=S.aiApiKey;
    var model=S.ollamaModel;
    if(!model){showToast('请先在系统设置中配置AI模型');return}
    S.aiProvider=provider;
    S.aiApiUrl=apiUrl;
    S.aiApiKey=apiKey;
    S.ollamaModel=model;
    S.ollamaUrl=provider==='ollama'?apiUrl:S.ollamaUrl;
    saveSettings();
    var resultEl=document.getElementById('aiResult');
    resultEl.innerHTML='<div class="ai-loading"><div class="spinner"></div> 正在连接AI并审核报价...</div>';
    stopAiAudit();
    _aiAbortController=new AbortController();
    var prompt=buildAuditPrompt();
    var fullText='';
    try{
      var fetchOpts={method:'POST',headers:{},signal:_aiAbortController.signal};
      var endpoint='';
      if(provider==='ollama'){
        endpoint=apiUrl+'/api/chat';
        fetchOpts.headers['Content-Type']='application/json';
        fetchOpts.body=JSON.stringify({
          model:model,
          messages:[
            {role:'system',content:'你是专业的装修报价审核专家，请用中文回复，条理清晰。'},
            {role:'user',content:prompt}
          ],
          stream:true,
          options:{temperature:0.3}
        });
      }else{
        var chatPath=provider==='zhipu'?'/v4/chat/completions':provider==='doubao'?'/chat/completions':'/v1/chat/completions';
        endpoint=apiUrl.replace(/\/+$/,'')+chatPath;
        fetchOpts.headers['Content-Type']='application/json';
        fetchOpts.headers['Authorization']='Bearer '+apiKey;
        fetchOpts.body=JSON.stringify({
          model:model,
          messages:[
            {role:'system',content:'你是专业的装修报价审核专家，请用中文回复，条理清晰。'},
            {role:'user',content:prompt}
          ],
          stream:true,
          temperature:0.3
        });
      }
      var resp=await fetch(endpoint,fetchOpts);
      if(!resp.ok){
        var errText='';
        try{errText=await resp.text()}catch(e){}
        throw new Error('API请求失败: '+resp.status+' '+resp.statusText+(errText?' - '+errText:''));
      }
      var reader=resp.body.getReader();
      var decoder=new TextDecoder();
      var buffer='';
      while(true){
        var chunk=await reader.read();
        if(chunk.done)break;
        buffer+=decoder.decode(chunk.value,{stream:true});
        var lines=buffer.split('\n');
        buffer=lines.pop();
        for(var i=0;i<lines.length;i++){
          var line=lines[i].trim();
          if(!line)continue;
          if(line.startsWith('data: '))line=line.substring(6);
          if(line==='[DONE]')continue;
          try{
            var json=JSON.parse(line);
            var content='';
            if(provider==='ollama'){
              if(json.message&&json.message.content)content=json.message.content;
            }else{
              if(json.choices&&json.choices[0]&&json.choices[0].delta&&json.choices[0].delta.content)content=json.choices[0].delta.content;
            }
            if(content){
              fullText+=content;
              resultEl.textContent=fullText;
              resultEl.scrollTop=resultEl.scrollHeight;
            }
          }catch(e){}
        }
      }
      if(!fullText)resultEl.textContent='审核完成，但未返回结果。请检查模型是否支持中文。';
    }catch(e){
      if(e.name==='AbortError'){
        resultEl.textContent=fullText||'审核已停止';
      }else{
        resultEl.textContent='审核出错: '+e.message+'\n\n请确认:\n1. '+(provider==='ollama'?'Ollama服务已启动':'API Key正确')+'\n2. 地址和端口正确\n3. 模型名称已安装'+(provider!=='ollama'?'\n4. 网络可访问API地址':'');
      }
    }finally{
      _aiAbortController=null;
    }
  };

  window.saveAiApiConfig = function() {
    var provider=document.getElementById('aiProvider').value;
    var apiUrl=document.getElementById('aiApiUrl').value.trim();
    var apiKey=document.getElementById('aiApiKey').value.trim();
    var model=document.getElementById('aiModel').value.trim();
    S.aiProvider=provider;
    S.aiApiUrl=apiUrl;
    S.aiApiKey=apiKey;
    S.ollamaModel=model;
    if(provider==='ollama')S.ollamaUrl=apiUrl;
    saveSettings();
    showToast('AI接口设置已保存');
  };

  window.saveAiPromptConfig = function() {
    var cp=document.getElementById('bossAiConstructionPrompt');
    var pp=document.getElementById('bossAiProductPrompt');
    if(cp)S.aiOptimizeConstructionPrompt=cp.value.trim();
    if(pp)S.aiOptimizeProductPrompt=pp.value.trim();
    saveSettings();
    showToast('AI优化提示词已保存');
  };

  window.resetAiPromptConfig = function() {
    S.aiOptimizeConstructionPrompt='你是一位资深室内装饰工艺专家。请优化以下施工明细说明，严格遵循室内装饰行业规范，仅标注核心专业信息，无营销冗余表述。施工明细明确施工工序、工艺标准、人工规范、隐蔽工程做法及验收节点。保持原有核心信息，补充缺失的专业参数，修正不规范的表述，使说明更加专业、完整、合规。直接输出优化后的施工明细，不要加前缀说明。';
    S.aiOptimizeProductPrompt='你是一位资深室内装饰材料专家。请优化以下产品说明，严格遵循室内装饰行业规范，仅标注核心专业信息，无营销冗余表述。材料明细标注主材/辅材品牌、型号、规格、环保等级（ENF/E0/E1级、无醛添加）、材质参数及国家环保检测标准；设备明细列明品牌、型号、功率、尺寸、安装规范与质保参数；软装明细标注材质、面料、填充物环保等级、尺寸及工艺标准。保持原有核心信息，补充缺失的专业参数，修正不规范的表述，使说明更加专业、完整、合规。直接输出优化后的产品说明，不要加前缀说明。';
    saveSettings();
    renderBossView();
    showToast('已恢复默认提示词');
  };

  window.testAiConnection = function() {
    var provider=document.getElementById('aiProvider').value;
    var apiUrl=document.getElementById('aiApiUrl').value.trim();
    var apiKey=document.getElementById('aiApiKey').value.trim();
    var model=document.getElementById('aiModel').value.trim();
    if(!model){showToast('请先输入模型名称');return}
    showToast('正在测试连接...');
    var endpoint='';
    var fetchOpts={method:'POST',headers:{'Content-Type':'application/json'}};
    if(provider==='ollama'){
      endpoint=apiUrl+'/api/chat';
      fetchOpts.body=JSON.stringify({model:model,messages:[{role:'user',content:'你好'}],stream:false});
    }else{
      var chatPath=provider==='zhipu'?'/v4/chat/completions':provider==='doubao'?'/chat/completions':'/v1/chat/completions';
      endpoint=apiUrl.replace(/\/+$/,'')+chatPath;
      fetchOpts.headers['Authorization']='Bearer '+apiKey;
      fetchOpts.body=JSON.stringify({model:model,messages:[{role:'user',content:'你好'}],stream:false,temperature:0.3});
    }
    fetch(endpoint,fetchOpts).then(function(r){
      if(r.ok){
        showToast('✅ 连接成功！模型可用');
      }else{
        return r.text().then(function(t){throw new Error(r.status+' '+t)});
      }
    }).catch(function(e){
      showToast('❌ 连接失败: '+e.message);
    });
  };

})();
