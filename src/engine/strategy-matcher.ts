import type {
  ProductDNA,
  FounderState,
  Constraints,
  LifecycleStage,
  BottleneckType,
  StrategicAction,
  CoreMetric,
  StrategyTemplate,
} from '../types/founderOS';
import { matchTemplate } from './strategy-templates';

interface MatcherInput {
  dna: ProductDNA;
  founder: FounderState;
  constraints: Constraints;
  stage: LifecycleStage;
  bottleneck: BottleneckType;
  locale: string;
}

function L(input: { locale: string }, en: string, tr: string): string {
  return input.locale === 'tr' ? tr : en;
}

// ─── Immediate Actions by Bottleneck × Context ─────────────────

const BOTTLENECK_ACTIONS: Record<BottleneckType, (input: MatcherInput) => StrategicAction[]> = {
  'acquisition': (input) => {
    const actions: StrategicAction[] = [];

    if (input.dna.acquisitionChannelFit === 'content' || input.constraints.budget < 500) {
      actions.push({
        title: L(input, 'Launch content-led acquisition', 'İçerik odaklı kullanıcı edinme başlat'),
        description: L(input, 'Build a content engine targeting your ICP pain points to drive organic traffic.', 'Organik trafik çekmek için ICP sorun noktalarını hedefleyen bir içerik motoru oluşturun.'),
        steps: [
          L(input, 'Identify top 10 keywords your audience searches', 'Hedef kitlenizin aradığı ilk 10 anahtar kelimeyi belirleyin'),
          L(input, 'Create 4 high-value articles or videos this month', 'Bu ay 4 yüksek değerli makale veya video oluşturun'),
          L(input, 'Set up analytics to track content-to-signup funnel', 'İçerikten kayıt sürecine kadar analitik kurun'),
        ],
      });
    } else {
      actions.push({
        title: L(input, 'Launch paid acquisition test', 'Ücretli edinme testi başlat'),
        description: L(input, 'Run structured paid ad tests to find your best-performing channel and creative.', 'En iyi performans gösteren kanal ve görseli bulmak için yapılandırılmış reklam testleri çalıştırın.'),
        steps: [
          L(input, 'Allocate test budget across 2 channels (Meta + one other)', 'Test bütçesini 2 kanala dağıtın (Meta + bir diğeri)'),
          L(input, 'Create 5 ad creative variations', '5 reklam görseli varyasyonu oluşturun'),
          L(input, 'Set kill criteria: CPA must be below LTV/3 within 7 days', 'Sonlandırma kriteri belirleyin: EBM 7 gün içinde YBD/3\'ün altında olmalı'),
        ],
      });
    }

    if (input.dna.viralityPotential !== 'none') {
      actions.push({
        title: L(input, 'Activate viral loop', 'Viral döngüyü aktifleştir'),
        description: L(input, 'Build and measure a referral or sharing mechanism into the core product flow.', 'Temel ürün akışına bir yönlendirme veya paylaşım mekanizması ekleyin ve ölçümleyin.'),
        steps: [
          L(input, 'Identify the natural share moment in user journey', 'Kullanıcı yolculuğundaki doğal paylaşım anını belirleyin'),
          L(input, 'Add share/invite CTA at that moment', 'O anda paylaş/davet et düğmesi ekleyin'),
          L(input, 'Track K-factor weekly', 'K-faktörünü haftalık takip edin'),
        ],
      });
    } else {
      actions.push({
        title: L(input, 'Build distribution partnerships', 'Dağıtım ortaklıkları kur'),
        description: L(input, 'Identify and engage 5 potential distribution partners in your space.', 'Alanınızda 5 potansiyel dağıtım ortağı belirleyin ve iletişime geçin.'),
        steps: [
          L(input, 'List 10 communities, newsletters, or platforms where your ICP gathers', 'ICP\'nizin toplandığı 10 topluluk, bülten veya platform listeleyin'),
          L(input, 'Reach out to 5 with partnership proposals', '5 tanesine ortaklık teklifleriyle ulaşın'),
          L(input, 'Offer co-marketing or integration opportunities', 'Ortak pazarlama veya entegrasyon fırsatları sunun'),
        ],
      });
    }

    actions.push({
      title: L(input, 'Optimize conversion funnel', 'Dönüşüm hunisini optimize et'),
      description: L(input, 'Audit and improve every step from landing to activation.', 'Sayfadan aktivasyona kadar her adımı denetleyin ve iyileştirin.'),
      steps: [
        L(input, 'Map the full funnel: visit → signup → activation', 'Tam huniyi haritalayın: ziyaret → kayıt → aktivasyon'),
        L(input, 'Identify the biggest drop-off point', 'En büyük düşüş noktasını belirleyin'),
        L(input, 'Run one A/B test on the weakest step this week', 'Bu hafta en zayıf adımda bir A/B testi çalıştırın'),
      ],
    });

    return actions.slice(0, 3);
  },

  'activation': (input) => [
    {
      title: L(input, 'Reduce time-to-value', 'Değere ulaşma süresini kısalt'),
      description: L(input, 'Get users to their "aha moment" within the first session.', 'Kullanıcıları ilk oturumda "aha anı"na ulaştırın.'),
      steps: [
        L(input, 'Identify what action correlates with retention', 'Elde tutma ile ilişkili aksiyonu belirleyin'),
        L(input, 'Remove every friction point before that action', 'O aksiyondan önceki tüm sürtünme noktalarını kaldırın'),
        L(input, 'Add progressive onboarding guiding to that action', 'O aksiyona yönlendiren aşamalı onboarding ekleyin'),
      ],
    },
    {
      title: L(input, 'Implement activation tracking', 'Aktivasyon takibi uygula'),
      description: L(input, 'Define and measure your activation metric to understand what drives engagement.', 'Etkileşimi neyin tetiklediğini anlamak için aktivasyon metriğinizi tanımlayın ve ölçün.'),
      steps: [
        L(input, 'Define your activation event (first value moment)', 'Aktivasyon olayınızı tanımlayın (ilk değer anı)'),
        L(input, 'Set up event tracking and funnel analytics', 'Olay takibi ve huni analitiği kurun'),
        L(input, 'Segment users by activated vs. not — compare retention', 'Aktif vs. aktif olmayan kullanıcıları segmentleyin — elde tutmayı karşılaştırın'),
      ],
    },
    {
      title: input.dna.trustRequirement === 'high'
        ? L(input, 'Build trust during onboarding', 'Onboarding sırasında güven inşa et')
        : L(input, 'Simplify onboarding flow', 'Onboarding akışını basitleştir'),
      description: input.dna.trustRequirement === 'high'
        ? L(input, 'Add social proof and security signals to reduce anxiety during first use.', 'İlk kullanımda kaygıyı azaltmak için sosyal kanıt ve güvenlik sinyalleri ekleyin.')
        : L(input, 'Reduce steps and cognitive load in your signup and first-use experience.', 'Kayıt ve ilk kullanım deneyimindeki adımları ve bilişsel yükü azaltın.'),
      steps: input.dna.trustRequirement === 'high'
        ? [
            L(input, 'Add testimonials or trust badges to signup flow', 'Kayıt akışına referanslar veya güven rozetleri ekleyin'),
            L(input, 'Show security certifications and data policies', 'Güvenlik sertifikaları ve veri politikalarını gösterin'),
            L(input, 'Offer a guided demo or trial before requiring commitment', 'Taahhüt gerektirmeden önce rehberli demo veya deneme sunun'),
          ]
        : [
            L(input, 'Reduce signup form to essential fields only', 'Kayıt formunu yalnızca gerekli alanlara indirin'),
            L(input, 'Add skip option for non-critical steps', 'Kritik olmayan adımlar için atlama seçeneği ekleyin'),
            L(input, 'Show progress indicator during onboarding', 'Onboarding sırasında ilerleme göstergesi gösterin'),
          ],
    },
  ],

  'retention': (input) => [
    {
      title: L(input, 'Implement engagement loops', 'Etkileşim döngüleri uygula'),
      description: L(input, 'Create recurring reasons for users to return to the product.', 'Kullanıcıların ürüne tekrar dönmesi için düzenli nedenler yaratın.'),
      steps: [
        input.dna.engagementModel === 'daily-habit'
          ? L(input, 'Add streak mechanics with visual progress', 'Görsel ilerleme ile seri mekanikleri ekleyin')
          : L(input, 'Add weekly digest or recap emails', 'Haftalık özet veya geri bildirim e-postaları ekleyin'),
        L(input, 'Build notification system for re-engagement triggers', 'Yeniden etkileşim tetikleyicileri için bildirim sistemi kurun'),
        L(input, 'Create a "what you missed" experience for returning users', 'Geri dönen kullanıcılar için "kaçırdıklarınız" deneyimi oluşturun'),
      ],
    },
    {
      title: L(input, 'Analyze cohort retention curves', 'Kohort elde tutma eğrilerini analiz et'),
      description: L(input, 'Understand exactly where and why users drop off.', 'Kullanıcıların tam olarak nerede ve neden ayrıldığını anlayın.'),
      steps: [
        L(input, 'Build D1/D7/D30 retention cohort analysis', 'G1/G7/G30 elde tutma kohort analizi oluşturun'),
        L(input, 'Identify the "retention cliff" timeframe', '"Elde tutma uçurumu" zaman dilimini belirleyin'),
        L(input, 'Interview 5 churned users to understand why they left', 'Neden ayrıldıklarını anlamak için 5 kayıp kullanıcıyla görüşün'),
      ],
    },
    {
      title: L(input, 'Deepen product value', 'Ürün değerini derinleştir'),
      description: L(input, 'Make the product more valuable over time to increase switching costs.', 'Geçiş maliyetlerini artırmak için ürünü zamanla daha değerli hale getirin.'),
      steps: [
        L(input, 'Identify what data or history users accumulate', 'Kullanıcıların hangi veri veya geçmişi biriktirdiğini belirleyin'),
        L(input, 'Build features that leverage accumulated usage', 'Birikmiş kullanımdan yararlanan özellikler geliştirin'),
        L(input, 'Add personalization that improves with use', 'Kullanımla gelişen kişiselleştirme ekleyin'),
      ],
    },
  ],

  'monetization': (input) => {
    const actions: StrategicAction[] = [];

    if (input.dna.revenueModel === 'subscription' || input.dna.revenueModel === 'freemium') {
      actions.push({
        title: L(input, 'Optimize paywall conversion', 'Ödeme duvarı dönüşümünü optimize et'),
        description: L(input, 'Improve the conversion rate from free to paid users.', 'Ücretsiz kullanıcılardan ücretli kullanıcılara dönüşüm oranını artırın.'),
        steps: [
          L(input, 'A/B test paywall placement and messaging', 'Ödeme duvarı yerleşimini ve mesajını A/B test edin'),
          L(input, 'Add a limited-time trial of premium features', 'Premium özelliklerin sınırlı süreli denemesini ekleyin'),
          L(input, 'Show value comparison: free vs. paid side by side', 'Ücretsiz vs. ücretli karşılaştırmasını yan yana gösterin'),
        ],
      });
    } else if (input.dna.revenueModel === 'ads') {
      actions.push({
        title: L(input, 'Optimize ad revenue per session', 'Oturum başına reklam gelirini optimize et'),
        description: L(input, 'Increase ARPDAU through better ad placement and format mix.', 'Reklam format karışımı optimizasyonu, aracılık ve oturum uzunluğu artışıyla ARPDAU\'yu artırın.'),
        steps: [
          L(input, 'Test rewarded video placement at natural break points', 'Doğal mola noktalarında ödüllü video yerleşimini test edin'),
          L(input, 'Optimize interstitial frequency without hurting retention', 'Elde tutmaya zarar vermeden arayer reklam sıklığını optimize edin'),
          L(input, 'A/B test ad mediation waterfall configuration', 'Reklam aracılık şelale yapılandırmasını A/B test edin'),
        ],
      });
    } else {
      actions.push({
        title: L(input, 'Validate willingness to pay', 'Ödeme istekliliğini doğrula'),
        description: L(input, 'Test pricing and packaging to find the revenue-maximizing configuration.', 'Geliri en üst düzeye çıkaracak yapılandırmayı bulmak için fiyatlandırma ve paketlemeyi test edin.'),
        steps: [
          L(input, 'Run a pricing survey or Van Westendorp analysis', 'Fiyatlandırma anketi veya Van Westendorp analizi çalıştırın'),
          L(input, 'Test 2-3 price points with real users', 'Gerçek kullanıcılarla 2-3 fiyat noktasını test edin'),
          L(input, 'Measure conversion rate at each price point', 'Her fiyat noktasında dönüşüm oranını ölçün'),
        ],
      });
    }

    actions.push({
      title: L(input, 'Build expansion revenue path', 'Genişleme geliri yolu kur'),
      description: L(input, 'Create mechanisms for existing customers to spend more over time.', 'Mevcut müşterilerin zamanla daha fazla harcaması için mekanizmalar oluşturun.'),
      steps: [
        L(input, 'Identify usage-based upgrade triggers', 'Kullanıma dayalı yükseltme tetikleyicilerini belirleyin'),
        L(input, 'Design premium tier with clear value differentiation', 'Net değer farklılaşmasına sahip premium katman tasarlayın'),
        L(input, 'Set up expansion revenue tracking', 'Genişleme geliri takibini kurun'),
      ],
    });

    actions.push({
      title: L(input, 'Reduce revenue churn', 'Gelir kaybını azalt'),
      description: L(input, 'Prevent paying users from canceling or downgrading.', 'Ödeme yapan kullanıcıların iptal etmesini veya düşürmesini önleyin.'),
      steps: [
        L(input, 'Implement cancellation flow with save offers', 'Kurtarma teklifleriyle iptal akışı uygulayın'),
        L(input, 'Add payment failure recovery (dunning)', 'Ödeme hatası kurtarma (ihtar) ekleyin'),
        L(input, 'Build usage reports showing ROI to customers', 'Müşterilere yatırım getirisi gösteren kullanım raporları oluşturun'),
      ],
    });

    return actions.slice(0, 3);
  },

  'sales-process': (input) => [
    {
      title: L(input, 'Build repeatable sales playbook', 'Tekrarlanabilir satış rehberi oluştur'),
      description: L(input, 'Document and systematize your sales process for consistency and scalability.', 'Tutarlılık ve ölçeklenebilirlik için satış sürecinizi belgelendirin ve sistematize edin.'),
      steps: [
        L(input, 'Map your current sales process end-to-end', 'Mevcut satış sürecinizi uçtan uca haritalayın'),
        L(input, 'Identify the 3 most common objections and write responses', 'En yaygın 3 itirazı belirleyin ve yanıtlarını yazın'),
        L(input, 'Create sales collateral: one-pager, ROI calculator, case study', 'Satış materyalleri oluşturun: tek sayfa, yatırım getirisi hesaplayıcı, vaka çalışması'),
      ],
    },
    {
      title: L(input, 'Define and target ICP', 'ICP\'yi tanımla ve hedefle'),
      description: L(input, 'Narrow your ideal customer profile to focus sales efforts on highest-probability prospects.', 'Satış çabalarını en yüksek olasılıklı müşteri adaylarına odaklamak için ideal müşteri profilinizi daraltın.'),
      steps: [
        L(input, 'Analyze your best 5 customers for common traits', 'En iyi 5 müşterinizi ortak özellikler için analiz edin'),
        L(input, 'Build an ICP document with firmographics and pain points', 'Firmografik bilgiler ve sorun noktalarıyla ICP belgesi oluşturun'),
        L(input, 'Create a target account list of 50 ICP-matching companies', '50 ICP eşleşen şirketin hedef hesap listesini oluşturun'),
      ],
    },
    {
      title: L(input, 'Implement CRM and pipeline tracking', 'CRM ve pipeline takibi uygula'),
      description: L(input, 'Get visibility into your sales pipeline to forecast and optimize.', 'Tahmin ve optimizasyon için satış hattınıza görünürlük sağlayın.'),
      steps: [
        L(input, 'Set up CRM with deal stages matching your sales process', 'Satış sürecinize uygun aşamalarla CRM kurun'),
        L(input, 'Define stage entry/exit criteria', 'Aşama giriş/çıkış kriterlerini tanımlayın'),
        L(input, 'Review pipeline weekly and measure conversion rates per stage', 'Hattı haftalık inceleyin ve aşama başına dönüşüm oranlarını ölçün'),
      ],
    },
  ],

  'product-market-fit': (input) => [
    {
      title: L(input, 'Run rapid validation experiments', 'Hızlı doğrulama deneyleri çalıştır'),
      description: L(input, 'Test your core value proposition with real users before investing in scaling.', 'Ölçeklendirmeye yatırım yapmadan önce temel değer önerinizi gerçek kullanıcılarla test edin.'),
      steps: [
        L(input, 'Define your riskiest assumption', 'En riskli varsayımınızı tanımlayın'),
        L(input, 'Design a 1-week experiment to test it', 'Test etmek için 1 haftalık bir deney tasarlayın'),
        L(input, 'Set pass/fail criteria before running the experiment', 'Deneyi çalıştırmadan önce geçme/kalma kriterlerini belirleyin'),
      ],
    },
    {
      title: L(input, 'Talk to 20 potential users', '20 potansiyel kullanıcıyla konuşun'),
      description: L(input, 'Deep customer discovery to validate problem-solution fit.', 'Problem-çözüm uyumunu doğrulamak için derinlemesine müşteri keşfi.'),
      steps: [
        L(input, 'Recruit 20 potential users from your target segment', 'Hedef segmentinizden 20 potansiyel kullanıcı edinin'),
        L(input, 'Run 30-min problem interviews (do not pitch your solution)', '30 dakikalık problem görüşmeleri yapın (çözümünüzü sunmayın)'),
        L(input, 'Document patterns: top 3 pains, current alternatives, willingness to pay', 'Kalıpları belgeleyin: en önemli 3 sorun, mevcut alternatifler, ödeme istekliliği'),
      ],
    },
    {
      title: input.stage === 'idea-validation'
        ? L(input, 'Build a concierge MVP', 'Concierge MVP oluştur')
        : L(input, 'Measure PMF signals', 'PMF sinyallerini ölç'),
      description: input.stage === 'idea-validation'
        ? L(input, 'Deliver your value proposition manually before building the full product.', 'Tam ürünü geliştirmeden önce değer önerinizi manuel olarak sunun.')
        : L(input, 'Quantify whether you have product-market fit using established frameworks.', 'Yerleşik çerçeveler kullanarak ürün-pazar uyumunuz olup olmadığını nicelleştirin.'),
      steps: input.stage === 'idea-validation'
        ? [
            L(input, 'Identify 5 early users willing to try a manual version', 'Manuel versiyonu denemeye istekli 5 erken kullanıcı belirleyin'),
            L(input, 'Deliver the value manually for 2 weeks', 'Değeri 2 hafta boyunca manuel olarak sunun'),
            L(input, 'Measure willingness to pay and engagement', 'Ödeme istekliliğini ve etkileşimi ölçün'),
          ]
        : [
            L(input, 'Run Sean Ellis "how disappointed" survey (target > 40% "very disappointed")', 'Sean Ellis "ne kadar hayal kırıklığı" anketi çalıştırın (hedef > %40 "çok hayal kırıklığı")'),
            L(input, 'Measure organic referral rate', 'Organik yönlendirme oranını ölçün'),
            L(input, 'Track retention curves — PMF shows as flattening retention', 'Elde tutma eğrilerini izleyin — PMF düzleşen elde tutma olarak görünür'),
          ],
    },
  ],

  'distribution-access': (input) => [
    {
      title: L(input, 'Build owned audience', 'Kendi kitlenizi oluşturun'),
      description: L(input, 'Start building a direct relationship with your target audience.', 'Hedef kitlenizle doğrudan ilişki kurmaya başlayın.'),
      steps: [
        L(input, 'Launch a newsletter, community, or social presence in your niche', 'Nişinizde bir bülten, topluluk veya sosyal varlık başlatın'),
        L(input, 'Aim for 500 engaged subscribers in 60 days', '60 gün içinde 500 etkileşimli abone hedefleyin'),
        L(input, 'Share valuable content 3x per week, product updates 1x per week', 'Haftada 3 kez değerli içerik, haftada 1 kez ürün güncellemesi paylaşın'),
      ],
    },
    {
      title: L(input, 'Leverage existing platforms', 'Mevcut platformlardan yararlanın'),
      description: L(input, 'Go where your audience already is rather than building from scratch.', 'Sıfırdan inşa etmek yerine kitlenizin zaten olduğu yere gidin.'),
      steps: [
        L(input, 'List the top 5 platforms where your ICP spends time', 'ICP\'nizin zaman geçirdiği ilk 5 platformu listeleyin'),
        L(input, 'Create native content or integrations for 2 of them', 'Bunlardan 2\'si için yerel içerik veya entegrasyonlar oluşturun'),
        L(input, 'Track signup source to measure channel effectiveness', 'Kanal etkinliğini ölçmek için kayıt kaynağını takip edin'),
      ],
    },
    {
      title: input.dna.acquisitionChannelFit === 'app-store'
        ? L(input, 'Optimize app store presence', 'Uygulama mağazası varlığını optimize et')
        : L(input, 'Launch on aggregator platforms', 'Toplayıcı platformlarda yayınla'),
      description: input.dna.acquisitionChannelFit === 'app-store'
        ? L(input, 'Maximize organic discovery through ASO.', 'ASO ile organik keşfi maksimize edin.')
        : L(input, 'Get listed on relevant directories, marketplaces, and launch platforms.', 'İlgili dizinlere, pazaryerlerine ve lansman platformlarına katılın.'),
      steps: input.dna.acquisitionChannelFit === 'app-store'
        ? [
            L(input, 'Optimize title, subtitle, and keywords for top search terms', 'Başlık, alt başlık ve anahtar kelimeleri en çok aranan terimler için optimize edin'),
            L(input, 'Create 3 screenshot variations and A/B test', '3 ekran görüntüsü varyasyonu oluşturun ve A/B test edin'),
            L(input, 'Build a review generation strategy', 'İnceleme oluşturma stratejisi geliştirin'),
          ]
        : [
            L(input, 'Submit to Product Hunt, HackerNews, and relevant directories', 'Product Hunt, HackerNews ve ilgili dizinlere gönderin'),
            L(input, 'List on marketplace integrations if applicable', 'Varsa pazaryeri entegrasyonlarına katılın'),
            L(input, 'Create launch-day amplification plan', 'Lansman günü güçlendirme planı oluşturun'),
          ],
    },
  ],

  'burn-rate': (input) => [
    {
      title: L(input, 'Extend runway immediately', 'Pisti hemen uzat'),
      description: L(input, 'Take action to ensure you survive long enough to find product-market fit.', 'Ürün-pazar uyumunu bulacak kadar hayatta kalmayı garantilemek için harekete geçin.'),
      steps: [
        L(input, 'Cut all non-essential expenses this week', 'Bu hafta tüm gereksiz harcamaları kesin'),
        L(input, 'Identify revenue you can generate in 30 days', '30 gün içinde elde edebileceğiniz geliri belirleyin'),
        input.founder.availableCapital === 'none'
          ? L(input, 'Explore revenue-based financing or grants', 'Gelire dayalı finansman veya hibeler araştırın')
          : L(input, 'Consider bridge funding from existing investors', 'Mevcut yatırımcılardan köprü finansmanı düşünün'),
      ],
    },
    {
      title: L(input, 'Prioritize revenue over growth', 'Büyüme yerine gelire öncelik ver'),
      description: L(input, 'Shift focus from user growth to revenue generation until runway is stable.', 'Pist istikrarlı olana kadar odağı kullanıcı büyümesinden gelir elde etmeye kaydırın.'),
      steps: [
        L(input, 'Identify your fastest path to revenue', 'Gelire en hızlı yolunuzu belirleyin'),
        L(input, 'Launch a paid offering even if imperfect', 'Kusursuz olmasa bile ücretli bir teklif başlatın'),
        L(input, 'Set a 30-day revenue target and track daily', '30 günlük gelir hedefi belirleyin ve günlük takip edin'),
      ],
    },
    {
      title: L(input, 'Reduce scope to core', 'Kapsamı çekirdeğe indirin'),
      description: L(input, 'Cut features and initiatives that do not directly contribute to survival.', 'Hayatta kalmanıza doğrudan katkıda bulunmayan özellikleri ve girişimleri kesin.'),
      steps: [
        L(input, 'List all current initiatives and rank by revenue impact', 'Tüm mevcut girişimleri listeleyin ve gelir etkisine göre sıralayın'),
        L(input, 'Pause or kill the bottom 50%', 'Alt %50\'yi duraklatın veya sonlandırın'),
        L(input, 'Focus entire team on the 1-2 highest-impact activities', 'Tüm ekibi en yüksek etkili 1-2 aktiviteye odaklayın'),
      ],
    },
  ],

  'trust-barrier': (input) => [
    {
      title: L(input, 'Build social proof systematically', 'Sistematik sosyal kanıt oluştur'),
      description: L(input, 'Create a trust-building engine through reviews, testimonials, and case studies.', 'İncelemeler, referanslar ve vaka çalışmalarıyla güven oluşturma motoru yaratın.'),
      steps: [
        L(input, 'Collect 10 detailed customer testimonials', '10 ayrıntılı müşteri referansı toplayın'),
        L(input, 'Create 2 case studies with measurable outcomes', 'Ölçülebilir sonuçlarla 2 vaka çalışması oluşturun'),
        L(input, 'Display trust signals prominently on landing page and onboarding', 'Güven sinyallerini açılış sayfasında ve onboarding\'de belirgin şekilde gösterin'),
      ],
    },
    {
      title: input.dna.regulatoryRisk !== 'none'
        ? L(input, 'Address compliance requirements', 'Uyumluluk gereksinimlerini karşıla')
        : L(input, 'Establish credibility signals', 'Güvenilirlik sinyalleri oluştur'),
      description: input.dna.regulatoryRisk !== 'none'
        ? L(input, 'Meet regulatory requirements that your audience expects.', 'Hedef kitlenizin beklediği düzenleyici gereksinimleri karşılayın.')
        : L(input, 'Build the credibility markers your audience looks for before trusting a product.', 'Hedef kitlenizin bir ürüne güvenmeden önce aradığı güvenilirlik işaretlerini oluşturun.'),
      steps: input.dna.regulatoryRisk !== 'none'
        ? [
            L(input, 'Identify required certifications or compliance standards', 'Gerekli sertifikaları veya uyumluluk standartlarını belirleyin'),
            L(input, 'Create a compliance roadmap with timelines', 'Zaman çizelgeli uyumluluk yol haritası oluşturun'),
            L(input, 'Display compliance badges and policies prominently', 'Uyumluluk rozetlerini ve politikalarını belirgin şekilde gösterin'),
          ]
        : [
            L(input, 'Get endorsed by 3 recognized voices in your niche', 'Nişinizdeki 3 tanınmış isimden onay alın'),
            L(input, 'Publish transparent pricing and policies', 'Şeffaf fiyatlandırma ve politikalar yayınlayın'),
            L(input, 'Offer money-back guarantee or free trial to reduce risk', 'Riski azaltmak için para iade garantisi veya ücretsiz deneme sunun'),
          ],
    },
    {
      title: L(input, 'Reduce perceived risk for new users', 'Yeni kullanıcılar için algılanan riski azalt'),
      description: L(input, 'Lower the barrier to trying your product by minimizing commitment.', 'Taahhüdü en aza indirerek ürününüzü deneme engelini düşürün.'),
      steps: [
        L(input, 'Offer free trial or freemium tier', 'Ücretsiz deneme veya freemium katmanı sunun'),
        L(input, 'Add live chat or responsive support for new users', 'Yeni kullanıcılar için canlı sohbet veya duyarlı destek ekleyin'),
        L(input, 'Create detailed FAQ addressing top concerns', 'En önemli endişeleri ele alan ayrıntılı SSS oluşturun'),
      ],
    },
  ],
};

