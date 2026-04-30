import NetInfo from "@react-native-community/netinfo";
import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ScreenContainer } from "@/components/ScreenContainer";
import { TimelineItem } from "@/components/TimelineItem";
import { TripHeader } from "@/components/TripHeader";
import { useExpenses } from "@/hooks/useExpenses";
import { useItinerary } from "@/hooks/useItinerary";
import { useTrips } from "@/hooks/useTrips";
import { useWallet } from "@/hooks/useWallet";
import {
  compareItineraryOrder,
  formatItineraryTime,
  formatShortDate,
  getDateTimeSortValue,
} from "@/utils/dateHelpers";
import { simplifyDebts } from "@/utils/settlementEngine";
import { buildMemberBalances, buildWalletInsights } from "@/utils/tripAnalytics";

export const TripDashboard = ({ navigation }: any) => {
  const { activeTrip, trips, isOwner } = useTrips();
  const { expenses, syncOffline } = useExpenses(activeTrip?.id);
  const { items } = useItinerary(activeTrip?.id);
  const { summary } = useWallet(activeTrip?.id);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncOffline();
      }
    });
    return () => unsubscribe();
  }, [syncOffline]);

  const balances = activeTrip ? buildMemberBalances(activeTrip.members, expenses) : [];
  const settlements = simplifyDebts(balances);

  const nextItineraryItem = items
    .filter((item) => !item.visited)
    .slice()
    .sort(compareItineraryOrder)[0];

  const walletInsights = activeTrip
    ? buildWalletInsights({
        members: activeTrip.members,
        expenses,
        walletSummary: summary,
      })
    : summary;

  const settlementPreview = settlements
    .slice()
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  const timelineItems = [
    ...(activeTrip?.memories ?? []).map((memory) => ({
      id: memory.id,
      date: memory.date,
      activityAt: memory.date,
      title: memory.title,
      subtitle: memory.description || memory.type,
      badge: memory.type,
    })),
    ...items
      .filter((item) => item.visited)
      .map((item) => ({
        id: item.id,
        date: item.date,
        activityAt: item.visitedAt ?? item.createdAt ?? item.date,
        title: `${item.routeFrom} to ${item.routeTo}`,
        subtitle: item.activity || item.notes || "Visited itinerary item added to memory timeline",
        badge: "Visited",
      })),
    ...expenses.map((expense) => ({
      id: expense.id,
      date: expense.expenseDate,
      activityAt: expense.createdAt || expense.expenseDate,
      title: `${expense.title} | ${expense.currency} ${expense.amount.toFixed(2)}`,
      subtitle: `Paid by ${expense.payerName}`,
      badge: "Expense",
    })),
  ]
    .sort((a, b) => getDateTimeSortValue(b.activityAt) - getDateTimeSortValue(a.activityAt))
    .slice(0, 6);

  if (!activeTrip) {
    return (
      <ScreenContainer contentContainerStyle={{ padding: 24, gap: 16, flexGrow: 1, justifyContent: "center" }}>
        <Text className="font-display text-4xl text-ink">SplitTrip</Text>
        <EmptyState
          icon="airplane-outline"
          title="Create your first trip workspace"
          description="Start by creating a trip, adding members, and setting the budget. Once that is ready, SplitTrip will fill this dashboard with your next stop, wallet, expenses, and timeline."
          actionLabel="Create Trip"
          onAction={() => navigation.navigate("CreateTrip")}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={{ padding: 20, gap: 16 }}>
      <TripHeader
        trip={activeTrip}
        onEdit={isOwner ? () => navigation.navigate("CreateTrip", { tripId: activeTrip.id }) : undefined}
      />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Card>
            <Text className="text-sm text-slate">Active Trips</Text>
            <Text className="mt-2 text-2xl font-bold text-ink">{trips.length}</Text>
          </Card>
        </View>
        <View className="flex-1">
          <Card>
            <Text className="text-sm text-slate">Members</Text>
            <Text className="mt-2 text-2xl font-bold text-ink">{activeTrip.members.length}</Text>
          </Card>
        </View>
      </View>
      {nextItineraryItem ? (
        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-sm text-slate">Next Stop</Text>
              <Text className="mt-2 text-lg font-semibold text-ink">
                {nextItineraryItem.routeFrom} to {nextItineraryItem.routeTo}
              </Text>
              <Text className="mt-1 text-sm text-slate">
                {formatShortDate(nextItineraryItem.date)} | {formatItineraryTime(nextItineraryItem.startTime)} - {formatItineraryTime(nextItineraryItem.endTime)}
              </Text>
              <Text className="mt-1 text-sm text-slate">{nextItineraryItem.activity}</Text>
            </View>
            <Pressable onPress={() => navigation.navigate("Itinerary")}>
              <Text className="font-semibold text-teal">View plan</Text>
            </Pressable>
          </View>
        </Card>
      ) : (
        <EmptyState
          icon="map-outline"
          title="No itinerary added yet"
          description="Add your first route or import an itinerary sheet so SplitTrip can highlight the next stop here."
          actionLabel="Plan Itinerary"
          onAction={() => navigation.navigate("Itinerary")}
        />
      )}
      <Card>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-slate">Total Spent</Text>
            <Text className="mt-2 text-2xl font-bold text-ink">
              {activeTrip.currency} {expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
            </Text>
          </View>
          <Pressable onPress={() => navigation.navigate("TripReport")}>
            <Text className="font-semibold text-teal">View report</Text>
          </Pressable>
        </View>
      </Card>
      <Card>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-slate">Group Wallet</Text>
            <Text className="mt-2 text-2xl font-bold text-ink">
              {activeTrip.currency} {walletInsights.remainingBalance.toFixed(2)}
            </Text>
          </View>
          <Pressable onPress={() => navigation.navigate("Wallet")}>
            <Text className="font-semibold text-teal">Open wallet</Text>
          </Pressable>
        </View>
      </Card>
      <Card>
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-ink">Smart Settlement</Text>
          <Pressable onPress={() => navigation.navigate("Settlement")}>
            <Text className="font-semibold text-teal">Open</Text>
          </Pressable>
        </View>
        <View className="mt-4 gap-3">
          {settlementPreview.length ? (
            settlementPreview.map((item) => (
              <Text key={`${item.from}-${item.to}`} className="text-sm text-slate">
                {item.fromName} pays {item.toName} {activeTrip.currency} {item.amount.toFixed(2)}
              </Text>
            ))
          ) : (
            <Text className="text-sm text-slate">
              No personal settlements are pending right now. Wallet-paid expenses are handled inside the group wallet instead of showing up here as member-to-member debt.
            </Text>
          )}
          {settlements.length > settlementPreview.length ? (
            <Text className="text-sm font-medium text-teal">
              +{settlements.length - settlementPreview.length} more settlements
            </Text>
          ) : null}
        </View>
      </Card>
      <Card>
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-ink">Trip Memory Timeline</Text>
          <Pressable onPress={() => navigation.navigate("Itinerary")}>
            <Text className="font-semibold text-teal">View itinerary</Text>
          </Pressable>
        </View>
        <View className="mt-4">
          {timelineItems.length ? (
            timelineItems.slice(0, 5).map((item) => (
              <TimelineItem
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                date={formatShortDate(item.activityAt)}
                badge={item.badge}
              />
            ))
          ) : (
            <Text className="text-sm text-slate">
              Visit itinerary stops or add expenses and they will appear here in time order as your trip story builds.
            </Text>
          )}
        </View>
      </Card>
    </ScreenContainer>
  );
};
