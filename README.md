# 🎮 Cyber Runner - Cyberpunk Endless Platformer

Бесконечный платформер в киберпанк стилистике для Android.

## 🎯 Особенности

- ✅ **Endless Runner** - бесконечная процедурная генерация уровней
- 🏃 **Автоматический бег** - персонаж бежит вправо автоматически
- 🎮 **Простое управление** - тап по экрану = прыжок
- 💀 **Один удар = смерть** - хардкорный геймплей
- 🎨 **Пиксель-арт + неон** - киберпанк стилистика с неоновыми эффектами
- 📊 **Система скоров** - рекорды сохраняются локально
- 📱 **Горизонтальная ориентация** - для удобной игры на телефоне
- 🚫 **Без монетизации** - полностью бесплатная игра

## 🕹️ Геймплей

- **Персонаж**: Киберпанк бегун с неоновым свечением
- **Препятствия**: Шипы, лазеры, летающие дроны
- **Скор**: Рассчитывается по пройденному расстоянию
- **Цель**: Набрать максимальный рекорд

## 🛠️ Технологии

- **Phaser 3** - игровой движок
- **Vite** - сборщик проекта
- **Capacitor** - для упаковки в Android APK
- **JavaScript** - язык программирования

## 📦 Установка

### 1. Установить зависимости

```bash
npm install
```

### 2. Запустить в режиме разработки

```bash
npm run dev
```

Игра откроется в браузере по адресу `http://localhost:3000`

## 🏗️ Сборка для Android

### Шаг 1: Собрать веб-версию

```bash
npm run build
```

### Шаг 2: Инициализировать Capacitor Android проект

```bash
npx cap add android
```

### Шаг 3: Синхронизировать с Android

```bash
npx cap sync android
```

### Шаг 4: Открыть в Android Studio

```bash
npx cap open android
```

### Шаг 5: Создать APK в Android Studio

1. В Android Studio выберите **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. После сборки APK будет в `android/app/build/outputs/apk/debug/app-debug.apk`

### Шаг 6: Создать релизную версию для Play Market

1. **Создать keystore (если еще нет)**:

```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Настроить build.gradle** (`android/app/build.gradle`):

Добавьте перед `android {`:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Добавьте в `android {}`:

```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

3. **Создать файл `android/keystore.properties`**:

```properties
storeFile=/path/to/my-release-key.keystore
storePassword=YOUR_PASSWORD
keyAlias=my-key-alias
keyPassword=YOUR_PASSWORD
```

4. **Собрать релизный APK**:

```bash
cd android
./gradlew assembleRelease
```

Релизный APK будет в `android/app/build/outputs/apk/release/app-release.apk`

## 📱 Публикация в Google Play Store

### Требования для публикации:

1. **Google Play Console аккаунт** ($25 единоразово)
2. **Релизный AAB файл** (вместо APK для Play Store)
3. **Скриншоты** (минимум 2)
4. **Иконка приложения** (512x512 px)
5. **Feature Graphic** (1024x500 px)
6. **Описание** на русском и английском

### Создать AAB (Android App Bundle):

```bash
cd android
./gradlew bundleRelease
```

AAB файл будет в `android/app/build/outputs/bundle/release/app-release.aab`

### Шаги публикации:

1. Зайти на [Google Play Console](https://play.google.com/console)
2. Создать новое приложение
3. Заполнить информацию:
   - **Название**: Cyber Runner
   - **Описание**: Бесконечный киберпанк платформер...
   - **Категория**: Игры / Аркада
   - **Рейтинг контента**: Для всех
4. Загрузить AAB файл в раздел "Production"
5. Добавить скриншоты и графику
6. Отправить на проверку

## 🎨 Кастомизация

### Изменить цвета

В файле `src/scenes/GameScene.js`:

- `0x00ffff` - cyan (голубой неон)
- `0xff00ff` - magenta (розовый неон)
- `0xff0066` - pink (розовый)

### Изменить сложность

В `GameScene.js`:

```javascript
this.gameSpeed = 400; // Начальная скорость (меньше = легче)
gravity: { y: 2000 } // Гравитация (меньше = выше прыжки)
this.player.setVelocityY(-800); // Сила прыжка
```

### Изменить частоту препятствий

В методе `generateLevel()`:

```javascript
this.lastObstacleX += Phaser.Math.Between(300, 600); // Дистанция между препятствиями
```

## 📝 TODO для улучшения

- [ ] Добавить звуковые эффекты
- [ ] Добавить музыку
- [ ] Добавить больше типов препятствий
- [ ] Добавить power-ups (щиты, ускорение)
- [ ] Добавить анимации персонажа
- [ ] Добавить частицы при прыжке/смерти
- [ ] Добавить таблицу лидеров (онлайн)

## 📄 Лицензия

MIT License - можете использовать как угодно

## 🤝 Разработка

Создано с помощью Claude Code для публикации в Google Play Store.

---

**Наслаждайтесь игрой! 🎮✨**
