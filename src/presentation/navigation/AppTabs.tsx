import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { TEXTS } from '../messages';
import { MyBookingsScreen } from '../screens/MyBookingsScreen';
import { UpcomingClassesScreen } from '../screens/UpcomingClassesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../theme';

export type TabParamList = {
  UpcomingClasses: undefined;
  MyBookings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
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
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          title: TEXTS.myBookingsTitle,
          tabBarIcon: ({ color, size }) => <Ionicons name="bookmark-outline" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
