'use client';
import { ReactNode } from 'react';

interface Column {
  header: string;
  accessor: string;
  cell?: (value: any) => ReactNode;
}

interface CustomField {
  name: string;
  value: string | number | boolean | null;
}

interface Task {
  id: string;
  name: string;
  status: { status: string };
  custom_fields: CustomField[];
}

interface TaskTableProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

const formatDate = (dateValue: any) => {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
};

type TaskAccessor = keyof Task;

const getTaskValue = (task: Task, accessor: TaskAccessor) => {
  return task[accessor];
};

const getCustomField = (fields: CustomField[], fieldName: string) => {
  const field = fields?.find(f => f.name === fieldName);
  return field?.value || '-';
};

const formatClienteProduto = (fields: CustomField[] = []) => {
  const cliente = getCustomField(fields, 'Cliente');
  const produto = getCustomField(fields, 'Produto');
  return `${cliente} x ${produto}`;
};

const columns: Column[] = [
  {
    header: 'Tarefa',
    accessor: 'name'
  },
  {
    header: 'Status',
    accessor: 'status.status',
    cell: (status: string) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        status === 'Concluído' ? 'bg-green-100 text-green-800' :
        status === 'Em andamento' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {status || '-'}
      </span>
    )
  },
  {
    header: 'Data Inicial',
    accessor: 'start_date',
    cell: formatDate
  },
  {
    header: 'Data Venc.',
    accessor: 'due_date',
    cell: formatDate
  },
  {
    header: 'Cliente x Produto',
    accessor: 'custom_fields',
    cell: formatClienteProduto
  }
];

export function TaskTable({ tasks, onTaskClick }: TaskTableProps) {
  function getStatusColor(status: string) {
    switch(status) {
      case 'concluido': return 'bg-green-100 text-green-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">Título</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Cliente</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map(task => (
            <tr key={task.id} onClick={() => onTaskClick(task.id)} className="hover:bg-gray-50 cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap">{task.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status.status)}`}>
                  {task.status.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{formatClienteProduto(task.custom_fields)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
