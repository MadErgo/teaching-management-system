// 模拟数据存储
const users = {
    'admin': { password: 'admin123', role: 'admin', name: '教务管理员' },
    '202401': { password: '123456', role: 'teacher', name: '韩帅' },
    '202402': { password: '123456', role: 'teacher', name: '郑宸昆' },
    '202403': { password: '123456', role: 'teacher', name: '王雅实' },
    '202404': { password: '123456', role: 'teacher', name: '张红岩' }
};

// 业务权限配置
const businessPermissions = {
    'teaching-activity': ['202401', '202402', '202403', '202404'], // 基层教学组织负责人
    'textbook-entry': ['202401', '202402', '202403', '202404'], // 所有任课教师
    'course-assessment': ['202401', '202402', '202403', '202404'],
    'exam-fee': ['202401', '202402', '202403', '202404'] // 课程负责人（命题费）
};

let currentUser = null;
let currentUserRole = null;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已登录
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        currentUserRole = users[currentUser].role;
        showMainSystem();
    }

    // 登录表单提交
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
});

function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    if (users[username] && users[username].password === password) {
        currentUser = username;
        currentUserRole = users[username].role;
        localStorage.setItem('currentUser', username);
        
        errorDiv.classList.add('hidden');
        showMainSystem();
    } else {
        errorDiv.classList.remove('hidden');
    }
}

function showMainSystem() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('main-system').style.display = 'block';
    
    // 设置用户信息
    document.getElementById('current-user').textContent = users[currentUser].name;
    document.getElementById('user-role').textContent = currentUserRole === 'admin' ? '管理员' : '教师';
    
    // 显示对应的仪表板
    if (currentUserRole === 'admin') {
        document.getElementById('teacher-dashboard').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
    } else {
        document.getElementById('admin-dashboard').classList.add('hidden');
        document.getElementById('teacher-dashboard').classList.remove('hidden');
        loadTeacherTasks();
    }
}

function loadTeacherTasks() {
    const pendingTasksList = document.getElementById('pending-tasks');
    const completedTasksList = document.getElementById('completed-tasks');
    
    // 清空现有任务
    pendingTasksList.innerHTML = '';
    completedTasksList.innerHTML = '';
    
    let pendingCount = 0;
    let completedCount = 0;
    
    // 根据用户权限加载任务
    for (const [businessId, allowedUsers] of Object.entries(businessPermissions)) {
        if (allowedUsers.includes(currentUser)) {
            const businessName = getBusinessName(businessId);
            const isCompleted = Math.random() > 0.5; // 模拟完成状态
            
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            
            if (isCompleted) {
                taskItem.innerHTML = `
                    <span class="task-name">${businessName}</span>
                    <div class="task-action">
                        <button class="btn btn-secondary" onclick="viewHistory('${businessId}')">查看历史</button>
                    </div>
                `;
                completedTasksList.appendChild(taskItem);
                completedCount++;
            } else {
                taskItem.innerHTML = `
                    <span class="task-name">${businessName}</span>
                    <div class="task-action">
                        <button class="btn btn-primary" onclick="openBusiness('${businessId}')">去填报</button>
                    </div>
                `;
                pendingTasksList.appendChild(taskItem);
                pendingCount++;
            }
        }
    }
    
    document.getElementById('pending-count').textContent = pendingCount;
    document.getElementById('completed-count').textContent = completedCount;
}

function getBusinessName(businessId) {
    const names = {
        'teaching-activity': '基层教学组织活动开展计划',
        'textbook-entry': '教材信息录入',
        'course-assessment': '课程考核备案',
        'exam-fee': '命题费统计填报'
    };
    return names[businessId] || businessId;
}

function openBusiness(businessId) {
    document.getElementById('teacher-dashboard').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('business-form-page').classList.remove('hidden');
    
    document.getElementById('business-title').textContent = getBusinessName(businessId);
    
    // 加载具体的业务表单
    loadBusinessForm(businessId);
}

