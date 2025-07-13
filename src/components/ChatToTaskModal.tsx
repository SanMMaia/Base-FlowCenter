'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

type ChatToTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
};

export default function ChatToTaskModal({ isOpen, onClose, onSubmit }: ChatToTaskModalProps) {
  const [step, setStep] = useState<'initial' | 'review' | 'final'>('initial');
  const [cliente, setCliente] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [chatText, setChatText] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [comentario, setComentario] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [dataInicial, setDataInicial] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [inicioTime, setInicioTime] = useState('08:00');
  const [vencimentoTime, setVencimentoTime] = useState('17:00');
  const [status, setStatus] = useState('Concluido');

  const generatePrompt = async () => {
    if (!cliente || !chatText) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    const customId = `chat_${Date.now()}`;
    const prompt = `Analise a conversa de WhatsApp abaixo e gere um JSON com um resumo estruturado do atendimento contendo apenas as seguintes informações:

{
  "título": "Crie um título sucinto que descreva a natureza do atendimento (ex: 'Atendimento - Problema com Login', 'Atendimento - Dúvida sobre Faturamento')",
  "descrição": {
    "cliente": "Nome do cliente",
    "motivo": "Resumo do motivo do chamado com base na solicitação inicial do cliente"
  },
  "comentário": "Descrição da solução ou resposta fornecida pelo atendente",
  "responsável": "Nome do atendente (custom_id). Não incluir 'Eobra'",
  "empresa": "Haja",
  "datas": {
    "inicial": "Data atual + Horário da última mensagem",
    "vencimento": "Data atual + Horário da última mensagem"
  }
}

Conversa Completa:
${chatText}`;

    try {
      await navigator.clipboard.writeText(prompt);
      setGeneratedPrompt(prompt);
      setAiResponse('');
      setStep('review');
      setCopyStatus('Prompt copiado para a área de transferência!');
      
      setTimeout(() => setCopyStatus(''), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopyStatus('Falha ao copiar o prompt');
    }
  };

  const extractDataFromResponse = (response: string) => {
    // Fallback para resposta vazia
    if (!response?.trim()) {
      return {
        title: '',
        cliente: '',
        motivo: '',
        comentario: response || '',
        responsavel: '',
        empresa: '',
        dataInicial: '',
        dataVencimento: ''
      };
    }

    try {
      // Tenta encontrar o primeiro bloco JSON válido
      const jsonMatch = response.match(/\{[\s\S]*?\}(?=\s*$|\s*\{|\s*\[)/);
      
      if (!jsonMatch) {
        console.warn('[ChatToTaskModal] Nenhum JSON válido encontrado na resposta:', response);
        return {
          title: '',
          cliente: '',
          motivo: '',
          comentario: response,
          responsavel: '',
          empresa: '',
          dataInicial: '',
          dataVencimento: ''
        };
      }
      
      let jsonString = jsonMatch[0];
      
      // Tenta corrigir JSONs malformados
      try {
        // Remove vírgulas finais inválidas
        jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
        
        const data = JSON.parse(jsonString);
        
        // Função auxiliar para extração segura de valores
        const getValue = (obj: any, ...paths: string[]) => {
          for (const path of paths) {
            try {
              const value = path.split('.').reduce((o, p) => o?.[p], obj);
              if (value !== undefined && value !== null) return value;
            } catch (e) {}
          }
          return '';
        };
        
        // Extrai empresa corretamente (sem fallback para 'Haja')
        const empresa = getValue(data, 'empresa', 'company');
        
        // Extrai e formata datas com horários
        const dataInicial = getValue(data, 'datas.inicial', 'datas_horarios.data_inicial', 'start_date');
        const dataVencimento = getValue(data, 'datas.vencimento', 'datas_horarios.data_vencimento', 'due_date');
        
        return {
          title: getValue(data, 'titulo', 'título', 'title'),
          cliente: getValue(data, 'descricao.cliente', 'descrição.cliente', 'cliente', 'client'),
          motivo: getValue(data, 'descricao.motivo', 'descrição.motivo', 'motivo', 'reason'),
          comentario: getValue(data, 'comentario', 'comentário', 'comment', 'solution'),
          responsavel: getValue(data, 'responsavel', 'responsável', 'attendant'),
          empresa: empresa, // Usa o valor extraído sem fallback
          dataInicial: dataInicial,
          dataVencimento: dataVencimento
        };
      } catch (innerErr) {
        console.error('[ChatToTaskModal] Erro ao processar JSON:', innerErr, '\nTrecho:', jsonString);
        return {
          title: '',
          cliente: '',
          motivo: '',
          comentario: response,
          responsavel: '',
          empresa: '',
          dataInicial: '',
          dataVencimento: ''
        };
      }
    } catch (err) {
      console.error('[ChatToTaskModal] Erro geral ao processar resposta:', err);
      return {
        title: '',
        cliente: '',
        motivo: '',
        comentario: response,
        responsavel: '',
        empresa: '',
        dataInicial: '',
        dataVencimento: ''
      };
    }
  };

  const createTask = () => {
    const taskData = {
      name: titulo,
      description: descricao,
      status: status,
      empresa: empresa,
      custom_fields: {
        "Cliente X Produto": empresa,
        "Produto": "Eobra",
        "Comentário": comentario,
        "Responsável": responsavel,
        "Data Inicial": dataInicial,
        "Data de Vencimento": dataVencimento
      }
    };
    
    console.log('[ChatToTaskModal] Dados da tarefa antes do envio:', JSON.stringify(taskData, null, 2));
    
    onSubmit(taskData);
    onClose();
  };

  const handleSubmit = () => {
    createTask();
    setStep('initial');
    setCliente('');
    setEmpresa('');
    setChatText('');
    setGeneratedPrompt('');
    setAiResponse('');
    setTitulo('');
    setDescricao('');
    setComentario('');
    setResponsavel('');
    setDataInicial('');
    setDataVencimento('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-200/10 backdrop-blur-sm flex items-center justify-center p-6 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-5 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-medium text-gray-900">
            {step === 'initial' ? 'Criar Novo Atendimento' : 
             step === 'review' ? 'Revisar Atendimento' : 'Confirmar Atendimento'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          {step === 'initial' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nome do cliente"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Empresa</label>
                <input
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Empresa (opcional)"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Conversa do WhatsApp *</label>
                <textarea
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 h-24"
                  placeholder="Cole aqui a conversa completa do WhatsApp"
                />
              </div>

              <div className="flex justify-end mt-3">
                <button
                  onClick={generatePrompt}
                  className="bg-indigo-600 text-white py-1.5 px-3 rounded-md hover:bg-indigo-700 transition-colors"
                  disabled={!cliente || !chatText}
                >
                  Criar Chat e Copiar
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-3">
              {copyStatus && (
                <div className="text-sm text-center py-2 px-4 rounded-lg bg-blue-100 text-blue-900">
                  {copyStatus}
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Dados do Atendimento</h4>
                <div className="p-3 bg-gray-50 rounded-lg mb-4">
                  <p><span className="font-medium">Cliente:</span> {cliente}</p>
                  <p><span className="font-medium">Empresa:</span> {empresa || 'Não especificado'}</p>
                </div>
                
                <h4 className="font-medium text-gray-800 mb-2">Resposta da IA</h4>
                <textarea
                  value={aiResponse}
                  onChange={(e) => setAiResponse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 min-h-[150px]"
                  placeholder="Cole aqui a resposta da IA"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setStep('initial')}
                  className="bg-gray-300 text-gray-900 py-1.5 px-3 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => {
                    const parsedResponse = extractDataFromResponse(aiResponse);
                    setTitulo(parsedResponse.title);
                    setDescricao(`Cliente: ${parsedResponse.cliente}\nMotivo: ${parsedResponse.motivo}`);
                    setComentario(parsedResponse.comentario);
                    setResponsavel(parsedResponse.responsavel);
                    setEmpresa(parsedResponse.empresa); // Usa o valor extraído sem fallback
                    setDataInicial(parsedResponse.dataInicial);
                    setDataVencimento(parsedResponse.dataVencimento);
                    setInicioTime(parsedResponse.dataInicial?.split(' ')[1] || '08:00');
                    setVencimentoTime(parsedResponse.dataVencimento?.split(' ')[1] || '17:00');
                    setStep('final');
                  }}
                  className="bg-indigo-600 text-white py-1.5 px-3 rounded-md hover:bg-indigo-700 transition-colors"
                  disabled={!aiResponse}
                >
                  Revisar Atendimento
                </button>
              </div>
            </div>
          )}

          {step === 'final' && (
            <>
              <div className="grid grid-cols-2 gap-3 h-full">
                {/* Lado Esquerdo */}
                <div className="space-y-2 pr-1">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Título</label>
                    <input 
                      type="text" 
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea 
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Data/Hora Inicial</label>
                      <input
                        type="datetime-local"
                        value={dataInicial && inicioTime ? `${dataInicial}T${inicioTime}` : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            const [date, time] = e.target.value.split('T');
                            setDataInicial(date);
                            setInicioTime(time || '00:00');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Data/Hora Venc.</label>
                      <input
                        type="datetime-local"
                        value={dataVencimento && vencimentoTime ? `${dataVencimento}T${vencimentoTime}` : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            const [date, time] = e.target.value.split('T');
                            setDataVencimento(date);
                            setVencimentoTime(time || '00:00');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Responsável</label>
                    <input 
                      type="text" 
                      value={responsavel || `Nome do atendente (${`chat_${Date.now()}`})`}
                      onChange={(e) => setResponsavel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Empresa</label>
                    <input 
                      type="text" 
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                {/* Lado Direito */}
                <div className="pl-1">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Comentário</label>
                    <textarea 
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 min-h-[274px]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Concluido">Concluído</option>
                      <option value="A fazer">A fazer</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {step === 'final' && (
          <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-200">
            <button
              onClick={() => setStep('review')}
              className="bg-gray-300 text-gray-900 py-1.5 px-3 rounded-md hover:bg-gray-400 transition-colors text-sm"
            >
              Voltar
            </button>
            <button
              onClick={handleSubmit}
              className="bg-indigo-600 text-white py-1.5 px-3 rounded-md hover:bg-indigo-700 transition-colors text-sm"
            >
              Confirmar e Enviar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
