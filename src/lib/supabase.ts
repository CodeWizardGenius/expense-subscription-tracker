import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { AppState, Platform } from 'react-native'
import 'react-native-url-polyfill/auto'

const supabaseUrl = 'https://balcdzxxyyenmfndotai.supabase.co'
const supabaseAnonKey = 'sb_publishable_Ccy4fbXhwdAS0mZ07crFrg_R48tnVNl'

const ExpoSecureStoreAdapter = {
    getItem: (key: string) => SecureStore.getItem(key),
    setItem: (key: string, value: string) => SecureStore.setItem(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        // React Native'de navigator.locks API'si yok.
        // Varsayılan fallback 0ms timeout ile uyarı üretiyor.
        // Bu basit lock fonksiyonu sorunu çözer.
        lock: async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
            return await fn();
        },
    },
})


// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
if (Platform.OS !== "web") {
    AppState.addEventListener('change', (state) => {
        if (state === 'active') {
            supabase.auth.startAutoRefresh()
        } else {
            supabase.auth.stopAutoRefresh()
        }
    })
}