function loadBusinessForm(businessId) {
    const formContent = document.getElementById('business-form-content');
    
    if (businessId === 'teaching-activity') {
        // 加载基层教学组织活动表单
        formContent.innerHTML = `
            <div class="form-content">
                <form id="activity-plan-form">
                    <fieldset>
                        <legend>基础信息</legend>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 15px 20px;">
                            <div class="form-group">
                                <label>学院</label>
                                <input type="text" value="发发信息管理学院" disabled>
                            </div>
                            <div class="form-group">
                                <label>基层教学组织名称</label>
                                <input type="text" id="org-name" value="${getOrgName(currentUser)}" disabled>
                            </div>
                            <div class="form-group">
                                <label>负责人</label>
                                <input type="text" value="${users[currentUser].name}" disabled>
                            </div>
                        </div>
                    </fieldset>
                    
                    <fieldset>
                        <legend>活动详情</legend>
                        <div id="activity-list">
                            <!-- 活动项目将在这里动态添加 -->
                        </div>
                        <div class="add-activity" onclick="addActivityItem()">
                            + 添加新活动
                        </div>
                    </fieldset>
                    
                    <div style="text-align: right; margin-top: 20px;">
                        <button type="button" class="btn btn-secondary" onclick="previewForm()">预览</button>
                        <button type="submit" class="btn btn-primary">提交表单</button>
                    </div>
                </form>
            </div>
        `;
        
        // 添加默认活动项
        setTimeout(() => {
            addActivityItem();
            addActivityItem();
        }, 100);
        
        // 绑定表单提交事件
        document.getElementById('activity-plan-form').addEventListener('submit', function(e) {
            e.preventDefault();
            submitBusinessForm(businessId);
        });
        
    } else if (businessId === 'exam-fee') {
        // 加载命题费统计表单
        loadExamFeeForm();
        
    } else {
        // 其他业务表单的占位符
        formContent.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h3>此业务表单正在开发中</h3>
                <p style="color: var(--dark-gray);">业务类型: ${getBusinessName(businessId)}</p>
                <button class="btn btn-primary" onclick="backToDashboard()">返回首页</button>
            </div>
        `;
    }
}

function getOrgName(userId) {
    const orgMap = {
        '202401': '计算机教研室',
        '202402': '发发信息管理教研室', 
        '202403': '应用数学教研室',
        '202404': '自然科学教研室'
    };
    return orgMap[userId] || '未知教研室';
}

function addActivityItem() {
    const activityList = document.getElementById('activity-list');
    const itemCount = activityList.children.length + 1;
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeActivity(this)">×</button>
        <div class="activity-grid">
            <div class="form-group">
                <label>序号</label>
                <input type="text" value="${itemCount}" readonly>
            </div>
            <div class="form-group">
                <label>活动名称及形式 *</label>
                <input type="text" class="activity-name" placeholder="例如：集体备课、教学研讨" required>
            </div>
            <div class="form-group">
                <label>日期 *</label>
                <input type="text" class="date-input" placeholder="例如：0910" maxlength="4" required>
            </div>
            <div class="form-group">
                <label>时间 *</label>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <select class="start-time" required>
                        ${generateTimeOptions()}
                    </select>
                    <span>—</span>
                    <select class="end-time" required>
                        ${generateTimeOptions()}
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>地点 *</label>
                <input type="text" class="location" placeholder="例如：线上、逸夫楼2062" required>
            </div>
            <div class="form-group">
                <label>备注</label>
                <input type="text" class="remark" placeholder="可选填写">
            </div>
        </div>
    `;
    
    activityList.appendChild(activityItem);
    updateActivityNumbers();
}

function generateTimeOptions() {
    let options = '';
    for (let h = 8; h < 22; h++) { 
        for (let m = 0; m < 60; m += 30) {
            const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            options += `<option value="${time}">${time}</option>`;
        }
    }
    return options;
}

function removeActivity(btn) {
    btn.parentElement.remove();
    updateActivityNumbers();
}

function updateActivityNumbers() {
    const activities = document.querySelectorAll('.activity-item');
    activities.forEach((item, index) => {
        const numberInput = item.querySelector('input[readonly]');
        if (numberInput) {
            numberInput.value = index + 1;
        }
    });
}

function submitBusinessForm(businessId) {
    if (businessId === 'teaching-activity') {
        const activities = collectActivityData();
        if (activities.length === 0) {
            alert('请至少添加一个活动！');
            return;
        }
        
        // 模拟提交到服务器
        console.log('提交数据:', activities);
        alert(`表单提交成功！\n\n业务类型：${getBusinessName(businessId)}\n活动数量：${activities.length}`);
    } else {
        alert(`${getBusinessName(businessId)} 提交成功！`);
    }
    
    // 返回首页
    backToDashboard();
}

function collectActivityData() {
    const activities = [];
    const activityItems = document.querySelectorAll('.activity-item');
    
    activityItems.forEach((item, index) => {
        const name = item.querySelector('.activity-name').value.trim();
        const date = item.querySelector('.date-input').value.trim();
        const startTime = item.querySelector('.start-time').value;
        const endTime = item.querySelector('.end-time').value;
        const location = item.querySelector('.location').value.trim();
        const remark = item.querySelector('.remark').value.trim();
        
        if (name && date && startTime && endTime && location) {
            activities.push({
                序号: index + 1,
                学院: '发发信息管理学院',
                基层教学组织名称: getOrgName(currentUser),
                负责人: users[currentUser].name,
                活动名称及形式: name,
                日期: `${date.slice(0,2)}月${date.slice(2)}日`,
                时间: `${startTime}—${endTime}`,
                地点: location,
                备注: remark
            });
        }
    });
    
    return activities;
}

function previewForm() {
    const activities = collectActivityData();
    if (activities.length === 0) {
        alert('请先添加活动信息');
        return;
    }
    
    let previewHtml = `
        <div class="modal" id="preview-modal" style="display: block;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>预览 - 基层教学组织活动开展计划表</h2>
                    <span class="close" onclick="closeModal('preview-modal')">&times;</span>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>序号</th>
                            <th>学院</th>
                            <th>基层教学组织名称</th>
                            <th>负责人</th>
                            <th>活动名称及形式</th>
                            <th>日期</th>
                            <th>时间</th>
                            <th>地点</th>
                            <th>备注</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    activities.forEach(activity => {
        previewHtml += `
            <tr>
                <td>${activity.序号}</td>
                <td>${activity.学院}</td>
                <td>${activity.基层教学组织名称}</td>
                <td>${activity.负责人}</td>
                <td>${activity.活动名称及形式}</td>
                <td>${activity.日期}</td>
                <td>${activity.时间}</td>
                <td>${activity.地点}</td>
                <td>${activity.备注}</td>
            </tr>
        `;
    });
    
    previewHtml += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', previewHtml);
}

function backToDashboard() {
    document.getElementById('business-form-page').classList.add('hidden');
    
    if (currentUserRole === 'admin') {
        document.getElementById('admin-dashboard').classList.remove('hidden');
    } else {
        document.getElementById('teacher-dashboard').classList.remove('hidden');
    }
}

function viewHistory(businessId) {
    alert(`查看历史记录功能\n业务：${getBusinessName(businessId)}\n\n此功能将显示该用户在此业务下的所有历史提交记录。`);
}

function publishBusiness(businessId) {
    const businessName = getBusinessName(businessId);
    const targetUsers = businessPermissions[businessId];
    const userNames = targetUsers.map(id => users[id]?.name || id).join('、');
    
    if (confirm(`确定要发布业务任务吗？\n\n业务名称：${businessName}\n目标用户：${userNames}\n\n发布后相关教师将在首页看到此任务。`)) {
        alert(`业务任务发布成功！\n\n${userNames} 等教师现在可以在系统中看到并完成此任务。`);
    }
}

function viewSubmissions(businessId) {
    const businessName = getBusinessName(businessId);
    
    // 模拟提交数据
    const submissions = [
        { user: '韩帅', submitTime: '2025-09-20 14:30', status: '已提交' },
        { user: '郑宸昆', submitTime: '2025-09-19 16:45', status: '已提交' },
        { user: '王雅实', submitTime: '', status: '未提交' },
        { user: '张红岩', submitTime: '2025-09-21 09:20', status: '已提交' }
    ];
    
    let modalHtml = `
        <div class="modal" id="submissions-modal" style="display: block;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${businessName} - 提交情况</h2>
                    <span class="close" onclick="closeModal('submissions-modal')">&times;</span>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>教师姓名</th>
                            <th>提交时间</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    submissions.forEach(sub => {
        modalHtml += `
            <tr>
                <td>${sub.user}</td>
                <td>${sub.submitTime || '-'}</td>
                <td><span class="badge ${sub.status === '已提交' ? 'completed' : 'pending'}">${sub.status}</span></td>
                <td>
                    ${sub.status === '已提交' ? 
                        '<button class="btn btn-secondary">查看详情</button>' : 
                        '<button class="btn btn-primary">催办</button>'
                    }
                </td>
            </tr>
        `;
    });
    
    modalHtml += `
                    </tbody>
                </table>
                <div style="margin-top: 20px; text-align: right;">
                    <button class="btn btn-success" onclick="exportData('${businessId}')">导出已提交数据</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function exportData(businessId) {
    const businessName = getBusinessName(businessId);
    
    if (businessId === 'exam-fee') {
        // 命题费导出
        const csvData = [
            ['序号', '课序号', '课程名', '上课教师', '工号', '命题份数-综合题', '命题份数-非综合题', '金额'],
            ['1', '109010062.00-01', '程序设计基础', '韩帅', 'CU008228', '2', '0', '200'],
            ['2', '109010062.00-03', '程序设计基础', '郑宸昆', 'CU008284', '2', '0', '200'],
            ['3', '309040223.01', '管理信息系统', '韩帅', 'CU008228', '0', '1', '60']
        ];
    } else {
        // 其他业务导出
        const csvData = [
            ['序号', '学院', '基层教学组织名称', '负责人', '活动名称及形式', '日期', '时间', '地点', '备注'],
            ['1', '发发信息管理学院', '计算机教研室', '韩帅', '教学研讨会', '9月15日', '14:00—16:00', '逸夫楼2062', ''],
            ['2', '发发信息管理学院', '发发信息管理教研室', '郑宸昆', '集体备课', '9月20日', '13:30—15:00', '线上', '腾讯会议']
        ];
    }
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${businessName}_导出数据_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    alert(`数据导出成功！\n\n业务：${businessName}\n文件名：${businessName}_导出数据_${new Date().toISOString().split('T')[0]}.csv`);
}

function showUserManagement() {
    document.getElementById('user-modal').style.display = 'block';
}

function showAddUser() {
    const modalHtml = `
        <div class="modal" id="add-user-modal" style="display: block;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>添加用户</h2>
                    <span class="close" onclick="closeModal('add-user-modal')">&times;</span>
                </div>
                <form id="add-user-form">
                    <div class="form-group">
                        <label>工号 *</label>
                        <input type="text" id="new-user-id" required>
                    </div>
                    <div class="form-group">
                        <label>姓名 *</label>
                        <input type="text" id="new-user-name" required>
                    </div>
                    <div class="form-group">
                        <label>初始密码 *</label>
                        <input type="text" id="new-user-password" value="123456" required>
                    </div>
                    <div class="form-group">
                        <label>角色</label>
                        <select id="new-user-role">
                            <option value="teacher">教师</option>
                            <option value="admin">管理员</option>
                        </select>
                    </div>
                    <div style="text-align: right; margin-top: 20px;">
                        <button type="button" class="btn btn-secondary" onclick="closeModal('add-user-modal')">取消</button>
                        <button type="submit" class="btn btn-primary">添加用户</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('add-user-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('new-user-id').value;
        const userName = document.getElementById('new-user-name').value;
        const userPassword = document.getElementById('new-user-password').value;
        const userRole = document.getElementById('new-user-role').value;
        
        // 添加到用户数据中
        users[userId] = {
            password: userPassword,
            role: userRole,
            name: userName
        };
        
        alert(`用户添加成功！\n\n工号：${userId}\n姓名：${userName}\n初始密码：${userPassword}`);
        closeModal('add-user-modal');
    });
}

