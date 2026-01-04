# ⚡ Быстрый старт - Cyber Runner

Минимальное руководство для начала работы.

---

## 🎮 Запустить игру локально (в браузере)

```bash
npm install
npm run dev
```

Откроется в браузере на `http://localhost:3000`

**Управление**: Клик мышкой или Space = прыжок

---

## 📱 Собрать APK для Android

### Вариант 1: Debug APK (для тестов)

```bash
# 1. Собрать проект
npm run build

# 2. Синхронизировать
npx cap sync android

# 3. Открыть Android Studio
npx cap open android

# 4. В Android Studio: Build → Build APK
```

APK будет в: `android/app/build/outputs/apk/debug/app-debug.apk`

### Вариант 2: Release APK (для публикации)

**Сначала создать keystore** (один раз):

```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias cyber-runner -keyalg RSA -keysize 2048 -validity 10000
```

**Создать файл** `android/keystore.properties`:

```properties
storeFile=/путь/к/my-release-key.keystore
storePassword=ваш_пароль
keyAlias=cyber-runner
keyPassword=ваш_пароль
```

**Обновить** `android/app/build.gradle` (см. ANDROID_BUILD_GUIDE.md)

**Собрать**:

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

Release APK в: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🏪 Подготовить для Google Play Store

```bash
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
```

AAB файл в: `android/app/build/outputs/bundle/release/app-release.aab`

Загрузить этот AAB в [Google Play Console](https://play.google.com/console)

---

## 🎨 Изменить игру

Все файлы игры в папке `src/`:

- **src/main.js** - конфигурация Phaser
- **src/scenes/GameScene.js** - вся логика игры

После изменений:

```bash
npm run build
npx cap sync android
```

---

## 📚 Полная документация

- **README.md** - Описание проекта
- **ANDROID_BUILD_GUIDE.md** - Подробное руководство по сборке
- **PLAY_STORE_INFO.md** - Материалы для Play Store

---

## ❓ Проблемы?

**Игра не запускается**:
```bash
npm install
npm run dev
```

**Ошибки при сборке Android**:
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

**Нет Android Studio**:
- Скачать: https://developer.android.com/studio

---

**Готово! Удачи! 🚀**
