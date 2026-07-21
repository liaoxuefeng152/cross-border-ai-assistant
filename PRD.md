# 龙掌柜 AI - 产品需求文档 (PRD)

## 1. 产品概述

### 1.1 产品定位
**龙掌柜 AI** 是一款面向跨境电商卖家的 AI 智能助手平台，通过对话式交互和可视化工作台，帮助卖家完成选品、商品上架、广告优化、客服等核心业务环节。

### 1.2 目标用户
- 跨境电商卖家（Amazon、Shopee/Lazada、TikTok Shop、Temu 等平台）
- 跨境电商运营人员
- 跨境电商创业者

### 1.3 核心价值
- **AI 驱动**：通过大语言模型理解用户需求，智能执行任务
- **交互式引导**：多轮问答收集需求，精准匹配用户意图
- **一站式管理**：商品、素材、店铺、账单统一管理
- **技能扩展**：可插拔的技能架构，支持自定义和扩展

---

## 2. 功能架构

### 2.1 核心模块

```
龙掌柜 AI
── AI 助手（对话式交互）
│   ├── 智能选品
│   ├── AI 作图
│   ├── AI 视频生成
│   ├── Listing 优化
│   ├── 广告优化
│   └── 自动客服
── 技能中心
│   ├── 已安装技能
│   ├── 技能市场
│   └── 自定义技能
├── 商品管理
│   ├── 商品列表
│   ├── 选品报告
│   └── 一键上架
├── 素材中心
│   ├── 图片管理
│   ├── 视频管理
│   └── 上传/下载
├── 店铺管理
│   ├── 店铺列表
│   ── 店铺授权
├── 套餐 & 账单
└── 设置
```

### 2.2 页面清单

| 页面 | 路径 | 功能描述 |
|------|------|----------|
| AI 助手 | `/dashboard/chat` | 对话式交互，支持技能调用、需求收集、历史记录 |
| 技能中心 | `/dashboard/skills` | 技能管理、技能市场、自定义技能 |
| 商品管理 | `/dashboard/products` | 商品列表、选品报告、商品详情 |
| 素材中心 | `/dashboard/assets` | 图片/视频管理、上传/下载/预览 |
| 店铺管理 | `/dashboard/shops` | 店铺列表、授权管理 |
| 套餐 & 账单 | `/dashboard/billing` | 订阅管理、账单记录 |
| 设置 | `/dashboard/settings` | 用户设置、偏好配置 |
| AI 作图 | `/dashboard/image-studio` | 独立图片生成工作台 |
| AI 视频 | `/dashboard/video-studio` | 独立视频生成工作台 |
| Listing 优化 | `/dashboard/listing` | Listing 优化工作台 |
| 智能选品 | `/dashboard/selection` | 选品工作台、选品报告 |
| 数据分析 | `/dashboard/analytics` | 销售数据分析 |

---

## 3. 核心功能详细说明

### 3.1 AI 助手（对话式交互）

#### 3.1.1 功能描述
AI 助手是产品的核心入口，用户通过自然语言对话，AI 理解意图后调用相应技能完成任务。

#### 3.1.2 核心特性

**1. 交互式需求收集**
- 当用户表达任务意图（如"我想选品"），AI 先抛出问题了解需求
- 支持单选、多选、文本输入、数字输入等多种问题类型
- 问题完成后自动构建技能参数，用户确认后执行

**示例流程：**
```
用户：我想选品
AI：请回答以下问题，我会根据你的需求来执行任务：
    Q1: 你打算在哪个平台卖货？ [Amazon/Shopee/TikTok/Temu]
    Q2: 你想做什么品类？ [文本输入]
    Q3: 你的采购预算大概是多少？ [low/medium/high]
    Q4: 你有跨境电商经验吗？ [beginner/intermediate/expert]
用户：[回答问题]
AI：[收集完需求后] 开始执行选品任务...
```

**2. 会话管理**
- 支持多会话（任务）管理，类似 WorkBuddy
- 每个会话独立保存聊天记录
- 会话标题自动使用用户第一条消息
- 支持新建任务、切换任务、清空任务

