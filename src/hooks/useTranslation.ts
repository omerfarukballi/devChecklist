import { useCallback } from 'react';
import { useLocaleStore } from '../store/localeStore';
import i18n from '../i18n';

/**
 * Her t() çağrısında store'dan locale okuyup i18n'e uygular — Türkçe/İngilizce kesin doğru çıkar.
 */
export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const t = useCallback(
    (key: string, options?: Record<string, unknown>) => {
      const loc = locale ?? 'en';
      i18n.locale = loc;
      return i18n.t(key, options);
    },
    [locale]
  );
  return { t, locale };
}
