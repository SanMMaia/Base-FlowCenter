'use client';

import { useState, useEffect } from 'react';
import NewLayout from '@/components/NewLayout';
import { supabase } from '@/lib/supabase';
import ChangePassword from '@/components/ChangePassword';

const Tabs = ({ activeTab, setActiveTab }: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const tabs = [
    { id: 'profile', label: 'Perfil' },
    { id: 'security', label: 'Segurança' },
    { id: 'admin', label: 'Admin' }
  ];

  return (
    <div className="flex border-b border-background/20 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`px-4 py-2 font-medium text-sm ${activeTab === tab.id ? 'border-b-2 border-primary text-primary' : 'text-foreground/60 hover:text-foreground'}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState({
    name: '',
    email: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [errors, setErrors] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserData({
          name: data.full_name || '',
          email: data.email || ''
        });
      }
    };
    loadUserData();
  }, []);

  const validateFields = () => {
    const newErrors = { name: '', email: '' };
    let isValid = true;

    if (!userData.name) {
      newErrors.name = 'Nome é obrigatório';
      isValid = false;
    }

    if (!userData.email) {
      newErrors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Email inválido';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateFields()) return;
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');
      
      console.log('Dados sendo enviados:', {
        id: user.id,
        name: userData.name,
        email: userData.email
      });
      
      const { data } = await supabase
        .from('profiles')
        .update({
          full_name: userData.name,
          email: userData.email
        })
        .eq('id', user.id)
        .select();

      console.log('Resposta completa do Supabase:', { data });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string; details?: string };
      console.error('Erro detalhado ao atualizar perfil:', {
        message: err.message,
        code: err.code,
        details: err.details
      });
      setSaveError(err.message || 'Erro ao atualizar perfil');
      setTimeout(() => setSaveError(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <NewLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Configurações</h1>
        
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'profile' && (
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Perfil</h2>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Nome</label>
                <input 
                  type="text"
                  value={userData.name || ''}
                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                  className="px-3 py-2 border rounded"
                />
                {errors.name && <span className="text-red-500">{errors.name}</span>}
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Email</label>
                <input 
                  type="email" 
                  value={userData.email}
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                  className="p-2 border rounded"
                  placeholder="seu@email.com"
                />
                {errors.email && <span className="text-red-500">{errors.email}</span>}
              </div>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : 'Salvar alterações'}
              </button>
              {saveError && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded">
                  {saveError}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow space-y-6">
            <h2 className="text-xl font-semibold">Segurança</h2>
            
            <ChangePassword />
            
            {/* Removido o botão de logout global */}
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Administração</h2>
            <p>Área administrativa para gestão do sistema</p>
          </div>
        )}
        
        {saveSuccess && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded">
            Configurações salvas com sucesso!
          </div>
        )}
      </div>
    </NewLayout>
  );
}
