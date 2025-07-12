# FlowCenter

Sistema web para gestão de atendimentos desenvolvido com:

- Next.js (App Router)
- Supabase (banco de dados e autenticação)
- Tailwind CSS (estilização)
- TypeScript

## Configuração inicial

1. Instalar dependências:
```bash
npm install
```

2. Criar arquivo `.env.local` com as credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=SUA_URL_DO_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA
```

3. Executar o projeto:
```bash
npm run dev
```

## Estrutura do Projeto

- `src/app` - Páginas e rotas da aplicação
- `src/components` - Componentes reutilizáveis
- `src/lib` - Configurações e utilitários

## Scripts SQL para Supabase

```sql
-- Tabela de perfis de usuário
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Leitura pública" ON profiles FOR SELECT USING (true);
CREATE POLICY "Atualização pelo dono" ON profiles FOR UPDATE USING (auth.uid() = id);
```

## Próximos passos

- Configurar deploy na Vercel
- Implementar autenticação avançada
- Desenvolver módulos específicos
