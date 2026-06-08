import { Platform } from 'react-native'

const LOCAL_IP = '192.168.1.70'
export const API_URL = Platform.OS === 'web'
  ? 'http://localhost:5000'
  : `http://${LOCAL_IP}:5000`
