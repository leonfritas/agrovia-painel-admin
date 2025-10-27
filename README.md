# Agrovia - Painel Administrativo

Painel administrativo para gerenciar o sistema Agrovia, desenvolvido com Next.js 14, TypeScript e Tailwind CSS.

![Image](https://github.com/user-attachments/assets/d939c51a-8381-4c7c-bad3-4008b212e59f)

## 🚀 Funcionalidades

- **Dashboard**: Visão geral com estatísticas do sistema
- **Gestão de Usuários**: CRUD completo para usuários do sistema
- **Gestão de Categorias**: Gerenciar categorias de conteúdo
- **Gestão de Posts**: Criar, editar e excluir posts
- **Gestão de Vídeos**: Gerenciar vídeos (arquivos locais e URLs externas)
- **Relatórios**: Análises e estatísticas detalhadas
- **Configurações**: Perfil do usuário e configurações do sistema

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Headless UI** - Componentes acessíveis
- **Heroicons** - Ícones
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Axios** - Cliente HTTP

<<<<<<< HEAD
## 📦 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
# Crie um arquivo .env.local (ou copie o .env.example)
# Para desenvolvimento local:
NEXT_PUBLIC_API_URL=https://93c44447ef94.ngrok-free.app/api

# Para usar a API via ngrok:
NEXT_PUBLIC_API_URL=https://93c44447ef94.ngrok-free.app/api
```

**Importante**: Substitua `sua-url-do-ngrok` pela URL real fornecida pelo ngrok. Exemplo:
```bash
NEXT_PUBLIC_API_URL=https://93c44447ef94.ngrok-free.app/api
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse [http://localhost:3000](http://localhost:3000)

## 🔐 Autenticação

O painel requer autenticação de administrador. Use as credenciais:

- **Usuário**: admin
- **Senha**: 01042018

=======
>>>>>>> dfb427331f3aa386629099aa3fb1fc94fc8ad1f1
## 📱 Responsividade

O painel é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🎨 Interface

- Design moderno e limpo
- Sidebar colapsível
- Modais para formulários
- Tabelas com paginação
- Componentes reutilizáveis

## 🔧 Estrutura do Projeto

```
src/
├── app/                    # Páginas do Next.js
│   ├── login/             # Página de login
│   ├── usuarios/          # Gestão de usuários
│   ├── categorias/        # Gestão de categorias
│   ├── posts/             # Gestão de posts
│   ├── videos/            # Gestão de vídeos
│   ├── relatorios/        # Relatórios e estatísticas
│   └── configuracoes/     # Configurações
├── components/            # Componentes React
│   ├── layout/           # Layout e navegação
│   └── ui/               # Componentes de interface
└── lib/                  # Utilitários e configurações
    ├── api.ts            # Cliente da API
    ├── auth.ts           # Gerenciamento de autenticação
    └── utils.ts          # Funções utilitárias
```

## 🌐 API

O painel consome a API REST (configurável via `.env.local`) com os seguintes endpoints:

- `POST /auth/login` - Autenticação
- `GET /auth/me` - Perfil do usuário
- `GET /users` - Listar usuários
- `POST /users` - Criar usuário
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Excluir usuário
- `GET /categorias` - Listar categorias
- `POST /categorias` - Criar categoria
- `PUT /categorias/:id` - Atualizar categoria
- `DELETE /categorias/:id` - Excluir categoria
- `GET /posts` - Listar posts
- `POST /posts` - Criar post
- `PUT /posts/:id` - Atualizar post
- `DELETE /posts/:id` - Excluir post
- `GET /videos` - Listar vídeos
- `POST /videos` - Criar vídeo
- `PUT /videos/:id` - Atualizar vídeo
- `DELETE /videos/:id` - Excluir vídeo

