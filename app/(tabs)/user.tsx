import { useAuthContext } from '@/components/AuthGuard'
import { useHealthSync } from '@/components/HealthSyncProvider'
import { Delete, LogOut } from '@tamagui/lucide-icons'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Avatar,
  Button,
  Card,
  H4,
  Paragraph,
  ScrollView,
  SizableText,
  XStack,
  YStack,
} from 'tamagui'

function UserCard() {
  const auth = useAuthContext()
  const imageUrl = auth?.garminClient.userProfile?.profileImageUrlMedium
  const initials = auth?.garminClient.fullName
    .split(' ')
    .map(name => name[0])
    .join()

  return (
    <Card p="$2" elevate>
      <YStack w="100%" space>
        <XStack gap="$4" ai="center">
          <Avatar circular>
            {imageUrl ? (
              <>
                <Avatar.Image source={{ uri: imageUrl }} />
                <Avatar.Fallback backgroundColor="$gray10" />
              </>
            ) : (
              <Paragraph fontSize="$8" color="white" backgroundColor="$gray10">
                {initials}
              </Paragraph>
            )}
          </Avatar>
          <YStack>
            <H4>{auth?.garminClient.fullName}</H4>
            <SizableText theme="alt1">
              {auth?.garminClient.userProfile?.location}
            </SizableText>
          </YStack>
        </XStack>
      </YStack>
    </Card>
  )
}

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
        <UserCard />
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
