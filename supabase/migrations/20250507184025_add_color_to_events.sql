-- Adicionar coluna color à tabela events
ALTER TABLE events ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '#3b82f6'; 