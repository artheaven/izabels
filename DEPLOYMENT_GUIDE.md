# 🚀 Руководство по деплою Izabels

## 📋 Содержание
1. [Подготовка](#подготовка)
2. [Деплой Backend на Railway](#деплой-backend-на-railway)
3. [Деплой Frontend на Vercel](#деплой-frontend-на-vercel)
4. [Настройка после деплоя](#настройка-после-деплоя)
5. [Troubleshooting](#troubleshooting)

---

## Подготовка

### Необходимые аккаунты
- ✅ GitHub аккаунт (у вас уже есть: artheaven)
- 🆓 [Railway](https://railway.app/) - для backend + database
- 🆓 [Vercel](https://vercel.com/) - для frontend
- 🆓 [Cloudinary](https://cloudinary.com/) - для хранения изображений (опционально, но рекомендуется)

### Проверка репозитория
```bash
# Убедитесь что все изменения закоммичены
cd /Users/user/izabels
git status
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## Деплой Backend на Railway

### Шаг 1: Создание проекта

1. Перейдите на [railway.app](https://railway.app/)
2. Нажмите **"New Project"**
3. Выберите **"Deploy from GitHub repo"**
4. Выберите репозиторий **artheaven/izabels**
5. Railway автоматически определит Node.js проект

### Шаг 2: Добавление PostgreSQL

1. В вашем проекте нажмите **"New Service"**
2. Выберите **"Database" → "PostgreSQL"**
3. Railway автоматически создаст базу данных
4. Скопируйте **"DATABASE_URL"** из переменных окружения PostgreSQL

### Шаг 3: Настройка Backend Service

1. Выберите ваш backend service (Node.js)
2. Перейдите в **"Settings" → "Root Directory"**
3. Установите: `backend`
4. Перейдите в **"Settings" → "Build Command"**
5. Установите: `npm install && npm run build`
6. Перейдите в **"Settings" → "Start Command"**
7. Установите: `npm start`

### Шаг 4: Переменные окружения Backend

Перейдите в **"Variables"** и добавьте:

```bash
DATABASE_URL=<скопируйте из PostgreSQL service>
NODE_ENV=production
JWT_SECRET=<сгенерируйте случайную строку>
FRONTEND_URL=<оставьте пустым, заполним позже>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<придумайте надежный пароль>
ADMIN_EMAIL=admin@izabels.bg
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**Генерация JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Шаг 5: Deploy Backend

1. Нажмите **"Deploy"**
2. Дождитесь завершения сборки (3-5 минут)
3. После успешного деплоя скопируйте публичный URL
   - Пример: `https://izabels-backend-production.up.railway.app`

### Шаг 6: Запуск миграций

Railway автоматически запустит Prisma Generate (postinstall скрипт), но миграции нужно запустить вручную:

1. Перейдите в **"Settings" → "Deploy"**
2. В секции **"Custom Deploy Command"** добавьте:
   ```bash
   npm run prisma:migrate && npm start
   ```
3. Или выполните через Railway CLI:
   ```bash
   railway run npx prisma migrate deploy
   railway run npx prisma db seed
   ```

---

## Деплой Frontend на Vercel

### Шаг 1: Создание проекта

1. Перейдите на [vercel.com](https://vercel.com/)
2. Нажмите **"Add New" → "Project"**
3. Импортируйте репозиторий **artheaven/izabels**
4. Vercel автоматически определит Next.js проект

### Шаг 2: Настройка проекта

1. **Root Directory:** `frontend`
2. **Framework Preset:** Next.js (автоматически)
3. **Build Command:** `npm run build` (автоматически)
4. **Output Directory:** `.next` (автоматически)

### Шаг 3: Переменные окружения

В секции **"Environment Variables"** добавьте:

```bash
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app
```

⚠️ **Важно:** Используйте URL вашего Railway backend из предыдущего шага!

### Шаг 4: Deploy Frontend

1. Нажмите **"Deploy"**
2. Дождитесь завершения сборки (2-3 минуты)
3. После успешного деплоя скопируйте публичный URL
   - Пример: `https://izabels.vercel.app`

---

## Настройка после деплоя

### 1. Обновление FRONTEND_URL на Railway

1. Вернитесь в Railway → Backend Service → Variables
2. Обновите `FRONTEND_URL` на ваш Vercel URL:
   ```bash
   FRONTEND_URL=https://izabels.vercel.app
   ```
3. Railway автоматически пересоберет backend

### 2. Проверка работоспособности

**Backend:**
```bash
curl https://your-railway-backend-url.railway.app/
# Должен вернуть: {"message":"Izabels Flower Shop API",...}
```

**Frontend:**
- Откройте `https://izabels.vercel.app`
- Проверьте главную страницу
- Проверьте каталог
- Попробуйте войти в админку: `/admin/login`

### 3. Создание админа (если seed не запустился)

Через Railway CLI:
```bash
railway login
railway link
railway run npx tsx prisma/seed.ts
```

Или через Railway Dashboard:
1. Service → Settings → Custom Start Command (временно)
2. Добавьте: `npx tsx prisma/seed.ts && npm start`
3. После первого деплоя верните обратно: `npm start`

### 4. Настройка домена (опционально)

**Vercel:**
1. Settings → Domains
2. Добавьте ваш домен (например: `izabels.bg`)
3. Следуйте инструкциям по настройке DNS

**Railway:**
1. Settings → Networking
2. Добавьте custom domain (например: `api.izabels.bg`)
3. Обновите `NEXT_PUBLIC_API_URL` на Vercel

---

## 🚨 Критично: Проблема с Uploads

⚠️ **Railway использует ephemeral filesystem** - все загруженные файлы будут удаляться после каждого деплоя/рестарта!

### Решение 1: Cloudinary (Рекомендуется)

**Преимущества:**
- ✅ Бесплатный tier: 25GB, 25k трансформаций/месяц
- ✅ CDN включен
- ✅ Автоматическая оптимизация изображений
- ✅ Простая интеграция

**Установка:**

1. Зарегистрируйтесь на [cloudinary.com](https://cloudinary.com/)
2. Получите credentials: Cloud Name, API Key, API Secret
3. Установите пакет в backend:
   ```bash
   cd backend
   npm install cloudinary multer-storage-cloudinary
   ```

4. Добавьте в `.env` на Railway:
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. Обновите `backend/src/middleware/upload.ts`:
   ```typescript
   import { v2 as cloudinary } from 'cloudinary';
   import { CloudinaryStorage } from 'multer-storage-cloudinary';
   
   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
   });
   
   const storage = new CloudinaryStorage({
     cloudinary: cloudinary,
     params: {
       folder: 'izabels',
       allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
     },
   });
   ```

### Решение 2: Railway Volumes

**Преимущества:**
- ✅ Полный контроль
- ✅ Быстрый доступ

**Недостатки:**
- ❌ Платно: ~$0.25/GB/месяц
- ❌ Не масштабируется автоматически

**Настройка:**
1. Railway → Service → Volumes
2. Create Volume: `/app/uploads`
3. Mount path: `/app/uploads`

### Решение 3: AWS S3

Более сложная настройка, но дешевле для больших объемов.

---

## Troubleshooting

### Backend не стартует

**Проблема:** "Cannot find module '@prisma/client'"
```bash
# Убедитесь что postinstall скрипт добавлен в package.json
"postinstall": "prisma generate"
```

**Проблема:** "Port already in use"
```bash
# Railway автоматически устанавливает PORT
# Убедитесь что используете: process.env.PORT
```

**Проблема:** "Database connection failed"
```bash
# Проверьте DATABASE_URL в переменных окружения
# Убедитесь что PostgreSQL service запущен
```

### Frontend не загружает данные

**Проблема:** CORS errors
```bash
# Проверьте FRONTEND_URL на Railway
# Должен совпадать с вашим Vercel URL
```

**Проблема:** "Network Error" или "Failed to fetch"
```bash
# Проверьте NEXT_PUBLIC_API_URL на Vercel
# Должен быть полный URL вашего Railway backend
```

### Изображения не загружаются

**Проблема:** Next.js Image optimization error
```bash
# Проверьте next.config.js → remotePatterns
# Добавьте ваш Railway домен
```

**Проблема:** Изображения пропадают после деплоя
```bash
# Railway использует ephemeral filesystem
# Интегрируйте Cloudinary (см. выше)
```

### Миграции не применились

```bash
# Через Railway CLI
railway login
railway link
railway run npx prisma migrate deploy

# Или через custom start command
npm run prisma:migrate && npm start
```

---

## 📊 Мониторинг

### Railway
- **Logs:** Service → Deployments → Logs
- **Metrics:** Service → Metrics (CPU, Memory, Network)
- **Database:** PostgreSQL service → Metrics

### Vercel
- **Logs:** Project → Deployments → Function Logs
- **Analytics:** Project → Analytics
- **Speed Insights:** Автоматически включен

---

## 🔐 Безопасность

### После деплоя обязательно:

1. ✅ Измените админский пароль через админку
2. ✅ Используйте сильный JWT_SECRET (64+ символов)
3. ✅ Включите HTTPS на custom domain
4. ✅ Настройте CORS только для вашего домена
5. ✅ Регулярно обновляйте зависимости:
   ```bash
   npm audit
   npm update
   ```

---

## 📞 Полезные ссылки

- **Railway Docs:** https://docs.railway.app/
- **Vercel Docs:** https://vercel.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Cloudinary Docs:** https://cloudinary.com/documentation

---

**Последнее обновление:** 26.11.2025  
**Версия:** 1.0.0-MVP

