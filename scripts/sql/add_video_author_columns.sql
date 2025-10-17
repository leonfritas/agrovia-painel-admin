-- Script para adicionar colunas de autor na tabela de vídeos
-- Execute este script no seu banco de dados MySQL

-- Adicionar coluna nomeAutor
ALTER TABLE videos 
ADD COLUMN nomeAutor VARCHAR(255) NULL COMMENT 'Nome do autor do vídeo';

-- Adicionar coluna cargoAutor  
ALTER TABLE videos 
ADD COLUMN cargoAutor VARCHAR(255) NULL COMMENT 'Cargo do autor do vídeo';

-- Verificar se as colunas foram adicionadas
DESCRIBE videos;