// ─── Long-Term Focus by Stage ──────────────────────────────────

function getLongTermFocus(input: MatcherInput, template: StrategyTemplate): StrategicAction {
  switch (input.stage) {
    case 'idea-validation':
      return {
        title: L(input, 'Achieve validated product-market fit', 'Doğrulanmış ürün-pazar uyumuna ulaş'),
        description: L(input,
          'Your long-term focus should be proving that a real market wants what you are building, before investing in growth.',
          'Uzun vadeli odağınız, büyümeye yatırım yapmadan önce gerçek bir pazarın ne geliştirdiğinizi istediğini kanıtlamak olmalı.'),
        steps: [
          L(input, 'Reach 40%+ "very disappointed" on Sean Ellis survey', 'Sean Ellis anketinde %40+ "çok hayal kırıklığı" seviyesine ulaşın'),
          L(input, 'Achieve organic word-of-mouth referrals', 'Organik ağızdan ağıza yönlendirmeler elde edin'),
          L(input, 'Demonstrate repeatable value delivery to 10+ users', '10+ kullanıcıya tekrarlanabilir değer sunumunu gösterin'),
        ],
      };
    case 'mvp-live':
      return {
        title: L(input, 'Reach activation-retention equilibrium', 'Aktivasyon-elde tutma dengesine ulaş'),
        description: L(input,
          'Focus on ensuring that users who arrive can activate and that a meaningful percentage return consistently.',
          'Gelen kullanıcıların aktifleşebildiğinden ve anlamlı bir yüzdesinin düzenli olarak geri döndüğünden emin olun.'),
        steps: [
          L(input, 'Achieve > 50% activation rate', '%50+ aktivasyon oranı elde edin'),
          L(input, 'Flatten the retention curve (D30 > 15%)', 'Elde tutma eğrisini düzleştirin (G30 > %15)'),
          L(input, 'Identify and double down on your highest-value user segment', 'En yüksek değerli kullanıcı segmentinizi belirleyin ve iki katına çıkın'),
        ],
      };
    case 'early-traction':
      return {
        title: L(input,
          `Build scalable ${template.distributionFocus.split('.')[0].toLowerCase()}`,
          `Ölçeklenebilir ${template.distributionFocus.split('.')[0].toLowerCase()} kur`),
        description: L(input,
          'Your long-term advantage will come from building a repeatable, scalable distribution channel aligned with your product DNA.',
          'Uzun vadeli avantajınız, ürün DNA\'nızla uyumlu tekrarlanabilir, ölçeklenebilir bir dağıtım kanalı kurmaktan gelecek.'),
        steps: [
          L(input, 'Identify the channel with best unit economics', 'En iyi birim ekonomisine sahip kanalı belirleyin'),
          L(input, 'Build processes to scale that channel 10x', 'O kanalı 10 katına çıkaracak süreçler oluşturun'),
          L(input, 'Start measuring CAC payback period', 'CAC geri ödeme süresini ölçmeye başlayın'),
        ],
      };
    case 'growth-optimization':
      return {
        title: L(input, 'Optimize unit economics for scale', 'Ölçek için birim ekonomilerini optimize et'),
        description: L(input,
          'Before scaling aggressively, ensure your unit economics (LTV:CAC, margins, payback period) are sustainable.',
          'Agresif ölçeklendirmeden önce birim ekonomilerinizin (YBD:EBM, marjlar, geri ödeme süresi) sürdürülebilir olduğundan emin olun.'),
        steps: [
          L(input, 'Achieve LTV:CAC > 3:1', 'YBD:EBM > 3:1 elde edin'),
          L(input, 'Reduce CAC payback to < 6 months', 'EBM geri ödemesini < 6 aya indirin'),
          L(input, 'Improve gross margins to > 70%', 'Brüt marjları > %70\'e çıkarın'),
        ],
      };
    case 'scaling':
      return {
        title: L(input, 'Build organizational scalability', 'Organizasyonel ölçeklenebilirlik kur'),
        description: L(input,
          'Your product scales but your team and processes need to scale with it. Build systems, not just features.',
          'Ürününüz ölçekleniyor ama ekibiniz ve süreçleriniz de onunla ölçeklenmeli. Özellikler değil sistemler kurun.'),
        steps: [
          L(input, 'Hire for the 2-3 roles that will unlock the next growth phase', 'Bir sonraki büyüme aşamasını açacak 2-3 pozisyon için işe alım yapın'),
          L(input, 'Document and systematize core processes', 'Temel süreçleri belgelendirin ve sistematize edin'),
          L(input, 'Build a data-driven decision culture', 'Veriye dayalı karar kültürü oluşturun'),
        ],
      };
  }
}

