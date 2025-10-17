-- Script para verificar a estrutura atual da tabela de vídeos
-- Execute este script para ver as colunas existentes

-- Verificar se a tabela existe
SHOW TABLES LIKE '%video%';

-- Ver a estrutura da tabela videos (se existir)
DESCRIBE videos;

-- Ver a estrutura da tabela video (se existir)
DESCRIBE video;

-- Ver todas as colunas da tabela videos
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'videos' 
AND TABLE_SCHEMA = DATABASE();

-- Ver todas as colunas da tabela video (singular)
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'video' 
AND TABLE_SCHEMA = DATABASE();
