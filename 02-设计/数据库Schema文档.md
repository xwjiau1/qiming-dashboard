# 公司管理平台 — 数据库 Schema 文档

> **文档版本：** v1.0  
> **生成日期：** 2026-06-17  
> **数据库类型：** SQLite  
> **表总数：** 10 张  
> **项目路径：** `tech/projects/company-platform/`

---

## 一、数据库概述

| 属性 | 说明 |
|------|------|
| 数据库类型 | SQLite |
| 驱动库 | better-sqlite3 |
| 数据库文件 | `src/data/company.db` |
| 表数量 | 10 张 |
| 外键约束 | 已启用（`PRAGMA foreign_keys = ON`） |
| 字符编码 | UTF-8 |
| 时间存储 | INTEGER（Unix 时间戳，毫秒） |

---

## 二、表结构详述

### 2.1 agents（智能体表）

存储公司 AI 智能体（Agent）的基本信息、人设与状态。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | TEXT | PRIMARY KEY | — | 智能体唯一标识（如 `wenner`、`irra`、`mery`） |
| name | TEXT | NOT NULL | — | 智能体显示名称 |
| title | TEXT | NOT NULL | — | 职位头衔 |
| department_id | TEXT | NOT NULL | — | 所属部门 ID，关联 `departments.id` |
| role | TEXT | NOT NULL | — | 角色描述 |
| avatar | TEXT | — | NULL | 头像 URL 或路径 |
| color_theme | TEXT | NOT NULL, CHECK | — | 主题色：`blue` 或 `gold` |
| badge | TEXT | — | NULL | 徽章/标签 |
| story_summary | TEXT | — | NULL | 人设简介（短） |
| story_full | TEXT | — | NULL | 人设详情（长） |
| abilities | TEXT | — | NULL | 能力列表（JSON 或文本） |
| status | TEXT | NOT NULL, CHECK | `'online'` | 状态：`online`、`offline`、`busy` |
| created_at | INTEGER | NOT NULL | — | 创建时间（毫秒时间戳） |
| updated_at | INTEGER | NOT NULL | — | 更新时间（毫秒时间戳） |

**索引：**
- `idx_agents_department` — 部门 ID 索引

**关联：**
- `department_id` → `departments.id`

---

### 2.2 departments（部门表）

存储公司部门信息。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | TEXT | PRIMARY KEY | — | 部门唯一标识 |
| name | TEXT | NOT NULL | — | 部门名称 |
| short_name | TEXT | — | NULL | 部门简称 |
| color | TEXT | NOT NULL, CHECK | — | 主题色：`blue` 或 `gold` |
| color_hex | TEXT | — | NULL | 十六进制颜色值 |
| description | TEXT | — | NULL | 部门描述 |
| member_count | INTEGER | NOT NULL | `0` | 成员数量 |
| head_id | TEXT | — | NULL | 负责人 ID，关联 `agents.id` |
| created_at | INTEGER | NOT NULL | — | 创建时间 |
| updated_at | INTEGER | NOT NULL | — | 更新时间 |

**关联：**
- `head_id` → `agents.id`

---

### 2.3 projects（项目表）

存储公司项目的基本信息、进度与负责人。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | TEXT | PRIMARY KEY | — | 项目唯一标识 |
| name | TEXT | NOT NULL | — | 项目名称 |
| description | TEXT | — | NULL | 项目描述 |
| status | TEXT | NOT NULL, CHECK | — | 状态：`in-progress`、`completed`、`planning`、`paused` |
| progress | INTEGER | NOT NULL, CHECK | `0` | 进度百分比（0-100） |
| lead_id | TEXT | — | NULL | 负责人 ID |
| lead_name | TEXT | — | NULL | 负责人姓名（冗余存储） |
| lead_avatar | TEXT | — | NULL | 负责人头像 |
| lead_role | TEXT | — | NULL | 负责人角色 |
| deadline | TEXT | — | NULL | 截止日期（ISO 日期字符串） |
| start_date | TEXT | — | NULL | 开始日期（ISO 日期字符串） |
| task_count | INTEGER | NOT NULL | `0` | 任务总数 |
| completed_tasks | INTEGER | NOT NULL | `0` | 已完成任务数 |
| updated_at | TEXT | — | NULL | 更新时间（ISO 日期字符串） |
| created_at | INTEGER | NOT NULL | — | 创建时间（毫秒时间戳） |
| updated_at_ts | INTEGER | NOT NULL | — | 更新时间（毫秒时间戳） |