// 批量导入用户相关函数
function showBatchImportUsers() {
    document.getElementById('batch-import-users-modal').style.display = 'block';
}

function downloadUserTemplate() {
    const templateData = [
        ['工号', '姓名', '初始密码', '角色'],
        ['202405', '示例教师', '123456', 'teacher'],
        ['202406', '示例管理员', '123456', 'admin']
    ];
    
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '用户导入模板.csv';
    link.click();
    
    alert('用户导入模板下载成功！\n\n请按照模板格式填写用户信息。');
}

function handleUsersFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // 模拟解析Excel文件
            const previewData = [
                ['工号', '姓名', '初始密码', '角色'],
                ['202405', '张三', '123456', 'teacher'],
                ['202406', '李四', '123456', 'admin'],
                ['202407', '王五', '123456', 'teacher']
            ];
            
            showUsersPreview(previewData);
        } catch (error) {
            alert('文件解析失败，请检查文件格式');
        }
    };
    reader.readAsArrayBuffer(file);
}

function showUsersPreview(data) {
    const preview = document.getElementById('users-upload-preview');
    const header = document.getElementById('users-preview-header');
    const body = document.getElementById('users-preview-body');
    
    header.innerHTML = '';
    body.innerHTML = '';
    
    if (data.length > 0) {
        const headerRow = document.createElement('tr');
        data[0].forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        header.appendChild(headerRow);
        
        for (let i = 1; i < Math.min(data.length, 11); i++) {
            const row = document.createElement('tr');
            data[i].forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                row.appendChild(td);
            });
            body.appendChild(row);
        }
    }
    
    preview.classList.remove('hidden');
}

