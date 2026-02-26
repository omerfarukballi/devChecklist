# Build guide

Run EAS via **npx** (package name is `eas-cli`, not `eas`): `npx eas-cli build ...` or use scripts: `npm run build:ios` / `npm run build:ios:local`.

## iOS

### Local build (`npx eas-cli build --platform ios --local`)

EAS local iOS build requires **Fastlane** to be installed and on your `PATH`.

**Option A – Homebrew (recommended)**

1. Fix Homebrew permissions if needed:
   ```bash
   sudo chown -R $(whoami) /opt/homebrew /opt/homebrew/Cellar /opt/homebrew/Frameworks /opt/homebrew/bin /opt/homebrew/etc /opt/homebrew/include /opt/homebrew/lib /opt/homebrew/opt /opt/homebrew/sbin /opt/homebrew/share /opt/homebrew/var/homebrew/linked /opt/homebrew/var/homebrew/locks
   chmod u+w /opt/homebrew /opt/homebrew/Cellar /opt/homebrew/Frameworks /opt/homebrew/bin /opt/homebrew/etc /opt/homebrew/include /opt/homebrew/lib /opt/homebrew/opt /opt/homebrew/sbin /opt/homebrew/share /opt/homebrew/var/homebrew/linked /opt/homebrew/var/homebrew/locks
   ```
2. Install Fastlane:
   ```bash
   brew install fastlane
   ```
3. Run the build:
   ```bash
   npx eas-cli build --platform ios --local
   ```

**Option B – Ruby gem (user install)**

```bash
gem install fastlane --user-install
```

Then ensure your user gem bin is on `PATH`, for example in `~/.zshrc`:

```bash
export PATH="$HOME/.gem/ruby/$(ruby -e 'puts RUBY_VERSION')/bin:$PATH"
```

After that, run:

```bash
npx eas-cli build --platform ios --local
```

### Remote build (no Fastlane needed)

To build on EAS servers instead of your machine:

```bash
npx eas-cli build --platform ios
```

No local Fastlane or Xcode command-line tools are required; only an Expo account.

### If local build fails: "Distribution certificate hasn't been imported successfully"

**En sık neden:** Mac'te **Apple WWDR ara sertifikası** (Apple Worldwide Developer Relations CA G3) eksik. Bu sertifika olmadan dağıtım sertifikası güven zinciri tamamlanmıyor ve import sonrası doğrulama başarısız oluyor.

**Çözüm (önce bunu dene):**

1. Proje kökünden script'i çalıştır (Apple WWDR sertifikasını indirir ve keychain'e ekler):
   ```bash
   chmod +x scripts/fix-ios-keychain.sh && ./scripts/fix-ios-keychain.sh
   ```
2. Açılan Keychain Access penceresinde sertifikayı **login** veya **System** keychain'ine ekle.
3. **Terminal.app** (Cursor değil) açıp tekrar dene:
   ```bash
   cd /Users/omerfarukballi/Projects/devChecklist && npm run build:ios:local
   ```

**Manuel:** [Apple Certificate Authority](https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer) sayfasından `AppleWWDRCAG3.cer` indir, çift tıkla, Keychain Access'te login keychain'ine ekle.

**Diğer olası nedenler:**

- Keychain kilitli → Keychain Access'te "login" keychain'ini aç.
- Sertifika şifresi yanlış veya .p12 bozuk → [Expo Credentials](https://expo.dev) üzerinden sertifikayı kaldırıp doğru şifreyle yeniden yükle.
- Hâlâ olmuyorsa → Mac'i yeniden başlatıp tekrar dene; yoksa remote build kullan: `npx eas-cli build --platform ios`.

---

## TestFlight'a gönderme (Submit)

Build EAS'ta bittikten sonra (remote build) aynı build'i App Store Connect'e (TestFlight) yüklemek için:

**En son iOS build'ini gönder:**
```bash
npm run submit:ios
```
veya: `npx eas-cli submit --platform ios --latest --profile production`

İlk kez çalıştırıyorsan EAS, App Store Connect için kimlik isteyebilir (API Key veya Apple ID + app-specific password). [App Store Connect → Keys](https://appstoreconnect.apple.com/access/api) üzerinden API key oluşturabilirsin.

**Belirli bir build:** `npx eas-cli submit --platform ios --id <BUILD_ID> --profile production` (Build ID: expo.dev → Builds)

**Otomatik submit (build biter bitmez):** `npx eas-cli build --platform ios --profile production --auto-submit`

---

## Expo/EAS olmadan TestFlight'a gönderme

.ipa dosyasını Expo veya EAS kullanmadan, sadece Apple araçlarıyla yükleyebilirsin.

### 1. Transporter (Apple uygulaması, en kolay)

1. Mac’te **App Store**’dan **Transporter** uygulamasını indir (Apple’ın resmi aracı).
2. Transporter’ı aç, **Apple ID** ile giriş yap (App Store Connect’teki hesapla aynı).
3. .ipa dosyasını pencereye sürükleyip bırak veya **Deliver** ile seç (örn. `build-1772133754120.ipa`).
4. **Deliver**’a tıkla; yükleme App Store Connect’e gider, bir süre sonra build **TestFlight** sekmesinde görünür.

Expo/EAS hiç devreye girmez; sadece Apple sunucularına yükleme yapılır.

### 2. Terminal: `xcrun altool` (komut satırı)

Xcode komut satırı araçları yüklüyse (local build aldıysan zaten vardır):

```bash
xcrun altool --upload-app -f ./build-1772133754120.ipa -t ios -u "APPLE_ID_EMAIL" -p "APP_SPECIFIC_PASSWORD"
```

- **APPLE_ID_EMAIL:** App Store Connect’te kullandığın Apple ID.
- **APP_SPECIFIC_PASSWORD:** [appleid.apple.com](https://appleid.apple.com) → Sign-In and Security → App-Specific Passwords ile oluşturduğun şifre (normal Apple şifreni kullanma).

Şifreyi komutta göstermek istemezsen (güvenlik için):

```bash
xcrun altool --upload-app -f ./build-1772133754120.ipa -t ios -u "APPLE_ID_EMAIL" -p "@keychain:AC_PASSWORD"
```

Önce keychain’e kaydet: **Keychain Access** → **login** → **+** (yeni parola) → Name: `AC_PASSWORD`, Account: Apple ID, Password: app-specific password.

### Özet

| Yöntem | Expo/EAS | İnternet |
|--------|----------|----------|
| EAS submit (`npm run submit:ios` / `--path`) | Evet | Evet |
| **Transporter** | Hayır | Evet |
| **xcrun altool** | Hayır | Evet |

TestFlight’a ulaşmak için yükleme mutlaka Apple sunucularına gideceği için internet gerekir; “Expo olmadan” = EAS/Expo araçları kullanmıyorsun, Transporter veya `xcrun altool` yeterli.
