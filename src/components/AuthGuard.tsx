'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const AuthGuard = ({ children, moduleId }: { children: React.ReactNode, moduleId?: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          router.push('/login');
          return;
        }
        
        // Verifica se o perfil existe
        const { error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          await supabase.auth.signOut();
          router.push('/login');
          return;
        }
        
        // Verificação de módulo apenas se moduleId foi fornecido
        if (moduleId) {
          const { data: moduleAccess } = await supabase
            .from('user_modules')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('module_id', moduleId)
            .eq('has_access', true)
            .single();

          if (!moduleAccess) {
            router.push('/unauthorized');
            return;
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erro na verificação de autenticação:', err);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, moduleId]);

  if (loading) {
    return null; // Retorna vazio durante a verificação
  }

  return <>{children}</>;
};

export default AuthGuard;
