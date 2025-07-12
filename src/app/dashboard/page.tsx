import NewLayout from '@/components/NewLayout';

export default function DashboardPage() {
  return (
    <NewLayout>
      <div className="p-4">
        <div className="p-2">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Resumo de atendimentos */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Atendimentos hoje</h2>
              <p className="text-3xl font-bold text-blue-600">24</p>
              <p className="text-sm text-gray-500 mt-2">+3 em relação a ontem</p>
            </div>
            
            {/* Próximos agendamentos */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Próximos agendamentos</h2>
              <ul className="space-y-3">
                <li className="flex items-center justify-between">
                  <span>João Silva</span>
                  <span className="text-sm text-gray-500">10:30 AM</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Maria Oliveira</span>
                  <span className="text-sm text-gray-500">11:45 AM</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Carlos Souza</span>
                  <span className="text-sm text-gray-500">02:15 PM</span>
                </li>
              </ul>
            </div>
            
            {/* Novos recursos */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Novos recursos</h2>
              <p className="text-gray-600">Em breve: relatórios personalizados e integração com WhatsApp.</p>
            </div>
          </div>
        </div>
      </div>
    </NewLayout>
  );
}
