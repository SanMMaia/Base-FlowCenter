import NewLayout from '@/components/NewLayout';
import { DESIGN } from '@/constants/design';

export default function UnauthorizedPage() {
  return (
    <NewLayout>
      <div className={`flex flex-col items-center justify-center min-h-screen p-[${DESIGN.spacing.md}]`}>
        <h1 className="text-2xl font-bold mb-4">Acesso não autorizado</h1>
        <p className="text-gray-600 mb-6">
          Você não tem permissão para acessar este módulo.
        </p>
        <a 
          href="/dashboard" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Voltar ao Dashboard
        </a>
      </div>
    </NewLayout>
  );
}
