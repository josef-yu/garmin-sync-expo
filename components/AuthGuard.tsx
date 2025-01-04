import { Garmin } from '@/services/garmin'
import { router } from 'expo-router'
import { PropsWithChildren, createContext, useContext, useEffect } from 'react'

interface GarminValues {
  garminClient: Garmin
}

type AuthContextValues = GarminValues

const AuthContext = createContext<AuthContextValues | undefined>(undefined)

export const useAuthContext = () => useContext(AuthContext)

export function AuthGuard({
  children,
  garminClient,
}: PropsWithChildren & GarminValues) {
  useEffect(() => {
    if (!garminClient.ssoClient.isLoggedIn) {
      router.replace('/login')
    }
  }, [garminClient.ssoClient.isLoggedIn])

  return (
    <AuthContext.Provider value={{ garminClient }}>
      {children}
    </AuthContext.Provider>
  )
}
