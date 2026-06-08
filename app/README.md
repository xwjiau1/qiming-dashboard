# 启明科技 · 管理驾驶舱

一个基于 React + TypeScript + Tailwind CSS + shadcn/ui 构建的一人公司智能管理平台，以深蓝-金色粒子光轨为视觉主题，集成 GSAP 工业级动效引擎。

## 项目概述

启明科技（Qiming Tech）是一家 AI 驱动的"一人公司"，由创始人 JiaWen 和 CEO Wenner 运营，下设技术部（Irra 负责）和设计部（Mery 负责）。本系统提供一站式的公司运营管理能力：

- **Dashboard 总览** — 核心 KPI、部门状态、项目概览、任务统计
- **部门与智能体** — 双部门架构、AI 智能体身份故事与能力展示
- **项目管理** — 公司级跨部门项目、周期里程碑、拖拽协作流程
- **文档中心** — 技术/设计/产品文档分类管理
- **任务管理** — 项目关联任务、看板/列表双视图

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript + Vite 7 |
| 样式 | Tailwind CSS 3.4 + shadcn/ui |
| 路由 | React Router DOM v7 |
| 动画 | GSAP 3 + @gsap/react + anime.js 4.4 |
| 图标 | Lucide React |

## 视觉系统

### 色彩
- 背景：`#000000`（纯黑）/ `#0C0C0E`（卡片）
- 品牌蓝：`#0A84FF` / `#38BDF8`
- 品牌金：`#D4A574` / `#F0C674`

### 字体
- 标题：LXGW WenKai（霞鹜文楷）
- 正文：Noto Sans SC

### 粒子特效
Hero 区域使用 Canvas 2D 实时渲染 1400 个粒子，模拟《星际穿越》Gargantua 黑洞吸积盘效果：
- 倾斜椭圆轨道（左下到右上，符合参考图角度）
- 粒子向内螺旋（半径递减）
- Doppler beaming 亮度加成
- 颜色由内到外：白/蓝白 → 金/橙 → 暗红
- 鼠标靠近时粒子亮度增强

### GSAP 动效
- SplitText 逐字 3D 翻转入场（Hero 标题）
- ShimmerCard 扫光 Hover 效果
- Timeline 弹窗弹性入场
- ScrollTrigger 批量卡片渐显
- useAnimatedNumber 数字滚动

## 项目结构

```
src/
  pages/                    # 页面组件
    Dashboard.tsx            # 总览页（核心页面）
    Departments.tsx          # 部门与智能体
    Projects.tsx             # 项目管理
    Documents.tsx            # 文档中心
    Tasks.tsx                # 任务管理
  components/
    GalaxyCanvas.tsx         # 黑洞粒子 Canvas（Hero 背景）
    ParticleCanvas.tsx       # 蓝金粒子 Canvas（备选）
    ProjectDetailModal.tsx   # 项目详情弹窗
    layout/
      PageLayout.tsx         # 页面布局框架
      Sidebar.tsx            # 侧边栏导航
      Topbar.tsx             # 顶部栏
    gsap/
      AnimatedCard.tsx       # GSAP hover 动画卡片
      ShimmerCard.tsx        # 扫光效果卡片
      SplitTextReveal.tsx    # 逐字 3D 翻转
      AnimatedProgressBar.tsx # 进度条动画
      StaggerReveal.tsx      # 批量入场
      TimelineEntrance.tsx   # Timeline 入场
  data/
    index.ts                 # 所有数据定义和示例数据
  hooks/
    useAnimatedNumber.ts     # GSAP 数字滚动 hook
  App.tsx                    # 路由配置
  main.tsx                   # 入口（GSAP 插件注册）
  index.css                  # 全局样式 + Tailwind
public/
  irra-avatar.png            # Irra 智能体头像
  mery-avatar.png            # Mery 智能体头像
```

## 核心功能说明

### 1. 项目-任务关联
任务（Task）通过 `projectId` 和 `projectName` 关联到具体项目，支持跨部门协作。

### 2. 项目周期系统
每个项目定义了 4-5 个里程碑（`ProjectCycle`），展示在时间线视图中。

### 3. 拖拽协作流程
每个项目可配置智能体协作流程（`WorkflowNode`），支持：
- 拖拽调整顺序
- 添加/删除智能体
- 编辑职责描述

### 4. 数据模型
详见 `src/data/index.ts`，包含完整的 TypeScript 类型定义和示例数据。

## 安装与运行

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

构建产物在 `dist/` 目录，可直接部署到任何静态托管服务。

## 部署

```bash
# 构建
npm run build

# dist/ 目录包含：
# - index.html
# - assets/ (JS + CSS bundle)
# - irra-avatar.png
# - mery-avatar.png
```

将 `dist/` 目录内容上传到 Nginx、Vercel、Netlify 或 GitHub Pages 即可。

## 团队成员

| 角色 | 姓名 | 职位 |
|------|------|------|
| 创始人 | JiaWen | Founder |
| CEO | Wenner | CEO |
| CTO | Irra | 技术部负责人 |
| CIO | Mery | 设计部负责人 |

## 许可证

MIT License
