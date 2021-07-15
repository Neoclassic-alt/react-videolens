# Инструкция по установке и запуску приложения

1. Установите дополнения, набрав в командной строке `npm i`
2. Если отсутствует [json-server](https://github.com/typicode/json-server), то установите его:

`npm install -g json-server`

3. Создайте в папке src файл config.js со следующими данными:

```
export const YOUTUBE_KEY = "Ваш API-key"
export const YOUR_SITE = "http://localhost:3004/" /* по умолчанию */
/* слеш в конце - это важно */
```

4. Запустите json-server с помощью команды `npm run watch`
5. Запустите проект: `npm start`

# Файлы проекта

Имена пользователей хранятся в файле users.json. Там же хранятся их сохранённые запросы.

По умолчанию имеются следующие пользователи:

```
e-mail: boris227@mail.ru,
password: 12345678
```

```
e-mail: alexcomsss@rambler.com,
password: 666665
```
