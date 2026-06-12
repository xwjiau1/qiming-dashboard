# 启明科技管理平台 v1.0

启明科技（Metanoia）内部一站式管理驾驶舱，整合部门管理、项目跟踪、文档中心、任务管理四大核心模块。

## 技术栈

- **前端**: React + TypeScript + Vite + Tailwind CSS + Framer Motion
- **后端**: Express + TypeScript + better-sqlite3 (SQLite)
- **构建**: Vite v7.3.0
- **测试**: Playwright (端到端测试配置已就绪)

## 快速开始

```bash
# 安装依赖
npm run setup

# 开发模式（前后端同时启动）
npm run dev

# 生产构建
npm run build

# 启动服务
npm start

# 端到端测试（需先安装 Playwright 浏览器）
npm run test:e2e
```

## 项目结构

```
.
├── src/
│   ├── backend/          # 后端 API 服务
│   │   ├── routes/       # API 路由（智能体/部门/项目/任务/文档/动态/总览）
│   │   ├── database/     # 数据库连接与建表
│   │   ├── middleware/   # 中间件（动态记录等）
│   │   └── utils/        # 工具函数（序列化层等）
│   ├── frontend/         # 前端 React 应用
│   │   ├── src/
│   │   │   ├── pages/    # 页面组件
│   │   │   ├── components/ # 公共组件
│   │   │   ├── hooks/    # 自定义 Hooks
│   │   │   └── data/     # 类型定义与数据
│   │   └── ...
│   └── data/             # SQLite 数据库文件
├── e2e/                  # Playwright 端到端测试
├── dist/                 # 前端构建产物
└── start.sh              # 启动脚本
```

## 核心特性

- **总览 Dashboard**: KPI 看板、部门概览、项目进度、活跃任务、最近动态
- **部门管理**: 部门列表、负责人信息、成员数量、关联项目
- **项目跟踪**: 项目列表、项目详情、周期里程碑、协作流程
- **任务管理**: 看板/列表双视图、状态过滤、优先级过滤、拖拽排序
- **文档中心**: 文档列表、类型过滤、状态管理

## 数据模型

SQLite 数据库包含以下表：

| 表名 | 说明 |
|------|------|
| `agents` | 智能体信息 |
| `departments` | 部门信息 |
| `projects` | 项目信息 |
| `project_cycles` | 项目周期/里程碑 |
| `workflow_nodes` | 项目协作流程节点 |
| `project_departments` | 项目-部门关联 |
| `tasks` | 任务信息 |
| `documents` | 文档信息 |
| `activities` | 动态记录 |

## API 规范

后端统一响应格式：

```json
{
  "success": true,
  "data": { ... }
}
```

所有字段自动从 `snake_case` 转换为 `camelCase`（通过序列化层 `utils/serializer.ts`）。

## 序列化层

位于 `src/backend/utils/serializer.ts`，提供：

- `keysToCamelCase(obj)` — 递归将 snake_case 转为 camelCase
- `keysToSnakeCase(obj)` — 递归将 camelCase 转为 snake_case
- `successResponse(data)` — 标准成功响应包装
- `errorResponse(message)` — 标准错误响应包装

## 开发团队

- **Wenner** — CEO
- **Irra** — CTO · 技术部负责人
- **Mery** — CIO · 设计部负责人

## 版本历史

- **v1.0.0** — 初始版本，包含部门/项目/任务/文档四大模块

## 许可证

MIT
