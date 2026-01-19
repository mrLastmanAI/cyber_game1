# Game Assets

Place your game image files in this directory with the following names:

## Required Files:

1. **player.png** - Cyberpunk runner character (recommended size: 64x64 or 128x128 pixels)
2. **platform.png** - Platform sprite (recommended size: 200x40 or larger)
3. **spike.png** - Spike obstacle (recommended size: 64x64 or 128x128 pixels)
4. **laser.png** - Vertical laser beam (recommended size: 32x128 or 64x256 pixels)
5. **drone.png** - Flying drone enemy (recommended size: 64x64 or 128x128 pixels)
6. **background.png** - Cyberpunk city background (recommended size: 1920x1080 or larger)

## Important Notes:

- All sprites (except background) should have **transparent backgrounds** (PNG format)
- Background should be **opaque** (no transparency)
- Use **pixel art style** with neon colors (cyan, magenta, pink, purple)
- Files must be named exactly as listed above (lowercase, .png extension)
- This folder is in `public/` directory - files here are copied directly to build output

## After adding images:

1. Run `npm run build` to rebuild the project
2. Run `npx cap sync` to sync with Android
3. Rebuild APK in Android Studio
