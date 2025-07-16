'use client';

declare global {
  interface Window {
    addEventListener(type: 'modules-updated', listener: (event: CustomEvent) => void): void;
  }
}

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  HomeIcon,
  Cog6ToothIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  ShieldCheckIcon,
  PhoneIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { DESIGN } from '@/constants/design';
import { User } from '@/types/commons';
import { useSession } from 'next-auth/react';

interface Module {
  id: number;
  name: string;
  icon: string;
  path: string;
  adminOnly?: boolean;
}

// Lista de módulos como constante padrão
const modules: Module[] = [
  { id: 1, name: 'Dashboard', icon: 'HomeIcon', path: '/dashboard' },
  { id: 2, name: 'Sacmais', icon: 'ChatBubbleLeftIcon', path: '/sacmais' },
  { id: 3, name: 'Atendimentos', icon: 'PhoneIcon', path: '/atendimentos' },
  { id: 4, name: 'Agenda', icon: 'CalendarIcon', path: '/agenda' },
  { id: 5, name: 'Clientes', icon: 'UserIcon', path: '/clientes' },
  { id: 6, name: 'Configurações', icon: 'Cog6ToothIcon', path: '/configuracoes' },
  { id: 7, name: 'Admin', icon: 'ShieldCheckIcon', path: '/admin', adminOnly: true }
];

export default function Sidebar() {
  const { data: session } = useSession();

  // Agora sim usar useMemo dentro do componente
  const memoizedModules = useMemo(() => modules, []);

  const loadUserData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, custom_id')
        .eq('id', user.id)
        .single();

      const { data: userModules } = await supabase
        .from('user_modules')
        .select('module_id')
        .eq('user_id', user.id)
        .eq('has_access', true);

      return { profile, userModules };
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Recupera o estado salvo do localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarOpen');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });

  const [profile, setProfile] = useState<User | null>(null);
  const [availableModules, setAvailableModules] = useState<Module[]>([]);

  const fetchModules = useCallback(async () => {
    const data = await loadUserData();
    if (!data) return;
    
    const { profile, userModules } = data;
    setProfile(profile);
    
    setAvailableModules(
      memoizedModules.filter((module, index, self) => 
        self.findIndex(m => m.id === module.id) === index &&
        (!module.adminOnly || profile?.role === 'admin') &&
        userModules?.some(m => m.module_id === module.id)
      )
    );
  }, [loadUserData, memoizedModules]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    const handleUpdate = () => {
      console.log('Atualizando todo o Sidebar');
      fetchModules();
    };

    window.addEventListener('modules-updated', handleUpdate);
    return () => window.removeEventListener('modules-updated', handleUpdate);
  }, [fetchModules]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    // Salva o estado no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
    }
  };

  return (
    <div className={`h-full bg-[${DESIGN.colors.card}] backdrop-blur-md border-r border-white/20 ${sidebarOpen ? 'w-56' : 'w-14'} 
      transition-all duration-300 ease-in-out
      flex flex-col shadow`}>
      
      <div className="p-2 flex items-center justify-between">
        {sidebarOpen && <h1 className="text-xl font-bold">FlowCenter</h1>}
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          {sidebarOpen ? 
            <ArrowLeftCircleIcon className="h-6 w-6 text-gray-600" /> : 
            <ArrowRightCircleIcon className="h-6 w-6 text-gray-600" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {availableModules.map((module) => (
          <Link 
            key={module.id} 
            href={module.path}
            className={`flex items-center ${sidebarOpen ? 'px-4 py-3' : 'justify-center py-3'} 
              text-gray-800 font-medium hover:bg-gray-200`}
          >
            {module.icon === 'HomeIcon' && <HomeIcon className={`${sidebarOpen ? 'mr-3' : ''} h-5 w-5 text-gray-600`} />}
            {module.icon === 'ChatBubbleLeftIcon' && <ChatBubbleLeftIcon className={`${sidebarOpen ? 'mr-3' : ''} h-5 w-5 text-gray-600`} />}
            {module.icon === 'PhoneIcon' && <PhoneIcon className={`${sidebarOpen ? 'mr-3' : ''} h-5 w-5 text-gray-600`} />}
            {module.icon === 'CalendarIcon' && <CalendarIcon className={`${sidebarOpen ? 'mr-3' : ''} h-5 w-5 text-gray-600`} />}
            {module.icon === 'UserIcon' && <UserIcon className={`${sidebarOpen ? 'mr-3' : ''} h-5 w-5 text-gray-600`} />}
            {module.icon === 'Cog6ToothIcon' && <Cog6ToothIcon className={`${sidebarOpen ? 'mr-3' : ''} h-5 w-5 text-gray-600`} />}
            {module.icon === 'ShieldCheckIcon' && <ShieldCheckIcon className={`${sidebarOpen ? 'mr-3' : ''} h-5 w-5 text-gray-600`} />}
            {sidebarOpen && <span>{module.name}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/20">
        <button 
          onClick={handleSignOut}
          className="w-full p-2 flex items-center rounded hover:bg-gray-200"
        >
          <ArrowLeftCircleIcon className="h-5 w-5 text-gray-600" />
          {sidebarOpen && <span className="ml-3">Sair</span>}
        </button>
      </div>
    </div>
  );
}
