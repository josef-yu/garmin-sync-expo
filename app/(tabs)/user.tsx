import { useAuthContext } from '@/components/AuthGuard'
import { useHealthSync } from '@/components/HealthSyncProvider'
import { Delete, LogOut } from '@tamagui/lucide-icons'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, ScrollView } from 'tamagui'

export default function TabTwoScreen() {
  const auth = useAuthContext()
  const { clearDb } = useHealthSync()

  const logout = () => {
    auth?.garminClient?.logout()
    router.dismissTo('/login')
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 5 }}>
      <ScrollView width="100%" backgroundColor="$background" padding="$3">
        <Button
          onPress={logout}
          width="100%"
          marginTop="$3"
          textAlign="left"
          icon={<LogOut />}>
          Logout
        </Button>
        <Button
          onPress={clearDb}
          width="100%"
          marginTop="$3"
          textAlign="left"
          icon={<Delete />}>
          Clear local data
        </Button>
      </ScrollView>
    </SafeAreaView>
  )
}
