# 🌐 Configuração do Ngrok para o Painel Admin

Este guia explica como configurar o painel administrativo para consumir a API através do ngrok.

## 📝 O que é o Ngrok?

O ngrok é uma ferramenta que cria um túnel seguro da internet para o seu servidor local, permitindo que você acesse sua aplicação de qualquer lugar com uma URL pública.

## 🚀 Passo a Passo

### 1. Obter a URL do Ngrok

Primeiro, você precisa ter o ngrok rodando no servidor da API. Se você já tem a URL do ngrok, pule para o passo 2.

Se ainda não tem, inicie o ngrok apontando para a porta da sua API (geralmente 4000):

```bash
ngrok http 4000
```

Isso vai gerar uma URL parecida com:
```
https://5acfae47b7cd.ngrok-free.app
```

### 2. Configurar a Variável de Ambiente

1. Abra o arquivo `.env.local` na raiz do projeto
2. Edite a variável `NEXT_PUBLIC_API_URL` com a URL do ngrok + `/api`:

```bash
NEXT_PUBLIC_API_URL=https://1234-56-78-910-111.ngrok-free.app/api
```

**⚠️ Importante**: 
- Não esqueça de adicionar `/api` no final da URL
- Use `https://` (não `http://`)
- Copie a URL completa fornecida pelo ngrok

### 3. Reiniciar o Servidor

Após modificar o arquivo `.env.local`, você precisa reiniciar o servidor do Next.js:

```bash
# Pressione Ctrl+C para parar o servidor (se estiver rodando)
# Depois execute novamente:
npm run dev
```

### 4. Verificar a Conexão

1. Acesse `http://localhost:3000/login`
2. Tente fazer login com as credenciais:
   - **Usuário**: admin
   - **Senha**: 01042018
3. Se o login funcionar, a conexão com a API via ngrok está configurada corretamente!

## 🔧 Solução de Problemas

### Erro: "Network Error" ou "Failed to fetch"

**Causa**: A URL do ngrok pode estar incorreta ou expirada.

**Solução**:
1. Verifique se o ngrok ainda está rodando
2. Confirme se a URL no `.env.local` está correta
3. Certifique-se de que adicionou `/api` no final da URL
4. Reinicie o servidor do Next.js

### Erro: "CORS Policy"

**Causa**: A API precisa estar configurada para aceitar requisições do ngrok.

**Solução**: Certifique-se de que a API tem o CORS configurado corretamente. O servidor da API deve permitir requisições de qualquer origem ou especificamente do domínio do painel admin.

### URL do Ngrok Mudou

**Causa**: URLs gratuitas do ngrok são temporárias e mudam toda vez que você reinicia o ngrok.

**Solução**: 
1. Copie a nova URL fornecida pelo ngrok
2. Atualize o `.env.local`
3. Reinicie o servidor do Next.js

## 🎯 Dicas

1. **URL Fixa**: Se você usa ngrok frequentemente, considere criar uma conta gratuita no ngrok para obter URLs fixas.

2. **Múltiplos Ambientes**: Você pode criar diferentes arquivos de ambiente:
   - `.env.local` - Para desenvolvimento com ngrok
   - `.env.development` - Para desenvolvimento local
   - `.env.production` - Para produção

3. **Não Commite**: O arquivo `.env.local` já está no `.gitignore` para evitar que você commit informações sensíveis.

## 📱 Testando de Outros Dispositivos

Uma das vantagens de usar o ngrok é poder testar o painel em outros dispositivos:

1. Com o ngrok configurado, você pode acessar o painel de qualquer dispositivo
2. Basta garantir que tanto a API quanto o painel estejam usando a URL do ngrok
3. O painel continuará rodando em `http://localhost:3000` no seu computador

## ✅ Checklist de Configuração

- [ ] Ngrok está rodando na API
- [ ] URL do ngrok foi copiada
- [ ] Arquivo `.env.local` foi criado/editado
- [ ] URL no `.env.local` inclui `/api` no final
- [ ] Servidor do Next.js foi reiniciado
- [ ] Login funciona corretamente

## 📞 Suporte

Se você continuar tendo problemas, verifique:
1. Os logs do ngrok
2. Os logs do servidor da API
3. O console do navegador (F12) para mensagens de erro
4. A aba Network do DevTools para ver as requisições HTTP

---

**Última atualização**: Outubro 2025

