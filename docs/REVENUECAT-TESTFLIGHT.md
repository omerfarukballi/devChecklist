# RevenueCat / TestFlight’ta Premium Çalışmıyorsa

TestFlight sürümünde “Satın al” veya premium açılmıyorsa aşağıdakileri sırayla kontrol et.

## 1. RevenueCat Dashboard (dashboard.revenuecat.com)

- **Project → Apps:** iOS app’in bundle ID’si `com.omerfarukballi.devchecklist` ile eşleşmeli.
- **Project → Entitlements:** En az bir entitlement olmalı; uygulama **identifier’ı tam olarak `premium`** kullanıyor. (Büyük/küçük harf önemli; farklı yazdıysan kodu veya dashboard’u buna göre düzelt.)
- **Project → Products:** App Store’daki In-App Purchase **product ID** burada tanımlı olmalı (örn. `lifetime` veya kullandığın ID).
- **Project → Offerings:** Bir offering oluşturulmuş ve **“Current”** olarak işaretlenmeli. Bu offering’e en az bir **package** eklenmeli ve yukarıdaki product’a bağlanmalı.

## 2. App Store Connect

- **My Apps → [Uygulaman] → Features → In-App Purchases:** İlgili ürün (örn. “Lifetime” non-consumable) **Ready to Submit** veya onaylı olmalı.
- **MISSING_METADATA hatası:** RevenueCat logunda "This product's status (MISSING_METADATA) requires you to take action in App Store Connect" görüyorsan, IAP ürününde **Reference Name, Price, Localization (Display Name + Description), Review Screenshot** gibi zorunlu alanları doldur. Sonra durumu **Ready to Submit** yap.
- **Agreements, Tax, and Banking:** Paid Applications sözleşmesi ve vergi/banka bilgileri tamamlanmış olmalı.
- **Bundle ID:** Xcode/Expo’daki bundle ID ile birebir aynı olmalı.

## 3. TestFlight’ta test ederken

- Cihazda **Ayarlar → App Store → Sandbox Account** ile bir **Sandbox test hesabı** ile giriş yap (normal Apple ID değil).
- Sandbox hesabı: [App Store Connect → Users and Access → Sandbox → Testers](https://appstoreconnect.apple.com/access/users) üzerinden oluşturulur.

## 4. “Ürünler yüklenemedi” / Offerings boş

- RevenueCat’te **Current Offering** ve **package** tanımlı mı kontrol et.
- Yeni eklediğin product/offering’in TestFlight’ta görünmesi bazen **birkaç saat** sürebilir.
- Uygulama **public (canlı) RevenueCat API key** ile mi çalışıyor kontrol et (kodda `appl_...` iOS public key kullanılıyor; doğru projeden alındığından emin ol).

## 5. Satın alma tamamlanıyor ama premium açılmıyor

- RevenueCat **Entitlements** sayfasında identifier **`premium`** (küçük harf) olan entitlement’a bu product bağlı mı bak.
- **Geri yükle** butonu ile dene; önceki satın alma varsa entitlement gelmeli.
- Gerekirse RevenueCat dashboard’da **Customers** bölümünden test kullanıcısını bulup entitlement’ın “Active” görünüp görünmediğine bak.

## Kodda kullanılanlar

- **Entitlement identifier:** `premium` (`src/store/purchaseStore.ts` → `PREMIUM_ENTITLEMENT_ID`).
- **iOS API key:** `appl_LBXaosMWJEbbrTkEHzfaKRJWeTm` (RevenueCat projesindeki iOS public key ile aynı olmalı).

Bu listeyi tamamladıktan sonra yeni bir build alıp TestFlight’ta tekrar dene.
