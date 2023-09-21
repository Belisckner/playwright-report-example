# Playwright CI example
## Описание
Проект пример для параллельного запуска тестов и единого отчета со всех прогонов. Помимо тестов playwright init добавлен скрипт отправки сообщений в rocket-chat по webhook и gitlab-ci.yml 

## Стек
- playwright
- typescript
- ts-node
- got

## Структура проекта.
```
└── helpers                         
    └── reportToChat.ts             # Скрипт отправки сообщений в rocket-chat
├── tests                          
    ├── demo-todo-app.spec.ts       # Тесты из playright test init с циклами
    └── example.spec.ts             # Тесты из playright test init с циклами
├── .gitignore
├── .gitlab-ci.yml                  # Конфигурация для gitlab-ci с раннерами по тегу kube-dev
├── package-lock.json
├── package.json                    
├── playwright.config.ts            # доработанная конфигурация playwright config
├── README.md
└── tsconfig.json
```

## Запуск
```
npm i 
npx playwright install
npx playwright test
```
## CI
Запуск CI настроен на каждый push в репозиторий с командой `npx playwright test --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL`. Состоит из 2х этапов
- tests - запускается проект из 5 параллельных jobs. В качестве артефактов `test_results.xml` и `/blob-report`.
- report - отправка сообщения в чат скриптом reportToChat.ts и слияние отчетов в один. Артефакты хранятся 1 неделю

## Полезные ссылки
- https://playwright.dev/docs/test-sharding#merge-reports-cli - дока playwright, слияние нескольких отчетов в 1 html
- https://playwright.dev/docs/ci#gitlab-ci - дока playwright, создание CI для GitLab-CI

