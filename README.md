# 街边饮料摊点单系统 🧋

一个专为街边饮料摊设计的现代化内部点单管理系统，提供直观的点单界面和完整的后台管理功能。

## 🌟 产品特色

### 🎯 核心功能
- **前台点单系统** - 触摸友好的饮料选择界面
- **自定义选项** - 糖度、冰块、数量个性化定制
- **实时订单管理** - 即时计算总价，订单状态追踪
- **后台管理** - 完整的订单和菜单管理系统
- **数据导出** - 订单数据CSV导出功能

### 🎨 设计亮点
- **温暖色调** - 橙黄色渐变背景，营造温馨氛围
- **响应式设计** - 完美适配平板、手机等触摸设备
- **直观操作** - 大按钮设计，简化操作流程
- **清晰层次** - 优秀的信息架构和视觉层次

## 🚀 在线体验

**部署地址**: [https://rbhughloig.space.minimax.io](https://rbhughloig.space.minimax.io)

### 快速体验指南
1. **点单操作**：点击饮料卡片 → 选择糖度/冰块/数量 → 添加到订单 → 提交订单
2. **管理功能**：点击底部"管理"按钮 → 查看订单列表 → 管理菜单设置

## 📱 功能详解

### 前台点单界面
- **饮料菜单展示**
  - 网格式卡片布局，展示饮料图片、名称、价格
  - 支持按分类筛选和搜索功能
  - 清晰的缺货/有售状态标识

- **订单构建**
  - 糖度选择：无糖、少糖、半糖、正常
  - 冰块选择：去冰、少冰、正常冰
  - 数量调节：支持增减操作
  - 实时价格计算和订单汇总

- **当前订单管理**
  - 实时显示订单内容和总价
  - 支持修改数量和删除商品
  - 一键清空或提交订单

### 后台管理系统
- **订单管理**
  - 订单状态追踪（待处理/已完成）
  - 订单详情查看和状态更新
  - 订单筛选和批量操作
  - 数据导出CSV功能

- **菜单管理**
  - 添加/编辑/删除饮料
  - 价格和分类管理
  - 图片上传和更换
  - 库存状态控制

- **数据管理**
  - 订单数据导出
  - 历史数据清理
  - 本地存储管理

## 💻 技术架构

### 前端技术栈
- **React 18** + **TypeScript** - 现代化开发体验
- **Vite** - 快速开发和构建工具
- **TailwindCSS** - 快速样式开发
- **Lucide React** - 精美图标库

### 状态管理
- **React Context** + **useReducer** - 全局状态管理
- **localStorage** - 数据持久化存储

### 设计系统
- **响应式设计** - 适配多种设备尺寸
- **触摸优化** - 大按钮，易点击
- **色彩系统** - 橙色主题，温暖亲和

## 📊 默认菜单

| 饮料名称 | 价格 | 分类 |
|---------|------|------|
| 珍珠奶茶 | ¥15 | 奶茶 |
| 柠檬茶 | ¥12 | 茶饮 |
| 红茶 | ¥8 | 茶饮 |
| 绿茶 | ¥8 | 茶饮 |
| 现磨咖啡 | ¥18 | 咖啡 |
| 奶昔 | ¥20 | 奶制品 |
| 鲜榨果汁 | ¥16 | 果汁 |
| 芋圆奶茶 | ¥18 | 奶茶 |

## 🛠️ 本地开发

### 环境要求
- Node.js 16+
- pnpm (推荐) 或 npm

### 安装运行
```bash
# 克隆项目
git clone <项目地址>

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### 项目结构
```
src/
├── components/          # 可复用组件
│   ├── DrinkCard.tsx   # 饮料卡片
│   ├── CurrentOrder.tsx # 当前订单
│   ├── OrderManagement.tsx # 订单管理
│   ├── MenuManagement.tsx  # 菜单管理
│   └── Navigation.tsx   # 导航组件
├── pages/              # 页面组件
│   ├── OrderPage.tsx   # 点单页面
│   └── ManagementPage.tsx # 管理页面
├── context/            # 状态管理
│   └── AppContext.tsx  # 应用上下文
├── utils/              # 工具函数
│   └── storage.ts      # 本地存储
├── data/               # 数据文件
│   └── defaultMenu.ts  # 默认菜单
└── types.ts            # 类型定义
```

## 🎯 适用场景

- **街边饮料摊** - 小规模饮料销售点
- **奶茶店** - 连锁或独立奶茶店
- **咖啡厅** - 小型咖啡销售点
- **快餐店** - 饮料销售部门
- **校园商店** - 学校内部饮料销售

## 📈 未来扩展

- [ ] 会员系统集成
- [ ] 移动支付接口
- [ ] 销售数据分析
- [ ] 多店铺管理
- [ ] 库存自动提醒
- [ ] 小票打印功能

## 🤝 技术支持

如有问题或建议，欢迎提交 Issue 或 Pull Request。

---

**开发时间**: 2025年7月1日  
**技术栈**: React + TypeScript + TailwindCSS  
**部署平台**: MiniMax 静态托管