**3. 技能结果渲染**
- 支持多种技能结果卡片：
  - 图片生成结果（图片预览、下载）
  - 视频生成结果（视频预览、下载）
  - 选品结果（商品列表、数据表格）
  - Listing 优化结果（优化建议、对比）
  - 广告优化结果（广告建议、数据）
  - 自动客服结果（话术建议、知识库）

**4. 消息持久化**
- 所有聊天记录保存到数据库（`chat_sessions` + `chat_memories`）
- 切换会话时自动加载历史消息
- 支持技能结果卡片的完整恢复

#### 3.1.3 技术实现
- **前端**：React 19 + TypeScript + Tailwind CSS 4
- **后端**：Next.js 16 App Router API Routes
- **AI 引擎**：Agent Engine（意图识别 + 技能路由 + Agent Loop）
- **技能架构**：可插拔技能注册中心（Registry）
- **数据库**：PostgreSQL（Supabase）

---

### 3.2 技能系统

#### 3.2.1 技能列表

| 技能 ID | 技能名称 | 功能描述 | 状态 |
|--------|----------|----------|------|
| `image-gen` | AI 作图 | 生成商品白底图、场景图、模特图 | ✅ 已实现 |
| `video-gen` | AI 视频 | 生成商品展示视频、广告视频 | ✅ 已实现 |
| `product-selection` | 智能选品 | 根据平台/品类/预算推荐商品 | ✅ 已实现 |
| `listing-optimize` | Listing 优化 | 优化商品标题、描述、关键词 | ✅ 已实现 |
| `ad-optimize` | 广告优化 | 优化广告策略、出价、定向 | ✅ 已实现 |
| `auto-cs` | 自动客服 | 生成客服话术、FAQ、自动回复 | ✅ 已实现 |

#### 3.2.2 技能架构

```
用户输入 → Agent Engine（意图识别）
              ↓
         匹配技能 → 检查问卷
              ↓
         有问卷 → 需求收集 → 构建参数 → 执行技能
         无问卷 → 直接执行技能
              ↓
         返回结果 → 保存素材 → 渲染卡片
```

#### 3.2.3 技能注册中心
- 位置：`src/lib/skills/registry.ts`
- 功能：技能注册、关键词匹配、技能执行
- 扩展：新增技能只需在 `SKILL_DEFINITIONS` 中添加定义

---

### 3.3 素材中心

#### 3.3.1 功能描述
统一管理 AI 生成的图片、视频素材，支持上传、下载、预览、删除。

#### 3.3.2 核心特性
- **自动保存**：AI 生成的图片/视频自动上传到对象存储，URL 保存到数据库
- **真实渲染**：图片使用 `<img>` 标签渲染，视频使用 `<video>` 标签渲染
- **上传功能**：支持本地文件上传到对象存储
- **下载功能**：使用 fetch + blob 方式下载（避免跨域问题）
- **删除功能**：调用 API 删除数据库记录和对象存储文件
- **预览功能**：点击卡片弹出 Dialog，大图/视频预览 + 复制链接
- **实时统计**：图片数、视频数、总存储量

#### 3.3.3 数据存储
- **对象存储**：S3 兼容存储（coze-coding-project.tos.coze.site）
- **数据库表**：`assets`
  - `id`: UUID
  - `user_id`: 用户 ID
  - `name`: 素材名称
  - `type`: 类型（image/video）
  - `url`: 对象存储签名 URL
  - `thumbnail`: 缩略图 URL
  - `size`: 文件大小
  - `product_id`: 关联商品 ID
  - `created_at`: 创建时间

---

### 3.4 商品管理

#### 3.4.1 功能描述
管理商品列表、选品报告、商品详情。

#### 3.4.2 核心特性
- **商品列表**：展示所有商品，支持筛选、搜索
- **选品报告**：查看 AI 选品结果，支持导出
- **一键上架**：将选品结果快速上架到店铺

---

### 3.5 店铺管理

#### 3.5.1 功能描述
管理跨境电商店铺授权和配置。

#### 3.5.2 核心特性
- **店铺列表**：展示已授权的店铺
- **店铺授权**：支持 Amazon、Shopee、TikTok Shop 等平台授权
- **店铺配置**：配置店铺参数、API 密钥

---

## 4. 数据模型

### 4.1 数据库表结构

