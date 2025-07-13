import { createClient } from '@supabase/supabase-js';
import axios, { AxiosError } from 'axios';
import { ClickUpTaskPayload, ClickUpTaskInput } from '@/types/clickup';

const CLICKUP_API_URL = 'https://api.clickup.com/api/v2';

// Função para converter datetime-local em milissegundos Unix
const toUnixMillis = (dateTimeStr: string) => {
  if (!dateTimeStr) return null;
  return new Date(dateTimeStr).getTime();
};

export async function createClickUpTask(taskData: ClickUpTaskInput, listId: string, apiKey: string): Promise<ClickUpTaskPayload> {
  try {
    console.log('[ClickUpService] Iniciando criação de tarefa com dados:', JSON.stringify(taskData, null, 2));
    console.log('[ClickUpService] List ID:', listId);

    // Validação reforçada
    if (!taskData?.name && !taskData?.titulo || !listId || !apiKey) {
      console.error('[ClickUpService] Dados obrigatórios faltando:', {
        name: !!taskData?.name,
        listId: !!listId,
        apiKey: !!apiKey
      });
      throw new Error('Dados obrigatórios não fornecidos');
    }

    // Obter status disponíveis
    const statuses = await getListStatuses(listId, apiKey);

    // Formatação das datas em milissegundos
    const payload = {
      name: taskData.name || taskData.titulo || '',
      description: taskData.description || taskData.motivo || '',
      content: taskData.comentario || taskData.custom_fields?.['Comentário'] || '',
      assignees: [49170204], // ID do responsável fixo por enquanto
      status: 'concluído',
      due_date: toUnixMillis(`${taskData.dataVencimento}T${taskData.vencimentoTime || '00:00'}`),
      start_date: toUnixMillis(`${taskData.dataInicial}T${taskData.inicioTime || '00:00'}`),
      custom_fields: [
        {
          id: '5afa0167-4dcb-4ee0-a0a9-f82d3f3cfa71',
          value: {
            id: taskData.empresa === 'STV' ? '868e8xd1u' : null,
            name: taskData.empresa === 'STV' ? 'STV' : null
          }
        },
        {
          id: '9908283b-8888-41c4-88ac-1f3dc9a0fdc6',
          value: {
            id: '868e88q9j',
            name: 'Eobra'
          }
        }
      ]
    };

    console.log('[ClickUpService] Payload final:', JSON.stringify(payload, null, 2));

    // Antes de enviar para a API
    console.log('[ClickUpService] Payload sendo enviado:', JSON.stringify(payload, null, 2));

    try {
      const response = await axios.post(`https://api.clickup.com/api/v2/list/${listId}/task`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: apiKey
        }
      });

      console.log('[ClickUpService] Resposta completa da API:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('[ClickUpService] Erro na requisição:', 
        axiosError.response?.data || axiosError.message);
      throw error;
    }
  } catch (error) {
    console.error('[ClickUpService] Erro ao criar tarefa no ClickUp:', error);
    throw error;
  }
}

export async function getListStatuses(listId: string, apiKey: string) {
  try {
    const response = await fetch(`${CLICKUP_API_URL}/list/${listId}`, {
      headers: {
        'Authorization': apiKey
      }
    });

    if (!response.ok) throw new Error('Erro ao obter status da lista');
    
    const data = await response.json();
    return data.statuses || [];
  } catch (error) {
    console.error('[ClickUpService] Erro ao obter status:', error);
    return [];
  }
}

export async function getClickUpConfig() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
  
  const { data, error } = await supabase
    .from('clickup_config')
    .select('*')
    .single();

  if (error || !data) {
    throw new Error('Configuração do ClickUp não encontrada. Verifique se a tabela clickup_config existe e contém os dados necessários.');
  }
  
  if (!data.api_key || !data.team_id || !data.default_list_id) {
    throw new Error('Configuração do ClickUp incompleta. São necessários api_key, team_id e default_list_id.');
  }

  return data;
}
