import { AtendimentoTask } from '@/types/clickupTypes';

declare module './TaskTable.new' {
  export interface TaskTableProps {
    tasks: AtendimentoTask[];
  }
  
  const TaskTable: React.FC<TaskTableProps>;
  export default TaskTable;
}
