import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const REVENUECAT_API_KEY_IOS = 'appl_LBXaosMWJEbbrTkEHzfaKRJWeTm';
const REVENUECAT_API_KEY_ANDROID = 'YOUR_REVENUECAT_API_KEY_ANDROID'; // User will replace

/** RevenueCat entitlement identifier - must match exactly in RevenueCat dashboard (Project → Entitlements) */
const PREMIUM_ENTITLEMENT_ID = 'premium';

function isPremiumFromCustomerInfo(customerInfo: { entitlements: { active: Record<string, unknown> } }): boolean {
    const active = customerInfo.entitlements?.active ?? {};
    if (active[PREMIUM_ENTITLEMENT_ID]) return true;
    const key = Object.keys(active).find((k) => k.toLowerCase() === 'premium');
    if (key) return true;
    if (__DEV__ && Object.keys(active).length > 0) {
        console.log('[RevenueCat] Active entitlement ids:', Object.keys(active));
    }
    return false;
}

export type PurchaseResult = { success: true } | { success: false; errorKey?: 'products_unavailable' | 'purchase_failed' | 'restore_failed' };

interface PurchaseStore {
    isPremium: boolean;
    isLoading: boolean;
    initRevenueCat: () => Promise<void>;
    purchasePremium: () => Promise<PurchaseResult>;
    restorePurchases: () => Promise<PurchaseResult>;
}

export const usePurchaseStore = create<PurchaseStore>()(
    persist(
        (set) => ({
            isPremium: false,
            isLoading: false,

            initRevenueCat: async () => {
                set({ isLoading: true });
                const isExpoGo = Constants.appOwnership === 'expo';
                if (isExpoGo) {
                    set({ isLoading: false });
                    return;
                }
                try {
                    console.log('[RevenueCat] Initializing...');
                    if (Platform.OS === 'ios') {
                        Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS });
                    } else if (Platform.OS === 'android') {
                        Purchases.configure({ apiKey: REVENUECAT_API_KEY_ANDROID });
                    }

                    const customerInfo = await Purchases.getCustomerInfo();
                    const premium = isPremiumFromCustomerInfo(customerInfo);
                    set({ isPremium: premium, isLoading: false });
                    if (__DEV__) {
                        console.log('[RevenueCat] Init success. Premium:', premium, 'Entitlement ids:', Object.keys(customerInfo.entitlements?.active ?? {}));
                    }
                } catch (e: any) {
                    console.warn('[RevenueCat] Connection failed or native module missing:', e.message);
                    set({ isLoading: false });
                }
            },

            purchasePremium: async (): Promise<PurchaseResult> => {
                set({ isLoading: true });
                try {
                    const isExpoGo = Constants.appOwnership === 'expo';
                    if (isExpoGo) {
                        set({ isLoading: false });
                        return { success: false, errorKey: 'products_unavailable' };
                    }
                    if (Platform.OS === 'ios') {
                        Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS });
                    } else if (Platform.OS === 'android') {
                        Purchases.configure({ apiKey: REVENUECAT_API_KEY_ANDROID });
                    }
                    const offerings = await Purchases.getOfferings();
                    if (offerings.current == null || offerings.current.availablePackages.length === 0) {
                        console.warn('[RevenueCat] No current offering or packages. Check: RevenueCat Dashboard → Offerings (set Current), App Store Connect → IAP product Ready to Submit, same Bundle ID.');
                        set({ isLoading: false });
                        return { success: false, errorKey: 'products_unavailable' };
                    }
                    const { customerInfo } = await Purchases.purchasePackage(offerings.current.availablePackages[0]);
                    const isPremium = isPremiumFromCustomerInfo(customerInfo);
                    set({ isPremium });
                    if (__DEV__) {
                        console.log('[RevenueCat] After purchase. Premium:', isPremium, 'Entitlement ids:', Object.keys(customerInfo.entitlements?.active ?? {}));
                    }
                    set({ isLoading: false });
                    return { success: true };
                } catch (e: any) {
                    if (!e.userCancelled) {
                        console.error('Purchase Error:', e);
                    }
                    set({ isLoading: false });
                    return { success: false, ...(e?.userCancelled ? {} : { errorKey: 'purchase_failed' as const }) };
                }
            },

            restorePurchases: async (): Promise<PurchaseResult> => {
                set({ isLoading: true });
                try {
                    const isExpoGo = Constants.appOwnership === 'expo';
                    if (isExpoGo) {
                        set({ isLoading: false });
                        return { success: false, errorKey: 'restore_failed' };
                    }
                    if (Platform.OS === 'ios') {
                        Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS });
                    } else if (Platform.OS === 'android') {
                        Purchases.configure({ apiKey: REVENUECAT_API_KEY_ANDROID });
                    }
                    const customerInfo = await Purchases.restorePurchases();
                    const isPremium = isPremiumFromCustomerInfo(customerInfo);
                    set({ isPremium });
                    set({ isLoading: false });
                    return { success: true };
                } catch (e) {
                    console.error('Restore Error:', e);
                    set({ isLoading: false });
                    return { success: false, errorKey: 'restore_failed' };
                }
            },
        }),
        {
            name: 'purchase-storage',
            storage: createJSONStorage(() => AsyncStorage),
            merge: (persisted, current) => ({
                ...current,
                ...persisted,
                isPremium: (persisted as any)?.isPremium ?? false,
            }),
        }
    )
);
