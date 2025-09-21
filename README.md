# Тренажёр — рейтинг с именем/командой и временем (GitHub Pages, docs/)

Готовая страница для публикации на **GitHub Pages**. Работает в двух режимах:
- **Демо** (без Firebase): рейтинг хранится только в памяти сайта.
- **Боевой** (с Firebase): вставьте `firebaseConfig` и получите общий рейтинг в реальном времени.

## Публикация
1) Создайте репозиторий (например, `first-aid-rating`).  
2) Скопируйте папку `docs/` в корень репозитория.  
3) Включите **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` → Folder: `/docs`.  
4) Откройте адрес: `https://<логин>.github.io/<имя_репозитория>/`

## Подключение Firebase (по желанию)
- В консоли Firebase создайте проект, добавьте Web App и получите `firebaseConfig`.
- В `docs/index.html` найдите блок:
  ```js
  const firebaseConfig = { apiKey: "", authDomain: "", projectId: "", storageBucket: "", messagingSenderId: "", appId: "" };
  ```
  — вставьте свои значения.
- Включите **Authentication → Anonymous** и **Firestore**.
- Создайте коллекцию `attempts`.  
- (Рекомендуется) Установите строгие правила Firestore (см. раздел ниже).

## Правила Firestore (пример)
```
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /attempts/{doc} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.name is string
        && request.resource.data.team is string
        && request.resource.data.points is number
        && request.resource.data.correct is number
        && request.resource.data.total is number
        && request.resource.data.durationMs is number
        && request.resource.data.createdAt is timestamp
        && request.resource.data.name.size() > 0
        && request.resource.data.name.size() <= 40
        && request.resource.data.team.size() <= 40
        && request.resource.data.points <= 10000
        && request.resource.data.total <= 200
        && request.resource.data.durationMs <= 3600000;
    }
  }
}
```

## Где ставить «отправку результата» в реальном тесте
- На старте теста: `startTs = performance.now();`
- При проверке: посчитайте `correct`, `total`, `durationMs = performance.now() - startTs`, `points` (ваша формула).
- Вызовите `document.getElementById('send').click()` или перепишите логику под вашу кнопку: в коде используйте `addDoc(collection(db, 'attempts'), {...})`.

## Кастомизация
- Измените формулу очков (`points`), длительность таймера, количество вопросов (`totalNow`).
- В таблице можно добавить столбцы (например, «Тема/Станция»), добавив поля в запись и в разметку таблицы.

Удачной публикации!
