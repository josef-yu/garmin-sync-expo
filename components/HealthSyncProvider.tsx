import { DatabaseInstance } from '@/app/_layout'
import { syncTable, SyncTableSelectType } from '@/db/schema'
import { showToast } from '@/utils/toast'
import { desc } from 'drizzle-orm'
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
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
  getLastSyncDate: () => Promise<void>
}

const defaultContextValues: HealthSyncValues = {
  getLastSyncDate: async () => {},
}

export const HealthSyncContext =
  createContext<HealthSyncValues>(defaultContextValues)

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
        showToast('Health connect client failed to initilize!')
        console.log('Health connect client failed to initilize!')
        return
      }

      const grantedPermissions = await requestPermission([
        { accessType: 'write', recordType: 'Steps' },
        { accessType: 'write', recordType: 'StepsCadence' },
      ])

      if (!grantedPermissions || grantedPermissions.length === 0) {
        showToast('Failed to grant permissions!')
        console.log('Failed to grant permissions!')
        return
      }

      setPermissions(grantedPermissions)
    }

    init()
  }, [])

  useEffect(() => {
    getLastSyncDate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(
    () => ({
      permissions,
      isInitialized,
      lastSync,
      getLastSyncDate,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [permissions, lastSync, isInitialized],
  )

  return (
    <HealthSyncContext.Provider value={value}>
      {children}
    </HealthSyncContext.Provider>
  )
}