function cancelUsersUpload() {
    document.getElementById('users-upload-preview').classList.add('hidden');
    document.getElementById('users-file-upload').value = '';
}

function confirmUsersUpload() {
    alert('用户批量导入成功！\n\n已导入 3 个用户账号。');
    closeModal('batch-import-users-modal');
}

// 命题费数据上传相关函数
function showExamFeeUpload() {
    document.getElementById('exam-fee-upload-modal').style.display = 'block';
}

function downloadExamFeeTemplate() {
    const templateData = [
        ['课序号', '课程名', '课程负责人', '上课教师', '工号'],
        ['109010062.00-01', '程序设计基础', '韩帅', '韩帅', 'CU008228'],
        ['109010062.00-02', '程序设计基础', '韩帅', '韩帅', 'CU008228'],
        ['109010062.00-03', '程序设计基础', '韩帅', '郑宸昆', 'CU008284']
    ];
    
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '命题费课程数据模板.csv';
    link.click();
    
    alert('命题费课程数据模板下载成功！\n\n请按照模板格式填写课程信息。');
}

function handleExamFeeFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const previewData = [
                ['课序号', '课程名', '课程负责人', '上课教师', '工号'],
                ['109010062.00-01', '程序设计基础', '韩帅', '韩帅', 'CU008228'],
                ['109010062.00-02', '程序设计基础', '韩帅', '韩帅', 'CU008228'],
                ['109010062.00-03', '程序设计基础', '韩帅', '郑宸昆', 'CU008284']
            ];
            
            showExamFeePreview(previewData);
        } catch (error) {
            alert('文件解析失败，请检查文件格式');
        }
    };
    reader.readAsArrayBuffer(file);
}

