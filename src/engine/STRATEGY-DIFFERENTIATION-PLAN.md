# Strateji Farklılaştırma Planı

## Amaç
Kullanıcının seçtiği **tüm opsiyonlara** göre benzersiz, birbirinden farklı öneriler üretmek. Çoklu seçim yapıldığında (örn. birden fazla hedef kitle, kanal veya niyet) daha zengin ve segmentlere özel tavsiyeler verilecek. Öneri sayısı sabit 12 madde veya 3 blok olmak zorunda değil; 2–5 aksiyon bloğu (değişken uzunluk) olabilir.

## Ayırt Edici Boyutlar
- **Stage:** idea-validation | mvp-live | early-traction | growth-optimization | scaling
- **Bottleneck:** acquisition | activation | retention | monetization | distribution-access | product-market-fit | sales-process | burn-rate | trust-barrier
- **DNA (tek/çoklu):** productFormat, platform[], revenueModel, marketType, userIntentType[], engagementModel, retentionComplexity, acquisitionChannelFit[], viralityPotential, trustRequirement, regulatoryRisk, audienceBehaviorType[], monetizationLatency, scalabilityPattern
- **Founder:** experienceLevel, timeCommitment, technicalDepth, availableCapital, riskTolerance
- **Constraints:** budget, distributionAccess, teamSize, monthlyRunway

## Tasarım İlkeleri
1. **Çoklu seçim → daha fazla aksiyon:** Örn. 2 kanal (content + community) seçildiyse, hem içerik hem topluluk için ayrı aksiyon blokları eklenir (tek “genel” yerine).
2. **Çoklu kitle → kitleye özel adımlar:** audienceBehaviorType [developers, small-business] ise, geliştiricilere ve küçük işletmelere özel adımlar veya ayrı bloklar üretilir.
3. **Değişken uzunluk:** immediateActions 2–5 blok olabilir; her zaman 3 değil. Minimum 2 (yeterli içerik), maksimum 5 (çok seçimde zenginlik).
4. **Dedupe:** Aynı başlık veya aynı ilk adım tekrarlanmaz; farklı kombinasyonlar mümkün olduğunca farklı metin üretir.
5. **Metinde segment/kanal adı:** “Hedef kitleniz için…” yerine “Geliştirici kitleniz için…” gibi seçime özel ifadeler kullanılır.

## Uygulama Adımları
1. **Tip:** `immediateActions` → `StrategicAction[]` (min 2, max 5).
2. **matchStrategy:** rawActions’ı başlığa göre dedupe et; 2–5 arası al; en az 2 olacak şekilde fallback ekle.
3. **Acquisition:** acquisitionChannelFit çoklu ise kanal başına 1 aksiyon (content, community, paid, app-store, viral); audienceBehaviorType çoklu ise kitleye özel adımlar veya ek blok (max 2 kitle).
4. **Retention:** userIntentType çoklu ise niyet başına engagement loop varyantı veya ayrı blok (max 2).
5. **Distribution-access:** audienceBehaviorType çoklu ise kitleye özel platform/adım seti.
6. **Diğer bottleneck’ler:** productFormat + platform + marketType kombinasyonlarında daha spesifik adım metinleri.

## Kontrol
- Farklı DNA/founder/constraints/stage kombinasyonları ile strateji üret; çıktıların birbirinden farklı olduğunu doğrula.
- Çoklu seçim (2 kanal, 2 kitle) ile tek seçim karşılaştır; çoklu seçimde daha fazla veya daha özelleşmiş aksiyon çıktığını doğrula.
