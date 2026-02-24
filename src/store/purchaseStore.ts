import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const REVENUECAT_API_KEY_IOS = 'appl_LBXaosMWJEbbrTkEHzfaKRJWeTm';
const REVENUECAT_API_KEY_ANDROID = 'YOUR_REVENUECAT_API_KEY_ANDROID'; // User will replace

interface PurchaseStore {
    isPremium: boolean;
    isLoading: boolean;
    initRevenueCat: () => Promise<void>;
    purchasePremium: () => Promise<boolean>;
    restorePurchases: () => Promise<boolean>;
}

export const usePurchaseStore = create<PurchaseStore>()(
    persist(
        (set, get) => ({
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
                    set({ isPremium: !!customerInfo.entitlements.active['premium'], isLoading: false });
                    console.log('[RevenueCat] Init success. Premium:', !!customerInfo.entitlements.active['premium']);
                } catch (e: any) {
                    console.warn('[RevenueCat] Connection failed or native module missing:', e.message);
                    set({ isLoading: false });
                }
            },

            purchasePremium: async () => {
                set({ isLoading: true });
                try {
                    const offerings = await Purchases.getOfferings();
                    if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                        // We assume the first package is the lifetime premium for now
                        const { customerInfo } = await Purchases.purchasePackage(offerings.current.availablePackages[0]);
                        const isPremium = !!customerInfo.entitlements.active['premium'];
                        set({ isPremium });
                        return isPremium;
                    }
                    return false;
                } catch (e: any) {
                    if (!e.userCancelled) {
                        console.error('Purchase Error:', e);
                    }
                    return false;
                } finally {
                    set({ isLoading: false });
                }
            },

            restorePurchases: async () => {
                set({ isLoading: true });
                try {
                    const customerInfo = await Purchases.restorePurchases();
                    const isPremium = !!customerInfo.entitlements.active['premium'];
                    set({ isPremium });
                    return isPremium;
                } catch (e) {
                    console.error('Restore Error:', e);
                    return false;
                } finally {
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: 'purchase-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
