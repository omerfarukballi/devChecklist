import { I18n } from 'i18n-js';

const en = {
  welcome: 'Welcome',
  projects: 'Projects',
  settings: 'Settings',
  archive: 'Archive',
  notes: 'Project Notes',

  // Language pick (first launch)
  chooseLanguage: 'Choose language',
  languageSubtitle: 'You can change this later in settings.',
  turkish: 'Türkçe',
  english: 'English',

  // Onboarding
  onboardingWelcomeTitle: "Welcome to\nDevChecklist",
  onboardingWelcomeSubtitle: 'Your post-launch strategy system. Know what to do after you ship.',
  onboardingWelcomeTip1: 'Built something? The real work starts after launch',
  onboardingWelcomeTip2: 'Growth, retention, monetization — in one place',
  onboardingWelcomeTip3: 'Local-first. Your data stays on your device',

  onboardingStrategyTitle: 'Strategy Builder',
  onboardingStrategySubtitle: 'Answer a few questions. We build your execution plan.',
  onboardingStrategyTip1: 'What you built, stage, budget, focus area',
  onboardingStrategyTip2: 'Phases: Just launched → 0–100 → 100–1K → Growth…',
  onboardingStrategyTip3: 'Action list tailored to each phase',

  onboardingExecuteTitle: 'Execution board',
  onboardingExecuteSubtitle: 'Actions grouped by phase and domain. Swipe to complete.',
  onboardingExecuteTip1: 'Phase blocks (e.g. Just launched, 0–100 users)',
  onboardingExecuteTip2: 'Swipe RIGHT → Mark done',
  onboardingExecuteTip3: 'Focus mode for deep work',

  onboardingDashboardTitle: 'Dashboard & add phase',
  onboardingDashboardSubtitle: 'Track progress. Add next phase or pick any phase.',
  onboardingDashboardTip1: '"Add next: [Phase]" — adds that phase’s actions',
  onboardingDashboardTip2: '"Add phase" — choose any phase to add',
  onboardingDashboardTip3: 'Velocity, bottleneck and risk alerts in one view',

  onboardingTipsTitle: "You're in control",
  onboardingTipsSubtitle: 'One dashboard. Only what matters now.',
  onboardingTipsTip1: 'Weekly completed & bottleneck area',
  onboardingTipsTip2: 'Stage-based risk alerts',
  onboardingTipsTip3: 'Legacy project checklists still available',

  next: 'Next',
  skip: 'Skip',
  letsGo: "Let's Go!",

  // Empty state (no strategy profile)
  emptyStateLabel: 'Post-launch strategy',
  emptyStateTitle: 'Create your first project',
  emptyStateSubtitle: 'Answer a few questions in the Strategy Builder and get your phases and action plan ready.',
  emptyStateStep1: 'Project + stage + focus area',
  emptyStateStep2: 'Action list by phase',
  emptyStateStep3: 'Dashboard and tracking',
  emptyStateCta: 'Build strategy',

  // Dashboard
  addNext: 'Add next',
  addPhase: 'Add phase',
  added: 'Added',
  addedOneAction: '1 action added to "{{phase}}".',
  addedActions: '{{count}} actions added to "{{phase}}".',
  noNewActions: 'No new actions',
  allActionsAlreadyInPlan: 'All actions from "{{phase}}" are already in your plan.',

  // Execution board
  completeAll: 'Complete all',
  markDone: 'Mark done',

  // Focus
  focusMode: 'FOCUS MODE',
  completePhase: 'Complete phase',
  left: 'left',
  allDone: 'All Done! 🎉',
  allTasksComplete: "You've completed all tasks in this project.",

  // Common
  back: 'Back',
  cancel: 'Cancel',
  profileNotFound: 'Profile not found.',
};

