'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { User } from '@/types/commons';
import { AppModule } from '@/types/admin';
import { Button } from '@/components/ui/button';

interface ManageUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  users: User[];
  onSave: (userData: User) => void;
  setSelectedUser: (user: User | null) => void;
  fetchUserModules: (userId: string) => Promise<AppModule[]>;
  setUserModules: (modules: AppModule[]) => void;
}

export default function ManageUsersModal({ 
  isOpen,
  onClose, 
  user,
  users,
  onSave,
  setSelectedUser,
  fetchUserModules,
  setUserModules
}: ManageUsersModalProps) {
  const [formData, setFormData] = useState<User>({
    id: user?.id || '',
    email: user?.email || '',
    full_name: user?.full_name || '',
    role: user?.role || 'user',
    custom_id: user?.custom_id || null
  });

  const [loadingModules, setLoadingModules] = useState(false);

  // Carrega os módulos quando o usuário muda
  useEffect(() => {
    if (user?.id) {
      setLoadingModules(true);
      fetchUserModules(user.id)
        .then(modules => {
          setUserModules(modules);
          setLoadingModules(false);
        })
        .catch(() => setLoadingModules(false));
    }
  }, [user?.id, fetchUserModules, setUserModules]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSelectedUser(null);
  };

  return (
    <div className="fixed inset-0 bg-gray-200/10 backdrop-blur-sm flex items-center justify-center p-6 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-5 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-sm">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-medium text-gray-900">
            {user.id ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto pb-4">
          {loadingModules ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Seção de seleção de usuário - agora com verificação explícita */}
              {users && users.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selecionar Usuário
                  </label>
                  <select
                    value={user.id}
                    onChange={(e) => {
                      const selected = users.find(u => u.id === e.target.value);
                      setSelectedUser(selected || null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Campos do formulário existentes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Usuário</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as 'user' | 'admin'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Personalizado</label>
                <input
                  type="text"
                  value={formData.custom_id || ''}
                  onChange={(e) => setFormData({...formData, custom_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Seção de módulos (quando disponível) */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Módulos Acessíveis</h4>
                <div className="grid grid-cols-2 gap-2">
                  {/* Aqui viria a lista de módulos quando implementada */}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
