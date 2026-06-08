import { Tabs } from 'expo-router'
import { View } from 'react-native'
import { Colors } from '@/constants/colors'
import { Ionicons } from '@expo/vector-icons'
import { useTabScale } from '@/hooks/useAnimations'

function TabIcon({ name, color, size, focused }: { name: any; color: string; size: number; focused: boolean }) {
  const animStyle = useTabScale(focused)
  return (
    <View style={animStyle}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  )
}

export default function UserTabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: 'rgba(15,23,42,0.97)',
        borderTopColor: Colors.border,
        borderTopWidth: 1,
        height: 80,
        paddingBottom: 16,
        paddingTop: 8,
      },
      tabBarActiveTintColor: Colors.blue400,
      tabBarInactiveTintColor: Colors.white40,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: (p) => <TabIcon name="home-outline" {...p} /> }} />
      <Tabs.Screen name="laporan" options={{ title: 'Laporan', tabBarIcon: (p) => <TabIcon name="document-text-outline" {...p} /> }} />
      <Tabs.Screen name="buat" options={{ title: 'Buat', tabBarIcon: (p) => <TabIcon name="add-circle-outline" {...p} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: (p) => <TabIcon name="chatbubble-outline" {...p} /> }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: (p) => <TabIcon name="person-outline" {...p} /> }} />
      <Tabs.Screen name="detail/[id]" options={{ href: null }} />
      <Tabs.Screen name="notifikasi" options={{ href: null }} />
    </Tabs>
  )
}
