# Izabels - Интернет-магазин цветов и подарков

Современный e-commerce сайт для продажи цветов, букетов и подарков с удобной админ-панелью.

## Технологический стек

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication
- Multer + Sharp (обработка изображений)

### Frontend
- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- shadcn/ui компоненты

## Структура проекта

```
izabels/
├── backend/          # Express API сервер
│   ├── src/
│   ├── prisma/
│   └── uploads/
├── frontend/         # Next.js приложение
│   ├── app/
│   ├── components/
│   └── lib/
└── task.md          # Техническое задание
```

## Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Backend

1. Создайте `.env` файл в папке `backend`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/izabels"
JWT_SECRET="your-secret-key"
PORT=5001
```

2. Запустите миграции:
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

3. Запустите сервер:
```bash
npm run dev:backend
```

### Frontend

1. Создайте `.env.local` файл в папке `frontend`:
```
NEXT_PUBLIC_API_URL=http://localhost:5001
```

2. Запустите dev сервер:
```bash
npm run dev:frontend
```

## Разработка

Запустить backend и frontend одновременно:
```bash
npm run dev
```

## Деплой

- **Backend**: Railway (PostgreSQL + Node.js)
- **Frontend**: Vercel (Next.js)

## Админ-панель

Доступ: `/admin`

Первоначальные credentials создаются через seed скрипт.


