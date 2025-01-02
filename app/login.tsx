import { useAuthContext } from '@/components/AuthGuard'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'

import {
  Form,
  Button,
  Spinner,
  Label,
  Input,
  ScrollView,
  YStack,
} from 'tamagui'

export default function Login() {
  const auth = useAuthContext()

  const [username, setUsername] = useState<string>()
  const [password, setPassword] = useState<string>()

  const [status, setStatus] = useState<'off' | 'submitting' | 'submitted'>(
    'off',
  )

  const login = async () => {
    if (!username || !password) return

    setStatus('submitting')

    try {
      await auth?.garminClient.login(username, password)
    } catch (e) {
      console.log('error', e)
      setStatus('off')
      return
    }

    setStatus('submitted')
    router.replace('/(tabs)')
  }

  useEffect(() => {
    if (auth?.garminClient.ssoClient.isLoggedIn) router.replace('/(tabs)')
  }, [auth])

  return (
    <ScrollView backgroundColor="$background">
      <Form
        alignItems="center"
        width="100%"
        gap="$2"
        onSubmit={login}
        borderWidth={1}
        borderRadius="$4"
        backgroundColor="$background"
        borderColor="$borderColor"
        padding="$2">
        <YStack width="100%">
          <Label>Username</Label>
          <Input value={username} onChangeText={setUsername} width="100%" />
        </YStack>
        <YStack width="100%">
          <Label>Password</Label>
          <Input value={password} onChangeText={setPassword} secureTextEntry />
        </YStack>
        <Form.Trigger asChild disabled={status !== 'off'}>
          <Button
            width="100%"
            marginTop="$3"
            icon={status === 'submitting' ? () => <Spinner /> : undefined}>
            Submit
          </Button>
        </Form.Trigger>
      </Form>
    </ScrollView>
  )
}
