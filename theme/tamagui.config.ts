import { createTamagui } from '@tamagui/core'
import { config } from '@tamagui/config/v3'

export const tamaguiConfig = createTamagui(config)

type Conf = typeof tamaguiConfig
declare module '@tamagui/core' {
  // eslint-disable-next-line
  interface TamaguiCustomConfig extends Conf {}
}
