export interface Task {
  id: number;
  name: string;
  descript: string;
  status: 'todo' | 'working' | 'waiting' | 'done';
  deadline: string;
  priority: 'low' | 'mid' | 'high';
  subTasks: string[];
}

export interface AggregatedTask {
  id: number;
  name: string;
  descript: string;
  statuses: { status: string; count: number; }[];
}
