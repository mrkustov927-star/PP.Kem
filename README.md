# First Aid — рейтинг + материалы (GitHub Pages, /docs)

Готово к публикации. Встроен **Firebase** твоего проекта (pp10-79133).

## Структура
- `docs/index.html` — рейтинг с реальным Firebase (Anonymous Auth + Firestore `attempts`).
- `docs/theory.html` — теория.
- `docs/examples.html` — примеры.
- `docs/test.html` — тест (макет, можно расширить).

## Публикация
1) Создай репозиторий на GitHub и скопируй папку `docs/` в корень.
2) Settings → Pages → Source: Deploy from a branch → Branch: main → Folder: /docs → Save.
3) Открой страницу: `https://<логин>.github.io/<репозиторий>/`

## Не забудь в Firebase Console
- Build → Authentication → **Anonymous** → Enable.
- Build → Firestore Database → Create → **Production mode**.
- Rules: используй правила из прошлой инструкции или дай знать — пришлю готовый блок.

Готово! Все отправленные результаты будут автоматически появляться в таблице рейтинга.
