import { Task } from './task'

export interface TaskList {
  todo: {
    value: string;
    data: Task[];
  };
  working: {
    value: string;
    data: Task[];
  };
  waiting: {
    value: string;
    data: Task[];
  };
  done: {
    value: string;
    data: Task[];
  };
}
