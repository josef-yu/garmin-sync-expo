import { ToastAndroid } from 'react-native'

export const showToast = (
  message: string,
  duration: number = ToastAndroid.SHORT,
) => {
  ToastAndroid.show(message, duration)
}
