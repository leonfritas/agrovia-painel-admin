-- Script alternativo para adicionar colunas de autor na tabela de vídeos
-- Execute este script no seu banco de dados MySQL

-- Verificar se a tabela existe e qual o nome exato
SHOW TABLES LIKE '%video%';

-- Se a tabela se chama 'video' (singular), use este comando:
-- ALTER TABLE video 
-- ADD COLUMN nomeAutor VARCHAR(255) NULL COMMENT 'Nome do autor do vídeo';

-- ALTER TABLE video 
-- ADD COLUMN cargoAutor VARCHAR(255) NULL COMMENT 'Cargo do autor do vídeo';

-- Se a tabela se chama 'videos' (plural), use este comando:
ALTER TABLE videos 
ADD COLUMN nomeAutor VARCHAR(255) NULL COMMENT 'Nome do autor do vídeo';

ALTER TABLE videos 
ADD COLUMN cargoAutor VARCHAR(255) NULL COMMENT 'Cargo do autor do vídeo';

-- Verificar se as colunas foram adicionadas
DESCRIBE videos;
