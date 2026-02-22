# Инструкция по переносу проекта на аккаунты клиента

Этот документ описывает процесс переноса проекта ChefRecipes на собственные аккаунты клиента.

---

## Обзор используемых сервисов

| Сервис | Назначение | Нужен аккаунт |
|--------|-----------|---------------|
| **Firebase** | Авторизация, база данных, хранение изображений | Google аккаунт |
| **Stripe** | Приём платежей | Stripe аккаунт (нужна верификация) |
| **Vercel** | Хостинг сайта | GitHub + Vercel аккаунт |
| **Vimeo** | Хостинг видео | Vimeo Pro/Business аккаунт |

---

## 1. Firebase (Google)

### 1.1. Создание проекта

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите **"Создать проект"**
3. Введите название проекта (например: `chefrecipes-production`)
4. Отключите Google Analytics (не нужен) или настройте по желанию
5. Дождитесь создания проекта

### 1.2. Настройка Authentication

1. В меню слева выберите **Build → Authentication**
2. Нажмите **"Get started"**
3. Во вкладке **Sign-in method** включите **Google**
4. Укажите email поддержки проекта
5. Сохраните

### 1.3. Настройка Firestore Database

1. В меню слева выберите **Build → Firestore Database**
2. Нажмите **"Create database"**
3. Выберите режим **"Start in production mode"**
4. Выберите регион (рекомендуется `europe-west1` для Европы)
5. После создания перейдите во вкладку **Rules** и замените правила на:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Рецепты - читать могут все, писать только авторизованные (админы)
    match /recipes/{recipeId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Настройки сайта - читать могут все, писать только авторизованные
    match /settings/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Покупки - читать свои, писать только сервер
    match /purchases/{purchaseId} {
      allow read: if request.auth != null && 
                    resource.data.recipientEmail == request.auth.token.email;
      allow write: if false;
    }
    
    // Отзывы - читать могут все, создавать/удалять - авторизованные (свои)
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && 
                      resource.data.userId == request.auth.uid;
      allow update: if false;
    }
  }
}
```

6. Нажмите **Publish**

### 1.4. Настройка Storage

1. В меню слева выберите **Build → Storage**
2. Нажмите **"Get started"**
3. Выберите **"Start in production mode"**
4. Выберите тот же регион что и для Firestore
5. Перейдите во вкладку **Rules** и замените на:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /recipes/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

6. Нажмите **Publish**

### 1.5. Получение ключей для веб-приложения

1. На главной странице проекта нажмите на иконку **</>** (Web)
2. Введите название приложения (например: `ChefRecipes Web`)
3. **Не включайте** Firebase Hosting
4. Нажмите **"Register app"**
5. Скопируйте конфигурацию — вам нужны эти значения:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 1.6. Получение ключей для сервера (Admin SDK)

1. Перейдите в **Project Settings** (шестерёнка) → **Service accounts**
2. Нажмите **"Generate new private key"**
3. Скачается JSON файл. Из него вам нужны:

```
FIREBASE_PROJECT_ID=... (поле project_id)
FIREBASE_CLIENT_EMAIL=... (поле client_email)
FIREBASE_PRIVATE_KEY=... (поле private_key — ВАЖНО: скопируйте полностью, включая \n)
```

### 1.7. Добавление домена

1. Перейдите в **Authentication → Settings → Authorized domains**
2. Добавьте ваш production домен (например: `chefrecipes.com`)
3. Добавьте Vercel домен (например: `your-project.vercel.app`)

---

## 2. Stripe

### 2.1. Создание аккаунта

1. Перейдите на [Stripe Dashboard](https://dashboard.stripe.com/)
2. Зарегистрируйтесь или войдите
3. **ВАЖНО:** Для приёма реальных платежей нужно пройти верификацию бизнеса

### 2.2. Получение API ключей

1. Перейдите в **Developers → API keys**
2. Скопируйте:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

> ⚠️ Для тестирования используйте Test mode ключи. Для production — Live mode.

### 2.3. Настройка Webhook

1. Перейдите в **Developers → Webhooks**
2. Нажмите **"Add endpoint"**
3. Введите URL: `https://ваш-домен.com/api/webhooks/stripe`
4. Выберите события:
   - `checkout.session.completed`