| 表名 | 用途 | 核心字段 |
|------|------|----------|
| `users` | 用户表 | id, email, name, avatar_url |
| `user_profiles` | 用户资料 | user_id, company, role, preferences |
| `chat_sessions` | 会话表 | id, user_id, title, mode |
| `chat_memories` | 消息表 | id, session_id, role, content, skill_type, skill_result |
| `assets` | 素材表 | id, user_id, name, type, url, size |
| `products` | 商品表 | id, user_id, title, category, price |
| `shops` | 店铺表 | id, user_id, platform, shop_name, status |
| `listings` | Listing 表 | id, product_id, title, description, keywords |
| `knowledge_base` | 知识库表 | id, user_id, content, embedding |
| `subscriptions` | 订阅表 | id, user_id, plan, status, expires_at |
| `bills` | 账单表 | id, user_id, amount, type, status |
| `favorites` | 收藏表 | id, user_id, target_type, target_id |

---

## 5. 技术架构

### 5.1 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Next.js | 16 (App Router) |
| 核心库 | React | 19 |
| 语言 | TypeScript | 5 |
| UI 组件 | shadcn/ui | (基于 Radix UI) |
| 样式 | Tailwind CSS | 4 |
| 数据库 | PostgreSQL | (Supabase) |
| 对象存储 | S3 兼容 | (TOS) |
| AI SDK | coze-coding-dev-sdk | latest |
| 包管理器 | pnpm | latest |

### 5.2 目录结构

```
/workspace/projects/
── public/                    # 静态资源
── scripts/                   # 构建与启动脚本
├── src/
│   ├── app/                   # 页面路由
│   │   ├── api/               # API Routes
│   │   │   ├── assets/        # 素材 API
│   │   │   ├── chat/          # 聊天 API
│   │   │   ├── sessions/      # 会话 API
│   │   │   ├── skills/        # 技能 API
│   │   │   └── ...
│   │   └── dashboard/         # 仪表盘页面
│   │       ├── chat/          # AI 助手
│   │       ├── skills/        # 技能中心
│   │       ├── products/      # 商品管理
│   │       ├── assets/        # 素材中心
│   │       └── ...
│   ├── components/            # 组件
│   │   ├── ui/                # shadcn/ui 组件
│   │   └── questionnaire-form.tsx  # 需求收集表单
│   ├── lib/                   # 工具库
│   │   ├── agent/             # Agent 引擎
│   │   │   ├── engine.ts      # 主引擎
│   │   │   ├── memory.ts      # 对话记忆
│   │   │   ├── knowledge.ts   # RAG 知识库
│   │   │   ├── asset-saver.ts # 素材保存
│   │   │   └── questionnaire.ts # 需求问卷
│   │   ├── skills/            # 技能实现
│   │   │   ├── registry.ts    # 技能注册中心
│   │   │   ├── image-gen.ts   # AI 作图
│   │   │   ├── video-gen.ts   # AI 视频
│   │   │   └── ...
│   │   ├── storage/           # 对象存储
│   │   └── utils.ts           # 工具函数
│   └── hooks/                 # 自定义 Hooks
── .coze                      # 项目配置
├── package.json               # 依赖管理
└── tsconfig.json              # TypeScript 配置
```

### 5.3 核心流程

#### 5.3.1 AI 对话流程
```
1. 用户发送消息
2. 前端调用 POST /api/chat
3. 后端调用 Agent Engine
4. Engine 进行意图识别（LLM）
5. 匹配到技能 → 检查问卷
6. 有问卷 → 返回 collect-requirements 事件
7. 前端显示问题卡片，用户回答
8. 前端调用 POST /api/skills/execute
9. 后端执行技能，返回结果
10. 前端渲染技能结果卡片
11. 保存消息和素材到数据库
```

#### 5.3.2 素材保存流程
```
1. AI 生成图片/视频
2. 调用 saveGeneratedAsset()
3. 下载 AI 生成的文件
4. 上传到对象存储（S3）
5. 获取签名 URL
6. 保存到 assets 表
7. 返回素材 ID 和 URL
```

---

## 6. 设计规范

### 6.1 品牌与气质
- **关键词**：专业、智能、高效、值得信赖
- **意象**：经验丰富的跨境电商老手，坐在整洁的控制台前
- **禁忌**：不用蓝紫渐变、不用纯黑背景、不用过度卡通化

### 6.2 Design Tokens

