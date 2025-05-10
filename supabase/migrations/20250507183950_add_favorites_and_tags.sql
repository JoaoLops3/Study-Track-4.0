-- Adicionar coluna is_favorite e tags para boards
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boards' AND column_name = 'is_favorite') THEN
        ALTER TABLE boards ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boards' AND column_name = 'tags') THEN
        ALTER TABLE boards ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Adicionar coluna is_favorite e tags para pages
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'is_favorite') THEN
        ALTER TABLE pages ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'tags') THEN
        ALTER TABLE pages ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Criar índices para melhorar a performance
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_boards_favorite') THEN
CREATE INDEX idx_boards_favorite ON boards(is_favorite);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pages_favorite') THEN
CREATE INDEX idx_pages_favorite ON pages(is_favorite);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_boards_tags') THEN
CREATE INDEX idx_boards_tags ON boards USING GIN(tags);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pages_tags') THEN
CREATE INDEX idx_pages_tags ON pages USING GIN(tags); 
    END IF;
END $$; 