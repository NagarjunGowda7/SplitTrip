import { Pressable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { appColors } from "@/constants/appColors";
import { BudgetAnalyticsScreen } from "@/screens/budget/BudgetAnalyticsScreen";
import { AddExpenseScreen } from "@/screens/expense/AddExpenseScreen";
import { ExpenseTimelineScreen } from "@/screens/expense/ExpenseTimelineScreen";
import { ItineraryScreen } from "@/screens/itinerary/ItineraryScreen";
import { PackingChecklistScreen } from "@/screens/packing/PackingChecklistScreen";
import { TripDashboard } from "@/screens/trip/TripDashboard";
import { WalletScreen } from "@/screens/wallet/WalletScreen";

const Tab = createBottomTabNavigator();

export const TripNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route, navigation }) => ({
      headerShown: true,
      headerStyle: {
        backgroundColor: "#F8FAFC",
      },
      headerTitleStyle: {
        color: appColors.secondary,
        fontWeight: "700",
      },
      headerShadowVisible: false,
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate("Settings" as never)} className="pr-1">
          <Ionicons name="person-circle-outline" size={26} color={appColors.secondary} />
        </Pressable>
      ),
      tabBarActiveTintColor: appColors.primary,
      tabBarInactiveTintColor: appColors.textMuted,
      tabBarStyle: {
        height: 72,
        paddingBottom: 12,
        paddingTop: 12,
      },
      title:
        {
          Dashboard: "SplitTrip",
          Expenses: "Expenses",
          AddExpense: "Add Expense",
          Wallet: "Group Wallet",
          Itinerary: "Itinerary",
          Budget: "Budget",
          Packing: "Packing",
        }[route.name] ?? route.name,
      tabBarIcon: ({ color, size }) => {
        const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
          Dashboard: "home-outline",
          Expenses: "receipt-outline",
          AddExpense: "add-circle-outline",
          Wallet: "wallet-outline",
          Itinerary: "map-outline",
          Budget: "pie-chart-outline",
          Packing: "briefcase-outline",
        };
        return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={TripDashboard} />
    <Tab.Screen name="Expenses" component={ExpenseTimelineScreen} />
    <Tab.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: "Add" }} />
    <Tab.Screen name="Wallet" component={WalletScreen} />
    <Tab.Screen name="Itinerary" component={ItineraryScreen} />
    <Tab.Screen name="Budget" component={BudgetAnalyticsScreen} />
    <Tab.Screen name="Packing" component={PackingChecklistScreen} />
  </Tab.Navigator>
);
