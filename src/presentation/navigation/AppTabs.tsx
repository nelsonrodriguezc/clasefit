import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { TEXTS } from '../messages';
import { MyBookingsScreen } from '../screens/MyBookingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { UpcomingClassesScreen } from '../screens/UpcomingClassesScreen';
import { colors } from '../theme';
import type { TabParamList } from './routes';

const Tab = createBottomTabNavigator<TabParamList>();

/** Tabs in the order of the mockup. Each screen draws its own header (logo and safe area). */
export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tab.Screen
        name="UpcomingClasses"
        component={UpcomingClassesScreen}
        options={{
          title: TEXTS.upcomingTitle,
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          title: TEXTS.myBookingsTitle,
          tabBarIcon: ({ color, size }) => <Ionicons name="bookmark-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: TEXTS.profileTitle,
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
