// Arquivo removido - integração ClickUp será reimplementada

interface ClickUpTaskInput {
  titulo: string;
  descricao: { cliente: string; motivo: string };
  comentario: string;
  responsavel: string;
  empresa: string;
  datas: { inicial: string; vencimento: string };
}

export function generateIAPrompt(chatText: string, cliente: string): string {
  return `Analise a conversa de WhatsApp abaixo e gere um JSON estruturado:\n\n{\n  "título": "Atendimento - ${cliente}",\n  "descrição": {\n    "cliente": "${cliente}",\n    "motivo": "Resumo do motivo do chamado"\n  },\n  "comentário": "Descrição da solução fornecida",\n  "responsável": "Nome do atendente",\n  "empresa": "Haja",\n  "datas": {\n    "inicial": "Data atual + Horário",\n    "vencimento": "Data atual + Horário"\n  }\n}\n\nConversa:\n${chatText}`;
}

export function extractDataFromResponse(response: string): ClickUpTaskInput {
  try {
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}') + 1;
    const jsonStr = response.slice(jsonStart, jsonEnd);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Erro ao extrair dados da resposta:', error);
    return {
      titulo: '',
      descricao: { cliente: '', motivo: '' },
      comentario: '',
      responsavel: '',
      empresa: '',
      datas: { inicial: '', vencimento: '' }
    };
  }
}