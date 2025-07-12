'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  HomeIcon,
  Cog6ToothIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  RectangleStackIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  ShieldCheckIcon,
  PhoneIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { DESIGN } from '@/constants/design';

interface UserProfile {
  role: 'user' | 'admin';
}

interface Module {
  id: number;
  name: string;
  icon: any;
  path: string;
  adminOnly?: boolean;
}

const modules: Module[] = [
  { id: 1, name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
  { id: 2, name: 'Sacmais', icon: ChatBubbleLeftIcon, path: '/sacmais' },
  { id: 3, name: 'Atendimentos', icon: PhoneIcon, path: '/atendimentos' },
  { id: 4, name: 'Agenda', icon: CalendarIcon, path: '/agenda' },
  { id: 5, name: 'Clientes', icon: UserIcon, path: '/clientes' },
  { id: 6, name: 'Configurações', icon: Cog6ToothIcon, path: '/configuracoes' },
  { id: 7, name: 'Admin', icon: ShieldCheckIcon, path: '/admin', adminOnly: true },
];

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Recupera o estado salvo do localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarOpen');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });

  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [availableModules, setAvailableModules] = useState<Module[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user?.id)
          .single();
        setProfile(profile);

        const userId = user.id;
        const { data: userModules } = await supabase
          .from('user_modules')
          .select('module_id')
          .eq('user_id', userId)
          .eq('has_access', true);

        const availableModules = modules.filter(module => {
          if (user?.role === 'admin') return true;
          if (module.adminOnly) return false;
          return userModules?.some(m => m.module_id === module.id);
        });
        setAvailableModules(availableModules);
      }
    };

    getUser();
  }, []);

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
            <module.icon className={`${sidebarOpen ? 'mr-3' : ''} h-5 w-5 text-gray-600`} />
            {sidebarOpen && <span>{module.name}</span>}
          </Link>
        ))}
        {profile?.role === 'admin' && (
          <Link 
            href="/admin"
            className={`flex items-center ${sidebarOpen ? 'px-4 py-3' : 'justify-center py-3'} 
              text-gray-800 font-medium hover:bg-gray-200`}
          >
            <ShieldCheckIcon className={`${sidebarOpen ? 'mr-3' : ''} h-5 w-5 text-gray-600`} />
            {sidebarOpen && <span>Admin</span>}
          </Link>
        )}
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
