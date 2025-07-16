'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ClickUpTaskInput } from '@/types/clickup';
import { generateIAPrompt } from '@/services/clickupService';
import { Button } from '@/components/ui/button';

const RESPONSIBLE_ID_MAP: Record<string, number> = {
  'Max': 49170204,
  'Ana': 49170205
};

type ChatToTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: ClickUpTaskInput) => void;
};

export default function ChatToTaskModal({ isOpen, onClose, onSubmit }: ChatToTaskModalProps) {
  const [step, setStep] = useState<'initial' | 'review' | 'final'>('initial');
  const [cliente, setCliente] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [chatText, setChatText] = useState('');
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
  const [promptCopied, setPromptCopied] = useState(false);

  const generatePrompt = async () => {
    if (!cliente || !chatText) {
      setCopyStatus('Preencha todos os campos obrigatórios');
      setTimeout(() => setCopyStatus(''), 3000);
      return;
    }

    try {
      const prompt = generateIAPrompt(chatText, cliente, RESPONSIBLE_ID_MAP);
      
      await navigator.clipboard.writeText(prompt);
      setAiResponse('');
      setStep('review');
      setCopyStatus('Prompt copiado com sucesso!');
      setPromptCopied(true);
      
      setTimeout(() => {
        setCopyStatus('');
        setPromptCopied(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      setCopyStatus('Falha ao copiar o prompt');
    }
  };

  const extractDataFromResponse = (response: string) => {
    if (!response?.trim()) {
      throw new Error('Resposta vazia');
    }

    try {
      const jsonWithoutComments = response.replace(/\/\/.*$/gm, '');
      const data = JSON.parse(jsonWithoutComments);

      const responsavel = Object.keys(RESPONSIBLE_ID_MAP).find(
        key => RESPONSIBLE_ID_MAP[key] === data.assignees?.[0]
      ) || '';

      return {
        titulo: data.name || '',
        descricao: `Cliente: ${data.description?.client || ''}\nMotivo: ${data.description?.reason || ''}`,
        comentario: data.comment || '',
        responsavel,
        empresa: data.custom_fields?.company || '',
        datas: {
          inicial: data.start_date ? new Date(data.start_date).toLocaleString() : '',
          vencimento: data.due_date ? new Date(data.due_date).toLocaleString() : ''
        }
      };
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
      throw new Error('Formato de resposta inválido');
    }
  };

  const createTask = () => {
    onSubmit({
      titulo,
      descricao: descricao,
      comentario,
      responsavel: parseInt(responsavel) || 0,
      dataInicial,
      dataVencimento,
      inicioTime,
      vencimentoTime,
      status,
      empresa
    });
    onClose();
  };

  const handleSubmit = () => {
    createTask();
    setStep('initial');
    setCliente('');
    setEmpresa('');
    setChatText('');
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
                <Button
                  onClick={generatePrompt}
                  disabled={!cliente || !chatText}
                >
                  Criar Chat e Copiar
                </Button>
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
                <Button
                  onClick={() => setStep('initial')}
                  variant="secondary"
                >
                  Voltar
                </Button>
                <Button
                  onClick={() => {
                    const parsedResponse = extractDataFromResponse(aiResponse);
                    setTitulo(parsedResponse.titulo);
                    setDescricao(parsedResponse.descricao);
                    setComentario(parsedResponse.comentario);
                    setResponsavel(parsedResponse.responsavel);
                    setEmpresa(parsedResponse.empresa);
                    setDataInicial(parsedResponse.datas.inicial);
                    setDataVencimento(parsedResponse.datas.vencimento);
                    setInicioTime(parsedResponse.datas.inicial?.split(' ')[1] || '08:00');
                    setVencimentoTime(parsedResponse.datas.vencimento?.split(' ')[1] || '17:00');
                    setStep('final');
                  }}
                  disabled={!aiResponse}
                >
                  Revisar Atendimento
                </Button>
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
            <Button
              onClick={() => setStep('review')}
              variant="secondary"
            >
              Voltar
            </Button>
            <Button
              onClick={handleSubmit}
            >
              Confirmar e Enviar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
