-- ワークスペース(workspaces)
create table if not exists workspaces(
  id integer primary key autoincrement not null,
  name varchar(15),
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
  status text not null,
  task_id integer not null,
  created_at datetime not null default (datetime('now', 'localtime')),
  updated_at datetime not null default (datetime('now', 'localtime'))
);
