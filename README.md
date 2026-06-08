# 📱 AduinDonk! Mobile App

Cross-platform mobile application untuk sistem pelaporan masalah daerah. Built with React Native dan Expo.

![Expo](https://img.shields.io/badge/Expo-51-000020?style=flat-square&logo=expo)
![React Native](https://img.shields.io/badge/React_Native-0.76-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6?style=flat-square&logo=typescript)

## ✨ Features

### 📸 Report Management
- **Camera Integration**: Capture photos langsung dari kamera
- **Image Picker**: Select dari galeri dengan cropping
- **Location Services**: Auto-detect lokasi dengan map picker
- **Offline Mode**: Draft reports saat offline
- **Status Tracking**: Real-time status updates dengan badges

### 🎨 Native UI/UX
- **Platform-Specific Design**: iOS dan Android native feel
- **Smooth Animations**: Reanimated 3 untuk 60fps animations
- **Gesture Handling**: Swipe, pan, pinch gestures
- **Bottom Sheets**: Native bottom sheet untuk actions
- **Toast Notifications**: Non-intrusive feedback messages

### 🔔 Push Notifications
- **Expo Notifications**: Cross-platform push notifications
- **Badge Updates**: App icon badge untuk unread count
- **Sound & Vibration**: Customizable notification alerts
- **Background Handling**: Receive notifs saat app closed

### 💬 Real-time Chat
- **Socket.IO Integration**: Instant messaging dengan admin
- **Typing Indicators**: See when admin is typing
- **Read Receipts**: Message delivery confirmation
- **Image Sharing**: Send photos dalam chat
- **Message History**: Infinite scroll pagination

### 📍 Maps Integration
- **React Native Maps**: Interactive map untuk location picking
- **Current Location**: GPS-based auto-location
- **Address Geocoding**: Convert coordinates to address
- **Map Markers**: Visual report locations
- **Clustering**: Group nearby reports

## 🛠️ Tech Stack

### Core
- **Framework**: Expo SDK 51
- **React Native**: 0.76.5
- **TypeScript**: 5.3 (type-safe development)
- **Navigation**: Expo Router (file-based routing)

### UI & Animations
- **Styling**: NativeWind (Tailwind for React Native)
- **Animation**: Reanimated 3 + Moti
- **Icons**: Expo Vector Icons
- **Components**: Custom components dengan Expo UI

### Features
- **Camera**: expo-camera + expo-image-picker
- **Location**: expo-location + react-native-maps
- **Storage**: AsyncStorage untuk offline data
- **Notifications**: expo-notifications
- **HTTP**: Axios untuk API calls
- **WebSocket**: Socket.IO Client

## 📋 Prerequisites

- **Node.js**: >= 18.0.0
- **Expo CLI**: Latest version
- **iOS**: Xcode 14+ (for iOS development)
- **Android**: Android Studio + SDK (for Android development)
- **Physical Device**: Recommended untuk testing full features

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd Frontend/expo
npm install
```

### 2. Environment Setup

Create `.env` or update `src/constants/api.ts`:

```typescript
export const API_URL = 'http://your-backend-ip:5000'
export const SOCKET_URL = 'http://your-backend-ip:5000'
```

**Important**: Use your computer's local IP, not `localhost`
- Windows: `ipconfig` → IPv4 Address
- Mac/Linux: `ifconfig` → inet address

### 3. Start Development

```bash
# Start Expo dev server
npx expo start

# Or with npm script
npm start
```

### 4. Run on Device/Emulator

#### Physical Device (Recommended)
1. Install **Expo Go** from App Store/Play Store
2. Scan QR code from terminal
3. App will load on your device

#### iOS Simulator
```bash
# Press 'i' in terminal
# Or
npx expo run:ios
```

#### Android Emulator
```bash
# Press 'a' in terminal
# Or
npx expo run:android
```

## 📁 Project Structure

```
Frontend/expo/
├── src/
│   ├── app/                      # Expo Router pages
│   │   ├── (tabs)/              # Tab navigation
│   │   │   ├── index.tsx        # Home/Dashboard
│   │   │   ├── laporan.tsx      # My Reports
│   │   │   ├── buat-laporan.tsx # Create Report
│   │   │   └── profil.tsx       # Profile
│   │   ├── auth/                # Auth screens
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── detail/              # Report detail
│   │   ├── chat.tsx             # Chat screen
│   │   └── _layout.tsx          # Root layout
│   │
│   ├── components/              # Reusable components
│   │   ├── ReportCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ChatBubble.tsx
│   │   └── MapPicker.tsx
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── useAnimations.ts     # Animation hooks
│   │   ├── useLocation.ts       # Location hook
│   │   └── useNotifications.ts  # Push notifications
│   │
│   ├── lib/                     # Utilities
│   │   ├── AuthContext.tsx      # Auth state
│   │   ├── supabase.ts          # Supabase client
│   │   └── socket.ts            # Socket.IO client
│   │
│   ├── services/                # API services
│   │   ├── auth.ts
│   │   ├── reports.ts
│   │   ├── messages.ts
│   │   └── notifications.ts
│   │
│   ├── constants/               # Constants
│   │   ├── api.ts               # API URLs
│   │   ├── colors.ts            # Color palette
│   │   └── layout.ts            # Layout constants
│   │
│   └── assets/                  # Images & fonts
│
├── app.json                     # Expo configuration
├── babel.config.js              # Babel config (Reanimated)
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

## 🎨 Design System

### Color Palette
```typescript
const colors = {
  primary: '#2563eb',
  secondary: '#06b6d4',
  background: '#0f172a',
  card: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  pending: '#f59e0b',
}
```

### Typography
```typescript
const typography = {
  h1: { fontSize: 32, fontWeight: '800' },
  h2: { fontSize: 24, fontWeight: '700' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
}
```

### Spacing
```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}
```

## 📸 Camera & Image Handling

### Permission Request
```typescript
import { Camera } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'

// Camera permission
const { status } = await Camera.requestCameraPermissionsAsync()

// Gallery permission
const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
```

### Take Photo
```typescript
const image = await ImagePicker.launchCameraAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [16, 9],
  quality: 0.8,
})
```

### Pick from Gallery
```typescript
const image = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [16, 9],
  quality: 0.8,
})
```

## 📍 Location Services

### Get Current Location
```typescript
import * as Location from 'expo-location'

const { status } = await Location.requestForegroundPermissionsAsync()
const location = await Location.getCurrentPositionAsync({})

const { latitude, longitude } = location.coords
```

### Reverse Geocoding
```typescript
const address = await Location.reverseGeocodeAsync({
  latitude,
  longitude
})

const formattedAddress = `${address[0].street}, ${address[0].city}`
```

## 🔔 Push Notifications

### Setup
```typescript
import * as Notifications from 'expo-notifications'

// Request permission
const { status } = await Notifications.requestPermissionsAsync()

// Get push token
const token = await Notifications.getExpoPushTokenAsync()
```

### Handle Notifications
```typescript
// Foreground handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// Background/Killed handler
Notifications.addNotificationResponseReceivedListener(response => {
  // Handle notification tap
  navigation.navigate('Chat')
})
```

## 🔌 API Integration

### Axios Instance
```typescript
import axios from 'axios'
import { API_URL } from './constants/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

// Add auth token
api.interceptors.request.use(config => {
  const token = await AsyncStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Socket.IO Connection
```typescript
import io from 'socket.io-client'
import { SOCKET_URL } from './constants/api'

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false,
})

