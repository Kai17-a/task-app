-- ワークスペース(workspaces)
create table if not exists workspaces(
  id integer primary key autoincrement not null,
  name varchar(15) unique,
  descript text not null,
  created_at datetime not null default (datetime('now', 'localtime')),
  updated_at datetime not null default (datetime('now', 'localtime'))
);

-- タスク(tasks)
create table if not exists tasks(
  id integer primary key autoincrement not null,
  name varchar(15) not null,
  descript varchar(15),
  status text not null,
  priority text not null,
  workspace_id integer not null,
  deadline text not null,
  note text,
  created_at datetime not null default (datetime('now', 'localtime')),
  updated_at datetime not null default (datetime('now', 'localtime'))
);

-- サブタスク(sub_tasks)
create table if not exists sub_tasks(
  id integer primary key autoincrement not null,
  name varchar(15) not null,
  is_done boolean not null default false,
  task_id integer not null,
  created_at datetime not null default (datetime('now', 'localtime')),
  updated_at datetime not null default (datetime('now', 'localtime'))
);

-- タスク関連ファイル()
create table if not exists related_files(
  id integer primary key autoincrement not null,
  name text not null,
  created_at datetime not null default (datetime('now', 'localtime')),
  updated_at datetime not null default (datetime('now', 'localtime'))
)
