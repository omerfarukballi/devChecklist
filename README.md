# Founder OS – Product & Growth

Ürün ve büyüme stratejisi için kısa anket + kişiselleştirilmiş aksiyonlar sunan mobil uygulama.

- **Stack:** Expo (SDK 54), React Native, TypeScript, NativeWind (Tailwind), Zustand, RevenueCat (IAP).
- **Durum:** iOS TestFlight’ta; premium tek seferlik satın alma (RevenueCat) entegre. Veri tamamen cihazda (AsyncStorage).

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu (cache temiz) |
| `npm run ios` / `npm run android` | Yerel cihaz/simülatör |
| `npm run build:ios` | EAS remote iOS build |
| `npm run build:ios:local` | EAS local iOS build (Fastlane gerekir) |
| `npm run submit:ios` | Son EAS build’i TestFlight’a gönder |

## Proje yapısı

- `app/` — Expo Router ekranları (strategy-dashboard, configure, focus, settings).
- `src/` — store (purchase, theme, founderOS), engine (strategy-matcher, risk-scorer), components, i18n.
