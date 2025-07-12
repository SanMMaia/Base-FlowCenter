# Deploy na Vercel

## Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Conta no [Supabase](https://supabase.com)
- Projeto configurado no Supabase

## Passos para Deploy

1. **Configurar variáveis de ambiente**:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase

2. **Instalar CLI da Vercel** (opcional):
```bash
npm install -g vercel
```

3. **Fazer deploy**:
```bash
vercel
```
Ou pelo site da Vercel:
- Conecte seu repositório Git
- Configure as variáveis de ambiente
- Clique em "Deploy"

4. **Configurar domínio** (opcional):
   - Na dashboard da Vercel, vá para Settings → Domains
   - Adicione seu domínio personalizado

## Configurações Recomendadas

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node Version**: 18.x

## Observações

- O arquivo `vercel.json` já está configurado com as rotas necessárias
- As variáveis de ambiente serão injetadas automaticamente durante o deploy
- Para ambiente de produção, considere usar variáveis de ambiente específicas
