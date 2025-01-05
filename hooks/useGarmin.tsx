import { Garmin } from '@/services/garmin'
import { useEffect, useState } from 'react'

export function useGarmin() {
  const [garminClient, setGarminClient] = useState<Garmin>()

  useEffect(() => {
    const init = async () => {
      const keys = await Garmin.getConsumerKeys()

      const client = new Garmin({
        consumerKey: keys.consumer_key,
        consumerSecret: keys.consumer_secret,
      })

      setGarminClient(client)
    }

    init()
  }, [])

  return {
    garminClient,
    isInitialized: Boolean(garminClient),
  }
}
