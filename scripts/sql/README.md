# Scripts SQL para Migração da Tabela de Vídeos

Este diretório contém scripts SQL para adicionar as colunas de autor na tabela de vídeos.

## Scripts Disponíveis

### 1. `check_video_table_structure.sql`
**Execute primeiro** para verificar a estrutura atual da tabela de vídeos.

```sql
-- Verificar estrutura da tabela
DESCRIBE videos;
```

### 2. `add_video_author_columns.sql`
Script principal para adicionar as colunas de autor.

```sql
-- Adicionar colunas
ALTER TABLE videos 
ADD COLUMN nomeAutor VARCHAR(255) NULL COMMENT 'Nome do autor do vídeo';

ALTER TABLE videos 
ADD COLUMN cargoAutor VARCHAR(255) NULL COMMENT 'Cargo do autor do vídeo';
```

### 3. `add_video_author_columns_alternative.sql`
Script alternativo caso a tabela tenha nome diferente.

## Como Executar

1. **Conecte-se ao seu banco de dados MySQL**
2. **Execute primeiro o script de verificação**:
   ```bash
   mysql -u seu_usuario -p seu_banco < check_video_table_structure.sql
   ```
3. **Execute o script de migração**:
   ```bash
   mysql -u seu_usuario -p seu_banco < add_video_author_columns.sql
   ```

## Verificação

Após executar os scripts, verifique se as colunas foram adicionadas:

```sql
DESCRIBE videos;
```

Você deve ver as colunas:
- `nomeAutor` VARCHAR(255) NULL
- `cargoAutor` VARCHAR(255) NULL

## Rollback (se necessário)

Para remover as colunas caso algo dê errado:

```sql
ALTER TABLE videos DROP COLUMN nomeAutor;
ALTER TABLE videos DROP COLUMN cargoAutor;
```
