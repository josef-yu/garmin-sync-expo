import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { TamaguiProvider } from '@tamagui/core'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import 'react-native-reanimated'

import { AuthGuard } from '@/components/AuthGuard'
import {
  HealthSyncProvider,
  useHealthSync,
} from '@/components/HealthSyncProvider'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useGarmin } from '@/hooks/useGarmin'
import { tamaguiConfig } from '@/theme/tamagui.config'

import * as SQLite from 'expo-sqlite'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { BackHandler, Platform } from 'react-native'
import { showToast } from '@/utils/toast'

import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import migrations from '@/drizzle/migrations'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

const expo = SQLite.openDatabaseSync('sync.db')
const db = drizzle(expo)

export type DatabaseInstance = typeof db

export function App() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })
  const { garminClient, isInitialized: isClientInitialized } = useGarmin()
  const { isInitialized } = useHealthSync()
  const { success, error } = useMigrations(db, migrations)

  useEffect(() => {
    if (loaded && isClientInitialized && isInitialized && success && !error) {
      SplashScreen.hideAsync()
    }
  }, [loaded, isClientInitialized, isInitialized, success])

  if (!loaded || !isClientInitialized || !isInitialized || !success) {
    return null
  }

  if (error) {
    console.log('Failed to run migrations', error.message)
    showToast('Failed to migrate schema changes to db')
    return null
  }

  return (
    <>
      {garminClient && (
        <AuthGuard garminClient={garminClient}>
          <Stack>
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </AuthGuard>
      )}
    </>
  )
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const isAndroid = Platform.OS === 'android'

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (!isAndroid) {
      console.log('This can only be run on android!')
      showToast('This can only be run on android!')
      timeout = setTimeout(() => BackHandler.exitApp(), 3000)
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isAndroid) {
    return null
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme!}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <HealthSyncProvider db={db}>
          <App />
        </HealthSyncProvider>
        <StatusBar style="auto" />
      </ThemeProvider>
    </TamaguiProvider>
  )
}
