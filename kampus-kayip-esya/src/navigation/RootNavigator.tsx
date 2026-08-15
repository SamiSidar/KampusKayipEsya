import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from './types';

import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';

import { StudentHomeScreen } from '../screens/StudentHomeScreen';
import { ListingsScreen } from '../screens/ListingsScreen';
import { MyReportsScreen } from '../screens/MyReportsScreen';
import { StudentReportDetailScreen } from '../screens/StudentReportDetailScreen';
import { StudentProfileScreen } from '../screens/StudentProfileScreen';
import { LostReportScreen } from '../screens/LostReportScreen';
import { ItemDetailScreen } from '../screens/ItemDetailScreen';
import { ClaimRequestScreen } from '../screens/ClaimRequestScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { SuccessScreen } from '../screens/SuccessScreen';
import { EmptyStatePreviewScreen } from '../screens/EmptyStatePreviewScreen';

import { AdminPanelScreen } from '../screens/AdminPanelScreen';
import { PendingReportsScreen } from '../screens/PendingReportsScreen';
import { WaitingOwnerItemsScreen } from '../screens/WaitingOwnerItemsScreen';
import { ActiveLostReportsScreen } from '../screens/ActiveLostReportsScreen';
import { DeliveredItemsScreen } from '../screens/DeliveredItemsScreen';
import { DeliveryDetailScreen } from '../screens/DeliveryDetailScreen';
import { AdminItemDetailScreen } from '../screens/AdminItemDetailScreen';
import { AdminClaimRequestDetailScreen } from '../screens/AdminClaimRequestDetailScreen';
import { RevisionRequestScreen } from '../screens/RevisionRequestScreen';
import { FoundItemCreateScreen } from '../screens/FoundItemCreateScreen';
import { AdminReviewScreen } from '../screens/AdminReviewScreen';
import { AdminProfileScreen } from '../screens/AdminProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
        <Stack.Screen name="Listings" component={ListingsScreen} />
        <Stack.Screen name="MyReports" component={MyReportsScreen} />
        <Stack.Screen
          name="StudentReportDetail"
          component={StudentReportDetailScreen}
        />
        <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
        <Stack.Screen name="LostReport" component={LostReportScreen} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
        <Stack.Screen name="ClaimRequest" component={ClaimRequestScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Success" component={SuccessScreen} />
        <Stack.Screen
          name="EmptyStatePreview"
          component={EmptyStatePreviewScreen}
        />

        <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
        <Stack.Screen name="PendingReports" component={PendingReportsScreen} />
        <Stack.Screen
          name="WaitingOwnerItems"
          component={WaitingOwnerItemsScreen}
        />
        <Stack.Screen
          name="ActiveLostReports"
          component={ActiveLostReportsScreen}
        />
        <Stack.Screen name="DeliveredItems" component={DeliveredItemsScreen} />
        <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />
        <Stack.Screen name="AdminItemDetail" component={AdminItemDetailScreen} />
        <Stack.Screen
          name="AdminClaimRequestDetail"
          component={AdminClaimRequestDetailScreen}
        />
        <Stack.Screen name="RevisionRequest" component={RevisionRequestScreen} />
        <Stack.Screen name="FoundItemCreate" component={FoundItemCreateScreen} />
        <Stack.Screen name="AdminReview" component={AdminReviewScreen} />
        <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}