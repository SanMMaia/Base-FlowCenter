-- +goose Up
-- +goose StatementBegin
ALTER TABLE clickup_config ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para todos usuários autenticados
CREATE POLICY "enable_read_for_authenticated" 
ON clickup_config FOR SELECT
TO authenticated
USING (true);

-- Permitir escrita apenas para administradores
CREATE POLICY "enable_write_for_admin" 
ON clickup_config FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP POLICY IF EXISTS "enable_read_for_authenticated" ON clickup_config;
DROP POLICY IF EXISTS "enable_write_for_admin" ON clickup_config;
ALTER TABLE clickup_config DISABLE ROW LEVEL SECURITY;
-- +goose StatementEnd
