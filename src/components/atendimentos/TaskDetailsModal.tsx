'use client';
import { useState } from 'react';
import { AtendimentoTask } from '@/types/clickupTypes';
import { updateTask } from '@/services/clickupService';
import { ClickupConfig } from '@/types/clickupTypes';

interface TaskDetailsModalProps {
  task: AtendimentoTask;
  config: ClickupConfig;
  onClose: () => void;
  onUpdate: (updatedTask: AtendimentoTask) => void;
}

export default function TaskDetailsModal({
  task,
  config,
  onClose,
  onUpdate
}: TaskDetailsModalProps) {
  console.log('[Atendimentos] Modal de detalhes renderizado', { 
    taskId: task?.id,
    status: task?.status?.status
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    console.log('[Atendimentos] Atualizando tarefa', {
      taskId: task.id,
      changes: task
    });
    
    try {
      setIsLoading(true);
      setError(null);
      
      await updateTask(task.id, task, config.api_key);
      onClose();
    } catch (err) {
      console.error('[Atendimentos] Erro ao atualizar tarefa:', err);
      setError('Erro ao salvar alterações. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssigneeChange = (username: string) => {
    onUpdate({
      ...task,
      assignees: [{ 
        id: task.assignees?.[0]?.id?.toString() || '', 
        username 
      }]
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalhes do Atendimento</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Título</label>
              <input
                value={task.name}
                onChange={(e) => onUpdate({...task, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Descrição</label>
              <textarea
                value={task.description || ''}
                onChange={(e) => onUpdate({...task, description: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 h-32"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Status</label>
              <select
                value={task.status?.status || ''}
                onChange={(e) => onUpdate({...task, status: {...task.status, status: e.target.value}})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                disabled={isLoading}
              >
                <option value="Aberto">Aberto</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Responsável</label>
              <input
                value={task.assignees?.[0]?.username || ''}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Data de Criação</label>
              <p className="mt-1 p-2 bg-gray-50 rounded-md">
                {new Date(task.date_created).toLocaleString()}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium">Prazo Final</label>
              <input
                type="datetime-local"
                value={task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : ''}
                onChange={(e) => onUpdate({...task, due_date: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
