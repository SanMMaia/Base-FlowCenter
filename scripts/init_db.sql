-- Script de inicialização do banco de dados para o FlowCenter

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de módulos
CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de relação usuário-módulos
CREATE TABLE IF NOT EXISTS user_modules (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  has_access BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, module_id)
);

-- Criar índice único para a chave composta
CREATE UNIQUE INDEX IF NOT EXISTS user_module_unique ON user_modules(user_id, module_id);

-- Habilitar RLS (Row Level Security) nas tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_modules ENABLE ROW LEVEL SECURITY;

-- Verificar e remover política existente se necessário
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Leitura pública de perfis' AND tablename = 'profiles') THEN
    DROP POLICY "Leitura pública de perfis" ON profiles;
  END IF;
END $$;

-- Criar política atualizada
CREATE POLICY "Leitura pública de perfis" ON profiles
  FOR SELECT USING (true);

-- Políticas para perfis
CREATE POLICY "Atualização apenas pelo próprio usuário" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para módulos (apenas admin)
CREATE POLICY "Acesso total para admin" ON modules
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Políticas de acesso para user_modules
CREATE POLICY "Admin pode gerenciar todas as permissões" ON user_modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Usuários podem ver suas próprias permissões" ON user_modules
  FOR SELECT USING (user_id = auth.uid());

-- Inserir módulos padrão
INSERT INTO modules (id, name, description) VALUES
(1, 'Dashboard', 'Painel principal'),
(2, 'Sacmais', 'Sistema de atendimento ao cliente'),
(3, 'Clientes', 'Gestão de clientes'),
(4, 'Relatórios', 'Relatórios gerenciais'),
(5, 'Configurações', 'Configurações do sistema'),
(6, 'Admin', 'Administração do sistema'),
(7, 'Atendimentos', 'Gestão de atendimentos'),
(8, 'Agenda', 'Agenda e calendário');

-- Atualizar sequência
ALTER SEQUENCE modules_id_seq RESTART WITH 9;

-- Gatilho para atualizar updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Gatilho para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_module_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_module_timestamp
BEFORE UPDATE ON user_modules
FOR EACH ROW
EXECUTE FUNCTION update_user_module_timestamp();
