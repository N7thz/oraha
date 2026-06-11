# Oraha

Aplicação de gestão financeira pessoal com rastreamento de transações, carteiras, recorrências e parcelamentos.

## Pré-requisitos

| Ferramenta | Versão mínima | Observação |
|------------|--------------|------------|
| [Bun](https://bun.sh) | 1.x | Gerenciador de pacotes e runtime |
| PostgreSQL | 14+ | Banco de dados (ou use [Supabase](https://supabase.com)) |

> **Por que Bun?** O projeto usa `bun.lock` e os scripts `db:*` invocam `bunx --bun`. Usar npm/yarn pode instalar dependências, mas os scripts de banco precisam do Bun.

## Instalação

```bash
# 1. Clone o repositório
git clone <url-do-repositório>
cd oraha

# 2. Instale as dependências
bun install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais (veja a seção abaixo)

# 4. Gere o Prisma Client
bun run db:generate

# 5. Execute as migrations
bun run db:migrate

# 6. (Opcional) Popule com dados de exemplo
bun run db:seed
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
# Conexão com pooling (pgBouncer) — usada pela aplicação em runtime
DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true"

# Conexão direta — usada pelo Prisma para migrations
DIRECT_URL="postgresql://user:password@host:5432/postgres"

# Segredo da sessão — gere com: openssl rand -base64 32
BETTER_AUTH_SECRET="change-me-in-production-use-openssl-rand-base64-32"

# URL base da aplicação
BETTER_AUTH_URL="http://localhost:3000"

# Pluggy (integração bancária aberta) — opcional
PLUGGY_CLIENT_ID=""
PLUGGY_CLIENT_SECRET=""
PLUGGY_API_KEY=""
```

### Supabase (setup rápido)

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Acesse **Settings → Database → Connection string**
3. Copie a URI com **Transaction pooler** para `DATABASE_URL` e a **Session pooler / direta** para `DIRECT_URL`

## Scripts disponíveis

### Desenvolvimento

```bash
bun run dev        # Servidor de desenvolvimento (http://localhost:3000)
bun run build      # Build de produção
bun run start      # Inicia o servidor de produção
```

### Qualidade de código

```bash
bun run lint       # Verifica com Biome
bun run format     # Formata com Biome
```

### Banco de dados

```bash
bun run db:generate        # Gera o Prisma Client a partir do schema
bun run db:migrate         # Cria e aplica novas migrations (dev)
bun run db:migrate:status  # Exibe o status das migrations
bun run db:push            # Sincroniza o schema sem criar migration (prototipagem)
bun run db:pull            # Importa o schema a partir do banco existente
bun run db:validate        # Valida os arquivos .prisma
bun run db:format          # Formata os arquivos .prisma
bun run db:seed            # Popula o banco com dados de exemplo
```

### Usuário admin

```bash
# Modo interativo — solicita nome, e-mail e senha no terminal
bun run create-admin

# Passando os dados via flags
bun run create-admin -- --name "Nome Completo" --email "admin@exemplo.com" --password "SenhaForte123"
```

## Dependências principais

| Pacote | Finalidade |
|--------|-----------|
| `next` 16 | Framework React com App Router |
| `react` 19 | Biblioteca de UI |
| `@prisma/client` | ORM para PostgreSQL |
| `better-auth` | Autenticação (e-mail/senha + 2FA) |
| `@tanstack/react-query` | Cache e sincronização de dados |
| `@tanstack/react-table` | Tabelas headless |
| `react-hook-form` + `zod` | Formulários com validação |
| `recharts` | Gráficos |
| `shadcn` + `tailwindcss` | Sistema de UI e estilos |
| `motion` | Animações |
| `dinero.js` | Operações monetárias (armazenado em centavos) |
| `pluggy-sdk` | Agregação de dados bancários (Open Finance) |
| `sonner` | Notificações toast |
| `date-fns` | Manipulação de datas |

## Estrutura do projeto

```
oraha/
├── prisma/
│   ├── schema/          # Schema Prisma modularizado por entidade
│   ├── migrations/      # Histórico de migrations
│   ├── seed.ts          # Dados de exemplo
│   └── create-admin.ts  # Script de criação de usuário admin
├── src/
│   ├── app/             # Next.js App Router (rotas, layouts, API)
│   ├── actions/         # Server Actions (CRUD de transações, carteiras…)
│   ├── components/      # Componentes React (ui/, dashboard/, transaction/…)
│   ├── hooks/           # Custom hooks
│   └── lib/             # Auth, Prisma client, utilitários
├── .env.example         # Template de variáveis de ambiente
└── package.json
```

## Fluxo de setup resumido

```
bun install → cp .env.example .env → (editar .env) → db:generate → db:migrate → dev
```
