# ChefRecipes 🍳

Платформа для продажи эксклюзивных видеорецептов с авторизацией через Google, оплатой через Stripe и админ-панелью.

## ✨ Возможности

- 🔐 **Авторизация через Google** — Firebase Auth
- 💳 **Оплата через Stripe** — однократная покупка рецепта
- 🎬 **Видео с Vimeo** — приватный хостинг для платного контента
- ⚙️ **Админ-панель** — управление рецептами и настройками сайта
- 🎨 **Современный UI** — Tailwind CSS, анимации, тёмная тема

## 🚀 Быстрый старт

```bash
# Установка
npm install

# Копирование примера конфига
cp env.example .env.local

# Заполни .env.local своими ключами (см. SETUP.md)

# Запуск
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000)

## 📖 Документация

| Файл | Описание |
|------|----------|
| **[SETUP.md](./SETUP.md)** | Локальная разработка: Firebase, Stripe, Vimeo |
| **[PRODUCTION.md](./PRODUCTION.md)** | Деплой на Vercel и настройка продакшена |

### Быстрые ссылки:
- 🔧 [Настройка Firebase](./SETUP.md#1-firebase)
- 💳 [Настройка Stripe](./SETUP.md#2-stripe)
- 🎬 [Настройка Vimeo](./SETUP.md#3-vimeo)
- 🚀 [Деплой на Vercel](./PRODUCTION.md#2-деплой-на-vercel)
- 💰 [Live платежи](./PRODUCTION.md#6-переход-на-live-платежи)

## 📁 Структура проекта

```
src/
├── app/
│   ├── admin/              # 👨‍💼 Админ-панель
│   │   ├── recipes/        # Управление рецептами
│   │   └── settings/       # Настройки сайта
│   ├── api/                # API роуты
│   │   ├── create-checkout-session/
│   │   └── webhooks/stripe/
│   └── recipes/            # Страницы рецептов
├── components/             # React компоненты
├── context/                # AuthContext
└── lib/                    # Firebase, Stripe, Firestore
```

## 🔑 Переменные окружения

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_SERVICE_ACCOUNT_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Админы (email через запятую)
NEXT_PUBLIC_ADMIN_EMAILS=admin@gmail.com

# URL приложения
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🛠 Технологии

- **Next.js 16** — App Router, Server Components
- **TypeScript** — типизация
- **Tailwind CSS** — стили
- **Firebase** — Auth + Firestore
- **Stripe** — платежи
- **Vimeo** — видеохостинг

## 📄 Лицензия

MIT
