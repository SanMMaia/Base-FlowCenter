'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      console.log('Tentando conectar ao Supabase...');
      
      // Verifica conexão com Supabase
      console.log('Verificando conexão com Supabase...');
      console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

      const { data: { session }, error: authError } = await supabase.auth.getSession();

      if (authError) {
        console.error('Erro de conexão:', authError);
        throw new Error(`Falha na conexão: ${authError.message}`);
      }

      if (!session) {
        console.warn('Nenhuma sessão ativa - continuando...');
      }

      console.log('Criando usuário...');
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) {
        console.error('Erro no signUp:', signUpError);
        throw new Error(signUpError.message);
      }

      if (!authData.user) {
        throw new Error('Confirme seu email antes de continuar');
      }

      console.log('Usuário criado com ID:', authData.user.id);
      setMessage('Conta criada com sucesso! Verifique seu email para confirmar.');

      // Após signUp bem-sucedido
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Perfil não criado:', profileError);
        throw new Error('Erro ao criar perfil do usuário');
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Erro completo:', err);
      setError(err.message || 'Erro desconhecido ao registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800">Criar conta</h2>
      
      {error && (
        <div className="p-4 text-red-600 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      {message && (
        <div className="p-4 text-green-600 bg-green-100 rounded-md">
          {message}
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleRegister}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </div>
      </form>

      <div className="text-sm text-center text-gray-600">
        Já tem uma conta?{' '}
        <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Faça login
        </a>
      </div>
    </div>
  );
};

export default RegisterForm;
