import { useHealthSync } from '@/components/HealthSyncProvider'
import { SyncTableSelectType } from '@/db/schema'
import { useGarmin } from '@/hooks/useGarmin'
import { Garmin } from '@/services/garmin'
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

function SyncInfo({ lastSync }: { lastSync?: SyncTableSelectType }) {
  return lastSync ? (
    <Text>
      Last sync at {lastSync.created_at?.toLocaleDateString('en-CA')} with data
      from {lastSync.data_timestamp.toLocaleDateString('en-CA')}
    </Text>
  ) : (
    <Text>No sync history.</Text>
  )
}

export default function HomeScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { permissions, lastSync, getLastSyncDate, syncSteps } = useHealthSync()
  const { garminClient } = useGarmin()

  const doAction = async (fn: () => Promise<void>) => {
    setIsSubmitting(true)

    await fn()

    await getLastSyncDate()

    setIsSubmitting(false)
  }

  const syncStepsFromLastSync = async () => {
    const startDate = lastSync?.data_timestamp ?? Garmin?.GARMIN_START_DATE

    const data = await garminClient?.getDailySteps(startDate)

    if (data) await syncSteps(data)
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 5 }}>
      <ScrollView width="100%" backgroundColor="$background" padding="$3">
        <H2>Sync</H2>
        {permissions && permissions.length > 0 ? (
          <>
            <Button
              onPress={() => doAction(syncStepsFromLastSync)}
              width="100%"
              marginTop="$3"
              textAlign="left"
              icon={isSubmitting ? () => <Spinner /> : <RefreshCcw />}>
              Sync Steps
            </Button>
            <XStack width="75%" justifyContent="center">
              <SyncInfo lastSync={lastSync} />
            </XStack>
          </>
        ) : (
          <NoPermissions />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
