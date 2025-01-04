import { useGarmin } from '@/hooks/useGarmin'
import { LogOut } from '@tamagui/lucide-icons'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, ScrollView } from 'tamagui'

export default function TabTwoScreen() {
  const { garminClient } = useGarmin()

  const logout = () => {
    garminClient?.logout()
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
      </ScrollView>
    </SafeAreaView>
  )
}
