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
  const { permissions, lastSync, getLastSyncDate } = useHealthSync()

  const doAction = async (fn: () => Promise<void>) => {
    setIsSubmitting(true)

    await fn()

    await getLastSyncDate()

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
              {lastSync ? (
                <Text>
                  Last sync at{' '}
                  {lastSync.created_at?.toLocaleDateString('en-CA')} with data
                  from {lastSync.data_timestamp.toLocaleDateString('en-CA')}
                </Text>
              ) : (
                <Text>No sync history.</Text>
              )}
            </XStack>
          </>
        ) : (
          <NoPermissions />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
