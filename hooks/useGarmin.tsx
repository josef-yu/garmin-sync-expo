import { Garmin } from '@/services/garmin'
import { useEffect, useState } from 'react'

export function useGarmin() {
  const [garminClient, setGarminClient] = useState<Garmin>()

  useEffect(() => {
    const init = async () => {
      const keys = await Garmin.getConsumerKeys()

      setGarminClient(
        new Garmin({
          consumerKey: keys.consumer_key,
          consumerSecret: keys.consumer_secret,
        }),
      )
    }

    init()
  }, [])

  return {
    garminClient,
    isInitialized: Boolean(garminClient),
  }
}