socket.connect()
socket.emit('join', userId)
```

## 🎭 Animations

### Fade In Animation
```typescript
import { useAnimatedStyle, withTiming } from 'react-native-reanimated'

const animatedStyle = useAnimatedStyle(() => ({
  opacity: withTiming(1, { duration: 300 }),
  transform: [
    { translateY: withTiming(0, { duration: 300 }) }
  ],
}))
```

### Gesture Animation
```typescript
import { GestureDetector, Gesture } from 'react-native-gesture-handler'

const pan = Gesture.Pan()
  .onUpdate((e) => {
    translateX.value = e.translationX
  })
  .onEnd(() => {
    translateX.value = withSpring(0)
  })
```

## 🧪 Testing

### Run on Physical Device

1. Connect device via USB
2. Enable USB Debugging (Android) / Trust computer (iOS)
3. Run:
```bash
# Android
npx expo run:android --device

# iOS
npx expo run:ios --device
```

### Testing Checklist

**Authentication:**
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Token persistence
- [ ] Logout clears data

**Report Creation:**
- [ ] Take photo with camera
- [ ] Pick image from gallery
- [ ] Auto-detect location
- [ ] Manual location picker
- [ ] Submit with all fields

**Real-time:**
- [ ] Receive push notifications
- [ ] Chat messages appear instantly
- [ ] Status updates reflect immediately
- [ ] Badge updates on new messages

**Offline:**
- [ ] App works without connection
- [ ] Drafts saved locally
- [ ] Sync when back online

## 🐛 Common Issues

### Metro Bundler Won't Start
```bash
# Clear cache
npx expo start -c

# Or
rm -rf node_modules
npm install
```

### Camera Not Working
```typescript
// Check permissions in app.json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow app to access camera"
        }
      ]
    ]
  }
}
```

### Socket Not Connecting
- Use local IP, not `localhost`
- Check firewall settings
- Ensure backend is accessible from device
- Try: `http://192.168.x.x:5000` (your computer's IP)

### Build Errors
```bash
# Clear Expo cache
npx expo start -c

# Clear iOS build
cd ios && pod install

# Clear Android build
cd android && ./gradlew clean
```

## 📦 Building

### Development Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android --profile development

# Build for iOS
eas build --platform ios --profile development
```

### Production Build

```bash
# Android APK
eas build --platform android --profile production

# iOS IPA
eas build --platform ios --profile production
```

### Submit to Stores

```bash
# Google Play Store
eas submit --platform android

# Apple App Store
eas submit --platform ios
```

## 🚀 Deployment

### Over-the-Air Updates

```bash
# Publish update
eas update --branch production --message "Bug fixes"

# Users will auto-download on next app open
```

### App Store Optimization

**app.json configuration:**
```json
{
  "expo": {
    "name": "AduinDonk!",
    "slug": "aduindonk",
    "version": "1.0.0",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0f172a"
    },
    "android": {
      "package": "com.yourcompany.aduindonk",
      "versionCode": 1
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.aduindonk",
      "buildNumber": "1.0.0"
    }
  }
}
```

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**AduinDonk! Team**
- GitHub: [Your GitHub]
- Email: your.email@example.com

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

## 🙏 Acknowledgments

- Expo team untuk amazing development platform
- React Native community
- All open-source contributors

---

**Made with ❤️ for mobile-first community engagement**
