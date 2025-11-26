# Инструкция по запуску проекта Izabels

## Требования

- Node.js 18+ 
- PostgreSQL 14+
- npm или yarn

## Установка

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd izabels
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка Backend

```bash
cd backend

# Скопируйте пример переменных окружения
cp .env.example .env

# Отредактируйте .env и укажите:
# - DATABASE_URL="postgresql://user:password@localhost:5432/izabels"
# - JWT_SECRET="your-secret-key"
# - ADMIN_USERNAME=admin
# - ADMIN_PASSWORD=admin123

# Генерация Prisma Client
npx prisma generate

# Запуск миграций
npx prisma migrate dev

# Заполнение базы тестовыми данными
npx prisma db seed
```

### 4. Настройка Frontend

```bash
cd ../frontend

# Скопируйте пример переменных окружения
cp .env.local.example .env.local

# Отредактируйте .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:5001
```

## Запуск проекта

### Вариант 1: Отдельно backend и frontend

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Вариант 2: Одновременно через корень

```bash
npm run dev
```

## Доступ

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Админ-панель**: http://localhost:3000/admin

### Учетные данные администратора:
- Username: `admin`
- Password: `admin123`

## Структура проекта

```
izabels/
├── backend/              # Express API
│   ├── src/
│   │   ├── server.ts
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── utils/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── uploads/          # Загруженные изображения
│
├── frontend/             # Next.js приложение
│   ├── app/
│   │   ├── page.tsx      # Главная
│   │   ├── katalog/      # Каталог
│   │   ├── produkti/     # Товары
│   │   ├── koshnica/     # Корзина
│   │   ├── porachka/     # Оформление
│   │   └── admin/        # Админ-панель
│   ├── components/
│   └── lib/
│
└── task.md               # Техническое задание
```

## Основные команды

### Backend
```bash
npm run dev          # Запуск dev сервера
npm run build        # Сборка
npm start            # Запуск production
npx prisma studio    # Открыть Prisma Studio (DB UI)
npx prisma migrate dev --name <name>  # Создать миграцию
```

### Frontend
```bash
npm run dev          # Запуск dev сервера
npm run build        # Сборка
npm start            # Запуск production
npm run lint         # Проверка кода
```

## Деплой

### Backend на Railway

1. Создайте проект на Railway.app
2. Добавьте PostgreSQL addon
3. Подключите GitHub репозиторий
4. Установите переменные окружения:
   - `DATABASE_URL` (из PostgreSQL addon)
   - `JWT_SECRET`
   - `PORT=5001`
   - `NODE_ENV=production`
5. Railway автоматически деплоит при push

### Frontend на Vercel

1. Создайте проект на Vercel.com
2. Подключите GitHub репозиторий
3. Root Directory: `frontend`
4. Установите переменную окружения:
   - `NEXT_PUBLIC_API_URL=<railway-backend-url>`
5. Vercel автоматически деплоит при push

## Troubleshooting

**Ошибка подключения к БД:**
- Проверьте правильность DATABASE_URL
- Убедитесь, что PostgreSQL запущен

**Ошибки миграций:**
```bash
npx prisma migrate reset  # Сброс базы (ВНИМАНИЕ: удалит данные!)
npx prisma migrate dev    # Повторная миграция
```

**Frontend не видит API:**
- Проверьте NEXT_PUBLIC_API_URL в .env.local
- Убедитесь, что backend запущен на указанном порту

**Ошибка аутентификации в админке:**
- Проверьте, что seed выполнился успешно
- Используйте credentials: admin / admin123

## Поддержка

Для вопросов и поддержки обратитесь к документации:
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Express: https://expressjs.com/

