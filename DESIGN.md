# DESIGN.md — 龙掌柜 AI

## 品牌与气质
- 关键词：专业、智能、高效、值得信赖
- 意象：一位经验丰富的跨境电商老手，坐在整洁的控制台前，屏幕上数据流转、商品图片闪烁，一切尽在掌握
- 禁忌：不用蓝紫渐变（太通用）、不用纯黑背景（太冷）、不用过度卡通化（不够专业）

## Design Tokens

### 色彩
- 主色：Emerald 600 (#059669) — 增长、商业、利润
- 辅色：Amber 500 (#F59E0B) —  premium、财富、高亮
- 背景：白色 + Slate-50 (#F8FAFC) 交替
- 文字：Slate-900 (#0F172A) 标题 / Slate-600 (#475569) 正文 / Slate-400 辅助
- 边框：Slate-200 (#E2E8F0)
- 成功：Emerald-500 / 警告：Amber-500 / 错误：Red-500

### 字体
- 中文：PingFang SC, Microsoft YaHei
- 英文：Inter (Google Fonts)
- 数字：Inter tabular-nums

### 圆角
- 卡片：12px (rounded-xl)
- 按钮：8px (rounded-lg)
- 输入框：8px
- 头像：50%

### 阴影
- 卡片：shadow-sm (0 1px 2px rgba(0,0,0,0.05))
- 悬浮：shadow-md (0 4px 6px -1px rgba(0,0,0,0.1))
- 弹窗：shadow-lg

### 动效
- 过渡：transition-all duration-200 ease-out
- 悬浮：translate-y(-1) + shadow 增强
- 入场：fade-in + slide-up