function showExamFeePreview(data) {
    const preview = document.getElementById('exam-fee-upload-preview');
    const header = document.getElementById('exam-fee-preview-header');
    const body = document.getElementById('exam-fee-preview-body');
    
    header.innerHTML = '';
    body.innerHTML = '';
    
    if (data.length > 0) {
        const headerRow = document.createElement('tr');
        data[0].forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        header.appendChild(headerRow);
        
        for (let i = 1; i < Math.min(data.length, 11); i++) {
            const row = document.createElement('tr');
            data[i].forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                row.appendChild(td);
            });
            body.appendChild(row);
        }
    }
    
    preview.classList.remove('hidden');
}

function cancelExamFeeUpload() {
    document.getElementById('exam-fee-upload-preview').classList.add('hidden');
    document.getElementById('exam-fee-file-upload').value = '';
}

function confirmExamFeeUpload() {
    alert('命题费课程数据导入成功！\n\n已导入课程数据，现在可以发布任务。');
    closeModal('exam-fee-upload-modal');
}-role">
                            <option value="teacher">教师</option>
                            <option value="admin">管理员</option>
                        </select>
                    </div>
                    <div style="text-align: right; margin-top: 20px;">
                        <button type="button" class="btn btn-secondary" onclick="closeModal('add-user-modal')">取消</button>
                        <button type="submit" class="btn btn-primary">添加用户</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('add-user-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('new-user-id').value;
        const userName = document.getElementById('new-user-name').value;
        const userPassword = document.getElementById('new-user-password').value;
        const userRole = document.getElementById('new-user-role').value;
        
        // 添加到用户数据中
        users[userId] = {
            password: userPassword,
            role: userRole,
            name: userName
        };
        
        alert(`用户添加成功！\n\n工号：${userId}\n姓名：${userName}\n初始密码：${userPassword}`);
        closeModal('add-user-modal');
    });
}