5. Нажмите **"Add endpoint"**
6. После создания нажмите **"Reveal"** под Signing secret
7. Скопируйте → `STRIPE_WEBHOOK_SECRET`

### 2.4. Настройка брендинга (опционально)

1. Перейдите в **Settings → Branding**
2. Загрузите логотип
3. Настройте цвета под стиль сайта

---

## 3. Vercel

### 3.1. Подключение репозитория

1. Перейдите на [Vercel](https://vercel.com/)
2. Войдите через GitHub
3. Нажмите **"Add New Project"**
4. Импортируйте репозиторий с проектом
5. Framework Preset: **Next.js** (определится автоматически)

### 3.2. Настройка переменных окружения

В настройках проекта перейдите в **Settings → Environment Variables** и добавьте все переменные:

**Firebase (клиентские):**
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

**Firebase (серверные):**
```
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

**Stripe:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

**Админы:**
```
NEXT_PUBLIC_ADMIN_EMAILS=email1@gmail.com,email2@gmail.com
```

**VIP (доступ ко всем курсам без админки):**
```
NEXT_PUBLIC_VIP_EMAILS=vip1@gmail.com,vip2@gmail.com
```

> ⚠️ **FIREBASE_PRIVATE_KEY** — при вставке замените `\n` на реальные переносы строк, или оберните значение в двойные кавычки.

### 3.3. Подключение домена

1. Перейдите в **Settings → Domains**
2. Добавьте ваш домен
3. Настройте DNS записи у регистратора домена:
   - Тип: `A` → `76.76.21.21`
   - Или тип: `CNAME` → `cname.vercel-dns.com`

### 3.4. Редеплой

После настройки переменных:
1. Перейдите в **Deployments**
2. Найдите последний деплой
3. Нажмите **"..."** → **"Redeploy"**

---

## 4. Vimeo

### 4.1. Требования

Для приватных видео нужен **Vimeo Pro** или **Business** аккаунт.

### 4.2. Настройка приватности видео

1. Загрузите видео на Vimeo
2. В настройках видео выберите **Privacy → Hide from Vimeo**
3. В **Embed** разрешите встраивание только с вашего домена

### 4.3. Получение Vimeo ID

URL видео: `https://vimeo.com/123456789`  
Vimeo ID: `123456789`

Этот ID вводится в админке при создании/редактировании курса.

---

## 5. Перенос данных

### 5.1. Экспорт данных из старого Firebase

Если нужно перенести существующие рецепты:

1. В старом Firebase Console → Firestore
2. Экспортируйте коллекции `recipes` и `settings`
3. Или скопируйте данные вручную через админку нового сайта

### 5.2. Перенос изображений

Изображения обложек хранятся в Firebase Storage. Варианты:
- Загрузить заново через админку нового сайта
- Экспортировать/импортировать через Firebase Console

---

## 6. Чек-лист перед запуском

- [ ] Firebase проект создан и настроен
- [ ] Firebase Rules опубликованы (Firestore + Storage)
- [ ] Домен добавлен в Firebase Authorized domains
- [ ] Stripe аккаунт верифицирован (для реальных платежей)
- [ ] Stripe webhook создан с правильным URL
- [ ] Все переменные окружения добавлены в Vercel
- [ ] Домен подключен к Vercel
- [ ] SSL сертификат активен (Vercel делает автоматически)
- [ ] Тестовая покупка прошла успешно
- [ ] Админ-доступ работает (email в NEXT_PUBLIC_ADMIN_EMAILS)

---

## 7. Тестирование

### Тестовые карты Stripe

В Test mode используйте:
- **Успешная оплата:** `4242 4242 4242 4242`
- **Отклонённая:** `4000 0000 0000 0002`
- Любая дата в будущем, любой CVC

### Проверка webhook

1. Сделайте тестовую покупку
2. Проверьте в Stripe Dashboard → Webhooks → Events
3. Убедитесь что событие доставлено (статус 200)

---

## 8. Поддержка

При возникновении проблем проверьте:
- Vercel → Deployments → Logs (ошибки сборки)
- Vercel → Logs (runtime ошибки)
- Stripe → Developers → Logs (ошибки платежей)
- Firebase → Firestore → Usage (лимиты)

---

*Документ создан: Февраль 2026*