**索引：**
- `idx_projects_status` — 项目状态索引

---

### 2.4 project_departments（项目-部门关联表）

多对多关联表，记录项目与部门的参与关系。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| project_id | TEXT | NOT NULL, PK | — | 项目 ID |
| department_id | TEXT | NOT NULL, PK | — | 部门 ID |

**主键：** `(project_id, department_id)` 复合主键

**外键：**
- `project_id` → `projects.id`（ON DELETE CASCADE）
- `department_id` → `departments.id`（ON DELETE CASCADE）

---

### 2.5 project_cycles（项目里程碑表）

存储项目的阶段性里程碑或开发周期。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | TEXT | PRIMARY KEY | — | 里程碑唯一标识 |
| project_id | TEXT | NOT NULL | — | 所属项目 ID |
| name | TEXT | NOT NULL | — | 里程碑名称 |
| description | TEXT | — | NULL | 描述 |
| start_date | TEXT | — | NULL | 开始日期 |
| end_date | TEXT | — | NULL | 结束日期 |
| status | TEXT | NOT NULL, CHECK | — | 状态：`completed`、`in-progress`、`pending` |
| color | TEXT | — | NULL | 显示颜色 |
| order | INTEGER | NOT NULL | `0` | 排序序号 |
| created_at | INTEGER | NOT NULL | — | 创建时间 |

**索引：**
- `idx_cycles_project` — 项目 ID 索引

**外键：**
- `project_id` → `projects.id`（ON DELETE CASCADE）

---

### 2.6 workflow_nodes（协作流程节点表）

存储项目的协作流程节点，记录各智能体在项目中的职责与顺序。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | TEXT | PRIMARY KEY | — | 节点唯一标识 |
| project_id | TEXT | NOT NULL | — | 所属项目 ID |
| agent_id | TEXT | NOT NULL | — | 智能体 ID |
| agent_name | TEXT | NOT NULL | — | 智能体名称（冗余） |
| agent_avatar | TEXT | — | NULL | 智能体头像（冗余） |
| agent_role | TEXT | — | NULL | 智能体角色（冗余） |
| department | TEXT | — | NULL | 所属部门名称（冗余） |
| department_color | TEXT | CHECK | NULL | 部门主题色：`blue` 或 `gold` |
| order | INTEGER | NOT NULL | `0` | 节点顺序 |
| responsibility | TEXT | — | NULL | 职责描述 |
| created_at | INTEGER | NOT NULL | — | 创建时间 |
| updated_at | INTEGER | NOT NULL | — | 更新时间 |

**索引：**
- `idx_workflow_project` — 项目 ID 索引

**外键：**
- `project_id` → `projects.id`（ON DELETE CASCADE）

---

### 2.7 tasks（任务表）

