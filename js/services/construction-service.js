// 施工管理模块
// 处理施工进度表、施工人员管理等功能

(function() {

  window.showConstructionView = function() {
    checkDirty(function() {
      renderConstructionView();
      showView('construction');
    });
  };

  window.renderConstructionView = function() {
    var el = document.getElementById('constructionView');
    if (!el) return;

    var workers = S.workers || [];
    var schedule = S.constructionSchedule || [];
    var respectHolidays = S.respectHolidays !== false;

    var html = '<div class="construction-container">';

    // 头部导航
    html += '<div class="construction-header">';
    html += '<h2 style="display:flex;align-items:center;gap:6px"><span style="font-size:20px">👷</span>施工管理</h2>';
    html += '<div style="display:flex;gap:8px;align-items:center">';
    html += '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:12px"><input type="checkbox" id="respectHolidays" ' + (respectHolidays ? 'checked' : '') + ' onchange="toggleRespectHolidays()"> 遵守法定节假日</label>';
    html += '<button class="btn btn-outline btn-sm" onclick="generateConstructionSchedule()">🔄 生成施工计划</button>';
    html += '<button class="btn btn-primary btn-sm" onclick="saveConstructionData()">💾 保存</button>';
    html += '<button class="btn btn-ghost btn-sm" onclick="showView(\'quotation\')">← 返回报价</button>';
    html += '</div></div>';

    // 两栏布局
    html += '<div class="construction-layout">';

    // 左侧：施工人员管理
    html += '<div class="construction-left">';
    html += '<div class="card"><div class="card-header"><h3>👥 施工人员管理</h3><button class="btn btn-primary btn-sm" onclick="openWorkerEditor()">+ 添加工人</button></div>';
    html += '<div class="card-body">';

    if (workers.length === 0) {
      html += '<div class="empty-state"><div class="icon">👷</div><p>暂无施工人员信息</p><p style="font-size:12px;color:var(--text-dim)">点击上方按钮添加工人信息</p></div>';
    } else {
      html += '<table class="workers-table"><thead><tr><th>工种</th><th>姓名</th><th>联系方式</th><th>计价方式</th><th>人数</th><th>操作</th></tr></thead><tbody>';
      workers.forEach(function(w, i) {
        html += '<tr data-worker-id="' + w.id + '">';
        html += '<td>' + esc(w.type || '') + '</td>';
        html += '<td>' + esc(w.name || '') + '</td>';
        html += '<td>' + esc(w.phone || '') + '</td>';
        html += '<td>' + esc(w.pricing || '') + '</td>';
        html += '<td>' + (w.count || 1) + '</td>';
        html += '<td><button class="btn btn-outline btn-sm" onclick="editWorker(\'' + w.id + '\')">编辑</button> ';
        html += '<button class="btn btn-danger btn-sm" onclick="deleteWorker(\'' + w.id + '\')">删除</button></td>';
        html += '</tr>';
      });
      html += '</tbody></table>';
    }

    html += '</div></div>'; // card-body and card

    // 工种统计
    var typeStats = {};
    workers.forEach(function(w) {
      var type = w.type || '其他';
      typeStats[type] = (typeStats[type] || 0) + (w.count || 1);
    });

    html += '<div class="card"><div class="card-header"><h3>📊 工种统计</h3></div><div class="card-body">';
    if (Object.keys(typeStats).length === 0) {
      html += '<div style="text-align:center;padding:12px;color:var(--text-dim);font-size:12px">暂无工种数据</div>';
    } else {
      html += '<div style="display:flex;flex-wrap:wrap;gap:8px">';
      Object.keys(typeStats).forEach(function(type) {
        html += '<div class="worker-type-tag"><span class="worker-type-name">' + esc(type) + '</span><span class="worker-type-count">' + typeStats[type] + '人</span></div>';
      });
      html += '</div>';
    }
    html += '</div></div>';

    html += '</div>'; // construction-left

    // 右侧：施工进度甘特图
    html += '<div class="construction-right">';
    html += '<div class="card"><div class="card-header"><h3>📅 施工进度计划</h3><div style="display:flex;gap:6px"><button class="btn btn-outline btn-sm" onclick="addScheduleItem()">+ 添加任务</button><button class="btn btn-outline btn-sm" onclick="autoArrangeSchedule()">🔧 自动排期</button></div></div>';
    html += '<div class="card-body">';

    if (schedule.length === 0) {
      html += '<div class="empty-state"><div class="icon">📅</div><p>暂无施工进度计划</p><p style="font-size:12px;color:var(--text-dim)">点击"生成施工计划"基于报价自动生成，或手动添加任务</p></div>';
    } else {
      // 甘特图容器
      html += '<div id="ganttContainer" style="overflow-x:auto;max-width:100%">';
      html += '<table class="gantt-table" id="ganttTable">';
      html += '<thead><tr><th style="width:180px">施工任务</th><th style="width:100px">工种</th><th style="width:80px">工期(天)</th><th style="width:120px">开始日期</th><th style="width:120px">结束日期</th><th style="width:150px">施工人员</th><th style="width:60px">状态</th><th style="width:80px">操作</th></tr></thead>';
      html += '<tbody id="ganttBody">';

      schedule.forEach(function(task, index) {
        var startDate = task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '';
        var endDate = task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '';
        var duration = task.duration || 1;
        var statusColors = {pending:'var(--text-dim)',in_progress:'var(--warning)',completed:'var(--success)'};
        var statusText = {pending:'未开始',in_progress:'进行中',completed:'已完成'};
        var status = task.status || 'pending';

        html += '<tr data-task-id="' + task.id + '" draggable="true" ondragstart="dragScheduleItem(event)" ondragover="allowDrop(event)" ondrop="dropScheduleItem(event)">';
        html += '<td><div style="display:flex;align-items:center;gap:4px"><span style="cursor:move">↕️</span><input type="text" value="' + esc(task.name || '') + '" style="width:100%;border:none;background:none;padding:2px 4px" onchange="updateTaskField(\'' + task.id + '\', \'name\', this.value)"></div></td>';
        html += '<td><select style="width:100%;padding:2px 4px;border:1px solid var(--border)" onchange="updateTaskField(\'' + task.id + '\', \'workerType\', this.value)">';
        html += '<option value="">选择工种</option>';
        Object.keys(typeStats).forEach(function(type) {
          html += '<option value="' + esc(type) + '" ' + (task.workerType === type ? 'selected' : '') + '>' + esc(type) + '</option>';
        });
        html += '</select></td>';
        html += '<td><div style="display:flex;align-items:center;gap:4px"><input type="number" value="' + duration + '" min="1" max="30" style="width:50px;padding:2px 4px;border:1px solid var(--border)" onchange="updateTaskDuration(\'' + task.id + '\', this.value)">天</div></td>';
        html += '<td><input type="date" value="' + startDate + '" style="width:100%;padding:2px 4px;border:1px solid var(--border)" onchange="updateTaskDate(\'' + task.id + '\', \'startDate\', this.value)"></td>';
        html += '<td><input type="date" value="' + endDate + '" style="width:100%;padding:2px 4px;border:1px solid var(--border)" onchange="updateTaskDate(\'' + task.id + '\', \'endDate\', this.value)"></td>';
        html += '<td><select style="width:100%;padding:2px 4px;border:1px solid var(--border)" onchange="updateTaskField(\'' + task.id + '\', \'workerId\', this.value)">';
        html += '<option value="">选择工人</option>';
        workers.filter(function(w) { return !task.workerType || w.type === task.workerType; }).forEach(function(w) {
          html += '<option value="' + w.id + '" ' + (task.workerId === w.id ? 'selected' : '') + '>' + esc(w.name) + ' (' + (w.type || '') + ')</option>';
        });
        html += '</select></td>';
        html += '<td><select style="width:100%;padding:2px 4px;border:1px solid var(--border);color:' + (statusColors[status] || 'var(--text)') + '" onchange="updateTaskField(\'' + task.id + '\', \'status\', this.value)">';
        html += '<option value="pending" ' + (status === 'pending' ? 'selected' : '') + '>未开始</option>';
        html += '<option value="in_progress" ' + (status === 'in_progress' ? 'selected' : '') + '>进行中</option>';
        html += '<option value="completed" ' + (status === 'completed' ? 'selected' : '') + '>已完成</option>';
        html += '</select></td>';
        html += '<td><button class="btn btn-outline btn-sm" onclick="moveTaskUp(\'' + task.id + '\')">↑</button> <button class="btn btn-outline btn-sm" onclick="moveTaskDown(\'' + task.id + '\')">↓</button></td>';
        html += '</tr>';
      });

      html += '</tbody></table></div>';

      // 甘特图时间轴
      html += '<div style="margin-top:20px"><h4 style="font-size:13px;margin-bottom:8px">📊 甘特图时间轴</h4>';
      html += '<div id="ganttTimeline" style="height:60px;background:var(--bg-light);border-radius:4px;position:relative;margin-top:8px;overflow-x:auto;padding:8px"></div></div>';
    }

    html += '</div></div>'; // card-body and card

    // 进度统计
    var totalTasks = schedule.length;
    var completedTasks = schedule.filter(function(t) { return t.status === 'completed'; }).length;
    var progress = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;

    html += '<div class="card"><div class="card-header"><h3>📈 进度统计</h3></div><div class="card-body">';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">';
    html += '<div style="text-align:center"><div style="font-size:11px;color:var(--text-dim)">总任务数</div><div style="font-size:20px;font-weight:700">' + totalTasks + '</div></div>';
    html += '<div style="text-align:center"><div style="font-size:11px;color:var(--text-dim)">完成率</div><div style="font-size:20px;font-weight:700;color:' + (progress >= 80 ? 'var(--success)' : progress >= 50 ? 'var(--warning)' : 'var(--danger)') + '">' + progress + '%</div></div>';
    html += '<div style="text-align:center"><div style="font-size:11px;color:var(--text-dim)">预计总工期</div><div style="font-size:20px;font-weight:700">' + schedule.reduce(function(sum, t) { return sum + (t.duration || 1); }, 0) + '天</div></div>';
    html += '</div>';
    html += '<div style="margin-top:12px"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><span>整体进度</span><span>' + completedTasks + '/' + totalTasks + '</span></div>';
    html += '<div class="progress-bar"><div class="progress-fill" style="width:' + progress + '%;background:' + (progress >= 80 ? 'var(--success)' : progress >= 50 ? 'var(--warning)' : 'var(--accent)') + '"></div></div></div>';
    html += '</div></div>';

    html += '</div>'; // construction-right

    html += '</div>'; // construction-layout
    html += '</div>'; // construction-container

    el.innerHTML = html;

    // 渲染甘特图时间轴
    if (schedule.length > 0) {
      renderGanttTimeline();
    }
  };

  window.toggleRespectHolidays = function() {
    S.respectHolidays = document.getElementById('respectHolidays').checked;
    markDirty();
    if (S.constructionSchedule.length > 0) {
      recalculateScheduleDates();
    }
  };

  window.generateConstructionSchedule = function() {
    // 基于当前报价自动生成施工计划
    pushUndoState();

    // 默认施工任务模板
    var defaultTasks = [
      { name: '拆除工程', workerType: '拆除工', duration: 2 },
      { name: '水电改造', workerType: '水电工', duration: 5 },
      { name: '防水工程', workerType: '防水工', duration: 3 },
      { name: '瓦工铺贴', workerType: '瓦工', duration: 7 },
      { name: '木工制作', workerType: '木工', duration: 6 },
      { name: '油漆工程', workerType: '油漆工', duration: 8 },
      { name: '安装工程', workerType: '安装工', duration: 4 },
      { name: '保洁收尾', workerType: '保洁工', duration: 2 }
    ];

    var startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // 从明天开始
    var startDateStr = startDate.toISOString().split('T')[0];

    // 如果第一个开始日期是节假日，向后移动
    if (S.respectHolidays !== false) {
      while (isHoliday(startDateStr)) {
        startDate.setDate(startDate.getDate() + 1);
        startDateStr = startDate.toISOString().split('T')[0];
      }
    }

    var schedule = [];
    defaultTasks.forEach(function(task, i) {
      var taskStart = startDateStr;
      var taskEnd = addBusinessDays(taskStart, task.duration);

      schedule.push({
        id: uid(),
        name: task.name,
        workerType: task.workerType,
        duration: task.duration,
        startDate: taskStart,
        endDate: taskEnd,
        status: 'pending',
        order: i
      });

      // 下一个任务从当前任务结束后开始
      startDateStr = addBusinessDays(taskEnd, 1);
    });

    S.constructionSchedule = schedule;
    // 重新计算以确保一致性
    recalculateScheduleDates();
    showToast('已生成默认施工计划（考虑节假日）');
  };

  window.saveConstructionData = function() {
    pushUndoState();
    // 状态已自动更新，只需标记脏数据
    markDirty();
    showToast('施工数据已保存');
  };

  window.openWorkerEditor = function(workerId) {
    var worker = workerId ? S.workers.find(function(w) { return w.id === workerId; }) : null;
    document.getElementById('workerEditorTitle').textContent = worker ? '编辑工人信息' : '添加工人信息';

    var html = '<div class="form-grid">';
    html += '<div class="form-group"><label>工种</label><input id="workerType" value="' + (worker ? esc(worker.type || '') : '') + '" placeholder="如：水电工、瓦工"></div>';
    html += '<div class="form-group"><label>姓名</label><input id="workerName" value="' + (worker ? esc(worker.name || '') : '') + '"></div>';
    html += '<div class="form-group"><label>联系方式</label><input id="workerPhone" value="' + (worker ? esc(worker.phone || '') : '') + '"></div>';
    html += '<div class="form-group"><label>人数</label><input type="number" id="workerCount" value="' + (worker ? (worker.count || 1) : 1) + '" min="1" max="10"></div>';
    html += '<div class="form-group full"><label>收费计价方式</label><input id="workerPricing" value="' + (worker ? esc(worker.pricing || '') : '') + '" placeholder="如：按天计费、按平方计费、包工"></div>';
    html += '<div class="form-group full"><label>备注</label><textarea id="workerNotes" style="height:60px" placeholder="技能等级、工作经验等">' + (worker ? esc(worker.notes || '') : '') + '</textarea></div>';
    html += '</div>';

    document.getElementById('workerEditorBody').innerHTML = html;
    document.getElementById('workerEditorSave').onclick = function() { saveWorker(workerId); };
    openModal('workerEditorModal');
  };

  window.saveWorker = function(workerId) {
    var type = document.getElementById('workerType').value.trim();
    var name = document.getElementById('workerName').value.trim();
    var phone = document.getElementById('workerPhone').value.trim();
    var count = parseInt(document.getElementById('workerCount').value) || 1;
    var pricing = document.getElementById('workerPricing').value.trim();
    var notes = document.getElementById('workerNotes').value.trim();

    if (!type || !name) {
      showToast('请填写工种和姓名');
      return;
    }

    pushUndoState();

    if (workerId) {
      // 编辑现有工人
      var idx = S.workers.findIndex(function(w) { return w.id === workerId; });
      if (idx >= 0) {
        S.workers[idx] = {
          id: workerId,
          type: type,
          name: name,
          phone: phone,
          count: count,
          pricing: pricing,
          notes: notes
        };
      }
    } else {
      // 添加新工人
      S.workers.push({
        id: uid(),
        type: type,
        name: name,
        phone: phone,
        count: count,
        pricing: pricing,
        notes: notes
      });
    }

    closeModal('workerEditorModal');
    renderConstructionView();
    showToast('工人信息已保存');
  };

  window.editWorker = function(id) {
    openWorkerEditor(id);
  };

  window.deleteWorker = function(id) {
    if (!confirm('确定删除该工人信息？')) return;
    pushUndoState();
    S.workers = S.workers.filter(function(w) { return w.id !== id; });
    renderConstructionView();
    showToast('工人信息已删除');
  };

  window.addScheduleItem = function() {
    pushUndoState();

    // 确定开始日期：如果没有任务，从明天开始；否则从最后一个任务结束后开始
    var startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    var startDateStr = startDate.toISOString().split('T')[0];

    if (S.constructionSchedule.length > 0) {
      // 获取最后一个任务的结束日期
      var lastTask = S.constructionSchedule[S.constructionSchedule.length - 1];
      if (lastTask.endDate) {
        startDateStr = addBusinessDays(lastTask.endDate, 1);
      }
    }

    // 确保开始日期不是节假日
    if (S.respectHolidays !== false) {
      while (isHoliday(startDateStr)) {
        var date = new Date(startDateStr);
        date.setDate(date.getDate() + 1);
        startDateStr = date.toISOString().split('T')[0];
      }
    }

    var endDateStr = addBusinessDays(startDateStr, 3); // 默认3天

    S.constructionSchedule.push({
      id: uid(),
      name: '新任务',
      workerType: '',
      duration: 3,
      startDate: startDateStr,
      endDate: endDateStr,
      status: 'pending',
      order: S.constructionSchedule.length
    });

    // 重新计算日期（确保不重叠）
    recalculateScheduleDates();
  };

  window.updateTaskField = function(taskId, field, value) {
    pushUndoState();
    var task = S.constructionSchedule.find(function(t) { return t.id === taskId; });
    if (task) {
      task[field] = value;
      if (field === 'workerType') {
        // 清空已选择的工人，因为工种变了
        task.workerId = '';
      }
      markDirty();
    }
  };

  window.updateTaskDuration = function(taskId, duration) {
    duration = parseInt(duration) || 1;
    if (duration < 1) duration = 1;
    if (duration > 30) duration = 30;

    pushUndoState();
    var task = S.constructionSchedule.find(function(t) { return t.id === taskId; });
    if (task) {
      task.duration = duration;
      // 重新计算整个计划（考虑节假日和任务依赖）
      recalculateScheduleDates();
      markDirty();
    }
  };

  window.updateTaskDate = function(taskId, field, dateValue) {
    pushUndoState();
    var task = S.constructionSchedule.find(function(t) { return t.id === taskId; });
    if (task) {
      task[field] = dateValue;

      // 更新相关日期，考虑节假日
      if (field === 'startDate' && dateValue) {
        // 确保开始日期不是节假日
        if (S.respectHolidays !== false) {
          var startStr = dateValue;
          while (isHoliday(startStr)) {
            var date = new Date(startStr);
            date.setDate(date.getDate() + 1);
            startStr = date.toISOString().split('T')[0];
          }
          task.startDate = startStr;
        }
        // 使用节假日计算结束日期
        task.endDate = addBusinessDays(task.startDate, task.duration || 1);
      } else if (field === 'endDate' && dateValue && task.startDate) {
        // 计算持续时间，考虑节假日
        var start = new Date(task.startDate);
        var end = new Date(dateValue);
        // 计算实际工作日天数
        var days = 0;
        var current = new Date(start);
        while (current <= end) {
          var currentStr = current.toISOString().split('T')[0];
          if (!isHoliday(currentStr)) {
            days++;
          }
          current.setDate(current.getDate() + 1);
        }
        if (days > 0) task.duration = days;
        task.endDate = dateValue;
      }

      // 重新计算整个计划以确保任务不重叠
      recalculateScheduleDates();
      markDirty();
    }
  };

  window.moveTaskUp = function(taskId) {
    var idx = S.constructionSchedule.findIndex(function(t) { return t.id === taskId; });
    if (idx <= 0) return;

    pushUndoState();
    var temp = S.constructionSchedule[idx];
    S.constructionSchedule[idx] = S.constructionSchedule[idx-1];
    S.constructionSchedule[idx-1] = temp;
    // 重新计算日期，因为顺序已改变
    recalculateScheduleDates();
  };

  window.moveTaskDown = function(taskId) {
    var idx = S.constructionSchedule.findIndex(function(t) { return t.id === taskId; });
    if (idx < 0 || idx >= S.constructionSchedule.length - 1) return;

    pushUndoState();
    var temp = S.constructionSchedule[idx];
    S.constructionSchedule[idx] = S.constructionSchedule[idx+1];
    S.constructionSchedule[idx+1] = temp;
    // 重新计算日期，因为顺序已改变
    recalculateScheduleDates();
  };

  window.dragScheduleItem = function(e) {
    e.dataTransfer.setData('text/plain', e.target.closest('tr').dataset.taskId);
  };

  window.allowDrop = function(e) {
    e.preventDefault();
  };

  window.dropScheduleItem = function(e) {
    e.preventDefault();
    var draggedId = e.dataTransfer.getData('text/plain');
    var targetRow = e.target.closest('tr');
    if (!targetRow || !draggedId) return;

    var targetId = targetRow.dataset.taskId;
    if (!targetId || draggedId === targetId) return;

    var draggedIdx = S.constructionSchedule.findIndex(function(t) { return t.id === draggedId; });
    var targetIdx = S.constructionSchedule.findIndex(function(t) { return t.id === targetId; });
    if (draggedIdx < 0 || targetIdx < 0) return;

    pushUndoState();
    var draggedItem = S.constructionSchedule[draggedIdx];
    S.constructionSchedule.splice(draggedIdx, 1);
    S.constructionSchedule.splice(targetIdx, 0, draggedItem);
    // 重新计算日期，因为顺序已改变
    recalculateScheduleDates();
  };

  window.autoArrangeSchedule = function() {
    if (S.constructionSchedule.length === 0) return;

    pushUndoState();

    // 按照当前顺序重新安排日期，考虑节假日
    var startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    var startDateStr = startDate.toISOString().split('T')[0];

    // 如果第一个开始日期是节假日，向后移动
    while (isHoliday(startDateStr) && S.respectHolidays !== false) {
      startDate.setDate(startDate.getDate() + 1);
      startDateStr = startDate.toISOString().split('T')[0];
    }

    S.constructionSchedule.forEach(function(task, i) {
      task.startDate = startDateStr;
      var endDateStr = addBusinessDays(startDateStr, task.duration || 1);
      task.endDate = endDateStr;

      // 下一个任务从上一个任务结束后开始
      startDateStr = addBusinessDays(endDateStr, 1);
    });

    renderConstructionView();
    showToast('已自动重新排期（考虑节假日）');
  };

  window.recalculateScheduleDates = function() {
    if (!S.constructionSchedule || S.constructionSchedule.length === 0) return;

    pushUndoState();

    var prevEndDate = null;
    S.constructionSchedule.forEach(function(task, i) {
      // 如果任务没有开始日期，设置为明天
      if (!task.startDate) {
        var startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
        task.startDate = startDate.toISOString().split('T')[0];
      }

      // 确保开始日期不是节假日
      if (S.respectHolidays !== false) {
        var startStr = task.startDate;
        while (isHoliday(startStr)) {
          var date = new Date(startStr);
          date.setDate(date.getDate() + 1);
          startStr = date.toISOString().split('T')[0];
        }
        task.startDate = startStr;
      }

      // 计算结束日期，考虑节假日
      task.endDate = addBusinessDays(task.startDate, task.duration || 1);

      // 确保任务不重叠（如果前一个任务存在）
      if (prevEndDate && task.startDate < prevEndDate) {
        task.startDate = addBusinessDays(prevEndDate, 1);
        task.endDate = addBusinessDays(task.startDate, task.duration || 1);
      }

      prevEndDate = task.endDate;
    });

    renderConstructionView();
  };

  window.renderGanttTimeline = function() {
    var container = document.getElementById('ganttTimeline');
    if (!container) return;

    // 简化版时间轴渲染
    container.innerHTML = '<div style="white-space:nowrap;padding:4px 8px;font-size:11px;color:var(--text-light)">甘特图时间轴（简化显示）</div>';
  };

  console.log('✅ 施工管理模块已加载');
})();