const tr = {
  welcome: 'Hoş geldin',
  projects: 'Projeler',
  settings: 'Ayarlar',
  archive: 'Arşiv',
  notes: 'Proje Notları',

  chooseLanguage: 'Dil seçin',
  languageSubtitle: 'Bunu daha sonra ayarlardan değiştirebilirsiniz.',
  turkish: 'Türkçe',
  english: 'English',

  onboardingWelcomeTitle: "DevChecklist'e\nhoş geldin",
  onboardingWelcomeSubtitle: 'Post-launch strateji sistemi. Ürünü çıkardıktan sonra ne yapacağını netleştir.',
  onboardingWelcomeTip1: 'Bir şey yaptın; asıl iş lansman sonrası başlıyor',
  onboardingWelcomeTip2: 'Büyüme, retention, monetizasyon — tek yerde',
  onboardingWelcomeTip3: 'Veriler cihazında; local-first',

  onboardingStrategyTitle: 'Strateji Oluşturucu',
  onboardingStrategySubtitle: 'Birkaç soruya cevap ver; plan ve fazlar otomatik hazırlansın.',
  onboardingStrategyTip1: 'Ne yaptığın, aşama, bütçe, odak alanı',
  onboardingStrategyTip2: 'Fazlar: Just launched → 0–100 → 100–1K → Growth…',
  onboardingStrategyTip3: 'Her faz için sana özel aksiyon listesi',

  onboardingExecuteTitle: 'Yürütme panosu',
  onboardingExecuteSubtitle: 'Aksiyonlar faz ve alana göre gruplu. Kaydırarak tamamla.',
  onboardingExecuteTip1: 'Fazlara göre bloklar (örn. Just launched, 0–100 users)',
  onboardingExecuteTip2: 'Sağa kaydır → Tamamlandı',
  onboardingExecuteTip3: 'Focus modu ile derinlemesine çalış',

  onboardingDashboardTitle: 'Dashboard & faz ekleme',
  onboardingDashboardSubtitle: 'İlerlemeyi takip et; yeni faz ekle veya sıradaki fazı plana ekle.',
  onboardingDashboardTip1: '"Add next: [Faz]" — sıradaki fazın aksiyonlarını ekler',
  onboardingDashboardTip2: '"Add phase" — istediğin fazı seçip aksiyonları ekle',
  onboardingDashboardTip3: 'Hız, bottleneck ve risk uyarıları tek ekranda',

  onboardingTipsTitle: 'Sen yönetiyorsun',
  onboardingTipsSubtitle: 'Tek dashboard. Sadece şu an önemli olanlar.',
  onboardingTipsTip1: 'Haftalık tamamlanan & bottleneck alanı',
  onboardingTipsTip2: 'Aşamaya göre risk uyarıları',
  onboardingTipsTip3: 'Eski proje checklist\'leri de erişilebilir',

  next: 'İleri',
  skip: 'Atla',
  letsGo: 'Başla',

  emptyStateLabel: 'Lansman sonrası strateji',
  emptyStateTitle: 'İlk projeni oluştur',
  emptyStateSubtitle: 'Strateji Oluşturucu ile birkaç soruya cevap ver; sana özel fazlar ve aksiyon planı otomatik hazırlansın.',
  emptyStateStep1: 'Proje + aşama + odak alanı',
  emptyStateStep2: 'Fazlara göre aksiyon listesi',
  emptyStateStep3: 'Dashboard ve takip',
  emptyStateCta: 'Strateji oluştur',

  addNext: 'Sıradakini ekle',
  addPhase: 'Faz ekle',
  added: 'Eklendi',
  addedOneAction: '1 aksiyon "{{phase}}" fazına eklendi.',
  addedActions: '{{count}} aksiyon "{{phase}}" fazına eklendi.',
  noNewActions: 'Yeni aksiyon yok',
  allActionsAlreadyInPlan: '"{{phase}}" fazındaki tüm aksiyonlar zaten planda.',

  completeAll: 'Tamamla',
  markDone: 'Tamamla',

  focusMode: 'ODAK MODU',
  completePhase: 'Fazı tamamla',
  left: 'kaldı',
  allDone: 'Hepsi tamam! 🎉',
  allTasksComplete: 'Bu projedeki tüm görevleri tamamladın.',

  back: 'Geri',
  cancel: 'İptal',
  profileNotFound: 'Profil bulunamadı.',
};

const i18n = new I18n({ en, tr });
i18n.enableFallback = true;
// Locale is set by localeStore after user picks (or defaults to 'en' until then)
i18n.locale = 'en';

export default i18n;