存储项目中的具体任务。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | TEXT | PRIMARY KEY | — | 任务唯一标识 |
| title | TEXT | NOT NULL | — | 任务标题 |
| priority | TEXT | NOT NULL, CHECK | — | 优先级：`high`、`medium`、`low` |
| status | TEXT | NOT NULL, CHECK | — | 状态：`todo`、`in-progress`、`review`、`completed` |
| project_id | TEXT | NOT NULL | — | 所属项目 ID |
| project_name | TEXT | — | NULL | 项目名称（冗余） |
| department | TEXT | — | NULL | 负责部门名称（冗余） |
| department_color | TEXT | CHECK | NULL | 部门主题色 |
| type | TEXT | — | NULL | 任务类型 |
| assignee_id | TEXT | — | NULL | 执行人 ID |
| assignee_name | TEXT | — | NULL | 执行人姓名（冗余） |
| assignee_avatar | TEXT | — | NULL | 执行人头像（冗余） |
| assignee_role | TEXT | — | NULL | 执行人角色（冗余） |
| due_date | TEXT | — | NULL | 截止日期 |
| completed_at | TEXT | — | NULL | 完成时间 |
| description | TEXT | — | NULL | 任务描述 |
| created_at | INTEGER | NOT NULL | — | 创建时间 |
| updated_at | INTEGER | NOT NULL | — | 更新时间 |

**索引：**
- `idx_tasks_project` — 项目 ID 索引
- `idx_tasks_status` — 状态索引
- `idx_tasks_priority` — 优先级索引
- `idx_tasks_assignee` — 执行人索引

**外键：**
- `project_id` → `projects.id`（ON DELETE CASCADE）

---

### 2.8 documents（文档表）

存储项目相关文档的信息。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | TEXT | PRIMARY KEY | — | 文档唯一标识 |
| name | TEXT | NOT NULL | — | 文档名称 |
| type | TEXT | NOT NULL, CHECK | — | 类型：`technical`、`design`、`product`、`meeting`、`architecture` |
| department | TEXT | — | NULL | 所属部门名称 |
| department_color | TEXT | CHECK | NULL | 部门主题色 |
| updated_by_id | TEXT | — | NULL | 最后更新人 ID |
| updated_by_name | TEXT | — | NULL | 最后更新人姓名（冗余） |
| updated_by_avatar | TEXT | — | NULL | 最后更新人头像（冗余） |
| updated_at | TEXT | — | NULL | 更新时间（ISO 字符串） |
| updated_at_ts | INTEGER | — | NULL | 更新时间（毫秒时间戳） |
| status | TEXT | NOT NULL, CHECK | — | 状态：`latest`、`update-needed`、`draft` |
| content | TEXT | — | NULL | 文档内容（Markdown/HTML） |
| created_at | INTEGER | NOT NULL | — | 创建时间 |
| updated_at_meta | INTEGER | NOT NULL | — | 元数据更新时间 |

**索引：**
- `idx_docs_type` — 文档类型索引

---

### 2.9 activities（动态记录表）

存储系统动态/操作日志，用于「动态」模块展示。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | TEXT | PRIMARY KEY | — | 动态唯一标识 |
| user_id | TEXT | — | NULL | 操作用户 ID |
| user_name | TEXT | NOT NULL | — | 操作用户名称 |
| user_avatar | TEXT | — | NULL | 操作用户头像 |
| action | TEXT | NOT NULL | — | 操作动作（如 `创建`、`更新`、`完成`） |
| target | TEXT | NOT NULL | — | 操作目标名称 |
| target_id | TEXT | — | NULL | 操作目标 ID |
| target_type | TEXT | — | NULL | 目标类型（如 `project`、`task`、`document`） |
| timestamp | TEXT | — | NULL | 操作时间（ISO 字符串） |
| color | TEXT | CHECK | NULL | 主题色：`blue` 或 `gold` |
| created_at | INTEGER | NOT NULL | — | 创建时间 |

---

### 2.10 todos（待办表）

v2 版本新增，存储个人待办事项。

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | TEXT | PRIMARY KEY | — | 待办唯一标识 |
| title | TEXT | NOT NULL | — | 待办标题 |
| completed | INTEGER | NOT NULL, CHECK | `0` | 是否完成：`0`=未完成，`1`=已完成 |
| priority | TEXT | NOT NULL, CHECK | `'medium'` | 优先级：`high`、`medium`、`low` |
| due_date | TEXT | — | NULL | 截止日期 |
| assignee_id | TEXT | — | NULL | 负责人 ID |
| assignee_name | TEXT | — | NULL | 负责人姓名（冗余） |
| assignee_avatar | TEXT | — | NULL | 负责人头像（冗余） |
| created_at | INTEGER | NOT NULL | — | 创建时间 |
| updated_at | INTEGER | NOT NULL | — | 更新时间 |