// ─── Distribution Priority ─────────────────────────────────────

function getDistributionPriority(input: MatcherInput): { priority: string; description: string } {
  if (input.dna.acquisitionChannelFit === 'viral' && input.dna.viralityPotential !== 'none') {
    return {
      priority: L(input, 'Viral / Referral', 'Viral / Yönlendirme'),
      description: L(input,
        'Your product has natural virality. Invest in referral mechanics and social sharing loops as your primary distribution channel.',
        'Ürününüz doğal viralliğe sahip. Birincil dağıtım kanalınız olarak yönlendirme mekanikleri ve sosyal paylaşım döngülerine yatırım yapın.'),
    };
  }
  if (input.dna.acquisitionChannelFit === 'app-store') {
    return {
      priority: L(input, 'App Store Optimization', 'Uygulama Mağazası Optimizasyonu'),
      description: L(input,
        'App store discovery is your primary channel. Invest heavily in ASO, ratings management, and featuring opportunities.',
        'Uygulama mağazası keşfi birincil kanalınız. ASO, puan yönetimi ve öne çıkarma fırsatlarına yoğun yatırım yapın.'),
    };
  }
  if (input.dna.acquisitionChannelFit === 'content') {
    return {
      priority: L(input, 'Content & SEO', 'İçerik ve SEO'),
      description: L(input,
        'Content marketing and SEO are your best-fit channels. Build a content engine targeting your ICP pain points.',
        'İçerik pazarlaması ve SEO en uygun kanallarınız. ICP sorun noktalarını hedefleyen bir içerik motoru kurun.'),
    };
  }
  if (input.dna.acquisitionChannelFit === 'outbound') {
    return {
      priority: L(input, 'Outbound Sales', 'Outbound Satış'),
      description: L(input,
        'Direct outbound to ICP accounts is your primary distribution motion. Build a structured outbound process.',
        'ICP hesaplarına doğrudan outbound, birincil dağıtım hareketiniz. Yapılandırılmış bir outbound süreci oluşturun.'),
    };
  }
  if (input.dna.acquisitionChannelFit === 'community') {
    return {
      priority: L(input, 'Community-Led Growth', 'Topluluk Odaklı Büyüme'),
      description: L(input,
        'Build and nurture a community around your product niche. Community members become your best acquisition channel.',
        'Ürün nişiniz etrafında bir topluluk kurun ve besleyin. Topluluk üyeleri en iyi edinme kanalınız olur.'),
    };
  }
  if (input.dna.acquisitionChannelFit === 'paid-ads' && input.constraints.budget >= 500) {
    return {
      priority: L(input, 'Paid Acquisition', 'Ücretli Edinme'),
      description: L(input,
        'Paid ads are your best-fit channel and you have budget to test. Focus on creative iteration and CPA optimization.',
        'Ücretli reklamlar en uygun kanalınız ve test bütçeniz var. Görsel iterasyonu ve EBM optimizasyonuna odaklanın.'),
    };
  }

  if (input.constraints.budget < 500) {
    return {
      priority: L(input, 'Organic & Community', 'Organik ve Topluluk'),
      description: L(input,
        'With limited budget, focus on organic channels: content, community, and partnerships. Build distribution before you need it.',
        'Sınırlı bütçeyle organik kanallara odaklanın: içerik, topluluk ve ortaklıklar. İhtiyaç duymadan önce dağıtım kurun.'),
    };
  }

  return {
    priority: L(input, 'Multi-Channel Testing', 'Çoklu Kanal Testi'),
    description: L(input,
      'Test 2-3 channels in parallel to find your best-fit distribution channel before committing resources.',
      'Kaynak ayırmadan önce en uygun dağıtım kanalınızı bulmak için paralel olarak 2-3 kanal test edin.'),
  };
}

