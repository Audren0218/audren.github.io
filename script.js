/**
 * 个人网站交互脚本
 * Personal Website Interactive Script
 */

// ===== 全局变量 Global Variables =====
let inactivityTimer;
const INACTIVITY_TIMEOUT = 30000; // 30秒无操作自动返回待机页
let currentView = 'intro'; // 默认视图为简介
let currentSubview = null; // 当前子视图
let currentLanguage = 'zh-CN'; // 默认语言为中文
let currentTimezone = 'Asia/Shanghai'; // 默认时区为中国标准时间
let sidebarVisible = false; // 侧边栏默认隐藏

// ===== 页面加载完成后执行 DOM Ready =====
document.addEventListener('DOMContentLoaded', function() {
    // 初始化时钟和日期
    updateClockAndDate();
    setInterval(updateClockAndDate, 1000);
    
    // 初始化界面
    initializeInterface();
    
    // 添加各种事件监听器
    setupEventListeners();
    
    // 启动无操作检测
    startInactivityDetection();
    
    // 尝试加载天气和地图API
    initializeWeatherAPI();
    initializeMapAPI();
});

// ===== 界面初始化 Interface Initialization =====
function initializeInterface() {
    // 显示待机页，隐藏其他所有视图
    showOnlyElement('standby-page');
    
    // 初始化当前日期的日历显示
    initializeCalendar();
}

// ===== 显示唯一元素 Show Only One Element =====
function showOnlyElement(elementId) {
    // 隐藏所有可能的视图
    hideAllViews();
    
    // 显示指定元素
    document.getElementById(elementId).style.display = 'flex';
}

// ===== 隐藏所有视图 Hide All Views =====
function hideAllViews() {
    // 隐藏待机页
    document.getElementById('standby-page').style.display = 'none';
    
    // 隐藏主视图容器
    document.getElementById('main-view-container').style.display = 'none';
    
    // 隐藏子视图容器
    document.getElementById('subview-container').style.display = 'none';
    
    // 隐藏设置面板
    document.getElementById('settings-panel').classList.remove('active');
}

// ===== 时钟和日期更新 Clock and Date Update =====
function updateClockAndDate() {
    const now = new Date();
    
    // 根据选择的时区进行调整
    const options = {
        timeZone: currentTimezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    const timeString = now.toLocaleTimeString(currentLanguage, options);
    document.getElementById('clock').textContent = timeString;
    
    // 日期格式化
    const dateOptions = {
        timeZone: currentTimezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };
    
    const dateString = now.toLocaleDateString(currentLanguage, dateOptions);
    document.getElementById('date').textContent = dateString;
}

// ===== 日历初始化 Calendar Initialization =====
function initializeCalendar() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    renderCalendar(currentYear, currentMonth);
}

