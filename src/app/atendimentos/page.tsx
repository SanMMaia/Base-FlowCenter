'use client';

import { useEffect, useState } from 'react';
import { ClickUpTask } from '@/types/clickup';
import { getClickUpTasks } from '@/services/clickup';

export default function AtendimentosPage() {
  const [tasks, setTasks] = useState<ClickUpTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // Substituir pela default_list_id real
        const tasks = await getClickUpTasks('default_list_id'); 
        setTasks(tasks);
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Atendimentos</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow">
          {/* Lista de tarefas */}
          {tasks.map(task => (
            <div key={task.id} className="p-4 border-b border-gray-200 hover:bg-gray-50">
              <h3 className="font-medium">{task.name}</h3>
              <p className="text-sm text-gray-500">{task.status?.status || 'Sem status'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
