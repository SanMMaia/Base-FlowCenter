import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listId = searchParams.get('listId');
  
  if (!listId) {
    return NextResponse.json({ error: 'List ID não fornecido' }, { status: 400 });
  }

  const supabase = createClient();
  const { data: config, error } = await supabase
    .from('clickup_config')
    .select('*')
    .single();

  if (error || !config?.api_key) {
    return NextResponse.json({ error: 'Configuração do ClickUp não encontrada' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task?limit=1`, {
      headers: {
        'Authorization': config.api_key
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP! status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data.tasks[0] || { message: 'Nenhuma tarefa encontrada' });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Falha na requisição',
      details: error.message 
    }, { status: 500 });
  }
}