function exportUsers() {
    const userData = Object.entries(users).map(([id, info]) => [
        id, info.name, info.role === 'admin' ? '管理员' : '教师', '正常'
    ]);
    
    const csvData = [
        ['工号', '姓名', '角色', '状态'],
        ...userData
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `用户列表_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    currentUserRole = null;
    
    document.getElementById('main-system').style.display = 'none';
    document.getElementById('login-page').style.display = 'flex';
    
    // 清空登录表单
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// 点击模态框外部关闭
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.remove();
    }
});

// 命题费管理相关函数
function loadExamFeeForm() {
    const userName = users[currentUser].name;
    
    // 模拟课程数据（在实际应用中，这些数据会从服务器获取）
    const courseData = {
        '韩帅': [
            { courseCode: '109010062.00-01', courseName: '程序设计基础', courseLeader: '韩帅', teacher: '韩帅', teacherId: 'CU008228' },
            { courseCode: '109010062.00-02', courseName: '程序设计基础', courseLeader: '韩帅', teacher: '韩帅', teacherId: 'CU008228' },
            { courseCode: '109010062.00-03', courseName: '程序设计基础', courseLeader: '韩帅', teacher: '郑宸昆', teacherId: 'CU008284' },
            { courseCode: '309040223.01', courseName: '管理信息系统', courseLeader: '韩帅', teacher: '韩帅', teacherId: 'CU008228' },
            { courseCode: '309040273.01', courseName: 'Python程序设计', courseLeader: '韩帅', teacher: '韩帅', teacherId: 'CU008228' },
            { courseCode: '409010023.01', courseName: 'Web开发技术', courseLeader: '韩帅', teacher: '韩帅', teacherId: 'CU008228' }
        ],
        '郑宸昆': [
            { courseCode: '209010023.01', courseName: '数据结构', courseLeader: '郑宸昆', teacher: '郑宸昆', teacherId: 'CU008284' },
            { courseCode: '209010023.02', courseName: '数据结构', courseLeader: '郑宸昆', teacher: '郑宸昆', teacherId: 'CU008284' }
        ],
        '王雅实': [
            { courseCode: '105010121.01', courseName: '高等数学', courseLeader: '王雅实', teacher: '王雅实', teacherId: 'CU008285' }
        ],
        '张红岩': [
            { courseCode: '105020131.01', courseName: '物理学', courseLeader: '张红岩', teacher: '张红岩', teacherId: 'CU008286' }
        ]
    };

    const userCourses = courseData[userName] || [];

    const formContent = document.getElementById('business-form-content');
    formContent.innerHTML = `
        <div class="exam-fee-form">
            <!-- 学期选择模块 -->
            <div style="background-color: #fdfdfd; padding: 15px 30px; display: flex; align-items: center; gap: 20px; border-bottom: 1px solid var(--medium-gray); margin-bottom: 20px;">
                <select id="exam-semester-selector" style="background-color: var(--primary-white); border: 1px solid #ced4da; padding: 8px 10px; border-radius: 4px; font-size: 0.9em;">
                    <option value="25-26-1">2025-2026学年 秋季学期</option>
                    <option value="24-25-2">2024-2025学年 春季学期</option>
                    <option value="24-25-1">2024-2025学年 秋季学期</option>
                </select>
                <span style="margin-left: auto; font-size: 0.9em; color: #6c757d;">
                    请选择对应学期的命题费数据
                </span>
            </div>

            <div class="alert alert-info" style="background-color: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: var(--border-radius); margin-bottom: 20px;">
                <strong>填报说明：</strong>多课头课程由课程负责人填报，请知悉。您只需填写"综合题份数"或"非综合题份数"即可。<br>
                <strong>特别提醒：</strong>多课头可以把出题数量填写在一个课头下。<br>
                <strong>计费标准：</strong>综合题 100元/份，非综合题 60元/份
            </div>

            <div class="form-section">
                <h3 style="color: var(--primary-red); margin-bottom: 15px;">我的课程命题填报</h3>
                <div style="overflow-x: auto;">
                    <table class="data-table" id="exam-fee-table">
                        <thead>
                            <tr>
                                <th>课序号</th>
                                <th>课程名称</th>
                                <th>课程负责人</th>
                                <th>上课教师</th>
                                <th>工号</th>
                                <th>综合题份数</th>
                                <th>非综合题份数</th>
                            </tr>
                        </thead>
                        <tbody id="exam-fee-table-body">
                            ${userCourses.map(course => `
                                <tr>
                                    <td>${course.courseCode}</td>
                                    <td>${course.courseName}</td>
                                    <td>${course.courseLeader}</td>
                                    <td>${course.teacher}</td>
                                    <td>${course.teacherId}</td>
                                    <td style="text-align: center;">
                                        <input type="number" min="0" value="0" 
                                               style="width: 80px; padding: 5px; text-align: center; border: 1px solid var(--medium-gray); border-radius: 4px;">
                                    </td>
                                    <td style="text-align: center;">
                                        <input type="number" min="0" value="0"
                                               style="width: 80px; padding: 5px; text-align: center; border: 1px solid var(--medium-gray); border-radius: 4px;">
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--light-gray);">
                <button type="button" class="btn btn-secondary" onclick="previewExamFeeSubmission()">预览提交</button>
                <button type="button" class="btn btn-primary" onclick="submitExamFeeData()">提交填报</button>
            </div>
        </div>
    `;
}

function previewExamFeeSubmission() {
    const rows = document.querySelectorAll('#exam-fee-table-body tr');
    const userName = users[currentUser].name;
    const semester = document.getElementById('exam-semester-selector').options[document.getElementById('exam-semester-selector').selectedIndex].text;
    let previewText = `命题费填报预览 - ${userName}\n学期：${semester}\n\n`;
    let totalRows = rows.length;
    let filledRows = 0;

    rows.forEach(row => {
        const courseCode = row.querySelector('td:first-child').textContent;
        const courseName = row.querySelector('td:nth-child(2)').textContent;
        const teacher = row.querySelector('td:nth-child(4)').textContent;
        const comprehensiveCount = parseInt(row.querySelector('td:nth-child(6) input').value) || 0;
        const regularCount = parseInt(row.querySelector('td:nth-child(7) input').value) || 0;
        
        if (comprehensiveCount > 0 || regularCount > 0) {
            filledRows++;
        }
        
        previewText += `${courseCode} ${courseName}\n`;
        previewText += `  上课教师：${teacher}\n`;
        previewText += `  综合题：${comprehensiveCount}份\n`;
        previewText += `  非综合题：${regularCount}份\n\n`;
    });

    previewText += `总课程数：${totalRows}\n填报课程数：${filledRows}`;

    alert(previewText);
}

function submitExamFeeData() {
    const rows = document.querySelectorAll('#exam-fee-table-body tr');
    const userName = users[currentUser].name;
    const semester = document.getElementById('exam-semester-selector').options[document.getElementById('exam-semester-selector').selectedIndex].text;
    let submissionData = [];

    // 提交所有课程数据，包括为0的
    rows.forEach(row => {
        const courseCode = row.querySelector('td:first-child').textContent;
        const comprehensiveCount = parseInt(row.querySelector('td:nth-child(6) input').value) || 0;
        const regularCount = parseInt(row.querySelector('td:nth-child(7) input').value) || 0;
        
        submissionData.push({
            courseCode,
            comprehensiveCount,
            regularCount
        });
    });

    alert(`命题费填报提交成功！\n\n提交人：${userName}\n学期：${semester}\n课程数量：${submissionData.length}\n\n数据已保存，管理员可查看和导出。`);
    
    // 返回首页
    backToDashboard();
}
