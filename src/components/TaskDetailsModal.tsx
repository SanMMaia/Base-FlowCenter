'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TaskDetails {
  id: string;
  name: string;
  description: string;
  status: { status: string };
  custom_fields: Array<{ name: string; value: string | number | boolean | null }>;
}

interface TaskDetailsModalProps {
  taskData: TaskDetails;
  onClose: () => void;
}

export default function TaskDetailsModal({ taskData, onClose }: TaskDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(taskData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalhes da Tarefa Criada</h2>
          <div className="flex gap-2">
            <Button
              onClick={copyToClipboard}
              className="bg-indigo-600 text-white px-3 py-1 rounded text-sm"
            >
              {copied ? 'Copiado!' : 'Copiar JSON'}
            </Button>
            <Button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p><strong>ID:</strong> {taskData.id}</p>
            <p><strong>Status:</strong> {taskData.status?.status}</p>
            <p><strong>Criado em:</strong> {new Date(parseInt(taskData.date_created)).toLocaleString()}</p>
          </div>
          <div>
            <p><strong>URL:</strong> <a href={taskData.url} target="_blank" className="text-indigo-600">Abrir no ClickUp</a></p>
            <p><strong>Responsável:</strong> {taskData.assignees?.[0]?.username}</p>
          </div>
        </div>

        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(taskData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
