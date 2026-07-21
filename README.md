# Gym — monorepo

App de gestión para gimnasios con biblioteca de ejercicios, rutinas entrenador-alumno y estética Neumorfismo.

## Stack

**Monorepo** pnpm workspaces:

- `web/` — Frontend React 19 + Vite 8 + Tailwind CSS v4 (CSS-first config) + shadcn/ui 4 + TanStack Query 5 + Zustand 5 + Motion 12 + lucide-react.
- `api/` — Backend NestJS 11 + Prisma 7 ORM + MySQL 8.4 + JWT en cookies httpOnly + RolesGuard (ADMIN / TRAINER / MEMBER).

## Requisitos

- Node 20.18+
- pnpm 10+ (`npm i -g pnpm`)
- Docker Desktop (para MySQL local) — o un servidor MySQL accesible

## Setup rapido

```bash
# 1. Levantar MySQL local
docker compose up -d

# 2. Instalar dependencias
pnpm install

# 3. Configurar .env (ver .env.example en cada workspace)
cp api/.env.example api/.env
cp web/.env.example web/.env

# 4. Migrar y sembrar la base
pnpm db:migrate
pnpm db:seed

# 5. Levantar web + api en paralelo
pnpm dev
```

- API: http://localhost:3000
- Web: http://localhost:5173
- Adminer (DB UI): http://localhost:8080 (Server: mysql, User: root, Password: rootpassword)

## Estructura

```
gym/
├── docker-compose.yml      # MySQL 8.4 + Adminer
├── pnpm-workspace.yaml
├── package.json            # root workspace
├── api/                    # NestJS + Prisma
│   ├── prisma/schema.prisma
│   ├── src/
│   └── .env.example
└── web/                    # React + Vite + Tailwind v4
    ├── public/exercises/   # exercises.json dataset
    ├── src/
    │   ├── components/ui/  # shadcn reskin neumorphico
    │   ├── components/      # negocio (Login, dashboards, ExerciseLibrary, Rutinas...)
    │   ├── contexts/AuthContext.tsx
    │   ├── lib/apiClient.ts
    │   └── index.css       # tokens Neumorfismo
    └── .env.example
```

## Dataset de ejercicios

`web/public/exercises/exercises.json` proviene de https://github.com/hasaneyldrm/exercises-dataset (licencia MIT para datos y textos; **media © Gym visual** — cada registro conserva `attribution`).

## Licencia

MIT.
