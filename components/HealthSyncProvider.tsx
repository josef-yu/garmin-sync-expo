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
}

export const HealthSyncContext = createContext<HealthSyncValues>({})

export const useHealthSync = () => useContext(HealthSyncContext)

export const HealthSyncProvider = ({ children }: PropsWithChildren) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>([])

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

  return (
    <HealthSyncContext.Provider value={{ permissions, isInitialized }}>
      {children}
    </HealthSyncContext.Provider>
  )
}
