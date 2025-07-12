'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      
      setMessage('Um link para redefinição de senha foi enviado para seu email.');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao processar sua solicitação');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800">Redefinir senha</h2>
      
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

      <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email cadastrado
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
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Enviando...' : 'Enviar link de redefinição'}
          </button>
        </div>
      </form>

      <div className="text-sm text-center text-gray-600">
        Lembrou sua senha?{' '}
        <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Faça login
        </a>
      </div>
    </div>
  );
}