#### 色彩
| 用途 | 颜色 | 色值 |
|------|------|------|
| 主色 | Emerald 600 | #059669 |
| 辅色 | Amber 500 | #F59E0B |
| 背景 | 白色 + Slate-50 | #FFFFFF / #F8FAFC |
| 标题 | Slate-900 | #0F172A |
| 正文 | Slate-600 | #475569 |
| 辅助 | Slate-400 | #94A3B8 |
| 边框 | Slate-200 | #E2E8F0 |
| 成功 | Emerald-500 | #10B981 |
| 警告 | Amber-500 | #F59E0B |
| 错误 | Red-500 | #EF4444 |

#### 字体
- 中文：PingFang SC, Microsoft YaHei
- 英文：Inter (Google Fonts)
- 数字：Inter tabular-nums

#### 圆角
- 卡片：12px (rounded-xl)
- 按钮：8px (rounded-lg)
- 输入框：8px
- 头像：50%

#### 阴影
- 卡片：shadow-sm (0 1px 2px rgba(0,0,0,0.05))
- 悬浮：shadow-md (0 4px 6px -1px rgba(0,0,0,0.1))
- 弹窗：shadow-lg

#### 动效
- 过渡：transition-all duration-200 ease-out
- 悬浮：translate-y(-1) + shadow 增强
- 入场：fade-in + slide-up

---

## 7. 开发规范

### 7.1 编码规范
- 默认按 TypeScript `strict` 心智写代码
- 禁止隐式 `any` 和 `as any`
- 函数参数、返回值必须有明确类型
- 优先复用已声明的变量、函数、类型

### 7.2 包管理
- **仅允许使用 pnpm**
- 禁止使用 npm 或 yarn

### 7.3 端口规范
- 开发环境：5000（主仓）/ 动态分配（worktree）
- 禁止使用 9000 端口（系统保留）

### 7.4 环境变量
| 变量名 | 说明 |
|--------|------|
| `COZE_WORKSPACE_PATH` | 工作目录 |
| `COZE_PROJECT_DOMAIN_DEFAULT` | 对外访问域名 |
| `DEPLOY_RUN_PORT` | 服务监听端口 |
| `COZE_PROJECT_ENV` | 环境（DEV/PROD） |
| `COZE_LOOP_API_TOKEN` | API 密钥 |

---

## 8. 待办事项

### 8.1 高优先级
- [ ] 修复图片/视频生成服务的 SSL 证书问题（生产环境）
- [ ] 完善技能执行错误处理和用户提示
- [ ] 添加技能执行进度显示

### 8.2 中优先级
- [ ] 实现 RAG 知识库功能
- [ ] 实现 Agent Loop（多步任务编排）
- [ ] 完善商品管理功能
- [ ] 完善店铺授权流程

### 8.3 低优先级
- [ ] 添加数据分析仪表盘
- [ ] 实现自定义技能功能
- [ ] 添加技能市场（第三方技能）
- [ ] 实现多语言支持

---

## 9. 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0.0 | 2026-07-20 | 初始版本，实现 6 个核心技能、交互式需求收集、会话管理、素材中心 |

---

## 10. 附录

### 10.1 技能问卷定义
- 位置：`src/lib/agent/questionnaire.ts`
- 包含 6 个技能的问卷定义和问题列表

### 10.2 API 接口清单

| 接口 | 方法 | 功能 |
|------|------|------|
| `/api/chat` | POST | AI 对话（SSE 流式） |
| `/api/sessions` | GET/POST | 获取/创建会话 |
| `/api/sessions/[id]` | PATCH/DELETE | 更新/删除会话 |
| `/api/sessions/[id]/messages` | GET | 获取会话消息 |
| `/api/sessions/clear` | POST | 清空所有会话 |
| `/api/skills/execute` | POST | 执行技能 |
| `/api/assets` | GET/POST | 获取/上传素材 |
| `/api/assets/[id]` | DELETE | 删除素材 |
| `/api/image/generate` | POST | AI 作图 |
| `/api/video/generate` | POST | AI 视频生成 |

### 10.3 参考资料
- Next.js 文档：https://nextjs.org/docs
- shadcn/ui 文档：https://ui.shadcn.com
- Supabase 文档：https://supabase.com/docs
- coze-coding-dev-sdk：内置 SDK
