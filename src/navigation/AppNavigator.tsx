import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthNavigator } from "@/navigation/AuthNavigator";
import { TripNavigator } from "@/navigation/TripNavigator";
import { AddPlaceScreen } from "@/screens/itinerary/AddPlaceScreen";
import { SettlementScreen } from "@/screens/reports/SettlementScreen";
import { TripReportScreen } from "@/screens/reports/TripReportScreen";
import { SettingsScreen } from "@/screens/settings/SettingsScreen";
import { CreateTripScreen } from "@/screens/trip/CreateTripScreen";
import { TripMembersScreen } from "@/screens/trip/TripMembersScreen";
import { ExpenseDetailsScreen } from "@/screens/expense/ExpenseDetailsScreen";
import { WalletTransactionsScreen } from "@/screens/wallet/WalletTransactionsScreen";
import { useAuth } from "@/hooks/useAuth";

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-sand">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#F8FAFC",
        },
        headerTintColor: "#264653",
        headerShadowVisible: false,
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Trips" component={TripNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="CreateTrip" component={CreateTripScreen} options={{ title: "Trip Details" }} />
          <Stack.Screen name="TripMembers" component={TripMembersScreen} options={{ title: "Members" }} />
          <Stack.Screen name="AddPlace" component={AddPlaceScreen} options={{ title: "Itinerary Item" }} />
          <Stack.Screen name="ExpenseDetails" component={ExpenseDetailsScreen} options={{ title: "Expense Details" }} />
          <Stack.Screen name="WalletTransactions" component={WalletTransactionsScreen} options={{ title: "Wallet Transactions" }} />
          <Stack.Screen name="Settlement" component={SettlementScreen} options={{ title: "Smart Settlement" }} />
          <Stack.Screen name="TripReport" component={TripReportScreen} options={{ title: "Trip Report" }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Profile & Settings" }} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
};