**索引：**
- `idx_todos_completed` — 完成状态索引
- `idx_todos_priority` — 优先级索引

---

## 三、索引汇总

| 索引名称 | 所属表 | 字段 | 类型 | 说明 |
|----------|--------|------|------|------|
| idx_agents_department | agents | department_id | 普通索引 | 按部门查询智能体 |
| idx_projects_status | projects | status | 普通索引 | 按状态筛选项目 |
| idx_cycles_project | project_cycles | project_id | 普通索引 | 查询项目的里程碑 |
| idx_workflow_project | workflow_nodes | project_id | 普通索引 | 查询项目的协作节点 |
| idx_tasks_project | tasks | project_id | 普通索引 | 查询项目的任务 |
| idx_tasks_status | tasks | status | 普通索引 | 按状态筛选任务 |
| idx_tasks_priority | tasks | priority | 普通索引 | 按优先级筛选任务 |
| idx_tasks_assignee | tasks | assignee_id | 普通索引 | 查询执行人的任务 |
| idx_docs_type | documents | type | 普通索引 | 按类型筛选文档 |
| idx_todos_completed | todos | completed | 普通索引 | 筛选已完成/未完成 |
| idx_todos_priority | todos | priority | 普通索引 | 按优先级筛选待办 |

---

## 四、外键关系

```
┌─────────────┐         ┌──────────────────┐
│ departments │◄────────┤ project_departments │
└──────┬──────┘         └────────┬───────────┘
       │                         │
       │    ┌────────────────────┘
       │    │
┌──────▼────▼─────┐    ┌──────────────┐    ┌──────────────┐
│     agents      │    │   projects   │◄───┤ project_cycles│
└─────────────────┘    └──────┬───────┘    └──────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
     ┌──────▼──────┐   ┌─────▼─────┐   ┌──────▼──────┐
     │   tasks     │   │workflow_nodes│  │ activities  │
     └─────────────┘   └───────────┘   └─────────────┘
```

### 关系明细

| 子表 | 字段 | 父表 | 父字段 | 级联规则 |
|------|------|------|--------|----------|
| agents | department_id | departments | id | — |
| departments | head_id | agents | id | — |
| project_departments | project_id | projects | id | CASCADE |
| project_departments | department_id | departments | id | CASCADE |
| project_cycles | project_id | projects | id | CASCADE |
| workflow_nodes | project_id | projects | id | CASCADE |
| tasks | project_id | projects | id | CASCADE |

---

## 五、字段命名规范

本项目采用 **snake_case（下划线命名）** 作为数据库字段命名规范：

- 全部小写
- 单词间使用下划线 `_` 分隔
- 时间戳字段：`created_at`、`updated_at`
- 布尔字段：`completed`（INTEGER 类型，0/1）
- 外键字段：`{表名}_id`（如 `project_id`、`department_id`）

**注意：** 前端 API 层已将 snake_case 字段映射为 camelCase，以符合前端编码规范。

---

## 六、数据类型说明

| SQLite 类型 | 实际用途 | 示例 |
|-------------|----------|------|
| TEXT | 字符串、UUID、日期字符串 | `id`、`name`、`deadline` |
| INTEGER | 整数、布尔、时间戳 | `progress`、`completed`、`created_at` |
| CHECK 约束 | 枚举值限制 | `status IN ('todo','in-progress','review','completed')` |
| PRIMARY KEY | 主键 | `id` 字段 |
| NOT NULL | 非空约束 | 必填字段 |
| DEFAULT | 默认值 | `DEFAULT 0`、`DEFAULT 'online'` |

---

## 七、变更记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2026-06-17 | 初始版本，涵盖全部 10 张表 |

---

*文档维护：技术部（Irra）*  
*审核：Wenner*
