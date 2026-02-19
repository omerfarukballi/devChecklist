# 🚀 Road to Launch: DevChecklist

Bu belge, **DevChecklist** uygulamasını App Store ve Google Play Store'da yayınlamadan önce tamamlamanız gereken adımları içerir. Mevcut kod tabanı incelendiğinde aşağıdaki eksikler tespit edilmiştir.

## 1. Backend ve Veri Saklama (Firebase Gerekli mi?)

**Durum:** Şu an uygulama **Local-First** mimarisindedir. Veriler kullanıcının cihazında (`AsyncStorage`) saklanır.
**Karar:**
*   ❌ **Firebase Kurulumu Şart Değil:** Eğer kullanıcıların verilerini bulutta yedeklemesini (Cloud Sync) veya farklı cihazlardan erişmesini *istemiyorsanız* Firebase kurmanıza gerek yok. Bu, "Gizlilik Odaklı (Privacy-First)" bir uygulama olarak pazarlanabilir.
*   ✅ **Öneri:** Şimdilik Firebase eklemeyin. Uygulamayı bu haliyle yayınlayıp, kullanıcı talebine göre ileride "Cloud Sync" özelliği ekleyebilirsiniz.

## 2. Gelir Modeli (RevenueCat) Ayarları

Kod tarafında entegrasyon yapılmış ancak Dashboard ayarlarının doğrulanması gerekiyor.

- [ ] **RevenueCat Dashboard:** [RevenueCat](https://app.revenuecat.com/) üzerinde bir proje oluşturun.
- [ ] **API Keys:**
    -   iOS API Key'i `src/store/purchaseStore.ts` dosyasına eklenmiş (`appl_...`). Bunun doğru proje olduğundan emin olun.
    -   **Android API Key Eksik:** `src/store/purchaseStore.ts` dosyasında `YOUR_REVENUECAT_API_KEY_ANDROID` yazan yere kendi key'inizi ekleyin.
- [ ] **Ürünler (Products):** App Store Connect ve Google Play Console'da "Lifetime Premium" (veya benzeri) bir **In-App Purchase** ürünü oluşturun.
- [ ] **Entitlements:** RevenueCat panelinde **"premium"** adında bir Entitlement oluşturun ve IAP ürününüzü buna bağlayın. (Kod bu ID'yi bekliyor: `customerInfo.entitlements.active['premium']`).
- [ ] **Offerings:** RevenueCat panelinde "Default" offering oluşturup içine paketinizi ekleyin.

## 3. Marka ve Görseller (Assets)

Uygulama şu an varsayılan Expo logosunu kullanıyor. Bunla yayınlarsanız reddedilirsiniz.

- [ ] **App Icon:** `assets/icon.png` dosyasını kendi logonuzla (1024x1024px) değiştirin.
- [ ] **Splash Screen:** `assets/splash-icon.png` dosyasını açılış ekranı tasarımınızla değiştirin.
- [ ] **Adaptive Icon (Android):** `assets/adaptive-icon.png` dosyasını Android standartlarına uygun olarak güncelleyin.
- [ ] **App Name:** `app.json` dosyasındaki `"name": "DevChecklist"` kısmının mağazada görünmesini istediğiniz isim olduğundan emin olun.

## 4. İçerik (Çok Önemli!)

Checklist şablonları şu an temel seviyede olabilir. Kullanıcıya "Premium" hissi vermek için içeriğin dolu olması şart.

- [x] **Checklist Genişletme:** Size sağlanan "AI Prompt"u kullanarak `src/data/checklistTemplates.ts` dosyasını zenginleştirin.
    -   *Kategoriler:* Game Dev (Unity/Unreal), DevOps (Docker/K8s detayları), AI/ML (LLM, RAG), Blockchain, IoT ve daha fazlası eklendi.
    -   *Detay Seviyesi:* Her maddenin "Nasıl yapılır?" (Code snippets, CLI commands) kısmı eklendi. Tüm 43 proje tipi kapsandı.

## 5. Mağaza Hazırlığı (Store Presence)

App Store Connect ve Google Play Console için gerekenler:

- [ ] **Privacy Policy:** Uygulamanız veri toplamadığı (Local-First) için basit bir "Veri toplamıyoruz" politikası yeterlidir. Bunu bir Notion sayfası veya GitHub Gist olarak yayınlayıp linkini mağazaya verin.
- [ ] **Support URL:** Kullanıcıların ulaşabileceği bir mail adresi veya form linki.
- [ ] **Screenshots:** Uygulamanın 6.5" (iPhone 11 Pro Max ve üzeri) ve 5.5" (iPhone 8 Plus) ekran görüntülerini alın.

## 6. Teknik Kontroller

- [ ] **Bundle Identifier:** `app.json` dosyasındaki `com.omerfarukballi.devchecklist` alanının benzersiz olduğundan ve Apple Developer hesabınızda Register edildiğinden emin olun.
- [ ] **Build Number:** Her yeni yüklemede `app.json` içindeki `ios.buildNumber` ve `android.versionCode` değerlerini artırmayı unutmayın (şu an 1).

## 7. Yayınlama (Deployment)

Hazır olduğunuzda terminalden şu komutlarla build alabilirsiniz (EAS CLI kurulu olmalı):

```bash
# iOS Build (App Store'a yüklemek için)
eas build --platform ios

# Android Build (Play Store'a yüklemek için - AAB formatı)
eas build --platform android
```

---

**Özet:** Uygulamanız teknik olarak sağlam bir temel üzerine kurulu (Zustand, Expo Router, NativeWind). En büyük eksiğiniz **İçerik Derinliği**, **Marka Görselleri** ve **RevenueCat Yapılandırması**. Bunları tamamladığınızda yayına hazırsınız! 🚀
