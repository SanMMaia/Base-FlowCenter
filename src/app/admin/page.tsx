'use client';

import React, { useState, useEffect } from 'react';
import NewLayout from '@/components/NewLayout';
import AdminGuard from '@/components/AdminGuard';
import supabase from '@/lib/supabase/client';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ManageUsersModal from '@/components/ManageUsersModal';
import { User, Module } from '@/types/commons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, ListTodo, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Wifi, Save } from 'lucide-react';

interface AppModule {
  moduleId: number;
  userId: string;
}

interface Tab {
  id: string;
  label: string;
}

interface ClickUpListResponse {
  tasks?: unknown[];
  error?: string;
  listId?: string;
  listName?: string;
}

const tabs: Tab[] = [
  { id: 'users', label: 'Gerenciar Usuários' },
  { id: 'modules', label: 'Módulos Disponíveis' },
  { id: 'clickup', label: 'Configurações ClickUp' }
];

const Tabs = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) => {
  if (!tabs.length) return <div>Carregando abas...</div>;

  return (
    <div className="flex border-b border-background/20">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
            activeTab === tab.id 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-foreground/60 hover:text-foreground hover:bg-background/10'
          }`}
          onClick={() => tab.id && setActiveTab(tab.id)}
        >
          {tab.label || 'Tab'}
        </button>
      ))}
    </div>
  );
};

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    tab?: string;
  }
}

const toast = {
  success: (msg: string) => console.log('SUCCESS:', msg),
  error: (msg: string) => console.error('ERROR:', msg),
  warning: (msg: string) => console.warn('WARNING:', msg)
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([
    { id: 1, name: 'Dashboard', description: 'Painel principal', path: '/dashboard' },
    { id: 2, name: 'Sacmais', description: 'Sistema de atendimento', path: '/sacmais' },
    { id: 3, name: 'Atendimentos', description: 'Gestão de atendimentos', path: '/atendimentos' },
    { id: 4, name: 'Agenda', description: 'Agenda e calendário', path: '/agenda' },
    { id: 5, name: 'Clientes', description: 'Gestão de clientes', path: '/clientes' },
    { id: 6, name: 'Configurações', description: 'Configurações do sistema', path: '/configuracoes' },
    { id: 7, name: 'Admin', description: 'Administração do sistema', path: '/admin', adminOnly: true },
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userModules, setUserModules] = useState<AppModule[]>([]);
  const [updateStatus, setUpdateStatus] = useState<{loading: boolean; error: string | null; success: string | null}>({loading: false, error: null, success: null});
  const [moduleIdBeingUpdated, setModuleIdBeingUpdated] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || '');
  const [clickupConfig, setClickupConfig] = useState({
    apiKey: '',
    teamId: '',
    defaultListId: '',
    clientProductsListId: '',
    productsListId: ''
  });
  const [clickupStatus, setClickupStatus] = useState<{
    loading: boolean;
    error: string | null;
    success: string | null;
  }>({ loading: false, error: null, success: null });
  const [manageUsersModalOpen, setManageUsersModalOpen] = useState(false);
  const [apiTestResults, setApiTestResults] = useState<{ [key: string]: ClickUpListResponse | null } | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleModulesUpdated = () => {
      fetchUserModules(selectedUser?.id || '');
    };

    window.addEventListener('modules-updated', handleModulesUpdated);

    return () => {
      window.removeEventListener('modules-updated', handleModulesUpdated);
    };
  }, [selectedUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar usuários e módulos em paralelo
      const [
        { data: users },
        { data: modules }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('modules').select('*')
      ]);

      if (users) setUsers(users);
      if (modules) setModules(modules);
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*');
    
    if (data) setUsers(data);
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    
    if (!error) fetchUsers();
  };

  const fetchUserModules = async (userId: string): Promise<AppModule[]> => {
    const { data } = await supabase
      .from('user_modules')
      .select('module_id, has_access')
      .eq('user_id', userId);

    console.log('Dados brutos do Supabase:', data);
    
    if (data) {
      return data.map(item => ({
        userId,
        moduleId: item.module_id,
      }));
    }
    
    return [];
  };

  const updateModuleAccess = async (userId: string, moduleId: number, access: boolean) => {
    try {
      console.log('Atualizando permissão:', {userId, moduleId, access});
      setUpdateStatus({ loading: true, error: null, success: null });
      setModuleIdBeingUpdated(moduleId);
      
      // 1. Atualização atômica no banco
      const { error } = await supabase
        .from('user_modules')
        .upsert(
          { user_id: userId, module_id: moduleId, has_access: access },
          { onConflict: 'user_id,module_id' }
        );

      if (error) throw error;
      
      // 2. Atualização otimizada do estado local
      setUserModules(prev => {
        const updated = [...prev.filter(m => !(m.userId === userId && m.moduleId === moduleId))];
        if (access) {
          updated.push({userId, moduleId, hasAccess: access});
        }
        return updated;
      });
      
      // 3. Disparar evento com timeout para garantir renderização
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('modules-updated', {
          detail: { userId }
        }));
      }, 100);
      
      setUpdateStatus({ loading: false, error: null, success: 'Permissão atualizada!' });
    } catch (error: unknown) {
      console.error('Erro ao atualizar permissão:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setUpdateStatus({ loading: false, error: errorMessage, success: null });
    } finally {
      setModuleIdBeingUpdated(null);
    }
  };

  const checkModuleAccess = (userId: string, moduleId: number) => {
    return userModules.some(m => m.moduleId === moduleId && m.userId === userId);
  };

  const saveClickupConfig = async () => {
    console.log('Salvando configurações:', clickupConfig);
    
    try {
      // Primeiro deleta qualquer registro existente
      const { error: deleteError } = await supabase
        .from('clickup_config')
        .delete()
        .neq('id', 0); // Deleta todos os registros
      
      if (deleteError) throw deleteError;
      
      // Insere o novo registro
      const { error } = await supabase
        .from('clickup_config')
        .insert({
          api_key: clickupConfig.apiKey,
          team_id: clickupConfig.teamId,
          default_list_id: clickupConfig.defaultListId,
          client_products_list_id: clickupConfig.clientProductsListId,
          products_list_id: clickupConfig.productsListId
        });

      if (error) throw error;
      
      console.log('Configurações salvas com sucesso (registro único)');
      setClickupStatus({ loading: false, error: null, success: 'Configurações salvas!' });
      await loadClickupConfig();
    } catch (error: unknown) {
      console.error('Erro ao salvar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar configurações';
      setClickupStatus({ 
        loading: false, 
        error: errorMessage, 
        success: null 
      });
    }
  };

  const loadClickupConfig = async () => {
    console.log('Iniciando carregamento das configurações ClickUp');
    setClickupStatus({ loading: true, error: null, success: null });
    
    try {
      console.log('Buscando dados no Supabase...');
      const { data, count } = await supabase
        .from('clickup_config')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('Resultado da query:', { data, count });
      
      if (data && data.length > 0) {
        console.log('Dados encontrados:', data[0]);
        const config = data[0] as {api_key: string, team_id: string, default_list_id: string, client_products_list_id: string, products_list_id: string};
        setClickupConfig({
          apiKey: config.api_key || '',
          teamId: config.team_id || '',
          defaultListId: config.default_list_id || '',
          clientProductsListId: config.client_products_list_id || '',
          productsListId: config.products_list_id || ''
        });
      } else {
        console.log('Nenhum dado encontrado na tabela clickup_config');
      }
      
      setClickupStatus({ loading: false, error: null, success: null });
    } catch (error) {
      console.error('Erro completo:', error);
      setClickupStatus({ 
        loading: false, 
        error: 'Erro ao carregar configurações', 
        success: null 
      });
    }
  };

  const validateClickupConfig = () => {
    if (!clickupConfig.apiKey.trim()) {
      setClickupStatus({ loading: false, error: 'API Key é obrigatória', success: null });
      return false;
    }
    if (!clickupConfig.teamId.trim()) {
      setClickupStatus({ loading: false, error: 'Team ID é obrigatório', success: null });
      return false;
    }
    return true;
  };

  const handleSaveClickupConfig = async () => {
    if (!validateClickupConfig()) return;
    
    // Verificar se já existe configuração salva
    const { data } = await supabase
      .from('clickup_config')
      .select('*')
      .maybeSingle();

    if (data && !confirm('Já existem configurações salvas. Deseja sobrescrevê-las?')) {
      return;
    }

    await saveClickupConfig();
  };

  const handleSaveUser = async (userData: User) => {
    try {
      // Implementar lógica para salvar usuário
      const { error } = await supabase
        .from('users')
        .upsert(userData);

      if (error) throw error;
      
      // Atualizar lista de usuários após salvar
      fetchUsers();
      setManageUsersModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
  };

  useEffect(() => {
    if (activeTab === 'clickup') {
      loadClickupConfig();
    }
  }, [activeTab]);

  const testClickUpApi = async () => {
    setIsTestingApi(true);
    try {
      const results: { [key: string]: ClickUpListResponse | null } = {};
      const lists = {
        default: clickupConfig?.defaultListId,
        clientesProdutos: clickupConfig?.clientProductsListId,
        produtos: clickupConfig?.productsListId
      };

      for (const [key, listId] of Object.entries(lists)) {
        if (listId) {
          const res = await fetch(`/api/clickup/test?listId=${listId}`);
          results[key] = await res.json();
        }
      }

      setApiTestResults(results);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Falha ao testar API: ' + error.message);
      } else {
        toast.error('Erro desconhecido ao testar API');
      }
    } finally {
      setIsTestingApi(false);
    }
  };

  if (loading) {
    return (
      <NewLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </NewLayout>
    );
  }

  return (
    <AdminGuard>
      <NewLayout>
        {/* Header Fixo */}
        <div className="sticky top-0 z-10 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
          <div className="px-6 pt-4 pb-2">
            <h1 className="text-2xl font-bold text-gray-900 mb-5">Painel de Administração</h1>
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="px-6 py-4">
          {activeTab === 'users' && (
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold mb-4">Gerenciar Usuários</h2>
              </div>
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Personalizado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.full_name || user.email.split('@')[0]}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value as 'user' | 'admin')}
                              className="border rounded px-2 py-1 bg-white text-gray-900"
                            >
                              <option value="user">Usuário</option>
                              <option value="admin">Administrador</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={user.custom_id || ''}
                              onChange={async (e) => {
                                const input = e.target;
                                const originalValue = input.value;
                                const newId = input.value;
                                
                                // Verificar se já existe um ID salvo e se está sendo alterado
                                if (user.custom_id && user.custom_id !== newId) {
                                  if (!confirm(`Deseja realmente alterar o ID de ${user.custom_id} para ${newId}?`)) {
                                    return;
                                  }
                                }
                                
                                // Estado de carregamento
                                input.disabled = true;
                                input.classList.add('opacity-70', 'cursor-wait');
                                
                                try {
                                  const { error } = await supabase
                                    .from('profiles')
                                    .update({ custom_id: newId })
                                    .eq('id', user.id);
                                  
                                  if (!error) {
                                    // Feedback visual de sucesso
                                    input.classList.remove('opacity-70', 'cursor-wait');
                                    input.classList.add('border-green-500', 'bg-green-50');
                                    setTimeout(() => {
                                      input.classList.remove('border-green-500', 'bg-green-50');
                                    }, 2000);
                                    
                                    fetchUsers();
                                  } else {
                                    throw error;
                                  }
                                } catch (error) {
                                  // Feedback visual de erro
                                  input.value = originalValue;
                                  input.classList.remove('opacity-70', 'cursor-wait');
                                  input.classList.add('border-red-500', 'bg-red-50');
                                  setTimeout(() => {
                                    input.classList.remove('border-red-500', 'bg-red-50');
                                  }, 2000);
                                  
                                  console.error('Erro ao atualizar ID:', error);
                                } finally {
                                  input.disabled = false;
                                }
                              }}
                              className="border rounded px-2 py-1 w-32"
                              placeholder="ID Personalizado"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              onClick={async () => {
                                console.log('Abrindo gerenciamento para usuário:', user.id);
                                
                                // Carregar módulos do usuário
                                const modules = await fetchUserModules(user.id);
                                console.log('Módulos carregados do banco:', modules);
                                
                                setUserModules(modules);
                                setSelectedUser(user);
                              }}
                              className="text-blue-600 hover:text-blue-900 hover:underline"
                            >
                              Gerenciar Módulos
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
          {activeTab === 'modules' && (
            <section className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow mb-8">
              <h2 className="text-xl font-semibold mb-4">Módulos Disponíveis</h2>
              <div className="bg-white rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((module) => (
                  <div key={module.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-lg">{module.name}</h3>
                    <p className="text-gray-600 mt-2">{module.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {activeTab === 'clickup' && (
            <section className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-base font-medium text-gray-900 mb-4">Configurações ClickUp</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={clickupConfig.apiKey || ''}
                      onChange={(e) => setClickupConfig({...clickupConfig, apiKey: e.target.value})}
                      placeholder="Insira a API Key do ClickUp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team ID
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={clickupConfig.teamId || ''}
                      onChange={(e) => setClickupConfig({...clickupConfig, teamId: e.target.value})}
                      placeholder="Insira o Team ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lista de Tarefas Padrão
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={clickupConfig.defaultListId || ''}
                      onChange={(e) => setClickupConfig({...clickupConfig, defaultListId: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lista Clientes X Produtos
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={clickupConfig.clientProductsListId || ''}
                      onChange={(e) => setClickupConfig({...clickupConfig, clientProductsListId: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lista de Produtos
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={clickupConfig.productsListId || ''}
                      onChange={(e) => setClickupConfig({...clickupConfig, productsListId: e.target.value})}
                    />
                  </div>
                  {clickupStatus.error && (
                    <div className="text-red-500 text-sm mt-2">
                      {clickupStatus.error}
                    </div>
                  )}
                  {clickupStatus.success && (
                    <div className="text-green-500 text-sm mt-2">
                      {clickupStatus.success}
                    </div>
                  )}
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      onClick={handleSaveClickupConfig}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-1"
                    >
                      <Save className="h-4 w-4" />
                      Salvar configurações
                    </Button>

                    <Button 
                      onClick={testClickUpApi}
                      disabled={isTestingApi}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center gap-1 disabled:opacity-50"
                    >
                      {isTestingApi ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wifi className="h-4 w-4" />
                      )}
                      Testar API
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </NewLayout>
      {selectedUser && (
        <div 
          className="fixed inset-0 bg-gray-200/10 backdrop-blur-sm flex items-center justify-center p-6 z-50 overflow-y-auto"
          onClick={handleClose}
        >
          <div 
            className="bg-white rounded-lg border border-gray-200 shadow-lg p-5 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-medium text-gray-900">Gerenciar Módulos</h3>
              <button 
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pb-4">
              <div className="space-y-3">
                {modules.sort((a, b) => a.id - b.id).map(module => {
                  const hasAccess = checkModuleAccess(selectedUser.id, module.id);
                  return (
                    <div key={module.id} className="flex items-center justify-between p-3 border-b border-gray-200">
                      <div>
                        <h4 className="font-medium text-gray-800">{module.name}</h4>
                        <p className="text-sm text-gray-500">{module.description}</p>
                      </div>
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={userModules.some(m => 
                              m.userId === selectedUser.id && 
                              m.moduleId === module.id
                            )}
                            onChange={(e) => {
                              const newAccess = e.target.checked;
                              setUserModules(prev => {
                                const updated = [...prev.filter(m => !(m.userId === selectedUser.id && m.moduleId === module.id))];
                                if (newAccess) {
                                  updated.push({userId: selectedUser.id, moduleId: module.id});
                                }
                                return updated;
                              });
                              updateModuleAccess(selectedUser.id, module.id, newAccess);
                            }}
                            className="sr-only peer"
                            disabled={moduleIdBeingUpdated === module.id}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          {updateStatus.loading && module.id === moduleIdBeingUpdated && (
                            <span className="ml-2 text-sm text-gray-500">Salvando...</span>
                          )}
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
              {updateStatus.error && (
                <div className="text-red-500 text-sm mt-2">{updateStatus.error}</div>
              )}
              {updateStatus.success && (
                <div className="text-green-500 text-sm mt-2">{updateStatus.success}</div>
              )}
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
      {manageUsersModalOpen && (
        <ManageUsersModal 
          isOpen={manageUsersModalOpen}
          onClose={() => setManageUsersModalOpen(false)} 
          user={selectedUser}
          users={users} 
          onSave={handleSaveUser}
          setSelectedUser={setSelectedUser} 
          fetchUserModules={fetchUserModules} 
          setUserModules={setUserModules} 
        />
      )}
      {apiTestResults && (
        <Dialog open={!!apiTestResults} onOpenChange={() => setApiTestResults(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Wifi className="h-5 w-5 text-indigo-600" />
                Resultados do Teste API ClickUp
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Resposta da API para cada lista configurada
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[calc(80vh-150px)] pr-2">
              {Object.entries(apiTestResults).map(([key, result]) => (
                <div key={key} className="bg-gray-50/50 p-4 rounded-lg border border-gray-200 mb-4 last:mb-0">
                  <h3 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                    {key === 'default' && (
                      <>
                        <ListTodo className="h-4 w-4 text-indigo-600" />
                        Lista Padrão
                      </>
                    )}
                    {key === 'clientesProdutos' && (
                      <>
                        <Users className="h-4 w-4 text-indigo-600" />
                        Clientes × Produtos
                      </>
                    )}
                    {key === 'produtos' && (
                      <>
                        <Package className="h-4 w-4 text-indigo-600" />
                        Produtos
                      </>
                    )}
                  </h3>
                  <div className="bg-white p-3 rounded-md border border-gray-100 overflow-auto">
                    <pre className="text-sm text-gray-700">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminGuard>
  );
}