// ─── Monetization Strategy ─────────────────────────────────────

function getMonetizationStrategy(input: MatcherInput): { strategy: string; description: string } {
  const { dna, founder, constraints } = input;

  if (dna.revenueModel === 'ads') {
    return {
      strategy: L(input, 'Ad Revenue Optimization', 'Reklam Geliri Optimizasyonu'),
      description: L(input,
        'Maximize ARPDAU through ad format mix optimization, mediation waterfall tuning, and session length extension. Layer rewarded video for engaged users.',
        'Reklam format karışımı optimizasyonu, aracılık şelale ayarı ve oturum uzunluğu uzatma ile ARPDAU\'yu maksimize edin. Etkileşimli kullanıcılar için ödüllü video katmanı ekleyin.'),
    };
  }
  if (dna.revenueModel === 'subscription') {
    if (dna.marketType === 'b2b') {
      return {
        strategy: L(input, 'B2B Subscription Growth', 'B2B Abonelik Büyümesi'),
        description: L(input,
          'Focus on annual plan conversion (better retention, cash flow), expansion revenue through usage growth, and reducing involuntary churn through payment recovery.',
          'Yıllık plan dönüşümüne (daha iyi elde tutma, nakit akışı), kullanım artışı yoluyla genişleme gelirine ve ödeme kurtarma ile istem dışı kaybı azaltmaya odaklanın.'),
      };
    }
    return {
      strategy: L(input, 'Consumer Subscription Optimization', 'Tüketici Abonelik Optimizasyonu'),
      description: L(input,
        'Optimize trial-to-paid conversion, reduce voluntary churn with cancellation save flows, and test pricing tiers to maximize ARPU.',
        'Deneme-ücretli dönüşümü optimize edin, iptal kurtarma akışlarıyla gönüllü kaybı azaltın ve ARPU\'yu maksimize etmek için fiyat katmanlarını test edin.'),
    };
  }
  if (dna.revenueModel === 'freemium') {
    return {
      strategy: L(input, 'Freemium Conversion Funnel', 'Freemium Dönüşüm Hunisi'),
      description: L(input,
        'Design clear value gates between free and paid tiers. Use in-product education to show premium value. Target 2-5% free-to-paid conversion.',
        'Ücretsiz ve ücretli katmanlar arasında net değer kapıları tasarlayın. Premium değeri göstermek için ürün içi eğitim kullanın. %2-5 ücretsizden ücretliye dönüşüm hedefleyin.'),
    };
  }
  if (dna.revenueModel === 'usage-based') {
    return {
      strategy: L(input, 'Usage-Based Revenue Growth', 'Kullanıma Dayalı Gelir Büyümesi'),
      description: L(input,
        'Maximize per-user usage through feature depth and integration support. Offer volume commitments with discounts to improve predictability.',
        'Özellik derinliği ve entegrasyon desteğiyle kullanıcı başına kullanımı maksimize edin. Öngörülebilirliği artırmak için indirimli hacim taahhütleri sunun.'),
    };
  }
  if (dna.revenueModel === 'enterprise') {
    return {
      strategy: L(input, 'Enterprise Deal Optimization', 'Kurumsal Anlaşma Optimizasyonu'),
      description: L(input,
        'Optimize ACV through value-based pricing. Build land-and-expand playbook. Focus on multi-year contracts for revenue predictability.',
        'Değere dayalı fiyatlandırma ile ortalama sözleşme değerini optimize edin. Genişle-ve-büyü rehberi oluşturun. Gelir öngörülebilirliği için çok yıllık sözleşmelere odaklanın.'),
    };
  }
  if (dna.revenueModel === 'iap') {
    return {
      strategy: L(input, 'In-App Purchase Optimization', 'Uygulama İçi Satın Alma Optimizasyonu'),
      description: L(input,
        'Optimize IAP placement at peak engagement moments. Balance consumable vs. permanent purchases. Test price points and bundle offers.',
        'En yüksek etkileşim anlarında uygulama içi satın alma yerleşimini optimize edin. Tüketilebilir ve kalıcı satın almaları dengeleyin. Fiyat noktalarını ve paket tekliflerini test edin.'),
    };
  }
  if (dna.revenueModel === 'one-time') {
    if (constraints.monthlyRunway < 6 || founder.riskTolerance === 'low') {
      return {
        strategy: L(input, 'One-Time with Upsell Path', 'Tek Seferlik + Ek Satış Yolu'),
        description: L(input,
          'Maximize initial purchase conversion. Build upsell or recurring revenue path (maintenance, add-ons, or premium support) to improve LTV.',
          'İlk satın alma dönüşümünü maksimize edin. YBD\'yi artırmak için ek satış veya tekrarlayan gelir yolu (bakım, eklentiler veya premium destek) oluşturun.'),
      };
    }
    return {
      strategy: L(input, 'One-Time Purchase Optimization', 'Tek Seferlik Satın Alma Optimizasyonu'),
      description: L(input,
        'Focus on conversion rate optimization and average order value. Consider subscription or add-on model for recurring revenue.',
        'Dönüşüm oranı optimizasyonu ve ortalama sipariş değerine odaklanın. Tekrarlayan gelir için abonelik veya eklenti modeli düşünün.'),
    };
  }

  return {
    strategy: L(input, 'Revenue Model Validation', 'Gelir Modeli Doğrulama'),
    description: L(input,
      'Test multiple monetization approaches to find the best fit for your product and audience.',
      'Ürününüz ve hedef kitleniz için en uygun olanı bulmak için birden fazla para kazanma yaklaşımını test edin.'),
  };
}

