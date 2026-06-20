import { db } from './数据库.ts';

export function initSchema() {
  // 1. 智能体表
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      title         TEXT NOT NULL,
      department_id TEXT NOT NULL,
      role          TEXT NOT NULL,
      avatar        TEXT,
      color_theme   TEXT NOT NULL CHECK(color_theme IN ('blue','gold')),
      badge         TEXT,
      story_summary TEXT,
      story_full    TEXT,
      abilities     TEXT,
      status        TEXT NOT NULL DEFAULT 'online' CHECK(status IN ('online','offline','busy')),
      created_at    INTEGER NOT NULL,
      updated_at    INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_agents_department ON agents(department_id);
  `);

  // 2. 部门表
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      short_name    TEXT,
      color         TEXT NOT NULL CHECK(color IN ('blue','gold')),
      color_hex     TEXT,
      description   TEXT,
      member_count  INTEGER NOT NULL DEFAULT 0,
      head_id       TEXT,
      created_at    INTEGER NOT NULL,
      updated_at    INTEGER NOT NULL
    );
  `);

  // 3. 项目表
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id                  TEXT PRIMARY KEY,
      name                TEXT NOT NULL,
      description         TEXT,
      status              TEXT NOT NULL CHECK(status IN ('in-progress','completed','planning','paused')),
      progress            INTEGER NOT NULL DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
      lead_id             TEXT,
      lead_name           TEXT,
      lead_avatar         TEXT,
      lead_role           TEXT,
      deadline            TEXT,
      start_date          TEXT,
      task_count          INTEGER NOT NULL DEFAULT 0,
      completed_tasks     INTEGER NOT NULL DEFAULT 0,
      updated_at          TEXT,
      created_at          INTEGER NOT NULL,
      updated_at_ts       INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
  `);

  // 4. 项目-部门关联表
  db.exec(`
    CREATE TABLE IF NOT EXISTS project_departments (
      project_id     TEXT NOT NULL,
      department_id  TEXT NOT NULL,
      PRIMARY KEY (project_id, department_id),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
    );
  `);

  // 5. 项目里程碑表
  db.exec(`
    CREATE TABLE IF NOT EXISTS project_cycles (
      id           TEXT PRIMARY KEY,
      project_id   TEXT NOT NULL,
      name         TEXT NOT NULL,
      description  TEXT,
      start_date   TEXT,
      end_date     TEXT,
      status       TEXT NOT NULL CHECK(status IN ('completed','in-progress','pending')),
      color        TEXT,
      "order"      INTEGER NOT NULL DEFAULT 0,
      created_at   INTEGER NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_cycles_project ON project_cycles(project_id);
  `);

  // 6. 协作流程节点表
  db.exec(`
    CREATE TABLE IF NOT EXISTS workflow_nodes (
      id              TEXT PRIMARY KEY,
      project_id      TEXT NOT NULL,
      agent_id        TEXT NOT NULL,
      agent_name      TEXT NOT NULL,
      agent_avatar    TEXT,
      agent_role      TEXT,
      department      TEXT,
      department_color TEXT CHECK(department_color IN ('blue','gold')),
      "order"         INTEGER NOT NULL DEFAULT 0,
      responsibility  TEXT,
      created_at      INTEGER NOT NULL,
      updated_at      INTEGER NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_workflow_project ON workflow_nodes(project_id);
  `);

  // 7. 任务表
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id              TEXT PRIMARY KEY,
      title           TEXT NOT NULL,
      priority        TEXT NOT NULL CHECK(priority IN ('high','medium','low')),
      status          TEXT NOT NULL CHECK(status IN ('todo','in-progress','review','completed')),
      project_id      TEXT NOT NULL,
      project_name    TEXT,
      department      TEXT,
      department_color TEXT CHECK(department_color IN ('blue','gold')),
      type            TEXT,
      assignee_id     TEXT,
      assignee_name   TEXT,
      assignee_avatar TEXT,
      assignee_role   TEXT,
      due_date        TEXT,
      completed_at    TEXT,
      description     TEXT,
      created_at      INTEGER NOT NULL,
      updated_at      INTEGER NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
  `);

  // 8. 文档表
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      type            TEXT NOT NULL CHECK(type IN ('technical','design','product','meeting','architecture')),
      department      TEXT,
      department_color TEXT CHECK(department_color IN ('blue','gold')),
      updated_by_id   TEXT,
      updated_by_name TEXT,
      updated_by_avatar TEXT,
      updated_at      TEXT,
      updated_at_ts   INTEGER,
      status          TEXT NOT NULL CHECK(status IN ('latest','update-needed','draft')),
      content         TEXT,
      created_at      INTEGER NOT NULL,
      updated_at_meta INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_docs_type ON documents(type);
  `);

  // 9. 动态记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id           TEXT PRIMARY KEY,
      user_id      TEXT,
      user_name    TEXT NOT NULL,
      user_avatar  TEXT,
      action       TEXT NOT NULL,
      target       TEXT NOT NULL,
      target_id    TEXT,
      target_type  TEXT,
      timestamp    TEXT,
      color        TEXT CHECK(color IN ('blue','gold')),
      created_at   INTEGER NOT NULL
    );
  `);

  // 10. 待办表（v2 新增）
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id              TEXT PRIMARY KEY,
      title           TEXT NOT NULL,
      completed       INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1)),
      priority        TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('high','medium','low')),
      due_date        TEXT,
      assignee_id     TEXT,
      assignee_name   TEXT,
      assignee_avatar TEXT,
      created_at      INTEGER NOT NULL,
      updated_at      INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
    CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
  `);

  console.log('[数据库] Schema 初始化完成');
}
