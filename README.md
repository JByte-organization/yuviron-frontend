# Yuviron Frontend

Frontend часть проекта Yuviron, реализованная с использованием Next.js.

Репозиторий проекта:  
https://github.com/JByte-organization/yuviron-frontend

---

## Environments

Доступные окружения:

- **Production (main):**  
  http://yuviron-web-prod.eba-6mnjiyxy.eu-west-2.elasticbeanstalk.com/

- **Development (dev):**  
  http://yuviron-web-dev.eba-6mnjiyxy.eu-west-2.elasticbeanstalk.com/

Для веток `main` и `dev` настроен автоматический деплой.

---

## Restricted files

⚠️ Следующие файлы и папки запрещено изменять, так как они участвуют в процессе деплоя:

- `.github/workflows/deploy-dev-eb.yml`
- `.github/workflows/deploy-prod-eb.yml`
- `.github/workflows/deploy-prod-eb.yml`
- `.platform/hooks/predeploy/01_build.sh`
- `Procfile`
- `server.js`

---

## Getting Started

Установка зависимостей:

```bash
npm install
```

Запуск проекта в режиме разработки:

```bash
npm run dev
```

После запуска откройте в браузере:

```
http://localhost:3000
```

Основная страница проекта:

```ts
app/page.tsx
```

Изменения применяются автоматически при сохранении файлов.

---

## Tech Stack

* Next.js
* React
* TypeScript

---

## Project Structure

Основные директории проекта:

* `app/` — страницы и роутинг
* `public/` — статические файлы
* `.github/` — CI/CD конфигурации
* `.platform/` — конфигурация деплоя

---

## Useful Links

* Next.js Documentation — [https://nextjs.org/docs](https://nextjs.org/docs)
* Learn Next.js — [https://nextjs.org/learn](https://nextjs.org/learn)
* Next.js GitHub — [https://github.com/vercel/next.js](https://github.com/vercel/next.js)

---

## Branching Rules

* `dev` — ветка для разработки
* `main` — продакшн ветка
* все фичи делаются от `dev`