// ─── Core Metrics by Stage + Template ──────────────────────────

function getCoreMetrics(input: MatcherInput, template: StrategyTemplate): CoreMetric[] {
  const stageMetrics: CoreMetric[] = [];

  switch (input.stage) {
    case 'idea-validation':
      stageMetrics.push(
        {
          name: L(input, 'Problem Validation Score', 'Problem Doğrulama Puanı'),
          description: L(input, 'Percentage of interviews confirming the problem is real and painful', 'Problemin gerçek ve acı verici olduğunu doğrulayan görüşmelerin yüzdesi'),
          target: L(input, '> 70%', '> %70'),
        },
        {
          name: L(input, 'Sign-up Intent', 'Kayıt Niyeti'),
          description: L(input, 'Percentage of prospects who say they would pay or sign up', 'Ödeme yapacağını veya kaydolacağını söyleyen potansiyel müşterilerin yüzdesi'),
          target: L(input, '> 30%', '> %30'),
        },
      );
      break;
    case 'mvp-live':
      stageMetrics.push(
        {
          name: L(input, 'Activation Rate', 'Aktivasyon Oranı'),
          description: L(input, 'Percentage of signups who reach the core value moment', 'Temel değer anına ulaşan kayıtların yüzdesi'),
          target: L(input, '> 40%', '> %40'),
        },
        {
          name: L(input, 'Weekly Active Users', 'Haftalık Aktif Kullanıcılar'),
          description: L(input, 'Users engaging with the product weekly', 'Ürünle haftalık etkileşim kuran kullanıcılar'),
          target: L(input, 'Growing week-over-week', 'Haftadan haftaya büyüyen'),
        },
      );
      break;
    case 'early-traction':
      stageMetrics.push(
        {
          name: L(input, 'Growth Rate', 'Büyüme Oranı'),
          description: L(input, 'Week-over-week user or revenue growth', 'Haftadan haftaya kullanıcı veya gelir büyümesi'),
          target: L(input, '> 10% WoW', '> %10 HH'),
        },
        {
          name: L(input, 'CAC', 'EBM (Edinme Başına Maliyet)'),
          description: L(input, 'Cost to acquire one customer', 'Bir müşteri edinmenin maliyeti'),
          target: L(input, 'Decreasing trend', 'Düşüş trendi'),
        },
      );
      break;
    case 'growth-optimization':
      stageMetrics.push(
        {
          name: L(input, 'LTV:CAC Ratio', 'YBD:EBM Oranı'),
          description: L(input, 'Lifetime value relative to acquisition cost', 'Edinme maliyetine göre yaşam boyu değer'),
          target: '> 3:1',
        },
        {
          name: L(input, 'Payback Period', 'Geri Ödeme Süresi'),
          description: L(input, 'Months to recover CAC from revenue', 'EBM\'yi gelirden geri kazanma süre (ay)'),
          target: L(input, '< 6 months', '< 6 ay'),
        },
      );
      break;
    case 'scaling':
      stageMetrics.push(
        {
          name: L(input, 'Revenue Growth Rate', 'Gelir Büyüme Oranı'),
          description: L(input, 'Month-over-month revenue growth', 'Aydan aya gelir büyümesi'),
          target: L(input, '> 15% MoM', '> %15 AA'),
        },
        {
          name: L(input, 'Gross Margin', 'Brüt Marj'),
          description: L(input, 'Revenue minus cost of goods sold', 'Gelir eksi satılan malların maliyeti'),
          target: L(input, '> 70%', '> %70'),
        },
      );
      break;
  }

  const seen = new Set(stageMetrics.map((m) => m.name));
  for (const m of template.coreMetrics) {
    if (!seen.has(m.name) && stageMetrics.length < 6) {
      stageMetrics.push(m);
      seen.add(m.name);
    }
  }

  return stageMetrics;
}