// ===== 渲染日历 Render Calendar =====
function renderCalendar(year, month) {
    const calendarDays = document.querySelector('.calendar-days');
    const currentMonthDisplay = document.getElementById('current-month-display');
    
    // 清空日历天数
    calendarDays.innerHTML = '';
    
    // 设置月份显示
    const monthNames = new Intl.DateTimeFormat(currentLanguage, { month: 'long' }).format(new Date(year, month, 1));
    currentMonthDisplay.textContent = `${year}年 ${monthNames}`;
    
    // 获取当月第一天是星期几
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // 获取当月的总天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 创建日历上个月的占位天数
    for (let i = 0; i < firstDayOfMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day', 'previous-month');
        calendarDays.appendChild(dayElement);
    }
    
    // 创建当月的天数
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = day;
        
        // 标记今天
        if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
            dayElement.classList.add('today');
        }
        
        // 模拟一些有日记条目的日子
        if (day % 5 === 0) {
            dayElement.classList.add('has-entry');
        }
        
        // 添加点击事件，显示对应日期的日记内容
        dayElement.addEventListener('click', function() {
            // 移除其他日期的选中状态
            document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('active'));
            // 添加当前日期的选中状态
            this.classList.add('active');
            
            // 更新日记内容（示例内容）
            const journalEntry = document.querySelector('.journal-entry');
            journalEntry.querySelector('h3').textContent = `${year}年${month + 1}月${day}日`;
            
            // 根据日期生成模拟内容
            let journalContent = '';
            if (day % 5 === 0) {
                journalContent = `
                    <p>今天参加了一场关于人工智能伦理的研讨会，与来自全球的专家就AI发展的未来方向进行了深入交流。特别是关于AGI的发展路径和潜在风险，听到了很多有启发性的观点。</p>
                    <p>下午与团队讨论了新项目的进展，自然语言处理模块的优化取得了显著效果，准确率提升了8个百分点。晚上在音乐厅聆听了贝多芬钢琴奏鸣曲音乐会，艺术的力量总是能让人沉静思考。</p>
                `;
            } else if (day % 7 === 0) {
                journalContent = `
                    <p>今天在实验室完成了量子算法的优化工作，相比传统方法，计算效率提高了约20倍。这个突破可能对密码学和材料科学研究产生重要影响，已经准备撰写论文提交到Nature子刊。</p>
                    <p>傍晚参加了传统文化保护基金会的筹款活动，与多位文化学者就非物质文化遗产的数字化保存进行了交流，并提出了结合AI技术的创新方案。</p>
                `;
            } else if (day % 3 === 0) {
                journalContent = `
                    <p>今早录制了一期科普视频，主题是"人工智能如何改变医疗健康"，通过简明的案例和可视化展示，向公众解释了AI在医疗诊断和药物研发中的应用。</p>
                    <p>下午指导研究生进行深度学习模型优化，解决了长序列处理中的梯度消失问题。晚上练习了两小时钢琴，正在准备下月的小型演奏会。</p>
                `;
            } else {
                journalContent = `
                    <p>今天是实验室开放日，接待了来自五所高中的学生参观。通过互动演示和简单实验，向青少年介绍了人工智能的基本原理和研究方向，看到他们对科技的好奇与热情非常欣慰。</p>
                    <p>晚上参加了一场线上国际会议，与美国和欧洲的同行就机器学习的可解释性问题进行了深入讨论，获得了一些新的研究思路。</p>
                `;
            }
            
            journalEntry.querySelector('.journal-text').innerHTML = journalContent;
            
            // 更新元数据
            const locations = ['北京研究中心', '上海科技馆', '清华大学', '国家会议中心', '线上会议', '实验室'];
            const moods = ['充实', '忙碌', '愉快', '专注', '思考', '兴奋'];
            const weathers = ['晴朗 22°C', '多云 18°C', '小雨 15°C', '阴天 20°C', '晴间多云 24°C'];
            
            const locationIndex = (day * month) % locations.length;
            const moodIndex = (day + month) % moods.length;
            const weatherIndex = (day + year) % weathers.length;
            
            const locationSpan = journalEntry.querySelector('.location');
            const moodSpan = journalEntry.querySelector('.mood');
            const weatherSpan = journalEntry.querySelector('.weather');
            
            locationSpan.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${locations[locationIndex]}`;
            moodSpan.innerHTML = `<i class="fas fa-smile"></i> ${moods[moodIndex]}`;
            weatherSpan.innerHTML = `<i class="fas fa-cloud-sun"></i> ${weathers[weatherIndex]}`;
        });
        
        calendarDays.appendChild(dayElement);
    }
    
    // 初始选中今天的日期
    const todayElement = document.querySelector('.calendar-day.today');
    if (todayElement) {
        todayElement.click();
    } else {
        // 如果不是当月，则选中第一个有日记的日期
        const firstEntryDay = document.querySelector('.calendar-day.has-entry');
        if (firstEntryDay) {
            firstEntryDay.click();
        }
    }
    
    // 添加月份导航事件
    document.getElementById('prev-month').addEventListener('click', function() {
        let prevMonth = month - 1;
        let prevYear = year;
        if (prevMonth < 0) {
            prevMonth = 11;
            prevYear--;
        }
        renderCalendar(prevYear, prevMonth);
    });
    
    document.getElementById('next-month').addEventListener('click', function() {
        let nextMonth = month + 1;
        let nextYear = year;
        if (nextMonth > 11) {
            nextMonth = 0;
            nextYear++;
        }
        renderCalendar(nextYear, nextMonth);
    });
}

// ===== 事件监听器设置 Event Listeners Setup =====
function setupEventListeners() {
    // 待机页点击或滚动事件，进入主界面
    document.getElementById('standby-page').addEventListener('click', exitStandbyMode);
    document.getElementById('standby-page').addEventListener('wheel', exitStandbyMode);
    
    // 侧边栏导航项点击事件
    const navItems = document.querySelectorAll('.sidebar li[data-view]');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const viewName = this.getAttribute('data-view');
            switchMainView(viewName);
        });
    });
    
    // 滚轮事件监听，切换侧边栏选项
    document.addEventListener('wheel', debounce(handleWheelNavigation, 200));
    
    // 设置按钮点击事件
    document.getElementById('settings-trigger').addEventListener('click', toggleSettingsPanel);
    document.getElementById('close-settings').addEventListener('click', toggleSettingsPanel);
    
    // 语言选择事件
    const languageOptions = document.querySelectorAll('.language-settings li');
    languageOptions.forEach(option => {
        option.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });
    
    // 时区选择事件
    document.getElementById('timezone-select').addEventListener('change', function() {
        changeTimezone(this.value);
    });
    
    // 主视图网格项点击事件
    const gridItems = document.querySelectorAll('.grid-item[data-subview]');
    gridItems.forEach(item => {
        item.addEventListener('click', function() {
            const subviewName = this.getAttribute('data-subview');
            openSubview(subviewName);
        });
    });
    
    // 返回按钮点击事件
    document.querySelector('.back-button').addEventListener('click', closeSubview);
    
    // 联系方式平台点击事件
    const contactPlatforms = document.querySelectorAll('[data-platform]');
    contactPlatforms.forEach(platform => {
        platform.addEventListener('click', function() {
            const platformName = this.getAttribute('data-platform');
            openContactPlatform(platformName);
        });
    });
    
    // 点列表切换事件
    setupPointListToggle();
    
    // 监听鼠标位置以控制侧边栏显示
    document.addEventListener('mousemove', debounce(handleMousePosition, 100));
    
    // 所有交互操作都重置无操作计时器
    document.addEventListener('click', resetInactivityTimer);
    document.addEventListener('mousemove', resetInactivityTimer);
    document.addEventListener('keydown', resetInactivityTimer);
    document.addEventListener('wheel', resetInactivityTimer);
}

// ===== 点列表切换设置 Point List Toggle Setup =====
function setupPointListToggle() {
    const pointListItems = document.querySelectorAll('.point-list li');
    pointListItems.forEach(item => {
        item.addEventListener('click', function() {
            const pointName = this.getAttribute('data-point');
            const parentSubview = this.closest('.subview').id;
            
            // 移除同级所有点的活动状态
            const siblingItems = this.parentElement.querySelectorAll('li');
            siblingItems.forEach(sibling => sibling.classList.remove('active'));
            
            // 添加当前点的活动状态
            this.classList.add('active');
            
            // 隐藏所有相关内容
            const contentElements = document.querySelectorAll(`#${parentSubview} .point-content`);
            contentElements.forEach(content => content.classList.remove('active'));
            
            // 显示对应内容
            const targetContent = document.getElementById(`${pointName}-content`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
    
    // 默认激活每个子视图中的第一个点
    document.querySelectorAll('.subview').forEach(subview => {
        const firstPoint = subview.querySelector('.point-list li');
        if (firstPoint) {
            firstPoint.classList.add('active');
            const pointName = firstPoint.getAttribute('data-point');
            const contentElement = document.getElementById(`${pointName}-content`);
            if (contentElement) {
                contentElement.classList.add('active');
            }
        }
    });
}

// ===== 待机模式退出 Exit Standby Mode =====
function exitStandbyMode() {
    // 隐藏所有视图，显示主视图区域
    hideAllViews();
    
    // 激活主视图容器
    document.getElementById('main-view-container').style.display = 'flex';
    
    // 切换到默认主视图
    switchMainView('intro');
    
    // 重置无操作计时器
    resetInactivityTimer();
}

// ===== 切换主视图 Switch Main View =====
function switchMainView(viewName) {
    // 保存当前视图名称
    currentView = viewName;
    
    // 隐藏所有主视图
    const mainViews = document.querySelectorAll('.main-view');
    mainViews.forEach(view => view.classList.remove('active'));
    
    // 显示选定的主视图
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    // 更新侧边栏选中状态
    const navItems = document.querySelectorAll('.sidebar li');
    navItems.forEach(item => item.classList.remove('active'));
    const activeNavItem = document.querySelector(`.sidebar li[data-view="${viewName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // 重置无操作计时器
    resetInactivityTimer();
}

// ===== 打开子视图 Open Subview =====
function openSubview(subviewName) {
    // 保存当前子视图名称
    currentSubview = subviewName;
    
    // 隐藏主视图容器
    document.getElementById('main-view-container').style.display = 'none';
    
    // 显示子视图容器
    const subviewContainer = document.getElementById('subview-container');
    subviewContainer.style.display = 'block';
    
    // 隐藏所有子视图
    const subviews = document.querySelectorAll('.subview');
    subviews.forEach(subview => subview.classList.remove('active'));
    
    // 显示选定的子视图
    const targetSubview = document.getElementById(`${subviewName}-subview`);
    if (targetSubview) {
        targetSubview.classList.add('active');
    }
    
    // 重置无操作计时器
    resetInactivityTimer();
}

// ===== 关闭子视图 Close Subview =====
function closeSubview() {
    // 隐藏子视图容器
    document.getElementById('subview-container').style.display = 'none';
    
    // 显示主视图容器
    document.getElementById('main-view-container').style.display = 'flex';
    
    // 恢复之前的主视图
    switchMainView(currentView);
    
    // 重置当前子视图
    currentSubview = null;
    
    // 重置无操作计时器
    resetInactivityTimer();
}

// ===== 切换设置面板 Toggle Settings Panel =====
function toggleSettingsPanel() {
    const settingsPanel = document.getElementById('settings-panel');
    settingsPanel.classList.toggle('active');
    
    // 重置无操作计时器
    resetInactivityTimer();
}

// ===== 更改语言 Change Language =====
function changeLanguage(lang) {
    currentLanguage = lang;
    
    // 更新语言选择UI
    const languageOptions = document.querySelectorAll('.language-settings li');
    languageOptions.forEach(option => option.classList.remove('active'));
    const activeOption = document.querySelector(`.language-settings li[data-lang="${lang}"]`);
    if (activeOption) {
        activeOption.classList.add('active');
    }
    
    // 更新时钟和日期显示
    updateClockAndDate();
    
    // 更新日历显示
    initializeCalendar();
    
    // 这里应该调用翻译API进行页面内容翻译
    // 由于API暂时无法使用，仅添加注释说明
    /* 
    // 翻译API调用示例
    translatePageContent(lang).then(response => {
        console.log('Page translated to:', lang);
    }).catch(error => {
        console.error('Translation error:', error);
    });
    */
    console.log('语言已切换至:', lang);
    
    // 重置无操作计时器
    resetInactivityTimer();
}

// ===== 更改时区 Change Timezone =====
function changeTimezone(timezone) {
    currentTimezone = timezone;
    
    // 更新时钟和日期显示
    updateClockAndDate();
    
    console.log('时区已切换至:', timezone);
    
    // 重置无操作计时器
    resetInactivityTimer();
}

// ===== 打开联系平台信息 Open Contact Platform Info =====
function openContactPlatform(platformName) {
    // 打开联系人平台子视图
    openSubview('contact-platform');
    
    // 根据平台名称设置内容
    const platformIcons = {
        'wechat': '<i class="fab fa-weixin"></i>',
        'weibo': '<i class="fab fa-weibo"></i>',
        'qq': '<i class="fab fa-qq"></i>',
        'email': '<i class="fas fa-envelope"></i>',
        'linkedin': '<i class="fab fa-linkedin"></i>',
        'github': '<i class="fab fa-github"></i>',
        'instagram': '<i class="fab fa-instagram"></i>',
        'youtube': '<i class="fab fa-youtube"></i>',
        'tiktok': '<i class="fab fa-tiktok"></i>',
        'douyin': '<i class="fab fa-tiktok"></i>',
        'facebook': '<i class="fab fa-facebook"></i>',
        'twitter': '<i class="fab fa-twitter"></i>',
        'reddit': '<i class="fab fa-reddit"></i>',
        'discord': '<i class="fab fa-discord"></i>',
        'telegram': '<i class="fab fa-telegram"></i>',
        'zhihu': '<i class="fas fa-circle-question"></i>',
        'bilibili': '<i class="fas fa-tv"></i>',
        'xiaohongshu': '<i class="fas fa-book-open"></i>',
        'gitee': '<i class="fas fa-code-branch"></i>',
        'csdn': '<i class="fas fa-code"></i>',
        'scholar': '<i class="fas fa-graduation-cap"></i>',
        'researchgate': '<i class="fab fa-researchgate"></i>',
        'medium': '<i class="fab fa-medium"></i>',
        'pinterest': '<i class="fab fa-pinterest"></i>',
        'phone': '<i class="fas fa-phone"></i>'
    };
    
    const platformNames = {
        'wechat': '微信',
        'weibo': '微博',
        'qq': 'QQ',
        'email': '电子邮箱',
        'linkedin': '领英',
        'github': 'GitHub',
        'instagram': 'Instagram',
        'youtube': 'YouTube',
        'tiktok': 'TikTok',
        'douyin': '抖音',
        'facebook': 'Facebook',
        'twitter': 'Twitter',
        'reddit': 'Reddit',
        'discord': 'Discord',
        'telegram': 'Telegram',
        'zhihu': '知乎',
        'bilibili': '哔哩哔哩',
        'xiaohongshu': '小红书',
        'gitee': 'Gitee',
        'csdn': 'CSDN',
        'scholar': 'Google Scholar',
        'researchgate': 'ResearchGate',
        'medium': 'Medium',
        'pinterest': 'Pinterest',
        'phone': '电话'
    };
    
    const platformIds = {
        'wechat': 'zhangsan_wechat',
        'weibo': '@zhang_san_weibo',
        'qq': '123456789',
        'email': 'zhangsan@example.com',
        'linkedin': 'zhang-san-profile',
        'github': 'zhangsan-dev',
        'instagram': '@zhangsan_official',
        'youtube': 'ZhangSanChannel',
        'tiktok': '@zhangsan_official',
        'douyin': '@zhangsan666',
        'facebook': 'zhangsan.official',
        'twitter': '@ZhangSan_tweets',
        'reddit': 'u/ZhangSan_Official',
        'discord': 'ZhangSan#1234',
        'telegram': '@zhangsan_official',
        'zhihu': '张三',
        'bilibili': '张三Official',
        'xiaohongshu': '@张三的科技分享',
        'gitee': 'zhangsan',
        'csdn': 'zhangsan_dev',
        'scholar': 'Zhang San',
        'researchgate': 'Zhang_San',
        'medium': '@zhangsan',
        'pinterest': 'zhangsanofficial',
        'phone': '+86 123 4567 8901'
    };
    
    // 更新平台图标
    document.querySelector('.platform-icon').innerHTML = platformIcons[platformName] || '<i class="fas fa-link"></i>';
    
    // 更新平台名称
    document.querySelector('.platform-name').textContent = platformNames[platformName] || platformName;
    
    // 更新联系ID
    document.querySelector('.contact-id').textContent = platformIds[platformName] || '未设置ID';
    
    // 重置无操作计时器
    resetInactivityTimer();
}

// ===== 处理鼠标位置控制侧边栏 Handle Mouse Position for Sidebar =====
function handleMousePosition(event) {
    const sidebarWidth = 16;
    const triggerArea = 20;
    
    if (event.clientX <= triggerArea) {
        // 鼠标靠近左侧边缘，显示侧边栏
        document.getElementById('sidebar').classList.add('active');
        sidebarVisible = true;
    } else if (event.clientX > sidebarWidth && sidebarVisible) {
        // 鼠标离开侧边栏区域，设置延迟隐藏
        setTimeout(() => {
            if (event.clientX > sidebarWidth) {
                document.getElementById('sidebar').classList.remove('active');
                sidebarVisible = false;
            }
        }, 500);
    }
}

// ===== 处理滚轮导航 Handle Wheel Navigation =====
function handleWheelNavigation(event) {
    // 仅在主视图上且侧边栏可见时响应滚轮导航
    if (currentSubview === null && sidebarVisible && document.getElementById('main-view-container').style.display !== 'none') {
        const navItems = Array.from(document.querySelectorAll('.sidebar li[data-view]'));
        const currentIndex = navItems.findIndex(item => item.getAttribute('data-view') === currentView);
        
        if (currentIndex !== -1) {
            let nextIndex;
            
            // 根据滚动方向确定下一个视图
            if (event.deltaY > 0) {
                // 向下滚动，选择下一个视图
                nextIndex = (currentIndex + 1) % navItems.length;
            } else {
                // 向上滚动，选择上一个视图
                nextIndex = (currentIndex - 1 + navItems.length) % navItems.length;
            }
            
            const nextView = navItems[nextIndex].getAttribute('data-view');
            switchMainView(nextView);
        }
    }
}

// ===== 无操作检测 Inactivity Detection =====
function startInactivityDetection() {
    // 设置初始计时器
    inactivityTimer = setTimeout(returnToStandby, INACTIVITY_TIMEOUT);
}

// ===== 重置无操作计时器 Reset Inactivity Timer =====
function resetInactivityTimer() {
    // 清除现有计时器
    clearTimeout(inactivityTimer);
    
    // 设置新计时器
    inactivityTimer = setTimeout(returnToStandby, INACTIVITY_TIMEOUT);
}

// ===== 返回待机状态 Return to Standby =====
function returnToStandby() {
    // 隐藏所有视图，包括子视图和主视图
    hideAllViews();
    
    // 显示待机页
    document.getElementById('standby-page').style.display = 'flex';
    
    // 重置无操作计时器
    resetInactivityTimer();
}

// ===== 实用工具函数 Utility Functions =====

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// ===== API 初始化 API Initialization =====

// 天气API初始化
function initializeWeatherAPI() {
    // 由于API暂时无法使用，仅添加注释说明
    /*
    // 天气API调用示例
    getWeatherData().then(data => {
        updateWeatherDisplay(data);
    }).catch(error => {
        console.error('Weather API error:', error);
    });
    */
    console.log('天气API初始化 - 该功能暂时无法使用');
    console.log('待实现功能: 根据用户地理位置获取实时天气数据，并在待机页显示');
}

// 地图API初始化
function initializeMapAPI() {
    // It seems like Map API is not available, adding only descriptive comment
    /*
    // Map API call example
    loadMapAPI().then(() => {
        renderCompanyAddressMap();
    }).catch(error => {
        console.error('Map API error:', error);
    });
    */
    console.log('地图API初始化 - 该功能暂时无法使用');
    console.log('待实现功能: 在基本信息界面的公司地址部分显示交互式地图');
}