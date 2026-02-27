# Çıkış Öncesi Kontrol Listesi — Detaylı Rehber

Bu belge, uygulamayı kullanıcıya açmadan önce tamamlanması önerilen maddeleri **tek tek, uygulama adımlarıyla** açıklar. Her madde: neden gerekli, ne yapılacak, nereye eklenecek, teknik notlar.

---

## 1. Gizlilik Politikası (Privacy Policy)

### Neden gerekli
- **App Store** ve **Google Play** özellikle uygulama içi satın alma (IAP), analitik veya cihaz/kişi verisi kullanan uygulamalarda **Privacy Policy URL** ister. Eksikse inceleme reddedilebilir.
- **RevenueCat** satın alma ve abonelik bilgisi işler; kullanıcıya hangi verilerin toplandığı ve nerede kullanıldığının açıkça yazılı olması hem yasal hem güven açısından önemli.

### Ne yazılmalı (kısa özet)
- **Toplanan veriler:** Cihaz bilgisi, satın alma/abonelik durumu (RevenueCat), gerekirse uygulama kullanım verileri.
- **Amaç:** Ürün/strateji verileri cihazda (AsyncStorage); sunucuya kişisel veri gönderilmiyorsa bunu net yazın. RevenueCat için: satın alma doğrulama ve hesap yönetimi.
- **Saklama ve paylaşım:** Veriler nerede tutuluyor, üçüncü tarafla (RevenueCat, Apple/Google) paylaşılıyor mu.
- **Haklar:** Erişim, düzeltme, silme, şikayet (GDPR/KVKK uyumunda kısa başlık yeterli).
- **İletişim:** Politika ve veri konularında iletişim e-postası.

### Nerede yayınlanacak
- Metni **web’de** yayınlayın (kendi siteniz, Notion, GitHub Pages, vs.). **Sabit bir URL** olmalı (örn. `https://yoursite.com/privacy` veya `https://github.com/username/repo/blob/main/PRIVACY.md`).
- Bu URL’i hem **App Store Connect / Play Console** “Privacy Policy URL” alanına hem uygulama içinde kullanacaksınız.

### Uygulama içinde nerede
- **Ayarlar (Settings)** ekranına bir satır ekleyin: **“Gizlilik Politikası”** → tıklanınca `Linking.openURL(privacyPolicyUrl)` ile tarayıcıda açılır.
- İsteğe bağlı: İlk açılışta veya ilk satın alma denemesinden önce kısa bir bilgi metninde “Devam ederek [Gizlilik Politikası](link)’nı kabul etmiş olursunuz” denebilir.

### Teknik not
- `app.json` veya `app.config.js` içinde `extra.privacyPolicyUrl` tanımlayıp tüm uygulama genelinde kullanabilirsiniz.
- Expo: `expo-linking` ile `Linking.openURL(url)` kullanın; URL’in `https` olması gerekir.

---

## 2. İlk Kullanımda “Nasıl Çalışır?” Onboarding (2–3 ekran)

### Neden gerekli
- Yeni kullanıcı uygulamanın ne yaptığını ve ilk adımı (ürün ekle → DNA doldur → strateji gör) bilmezse hemen çıkabilir. Kısa bir “nasıl çalışır?” akışı dönüşüm ve elde tutmayı artırır.

### Ne gösterilecek (önerilen akış)
1. **Ekran 1:** “Ürününüzü tanımlayın” — Kısa cümle: Ürün bilgilerini giriyorsunuz, size özel strateji ve aksiyonlar üretiyoruz.
2. **Ekran 2:** “DNA’yı doldurun” — Pazar, kitle, gelir modeli vb. birkaç soru; cevaplar stratejiyi kişiselleştirir.
3. **Ekran 3:** “Aksiyonları alın” — Strateji panosunda acil aksiyonlar, metrikler ve uzun vadeli odak görünecek; ilk hedef “bir ürün ekleyip stratejiyi gör” olabilir.

Her ekranda ilerleme göstergesi (nokta veya adım sayısı) ve “Devam” / “Başla” butonu yeterli.

### Ne zaman gösterilecek
- **Sadece ilk açılışta:** Daha önce onboarding’i tamamlamamış kullanıcılar için (AsyncStorage’da `onboarding_completed: true` gibi bir flag).
- Ana sayfa (index) veya uygulama açılışında: Eğer `onboarding_completed` yoksa onboarding ekranlarına yönlendir; bittikten sonra flag’i yaz ve bir daha gösterme.

