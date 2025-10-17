# 🎥 Guia de Upload de Vídeos - Painel Administrativo

## 📋 Funcionalidades Implementadas

### ✅ **Upload de Arquivos**
- **Upload de Vídeo**: Botão para escolher arquivos MP4 do computador
- **Upload de Imagem**: Botão para escolher imagens JPG/PNG como capa
- **Validação de Arquivos**: Verificação de tipo e tamanho (máx. 50MB)
- **Salvamento Automático**: Arquivos salvos em `/public/videos` e `/public/images`

### ✅ **Campos Adicionais**
- **Nome do Autor**: Campo para nome do autor do vídeo
- **Cargo do Autor**: Campo para cargo/profissão do autor
- **Imagem de Capa**: Upload de imagem que será exibida como capa
- **Ordem**: Campo para ordenação dos vídeos (opcional)

### ✅ **Integração com Site Web**
- **Categorias Especiais**: Vídeos em "Agrovia Inspira" e "Agrovia Conversa" aparecem automaticamente no site
- **Dados Dinâmicos**: Site web busca vídeos do banco de dados em tempo real
- **Fallback Inteligente**: Se houver erro, usa dados de demonstração

## 🚀 Como Usar

### **1. Acessar o Painel de Vídeos**
1. Faça login no painel administrativo
2. Navegue para "Vídeos" no menu lateral
3. Clique em "Novo Vídeo"

### **2. Preencher Informações Básicas**
- **Nome do Vídeo**: Título descritivo
- **Descrição**: Descrição detalhada do conteúdo
- **Categoria**: Selecione "Agrovia Inspira" 📹 ou "Agrovia Conversa" 📹 para exibição no site
- **Autor**: Selecione o usuário responsável

### **3. Upload de Arquivos**
- **Arquivo de Vídeo**: Clique em "Escolher arquivo" e selecione um MP4
- **Imagem de Capa**: Clique em "Escolher arquivo" e selecione uma imagem JPG/PNG
- **URLs Alternativas**: Pode usar URLs externas em vez de upload

### **4. Campos Opcionais**
- **Nome do Autor**: Nome que aparecerá no site
- **Cargo do Autor**: Profissão/cargo (ex: "Engenheiro", "Produtor")
- **URL Externa**: Para vídeos do YouTube, Vimeo, etc.

### **5. Salvar**
- Clique em "Criar" para salvar
- O sistema fará upload dos arquivos automaticamente
- Vídeos de categorias especiais aparecerão no site imediatamente

## 📁 Estrutura de Arquivos

```
public/
├── videos/           # Vídeos MP4 salvos
│   ├── video_1234567890.mp4
│   └── video_1234567891.mp4
└── images/           # Imagens de capa
    ├── image_1234567890.jpg
    └── image_1234567891.png
```

## 🔧 API de Upload

### **Endpoint**: `/api/upload`
- **Método**: POST
- **Content-Type**: multipart/form-data
- **Parâmetros**:
  - `file`: Arquivo a ser enviado
  - `type`: "video" ou "image"

### **Resposta de Sucesso**:
```json
{
  "success": true,
  "url": "/videos/video_1234567890.mp4",
  "fileName": "video_1234567890.mp4",
  "size": 1048576,
  "type": "video/mp4"
}
```

## 🎯 Categorias Especiais

### **Agrovia Inspira** 📹
- Vídeos de depoimentos e histórias inspiradoras
- Aparecem no carrossel da seção "Agrovia Inspira" do site
- Campos recomendados:
  - Nome do Autor: Nome do produtor
  - Cargo do Autor: "Produtor Rural", "Cooperativa", etc.

### **Agrovia Conversa** 📹
- Vídeos de entrevistas e conversas com especialistas
- Aparecem no carrossel da seção "Agrovia Conversa" do site
- Campos recomendados:
  - Nome do Autor: Nome do especialista
  - Cargo do Autor: "Engenheiro", "Pesquisador", etc.

## ⚠️ Limitações e Validações

### **Tipos de Arquivo Suportados**:
- **Vídeos**: MP4, WebM, AVI, MOV
- **Imagens**: JPG, JPEG, PNG

### **Tamanho Máximo**:
- **50MB** por arquivo

### **Validações**:
- Pelo menos uma URL (arquivo ou externa) deve ser fornecida
- Arquivos são validados por tipo MIME
- Nomes de arquivo são únicos (timestamp)

## 🔄 Fluxo Completo

1. **Admin faz upload** → Painel administrativo
2. **Arquivos salvos** → `/public/videos` e `/public/images`
3. **Dados salvos** → Banco de dados com URLs dos arquivos
4. **Site web busca** → API automática a cada carregamento
5. **Carrossel atualiza** → Exibição dinâmica no site
6. **Usuário vê** → Conteúdo sempre atualizado

## 🛠️ Solução de Problemas

### **Erro de Upload**:
- Verifique se o arquivo é menor que 50MB
- Confirme se o tipo de arquivo é suportado
- Verifique se há espaço em disco suficiente

### **Vídeo não aparece no site**:
- Confirme se a categoria é "Agrovia Inspira" ou "Agrovia Conversa"
- Verifique se o vídeo está ativo no banco
- Confirme se a URL do arquivo está correta

### **Imagem não carrega**:
- Verifique se o arquivo foi salvo em `/public/images`
- Confirme se a URL da imagem está correta
- Verifique se o arquivo é JPG ou PNG

## 📈 Benefícios

- ✅ **Upload Simples**: Interface intuitiva para upload de arquivos
- ✅ **Gerenciamento Centralizado**: Tudo controlado pelo painel admin
- ✅ **Conteúdo Dinâmico**: Site atualiza automaticamente
- ✅ **Validação Robusta**: Prevenção de erros e arquivos inválidos
- ✅ **Fallback Inteligente**: Sistema continua funcionando mesmo com erros
- ✅ **Performance Otimizada**: Arquivos servidos diretamente do servidor

## 🎉 Resultado Final

Agora você tem um sistema completo de upload de vídeos que:
- Permite upload fácil de arquivos do computador
- Salva automaticamente em `/public/videos`
- Exibe vídeos dinamicamente no site web
- Mantém tudo sincronizado entre painel e site
- Oferece experiência de usuário profissional

O sistema está pronto para uso! 🚀
