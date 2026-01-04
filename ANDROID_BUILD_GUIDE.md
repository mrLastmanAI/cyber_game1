# 🤖 Android Build & Release Guide

Полное руководство по сборке и публикации игры в Google Play Store.

---

## 📋 Предварительная настройка

### 1. Установка требуемого ПО

**Необходимо установить**:
- [Android Studio](https://developer.android.com/studio) (последняя стабильная версия)
- Java JDK 11 или выше
- Node.js 16+ и npm

**Проверить установку**:
```bash
java -version
node -v
npm -v
```

---

## 🏗️ Локальная разработка

### Запустить игру в браузере

```bash
npm run dev
```

Откроется на `http://localhost:3000`

### Изменения в коде

После любых изменений в `src/`:

```bash
npm run build
npx cap sync android
```

---

## 📱 Сборка для Android

### Вариант 1: Debug APK (для тестирования)

#### Шаг 1: Собрать проект
```bash
npm run build
npx cap sync android
```

#### Шаг 2: Открыть в Android Studio
```bash
npx cap open android
```

#### Шаг 3: Собрать APK
В Android Studio:
1. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Дождаться завершения сборки
3. APK будет в: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Шаг 4: Установить на устройство
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

### Вариант 2: Release APK/AAB (для Play Store)

#### Шаг 1: Создать Keystore

**⚠️ ВАЖНО**: Сохраните keystore в безопасном месте! Без него невозможно обновлять приложение!

```bash
keytool -genkey -v -keystore cyber-runner-release.keystore -alias cyber-runner -keyalg RSA -keysize 2048 -validity 10000
```

**Запомните**:
- Пароль keystore
- Пароль key alias
- Путь к файлу .keystore

#### Шаг 2: Создать `keystore.properties`

Создайте файл `android/keystore.properties`:

```properties
storeFile=/absolute/path/to/cyber-runner-release.keystore
storePassword=ВАШ_ПАРОЛЬ_KEYSTORE
keyAlias=cyber-runner
keyPassword=ВАШ_ПАРОЛЬ_ALIAS
```

**⚠️ НЕ КОММИТЬТЕ этот файл в Git!** (уже в .gitignore)

#### Шаг 3: Обновить build.gradle

Откройте `android/app/build.gradle` и добавьте **ПЕРЕД** блоком `android {`:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Внутри блока `android {` добавьте:

```gradle
signingConfigs {
    release {
        if (keystorePropertiesFile.exists()) {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

#### Шаг 4: Собрать релизный AAB (для Play Store)

```bash
# 1. Собрать веб-версию
npm run build

# 2. Синхронизировать с Android
npx cap sync android

# 3. Перейти в папку android
cd android

# 4. Собрать AAB
./gradlew bundleRelease

# 5. AAB файл будет здесь:
# android/app/build/outputs/bundle/release/app-release.aab
```

#### Шаг 5: Собрать релизный APK (для прямой установки)

```bash
cd android
./gradlew assembleRelease

# APK будет в:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 🎨 Создание иконки приложения

### Требования:
- Размер: **512x512 пикселей**
- Формат: **PNG**
- Фон: **Непрозрачный** (для Play Store)
- Стиль: Киберпанк, неоновые цвета

### Инструменты для создания:

1. **Онлайн генераторы**:
   - [Icon Kitchen](https://icon.kitchen/)
   - [App Icon Generator](https://appicon.co/)

2. **Ручное создание**:
   - Создайте 512x512 PNG
   - Загрузите в [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)
   - Скачайте все размеры
   - Замените файлы в `android/app/src/main/res/mipmap-*/ic_launcher.png`

### Автоматическая замена иконки:

Если у вас есть `icon.png` (512x512):

1. Положите его в корень проекта как `icon.png`
2. Добавьте в `capacitor.config.json`:

```json
{
  "android": {
    "icon": {
      "source": "icon.png"
    }
  }
}
```

3. Запустите:
```bash
npx capacitor-assets generate
```

---

## 🧪 Тестирование перед публикацией

### Чеклист тестирования:

- [ ] Игра запускается без ошибок
- [ ] Управление работает (тап = прыжок)
- [ ] Персонаж бежит автоматически
- [ ] Препятствия генерируются
- [ ] Коллизии работают (смерть от касания)
- [ ] Скор увеличивается
- [ ] Рекорд сохраняется после перезапуска
- [ ] Экран Game Over показывается
- [ ] Перезапуск работает (тап после смерти)
- [ ] Игра работает в горизонтальной ориентации
- [ ] Нет вылетов при долгой игре (15+ минут)

### Тестирование на реальном устройстве:

```bash
# Включите Developer Options и USB Debugging на телефоне
adb devices

# Установите APK
adb install android/app/build/outputs/apk/release/app-release.apk

# Или через Android Studio: Run → Run 'app'
```

---

## 📤 Публикация в Google Play Store

### Шаг 1: Создать аккаунт разработчика

1. Перейти на [Google Play Console](https://play.google.com/console)
2. Оплатить регистрацию ($25 единоразово)
3. Заполнить профиль разработчика

### Шаг 2: Создать новое приложение

1. **Create app**
2. Заполнить:
   - App name: **Cyber Runner**
   - Default language: **Русский (Россия)**
   - App type: **Game**
   - Free/Paid: **Free**

### Шаг 3: Заполнить информацию о приложении

#### Store listing:
- **Short description** (80 символов): Из `PLAY_STORE_INFO.md`
- **Full description** (4000 символов): Из `PLAY_STORE_INFO.md`
- **App icon** (512x512): Ваша PNG иконка
- **Feature graphic** (1024x500): Создать баннер
- **Screenshots**: Минимум 2, рекомендуется 4-8

#### App content:
- **Privacy policy**: Можно не указывать (если нет сбора данных)
- **App access**: All functionality is available (открытый доступ)
- **Ads**: No ads
- **Target audience**: Определить возрастной рейтинг
- **News app**: No
- **COVID-19 contact tracing**: No
- **Data safety**: Заполнить что НЕ собираете данные

#### Content rating:
- Заполнить анкету IARC
- Выбрать "No" на все вопросы о насилии/взрослом контенте
- Получить рейтинг **E (Everyone)**

### Шаг 4: Загрузить AAB

1. **Production → Create new release**
2. **Upload** файл `app-release.aab`
3. Заполнить **Release notes** (что нового):

```
Версия 1.0.0:
- Первый релиз
- Бесконечный платформер в киберпанк стиле
- Простое управление (тап = прыжок)
- Система рекордов
```

4. **Save → Review release → Start rollout to Production**

### Шаг 5: Ожидание проверки

- Проверка занимает **от нескольких часов до 7 дней**
- Вы получите email с результатом
- При одобрении игра появится в Play Store через несколько часов

---

## 🔄 Обновление приложения

### При выпуске новой версии:

1. **Обновить версию** в `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 2      // Увеличить на 1
    versionName "1.1"  // Новый номер версии
}
```

2. **Собрать новый AAB**:
```bash
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
```

3. **Загрузить в Play Console**:
   - Production → Create new release
   - Upload новый AAB
   - Добавить release notes
   - Rollout

---

## 🐛 Решение проблем

### Ошибка: "APK not signed"
```bash
# Проверьте keystore.properties
cat android/keystore.properties

# Убедитесь что путь к keystore правильный
```

### Ошибка: "Build failed"
```bash
# Очистить кэш
cd android
./gradlew clean
./gradlew bundleRelease
```

### Ошибка: "INSTALL_FAILED"
```bash
# Удалить старую версию
adb uninstall com.cyberrunner.game

# Установить заново
adb install app-release.apk
```

### Игра не запускается на устройстве
- Проверьте минимальную версию Android (должна быть 5.1+)
- Проверьте логи: `adb logcat | grep CyberRunner`

---

## 📊 Размер приложения

**Ожидаемый размер**:
- AAB: ~3-5 MB
- APK: ~5-8 MB (после установки)

**Оптимизация размера**:
```bash
# Включить minification и shrinkResources в build.gradle (уже настроено)
```

---

## 🎯 Следующие шаги после публикации

1. **Получить URL приложения**:
   - `https://play.google.com/store/apps/details?id=com.cyberrunner.game`

2. **Мониторинг**:
   - Play Console → Statistics (установки, рейтинги)
   - Crashes & ANRs (ошибки приложения)

3. **Обновления**:
   - Следить за отзывами
   - Исправлять баги
   - Добавлять новые фичи

---

**Удачи с публикацией! 🚀**

Если возникнут вопросы - проверьте [официальную документацию Capacitor](https://capacitorjs.com/docs/android).