### Nereye eklenecek
- Yeni dosya: `app/onboarding.tsx` (veya `app/(tabs)/onboarding.tsx`). Expo Router ile bir ekran; 2–3 sayfa için state (useState ile sayfa indeksi) veya basit bir swiper kullanılabilir.
- `_layout.tsx` veya ana giriş noktasında: İlk render’da `onboarding_completed` kontrolü; yoksa `router.replace('/onboarding')` (veya Stack’te onboarding ekranı).

### Teknik not
- AsyncStorage key: `founder_os_onboarding_completed` veya mevcut bir “first launch” key’i ile tutarlı olun.
- Onboarding’den “Başla” ile çıkınca ana akışa (örn. index veya strategy-dashboard) yönlendirin.

---

## 3. İlk Kullanımda Tooltipler (First-Use Tooltips)

### Neden gerekli
- Kullanıcı arayüzü ilk kez gördüğünde “Nereden ürün eklerim?”, “Bu kart ne işe yarıyor?” gibi soruları tooltip’lerle yanıtlamak, desteğe gerek kalmadan öğrenmeyi hızlandırır ve karışıklığı azaltır.

### Ne gösterilecek (önerilen noktalar)
- **Ana sayfa / Dashboard:** “Ürün ekle” veya “Yeni strateji” butonu — “İlk adım: Buradan ürün ekleyin.”
- **Strateji kartları:** İlk aksiyon kartı — “Buradaki adımları tamamladıkça işaretleyebilirsiniz.”
- **Alt menü / Sekmeler:** Hangi sekmenin ne işe yaradığı (Strateji, Ayarlar, Focus vb.) — “Strateji önerileriniz burada.”
- **Premium / Kilit ikonu:** “Bu özellik premium üyelik gerektirir.”

Her tooltip: kısa metin (1–2 cümle) + “Tamam” veya “Anladım” ile kapanır. İsteğe bağlı “Bir daha gösterme” checkbox’ı.

### Ne zaman gösterilecek
- **Sadece ilk kullanımda** ve **ekran bazında:** Örn. `tooltip_shown_dashboard_add_product`, `tooltip_shown_strategy_card` gibi flag’ler (AsyncStorage). Bir tooltip bir kez gösterildiyse aynı kullanıcıda tekrar gösterilmez.
- Sıralama: Önce onboarding bittikten sonra ana ekrana gelince ilk tooltip; kullanıcı “Tamam” dedikçe sıradaki ekran/öğe için tooltip (aynı oturumda veya sonraki açılışta).

### Nasıl uygulanacak (teknik)
- **Yaklaşım 1 (önerilen):** Bir **TooltipProvider** (React context) + **Tooltip** bileşeni. Provider, hangi tooltip’lerin gösterildiğini (AsyncStorage) okur/yazar. Her hedef UI öğesi (örn. “Ürün ekle” butonu) bir `TooltipTrigger` veya `id` ile sarılır; Provider ilgili id için “henüz gösterilmedi” ise balon gösterir.
- **Yaklaşım 2:** Modal/overlay ile ekranın belirli bölgesini vurgulayıp (örn. yarı saydam arka plan + açık alan) üstte kısa metin. Kütüphane: `react-native-walkthrough-tooltip` veya benzeri; ya da sadece küçük bir Modal + konumlama.
- **Konum:** Tooltip, hedef bileşenin altında/üstünde veya ekran ortasında (modal) gösterilebilir. Mobilde parmak alanına dikkat edin; “Tamam” butonu rahat tıklanabilir olsun.

### Nereye eklenecek
- Yeni bileşen: `src/components/FirstUseTooltip.tsx` (veya `Tooltip.tsx`). Props: `id`, `message`, `children` (hedef view), `placement`.
- Storage key’leri: `founder_os_tooltip_${id}` (boolean veya `"shown"`).
- Kullanım: Ayarlar ekranında “Tooltip’leri sıfırla” (geliştirme/test için) isteğe bağlı eklenebilir.

### İçerik örnekleri (TR)
- Ürün ekle butonu: “İlk adım: Buradan yeni ürün ekleyip strateji oluşturabilirsiniz.”
- Strateji kartı: “Bu karttaki adımları tamamladıkça işaretleyebilirsiniz.”
- Premium kilit: “Bu özellik premium üyelik ile açılır.”

---

## 4. Uygulama İkonu ve Splash Ekranı

### Neden gerekli
- Varsayılan **Expo** ikonu ve splash ile mağazaya göndermek red sebebi olabilir. Kendi markanıza ait ikon ve açılış ekranı, uygulamanın ciddiye alınması ve mağaza kuralları için önemli.

