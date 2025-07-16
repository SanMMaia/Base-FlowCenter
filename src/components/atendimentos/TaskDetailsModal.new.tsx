'use client';
import { AtendimentoTask } from '@/types/atendimentos';

interface TaskDetailsModalProps {
  task: AtendimentoTask;
  onClose: () => void;
}

export default function TaskDetailsModalNew({ task, onClose }: TaskDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{task.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Detalhes da tarefa */}
        </div>
      </div>
    </div>
  );
}
