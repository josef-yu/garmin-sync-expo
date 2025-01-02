import { DatabaseInstance } from '@/app/_layout'
import { syncTable, SyncTableSelectType } from '@/db/schema'
import { desc } from 'drizzle-orm'
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  initialize,
  Permission,
  requestPermission,
} from 'react-native-health-connect'

interface HealthSyncValues {
  isInitialized?: boolean
  permissions?: Permission[]
  lastSync?: SyncTableSelectType
}

export const HealthSyncContext = createContext<HealthSyncValues>({})

export const useHealthSync = () => useContext(HealthSyncContext)

export const HealthSyncProvider = ({
  children,
  db,
}: PropsWithChildren & { db: DatabaseInstance }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [lastSync, setLastSync] = useState<SyncTableSelectType>()

  const getLastSyncDate = async () => {
    const lastSyncData = await db
      .select()
      .from(syncTable)
      .orderBy(desc(syncTable.data_timestamp))
      .limit(1)

    if (lastSyncData.length === 1) {
      setLastSync(lastSyncData[1])
    }
  }

  useEffect(() => {
    const init = async () => {
      const isClientInitialized = await initialize()

      setIsInitialized(isClientInitialized)

      if (!isClientInitialized) {
        console.log('Health connect client failed to initilize!')
        return
      }

      const grantedPermissions = await requestPermission([
        { accessType: 'write', recordType: 'Steps' },
        { accessType: 'write', recordType: 'StepsCadence' },
      ])

      if (!grantedPermissions || grantedPermissions.length === 0) {
        console.log('Failed to grant permissions!')
        return
      }

      setPermissions(grantedPermissions)
    }

    init()
  }, [])

  useEffect(() => {
    getLastSyncDate()
  }, [])

  return (
    <HealthSyncContext.Provider
      value={{ permissions, isInitialized, lastSync }}>
      {children}
    </HealthSyncContext.Provider>
  )
}