### Gereksinimler
- **App icon:** 1024×1024 px (iOS), Android için adaptive icon (ön plan 1024×1024; arka plan renk veya görsel). Şeffaflık kullanmayın; köşeler sistem tarafından yuvarlanır.
- **Splash:** `app.json` içinde `splash.image` ve `splash.backgroundColor`. Genelde ortada logo, düz arka plan rengi. Farklı cihaz oranları için “contain” ile logo orantılı kalır.

### Nereye koyulacak
- `assets/icon.png` — Ana uygulama ikonu (1024×1024).
- `assets/splash-icon.png` (veya `splash.png`) — Splash’te gösterilecek logo/görsel.
- `assets/adaptive-icon.png` — Android adaptive icon ön plan (1024×1024); arka plan `app.json` → `android.adaptiveIcon.backgroundColor`.

### Teknik
- `app.json`: `expo.icon`, `expo.splash`, `expo.android.adaptiveIcon` yollarını bu dosyalara göre güncelleyin. Değişiklikten sonra `npx expo prebuild --clean` (veya EAS build) ile native projelerin güncellendiğinden emin olun.

---

## 5. Ayarlarda “Gizlilik Politikası” ve “Bize Ulaşın / Geri Bildirim”

### Neden gerekli
- Gizlilik politikasına **uygulama içinden** erişim hem mağaza incelemeleri hem kullanıcı güveni için beklenen bir şey. “Bize ulaşın” ise hata bildirimi ve geri bildirim için tek nokta sağlar.

### Gizlilik politikası
- Ayarlar ekranına bir liste öğesi: **“Gizlilik Politikası”**. Tıklanınca `Linking.openURL(privacyPolicyUrl)` ile dış tarayıcıda açar. URL’i `app.json` `extra` veya env’den alın.

### Bize ulaşın / Geri bildirim
- Ayarlar ekranına bir liste öğesi: **“Bize Ulaşın”** veya **“Geri Bildirim Gönder”**. Tıklanınca:
  - **Seçenek A:** `Linking.openURL('mailto:destek@example.com')` — Varsayılan e-posta istemcisi açılır.
  - **Seçenek B:** Basit bir form (e-posta + mesaj) ve kendi backend’inize veya Formspree/benzeri servise gönderim.
  - **Seçenek C:** Sadece e-posta adresini gösteren bir ekran veya iletişim sayfası linki.

### Nereye eklenecek
- Mevcut **Settings** ekranı (`app/settings.tsx`). Diğer ayar satırlarıyla aynı stilde iki yeni satır: “Gizlilik Politikası”, “Bize Ulaşın”. İkon olarak `shield-account` / `file-document-outline` ve `email-outline` kullanılabilir.

---

## Özet Tablo

| Madde | Zorunluluk | Nerede | Ana adım |
|-------|------------|--------|----------|
| Gizlilik politikası | Mağaza için pratikte zorunlu | Web URL + Ayarlar linki | Metni yaz, yayınla, URL’i ayarlara ve mağaza alanına ekle |
| Onboarding (2–3 ekran) | Önerilen | Yeni `onboarding` ekranı + _layout/index kontrolü | 2–3 sayfa tasarla, ilk açılışta göster, flag ile bir kez |
| İlk kullanım tooltip’leri | Önerilen | Tooltip bileşeni + Dashboard/Strateji/Ayarlar | Provider + id bazlı gösterim, AsyncStorage ile “gösterildi” takibi |
| App icon + Splash | Mağaza reddi riski | assets/ + app.json | 1024px ikon ve splash görseli, config güncelle |
| Ayarlar: Gizlilik + İletişim | Önerilen / beklenen | settings.tsx | İki satır: Politik linki aç, “Bize ulaşın” (mailto veya form) |

---

## Uygulama Sırası Önerisi

1. **Gizlilik politikası metnini** yazıp web’de yayınlayın; URL’i sabitleyin.
2. **App icon ve splash** asset’lerini ekleyip `app.json`’ı güncelleyin.
3. **Ayarlar** ekranına “Gizlilik Politikası” ve “Bize Ulaşın” satırlarını ekleyin; politikayı bu URL’den açın.
4. **Onboarding** ekranını (2–3 sayfa) ekleyin; ilk açılışta gösterin, flag ile tekrarlamayın.
5. **Tooltip** sistemini (provider + id + storage) kurun; dashboard ve strateji ekranında 2–3 kritik noktada ilk kullanım tooltip’lerini açın.

Bu sıra hem mağaza gereksinimlerini hem kullanıcı deneyimini adım adım tamamlamanıza yarar.
