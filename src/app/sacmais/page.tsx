'use client';

import { Suspense, useState } from 'react';
import NewLayout from '@/components/NewLayout';
import Loading from '@/components/Loading';
import ChatToTaskModal from '@/components/ChatToTaskModal';
import { createClickUpTask, getClickUpConfig } from '@/services/clickup';
import { ClickUpTaskInput } from '@/types/clickup';

export default function SacmaisPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateTask = async (taskData: ClickUpTaskInput) => {
    try {
      const config = await getClickUpConfig();
      await createClickUpTask(
        {
          ...taskData,
          titulo: taskData.name || taskData.titulo || '',
          descricao: taskData.description || taskData.descricao || ''
        },
        config.default_list_id,
        config.api_key
      );
      alert('Tarefa criada com sucesso no ClickUp!');
      setIsModalOpen(false);
    } catch (error: unknown) {
      console.error('Erro ao criar tarefa:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao criar tarefa: ${message}`);
    }
  };

  return (
    <NewLayout>
      <div className="relative h-full">
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed top-2  right-55 z-[5] bg-indigo-600 text-white px-4 py-1 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Novo
        </button>
        <ChatToTaskModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleCreateTask}
        />
        <Suspense fallback={<Loading />}>
          <iframe 
            src="https://app2.sacmais.com.br/" 
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            allowFullScreen
            loading="lazy"
          />
        </Suspense>
      </div>
    </NewLayout>
  );
}
