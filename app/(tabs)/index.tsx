import { useHealthSync } from '@/components/HealthSyncProvider'
import { RefreshCcw } from '@tamagui/lucide-icons'
import { useState } from 'react'
import { SafeAreaView } from 'react-native'
import { Button, H2, ScrollView, Spinner, Text, XStack } from 'tamagui'

function NoPermissions() {
  return (
    <Text>
      No permissions granted to sync with health connect. Please add
      permissions.
    </Text>
  )
}

export default function HomeScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { permissions } = useHealthSync()

  const doAction = async (fn: () => Promise<void>) => {
    setIsSubmitting(true)

    await fn()

    setIsSubmitting(false)
  }

  const syncSteps = async () => {}

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 5 }}>
      <ScrollView width="100%" backgroundColor="$background" padding="$3">
        <H2>Sync</H2>
        {permissions && permissions.length > 0 ? (
          <>
            <Button
              onPress={() => doAction(syncSteps)}
              width="100%"
              marginTop="$3"
              textAlign="left"
              icon={isSubmitting ? () => <Spinner /> : <RefreshCcw />}>
              Sync Steps
            </Button>
            <XStack width="75%" justifyContent="center">
              <Text>Last sync</Text>
            </XStack>
          </>
        ) : (
          <NoPermissions />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