// ─── Public API ────────────────────────────────────────────────

export interface StrategyMatchResult {
  immediateActions: [StrategicAction, StrategicAction, StrategicAction];
  longTermFocus: StrategicAction;
  coreMetrics: CoreMetric[];
  distributionPriority: string;
  distributionDescription: string;
  monetizationStrategy: string;
  monetizationDescription: string;
  matchedTemplate: StrategyTemplate;
}

export function matchStrategy(input: MatcherInput): StrategyMatchResult {
  const { best } = matchTemplate(input.dna);

  const actionFn = BOTTLENECK_ACTIONS[input.bottleneck];
  const rawActions = actionFn(input);
  while (rawActions.length < 3) {
    rawActions.push({
      title: L(input, 'Review and iterate', 'Gözden geçir ve yinele'),
      description: L(input, 'Assess the impact of your current actions and adjust based on data.', 'Mevcut aksiyonlarınızın etkisini değerlendirin ve verilere göre ayarlayın.'),
      steps: [
        L(input, 'Review key metrics from last week', 'Geçen haftanın temel metriklerini gözden geçirin'),
        L(input, 'Identify what worked and what did not', 'Neyin işe yaradığını ve neyin yaramadığını belirleyin'),
        L(input, 'Adjust priorities for next week', 'Gelecek hafta için öncelikleri ayarlayın'),
      ],
    });
  }
  const immediateActions = rawActions.slice(0, 3) as [StrategicAction, StrategicAction, StrategicAction];

  const longTermFocus = getLongTermFocus(input, best);
  const coreMetrics = getCoreMetrics(input, best);
  const dist = getDistributionPriority(input);
  const mon = getMonetizationStrategy(input);

  return {
    immediateActions,
    longTermFocus,
    coreMetrics,
    distributionPriority: dist.priority,
    distributionDescription: dist.description,
    monetizationStrategy: mon.strategy,
    monetizationDescription: mon.description,
    matchedTemplate: best,
  };
}
