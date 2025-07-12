# Documentação Técnica - FlowCenter

## Decisões de Arquitetura

1. **Estrutura do Projeto**: Utilizamos Next.js com App Router para melhor organização e performance.
2. **Autenticação**: Integração com Supabase Auth para gerenciamento de usuários.
3. **Banco de Dados**: Supabase PostgreSQL com Row Level Security para controle de acesso.
4. **Estilização**: Tailwind CSS com suporte a dark mode e efeitos visuais modernos.
5. **Tipagem**: TypeScript para melhor segurança e manutenibilidade do código.

## Design System

### Cores
- Primária: `rgba(37, 99, 235, 0.85)`
- Secundária: `rgba(124, 58, 237, 0.85)`
- Fundo: `rgba(248, 250, 252, 0.95)`

### Espaçamentos
- Pequeno: `0.5rem`
- Médio: `1rem`
- Grande: `1.5rem`

## Principais APIs

### Autenticação
- `/api/auth/login` - POST: Autentica usuário
- `/api/auth/register` - POST: Cria nova conta
- `/api/auth/logout` - POST: Encerra sessão
- `/api/auth/reset-password` - POST: Solicita redefinição de senha

### Perfil do Usuário
- `/api/profile` - GET: Retorna dados do perfil
- `/api/profile` - PUT: Atualiza dados do perfil

### Dashboard
- `/api/dashboard/stats` - GET: Retorna estatísticas de atendimentos
- `/api/dashboard/appointments` - GET: Retorna próximos agendamentos

### Configurações
- `/api/settings/modules` - GET: Lista módulos disponíveis
- `/api/settings/user-modules` - GET/PUT: Gerencia permissões de usuário

## Fluxos Principais

1. **Autenticação**:
   - Usuário faz login → Token JWT é gerado → Armazenado em cookies seguros
   - Todas as requisições subsequentes verificam o token

2. **Controle de Acesso**:
   - Baseado em roles (admin/user)
   - Políticas RLS no banco de dados
   - Middleware de autenticação no frontend

3. **Dark Mode**:
   - Armazenado no estado local e no perfil do usuário
   - Aplicado via classes Tailwind

## Próximas Etapas

- Implementar endpoints API
- Adicionar logging e monitoramento
- Configurar CI/CD
- Escrever testes automatizados
